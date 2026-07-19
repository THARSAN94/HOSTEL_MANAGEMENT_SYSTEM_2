/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  PlusCircle, 
  FileText, 
  Utensils, 
  User as UserIcon, 
  LogOut, 
  Bell, 
  Cpu, 
  AlertCircle, 
  Sparkles, 
  Info, 
  ShieldAlert, 
  Activity, 
  Zap, 
  Compass, 
  UserCheck,
  CheckCircle2 
} from 'lucide-react';
import { 
  User, 
  HostelRequest, 
  Announcement, 
  MessDayMenu, 
  RoomStatus, 
  RequestType, 
  RequestPriority 
} from '../types';
import ProfilePanel from './ProfilePanel';
import MessMenuPanel from './MessMenuPanel';
import RequestHistoryPanel from './RequestHistoryPanel';

interface StudentDashboardProps {
  user: User;
  announcements: Announcement[];
  messMenu: MessDayMenu[];
  rooms: RoomStatus[];
  requests: HostelRequest[];
  onLogout: () => void;
  onUpdateProfile: (updatedFields: Partial<User>) => Promise<boolean>;
  onAddRequest: (request: Partial<HostelRequest>) => Promise<boolean>;
  onChooseRoom?: (roomId: string) => Promise<boolean>;
}

export default function StudentDashboard({
  user,
  announcements,
  messMenu,
  rooms,
  requests,
  onLogout,
  onUpdateProfile,
  onAddRequest,
  onChooseRoom,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'request' | 'history' | 'menu' | 'profile'>('rooms');
  
  // New Request Form States
  const [reqType, setReqType] = useState<RequestType>('allocation');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('Medium');
  
  // Specific Leave / Outpass Form Variables
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selected Block for room dashboard
  const [selectedBlock, setSelectedBlock] = useState<'Block A' | 'Block B' | 'Block C' | 'Block D'>('Block A');
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<RoomStatus | null>(null);

  // Stats
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description) {
      setError('Title and description logs are required.');
      return;
    }

    setLoading(true);
    try {
      let finalDescription = description;
      if (reqType === 'leave') {
        if (!leaveStartDate || !leaveEndDate) {
          setError('Departure and Return date limits must be declared.');
          setLoading(false);
          return;
        }
        finalDescription = `[OUTPASS SCHEDULE: From ${leaveStartDate} to ${leaveEndDate}] — ${description}`;
      }

      const payload: Partial<HostelRequest> = {
        type: reqType,
        title,
        description: finalDescription,
        priority,
      };

      const result = await onAddRequest(payload);
      if (result) {
        setSuccess('Your request has been filed in the queue. Watch for Warden approval notifications.');
        setTitle('');
        setDescription('');
        setLeaveStartDate('');
        setLeaveEndDate('');
        setTimeout(() => {
          setActiveTab('history');
          setSuccess(null);
        }, 1200);
      } else {
        setError('Server failed to index requested complaint.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing protocol.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyIconColor = (p: RequestPriority) => {
    switch (p) {
      case 'Low': return 'text-gray-500';
      case 'Medium': return 'text-blue-400';
      case 'High': return 'text-orange-400';
      case 'Emergency': return 'text-red-500';
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col md:flex-row relative">
      
      {/* Sidebar Control Panel */}
      <aside className="w-full md:w-64 bg-gray-950/90 border-r border-gray-900 flex flex-col justify-between p-6 z-10 md:h-screen sticky top-0">
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <Cpu className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-wide text-white">VSB HUB 2</span>
              <div className="text-[9px] text-cyan-400 font-mono tracking-widest">RESIDENT CABIN</div>
            </div>
          </div>

          {/* Quick Profile preview */}
          <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <span className="font-semibold text-xs text-white block truncate">{user.name}</span>
              <span className="text-[9px] text-gray-500 font-mono block truncate">{user.regNo || 'NO REG'}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5 flex flex-col font-mono text-xs text-gray-500">
            <button
              id="tab-rooms-btn"
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'rooms' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <Home className="w-4 h-4" /> ROOM DASHBOARD
            </button>
            <button
              id="tab-request-btn"
              onClick={() => setActiveTab('request')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'request' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <PlusCircle className="w-4 h-4" /> FILE REQUEST
            </button>
            <button
              id="tab-history-btn"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'history' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <FileText className="w-4 h-4" /> REQUEST HISTORY
            </button>
            <button
              id="tab-menu-btn"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'menu' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <Utensils className="w-4 h-4" /> MESS SCHEDULE
            </button>
            <button
              id="tab-profile-btn"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${activeTab === 'profile' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-bold' : 'hover:bg-gray-900/40 hover:text-white'}`}
            >
              <UserIcon className="w-4 h-4" /> SETTINGS MATRIX
            </button>
          </nav>
        </div>

        {/* Exit protocol */}
        <button
          id="logout-btn"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 mt-8 rounded-xl bg-red-950/15 border border-red-500/10 hover:border-red-500/40 text-red-400 font-mono text-xs hover:text-white transition-all text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> TERMINATE SESSION
        </button>
      </aside>

      {/* Main Panel Frame */}
      <main className="flex-grow p-6 md:p-10 space-y-8 max-w-7xl mx-auto overflow-y-auto">
        
        {/* Top bar announcements notification alert (High Priority only) */}
        {announcements.filter(a => a.priority === 'High').slice(0, 1).map((a) => (
          <div key={a.id} className="p-4 rounded-xl bg-orange-950/40 border border-orange-500/30 text-orange-200 text-xs flex items-start gap-3.5 animate-pulse">
            <Bell className="w-5 h-5 text-orange-400 flex-shrink-0 animate-bounce mt-0.5" />
            <div className="flex-grow">
              <span className="font-mono font-bold tracking-wider text-[10px] uppercase block text-orange-400">IMMEDIATE EMERGENCY MEMORANDUM</span>
              <p className="font-medium mt-1">{a.title}: {a.content}</p>
            </div>
          </div>
        ))}

        {/* Active Tab rendering */}
        <AnimatePresence mode="wait">
          
          {/* 1. Room Dashboard */}
          {activeTab === 'rooms' && (
            <motion.div
              key="rooms-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Heading */}
              <div>
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Home className="w-6 h-6 text-cyan-400" />
                  Room Allocation Dashboard
                </h2>
                <p className="text-gray-500 text-xs font-mono tracking-wide uppercase mt-1">
                  Boys Hostel 2 sector logs showing live capacity variables.
                </p>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl glass-panel p-5 border border-gray-900 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Total capacity</span>
                  <div className="font-display font-bold text-2xl text-white text-glow mt-2">{totalRooms * 4} Units</div>
                </div>
                <div className="rounded-xl glass-panel p-5 border border-cyan-500/10 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">Available Rooms</span>
                  <div className="font-display font-bold text-2xl text-cyan-400 text-glow mt-2">{availableRooms} Rooms</div>
                </div>
                <div className="rounded-xl glass-panel p-5 border border-purple-500/10 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-purple-400 uppercase">Occupied Rooms</span>
                  <div className="font-display font-bold text-2xl text-purple-400 text-glow mt-2">{occupiedRooms} Rooms</div>
                </div>
                <div className="rounded-xl glass-panel p-5 border border-red-500/10 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-red-400 uppercase">Maintenance</span>
                  <div className="font-display font-bold text-2xl text-red-400 text-glow mt-2">{maintenanceRooms} Rooms</div>
                </div>
              </div>

              {/* Announcements column + Interactive Room Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Room matrix visual viewer */}
                <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border border-gray-900 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="font-display font-semibold text-white text-base">Hostel Grid Matrix</h3>
                    
                    {/* Block selector tabs */}
                    <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-900 text-xs font-mono">
                      {(['Block A', 'Block B', 'Block C', 'Block D'] as const).map((block) => (
                        <button
                          id={`select-block-btn-${block.replace(' ', '')}`}
                          key={block}
                          onClick={() => setSelectedBlock(block)}
                          className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${selectedBlock === block ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {block.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid layout */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {rooms.filter(r => r.block === selectedBlock).map((room) => {
                      let bgClass = 'border-gray-900 bg-gray-950/20';
                      let labelClass = 'text-gray-500';
                      if (room.status === 'Available') { bgClass = 'border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-400/40 hover:neon-glow-emerald'; labelClass = 'text-emerald-400'; }
                      if (room.status === 'Occupied') { bgClass = 'border-cyan-500/20 bg-cyan-950/10 hover:border-cyan-400/40 hover:neon-glow-cyan'; labelClass = 'text-cyan-400'; }
                      if (room.status === 'Maintenance') { bgClass = 'border-red-500/20 bg-red-950/10 hover:border-red-400/40 hover:neon-glow-red'; labelClass = 'text-red-400'; }

                      const isCurrentRoom = String(user.roomNo) === String(room.roomNo) && user.hostelBlock === room.block;

                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoomForBooking(room)}
                          className={`p-4 rounded-xl border transition-all text-center space-y-2 relative cursor-pointer ${bgClass} ${
                            isCurrentRoom ? 'border-cyan-500/70 ring-1 ring-cyan-500/30 bg-cyan-950/20' : ''
                          }`}
                        >
                          {isCurrentRoom && (
                            <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded bg-cyan-500 text-[7px] font-mono text-black font-bold uppercase tracking-widest shadow-lg">YOURS</span>
                          )}
                          <div className="font-display font-bold text-sm text-white">Room {room.roomNo}</div>
                          <div className="text-[9px] font-mono uppercase tracking-wider text-gray-500">
                            Occupied: <span className="text-white font-bold">{room.occupied}/{room.capacity}</span>
                          </div>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest ${labelClass} bg-gray-950 border border-gray-900`}>
                            {room.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Room Selector details or Announcements */}
                <div className="lg:col-span-1">
                  {selectedRoomForBooking ? (
                    <div className="rounded-2xl glass-panel p-6 border border-cyan-500/30 bg-gray-950/80 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-display font-semibold text-cyan-400 text-sm flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> Room Coordinates
                        </h3>
                        <button 
                          onClick={() => setSelectedRoomForBooking(null)}
                          className="text-[10px] font-mono text-gray-500 hover:text-white"
                        >
                          [DISMISS]
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-900 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-mono uppercase">Block Section</span>
                          <span className="text-white font-bold">{selectedRoomForBooking.block}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-mono uppercase">Room Number</span>
                          <span className="text-white font-bold">Room {selectedRoomForBooking.roomNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-mono uppercase">Occupancy Load</span>
                          <span className="text-white font-bold">{selectedRoomForBooking.occupied} / {selectedRoomForBooking.capacity} Members</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-mono uppercase">State Matrix</span>
                          <span className={`font-mono font-bold ${
                            selectedRoomForBooking.status === 'Available' ? 'text-emerald-400' :
                            selectedRoomForBooking.status === 'Maintenance' ? 'text-red-400' : 'text-cyan-400'
                          }`}>{selectedRoomForBooking.status.toUpperCase()}</span>
                        </div>
                      </div>

                      {String(user.roomNo) === String(selectedRoomForBooking.roomNo) && user.hostelBlock === selectedRoomForBooking.block ? (
                        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono text-center">
                          ✔ You are already residing in this room coordinate.
                        </div>
                      ) : selectedRoomForBooking.status === 'Maintenance' ? (
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono text-center">
                          ⚠ Under maintenance protocol. Selection locked.
                        </div>
                      ) : selectedRoomForBooking.occupied >= selectedRoomForBooking.capacity ? (
                        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-mono text-center">
                          ✕ Capacity saturated (4/4 limit reached).
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            if (onChooseRoom) {
                              setLoading(true);
                              setError(null);
                              setSuccess(null);
                              const ok = await onChooseRoom(selectedRoomForBooking.id);
                              setLoading(false);
                              if (ok) {
                                setSuccess(`Room ${selectedRoomForBooking.roomNo} successfully chosen!`);
                                setSelectedRoomForBooking(null);
                              } else {
                                setError('Failed to book target room.');
                              }
                            }
                          }}
                          disabled={loading}
                          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          CHOOSE ROOM {selectedRoomForBooking.roomNo}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl glass-panel p-6 border border-gray-900 space-y-6">
                      <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
                        <Bell className="w-5 h-5 text-cyan-400" />
                        Warden Directives
                      </h3>
                      
                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                        {announcements.length > 0 ? (
                          announcements.map((a) => (
                            <div key={a.id} className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-900 space-y-1.5 hover:border-gray-800 transition-colors">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[9px] text-gray-600">{new Date(a.date).toLocaleDateString()}</span>
                                {a.priority === 'High' && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-950/50 border border-red-500/20 text-[8px] font-mono text-red-400 uppercase tracking-widest animate-pulse">HIGH</span>
                                )}
                              </div>
                              <h4 className="font-semibold text-xs text-white leading-snug">{a.title}</h4>
                              <p className="text-[11px] text-gray-400 leading-relaxed">{a.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-600 font-mono text-xs">
                            No active announcements logs.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. File Request Form */}
          {activeTab === 'request' && (
            <motion.div
              key="request-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div>
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-6 h-6 text-cyan-400" />
                  File Automated Request Protocol
                </h2>
                <p className="text-gray-500 text-xs font-mono tracking-wide uppercase mt-1">
                  Draft room allocations, complaints, water issues, or outpass leave matrices.
                </p>
              </div>

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

              {/* Form Card */}
              <div className="rounded-3xl glass-panel p-6 md:p-8 border border-gray-900">
                <form id="student-request-form" onSubmit={handleCreateRequest} className="space-y-5">
                  
                  {/* Select Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Service Protocol Category</label>
                      <select
                        id="form-req-type-select"
                        value={reqType}
                        onChange={(e) => setReqType(e.target.value as RequestType)}
                        className="w-full bg-gray-950 border border-cyan-500/10 focus:border-cyan-500/40 px-3.5 py-3 rounded-xl text-xs text-white outline-none transition-all"
                      >
                        <option value="allocation">Room Allocation Request</option>
                        <option value="change">Room Change Request</option>
                        <option value="mess">Mess Request</option>
                        <option value="electrical">Electrical Complaint</option>
                        <option value="plumbing">Plumbing Complaint</option>
                        <option value="maintenance">Maintenance Log</option>
                        <option value="cleaning">Sanitation / Cleaning</option>
                        <option value="water">Water Issue Log</option>
                        <option value="leave">Leave / Outpass Protocol</option>
                        <option value="other">Other Incident Request</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Urgency priority level</label>
                      <select
                        id="form-priority-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as RequestPriority)}
                        className="w-full bg-gray-950 border border-cyan-500/10 focus:border-cyan-500/40 px-3.5 py-3 rounded-xl text-xs text-white outline-none transition-all"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Level</option>
                        <option value="High">High Urgency</option>
                        <option value="Emergency">EMERGENCY STATE</option>
                      </select>
                    </div>
                  </div>

                  {/* Outpass Date Ranges (Visible only when 'leave' is toggled) */}
                  {reqType === 'leave' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-cyan-500/20 p-4 rounded-2xl bg-cyan-950/15"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-400 uppercase">Departure Date & Time</label>
                        <input
                          id="leave-start-input"
                          type="datetime-local"
                          value={leaveStartDate}
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-900 text-xs text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-500/40 transition-colors text-gray-400 cursor-pointer"
                          required={reqType === 'leave'}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-400 uppercase">Expected Return Date & Time</label>
                        <input
                          id="leave-end-input"
                          type="datetime-local"
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-900 text-xs text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-500/40 transition-colors text-gray-400 cursor-pointer"
                          required={reqType === 'leave'}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Request Title Heading</label>
                    <input
                      id="form-title-input"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Electrical Short-Circuit in Block A Room 102"
                      className="w-full bg-gray-950 border border-gray-900 text-xs text-white px-3.5 py-3 rounded-xl outline-none focus:border-cyan-500/30 transition-colors"
                      required
                    />
                  </div>

                  {/* Description Details */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Description / Log details</label>
                    <textarea
                      id="form-description-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="List complete symptoms, locations, block details, or outpass justifications for warden evaluation..."
                      rows={5}
                      className="w-full bg-gray-950 border border-gray-900 text-xs text-white p-3.5 rounded-xl outline-none focus:border-cyan-500/30 transition-colors resize-none"
                      required
                    />
                  </div>

                  {/* Submit */}
                  <button
                    id="submit-request-form-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Activity className="w-4 h-4 animate-pulse" />
                    {loading ? 'Transmitting Request Matrix...' : 'Transmit Request Protocol'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* 3. Request History Logs */}
          {activeTab === 'history' && (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RequestHistoryPanel 
                user={user} 
                requests={requests} 
              />
            </motion.div>
          )}

          {/* 4. Mess Schedule */}
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
                onUpdateMenu={async () => false} // student cannot update menu
              />
            </motion.div>
          )}

          {/* 5. Profile Panel settings */}
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
