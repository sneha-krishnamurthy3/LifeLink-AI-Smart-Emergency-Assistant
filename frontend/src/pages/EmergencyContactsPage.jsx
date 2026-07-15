import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '@/context/EmergencyContext';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import {
  User,
  Phone,
  Mail,
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  ArrowUpDown,
  CheckCircle,
  AlertTriangle,
  Lock,
  ChevronDown,
  X,
  Star,
  Activity,
  Heart,
  Loader2,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' },
  }),
};

const RELATIONSHIPS = ['Family', 'Friend', 'Doctor', 'Neighbor', 'Colleague', 'Other'];

export default function EmergencyContactsPage() {
  const {
    emergencyContacts,
    addContact,
    removeContact,
    editContact,
    loadingContacts,
  } = useEmergency();

  // Search & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'name' | 'relationship'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Modal / Form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null); // null for add mode, contact object for edit mode

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState('1');
  const [isEmergencyContact, setIsEmergencyContact] = useState(true);

  // Validation errors
  const [formErrors, setFormErrors] = useState({});

  // Reset form fields
  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('Family');
    setEmail('');
    setPriority('1');
    setIsEmergencyContact(true);
    setFormErrors({});
    setEditingContact(null);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    if (emergencyContacts.length >= 10) {
      alert('You have reached the maximum limit of 10 emergency contacts.');
      return;
    }
    resetForm();
    setEditingContact(null);
    setShowFormModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setEmail(contact.email || '');
    setPriority(String(contact.priority || 1));
    setIsEmergencyContact(contact.is_emergency_contact !== false);
    setFormErrors({});
    setShowFormModal(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Full name is required.';
    
    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else {
      // Basic phone check: must contain only digits, optional leading +, spaces, dashes, parentheses
      const phoneRegex = /^\+?[\d\s\-()]{10,20}$/;
      if (!phoneRegex.test(phone.trim().replace(/\s/g, ''))) {
        errors.phone = 'Please enter a valid phone number (at least 10 digits).';
      }
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    const priorityNum = Number(priority);
    if (isNaN(priorityNum) || priorityNum < 1) {
      errors.priority = 'Priority must be a positive number.';
    }

    // Duplicate phone check
    const isDuplicate = emergencyContacts.some(
      (c) =>
        c.phone.trim().replace(/\D/g, '') === phone.trim().replace(/\D/g, '') &&
        (!editingContact || c.id !== editingContact.id)
    );
    if (isDuplicate) {
      errors.phone = 'A contact with this phone number already exists.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const contactData = {
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      email: email.trim() || null,
      priority: Number(priority),
      is_emergency_contact: isEmergencyContact,
    };

    if (editingContact) {
      await editContact({ ...contactData, id: editingContact.id });
    } else {
      await addContact(contactData);
    }

    setShowFormModal(false);
    resetForm();
  };

  // Handle Delete
  const handleDelete = (contactId) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      removeContact(contactId);
    }
  };

  // Toggle Sorting Order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Search & Filtered & Sorted contacts
  const processedContacts = useMemo(() => {
    let result = [...emergencyContacts];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.relationship.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    // 2. Sorting
    result.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';

      if (sortBy === 'priority') {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [emergencyContacts, searchQuery, sortBy, sortOrder]);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </div>
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Safety System</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Emergency Contacts
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Manage contacts displayed and reached during an SOS broadcast ({emergencyContacts.length}/10 saved)
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpenAddModal}
                disabled={emergencyContacts.length >= 10}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </motion.button>
            </div>
          </motion.div>

          {/* ── Controls: Search & Sort ─────────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2 items-center flex-wrap w-full md:w-auto justify-end">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2">Sort By</span>
              {[
                { field: 'priority', label: 'Priority' },
                { field: 'name', label: 'Name' },
                { field: 'relationship', label: 'Relation' },
              ].map((item) => (
                <button
                  key={item.field}
                  onClick={() => handleSort(item.field)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    sortBy === item.field
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {sortBy === item.field && (
                    <ArrowUpDown className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Contacts Listing ─────────────────────────────────────────── */}
          {loadingContacts ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading contacts...</p>
            </div>
          ) : processedContacts.length === 0 ? (
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="visible"
              className="bg-slate-900/50 border border-slate-800 p-10 rounded-3xl text-center"
            >
              <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-white text-base">No Contacts Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? "We couldn't find any contacts matching your search query. Try clearing the filter."
                  : "You haven't saved any emergency contacts yet. Add contacts to notify during an SOS crisis."}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleOpenAddModal}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Create Your First Contact
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedContacts.map((contact, idx) => (
                <motion.div
                  key={contact.id}
                  variants={fadeUp}
                  custom={idx + 2}
                  initial="hidden"
                  animate="visible"
                  className={`relative bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md flex justify-between gap-3 group transition-all hover:border-red-500/20`}
                >
                  <div className="space-y-3.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm truncate max-w-[150px]">
                        {contact.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 uppercase tracking-widest">
                        {contact.relationship}
                      </span>
                      {contact.is_emergency_contact && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-400 uppercase tracking-widest flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-red-500 text-red-500" />
                          SOS
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span className="tabular-nums">{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Activity className="w-3.5 h-3.5 text-slate-500" />
                        <span>Priority Level: <strong className="text-slate-200">{contact.priority}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    {/* Action buttons */}
                    <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(contact)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                        title="Edit contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 hover:border-red-900/30 transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Privacy Notice */}
          <motion.div
            variants={fadeUp}
            custom={6}
            initial="hidden"
            animate="visible"
            className="flex items-start gap-2.5 mt-8 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
            <span>
              Your emergency contacts are secured using Supabase Row Level Security.
              Only you can access, edit, or view these contacts.
            </span>
          </motion.div>

        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">
                  {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-slate-800/80 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all ${
                        formErrors.name ? 'border-red-500' : 'border-slate-800'
                      }`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-slate-800/80 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all ${
                        formErrors.phone ? 'border-red-500' : 'border-slate-800'
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                    Email Address <span className="text-slate-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="e.g. jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-slate-800/80 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all ${
                        formErrors.email ? 'border-red-500' : 'border-slate-800'
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Relationship */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                      Relationship
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full bg-slate-800/80 border border-slate-750 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all appearance-none cursor-pointer"
                      >
                        {RELATIONSHIPS.map((r) => (
                          <option key={r} value={r} className="bg-slate-900">
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                      Priority Level
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className={`w-full bg-slate-800/80 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all ${
                        formErrors.priority ? 'border-red-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.priority && (
                      <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formErrors.priority}
                      </p>
                    )}
                  </div>
                </div>

                {/* Emergency Toggle */}
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-800 rounded-2xl mt-2">
                  <input
                    type="checkbox"
                    id="is_emergency"
                    checked={isEmergencyContact}
                    onChange={(e) => setIsEmergencyContact(e.target.checked)}
                    className="w-4 h-4 rounded text-red-500 focus:ring-red-500 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="is_emergency" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    Use in SOS Emergency Broadcast notifications
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowFormModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-md shadow-red-600/10"
                  >
                    {editingContact ? 'Update Contact' : 'Add Contact'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
