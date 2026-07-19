/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Utensils, 
  Edit3, 
  Save, 
  X, 
  Coffee, 
  Sun, 
  Moon, 
  Pizza, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';
import { MessDayMenu, User } from '../types';

interface MessMenuPanelProps {
  user: User;
  initialMenu: MessDayMenu[];
  onUpdateMenu: (updatedMenu: MessDayMenu[]) => Promise<boolean>;
}

export default function MessMenuPanel({ user, initialMenu, onUpdateMenu }: MessMenuPanelProps) {
  const [menu, setMenu] = useState<MessDayMenu[]>(initialMenu);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  
  // Edit form states
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [snacks, setSnacks] = useState('');
  const [dinner, setDinner] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startEditing = (dayMenu: MessDayMenu) => {
    setEditingDay(dayMenu.day);
    setBreakfast(dayMenu.breakfast);
    setLunch(dayMenu.lunch);
    setSnacks(dayMenu.snacks);
    setDinner(dayMenu.dinner);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (day: string) => {
    setError(null);
    setSuccess(null);

    if (!breakfast || !lunch || !snacks || !dinner) {
      setError('All meals must have a designated menu item list.');
      return;
    }

    setLoading(true);
    try {
      const updatedMenu = menu.map((m) => {
        if (m.day === day) {
          return { day, breakfast, lunch, snacks, dinner };
        }
        return m;
      });

      const result = await onUpdateMenu(updatedMenu);
      if (result) {
        setMenu(updatedMenu);
        setEditingDay(null);
        setSuccess(`${day} food menu protocol committed and synced successfully.`);
      } else {
        setError('Failed to update food menu protocol on backend server.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during menu update.');
    } finally {
      setLoading(false);
    }
  };

  const isWarden = user.role === 'warden';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-400" />
            Weekly Mess Menu Layout
          </h2>
          <p className="text-gray-500 text-xs font-mono tracking-wide uppercase mt-1">
            {isWarden 
              ? 'WARDEN CONTROL: Modify nutritional blueprints for resident sectors.' 
              : 'STUDENT INTAKE: View weekly nutritional layouts for Boys Hostel 2.'
            }
          </p>
        </div>

        {isWarden && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 animate-pulse">
            ADMIN CRUD ACTIVE
          </span>
        )}
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

      {/* Grid of Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menu.map((dayMenu) => {
          const isEditing = editingDay === dayMenu.day;

          return (
            <motion.div
              key={dayMenu.day}
              layout
              className={`rounded-2xl glass-panel p-5 border relative overflow-hidden transition-all flex flex-col justify-between ${
                isEditing 
                  ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-gray-950/90' 
                  : 'border-gray-900 hover:border-gray-800'
              }`}
            >
              {/* Highlight bar */}
              <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${isEditing ? 'from-emerald-500 to-teal-400 animate-pulse' : 'from-gray-900 to-gray-800'}`} />

              <div className="space-y-4">
                {/* Card Title (Day) */}
                <div className="flex justify-between items-center border-b border-gray-900/60 pb-2.5">
                  <span className="font-display font-bold text-sm tracking-wide text-white uppercase">
                    {dayMenu.day}
                  </span>
                  {isWarden && !isEditing && (
                    <button
                      id={`edit-menu-btn-${dayMenu.day}`}
                      onClick={() => startEditing(dayMenu)}
                      className="p-1.5 rounded-lg bg-gray-900/80 hover:bg-emerald-950 hover:text-emerald-400 border border-gray-800 hover:border-emerald-500/30 text-gray-400 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  /* Warden Editing Interface */
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-amber-500" /> BREAKFAST
                      </label>
                      <input
                        id={`edit-breakfast-input-${dayMenu.day}`}
                        type="text"
                        value={breakfast}
                        onChange={(e) => setBreakfast(e.target.value)}
                        className="w-full bg-gray-950 border border-emerald-500/20 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-cyan-400" /> LUNCH
                      </label>
                      <input
                        id={`edit-lunch-input-${dayMenu.day}`}
                        type="text"
                        value={lunch}
                        onChange={(e) => setLunch(e.target.value)}
                        className="w-full bg-gray-950 border border-emerald-500/20 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                        <Pizza className="w-3 h-3 text-pink-400" /> TEA & SNACKS
                      </label>
                      <input
                        id={`edit-snacks-input-${dayMenu.day}`}
                        type="text"
                        value={snacks}
                        onChange={(e) => setSnacks(e.target.value)}
                        className="w-full bg-gray-950 border border-emerald-500/20 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                        <Moon className="w-3 h-3 text-purple-400" /> DINNER
                      </label>
                      <input
                        id={`edit-dinner-input-${dayMenu.day}`}
                        type="text"
                        value={dinner}
                        onChange={(e) => setDinner(e.target.value)}
                        className="w-full bg-gray-950 border border-emerald-500/20 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  /* Standard View Mode */
                  <div className="space-y-3 text-xs pt-1.5 font-mono">
                    <div className="flex gap-2.5">
                      <Coffee className="w-4 h-4 text-amber-500/80 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[9px] text-gray-600 font-mono tracking-wider">BREAKFAST</div>
                        <p className="text-gray-300 font-sans mt-0.5">{dayMenu.breakfast}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 border-t border-gray-950/50 pt-2.5">
                      <Sun className="w-4 h-4 text-cyan-400/80 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[9px] text-gray-600 font-mono tracking-wider">LUNCH</div>
                        <p className="text-gray-300 font-sans mt-0.5">{dayMenu.lunch}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 border-t border-gray-950/50 pt-2.5">
                      <Pizza className="w-4 h-4 text-pink-400/80 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[9px] text-gray-600 font-mono tracking-wider">TEA & SNACKS</div>
                        <p className="text-gray-300 font-sans mt-0.5">{dayMenu.snacks}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 border-t border-gray-950/50 pt-2.5">
                      <Moon className="w-4 h-4 text-purple-400/80 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[9px] text-gray-600 font-mono tracking-wider">DINNER</div>
                        <p className="text-gray-300 font-sans mt-0.5">{dayMenu.dinner}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 border-t border-gray-900 pt-4 mt-4">
                  <button
                    id={`cancel-menu-edit-btn-${dayMenu.day}`}
                    onClick={() => setEditingDay(null)}
                    disabled={loading}
                    className="flex-grow py-2 rounded-lg text-[10px] font-mono text-gray-400 hover:text-white bg-gray-900 border border-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> CANCEL
                  </button>
                  <button
                    id={`save-menu-edit-btn-${dayMenu.day}`}
                    onClick={() => handleSave(dayMenu.day)}
                    disabled={loading}
                    className="flex-grow py-2 rounded-lg text-[10px] font-mono text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-500/10 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> SAVE
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
