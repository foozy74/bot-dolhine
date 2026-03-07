import { useState, useEffect, useCallback } from 'react';

export const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [schema, setSchema] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Fetch all settings
  const fetchSettings = useCallback(async (includeSecrets = false) => {
    try {
      const url = includeSecrets ? '/api/settings/?include_secrets=true' : '/api/settings/';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch settings schema
  const fetchSchema = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/schema/form');
      if (!response.ok) throw new Error('Failed to fetch schema');
      const data = await response.json();
      setSchema(data);
    } catch (err) {
      console.error('Failed to fetch schema:', err);
    }
  }, []);

  // Update a single setting
  const updateSetting = useCallback(async (key, value) => {
    setSaveStatus({ key, status: 'saving' });
    try {
      const response = await fetch(`/api/settings/key/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update setting');
      }
      
      const data = await response.json();
      setSaveStatus({ key, status: 'success', message: data.message });
      
      // Refresh settings
      await fetchSettings();
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
      
      return data;
    } catch (err) {
      setSaveStatus({ key, status: 'error', message: err.message });
      throw err;
    }
  }, [fetchSettings]);

  // Update multiple settings
  const updateSettingsBatch = useCallback(async (updates) => {
    setSaveStatus({ status: 'saving' });
    try {
      const response = await fetch('/api/settings/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update settings');
      }
      
      const data = await response.json();
      setSaveStatus({ status: 'success', results: data });
      
      // Refresh settings
      await fetchSettings();
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
      
      return data;
    } catch (err) {
      setSaveStatus({ status: 'error', message: err.message });
      throw err;
    }
  }, [fetchSettings]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!window.confirm('Bist du sicher? Alle Einstellungen werden auf Standardwerte zurückgesetzt.')) {
      return;
    }
    
    setSaveStatus({ status: 'resetting' });
    try {
      const response = await fetch('/api/settings/reset', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to reset settings');
      
      const data = await response.json();
      setSaveStatus({ status: 'success', results: data });
      
      // Refresh settings
      await fetchSettings();
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
      
      return data;
    } catch (err) {
      setSaveStatus({ status: 'error', message: err.message });
      throw err;
    }
  }, [fetchSettings]);

  // Initialize
  useEffect(() => {
    fetchSettings();
    fetchSchema();
  }, [fetchSettings, fetchSchema]);

  return {
    settings,
    schema,
    loading,
    error,
    saveStatus,
    fetchSettings,
    updateSetting,
    updateSettingsBatch,
    resetToDefaults,
  };
};

export default useSettings;
