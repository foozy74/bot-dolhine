import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings.jsx';
import { 
  TrendingUp, 
  Key, 
  Bell, 
  Settings as SettingsIcon, 
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const categoryIcons = {
  trading: TrendingUp,
  api: Key,
  notifications: Bell,
  system: SettingsIcon,
};

const categoryLabels = {
  trading: '📊 Trading',
  api: '🔑 API',
  notifications: '🔔 Benachrichtigungen',
  system: '🖥️ System',
};

const SettingInput = ({ settingKey, config, value, onChange, onSave, saveStatus }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState(null);

  const validate = (val) => {
    if (config.type === 'float' || config.type === 'int') {
      const numVal = Number(val);
      if (isNaN(numVal)) {
        return 'Muss eine Zahl sein';
      }
      if (config.min !== undefined && numVal < config.min) {
        return `Minimum: ${config.min}`;
      }
      if (config.max !== undefined && numVal > config.max) {
        return `Maximum: ${config.max}`;
      }
    }
    return null;
  };

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    const error = validate(newValue);
    setValidationError(error);
    if (!error) {
      onChange(settingKey, newValue);
    }
  };

  const handleBlur = () => {
    // Removed auto-save on blur - now only tracks changes
  };

  const isSaving = saveStatus?.key === settingKey && saveStatus?.status === 'saving';
  const isSuccess = saveStatus?.key === settingKey && saveStatus?.status === 'success';
  const isError = saveStatus?.key === settingKey && saveStatus?.status === 'error';

  if (config.type === 'bool') {
    return (
      <label className="glass-toggle" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => {
            handleChange(e.target.checked);
          }}
        />
        <span className="glass-toggle-slider"></span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {value ? 'Aktiviert' : 'Deaktiviert'}
        </span>
        {isSaving && <Loader2 size={16} className="animate-pulse" />}
        {isSuccess && <CheckCircle size={16} style={{ color: 'var(--accent-success)' }} />}
        {isError && <AlertCircle size={16} style={{ color: 'var(--accent-danger)' }} />}
      </label>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type={config.is_secret && !showSecret ? 'password' : config.type === 'int' || config.type === 'float' ? 'number' : 'text'}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className="glass-input"
          style={{
            flex: 1,
            borderColor: validationError ? 'var(--accent-danger)' : undefined,
          }}
          placeholder={config.description}
          step={config.type === 'float' ? '0.01' : config.type === 'int' ? '1' : undefined}
          min={config.min}
          max={config.max}
        />
        {config.is_secret && (
          <button
            onClick={() => setShowSecret(!showSecret)}
            className="glass-button"
            style={{ padding: '0.5rem' }}
          >
            {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {isSaving && <Loader2 size={18} className="animate-pulse" />}
        {isSuccess && <CheckCircle size={18} style={{ color: 'var(--accent-success)' }} />}
        {isError && <AlertCircle size={18} style={{ color: 'var(--accent-danger)' }} />}
      </div>
      {validationError && (
        <p style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {validationError}
        </p>
      )}
      {(config.min !== undefined || config.max !== undefined) && config.type !== 'bool' && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Bereich: {config.min !== undefined ? config.min : '-∞'} bis {config.max !== undefined ? config.max : '∞'}
        </p>
      )}
    </div>
  );
};

const Settings = () => {
  const {
    settings,
    schema,
    loading,
    error,
    saveStatus,
    updateSetting,
    resetToDefaults,
  } = useSettings();

  const [activeCategory, setActiveCategory] = useState('trading');
  const [pendingChanges, setPendingChanges] = useState({});
  const [saveMessage, setSaveMessage] = useState(null);

  const handleSettingChange = (key, value) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = async (key, value) => {
    try {
      await updateSetting(key, value);
      setPendingChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[key];
        return newChanges;
      });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  if (loading && Object.keys(settings).length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <Loader2 size={48} className="animate-pulse" style={{ margin: '0 auto 1rem' }} />
          <p className="text-secondary">Lade Einstellungen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={48} style={{ color: 'var(--accent-danger)', marginBottom: '1rem' }} />
        <h2>Fehler beim Laden</h2>
        <p className="text-secondary">{error}</p>
      </div>
    );
  }

  const currentCategorySettings = settings[activeCategory] || {};
  const currentCategorySchema = schema[activeCategory] || {};

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>⚙️ Einstellungen</h1>
          <p className="text-secondary">Konfiguriere den Trading Bot nach deinen Bedürfnissen</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {hasPendingChanges && (
            <button
              onClick={async () => {
                setSaveMessage(null);
                try {
                  const savePromises = Object.entries(pendingChanges).map(([key, value]) => 
                    handleSaveSetting(key, value)
                  );
                  await Promise.all(savePromises);
                  setSaveMessage({ type: 'success', text: 'Alle Einstellungen wurden erfolgreich gespeichert!' });
                  setTimeout(() => setSaveMessage(null), 5000);
                } catch (error) {
                  setSaveMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen!' });
                  setTimeout(() => setSaveMessage(null), 5000);
                }
              }}
              className="glass-button primary"
              disabled={saveStatus?.status === 'saving'}
            >
              <Save size={18} style={{ marginRight: '0.5rem' }} />
              {saveStatus?.status === 'saving' ? 'Speichere...' : `${Object.keys(pendingChanges).length} Änderungen speichern`}
            </button>
          )}
          <button
            onClick={resetToDefaults}
            className="glass-button danger"
            disabled={saveStatus?.status === 'resetting'}
          >
            <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
            {saveStatus?.status === 'resetting' ? 'Setze zurück...' : 'Auf Standard zurücksetzen'}
          </button>
        </div>
      </div>

      {saveStatus?.status === 'success' && !saveStatus?.key && (
        <div 
          className="glass-card" 
          style={{ 
            marginBottom: '1rem', 
            borderColor: 'var(--accent-success)',
            background: 'rgba(34, 197, 94, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)' }}>
            <CheckCircle size={20} />
            <span>Einstellungen erfolgreich zurückgesetzt!</span>
          </div>
        </div>
      )}

      {saveMessage && (
        <div 
          className="glass-card animate-fade-in" 
          style={{ 
            marginBottom: '1rem', 
            borderColor: saveMessage.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
            background: saveMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: saveMessage.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
            {saveMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{saveMessage.text}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Category Sidebar */}
        <div className="glass-card" style={{ padding: '1rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Kategorien
          </h3>
          {Object.keys(categoryLabels).map((category) => {
            const Icon = categoryIcons[category];
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: activeCategory === category ? 'var(--bg-glass)' : 'transparent',
                  border: activeCategory === category ? '1px solid var(--border-glass)' : '1px solid transparent',
                  color: activeCategory === category ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: '0.875rem' }}>{categoryLabels[category]}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div>
          <div className="glass-card">
            <h2 style={{ marginBottom: '1.5rem' }}>{categoryLabels[activeCategory]}</h2>
            
            {Object.entries(currentCategorySettings).map(([key, setting]) => {
              const schemaConfig = currentCategorySchema[key] || {};
              return (
                <div 
                  key={key} 
                  style={{ 
                    marginBottom: '1.5rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid var(--border-glass)'
                  }}
                >
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label 
                      style={{ 
                        fontWeight: 500, 
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {schemaConfig.is_secret && (
                        <span 
                          style={{ 
                            fontSize: '0.625rem', 
                            padding: '0.125rem 0.375rem',
                            background: 'var(--accent-warning)',
                            color: 'var(--bg-primary)',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          SECRET
                        </span>
                      )}
                    </label>
                    {schemaConfig.description && (
                      <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {schemaConfig.description}
                      </p>
                    )}
                  </div>
                <SettingInput
                  settingKey={key}
                  value={pendingChanges[key] !== undefined ? pendingChanges[key] : setting.value}
                  onChange={handleSettingChange}
                  onSave={handleSaveSetting}
                  config={schemaConfig}
                  saveStatus={saveStatus}
                  hasChanges={pendingChanges[key] !== undefined}
                />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
