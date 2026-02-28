import { Zap, Thermometer, MapPin, AlertTriangle, CloudRain, Coffee } from 'lucide-react';
import { Language } from '../i18n';

interface ScenarioSimulatorProps {
  onTriggerScenario: (scenarioType: string) => void;
  language: Language;
}

export function ScenarioSimulator({ onTriggerScenario, language }: ScenarioSimulatorProps) {
  const scenarios = [
    {
      id: 'low-battery',
      icon: Zap,
      labelZh: '低电量预警',
      labelEn: 'Low Battery',
      colorClass: 'from-red-600 to-orange-600',
      description: language === 'zh' ? '电量15% · 拥堵路段' : 'Battery 15% · Traffic',
    },
    {
      id: 'high-temp',
      icon: Thermometer,
      labelZh: '高温环境',
      labelEn: 'High Temp',
      colorClass: 'from-orange-600 to-yellow-600',
      description: language === 'zh' ? '车内32°C · 晴天' : 'Cabin 32°C · Sunny',
    },
    {
      id: 'arrived',
      icon: MapPin,
      labelZh: '到达目的地',
      labelEn: 'Arrived',
      colorClass: 'from-green-600 to-teal-600',
      description: language === 'zh' ? '购物中心 · 已停车' : 'Mall · Parked',
    },
    {
      id: 'fatigue',
      icon: Coffee,
      labelZh: '疲劳驾驶',
      labelEn: 'Fatigue',
      colorClass: 'from-purple-600 to-pink-600',
      description: language === 'zh' ? '驾驶3小时 · 疲劳预警' : '3hrs Drive · Alert',
    },
    {
      id: 'bad-weather',
      icon: CloudRain,
      labelZh: '恶劣天气',
      labelEn: 'Bad Weather',
      colorClass: 'from-slate-600 to-blue-600',
      description: language === 'zh' ? '大雨 · 能见度低' : 'Heavy Rain · Low Vis',
    },
    {
      id: 'emergency',
      icon: AlertTriangle,
      labelZh: '紧急情况',
      labelEn: 'Emergency',
      colorClass: 'from-red-700 to-red-900',
      description: language === 'zh' ? '急刹 · 安全风险' : 'Hard Brake · Risk',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-bold text-white">
          {language === 'zh' ? '情境模拟面板' : 'Scenario Simulator'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <button
              key={scenario.id}
              onClick={() => onTriggerScenario(scenario.id)}
              className={`group relative bg-gradient-to-br ${scenario.colorClass} hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl p-3 text-left overflow-hidden shadow-lg hover:shadow-xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-white" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50 group-hover:bg-white group-hover:animate-pulse" />
                </div>

                <div>
                  <div className="text-sm font-bold text-white">
                    {language === 'zh' ? scenario.labelZh : scenario.labelEn}
                  </div>
                  <div className="text-xs text-white/80 leading-tight">
                    {scenario.description}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 group-hover:bg-white/50 transition-colors" />
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <p className="text-xs text-slate-400 text-center">
          {language === 'zh'
            ? '点击按钮模拟不同驾驶场景，观察系统智能决策'
            : 'Click to simulate scenarios and observe AI decisions'}
        </p>
      </div>
    </div>
  );
}
