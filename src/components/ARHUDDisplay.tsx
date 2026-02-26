import { VehicleState } from '../types';
import { Navigation, Radio, Phone, Cloud } from 'lucide-react';
import { Language } from '../i18n';

interface ARHUDDisplayProps {
  vehicleState: VehicleState | null;
  language: Language;
}

export function ARHUDDisplay({ vehicleState, language }: ARHUDDisplayProps) {
  const opacity = vehicleState?.ar_opacity || 0.3;

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700 h-[220px]">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* AR Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-blue-500/20" />

        {/* HUD Elements */}
        <div className="relative h-full p-4 flex items-center justify-between">
          {/* Left - Status Icons */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-cyan-500/30">
              <Navigation className="w-3 h-3" />
              <span className="text-xs font-mono">NAV</span>
            </div>
            <div className="flex items-center gap-2 text-green-400 bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-green-500/30">
              <Radio className="w-3 h-3" />
              <span className="text-xs font-mono">MEDIA</span>
            </div>
          </div>

          {/* Center - Speed Display */}
          <div className="flex justify-center items-center">
            <div className="relative">
              {/* Circular speed indicator */}
              <div className="relative w-32 h-32">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(100, 116, 139, 0.3)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${((vehicleState?.speed || 0) / 140) * 351.86} 351.86`}
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-white font-mono">
                    {vehicleState?.speed || 0}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {language === 'zh' ? '公里/时' : 'km/h'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Status Icons */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-400 bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-blue-500/30">
              <Phone className="w-3 h-3" />
              <span className="text-xs font-mono">PHONE</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400 bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-purple-500/30">
              <Cloud className="w-3 h-3" />
              <span className="text-xs font-mono">22°C</span>
            </div>
          </div>
        </div>

        {/* Bottom - Warning/Info Bar */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center px-4">
          {vehicleState && vehicleState.distraction_level > 0 && (
            <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50 text-yellow-400 px-3 py-1 rounded-lg text-xs font-mono animate-pulse">
              {language === 'zh' ? '⚠️ 检测到分心' : '⚠️ DISTRACTION DETECTED'}
            </div>
          )}
          {vehicleState && vehicleState.distraction_level === 0 && vehicleState.safety_level === 1 && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-400 px-3 py-1 rounded-lg text-xs font-mono animate-pulse">
              {language === 'zh' ? '⚠️ 驾驶模式' : '⚠️ DRIVING MODE'}
            </div>
          )}
          {vehicleState && vehicleState.distraction_level === 0 && vehicleState.safety_level >= 4 && (
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/50 text-green-400 px-3 py-1 rounded-lg text-xs font-mono">
              {language === 'zh' ? '✓ 最佳状态' : '✓ OPTIMAL CONDITIONS'}
            </div>
          )}
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-cyan-500/50" />
      <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-cyan-500/50" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-cyan-500/50" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-cyan-500/50" />

      {/* Opacity indicator */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-cyan-400 border border-cyan-500/30">
        AR: {Math.round(opacity * 100)}%
      </div>
    </div>
  );
}
