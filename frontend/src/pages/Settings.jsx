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
  Loader2,
  ChevronRight,
  Shield,
  Cpu
} from 'lucide-react';

const categoryIcons = {
  trading: TrendingUp,
  api: Key,
  notifications: Bell,
  system: SettingsIcon,
};

const categoryLabels = {
  trading: 'TRADING_PARAMS',
  api: 'AUTHENTICATION_KEYS',
  notifications: 'ALERT_SYSTEM',
  system: 'CORE_ENGINE',
};

const SettingInput = ({ settingKey, config, value, onChange, onSave, saveStatus }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState(null);

  const validate = (val) => {
    if (config.type === 'float' || config.type === 'int') {
      const numVal = Number(val);
      if (isNaN(numVal)) {
        return 'MUST_BE_NUMERIC';
      }
      if (config.min !== undefined && numVal < config.min) {
        return `MIN_VAL: ${config.min}`;
      }
      if (config.max !== undefined && numVal > config.max) {
        return `MAX_VAL: ${config.max}`;
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

  const isSaving = saveStatus?.key === settingKey && saveStatus?.status === 'saving';
  const isSuccess = saveStatus?.key === settingKey && saveStatus?.status === 'success';
  const isError = saveStatus?.key === settingKey && saveStatus?.status === 'error';

  if (config.type === 'bool') {
    return (
      <div className="flex items-center justify-between p-md rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-sm">
          <span className="font-mono text-[11px] text-dim uppercase">
            {value ? 'STATE_ACTIVE' : 'STATE_DISABLED'}
          </span>
          {isSaving && <Loader2 size={14} className="animate-spin text-teal" />}
          {isSuccess && <CheckCircle size={14} className="text-teal" />}
          {isError && <AlertCircle size={14} className="text-red-400" />}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={value}
            onChange={(e) => handleChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
        </label>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-xs">
      <div className="flex items-center gap-sm">
        <div className="relative flex-1">
          <input
            type={config.is_secret && !showSecret ? 'password' : config.type === 'int' || config.type === 'float' ? 'number' : 'text'}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={`glass-input font-mono text-sm ${validationError ? 'border-red-400' : ''}`}
            style={{ 
              borderColor: validationError ? '#ef4444' : undefined,
              paddingRight: config.is_secret ? '45px' : '16px'
            }}
            placeholder={config.description}
            step={config.type === 'float' ? '0.01' : config.type === 'int' ? '1' : undefined}
            min={config.min}
            max={config.max}
          />
          {config.is_secret && (
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-main transition-colors"
              type="button"
            >
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {(isSaving || isSuccess || isError) && (
          <div className="flex items-center justify-center w-8">
            {isSaving && <Loader2 size={16} className="animate-spin text-teal" />}
            {isSuccess && <CheckCircle size={16} className="text-teal" />}
            {isError && <AlertCircle size={16} className="text-red-400" />}
          </div>
        )}
      </div>
      {validationError && (
        <p className="text-red-400 font-mono text-[9px] uppercase tracking-wider px-sm">
          {validationError}
        </p>
      )}
      {(config.min !== undefined || config.max !== undefined) && config.type !== 'bool' && (
        <p className="text-faint font-mono text-[9px] uppercase tracking-wider px-sm">
          VALID_RANGE: [{config.min !== undefined ? config.min : '-INF'}, {config.max !== undefined ? config.max : 'INF'}]
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-teal opacity-20 mb-md" />
        <p className="font-mono text-xs tracking-widest text-faint">FETCHING_CONFIGURATION...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="terminal-box text-center py-20" data-title="SYSTEM_ERROR">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-md" />
        <h2 className="text-xl font-bold mb-xs">INITIALIZATION_FAILURE</h2>
        <p className="text-faint font-mono text-xs uppercase">{error}</p>
      </div>
    );
  }

  const currentCategorySettings = settings[activeCategory] || {};
  const currentCategorySchema = schema[activeCategory] || {};

  return (
    <div className="flex flex-col gap-xl">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-md">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-xs">CORE_CONFIG_MANIFEST</h2>
          <div className="flex items-center gap-md font-mono text-[11px] text-faint uppercase">
            <span className="flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-blue" />
              ENV_PRODUCTION
            </span>
            <span>•</span>
            <span className="text-teal">LOCAL_STORAGE_SYNCED</span>
          </div>
        </div>

        <div className="flex items-center gap-sm">
          {hasPendingChanges && (
            <button
              onClick={async () => {
                setSaveMessage(null);
                try {
                  const savePromises = Object.entries(pendingChanges).map(([key, value]) => 
                    handleSaveSetting(key, value)
                  );
                  await Promise.all(savePromises);
                  setSaveMessage({ type: 'success', text: 'MANIFEST_UPDATED_SUCCESSFULLY' });
                  setTimeout(() => setSaveMessage(null), 5000);
                } catch (error) {
                  setSaveMessage({ type: 'error', text: 'SAVE_SEQUENCE_ABORTED' });
                  setTimeout(() => setSaveMessage(null), 5000);
                }
              }}
              className="btn btn-primary"
              disabled={saveStatus?.status === 'saving'}
            >
              <Save size={16} />
              {saveStatus?.status === 'saving' ? 'WRITING...' : `COMMIT_${Object.keys(pendingChanges).length}_CHANGES`}
            </button>
          )}
          <button
            onClick={resetToDefaults}
            className="btn btn-outline"
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
            disabled={saveStatus?.status === 'resetting'}
          >
            <RefreshCw size={16} className={saveStatus?.status === 'resetting' ? 'animate-spin' : ''} />
            RESET_DEFAULTS
          </button>
        </div>
      </section>

      {saveMessage && (
        <div className={`terminal-box animate-fade-in ${saveMessage.type === 'success' ? 'border-teal/30' : 'border-red-400/30'}`} data-title="NOTIFICATION" style={{ padding: '16px' }}>
          <div className={`flex items-center gap-md font-mono text-xs ${saveMessage.type === 'success' ? 'text-teal' : 'text-red-400'}`}>
            {saveMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {saveMessage.text}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }} className="flex-col lg:grid">
        {/* Category Navigation */}
        <div className="terminal-box h-fit" data-title="SYSTEM_MODULES" style={{ padding: '12px' }}>
          <div className="flex flex-col gap-xs">
            {Object.keys(categoryLabels).map((category) => {
              const Icon = categoryIcons[category];
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    flex items-center justify-between px-md py-sm rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-teal/10 text-teal border border-teal/20' 
                      : 'text-dim hover:text-main hover:bg-white/5 border border-transparent'}
                  `}
                  style={{
                    background: isActive ? 'rgba(125, 211, 192, 0.08)' : 'transparent',
                    borderColor: isActive ? 'rgba(125, 211, 192, 0.2)' : 'transparent',
                    color: isActive ? 'var(--teal)' : 'var(--text-dim)',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <div className="flex items-center gap-md">
                    <Icon size={18} />
                    <span className="font-mono text-[11px] font-bold tracking-wider">{categoryLabels[category]}</span>
                  </div>
                  <ChevronRight size={14} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Form */}
        <div className="terminal-box" data-title={categoryLabels[activeCategory]}>
          <div className="flex flex-col gap-lg py-md">
            {Object.entries(currentCategorySettings).map(([key, setting]) => {
              const schemaConfig = currentCategorySchema[key] || {};
              const label = key.replace(/_/g, ' ').toUpperCase();
              return (
                <div 
                  key={key} 
                  className="flex flex-col gap-md pb-lg border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center gap-sm">
                      <span className="font-mono text-xs font-bold text-main tracking-wide">{label}</span>
                      {schemaConfig.is_secret && (
                        <div className="badge badge-purple flex items-center gap-xs" style={{ fontSize: '8px' }}>
                          <Shield size={10} /> ENCRYPTED_STORAGE
                        </div>
                      )}
                    </div>
                    {schemaConfig.description && (
                      <p className="text-faint font-mono text-[10px] leading-relaxed uppercase">
                        // {schemaConfig.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="max-w-xl">
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
