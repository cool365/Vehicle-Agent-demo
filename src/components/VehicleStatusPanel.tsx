import { Gauge, Settings, Shield, Battery, Thermometer, MapPin, Cloud, AlertTriangle } from 'lucide-react';
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

  const getBatteryColor = (percent: number) => {
    if (percent < 10) return 'text-red-400';
    if (percent < 30) return 'text-orange-400';
    if (percent < 60) return 'text-yellow-400';
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
        {/* Scenario Type */}
        {vehicleState.scenario_type && (
          <div className="bg-cyan-600/20 border border-cyan-500/50 rounded-lg p-2">
            <div className="text-[10px] text-cyan-300 font-medium text-center">
              {language === 'zh' ? '当前场景' : 'Scenario'}: {vehicleState.scenario_type}
            </div>
          </div>
        )}

        {/* Speed & Gear Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Speed */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Gauge className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-medium text-slate-300">{t.vehicle.speed}</span>
            </div>
            <div className="text-xl font-bold text-cyan-400">
              {vehicleState.speed}
              <span className="text-xs text-slate-400 ml-1">km/h</span>
            </div>
            <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${Math.min((vehicleState.speed / 140) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Gear */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs font-medium text-slate-300 mb-1">{t.vehicle.gear}</div>
            <div className={`text-3xl font-bold ${getGearColor(vehicleState.gear)}`}>
              {vehicleState.gear}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{gearLabel}</div>
          </div>
        </div>

        {/* Battery & Temperature Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Battery */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Battery className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-medium text-slate-300">
                {language === 'zh' ? '电量' : 'Battery'}
              </span>
            </div>
            <div className={`text-xl font-bold ${getBatteryColor(vehicleState.battery_percentage)}`}>
              {vehicleState.battery_percentage}%
            </div>
            <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  vehicleState.battery_percentage < 10 ? 'bg-red-500' :
                  vehicleState.battery_percentage < 30 ? 'bg-orange-500' :
                  vehicleState.battery_percentage < 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${vehicleState.battery_percentage}%` }}
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Thermometer className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-medium text-slate-300">
                {language === 'zh' ? '温度' : 'Temp'}
              </span>
            </div>
            <div className="text-xl font-bold text-orange-400">
              {vehicleState.cabin_temp}°C
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {vehicleState.cabin_temp > 28 ? (language === 'zh' ? '偏热' : 'Hot') :
               vehicleState.cabin_temp < 18 ? (language === 'zh' ? '偏冷' : 'Cold') :
               (language === 'zh' ? '舒适' : 'Comfy')}
            </div>
          </div>
        </div>

        {/* Location & Weather */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-medium text-slate-300">
                {language === 'zh' ? '位置' : 'Location'}
              </span>
            </div>
            <span className="text-xs text-cyan-400">{vehicleState.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cloud className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-medium text-slate-300">
                {language === 'zh' ? '天气' : 'Weather'}
              </span>
            </div>
            <span className="text-xs text-blue-400">{vehicleState.weather}</span>
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
        {vehicleState.distraction_level > 0 && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-xs font-medium text-red-300">{t.vehicle.distractionLevel}</span>
              </div>
              <span className="text-lg font-bold text-red-400">
                {vehicleState.distraction_level}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${vehicleState.distraction_level}%` }}
              />
            </div>
          </div>
        )}

        {/* Additional Sensors (if available) */}
        {(vehicleState.fatigue_level || vehicleState.front_distance_m || vehicleState.aeb_triggered) && (
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 space-y-2">
            <div className="text-xs font-medium text-slate-400 mb-2">
              {language === 'zh' ? '传感器数据' : 'Sensor Data'}
            </div>

            {vehicleState.fatigue_level !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {language === 'zh' ? '疲劳度' : 'Fatigue'}
                </span>
                <span className={`text-xs font-bold ${vehicleState.fatigue_level > 70 ? 'text-red-400' : 'text-green-400'}`}>
                  {vehicleState.fatigue_level}%
                </span>
              </div>
            )}

            {vehicleState.front_distance_m !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {language === 'zh' ? '前车距离' : 'Front Dist'}
                </span>
                <span className={`text-xs font-bold ${vehicleState.front_distance_m < 10 ? 'text-red-400' : 'text-green-400'}`}>
                  {vehicleState.front_distance_m.toFixed(1)}m
                </span>
              </div>
            )}

            {vehicleState.rear_distance_m !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {language === 'zh' ? '后方距离' : 'Rear Dist'}
                </span>
                <span className={`text-xs font-bold ${vehicleState.rear_distance_m < 1 ? 'text-red-400' : 'text-green-400'}`}>
                  {vehicleState.rear_distance_m.toFixed(1)}m
                </span>
              </div>
            )}

            {vehicleState.aeb_triggered && (
              <div className="flex items-center gap-1.5 p-1.5 bg-red-900/50 rounded">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-xs font-bold text-red-400">
                  {language === 'zh' ? 'AEB紧急制动已触发' : 'AEB Triggered'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
