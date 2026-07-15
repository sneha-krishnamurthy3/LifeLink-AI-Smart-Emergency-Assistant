import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { useAuth } from './AuthContext';
import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../services/EmergencyContactsService';

const EmergencyContext = createContext(null);

const DEFAULT_CONTACTS = [
  {
    id: 'default-family',
    name: 'Family Member',
    phone: '+91-9876543210',
    relationship: 'Family',
    email: '',
    priority: 1,
    is_emergency_contact: true,
  },
  {
    id: 'default-friend',
    name: 'Close Friend',
    phone: '+91-9123456789',
    relationship: 'Friend',
    email: '',
    priority: 2,
    is_emergency_contact: true,
  },
  {
    id: 'default-doctor',
    name: 'Dr. Sharma',
    phone: '+91-9988776655',
    relationship: 'Doctor',
    email: '',
    priority: 3,
    is_emergency_contact: true,
  },
];

/**
 * EmergencyProvider — wraps the app with emergency state management.
 * Provides emergency contacts, user location, and SOS trigger controls.
 */
export const EmergencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [sosActive, setSosActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const userLocation = useGeolocation();

  const loadContacts = useCallback(async () => {
    if (user) {
      setLoading(true);
      const { data, error } = await getEmergencyContacts();
      if (!error) {
        // Map database fields to frontend structure
        const formatted = data.map((c) => ({
          id: c.id,
          name: c.full_name,
          phone: c.phone,
          relationship: c.relationship,
          email: c.email || '',
          priority: c.priority,
          is_emergency_contact: c.is_emergency_contact,
        }));
        setEmergencyContacts(formatted);
      }
      setLoading(false);
    } else {
      try {
        const stored = localStorage.getItem('lifelink_contacts');
        setEmergencyContacts(stored ? JSON.parse(stored) : DEFAULT_CONTACTS);
      } catch (e) {
        console.warn('[EmergencyContext] LocalStorage read failed:', e);
        setEmergencyContacts(DEFAULT_CONTACTS);
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const addContact = useCallback(async (contact) => {
    if (emergencyContacts.length >= 10) {
      alert('Maximum limit of 10 emergency contacts reached.');
      return;
    }

    if (user) {
      const dbPayload = {
        full_name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        email: contact.email || null,
        priority: contact.priority || 1,
        is_emergency_contact: contact.is_emergency_contact !== false,
      };

      const { data, error } = await addEmergencyContact(dbPayload);
      if (error) {
        alert(error);
        return;
      }
      await loadContacts();
    } else {
      const newContact = {
        ...contact,
        id: contact.id || `contact-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };
      setEmergencyContacts((prev) => {
        const next = [...prev, newContact];
        try {
          localStorage.setItem('lifelink_contacts', JSON.stringify(next));
        } catch (e) {
          console.warn('[EmergencyContext] LocalStorage write failed:', e);
        }
        return next;
      });
    }
  }, [user, loadContacts, emergencyContacts]);

  const removeContact = useCallback(async (contactId) => {
    if (user) {
      const { error } = await deleteEmergencyContact(contactId);
      if (error) {
        alert(error);
        return;
      }
      await loadContacts();
    } else {
      setEmergencyContacts((prev) => {
        const next = prev.filter((contact) => contact.id !== contactId);
        try {
          localStorage.setItem('lifelink_contacts', JSON.stringify(next));
        } catch (e) {
          console.warn('[EmergencyContext] LocalStorage write failed:', e);
        }
        return next;
      });
    }
  }, [user, loadContacts]);

  const editContact = useCallback(async (updatedContact) => {
    if (user) {
      const dbPayload = {
        id: updatedContact.id,
        full_name: updatedContact.name,
        relationship: updatedContact.relationship,
        phone: updatedContact.phone,
        email: updatedContact.email || null,
        priority: updatedContact.priority || 1,
        is_emergency_contact: updatedContact.is_emergency_contact !== false,
      };

      const { error } = await updateEmergencyContact(dbPayload);
      if (error) {
        alert(error);
        return;
      }
      await loadContacts();
    } else {
      setEmergencyContacts((prev) => {
        const next = prev.map((c) => (c.id === updatedContact.id ? updatedContact : c));
        try {
          localStorage.setItem('lifelink_contacts', JSON.stringify(next));
        } catch (e) {
          console.warn('[EmergencyContext] LocalStorage write failed:', e);
        }
        return next;
      });
    }
  }, [user, loadContacts]);

  const triggerSOS = useCallback(() => {
    setSosActive(true);
    console.warn('[LifeLink SOS] Emergency SOS activated!', {
      timestamp: new Date().toISOString(),
      location: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
    });
  }, [userLocation.latitude, userLocation.longitude]);

  const clearSOS = useCallback(() => {
    setSosActive(false);
    console.info('[LifeLink SOS] Emergency SOS deactivated.');
  }, []);

  const value = {
    emergencyContacts,
    userLocation,
    sosActive,
    triggerSOS,
    clearSOS,
    addContact,
    removeContact,
    editContact,
    loadingContacts: loading,
    reloadContacts: loadProfile => loadContacts(),
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
};

/**
 * Custom hook to consume the EmergencyContext.
 * Must be used within an EmergencyProvider.
 */
export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an <EmergencyProvider>.');
  }
  return context;
};

export default EmergencyContext;
