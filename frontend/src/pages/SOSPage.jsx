import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useEmergency } from '@/context/EmergencyContext';
import { useLocation as useAppLocation } from '@/context/LocationContext';

export default function SOSPage() {
  const {
    emergencyContacts,
    sosActive,
    triggerSOS,
    clearSOS,
    addContact,
    removeContact,
    editContact,
  } = useEmergency();

  const { coordinates, address } = useAppLocation();

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');

  // Contact editing states
  const [editingContactId, setEditingContactId] = useState(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactRelation, setEditContactRelation] = useState('Family');

  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    addContact({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelation,
    });

    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('Family');
    setShowAddContact(false);
  };

  const handleEditContactSubmit = (e, contactId) => {
    e.preventDefault();
    if (!editContactName.trim() || !editContactPhone.trim()) return;

    editContact({
      id: contactId,
      name: editContactName.trim(),
      phone: editContactPhone.trim(),
      relationship: editContactRelation,
    });

    setEditingContactId(null);
  };

  const activeLat = coordinates?.lat;
  const activeLng = coordinates?.lng;

  const formatLocation = () => {
    if (activeLat && activeLng) {
      return `Lat: ${activeLat.toFixed(6)}, Lng: ${activeLng.toFixed(6)}`;
    }
    return 'Location not detected / Resolving GPS...';
  };

  const smsText = `I need immediate medical assistance. My current location is: ${address || 'Unknown Address'}. Coordinates: ${activeLat?.toFixed(6) || 'N/A'}, ${activeLng?.toFixed(6) || 'N/A'}. Maps Link: https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLng}`;

  const handleCopySMS = () => {
    navigator.clipboard.writeText(smsText);
    alert('Emergency SMS copied to clipboard!');
  };

  return (
    <Layout>
      <div className={`min-h-[85vh] transition-colors duration-700 ${sosActive ? 'bg-red-955 text-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-white'}`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          
          <AnimatePresence mode="wait">
            {!sosActive ? (
              // Pre-SOS Screen
              <motion.div
                key="pre-sos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center space-y-12"
              >
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    One-Touch <span className="text-red-500">SOS Alert</span>
                  </h1>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Pressing the button below will immediately trigger an emergency status, notify your emergency contacts, and display your exact location.
                  </p>
                </div>

                {/* Pulsing SOS Button */}
                <div className="relative flex items-center justify-center w-72 h-72">
                  {/* Expanding pulse rings */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full bg-red-500"
                      initial={{ opacity: 0.6, scale: 0.8 }}
                      animate={{
                        opacity: 0,
                        scale: [0.8, 1.8],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                  
                  {/* Actual Button */}
                  <motion.button
                    onClick={triggerSOS}
                    className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl flex flex-col items-center justify-center border-8 border-white dark:border-slate-800 hover:from-red-600 hover:to-rose-700 transition-all focus:outline-none cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-4xl font-black text-white tracking-widest animate-pulse">
                      SOS
                    </span>
                    <span className="text-xs font-bold text-red-100 uppercase tracking-widest mt-1">
                      Press to Trigger
                    </span>
                  </motion.button>
                </div>

                {/* Location Status */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800 max-w-md w-full">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-red-500 animate-bounce" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Your Active GPS Location</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate">{address || formatLocation()}</p>
                  </div>
                </div>

                {/* Contacts Config Section */}
                <div className="w-full text-left space-y-6 pt-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Contacts</h2>
                      <p className="text-sm text-gray-500 dark:text-slate-400">These people will be immediately displayed upon triggering SOS</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddContact(!showAddContact)}
                      icon={showAddContact ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    >
                      {showAddContact ? 'Cancel' : 'Add Contact'}
                    </Button>
                  </div>

                  {/* Add Contact Form */}
                  <AnimatePresence>
                    {showAddContact && (
                      <motion.form
                        onSubmit={handleAddContactSubmit}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Name</label>
                            <input
                              type="text"
                              required
                              value={newContactName}
                              onChange={(e) => setNewContactName(e.target.value)}
                              placeholder="Full Name"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                            <input
                              type="tel"
                              required
                              value={newContactPhone}
                              onChange={(e) => setNewContactPhone(e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Relationship</label>
                            <select
                              value={newContactRelation}
                              onChange={(e) => setNewContactRelation(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 dark:text-white"
                            >
                              <option>Family</option>
                              <option>Friend</option>
                              <option>Doctor</option>
                              <option>Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="primary" type="submit" size="sm">
                            Save Contact
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Contacts List */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {emergencyContacts.length === 0 ? (
                      <div className="col-span-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-8 rounded-3xl text-center shadow-sm">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="font-bold text-amber-800 dark:text-amber-450">No emergency contacts found</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 max-w-sm mx-auto">
                          Please add emergency contacts.
                        </p>
                      </div>
                    ) : (
                      emergencyContacts.map((contact) => {
                        const isEditing = editingContactId === contact.id;
                        if (isEditing) {
                          return (
                            <form
                              key={contact.id}
                              onSubmit={(e) => handleEditContactSubmit(e, contact.id)}
                              className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-md border border-blue-200 dark:border-blue-800 space-y-3 text-left"
                            >
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label>
                                <input
                                  type="text"
                                  required
                                  value={editContactName}
                                  onChange={(e) => setEditContactName(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 text-xs dark:bg-slate-800 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                                <input
                                  type="tel"
                                  required
                                  value={editContactPhone}
                                  onChange={(e) => setEditContactPhone(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 text-xs dark:bg-slate-800 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Relationship</label>
                                <select
                                  value={editContactRelation}
                                  onChange={(e) => setEditContactRelation(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 text-xs dark:bg-slate-800 dark:text-white bg-white"
                                >
                                  <option>Family</option>
                                  <option>Friend</option>
                                  <option>Doctor</option>
                                  <option>Other</option>
                                </select>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingContactId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  type="submit"
                                >
                                  Save
                                </Button>
                              </div>
                            </form>
                          );
                        }

                        return (
                          <div key={contact.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-150 dark:border-slate-800 flex items-center justify-between group">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{contact.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">{contact.relationship}</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{contact.phone}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingContactId(contact.id);
                                  setEditContactName(contact.name);
                                  setEditContactPhone(contact.phone);
                                  setEditContactRelation(contact.relationship);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                title="Edit Contact"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => removeContact(contact.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Delete Contact"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              // Active SOS Screen
              <motion.div
                key="active-sos"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                {/* Alarm heartbeat icon */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center border-4 border-red-500"
                >
                  <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                </motion.div>

                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-red-400">
                    EMERGENCY ALERT ACTIVE
                  </h1>
                  <p className="mt-3 text-red-200 max-w-md mx-auto">
                    An SOS alert has been activated. Your emergency details, GPS location, and SMS notification have been generated.
                  </p>
                </div>

                {/* SOS Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left">
                  <div className="bg-red-900/40 p-5 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-red-400" />
                      <h4 className="font-bold text-red-300">Activated Time</h4>
                    </div>
                    <p className="text-base font-semibold text-white">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="bg-red-900/40 p-5 rounded-2xl border border-red-500/20 backdrop-blur-sm sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-red-400" />
                        <h4 className="font-bold text-red-300">Emergency Address</h4>
                      </div>
                      {activeLat && activeLng && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-900/50 px-2 py-1 rounded"
                        >
                          Google Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-white leading-relaxed font-semibold">
                      {address || `${formatLocation()}`}
                    </p>
                  </div>
                </div>

                {/* SMS Broadcast Box */}
                <div className="bg-red-900/30 p-6 rounded-3xl border border-red-500/20 backdrop-blur-sm w-full max-w-3xl text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">Emergency Broadcast Text</h3>
                    <button
                      onClick={handleCopySMS}
                      className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 bg-red-950 px-3 py-1.5 rounded-lg border border-red-500/10 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy SMS Text
                    </button>
                  </div>
                  <div className="bg-red-950/70 p-4 rounded-xl border border-red-500/10 text-xs font-semibold text-red-200 leading-relaxed font-mono select-all">
                    {smsText}
                  </div>
                </div>

                {/* Emergency Contact Broadcast */}
                <div className="bg-red-900/30 p-6 sm:p-8 rounded-3xl border border-red-500/20 backdrop-blur-sm w-full max-w-3xl text-left space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-red-500/20">
                    <CheckCircle className="w-6 h-6 text-green-400" strokeWidth={3} />
                    <div>
                      <h3 className="font-bold text-lg text-white">Contacts Notified</h3>
                      <p className="text-xs text-red-300">Call immediately from details below:</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {emergencyContacts.length === 0 ? (
                      <div className="col-span-full bg-red-950/40 p-6 rounded-2xl border border-red-500/20 text-center">
                        <p className="text-sm font-semibold text-red-200">No emergency contacts found.</p>
                        <p className="text-xs text-red-300 mt-1">Please add emergency contacts.</p>
                      </div>
                    ) : (
                      emergencyContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between bg-red-955/50 p-4 rounded-xl border border-red-500/10">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{contact.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-red-500/20 text-red-300 uppercase tracking-wider">{contact.relationship}</span>
                            </div>
                            <p className="text-xs text-red-200 mt-1">{contact.phone}</p>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                          >
                            <Phone className="w-4 h-4 text-white" />
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Direct Dial Emergency Lines */}
                <div className="w-full max-w-3xl text-left space-y-4">
                  <h3 className="font-bold text-lg text-red-350">National Emergency Services</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'National Helpline', num: '112', desc: 'All Emergency Services' },
                      { name: 'Ambulance', num: '108', desc: 'Medical Emergency' },
                      { name: 'Women / Child', num: '102', desc: 'Helpline' },
                    ].map((serv) => (
                      <a
                        key={serv.num}
                        href={`tel:${serv.num}`}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 p-4 rounded-2xl text-center block transition-all"
                      >
                        <span className="block text-2xl font-black text-white">{serv.num}</span>
                        <span className="block text-xs font-bold text-red-300 uppercase tracking-widest mt-1">{serv.name}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Cancel SOS */}
                <div className="pt-6">
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={clearSOS}
                    icon={<X className="w-5 h-5" />}
                  >
                    Cancel Emergency SOS
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </Layout>
  );
}
