import React, { createContext, useContext, useState, useCallback } from 'react';
import useGeolocation from '../hooks/useGeolocation';

const EmergencyContext = createContext(null);

const DEFAULT_CONTACTS = [
  {
    id: 'default-family',
    name: 'Family Member',
    phone: '+91-9876543210',
    relationship: 'Family',
  },
  {
    id: 'default-friend',
    name: 'Close Friend',
    phone: '+91-9123456789',
    relationship: 'Friend',
  },
  {
    id: 'default-doctor',
    name: 'Dr. Sharma',
    phone: '+91-9988776655',
    relationship: 'Doctor',
  },
];

/**
 * EmergencyProvider — wraps the app with emergency state management.
 * Provides emergency contacts, user location, and SOS trigger controls.
 */
export const EmergencyProvider = ({ children }) => {
  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    try {
      const stored = localStorage.getItem('lifelink_contacts');
      return stored ? JSON.parse(stored) : DEFAULT_CONTACTS;
    } catch (e) {
      console.warn('[EmergencyContext] LocalStorage read failed:', e);
      return DEFAULT_CONTACTS;
    }
  });
  const [sosActive, setSosActive] = useState(false);

  const userLocation = useGeolocation();

  const addContact = useCallback((contact) => {
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
  }, []);

  const removeContact = useCallback((contactId) => {
    setEmergencyContacts((prev) => {
      const next = prev.filter((contact) => contact.id !== contactId);
      try {
        localStorage.setItem('lifelink_contacts', JSON.stringify(next));
      } catch (e) {
        console.warn('[EmergencyContext] LocalStorage write failed:', e);
      }
      return next;
    });
  }, []);

  const editContact = useCallback((updatedContact) => {
    setEmergencyContacts((prev) => {
      const next = prev.map((c) => (c.id === updatedContact.id ? updatedContact : c));
      try {
        localStorage.setItem('lifelink_contacts', JSON.stringify(next));
      } catch (e) {
        console.warn('[EmergencyContext] LocalStorage write failed:', e);
      }
      return next;
    });
  }, []);

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
