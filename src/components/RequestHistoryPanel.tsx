/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Printer, 
  Check, 
  X, 
  AlertCircle, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Bookmark, 
  Briefcase 
} from 'lucide-react';
import { HostelRequest, RequestStatus, RequestPriority, RequestType, User } from '../types';

interface RequestHistoryPanelProps {
  user: User;
  requests: HostelRequest[];
  onUpdateRequestStatus?: (id: string, status: RequestStatus, remarks?: string) => Promise<boolean>;
}

export default function RequestHistoryPanel({ user, requests, onUpdateRequestStatus }: RequestHistoryPanelProps) {
  // Advanced Filter/Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<RequestType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<RequestPriority | 'all'>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // UI Detail Modals
  const [selectedRequest, setSelectedRequest] = useState<HostelRequest | null>(null);
  
  // Warden response states
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isWarden = user.role === 'warden';

  // Filter Logic
  const filteredRequests = requests.filter((req) => {
    // 1. Search name, registration number or description
    const text = searchTerm.toLowerCase();
    const matchesSearch = 
      req.studentName.toLowerCase().includes(text) ||
      req.studentRegNo.toLowerCase().includes(text) ||
      req.title.toLowerCase().includes(text) ||
      req.description.toLowerCase().includes(text);

    // 2. Type
    const matchesType = filterType === 'all' || req.type === filterType;

    // 3. Status
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

    // 4. Priority
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;

    // 5. Dept
    const matchesDept = filterDept === 'all' || req.studentDept.toLowerCase() === filterDept.toLowerCase();

    // 6. Date
    const matchesDate = !filterDate || req.date.startsWith(filterDate);

    // If student, only show their own requests
    const matchesStudentScope = isWarden || req.studentId === user.id;

    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesDept && matchesDate && matchesStudentScope;
  });

  const handleStatusUpdate = async (reqId: string, nextStatus: RequestStatus) => {
    if (!onUpdateRequestStatus) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await onUpdateRequestStatus(reqId, nextStatus, remarks);
      if (result) {
        setSuccess(`Request state changed to ${nextStatus}.`);
        setRemarks('');
        // Sync local selected state
        if (selectedRequest && selectedRequest.id === reqId) {
          setSelectedRequest({
            ...selectedRequest,
            status: nextStatus,
            remarks: remarks || selectedRequest.remarks
          });
        }
      } else {
        setError('Failed to update request state on the server.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeColor = (p: RequestPriority) => {
    switch (p) {
      case 'Low': return 'bg-gray-950 text-gray-400 border-gray-800';
      case 'Medium': return 'bg-blue-950/40 text-blue-400 border-blue-500/20';
      case 'High': return 'bg-orange-950/40 text-orange-400 border-orange-500/20';
      case 'Emergency': return 'bg-red-950/50 text-red-400 border-red-500/30 animate-pulse';
    }
  };

  const getStatusBadgeColor = (s: RequestStatus) => {
    switch (s) {
      case 'Pending': return 'bg-amber-950/40 text-amber-400 border-amber-500/20';
      case 'Approved': return 'bg-cyan-950/40 text-cyan-400 border-cyan-500/20';
      case 'Rejected': return 'bg-red-950/40 text-red-400 border-red-500/20';
      case 'Completed': return 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20';
    }
  };

  const formatRequestType = (type: RequestType) => {
    if (type === 'other') return 'Other Services';
    return type.toUpperCase() + ' Request';
  };

  // Triggers window native printing structured strictly for selected invoice receipts
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Request Hub Control
          </h2>
          <p className="text-gray-500 text-xs font-mono tracking-wide uppercase mt-1">
            {isWarden 
              ? 'WARDEN OVERVIEW: Monitor, prioritize, and process hostel requests.' 
              : 'STUDENT LOGS: Search and track active service requests and outpass approvals.'
            }
          </p>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="rounded-2xl glass-panel p-5 border border-gray-900 space-y-4">
        {/* Search and Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or title..."
              className="w-full bg-gray-950/80 border border-gray-900 text-xs text-white pl-9 pr-3 py-3 rounded-xl outline-none focus:border-cyan-500/30 transition-colors"
            />
          </div>

          <div className="relative">
            <input
              id="date-filter-input"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-gray-950/80 border border-gray-900 text-xs text-white px-3 py-3 rounded-xl outline-none focus:border-cyan-500/30 transition-colors cursor-pointer text-gray-400"
            />
          </div>

          {isWarden && (
            <div>
              <select
                id="dept-filter-select"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full bg-gray-950/80 border border-gray-900 text-xs text-gray-400 px-3 py-3 rounded-xl outline-none focus:border-cyan-500/30 transition-colors cursor-pointer"
              >
                <option value="all">All Departments</option>
                <option value="AI&DS">AI&DS</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="CSBS">CSBS</option>
                <option value="AIML">AIML</option>
                <option value="CCE">CCE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="CHEM">CHEM</option>
                <option value="BIO-TECH">BIO-TECH</option>
                <option value="BIO-MEDICAL">BIO-MEDICAL</option>
              </select>
            </div>
          )}
        </div>

        {/* Categories, Priority and Status Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-950/60 pt-4">
          <div>
            <label className="text-[9px] font-mono text-gray-500 uppercase block mb-1.5">Request Service Type</label>
            <select
              id="type-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-400 px-3 py-2.5 rounded-xl outline-none focus:border-cyan-500/30"
            >
              <option value="all">All Services</option>
              <option value="allocation">Room Allocation</option>
              <option value="change">Room Change</option>
              <option value="mess">Mess Request</option>
              <option value="electrical">Electrical Complaint</option>
              <option value="plumbing">Plumbing Incident</option>
              <option value="maintenance">Maintenance Log</option>
              <option value="cleaning">Sanitation & Cleaning</option>
              <option value="water">Water Issue</option>
              <option value="leave">Leave / Outpass</option>
              <option value="other">Other Services</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-mono text-gray-500 uppercase block mb-1.5">Current Status</label>
            <select
              id="status-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-400 px-3 py-2.5 rounded-xl outline-none focus:border-cyan-500/30"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-mono text-gray-500 uppercase block mb-1.5">Priority Threat</label>
            <select
              id="priority-filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="w-full bg-gray-950 border border-gray-900 text-xs text-gray-400 px-3 py-2.5 rounded-xl outline-none focus:border-cyan-500/30"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Emergency">Emergency Threat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Logs List */}
      <div className="rounded-2xl glass-panel border border-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-950/60 font-mono text-[10px] text-gray-500 uppercase border-b border-gray-900">
              <tr>
                <th className="p-4">Resident details</th>
                <th className="p-4">Service category</th>
                <th className="p-4">Request title</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date logged</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/60 font-sans text-gray-300">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-950/30 transition-colors">
                    {/* Resident */}
                    <td className="p-4">
                      <div>
                        <span className="font-semibold text-white block">{req.studentName}</span>
                        <span className="text-[10px] text-gray-500 font-mono block">
                          {req.studentRegNo} • {req.studentDept}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-mono text-[10px]">
                      <span className="px-2 py-1 rounded bg-gray-950 border border-gray-900 text-gray-400 uppercase">
                        {req.type}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="p-4">
                      <span className="font-medium text-white block truncate max-w-[160px]">{req.title}</span>
                      <span className="text-[10px] text-gray-500 block truncate max-w-[160px]">{req.description}</span>
                    </td>

                    {/* Priority */}
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-mono font-medium uppercase ${getPriorityBadgeColor(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-mono font-medium ${getStatusBadgeColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 font-mono text-[10px] text-gray-500">
                      {new Date(req.date).toLocaleDateString()}
                    </td>

                    {/* Action trigger */}
                    <td className="p-4 text-right">
                      <button
                        id={`view-req-btn-${req.id}`}
                        onClick={() => setSelectedRequest(req)}
                        className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 transition-all font-mono text-[10px] cursor-pointer"
                      >
                        ANALYZE
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono uppercase text-xs">
                    No matching request logs found in local sector records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Request Matrix Details Modal (Glassmorphic Overlay) */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-gray-950/95 border border-cyan-500/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl overflow-hidden print:border-none print:bg-white print:text-black print:absolute print:inset-0 print:m-0"
            >
              {/* Printable Area Wrapper */}
              <div id="printable-request-receipt" className="space-y-6 print:text-black">
                {/* Print layout College Header */}
                <div className="hidden print:flex flex-col items-center text-center pb-4 border-b-2 border-black/80 mb-6">
                  <h1 className="font-bold text-xl uppercase tracking-wider text-black">VSB ENGINEERING COLLEGE</h1>
                  <p className="text-[10px] text-black/60 uppercase font-mono tracking-widest mt-0.5">Boys Hostel 2 Department • Sector-X</p>
                  <p className="text-[9px] text-black/50 font-mono mt-1">OFFICIAL STATUS RECORD SHEET</p>
                </div>

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest print:text-black print:font-bold">
                      {formatRequestType(selectedRequest.type)}
                    </span>
                    <h3 className="font-display font-bold text-lg text-white mt-1 print:text-black">
                      {selectedRequest.title}
                    </h3>
                    <p className="text-[9px] text-gray-600 font-mono mt-0.5 print:text-black/60">
                      RECORD ID: <span className="font-semibold">{selectedRequest.id}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <span className={`px-2.5 py-1 rounded border text-[10px] font-mono uppercase ${getPriorityBadgeColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                    <span className={`px-2.5 py-1 rounded border text-[10px] font-mono ${getStatusBadgeColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                {/* Error and Success inside modal */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 print:hidden">
                    <AlertCircle className="w-4.5 h-4.5 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 print:hidden">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Details Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900/40 border border-gray-900 p-5 rounded-2xl print:border-black print:bg-transparent print:p-4">
                  {/* Student Specs */}
                  <div className="space-y-3.5 text-xs">
                    <h4 className="font-mono text-[10px] text-cyan-500 uppercase tracking-wider pb-1.5 border-b border-gray-900/60 print:text-black print:border-black/30">
                      Resident Demographics
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-gray-500 print:text-black/70">RESIDENT NAME:</span>
                      <span className="text-white font-medium print:text-black">{selectedRequest.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 print:text-black/70">REG ID NUMBER:</span>
                      <span className="text-white font-mono print:text-black">{selectedRequest.studentRegNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 print:text-black/70">DEPARTMENT:</span>
                      <span className="text-white font-medium print:text-black">{selectedRequest.studentDept}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 print:text-black/70">ASSIGNED ROOM:</span>
                      <span className="text-white font-medium print:text-black">
                        {selectedRequest.studentRoom ? `Room ${selectedRequest.studentRoom}` : 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Request Specs */}
                  <div className="space-y-3.5 text-xs">
                    <h4 className="font-mono text-[10px] text-cyan-500 uppercase tracking-wider pb-1.5 border-b border-gray-900/60 print:text-black print:border-black/30">
                      System Logistics
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-gray-500 print:text-black/70">LOGGED DATE:</span>
                      <span className="text-white font-mono print:text-black">
                        {new Date(selectedRequest.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 print:text-black/70">PRIORITY LEVEL:</span>
                      <span className="text-white font-mono uppercase print:text-black">{selectedRequest.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 print:text-black/70">CURRENT STATUS:</span>
                      <span className="text-white font-medium uppercase print:text-black">{selectedRequest.status}</span>
                    </div>
                  </div>
                </div>

                {/* Complaint Description */}
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] text-gray-500 uppercase">Matrix Problem Statement / Request Description</h4>
                  <p className="bg-gray-950/80 border border-gray-900 p-4 rounded-xl text-xs leading-relaxed text-gray-300 print:bg-transparent print:border-black/30 print:text-black">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Warden Remarks */}
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] text-gray-500 uppercase">Warden Official Protocol Remarks</h4>
                  <div className="bg-gray-950/80 border border-gray-900 p-4 rounded-xl text-xs leading-relaxed text-gray-300 print:bg-transparent print:border-black/30 print:text-black">
                    {selectedRequest.remarks ? (
                      <p className="text-emerald-400 font-medium print:text-black">{selectedRequest.remarks}</p>
                    ) : (
                      <p className="text-gray-600 font-mono italic print:text-black/50">No official remarks logged by warden department.</p>
                    )}
                  </div>
                </div>

                {/* Printable Signature Line */}
                <div className="hidden print:flex justify-between pt-16 text-xs text-black font-mono">
                  <div className="text-center w-40 border-t border-black/50 pt-1">
                    Resident Signature
                  </div>
                  <div className="text-center w-40 border-t border-black/50 pt-1">
                    Warden Signature
                  </div>
                </div>
              </div>

              {/* Action Operations Tray */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-900 print:hidden">
                <button
                  id="print-receipt-btn"
                  onClick={handlePrint}
                  className="px-5 py-3 rounded-xl border border-gray-800 hover:border-cyan-500/30 text-gray-300 hover:text-white text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4.5 h-4.5" /> PRINT MATRIX SHEET
                </button>

                {/* Warden Admin Directives */}
                {isWarden && selectedRequest.status === 'Pending' && (
                  <div className="flex-grow flex flex-col gap-2">
                    <input
                      id="remarks-input"
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add official administrative remarks..."
                      className="w-full bg-gray-950 border border-gray-900 text-xs text-white px-3 py-2.5 rounded-lg outline-none focus:border-purple-500/40"
                    />
                    <div className="flex gap-2">
                      <button
                        id="reject-request-btn"
                        onClick={() => handleStatusUpdate(selectedRequest.id, 'Rejected')}
                        disabled={loading}
                        className="flex-grow py-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-mono uppercase cursor-pointer"
                      >
                        REJECT REQUEST
                      </button>
                      <button
                        id="approve-request-btn"
                        onClick={() => handleStatusUpdate(selectedRequest.id, 'Approved')}
                        disabled={loading}
                        className="flex-grow py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-mono uppercase cursor-pointer"
                      >
                        APPROVE PROTOCOL
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional workflow for approved to completed */}
                {isWarden && selectedRequest.status === 'Approved' && (
                  <div className="flex-grow flex flex-col gap-2">
                    <input
                      id="remarks-input-approved"
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add completion logistics..."
                      className="w-full bg-gray-950 border border-gray-900 text-xs text-white px-3 py-2.5 rounded-lg outline-none focus:border-purple-500/40"
                    />
                    <button
                      id="complete-request-btn"
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'Completed')}
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-xs font-mono uppercase cursor-pointer"
                    >
                      MARK WORK ORDER COMPLETED
                    </button>
                  </div>
                )}

                <button
                  id="close-req-detail-btn"
                  onClick={() => { setSelectedRequest(null); setError(null); setSuccess(null); }}
                  className="sm:ml-auto px-5 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 text-xs font-mono tracking-wider transition-all cursor-pointer"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
