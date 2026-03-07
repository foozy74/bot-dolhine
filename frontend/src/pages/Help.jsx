import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Target, 
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Lightbulb,
  Activity
} from 'lucide-react';

const Help = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>📚 Hilfe & Strategie</h1>
        <p className="text-secondary">
          Verstehen Sie die Trading-Strategie und Konfiguration des Delfin Bots
        </p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={24} />
          Trading-Strategie
        </h2>
        
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} />
              EMA Crossover Strategie
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
              Die EMA (Exponential Moving Average) Crossover Strategie ist eine bewährte Trendfolge-Strategie, 
              die auf dem Kreuzen zweier exponentieller gleitender Durchschnitte basiert.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  📈 EMA 8 (Schnell)
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Reagiert schnell auf Preisänderungen. Wenn EMA 8 über EMA 21 steigt = Kaufsignal.
                </p>
              </div>
              
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--accent-danger)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  📉 EMA 21 (Langsam)
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Zeigt den längerfristigen Trend. Dient als Referenz für den Crossover.
                </p>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--accent-success)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                ✅ Kaufsignal (Long)
              </h4>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                <li>EMA 8 kreuzt VON UNTEN nach OBEN über EMA 21</li>
                <li>RSI größer 50 (bestätigt Aufwärtstrend)</li>
                <li>Long Position wird eröffnet</li>
              </ul>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
              <h4 style={{ color: 'var(--accent-danger)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                ❌ Verkaufssignal (Short)
              </h4>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                <li>EMA 8 kreuzt VON OBEN nach UNTEN unter EMA 21</li>
                <li>RSI kleiner 50 (bestätigt Abwärtstrend)</li>
                <li>Short Position wird eröffnet</li>
              </ul>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} />
              RSI Filter
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
              Der Relative Strength Index (RSI) wird als Filter verwendet, um überkaufte und überverkaufte 
              Zustände zu identifizieren und falsche Signale zu reduzieren.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-danger)', marginBottom: '0.25rem' }}>
                  unter 30
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Überverkauft</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Potenzielle Long-Chance</div>
              </div>
              
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                  30-70
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Neutral</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Trend-bestätigend</div>
              </div>
              
              <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-success)', marginBottom: '0.25rem' }}>
                  über 70
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Überkauft</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Potenzielle Short-Chance</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} />
              ATR Risk Management
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
              Der Average True Range (ATR) wird verwendet, um dynamische Stop-Loss und Take-Profit 
              Levels zu berechnen, die sich der Marktvolatilität anpassen.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--accent-danger)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  🛑 Stop Loss
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  2x ATR unter dem Einstiegspreis (Long) oder über dem Einstiegspreis (Short)
                </p>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Beispiel: Entry $50.000, ATR $500 → SL bei $49.000
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--accent-success)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  🎯 Take Profit
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  3x ATR über dem Einstiegspreis (Long) oder unter dem Einstiegspreis (Short)
                </p>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Beispiel: Entry $50.000, ATR $500 → TP bei $51.500
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lightbulb size={24} />
          Empfohlene Konfiguration
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Parameter
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Standardwert
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Empfohlen
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Beschreibung
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                  Trading Pair
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>BTCUSDT</td>
                <td style={{ padding: '1rem', color: 'var(--accent-success)' }}>BTCUSDT, ETHUSDT</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Liquidste Paare mit geringem Spread
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                  Timeframe
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>5m</td>
                <td style={{ padding: '1rem', color: 'var(--accent-success)' }}>5m - 1h</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  5m für Day-Trading, 1h für Swing-Trading
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                  Risk %
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>0.02 (2%)</td>
                <td style={{ padding: '1rem', color: 'var(--accent-success)' }}>0.01 - 0.03 (1-3%)</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Max. Risiko pro Trade. Niedriger = konservativer
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                  Dry Run Mode
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Aktiv</td>
                <td style={{ padding: '1rem', color: 'var(--accent-success)' }}>Zum Testen aktivieren</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Simuliert Trades ohne echtes Geld zu verwenden
                </td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                  EMA Fast/Slow
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>8/21</td>
                <td style={{ padding: '1rem', color: 'var(--accent-success)' }}>8/21 oder 12/50</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  EMA Längen für Crossover-Signale
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card" style={{ borderColor: 'var(--accent-success)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} />
            Tipps für erfolgreichen Trading
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-success)' }}>✓</span>
              Starten Sie im Dry Run Mode, um die Strategie zu testen
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-success)' }}>✓</span>
              Verwenden Sie maximal 1-3% Risiko pro Trade
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-success)' }}>✓</span>
              Wählen Sie liquidste Trading-Paare (BTC, ETH)
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-success)' }}>✓</span>
              Überwachen Sie den Bot regelmäßig, besonders am Anfang
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-success)' }}>✓</span>
              Passen Sie die Strategie an Marktbedingungen an
            </li>
          </ul>
        </div>

        <div className="glass-card" style={{ borderColor: 'var(--accent-warning)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            Wichtige Warnungen
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-warning)' }}>⚠</span>
              Trading birgt das Risiko von Kapitalverlust
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-warning)' }}>⚠</span>
              Vergangene Performance garantiert keine zukünftigen Ergebnisse
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-warning)' }}>⚠</span>
              Dry Run Mode bietet keine Garantie für Live-Trading-Ergebnisse
            </li>
            <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-warning)' }}>⚠</span>
              Bei hoher Volatilität können größere Verluste auftreten
            </li>
            <li style={{ paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent-warning)' }}>⚠</span>
              Investieren Sie nur Geld, dessen Verlust Sie verkraften können
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Help;
