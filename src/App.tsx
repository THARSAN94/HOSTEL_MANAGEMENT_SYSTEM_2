/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, RefreshCw } from 'lucide-react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import WardenDashboard from './components/WardenDashboard';
import AIHostelAssistant from './components/AIHostelAssistant';
import { User, HostelRequest, Announcement, MessDayMenu, RoomStatus, UserRole, RequestStatus } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('vsb_auth_token'));
  const [user, setUser] = useState<User | null>(null);
  
  // App routing/flow state: 'landing' | 'auth' | 'dashboard'
  const [flowState, setFlowState] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Core synchronized application state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messMenu, setMessMenu] = useState<MessDayMenu[]>([]);
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [requests, setRequests] = useState<HostelRequest[]>([]);
  const [students, setStudents] = useState<User[]>([]); // Wardens only

  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

  // Check active session on load
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        setFlowState('landing');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.user) {
          setUser(data.user);
          setFlowState('dashboard');
          await loadDashboardData(token);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  // Load state data
  const loadDashboardData = async (activeToken: string) => {
    setFetchingData(true);
    try {
      const response = await fetch('/api/data/dashboard', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await response.json();

      if (response.ok) {
        setAnnouncements(data.announcements || []);
        setMessMenu(data.messMenu || []);
        setRooms(data.rooms || []);
        setRequests(data.requests || []);
        if (data.students) {
          setStudents(data.students);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard coordinates:', err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    localStorage.setItem('vsb_auth_token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
    setFlowState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('vsb_auth_token');
    setToken(null);
    setUser(null);
    setFlowState('landing');
    resetState();
  };

  const resetState = () => {
    setAnnouncements([]);
    setMessMenu([]);
    setRooms([]);
    setRequests([]);
    setStudents([]);
  };

  const handleGetStarted = (role?: UserRole) => {
    if (role) setSelectedRole(role);
    setFlowState('auth');
  };

  // State modification APIs communicating with server
  const handleUpdateProfile = async (updatedFields: Partial<User>): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
        // Refresh dashboard data to sync student changes across tables
        await loadDashboardData(token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleAddRequest = async (requestPayload: Partial<HostelRequest>): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestPayload)
      });
      if (response.ok) {
        await loadDashboardData(token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: RequestStatus, remarks?: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, remarks })
      });
      if (response.ok) {
        await loadDashboardData(token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleAddAnnouncement = async (title: string, content: string, priority: 'Low' | 'Normal' | 'High'): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, priority })
      });
      if (response.ok) {
        await loadDashboardData(token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleDeleteAnnouncement = async (id: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await loadDashboardData(token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleAssignRoom = async (studentId: string, block: string, roomNo: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('/api/rooms/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, block, roomNo })
      });
      if (response.ok) {
        await loadDashboardData(token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleUpdateRoomStatus = async (roomId: string, status: 'Available' | 'Occupied' | 'Maintenance'): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await loadDashboardData(token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleChooseRoom = async (roomId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('/api/rooms/choose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomId })
      });
      if (response.ok) {
        await loadDashboardData(token);
        const meResponse = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meResponse.json();
        if (meResponse.ok && meData.user) {
          setUser(meData.user);
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleUpdateMenu = async (updatedMenu: MessDayMenu[]): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await fetch('/api/mess', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menu: updatedMenu })
      });
      if (response.ok) {
        await loadDashboardData(token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center space-y-4">
        <Cpu className="w-10 h-10 text-cyan-400 animate-spin" />
        <span className="font-mono text-xs text-gray-500 tracking-widest uppercase">Decoupling VSB BH2 Matrix Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg selection:bg-cyan-500/30 selection:text-white">
      
      {/* Active page flows */}
      <AnimatePresence mode="wait">
        
        {flowState === 'landing' && (
          <motion.div
            key="landing-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onGetStarted={handleGetStarted} />
          </motion.div>
        )}

        {flowState === 'auth' && (
          <motion.div
            key="auth-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AuthPage 
              initialRole={selectedRole} 
              onAuthSuccess={handleAuthSuccess}
              onBack={() => setFlowState('landing')}
            />
          </motion.div>
        )}

        {flowState === 'dashboard' && user && (
          <motion.div
            key="dashboard-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            {user.role === 'student' ? (
              <StudentDashboard
                user={user}
                announcements={announcements}
                messMenu={messMenu}
                rooms={rooms}
                requests={requests}
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
                onAddRequest={handleAddRequest}
                onChooseRoom={handleChooseRoom}
              />
            ) : (
              <WardenDashboard
                user={user}
                announcements={announcements}
                messMenu={messMenu}
                rooms={rooms}
                requests={requests}
                students={students}
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
                onUpdateMenu={handleUpdateMenu}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onAssignRoom={handleAssignRoom}
                onUpdateRoomStatus={handleUpdateRoomStatus}
              />
            )}

            {/* Float synchronized AI Assistant */}
            <AIHostelAssistant />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Syncing/Loading Indicator overlay overlay */}
      {fetchingData && (
        <div className="fixed bottom-6 left-6 z-40 px-3.5 py-2 rounded-xl bg-gray-950/80 border border-cyan-500/30 backdrop-blur flex items-center gap-2 font-mono text-[9px] text-cyan-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>SYNCING MATRIX VARIABLES...</span>
        </div>
      )}
    </div>
  );
}
