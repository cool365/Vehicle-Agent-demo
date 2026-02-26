import { Gauge, Settings, Shield } from 'lucide-react';
import { VehicleState } from '../types';
import { Language, getTranslations } from '../i18n';

interface VehicleStatusPanelProps {
  vehicleState: VehicleState | null;
  language: Language;
}

export function VehicleStatusPanel({ vehicleState, language }: VehicleStatusPanelProps) {
  const t = getTranslations(language);
  const getSafetyColor = (level: number) => {
    if (level >= 4) return 'text-green-400';
    if (level === 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSafetyBg = (level: number) => {
    if (level >= 4) return 'bg-green-500/20 border-green-500/50';
    if (level === 3) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const getGearColor = (gear: string) => {
    if (gear === 'P') return 'text-blue-400';
    if (gear === 'R') return 'text-yellow-400';
    if (gear === 'S') return 'text-red-400';
    return 'text-green-400';
  };

  if (!vehicleState) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {t.common.vehicleStatus}
        </h2>
        <div className="text-slate-400">{language === 'zh' ? '初始化中...' : 'Initializing...'}</div>
      </div>
    );
  }

  const gearLabel = {
    P: t.vehicle.gearP,
    R: t.vehicle.gearR,
    N: t.vehicle.gearN,
    D: t.vehicle.gearD,
  }[vehicleState.gear] || vehicleState.gear;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        {t.common.vehicleStatus}
      </h2>

      <div className="space-y-3">
        {/* Speed */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Gauge className="w-3 h-3" />
              <span className="text-xs font-medium">{t.vehicle.speed}</span>
            </div>
            <span className="text-xl font-bold text-cyan-400">
              {vehicleState.speed}
            </span>
          </div>
          <div className="text-xs text-slate-400">{t.vehicle.speedUnit}</div>
          <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${Math.min((vehicleState.speed / 140) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Gear */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">{t.vehicle.gear}</span>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getGearColor(vehicleState.gear)}`}>
                {vehicleState.gear}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{gearLabel}</div>
            </div>
          </div>
        </div>

        {/* Safety Level */}
        <div className={`rounded-lg p-3 border ${getSafetyBg(vehicleState.safety_level)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`w-3 h-3 ${getSafetyColor(vehicleState.safety_level)}`} />
              <span className="text-xs font-medium text-white">{t.vehicle.safetyLevel}</span>
            </div>
            <span className={`text-xl font-bold ${getSafetyColor(vehicleState.safety_level)}`}>
              {vehicleState.safety_level}/5
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`flex-1 h-1.5 rounded-full ${
                  level <= vehicleState.safety_level
                    ? vehicleState.safety_level >= 4
                      ? 'bg-green-500'
                      : vehicleState.safety_level === 3
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Distraction Level */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-300">{t.vehicle.distractionLevel}</span>
            <span className="text-lg font-bold text-orange-400">
              {vehicleState.distraction_level}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                vehicleState.distraction_level > 70
                  ? 'bg-red-500'
                  : vehicleState.distraction_level > 40
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${vehicleState.distraction_level}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
