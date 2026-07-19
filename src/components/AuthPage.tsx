/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  BookOpen, 
  Calendar, 
  Home, 
  Key, 
  Eye, 
  EyeOff, 
  Cpu, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthPageProps {
  initialRole?: UserRole;
  onAuthSuccess: (token: string, user: User) => void;
  onBack: () => void;
}

export default function AuthPage({ initialRole = 'student', onAuthSuccess, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Registration specific states (Students)
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [department, setDepartment] = useState('AI&DS');
  const [year, setYear] = useState('III');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male'); // Boys Hostel 2, so preselected Male
  const [address, setAddress] = useState('');
  const [hostelBlock, setHostelBlock] = useState('Block A');
  const [roomNo, setRoomNo] = useState('');
  
  // Warden specific registration passcode
  const [wardenPasscode, setWardenPasscode] = useState('');

  // Forgot Password / OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Accent colors based on selected role
  const glowClass = role === 'student' ? 'hover:neon-glow-cyan focus:ring-cyan-500 border-cyan-500/20' : 'hover:neon-glow-purple focus:ring-purple-500 border-purple-500/20';
  const textAccentClass = role === 'student' ? 'text-cyan-400' : 'text-purple-400';
  const bgAccentClass = role === 'student' ? 'from-blue-600 to-cyan-500' : 'from-purple-600 to-pink-500';

  const resetForm = () => {
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setRegNo('');
    setPhone('');
    setAddress('');
    setRoomNo('');
    setWardenPasscode('');
    setOtpSent(false);
    setOtp('');
    setNewPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccess('Login successful! Syncing session...');
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic common validations
    if (!name || !email || !password || !phone) {
      setError('Please fill in all mandatory fields (Name, Email, Password, Phone).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Role specific validations
    if (role === 'student') {
      if (!regNo) {
        setError('Student Registration Number is mandatory.');
        return;
      }
    } else {
      if (!wardenPasscode) {
        setError('Warden passcode is mandatory for verification.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        role,
        email,
        password,
        name,
        phone,
        address,
        gender: role === 'student' ? 'Male' : 'Male', // Boys Hostel 2 defaults
        hostelBlock: role === 'student' ? hostelBlock : 'Warden-HQ',
        roomNo: role === 'student' ? roomNo : '',
        regNo: role === 'student' ? regNo : undefined,
        department: role === 'student' ? department : undefined,
        year: role === 'student' ? year : undefined,
        wardenPasscode: role === 'warden' ? wardenPasscode : undefined,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Check console/terminal for simulated email verification.');
      setTimeout(() => {
        setMode('login');
        resetForm();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Please specify your registered email.');
      return;
    }

    setLoading(true);
    try {
      if (!otpSent) {
        // Send simulated OTP
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send OTP');
        }

        setSuccess(`Verification OTP sent! Check server terminal/logs. (Simulated OTP: ${data.otp})`);
        setOtpSent(true);
      } else {
        // Confirm reset
        if (!otp || !newPassword) {
          setError('Please provide the verification OTP and your new password.');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reset password');
        }

        setSuccess('Password reset successfully! Returning to login.');
        setTimeout(() => {
          setMode('login');
          resetForm();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cyber-bg flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-15 animate-pulse-slow ${role === 'student' ? 'bg-cyan-500' : 'bg-purple-500'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-15 animate-pulse-slow ${role === 'student' ? 'bg-blue-500' : 'bg-pink-500'}`} style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Back and Brand Row */}
        <div className="flex justify-between items-center mb-6 w-full">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            id="back-to-landing-btn"
            onClick={onBack}
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
          >
            ← BACK TO NEXUS
          </motion.button>
          <div className="flex items-center gap-2">
            <Cpu className={`w-5 h-5 ${textAccentClass} animate-pulse`} />
            <span className="font-display font-semibold text-sm tracking-wider text-white">VSB BH2 PORTAL</span>
          </div>
        </div>

        {/* Outer Form Card */}
        <div className={`rounded-3xl glass-panel p-8 md:p-10 border transition-all duration-500 ${role === 'student' ? 'border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.05)]' : 'border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.05)]'}`}>
          
          {/* Header Title & Role Selector */}
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              {mode === 'login' && 'System Access Cabin'}
              {mode === 'register' && 'Enroll New Resident'}
              {mode === 'forgot' && 'Key Recovery Center'}
            </h2>
            <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">
              {mode === 'login' && 'Verify Credentials for Gateway Admission'}
              {mode === 'register' && 'Collect and Store Personal Matrix'}
              {mode === 'forgot' && 'Bypass Lock via Secure OTP Sync'}
            </p>

            {/* Role Tab Toggle (Only visible if not in forgot password state) */}
            {mode !== 'forgot' && (
              <div className="flex bg-gray-950/80 p-1.5 rounded-xl border border-gray-900 mt-6 w-fit mx-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="toggle-student-btn"
                  type="button"
                  onClick={() => { setRole('student'); resetForm(); }}
                  className={`px-5 py-2 rounded-lg font-display text-xs font-semibold tracking-wider transition-all cursor-pointer ${role === 'student' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  STUDENT PORTAL
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="toggle-warden-btn"
                  type="button"
                  onClick={() => { setRole('warden'); resetForm(); }}
                  className={`px-5 py-2 rounded-lg font-display text-xs font-semibold tracking-wider transition-all cursor-pointer ${role === 'warden' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  WARDEN CABIN
                </motion.button>
              </div>
            )}
          </div>

          {/* Error and Success Indicators */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Render Active Form View */}
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-500 uppercase">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-600" />
                    <input
                      id="login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. resident@vsb.edu.in"
                      className={`w-full bg-gray-950/80 border text-sm text-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${glowClass}`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase">
                      {role === 'student' ? 'Hostel Passcode' : 'Warden Password'}
                    </label>
                    <button
                      id="forgot-password-link"
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); }}
                      className={`text-xs font-mono hover:underline ${textAccentClass}`}
                    >
                      FORGOT KEY?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-600" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={role === 'student' ? 'Enter secret security key' : 'Enter your account password'}
                      className={`w-full bg-gray-950/80 border text-sm text-white pl-11 pr-12 py-3 rounded-xl outline-none transition-all ${glowClass}`}
                      required
                    />
                    <button
                      id="toggle-password-visibility-btn"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Show password checklist trigger */}
                <div className="flex items-center gap-2 py-1">
                  <input
                    id="show-password-checkbox"
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="rounded border-gray-800 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-950 w-4 h-4 bg-gray-950"
                  />
                  <label htmlFor="show-password-checkbox" className="text-xs text-gray-500 font-mono cursor-pointer select-none">
                    Reveal Security Key Sequence
                  </label>
                </div>

                {/* Submit Action */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  id="submit-login-btn"
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-display font-semibold text-white bg-gradient-to-r ${bgAccentClass} shadow-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2`}
                >
                  {loading ? 'Decrypting credentials...' : `Admit as ${role === 'student' ? 'Resident' : 'Authorized Warden'}`}
                </motion.button>

                <div className="text-center pt-4">
                  <span className="text-xs text-gray-500 font-mono">
                    New to Boys Hostel 2?{' '}
                  </span>
                  <button
                    id="switch-to-register-link"
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className={`text-xs font-mono hover:underline font-bold ${textAccentClass}`}
                  >
                    REGISTER NEW UNIT
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'register' && (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleRegister}
                className="space-y-5"
              >
                {/* Scrollable Registration Form Fields for Rich Data */}
                <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4">
                  
                  {/* Two-Column Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Full Legal Name *</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-600" />
                        <input
                          id="register-name-input"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Muthusamy Dharshan"
                          className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Matrix Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-600" />
                        <input
                          id="register-email-input"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. resident@vsb.edu.in"
                          className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-600" />
                        <input
                          id="register-phone-input"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                          required
                        />
                      </div>
                    </div>

                    {role === 'student' ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-500 uppercase">Registration ID *</label>
                        <div className="relative">
                          <Cpu className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-600" />
                          <input
                            id="register-regno-input"
                            type="text"
                            value={regNo}
                            onChange={(e) => setRegNo(e.target.value)}
                            placeholder="e.g. 921321104001"
                            className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                            required={role === 'student'}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-500 uppercase">Secret Warden Passcode *</label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-600" />
                          <input
                            id="register-passcode-input"
                            type="password"
                            value={wardenPasscode}
                            onChange={(e) => setWardenPasscode(e.target.value)}
                            placeholder="Authorized Passphrase"
                            className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                            required={role === 'warden'}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {role === 'student' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-500 uppercase">Academic Department</label>
                          <div className="relative">
                            <BookOpen className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-600" />
                            <select
                              id="register-dept-select"
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                              className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                            >
                              <option value="AI&DS">Artificial Intelligence & Data Science (AI&DS)</option>
                              <option value="CSE">Computer Science & Engineering (CSE)</option>
                              <option value="IT">Information Technology (IT)</option>
                              <option value="CSBS">Computer Science & Business Systems (CSBS)</option>
                              <option value="AIML">Artificial Intelligence & Machine Learning (AIML)</option>
                              <option value="CCE">Computer & Communication Engineering (CCE)</option>
                              <option value="ECE">Electronics & Communication Engineering (ECE)</option>
                              <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                              <option value="MECH">Mechanical Engineering (MECH)</option>
                              <option value="CIVIL">Civil Engineering (CIVIL)</option>
                              <option value="CHEM">Chemical Engineering (CHEM)</option>
                              <option value="BIO-TECH">Biotechnology (BIO-TECH)</option>
                              <option value="BIO-MEDICAL">Biomedical Engineering (BIO-MEDICAL)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-500 uppercase">Current Academic Year</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-600" />
                            <select
                              id="register-year-select"
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                              className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                            >
                              <option value="I">1st Year (Freshman)</option>
                              <option value="II">2nd Year (Sophomore)</option>
                              <option value="III">3rd Year (Junior)</option>
                              <option value="IV">4th Year (Senior)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-500 uppercase">Gender Matrix</label>
                          <select
                            id="register-gender-select"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className={`w-full bg-gray-950/85 border text-xs text-white px-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                          >
                            <option value="Male">Male (Boys Hostel 2)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-500 uppercase">Hostel Sector Block</label>
                          <select
                            id="register-block-select"
                            value={hostelBlock}
                            onChange={(e) => setHostelBlock(e.target.value)}
                            className={`w-full bg-gray-950/85 border text-xs text-white px-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                          >
                            <option value="Block A">Sector Block A</option>
                            <option value="Block B">Sector Block B</option>
                            <option value="Block C">Sector Block C</option>
                            <option value="Block D">Sector Block D</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-500 uppercase">Room Preference (Optional)</label>
                          <div className="relative">
                            <Home className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                            <input
                              id="register-room-input"
                              type="text"
                              value={roomNo}
                              onChange={(e) => setRoomNo(e.target.value)}
                              placeholder="e.g. 102"
                              className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Permanent Matrix Home Address</label>
                    <textarea
                      id="register-address-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Door No, Street, City, State, PIN-Code"
                      rows={2}
                      className={`w-full bg-gray-950/85 border text-xs text-white p-3 rounded-xl outline-none transition-all resize-none ${glowClass}`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Create Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                        <input
                          id="register-password-input"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create strong passphrase"
                          className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-10 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                        <input
                          id="register-confirmpassword-input"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type secure passphrase"
                          className={`w-full bg-gray-950/85 border text-xs text-white pl-9 pr-10 py-2.5 rounded-xl outline-none transition-all ${glowClass}`}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  id="submit-register-btn"
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-display font-semibold text-white bg-gradient-to-r ${bgAccentClass} shadow-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2`}
                >
                  {loading ? 'Initializing record...' : 'Register as Official Resident'}
                </motion.button>

                <div className="text-center">
                  <span className="text-xs text-gray-500 font-mono">
                    Already registered?{' '}
                  </span>
                  <button
                    id="switch-to-login-link"
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`text-xs font-mono hover:underline font-bold ${textAccentClass}`}
                  >
                    ACCESS CABIN
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'forgot' && (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleForgotPassword}
                className="space-y-5"
              >
                {!otpSent ? (
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-500 uppercase">Registered Email Matrix</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-600" />
                      <input
                        id="forgot-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. resident@vsb.edu.in"
                        className={`w-full bg-gray-950/80 border text-sm text-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${glowClass}`}
                        required
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                      We will look up your registration and simulate sending an OTP bypass key sequence to this address.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-500 uppercase font-bold text-emerald-400">Security OTP Bypass Key</label>
                      <input
                        id="forgot-otp-input"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="e.g. 123456"
                        maxLength={6}
                        className={`w-full bg-gray-950/80 border text-center font-mono font-bold tracking-widest text-lg text-white py-3 rounded-xl outline-none transition-all ${glowClass}`}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-500 uppercase">New Secured Password</label>
                      <input
                        id="forgot-newpassword-input"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter secure password sequence"
                        className={`w-full bg-gray-950/80 border text-sm text-white px-4 py-3 rounded-xl outline-none transition-all ${glowClass}`}
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  id="submit-forgot-btn"
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-display font-semibold text-white bg-gradient-to-r ${bgAccentClass} shadow-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer`}
                >
                  {loading ? 'Processing protocol...' : !otpSent ? 'Request Bypass Sequence' : 'Commit New Security Key'}
                </button>

                <div className="text-center">
                  <button
                    id="switch-back-to-login"
                    type="button"
                    onClick={() => { setMode('login'); resetForm(); }}
                    className={`text-xs font-mono hover:underline font-bold ${textAccentClass}`}
                  >
                    RETURN TO CABIN
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
