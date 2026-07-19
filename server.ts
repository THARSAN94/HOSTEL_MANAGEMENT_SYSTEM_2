/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DB_FILE = path.join(process.cwd(), 'vsb_hostel_db.json');

// Middleware for body parsing with large limit for profile picture base64 transfers
app.use(express.json({ limit: '12mb' }));

// ----------------------------------------------------
// DATABASE SYSTEM (JSON flat-file persistence)
// ----------------------------------------------------
interface DBState {
  users: any[];
  requests: any[];
  announcements: any[];
  messMenu: any[];
  rooms: any[];
  otps: Record<string, { otp: string; expires: number }>;
}

const SALT_KEY = 'vsb_hostel_master_salt_2026';

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SALT_KEY).update(password).digest('hex');
}

// Custom lightweight HMAC JWT
function signJWT(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const pay = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SALT_KEY).update(`${header}.${pay}`).digest('base64url');
  return `${header}.${pay}.${signature}`;
}

function verifyJWT(token: string): any | null {
  try {
    const [header, pay, signature] = token.split('.');
    const expectedSign = crypto.createHmac('sha256', SALT_KEY).update(`${header}.${pay}`).digest('base64url');
    if (signature !== expectedSign) return null;
    return JSON.parse(Buffer.from(pay, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

// Initial/Seed Data for VSB Boys Hostel 2
const defaultRooms: any[] = [];
for (let i = 1; i <= 100; i++) {
  let block = '';
  if (i <= 25) block = 'Block A';
  else if (i <= 50) block = 'Block B';
  else if (i <= 75) block = 'Block C';
  else block = 'Block D';

  defaultRooms.push({
    id: `room-${i}`,
    block,
    roomNo: i.toString(),
    capacity: 4,
    occupied: 0,
    status: 'Available'
  });
}

const defaultMessMenu = [
  { day: 'Monday', breakfast: 'Ghee Podi Idli, Sambar, Coconut Chutney, Tea/Coffee', lunch: 'Rich Veg Biryani, Onion Raitha, Paneer Gravy, Curd Rice', snacks: 'Hot Onion Pakoda, Ginger Tea', dinner: 'Butter Chapathi, Chenna Masala, Hot Milk' },
  { day: 'Tuesday', breakfast: 'Crispy Poori, Potato Masala, Vadacurry, Coffee', lunch: 'Sambar Rice, Potato Fry, Appalam, Elaneer Payasam', snacks: 'Sweet Kozhukattai, Tea', dinner: 'Kalyana Veg Kurma, Parotta, Warm Milk' },
  { day: 'Wednesday', breakfast: 'Rava Upma, Coconut & Tomato Chutney, Tea', lunch: 'Kara Kuzhambu, Beetroot Poriyal, Curd, Rice', snacks: 'Samosa, Cardamom Tea', dinner: 'Jeera Rice, Dal Makhani, Fresh Fruits' },
  { day: 'Thursday', breakfast: 'Kambarasam Pongal, Medu Vada, Sambar, Coffee', lunch: 'Thali Meals, Veg Poriyal, Rasam, Butter Milk', snacks: 'Kala Chana Sundal, Tea', dinner: 'Idiyappam, Coconut Milk, Kadala Curry' },
  { day: 'Friday', breakfast: 'Onion Uttapam, Mint Chutney, Sambar, Tea', lunch: 'Lemon Rice, Potato Masala, Curd Rice, Pickles', snacks: 'Banana Fritters, Coffee', dinner: 'Wheat Chapathi, Mixed Veg Gravy, Milk' },
  { day: 'Saturday', breakfast: 'Semiya Upma, Tomato Chutney, Tea', lunch: 'Bisi Bele Bath, Potato Chips, Curd, Fruit Salad', snacks: 'Parippu Vada, Black Tea', dinner: 'Aloo Paratha, Curd, Pickles, Warm Milk' },
  { day: 'Sunday', breakfast: 'Special Masala Dosa, Sambar, Chutney, Coffee', lunch: 'Chief Chef Biryani, Veg Gravy, Sweet Kesari', snacks: 'Mixed Veg Cutlet, Tea', dinner: 'Phulka, Kadai Paneer, Hot Milk' },
];

const defaultAnnouncements = [
  { id: 'ann-1', title: 'Curfew Protocol Warning', content: 'Curfew lockdown commences strictly at 21:00 hours. High-priority scans will flag unauthorized outer movements.', date: new Date().toISOString(), priority: 'High' },
  { id: 'ann-2', title: 'Warden Room Registry Audits', content: 'Chief Warden Muthusamy will hold visual matrix reviews of Sector Block A rooms this Saturday.', date: new Date().toISOString(), priority: 'Normal' },
];

const defaultRequests: any[] = [];

function syncRoomOccupancies(db: DBState) {
  db.rooms = db.rooms.map((room: any) => {
    const occupiedCount = db.users.filter(
      (u: any) => u.role === 'student' && u.hostelBlock === room.block && String(u.roomNo) === String(room.roomNo)
    ).length;

    let status = room.status;
    if (status !== 'Maintenance') {
      if (occupiedCount >= room.capacity) {
        status = 'Occupied';
      } else {
        status = 'Available';
      }
    }
    
    return {
      ...room,
      occupied: occupiedCount,
      status
    };
  });
}

function readDB(): DBState {
  if (!fs.existsSync(DB_FILE)) {
    const state: DBState = {
      users: [],
      requests: defaultRequests,
      announcements: defaultAnnouncements,
      messMenu: defaultMessMenu,
      rooms: defaultRooms,
      otps: {}
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
    return state;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    // Fallback if corrupt
    return { users: [], requests: [], announcements: [], messMenu: [], rooms: [], otps: {} };
  }
}

function writeDB(state: DBState) {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

// ----------------------------------------------------
// SIMULATED EMAIL ALERTER (Cyber Terminal Logs)
// ----------------------------------------------------
function sendSimulatedEmail(to: string, subject: string, body: string) {
  console.log(`
┌──────────────────────────────────────────────────────────┐
│             NEXUS SYSTEM EMAIL NOTIFICATION LOG          │
├──────────────────────────────────────────────────────────┤
│ TO: ${to.padEnd(52)} │
│ SUBJECT: ${subject.padEnd(47)} │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ${body.split('\n').join('\n│ ')}
│                                                          │
└──────────────────────────────────────────────────────────┘
`);
}

// ----------------------------------------------------
// AUTH MIDDLEWARE
// ----------------------------------------------------
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing security token.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJWT(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired security token.' });
  }

  req.userPayload = payload;
  next();
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { role, email, password, name, phone, address, hostelBlock, roomNo, regNo, department, year, wardenPasscode } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const db = readDB();

  // Check unique email
  if (db.users.some(u => String(u.email || '').trim().toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ error: 'This email is already indexed in the registry.' });
  }

  // Check warden passcode
  if (role === 'warden') {
    if (wardenPasscode !== '418320') {
      return res.status(400).json({ error: 'Incorrect authorization passcode for Warden status.' });
    }
  }

  const id = 'user-' + Date.now();
  const newUser = {
    id,
    role,
    email: normalizedEmail,
    password: hashPassword(password),
    name,
    phone,
    address,
    hostelBlock,
    roomNo: role === 'student' ? roomNo : '',
    regNo: role === 'student' ? regNo : undefined,
    department: role === 'student' ? department : undefined,
    year: role === 'student' ? year : undefined,
    verified: false,
    profilePic: ''
  };

  db.users.push(newUser);
  syncRoomOccupancies(db);
  writeDB(db);

  // Send Simulated Account Verification Email
  sendSimulatedEmail(
    normalizedEmail,
    'VSB Nexus System - Account Registration Security Key',
    `Welcome, ${name}. Your credentials have been processed for VSB Boys Hostel 2.
Your matrix registration ID is: ${id}.
Your account is pending verify protocols. You can now login to your Cabin.`
  );

  res.json({ success: true, message: 'User unit added to coordinates.' });
});

// 2. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const db = readDB();

  // Find if user exists at all with this email
  const existingUserAnyRole = db.users.find(u => String(u.email || '').trim().toLowerCase() === normalizedEmail);

  if (!existingUserAnyRole) {
    return res.status(400).json({ 
      error: `The email address "${normalizedEmail}" is not registered in our database system.` 
    });
  }

  // Check if role matches
  if (existingUserAnyRole.role !== role) {
    const correctPortalName = existingUserAnyRole.role === 'warden' ? 'Warden Cabin' : 'Student Portal';
    const attemptedPortalName = role === 'warden' ? 'Warden Cabin' : 'Student Portal';
    return res.status(400).json({ 
      error: `This email is registered under the ${correctPortalName}, but you are currently trying to enter via the ${attemptedPortalName}.` 
    });
  }

  // Check password
  if (existingUserAnyRole.password !== hashPassword(password)) {
    return res.status(400).json({ 
      error: `Incorrect password sequence entered for ${normalizedEmail}.` 
    });
  }

  const token = signJWT({ id: existingUserAnyRole.id, email: existingUserAnyRole.email, role: existingUserAnyRole.role });
  
  // Strip password before returning
  const { password: _, ...safeUser } = existingUserAnyRole;
  res.json({ token, user: safeUser });
});

// 3. Auth: Forgot Password OTP
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const db = readDB();

  const user = db.users.find(u => String(u.email || '').trim().toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(400).json({ error: 'This email is not registered.' });
  }

  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  db.otps[normalizedEmail] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes
  };
  writeDB(db);

  sendSimulatedEmail(
    normalizedEmail,
    'VSB Nexus System - Password Bypass OTP Sequence',
    `Attention, Resident ${user.name}.
A password bypass query was initiated.
Your secure verification sequence OTP is: [ ${otp} ]
This sequence expires in 10 minutes.`
  );

  res.json({ success: true, otp, message: 'Simulated OTP bypass key sent.' });
});

// 4. Auth: Reset Password via OTP
app.post('/api/auth/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const db = readDB();

  const otpRecord = db.otps[normalizedEmail];
  if (!otpRecord || otpRecord.otp !== otp || otpRecord.expires < Date.now()) {
    return res.status(400).json({ error: 'Bypass OTP is invalid or expired.' });
  }

  const user = db.users.find(u => String(u.email || '').trim().toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(400).json({ error: 'User lookup failure during bypass.' });
  }

  user.password = hashPassword(newPassword);
  delete db.otps[normalizedEmail];
  writeDB(db);

  sendSimulatedEmail(
    normalizedEmail,
    'VSB Nexus System - Security Password Updated Alert',
    `Attention, ${user.name}. Your password sequence was altered and committed.
If you did not execute this change, please report immediately to Chief Warden Muthusamy.`
  );

  res.json({ success: true, message: 'Password keys changed.' });
});

// 5. Auth: Get current user
app.get('/api/auth/me', authenticate, (req: any, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.userPayload.id);
  if (!user) {
    return res.status(404).json({ error: 'User session not found.' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// 6. Auth: Patch Profile
app.patch('/api/auth/profile', authenticate, (req: any, res) => {
  const { phone, address, profilePic } = req.body;
  const db = readDB();

  const userIndex = db.users.findIndex(u => u.id === req.userPayload.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User coordinates missing.' });
  }

  const user = db.users[userIndex];
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (profilePic !== undefined) user.profilePic = profilePic;

  writeDB(db);

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// 7. Get Dashboard initial sync coordinates
app.get('/api/data/dashboard', authenticate, (req: any, res) => {
  const db = readDB();
  syncRoomOccupancies(db);
  writeDB(db);
  const { role, id } = req.userPayload;

  const response: any = {
    announcements: db.announcements,
    messMenu: db.messMenu,
    rooms: db.rooms,
  };

  if (role === 'student') {
    // Return only their own requests
    response.requests = db.requests.filter(r => r.studentId === id);
  } else {
    // Warden sees all requests
    response.requests = db.requests;
    
    // Warden also sees students list
    response.students = db.users
      .filter(u => u.role === 'student')
      .map(({ password: _, ...safeStudent }) => safeStudent);
  }

  res.json(response);
});

// 8. Requests: File new request
app.post('/api/requests', authenticate, (req: any, res) => {
  const { type, title, description, priority } = req.body;
  const db = readDB();
  const student = db.users.find(u => u.id === req.userPayload.id);

  if (!student) {
    return res.status(404).json({ error: 'Student unit missing.' });
  }

  const id = 'req-' + Date.now();
  const newRequest = {
    id,
    studentId: student.id,
    studentRegNo: student.regNo || 'N/A',
    studentName: student.name,
    studentDept: student.department || 'N/A',
    studentRoom: student.roomNo || '',
    type,
    title,
    description,
    status: 'Pending',
    priority: priority || 'Medium',
    date: new Date().toISOString(),
    remarks: ''
  };

  db.requests.push(newRequest);
  writeDB(db);

  // Email alerting
  sendSimulatedEmail(
    student.email,
    `VSB Boys Hostel 2 - Request Filed: ${title}`,
    `Resident ${student.name},\nYour requested service [ID: ${id}] has been submitted.\nPriority is flagged as: ${priority}.`
  );

  res.json({ success: true, request: newRequest });
});

// 9. Requests: Update Status (Warden only)
app.patch('/api/requests/:id', authenticate, (req: any, res) => {
  if (req.userPayload.role !== 'warden') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const { id } = req.params;
  const { status, remarks } = req.body;
  const db = readDB();

  const reqIndex = db.requests.findIndex(r => r.id === id);
  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Request record not found.' });
  }

  const request = db.requests[reqIndex];
  request.status = status;
  if (remarks !== undefined) request.remarks = remarks;

  writeDB(db);

  // Find student and email them
  const student = db.users.find(u => u.id === request.studentId);
  if (student) {
    sendSimulatedEmail(
      student.email,
      `VSB Boys Hostel 2 - Request State Alteration`,
      `Resident ${student.name},\nYour requested service [ID: ${id}] status is updated to: ${status}.\nWarden Remarks: ${remarks || 'No remarks added.'}`
    );
  }

  res.json({ success: true, request });
});

// 10. Announcements: Create (Warden only)
app.post('/api/announcements', authenticate, (req: any, res) => {
  if (req.userPayload.role !== 'warden') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const { title, content, priority } = req.body;
  const db = readDB();

  const id = 'ann-' + Date.now();
  const newAnn = {
    id,
    title,
    content,
    priority: priority || 'Normal',
    date: new Date().toISOString(),
  };

  db.announcements.unshift(newAnn);
  writeDB(db);

  res.json({ success: true, announcement: newAnn });
});

// 11. Announcements: Delete (Warden only)
app.delete('/api/announcements/:id', authenticate, (req: any, res) => {
  if (req.userPayload.role !== 'warden') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const { id } = req.params;
  const db = readDB();

  db.announcements = db.announcements.filter(a => a.id !== id);
  writeDB(db);

  res.json({ success: true });
});

// 12. Rooms: Assign student to room (Warden only)
app.post('/api/rooms/assign', authenticate, (req: any, res) => {
  if (req.userPayload.role !== 'warden') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const { studentId, block, roomNo } = req.body;
  const db = readDB();

  const student = db.users.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Resident not found.' });
  }

  // Assign room
  student.hostelBlock = block;
  student.roomNo = roomNo;

  // Sync rooms stats
  syncRoomOccupancies(db);

  writeDB(db);

  sendSimulatedEmail(
    student.email,
    'VSB Boys Hostel 2 - Room Allocation Success',
    `Resident ${student.name},\nYou have been allocated to Block: ${block}, Room Number: ${roomNo}.`
  );

  res.json({ success: true });
});

// 12.5. Rooms: Student chooses room
app.post('/api/rooms/choose', authenticate, (req: any, res) => {
  if (req.userPayload.role !== 'student') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const { roomId } = req.body;
  const db = readDB();

  const room = db.rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  if (room.status === 'Maintenance') {
    return res.status(400).json({ error: 'Room is currently under maintenance.' });
  }

  // Count occupants
  const currentOccupants = db.users.filter(u => u.role === 'student' && u.hostelBlock === room.block && String(u.roomNo) === String(room.roomNo));
  if (currentOccupants.length >= room.capacity) {
    return res.status(400).json({ error: 'Room is already fully occupied.' });
  }

  const student = db.users.find(u => u.id === req.userPayload.id);
  if (!student) {
    return res.status(404).json({ error: 'Resident not found.' });
  }

  student.hostelBlock = room.block;
  student.roomNo = room.roomNo;

  syncRoomOccupancies(db);
  writeDB(db);

  sendSimulatedEmail(
    student.email,
    'VSB Boys Hostel 2 - Room Selection Success',
    `Resident ${student.name},\nYou have successfully chosen Block: ${room.block}, Room Number: ${room.roomNo}.`
  );

  res.json({ success: true, user: student });
});

// 13. Rooms: Update Room status (Warden only)
app.patch('/api/rooms/:id', authenticate, (req: any, res) => {
  if (req.userPayload.role !== 'warden') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();

  const room = db.rooms.find(r => r.id === id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  room.status = status;
  syncRoomOccupancies(db);
  writeDB(db);

  res.json({ success: true, room });
});

// 14. Mess Menu: Update (Warden only)
app.put('/api/mess', authenticate, (req: any, res) => {
  if (req.userPayload.role !== 'warden') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const { menu } = req.body;
  if (!menu || !Array.isArray(menu)) {
    return res.status(400).json({ error: 'Invalid food menu format.' });
  }

  const db = readDB();
  db.messMenu = menu;
  writeDB(db);

  res.json({ success: true });
});

// 15. Gemini AI Assistant Proxy Route
app.post('/api/gemini/chat', async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt coordinates are missing.' });
  }

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      return res.json({ 
        text: "The server Gemini API key is currently running on sandboxed default mode. Here is the local Boys Hostel 2 Warden instructions:\n- Curfew: 9:00 PM is locking time.\n- Outpass: Must file 12 hours earlier in the 'File Request' tab.\n- Mess: Breakfast 7:30-9 AM, Lunch 12:30-2 PM, Dinner 7:30-9 PM." 
      });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `
You are the cybernetic warden of VSB Engineering College Boys Hostel 2.
Your tone is futuristic, helpful, polite, and extremely secure.
You answer students' and wardens' questions about hostel rules and procedures, explain how to file requests, and offer support with food and room layouts.

Here is the VSB BH2 official knowledge matrix:
- Curfew: 9:00 PM is locking time. Swipe/sign in is mandatory.
- Outpass / Leave: File 12 hours earlier in the 'File Request' tab. Urgent priority requests undergo faster scans.
- Mess Timings: Breakfast 7:30-9:00 AM, Lunch 12:30-2:00 PM, Tea/Snacks 4:30-5:30 PM, Dinner 7:30-9:00 PM.
- Maintenance alerts: Submitted with correct priority tag (Low, Medium, High, Emergency) in the 'File Request' tab.
- Chief Warden: Dr. Muthusamy.
- System Layout: Single screen, glassmorphism UI, advanced bento indicators, secure HMAC JWT gates.

Always maintain character as a cybernetic warden but keep answers direct, accurate, and scannable.
Do NOT output code blocks or JSON unless asked. Speak elegantly.
`;

    const chatHistory = (history || []).map((h: any) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Perform query with correct generateContent pattern
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Error querying Gemini Node:', err);
    res.status(500).json({ error: `AI core error: ${err.message || 'Interference'}` });
  }
});

// Start server initialization with Vite middleware
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-load DB on boot
  readDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VSB BH2 Server running on http://localhost:${PORT}`);
  });
}

startServer();
