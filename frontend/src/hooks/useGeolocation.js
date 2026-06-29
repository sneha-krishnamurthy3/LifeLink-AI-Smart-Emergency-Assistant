import { useState, useEffect } from 'react';

/**
 * Custom hook to get the user's current geolocation.
 * Uses the browser's Geolocation API with high accuracy.
 *
 * @returns {{ latitude: number|null, longitude: number|null, error: string|null, loading: boolean }}
 */
const useGeolocation = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    const onSuccess = (position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setError(null);
      setLoading(false);
    };

    const onError = (err) => {
      let message;
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = 'Location permission denied. Please enable location access in your browser settings.';
          break;
        case err.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable. Please try again.';
          break;
        case err.TIMEOUT:
          message = 'Location request timed out. Please try again.';
          break;
        default:
          message = `An unknown error occurred: ${err.message}`;
          break;
      }
      setError(message);
      setLoading(false);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, []);

  return { latitude, longitude, error, loading };
};

export default useGeolocation;
