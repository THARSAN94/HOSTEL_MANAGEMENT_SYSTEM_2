/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'warden';

export interface User {
  id: string;
  regNo?: string; // registration number (student only)
  name: string;
  email: string;
  phone: string;
  department?: string;
  year?: string;
  gender: string;
  address: string;
  hostelBlock: string;
  roomNo: string;
  role: UserRole;
  profilePic?: string; // base64 encoded image
  verified?: boolean;
}

export type RequestType =
  | 'allocation'
  | 'change'
  | 'mess'
  | 'electrical'
  | 'plumbing'
  | 'maintenance'
  | 'cleaning'
  | 'water'
  | 'leave'
  | 'other';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';
export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface HostelRequest {
  id: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  studentDept: string;
  studentRoom: string;
  type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  date: string; // ISO date string
  remarks?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'Low' | 'Normal' | 'High';
}

export interface MessDayMenu {
  day: string; // 'Monday', 'Tuesday', etc.
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

export interface RoomStatus {
  id: string;
  block: string;
  roomNo: string;
  capacity: number;
  occupied: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
}

export interface HostelStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalStudents: number;
  pendingRequests: number;
}
