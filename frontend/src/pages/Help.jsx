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
  Activity,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

const Help = () => {
  return (
    <div className="flex flex-col gap-xl animate-fade-in">
      <section className="mb-md">
        <h2 className="text-3xl font-bold tracking-tight mb-xs uppercase">STRATEGY_DOCUMENTATION</h2>
        <div className="flex items-center gap-md font-mono text-[11px] text-faint uppercase">
          <span className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-blue" />
            V1.2.0_CORE_LOGIC
          </span>
          <span>•</span>
          <span className="text-teal">ALGORITHMIC_TRADING_GUIDE</span>
        </div>
      </section>

      <div className="terminal-box" data-title="TRADING_STRATEGY_MANIFEST">
        <div className="flex flex-col gap-xl py-md">
          <div className="flex flex-col gap-md">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center text-teal border border-teal/20">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">EMA_CROSSOVER_CORE</h3>
                <p className="text-faint font-mono text-[10px] uppercase">// TREND_FOLLOWING_ALGORITHM</p>
              </div>
            </div>
            
            <p className="text-dim leading-relaxed max-w-3xl">
              Die EMA (Exponential Moving Average) Crossover Strategie ist eine bewährte Trendfolge-Strategie, 
              die auf dem Kreuzen zweier exponentieller gleitender Durchschnitte basiert.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="p-md rounded-2xl bg-blue/5 border border-blue/10">
                <h4 className="text-blue font-mono text-xs font-bold mb-xs">📈 EMA_08 (FAST)</h4>
                <p className="text-dim text-xs leading-relaxed uppercase font-mono text-[10px]">
                  Reagiert schnell auf Preisänderungen. Wenn EMA 8 über EMA 21 steigt = Kaufsignal.
                </p>
              </div>
              
              <div className="p-md rounded-2xl bg-purple/5 border border-purple/10">
                <h4 className="text-purple font-mono text-xs font-bold mb-xs">📉 EMA_21 (SLOW)</h4>
                <p className="text-dim text-xs leading-relaxed uppercase font-mono text-[10px]">
                  Zeigt den längerfristigen Trend. Dient als Referenz für den Crossover.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-sm">
              <div className="p-md rounded-2xl bg-teal/5 border border-teal/10">
                <div className="flex items-center gap-xs text-teal font-mono text-[11px] font-bold mb-sm">
                  <TrendingUp size={14} /> ENTRY_SIGNAL_LONG
                </div>
                <ul className="flex flex-col gap-xs font-mono text-[10px] text-dim uppercase">
                  <li className="flex items-center gap-sm">
                    <span className="w-1 h-1 rounded-full bg-teal" />
                    EMA 8 CROSS_UP EMA 21
                  </li>
                  <li className="flex items-center gap-sm">
                    <span className="w-1 h-1 rounded-full bg-teal" />
                    RSI {'>'} 50 CONFIRMED
                  </li>
                </ul>
              </div>
              
              <div className="p-md rounded-2xl bg-red-400/5 border border-red-400/10">
                <div className="flex items-center gap-xs text-red-400 font-mono text-[11px] font-bold mb-sm">
                  <TrendingDown size={14} /> ENTRY_SIGNAL_SHORT
                </div>
                <ul className="flex flex-col gap-xs font-mono text-[10px] text-dim uppercase">
                  <li className="flex items-center gap-sm">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    EMA 8 CROSS_DOWN EMA 21
                  </li>
                  <li className="flex items-center gap-sm">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    RSI {'<'} 50 CONFIRMED
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex flex-col gap-md">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center text-blue border border-blue/20">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">RSI_VOLATILITY_FILTER</h3>
                <p className="text-faint font-mono text-[10px] uppercase">// MOMENTUM_OSCILLATOR</p>
              </div>
            </div>
            
            <p className="text-dim leading-relaxed max-w-3xl">
              Der Relative Strength Index (RSI) wird als Filter verwendet, um überkaufte und überverkaufte 
              Zustände zu identifizieren und falsche Signale zu reduzieren.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="p-md rounded-2xl bg-white/5 border border-white/5 text-center">
                <div className="text-2xl font-bold text-red-400 mb-xs">{'<'} 30</div>
                <div className="font-mono text-[10px] text-faint uppercase">STATE_OVERSOLD</div>
                <div className="font-mono text-[9px] text-dim mt-xs uppercase">LONG_PROBABILITY: HIGH</div>
              </div>
              
              <div className="p-md rounded-2xl bg-blue/10 border border-blue/20 text-center">
                <div className="text-2xl font-bold text-blue mb-xs">30 - 70</div>
                <div className="font-mono text-[10px] text-faint uppercase">STATE_NEUTRAL</div>
                <div className="font-mono text-[9px] text-dim mt-xs uppercase">TREND_CONTINUATION</div>
              </div>
              
              <div className="p-md rounded-2xl bg-white/5 border border-white/5 text-center">
                <div className="text-2xl font-bold text-teal mb-xs">{'>'} 70</div>
                <div className="font-mono text-[10px] text-faint uppercase">STATE_OVERBOUGHT</div>
                <div className="font-mono text-[9px] text-dim mt-xs uppercase">SHORT_PROBABILITY: HIGH</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-box" data-title="RECOMMENDED_CONFIGURATION">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-white/5 text-faint uppercase">
                <th className="py-md px-md text-left font-bold tracking-wider">PARAMETER</th>
                <th className="py-md px-md text-left font-bold tracking-wider">FACTORY_DEFAULT</th>
                <th className="py-md px-md text-left font-bold tracking-wider">OPTIMAL_VALUE</th>
                <th className="py-md px-md text-left font-bold tracking-wider">SYSTEM_LOGIC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { p: 'TRADING_PAIR', d: 'BTCUSDT', o: 'BTC/ETH_USDT', l: 'MAX_LIQUIDITY_SQUASH' },
                { p: 'TIMEFRAME', d: '5M', o: '5M - 1H', l: 'SCALPING_VS_SWING' },
                { p: 'RISK_THRESHOLD', d: '0.02', o: '0.01 - 0.03', l: 'CAPITAL_PRESERVATION' },
                { p: 'DRY_RUN_MODE', d: 'ACTIVE', o: 'SIMULATED', l: 'RISK_FREE_EXECUTION' },
                { p: 'EMA_FAST_SLOW', d: '8/21', o: '8/21 | 12/50', l: 'SIGNAL_SENSITIVITY' }
              ].map((row, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="py-md px-md font-bold text-blue uppercase tracking-tight">{row.p}</td>
                  <td className="py-md px-md text-dim">{row.d}</td>
                  <td className="py-md px-md text-teal font-bold">{row.o}</td>
                  <td className="py-md px-md text-faint text-[10px] italic">{row.l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
        <div className="terminal-box border-teal/20" data-title="SUCCESS_PROTOCOLS">
          <div className="flex flex-col gap-md py-md">
            {[
              'Starten Sie im Dry Run Mode zur Strategie-Validierung',
              'Implementieren Sie striktes 1-3% Risiko-Management',
              'Fokussierung auf hochliquide Assets (BTC, ETH)',
              'Kontinuierliche Runtime-Überwachung der API-Latenz',
              'Dynamische Strategie-Anpassung an Marktvolatilität'
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-md group">
                <div className="w-5 h-5 rounded-md bg-teal/10 flex items-center justify-center text-teal border border-teal/20 group-hover:bg-teal group-hover:text-black transition-all">
                  <CheckCircle size={12} />
                </div>
                <span className="font-mono text-[11px] text-dim group-hover:text-main transition-colors uppercase leading-relaxed pt-1">
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="terminal-box border-red-400/20" data-title="SYSTEM_WARNINGS">
          <div className="flex flex-col gap-md py-md">
            {[
              'Trading birgt signifikante Kapitalrisiken',
              'Historische Daten sind kein Garant für Future Performance',
              'Simulationen weichen von realen Slippage-Werten ab',
              'System-Ausfälle können zu ungeplanten Verlusten führen',
              'Investieren Sie nur verfügbares Risikokapital'
            ].map((warn, i) => (
              <div key={i} className="flex items-start gap-md group">
                <div className="w-5 h-5 rounded-md bg-red-400/10 flex items-center justify-center text-red-400 border border-red-400/20 group-hover:bg-red-400 group-hover:text-black transition-all">
                  <AlertTriangle size={12} />
                </div>
                <span className="font-mono text-[11px] text-dim group-hover:text-red-400 transition-colors uppercase leading-relaxed pt-1">
                  {warn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
