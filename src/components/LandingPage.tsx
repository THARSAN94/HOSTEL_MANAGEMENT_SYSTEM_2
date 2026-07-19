/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Cpu, 
  Zap, 
  Users, 
  ArrowRight, 
  Compass, 
  Activity, 
  FileText, 
  HelpCircle 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: (role?: 'student' | 'warden') => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="relative min-h-screen bg-cyber-bg overflow-hidden flex flex-col justify-between">
      {/* Dynamic Futuristic Background Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Neon glowing radial gradient backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }} />

        {/* Floating grid lines in background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} 
        />
        
        {/* Floating Ambient Stars / Dust */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-cyan-400 blur-[2px] animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute top-2/3 left-1/5 w-3 h-3 rounded-full bg-purple-400 blur-[3px] animate-float" style={{ animationDuration: '11s', animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-pink-400 blur-[2px] animate-float" style={{ animationDuration: '9s', animationDelay: '3s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-2.5 h-2.5 rounded-full bg-emerald-400 blur-[2px] animate-float" style={{ animationDuration: '14s', animationDelay: '2s' }} />
      </div>

      {/* Header Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-wider text-white">
              VSB ENGINEERING COLLEGE
            </span>
            <div className="text-[10px] tracking-widest text-cyan-400 font-mono font-medium block">
              BOYS HOSTEL 2 • SECTOR-X
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex gap-4"
        >
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            id="header-student-btn"
            onClick={() => onGetStarted('student')}
            className="px-5 py-2 rounded-lg font-medium text-sm text-gray-300 border border-gray-800 hover:border-blue-500 hover:text-white transition-all bg-gray-900/40 backdrop-blur cursor-pointer"
          >
            Student Portal
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            id="header-warden-btn"
            onClick={() => onGetStarted('warden')}
            className="px-5 py-2 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-cyan-500/10 transition-all hover:neon-glow-cyan cursor-pointer"
          >
            Warden Portal
          </motion.button>
        </motion.div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24 flex-grow flex flex-col md:flex-row items-center gap-12">
        
        {/* Left column: Headings and CTAs */}
        <div className="w-full md:w-1/2 text-left flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-blue-500/30 text-xs text-cyan-400 font-mono mb-6 w-fit animate-pulse"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>NEXUS HOSTEL MANAGEMENT ENGINE ACTIVE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          >
            Futuristic Living for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 text-glow">
              VSB Boys Hostel 2
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-400 text-base sm:text-lg mb-8 max-w-xl leading-relaxed"
          >
            Experience a premium, cyber-enabled accommodation system designed specifically for the residents of VSB Engineering College. Integrated with real-time room availability, automated outpass, and an intelligent Gemini AI Warden Assistant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              id="get-started-student-btn"
              onClick={() => onGetStarted('student')}
              className="px-8 py-4 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 hover:opacity-95 shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2 group hover:neon-glow-cyan cursor-pointer"
            >
              Access Student Cabin
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              id="get-started-warden-btn"
              onClick={() => onGetStarted('warden')}
              className="px-8 py-4 rounded-xl font-display font-semibold text-gray-300 border border-gray-800 hover:border-purple-500 hover:text-white transition-all bg-gray-950/60 backdrop-blur flex items-center gap-2 cursor-pointer hover:neon-glow-purple"
            >
              Warden Operations
            </motion.button>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 mt-12 border-t border-gray-900 pt-8"
          >
            <div>
              <div className="font-display font-bold text-2xl text-cyan-400 text-glow">400+</div>
              <div className="text-xs text-gray-500 font-mono uppercase mt-1">Hostel Capacity</div>
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-purple-400 text-glow">3 Blocks</div>
              <div className="text-xs text-gray-500 font-mono uppercase mt-1">Sectors A, B & C</div>
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-emerald-400 text-glow">Instant</div>
              <div className="text-xs text-gray-500 font-mono uppercase mt-1">Gemini AI Help</div>
            </div>
          </motion.div>
        </div>

        {/* Right column: Futuristic Animated Illustration Widget */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-[440px] aspect-square rounded-3xl glass-panel-neon border-cyan-500/30 p-8 flex flex-col justify-between overflow-hidden"
          >
            {/* Holographic glowing lines */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
            
            {/* Mock Dashboard Illustration inside Hero */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 rounded-full bg-green-500/80 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="font-mono text-[10px] text-cyan-400 tracking-wider">SECURE CONNECTION SEC-02</span>
            </div>

            <div className="space-y-4 flex-grow flex flex-col justify-center">
              {/* Animated Floating Card 1 */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="bg-gray-950/80 border border-cyan-500/30 p-4 rounded-xl flex items-center gap-4 hover:neon-glow-cyan transition-all"
              >
                <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <div className="text-xs font-mono text-gray-500">BOYS HOSTEL STATUS</div>
                  <div className="text-sm font-semibold text-white">All Systems Operational</div>
                </div>
                <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>

              {/* Animated Floating Card 2 */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="bg-gray-950/80 border border-purple-500/30 p-4 rounded-xl flex items-center gap-4 hover:neon-glow-purple transition-all"
              >
                <div className="p-2 rounded-lg bg-purple-950 text-purple-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <div className="text-xs font-mono text-gray-500">INTELLIGENT AI ENGINE</div>
                  <div className="text-sm font-semibold text-white">Gemini Warden Assistant</div>
                </div>
                <span className="text-xs font-mono text-purple-400 font-bold">2.5 PRO</span>
              </motion.div>

              {/* Animated Floating Card 3 */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                className="bg-gray-950/80 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-4 hover:neon-glow-emerald transition-all"
              >
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <div className="text-xs font-mono text-gray-500">ALLOCATED ROOMS</div>
                  <div className="text-sm font-semibold text-white">92% Occupancy Rate</div>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-medium">Block B</span>
              </motion.div>
            </div>

            <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-gray-500">
              <span>LATENCY: 12ms</span>
              <span>HOST: VSB-BH2-NODE</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature Bento Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wide">
            State-of-the-Art Operations
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            A comprehensive command suite crafted with cybernetic precision for VSB wardens and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl glass-panel hover:border-blue-500/40 transition-all hover:bg-gray-950/40 group">
            <div className="w-12 h-12 rounded-xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:neon-glow-cyan transition-all">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold font-display text-lg mb-2">Automated Requests</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Submit allocations, room changes, maintenance logs, outpass, and water complaints with clear tracking.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl glass-panel hover:border-purple-500/40 transition-all hover:bg-gray-950/40 group">
            <div className="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:neon-glow-purple transition-all">
              <Cpu className="w-6 h-6 animate-spin-slow" />
            </div>
            <h3 className="text-white font-semibold font-display text-lg mb-2">Gemini AI Assistant</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Instant clarification of rules, dining procedures, block policies, and navigation help with zero delays.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl glass-panel hover:border-emerald-500/40 transition-all hover:bg-gray-950/40 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:neon-glow-emerald transition-all">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold font-display text-lg mb-2">Mess CRUD Hub</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Wardens can directly update the nutritional layout, and students can access live menus dynamically.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-gray-950/50 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600 font-mono">
        <div>
          © {new Date().getFullYear()} VSB Engineering College. Boys Hostel 2 Department.
        </div>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <span className="hover:text-gray-400 cursor-pointer">TERMS OF OPERATION</span>
          <span>•</span>
          <span className="hover:text-gray-400 cursor-pointer">CYBERNETIC SECURITY STATUS: OK</span>
        </div>
      </footer>
    </div>
  );
}
