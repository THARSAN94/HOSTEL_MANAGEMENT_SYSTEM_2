/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Mail, 
  Cpu, 
  BookOpen, 
  ShieldCheck, 
  Upload, 
  Save, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';
import { User } from '../types';

interface ProfilePanelProps {
  user: User;
  onUpdateProfile: (updatedFields: Partial<User>) => Promise<boolean>;
}

export default function ProfilePanel({ user, onUpdateProfile }: ProfilePanelProps) {
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload to Base64 with drag & drop support
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!phone) {
      setError('Phone number cannot be empty.');
      return;
    }
    if (!address) {
      setError('Permanent address cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const result = await onUpdateProfile({
        phone,
        address,
        profilePic
      });

      if (result) {
        setSuccess('Resident profile record updated and synced.');
      } else {
        setError('Failed to update profile records on the server.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-cyan-400" />
          Resident Profile Command Matrix
        </h2>
        <p className="text-gray-500 text-xs font-mono tracking-wide uppercase mt-1">
          View permanent coordinates and edit permitted communication variables.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: Info Cards and Edit Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Avatar & Fixed Metadata */}
        <div className="lg:col-span-1 rounded-2xl glass-panel p-6 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500" />
          
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-2 border-cyan-500/30 overflow-hidden bg-gray-950/80 flex items-center justify-center shadow-lg group-hover:border-cyan-400 transition-colors">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-gray-700" />
              )}
            </div>
            
            {/* Overlay trigger */}
            <button
              id="trigger-file-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="absolute bottom-1 right-1 p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full shadow-lg border border-cyan-400/30 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input 
              id="profile-pic-file-input"
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>

          <div>
            <h3 className="font-display font-bold text-lg text-white">{user.name}</h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              {user.role.toUpperCase()}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="w-full border-t border-gray-900 pt-5 space-y-3.5 text-left text-xs font-mono">
            {user.regNo && (
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase">REG NUMBER:</span>
                <span className="text-white font-medium">{user.regNo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">HOSTEL BLOCK:</span>
              <span className="text-white font-medium">{user.hostelBlock || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">ASSIGNED ROOM:</span>
              <span className="text-white font-medium">{user.roomNo ? `Room ${user.roomNo}` : 'Pending allocation'}</span>
            </div>
          </div>
        </div>

        {/* Right Area: Editable Forms and Fields */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6 md:p-8 space-y-6">
          <form id="profile-edit-form" onSubmit={handleSave} className="space-y-6">
            <h3 className="font-display font-semibold text-white text-base border-b border-gray-900 pb-3">
              Coordinates Matrix
            </h3>

            {/* Read-Only Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Matrix Email (Permanent)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-700" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-400 pl-10 pr-3 py-3 rounded-xl cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {user.role === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Department</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-700" />
                      <input
                        type="text"
                        value={user.department || ''}
                        disabled
                        className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-400 pl-10 pr-3 py-3 rounded-xl cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Academic Year</label>
                    <div className="relative">
                      <Cpu className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-700" />
                      <input
                        type="text"
                        value={user.year || ''}
                        disabled
                        className="w-full bg-gray-950/40 border border-gray-900 text-xs text-gray-400 pl-10 pr-3 py-3 rounded-xl cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Editable Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Phone Contact *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    id="profile-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-gray-950/90 border border-cyan-500/15 focus:border-cyan-500/40 outline-none text-xs text-white pl-10 pr-3 py-3 rounded-xl transition-all hover:neon-glow-cyan"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Home Coordinates Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    id="profile-address-input"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Permanent Residence Address Details"
                    className="w-full bg-gray-950/90 border border-cyan-500/15 focus:border-cyan-500/40 outline-none text-xs text-white pl-10 pr-3 py-3 rounded-xl transition-all hover:neon-glow-cyan"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              id="save-profile-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-xl font-display font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-cyan-500/10 cursor-pointer hover:neon-glow-cyan hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 w-fit ml-auto"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Committing values...' : 'Commit Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
