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
  Send,
  HelpCircle
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
      <div 
        className="flex items-center justify-between p-3 rounded-xl"
        style={{
          backgroundColor: 'var(--surface-muted)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div className="flex items-center gap-2">
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
            checked={Boolean(value)}
            onChange={(e) => handleChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
        </label>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={config.is_secret && !showSecret ? 'password' : config.type === 'int' || config.type === 'float' ? 'number' : 'text'}
            value={localValue !== undefined ? localValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`glass-input font-mono ${validationError ? 'border-red-400' : ''}`}
            style={{ 
              borderColor: validationError ? '#ef4444' : undefined,
              paddingRight: config.is_secret ? '45px' : '16px'
            }}
            placeholder={config.description || ''}
            step={config.type === 'float' ? '0.01' : config.type === 'int' ? '1' : undefined}
            min={config.min}
            max={config.max}
          />
          {config.is_secret && (
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-white transition-colors"
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
        <p className="text-red-400 font-mono text-[9px] uppercase tracking-wider px-1">
          {validationError}
        </p>
      )}
      {(config.min !== undefined || config.max !== undefined) && config.type !== 'bool' && (
        <p className="text-faint font-mono text-[9px] uppercase tracking-wider px-1">
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
  
  // Telegram Test State
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [testResult, setTestResult] = useState(null);

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
      // Error handled by hook
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/settings/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_token: pendingChanges['telegram_bot_token'] || undefined,
          chat_id: pendingChanges['telegram_chat_id'] || undefined,
        })
      });
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({
        ok: false,
        message: 'Verbindungsfehler zur API',
        details: err.message
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  if (loading && Object.keys(settings).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-teal opacity-30 mb-3" />
        <p className="font-mono text-xs tracking-widest text-faint">FETCHING_CONFIGURATION...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="terminal-box text-center py-16" data-title="SYSTEM_ERROR">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold mb-1">INITIALIZATION_FAILURE</h2>
        <p className="text-faint font-mono text-xs uppercase mb-5">{error}</p>
        <button
          onClick={() => {
            fetchSettings();
            fetchSchema();
          }}
          className="px-4 py-2 rounded-lg bg-teal/20 hover:bg-teal/30 text-teal text-xs font-mono font-semibold border border-teal/40 transition-colors"
        >
          RETRY_CONNECTION
        </button>
      </div>
    );
  }

  const currentCategorySettings = settings[activeCategory] || {};
  const currentCategorySchema = schema[activeCategory] || {};

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white mb-1">
            CORE_CONFIG <span className="gradient-text">MANIFEST</span>
          </h2>
          <div className="flex items-center gap-3 font-mono text-[11px] text-faint uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue" />
              ENV_PRODUCTION
            </span>
            <span>•</span>
            <span className="text-teal">SQLITE_ENCRYPTED_STORE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasPendingChanges && (
            <button
              onClick={async () => {
                setSaveMessage(null);
                try {
                  const savePromises = Object.entries(pendingChanges).map(([key, value]) => 
                    handleSaveSetting(key, value)
                  );
                  await Promise.all(savePromises);
                  setSaveMessage({ type: 'success', text: 'KONFIGURATION ERFOLGREICH GESPEICHERT' });
                  setTimeout(() => setSaveMessage(null), 5000);
                } catch (error) {
                  setSaveMessage({ type: 'error', text: 'FEHLER BEIM SPEICHERN DER PARAMETER' });
                  setTimeout(() => setSaveMessage(null), 5000);
                }
              }}
              className="btn btn-primary"
              disabled={saveStatus?.status === 'saving'}
            >
              <Save size={15} />
              {saveStatus?.status === 'saving' ? 'WRITING...' : `COMMIT_${Object.keys(pendingChanges).length}_CHANGES`}
            </button>
          )}
          <button
            onClick={resetToDefaults}
            className="btn btn-outline"
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
            disabled={saveStatus?.status === 'resetting'}
          >
            <RefreshCw size={15} className={saveStatus?.status === 'resetting' ? 'animate-spin' : ''} />
            RESET_DEFAULTS
          </button>
        </div>
      </section>

      {saveMessage && (
        <div 
          className="p-3 rounded-xl font-mono text-xs flex items-center gap-2 animate-fade-in"
          style={{
            backgroundColor: saveMessage.type === 'success' ? 'rgba(125, 211, 192, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${saveMessage.type === 'success' ? 'rgba(125, 211, 192, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: saveMessage.type === 'success' ? 'var(--teal)' : '#ef4444',
          }}
        >
          {saveMessage.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {saveMessage.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Category Navigation Panel */}
        <div className="terminal-box h-fit" data-title="SYSTEM_MODULES" style={{ padding: '12px' }}>
          <div className="flex flex-col gap-1.5">
            {Object.keys(categoryLabels).map((category) => {
              const Icon = categoryIcons[category];
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? 'rgba(125, 211, 192, 0.12)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(125, 211, 192, 0.3)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-dim)',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-teal' : ''} />
                    <span className="font-mono text-xs font-bold tracking-wider">{categoryLabels[category]}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: isActive ? 1 : 0.3 }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Form Panel */}
        <div className="terminal-box" data-title={categoryLabels[activeCategory]}>
          <div className="flex flex-col gap-5 pt-3">
            {/* Telegram Notification Guidance & Test Section */}
            {activeCategory === 'notifications' && (
              <div 
                className="p-4 rounded-xl mb-2"
                style={{
                  backgroundColor: 'rgba(91, 155, 213, 0.08)',
                  border: '1px solid rgba(91, 155, 213, 0.25)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue font-bold font-display text-sm">
                    <Send size={16} />
                    <span>TELEGRAM ALERT GATEWAY</span>
                  </div>
                  <button
                    onClick={handleTestTelegram}
                    disabled={isTestingTelegram}
                    className="btn btn-outline"
                    style={{ height: '32px', padding: '0 12px', fontSize: '11px' }}
                  >
                    {isTestingTelegram ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        TESTE VERBINDUNG...
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        TEST-NACHRICHT SENDEN
                      </>
                    )}
                  </button>
                </div>

                <p className="text-dim text-xs font-mono leading-relaxed mb-2">
                  Ermöglicht automatische Benachrichtigungen bei Buy/Sell Orders und PnL-Abschlüssen direkt auf dein Smartphone.
                </p>

                <div 
                  className="p-2.5 rounded-lg font-mono text-[11px] leading-relaxed"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)' }}
                >
                  <span className="text-teal font-bold block mb-1">💡 AutoFund Setup-Hinweis:</span>
                  <span className="text-faint">
                    1. Erstelle einen Bot bei <b>@BotFather</b> und kopiere das Token.<br />
                    2. Finde deine Chat-ID über <b>@userinfobot</b>.<br />
                    3. <b>Wichtig:</b> Öffne deinen Bot in Telegram und klicke auf <b>Start</b> (bzw. sende <code>/start</code>), sonst kann Telegram keine Nachrichten zustellen (Fehler: <i>chat not found</i>).
                  </span>
                </div>

                {testResult && (
                  <div 
                    className="mt-3 p-3 rounded-lg font-mono text-xs flex flex-col gap-1"
                    style={{
                      backgroundColor: testResult.ok ? 'rgba(125, 211, 192, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${testResult.ok ? 'rgba(125, 211, 192, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      color: testResult.ok ? 'var(--teal)' : '#ef4444',
                    }}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {testResult.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {testResult.message}
                    </div>
                    {testResult.details && (
                      <div className="text-[10px] text-faint mt-1 pl-5">
                        {testResult.details}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {Object.entries(currentCategorySettings).map(([key, setting]) => {
              const schemaConfig = currentCategorySchema[key] || {};
              const label = key.replace(/_/g, ' ').toUpperCase();
              return (
                <div 
                  key={key} 
                  className="flex flex-col gap-2 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white tracking-wide">{label}</span>
                      {schemaConfig.is_secret && (
                        <div className="badge badge-purple" style={{ fontSize: '8px', padding: '2px 6px' }}>
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
