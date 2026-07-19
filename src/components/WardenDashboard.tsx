/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  FileText, 
  Home, 
  Utensils, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Cpu, 
  PlusCircle, 
  Check, 
  X, 
  Trash2, 
  UserPlus, 
  Activity, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { 
  User, 
  HostelRequest, 
  Announcement, 
  MessDayMenu, 
  RoomStatus, 
  RequestStatus, 
  RequestPriority 
} from '../types';
import RequestHistoryPanel from './RequestHistoryPanel';
import MessMenuPanel from './MessMenuPanel';
import ProfilePanel from './ProfilePanel';

interface WardenDashboardProps {
  user: User;
  announcements: Announcement[];
  messMenu: MessDayMenu[];
  rooms: RoomStatus[];
  requests: HostelRequest[];
  students: User[];
  onLogout: () => void;
  onUpdateProfile: (updatedFields: Partial<User>) => Promise<boolean>;
  onUpdateMenu: (updatedMenu: MessDayMenu[]) => Promise<boolean>;
  onUpdateRequestStatus: (id: string, status: RequestStatus, remarks?: string) => Promise<boolean>;
  onAddAnnouncement: (title: string, content: string, priority: 'Low' | 'Normal' | 'High') => Promise<boolean>;
  onDeleteAnnouncement: (id: string) => Promise<boolean>;
  onAssignRoom: (studentId: string, block: string, roomNo: string) => Promise<boolean>;
  onUpdateRoomStatus: (roomId: string, status: 'Available' | 'Occupied' | 'Maintenance') => Promise<boolean>;
}

export default function WardenDashboard({
  user,
  announcements,
  messMenu,
  rooms,
  requests,
  students,
  onLogout,
  onUpdateProfile,
  onUpdateMenu,
  onUpdateRequestStatus,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onAssignRoom,
  onUpdateRoomStatus,
}: WardenDashboardProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'rooms' | 'announcements' | 'menu' | 'profile'>('requests');
  
  // Announcements Publisher states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'Low' | 'Normal' | 'High'>('Normal');

  // Room Assignment Form states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assignBlock, setAssignBlock] = useState('Block A');
  const [assignRoomNo, setAssignRoomNo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Warden specific room viewer/editor states
  const [viewBlock, setViewBlock] = useState<'Block A' | 'Block B' | 'Block C' | 'Block D'>('Block A');
  const [selectedWardenRoom, setSelectedWardenRoom] = useState<RoomStatus | null>(null);

  // Stats computation
  const totalStudents = students.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const unassignedStudents = students.filter(s => !s.roomNo);
  const maintenanceCount = rooms.filter(r => r.status === 'Maintenance').length;

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!annTitle || !annContent) {
      setError('Title and content are mandatory to publish.');
      return;
    }

    setLoading(true);
    try {
      const result = await onAddAnnouncement(annTitle, annContent, annPriority);
      if (result) {
        setSuccess('Announcement broadcast protocol completed. Residents notified.');
        setAnnTitle('');
        setAnnContent('');
      } else {
        setError('Failed to write announcement to servers.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await onDeleteAnnouncement(id);
      if (result) {
        setSuccess('Announcement deleted successfully.');
      } else {
        setError('Failed to delete announcement record.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    }
  };

  const handleAssignRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedStudentId || !assignRoomNo) {
      setError('Please select a student and room number.');
      return;
    }

    setLoading(true);
    try {
      const result = await onAssignRoom(selectedStudentId, assignBlock, assignRoomNo);
      if (result) {
        setSuccess('Room allocation metrics synced on core server.');
        setSelectedStudentId('');
        setAssignRoomNo('');
      } else {
        setError('Warden permission denied or room capacity saturated.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRoomMaintenance = async (roomId: string, currentStatus: 'Available' | 'Occupied' | 'Maintenance') => {
    setError(null);
    setSuccess(null);
    const nextStatus = currentStatus === 'Maintenance' ? 'Available' : 'Maintenance';
    try {
      const result = await onUpdateRoomStatus(roomId, nextStatus);
      if (result) {
        setSuccess(`Room status updated to ${nextStatus}.`);
        if (selectedWardenRoom && selectedWardenRoom.id === roomId) {
          setSelectedWardenRoom(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      } else {
        setError('Failed to alter room status.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    }
  };

  const handleSetRoomStatus = async (roomId: string, nextStatus: 'Available' | 'Occupied' | 'Maintenance') => {
    setError(null);
    setSuccess(null);
    try {
      const result = await onUpdateRoomStatus(roomId, nextStatus);
      if (result) {
        setSuccess(`Room status updated to ${nextStatus}.`);
        if (selectedWardenRoom && selectedWardenRoom.id === roomId) {
          setSelectedWardenRoom(prev => prev ? { ...prev, status: nextStatus } : null);
        }
      } else {
        setError('Failed to alter room status.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col md:flex-row relative">
      
      {/* Sidebar Control Panel */}
      <aside className="w-full md:w-64 bg-gray-950/90 border-r border-gray-900 flex flex-col justify-between p-6 z-10 md:h-screen sticky top-0">
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
              <Shield className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-wide text-white">WARDEN DEPT</span>
              <div className="text-[9px] text-purple-400 font-mono tracking-widest">BOYS HOSTEL 2</div>
            </div>
          </div>

          {/* Quick Profile preview */}
          <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-500/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <span className="font-semibold text-xs text-white block truncate">{user.name}</span>
              <span className="text-[9px] text-gray-500 font-mono block truncate">CHIEF WARDEN</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5 flex flex-col font-mono text-xs text-gray-500">
            <button
              id="tab-requests-btn"
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'requests' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <FileText className="w-4 h-4" /> COMPLAINT GATEWAY
            </button>
            <button
              id="tab-rooms-btn"
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'rooms' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <Home className="w-4 h-4" /> ROOM REGISTRY
            </button>
            <button
              id="tab-announcements-btn"
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'announcements' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <Bell className="w-4 h-4" /> ANNOUNCEMENT HUB
            </button>
            <button
              id="tab-menu-btn"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'menu' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <Utensils className="w-4 h-4" /> MESS BLUEPRINTS
            </button>
            <button
              id="tab-profile-btn"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'profile' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <UserIcon className="w-4 h-4" /> WARDEN PROFILE
            </button>
          </nav>
        </div>

        {/* Exit protocol */}
        <button
          id="logout-btn"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 mt-8 rounded-xl bg-red-950/15 border border-red-500/10 hover:border-red-500/40 text-red-400 font-mono text-xs hover:text-white transition-all text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> TERMINATE CABIN
        </button>
      </aside>

      {/* Main Panel Frame */}
      <main className="flex-grow p-6 md:p-10 space-y-8 max-w-7xl mx-auto overflow-y-auto">
        
        {/* Alerts & Errors */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl glass-panel p-5 border border-gray-900">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Registered Residents</span>
            <div className="font-display font-bold text-2xl text-white text-glow mt-1">{totalStudents} Members</div>
          </div>
          <div className="rounded-xl glass-panel p-5 border border-purple-500/10">
            <span className="text-[10px] font-mono text-purple-400 uppercase">Pending Requests</span>
            <div className="font-display font-bold text-2xl text-purple-400 text-glow mt-1">{pendingCount} Active</div>
          </div>
          <div className="rounded-xl glass-panel p-5 border border-yellow-500/10">
            <span className="text-[10px] font-mono text-yellow-500 uppercase">Unassigned Residents</span>
            <div className="font-display font-bold text-2xl text-yellow-500 text-glow mt-1">{unassignedStudents.length} Students</div>
          </div>
          <div className="rounded-xl glass-panel p-5 border border-red-500/10">
            <span className="text-[10px] font-mono text-red-400 uppercase">Under Maintenance</span>
            <div className="font-display font-bold text-2xl text-red-400 text-glow mt-1">{maintenanceCount} Rooms</div>
          </div>
        </div>

        {/* Render Active View */}
        <AnimatePresence mode="wait">
          
          {/* Tab 1: Request Gateway */}
          {activeTab === 'requests' && (
            <motion.div
              key="requests-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RequestHistoryPanel 
                user={user} 
                requests={requests} 
                onUpdateRequestStatus={onUpdateRequestStatus}
              />
            </motion.div>
          )}

          {/* Tab 2: Room assignment & Operations */}
          {activeTab === 'rooms' && (
            <motion.div
              key="rooms-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual room allocator form (Left columns) */}
                <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border border-gray-900 space-y-6">
                  <h3 className="font-display font-semibold text-white text-base">Assign Room coordinates</h3>
                  
                  {unassignedStudents.length > 0 ? (
                    <form id="warden-assign-room-form" onSubmit={handleAssignRoomSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 font-mono uppercase">Unallocated Resident</label>
                          <select
                            id="assign-student-select"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-900 p-2.5 rounded-lg text-white outline-none"
                            required
                          >
                            <option value="">Select Resident...</option>
                            {unassignedStudents.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.regNo})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 font-mono uppercase">Sector Block</label>
                          <select
                            id="assign-block-select"
                            value={assignBlock}
                            onChange={(e) => setAssignBlock(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-900 p-2.5 rounded-lg text-white outline-none"
                          >
                            <option value="Block A">Sector Block A</option>
                            <option value="Block B">Sector Block B</option>
                            <option value="Block C">Sector Block C</option>
                            <option value="Block D">Sector Block D</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 font-mono uppercase">Room Number</label>
                          <input
                            id="assign-room-input"
                            type="text"
                            value={assignRoomNo}
                            onChange={(e) => setAssignRoomNo(e.target.value)}
                            placeholder="e.g. 102"
                            className="w-full bg-gray-950 border border-gray-900 p-2.5 rounded-lg text-white outline-none"
                            required
                          />
                        </div>
                      </div>

                      <button
                        id="submit-room-assign-btn"
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-display font-semibold text-xs text-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <UserPlus className="w-4 h-4" /> COMMIT ALLOCATION
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-gray-900 text-center text-gray-500 font-mono text-xs">
                      All registered student units are currently allocated to sector rooms.
                    </div>
                  )}

                  {/* Room grid overview section */}
                  <div className="space-y-4 pt-4 border-t border-gray-900">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="font-mono text-[10px] text-gray-500 uppercase">Warden Sector Room Overview</h4>
                      
                      {/* Block switcher tabs */}
                      <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-900 text-xs font-mono">
                        {(['Block A', 'Block B', 'Block C', 'Block D'] as const).map((block) => (
                          <button
                            id={`warden-view-block-btn-${block.replace(' ', '')}`}
                            key={block}
                            type="button"
                            onClick={() => setViewBlock(block)}
                            className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${viewBlock === block ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            {block.replace('Block ', '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Room Grid Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                      {rooms.filter(r => r.block === viewBlock).map((room) => {
                        let bgClass = 'border-gray-900 bg-gray-950/20 hover:border-gray-800';
                        let labelClass = 'text-gray-500 border-gray-900';
                        if (room.status === 'Available') { bgClass = 'border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-400/40 hover:neon-glow-emerald'; labelClass = 'text-emerald-400 border-emerald-500/20'; }
                        if (room.status === 'Occupied') { bgClass = 'border-cyan-500/20 bg-cyan-950/10 hover:border-cyan-400/40 hover:neon-glow-cyan'; labelClass = 'text-cyan-400 border-cyan-500/20'; }
                        if (room.status === 'Maintenance') { bgClass = 'border-red-500/20 bg-red-950/10 hover:border-red-400/40 hover:neon-glow-red'; labelClass = 'text-red-400 border-red-500/20'; }

                        const isSelected = selectedWardenRoom && selectedWardenRoom.id === room.id;

                        return (
                          <div
                            key={room.id}
                            onClick={() => setSelectedWardenRoom(room)}
                            className={`p-3 rounded-xl border transition-all text-center space-y-1 relative cursor-pointer ${bgClass} ${
                              isSelected ? 'border-purple-500/75 ring-1 ring-purple-500/35 bg-purple-950/20' : ''
                            }`}
                          >
                            <div className="font-display font-semibold text-xs text-white">Room {room.roomNo}</div>
                            <div className="text-[8px] font-mono uppercase tracking-wider text-gray-500">
                              Load: <span className="text-white font-semibold">{room.occupied}/{room.capacity}</span>
                            </div>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[7px] font-mono tracking-widest ${labelClass} bg-gray-950 border`}>
                              {room.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Resident Census Lookup / Selected Room details (Right panel) */}
                <div className="lg:col-span-1">
                  {selectedWardenRoom ? (
                    (() => {
                      // Retrieve the live/updated room state from the incoming props array
                      const liveRoom = rooms.find(r => r.id === selectedWardenRoom.id) || selectedWardenRoom;
                      const roomStudents = students.filter(
                        s => s.hostelBlock === liveRoom.block && String(s.roomNo) === String(liveRoom.roomNo)
                      );

                      return (
                        <div className="rounded-2xl glass-panel p-6 border border-purple-500/30 bg-gray-950/80 space-y-5">
                          <div className="flex justify-between items-center">
                            <h3 className="font-display font-semibold text-purple-400 text-sm flex items-center gap-1.5">
                              <Shield className="w-4 h-4" /> Room {liveRoom.roomNo} Audit
                            </h3>
                            <button 
                              onClick={() => setSelectedWardenRoom(null)}
                              className="text-[10px] font-mono text-gray-500 hover:text-white cursor-pointer"
                            >
                              [CENSUS VIEW]
                            </button>
                          </div>

                          <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-900 space-y-3.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500 font-mono uppercase">Block Section</span>
                              <span className="text-white font-bold">{liveRoom.block}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 font-mono uppercase">Room ID</span>
                              <span className="text-white font-bold">Room {liveRoom.roomNo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 font-mono uppercase">Occupancy</span>
                              <span className="text-white font-bold">{liveRoom.occupied} / {liveRoom.capacity} Students</span>
                            </div>
                            <div className="flex flex-col space-y-1.5 pt-1.5 border-t border-gray-900">
                              <span className="text-gray-500 font-mono uppercase">Update Room Status</span>
                              <select
                                id="warden-status-select"
                                value={liveRoom.status}
                                onChange={(e) => handleSetRoomStatus(liveRoom.id, e.target.value as any)}
                                className="w-full bg-gray-950 border border-gray-800 p-2 rounded-lg text-white font-mono text-xs outline-none"
                              >
                                <option value="Available">Available</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Maintenance">Maintenance</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-mono text-[10px] text-gray-500 uppercase">Room Residents ({roomStudents.length})</h4>
                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                              {roomStudents.length > 0 ? (
                                roomStudents.map((std) => (
                                  <div key={std.id} className="p-3 rounded-xl bg-gray-950/50 border border-gray-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                      {std.profilePic ? (
                                        <img src={std.profilePic} alt={std.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <UserIcon className="w-4 h-4 text-gray-600" />
                                      )}
                                    </div>
                                    <div className="overflow-hidden flex-grow">
                                      <span className="font-semibold text-xs text-white block truncate">{std.name}</span>
                                      <span className="text-[10px] text-gray-400 font-mono block">
                                        {std.regNo} • {std.department || 'GEN'}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 rounded-xl border border-dashed border-gray-900 text-center text-gray-600 font-mono text-[11px]">
                                  No student units in this room.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="rounded-2xl glass-panel p-6 border border-gray-900 space-y-4">
                      <h3 className="font-display font-semibold text-white text-base">Resident census</h3>
                      <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                        {students.map((std) => (
                          <div key={std.id} className="p-3 rounded-xl bg-gray-950/50 border border-gray-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {std.profilePic ? (
                                <img src={std.profilePic} alt={std.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <UserIcon className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <div className="overflow-hidden flex-grow">
                              <span className="font-semibold text-xs text-white block truncate">{std.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono block">
                                {std.regNo} • {std.roomNo ? `${std.hostelBlock || 'Block'} Room ${std.roomNo}` : 'UNALLOCATED'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* Tab 3: Announcements CRUD creator */}
          {activeTab === 'announcements' && (
            <motion.div
              key="announcements-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Creator form (Left columns) */}
              <div className="lg:col-span-1 rounded-2xl glass-panel p-6 border border-gray-900">
                <h3 className="font-display font-semibold text-white text-base border-b border-gray-900 pb-3 mb-4">
                  Broadcast New Memorandum
                </h3>
                
                <form id="announcement-broadcast-form" onSubmit={handleAddAnnouncement} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Memorandum Title</label>
                    <input
                      id="ann-title-input"
                      type="text"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="e.g. Mandatory Block inspection timing"
                      className="w-full bg-gray-950 border border-gray-900 p-2.5 rounded-lg text-white outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Emergency priority</label>
                    <select
                      id="ann-priority-select"
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value as any)}
                      className="w-full bg-gray-950 border border-gray-900 p-2.5 rounded-lg text-white outline-none text-gray-400"
                    >
                      <option value="Low">Low Importance</option>
                      <option value="Normal">Normal Broadcast</option>
                      <option value="High">HIGH EMERGENCY THREAT</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Broadcast details</label>
                    <textarea
                      id="ann-content-input"
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="Describe the memorandum context precisely for resident logs..."
                      rows={5}
                      className="w-full bg-gray-950 border border-gray-900 p-2.5 rounded-lg text-white outline-none resize-none"
                      required
                    />
                  </div>

                  <button
                    id="submit-ann-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 font-display font-semibold text-xs text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> BROADCAST MEMORANDUM
                  </button>
                </form>
              </div>

              {/* Active logs list (Right column) */}
              <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border border-gray-900 space-y-4">
                <h3 className="font-display font-semibold text-white text-base">Active Announcements logs</h3>
                
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {announcements.length > 0 ? (
                    announcements.map((a) => (
                      <div key={a.id} className="p-4 rounded-xl bg-gray-950/50 border border-gray-900 flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-gray-600">{new Date(a.date).toLocaleDateString()}</span>
                            {a.priority === 'High' && (
                              <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-500/20 text-[8px] font-mono text-red-400 uppercase tracking-widest animate-pulse">HIGH PRIORITY</span>
                            )}
                          </div>
                          <h4 className="font-semibold text-xs text-white">{a.title}</h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{a.content}</p>
                        </div>

                        <button
                          id={`delete-ann-btn-${a.id}`}
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          className="p-2 rounded-lg hover:bg-red-950/45 text-gray-600 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-600 font-mono text-xs">
                      No announcements broadcast history logged.
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* Tab 4: Mess Menu Blueprints */}
          {activeTab === 'menu' && (
            <motion.div
              key="menu-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MessMenuPanel 
                user={user} 
                initialMenu={messMenu} 
                onUpdateMenu={onUpdateMenu} 
              />
            </motion.div>
          )}

          {/* Tab 5: Profile settings */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProfilePanel 
                user={user} 
                onUpdateProfile={onUpdateProfile} 
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
