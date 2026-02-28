import { Zap, Thermometer, MapPin, AlertTriangle, CloudRain, Coffee } from 'lucide-react';
import { Language } from '../i18n';
import { useState } from 'react';

interface ScenarioSimulatorProps {
  onTriggerScenario: (scenarioType: string) => void;
  language: Language;
}

export function ScenarioSimulator({ onTriggerScenario, language }: ScenarioSimulatorProps) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'low-battery',
      icon: Zap,
      labelZh: '低电量',
      labelEn: 'Low Battery',
      colorClass: 'from-red-600 to-orange-600',
      descZh: '15% · 拥堵',
      descEn: '15% · Traffic',
      suggestZh: '找充电站',
      suggestEn: 'Find charging',
    },
    {
      id: 'high-temp',
      icon: Thermometer,
      labelZh: '高温',
      labelEn: 'High Temp',
      colorClass: 'from-orange-600 to-yellow-600',
      descZh: '32°C · 行驶',
      descEn: '32°C · Driving',
      suggestZh: '好热',
      suggestEn: 'Too hot',
    },
    {
      id: 'arrived',
      icon: MapPin,
      labelZh: '已停车',
      labelEn: 'Parked',
      colorClass: 'from-green-600 to-teal-600',
      descZh: 'P档 · 商场',
      descEn: 'P · Mall',
      suggestZh: '播放音乐',
      suggestEn: 'Play music',
    },
    {
      id: 'fatigue',
      icon: Coffee,
      labelZh: '疲劳',
      labelEn: 'Fatigue',
      colorClass: 'from-purple-600 to-pink-600',
      descZh: '80km/h · 高速',
      descEn: '80km/h · Highway',
      suggestZh: '播放音乐',
      suggestEn: 'Play music',
    },
    {
      id: 'bad-weather',
      icon: CloudRain,
      labelZh: '恶劣天气',
      labelEn: 'Bad Weather',
      colorClass: 'from-slate-600 to-blue-600',
      descZh: '大雨 · 低能见度',
      descEn: 'Rain · Low Vis',
      suggestZh: '调节空调',
      suggestEn: 'Adjust AC',
    },
    {
      id: 'emergency',
      icon: AlertTriangle,
      labelZh: '紧急',
      labelEn: 'Emergency',
      colorClass: 'from-red-700 to-red-900',
      descZh: '急刹 · 危险',
      descEn: 'Brake · Danger',
      suggestZh: '打开导航',
      suggestEn: 'Open nav',
    },
  ];

  const handleScenarioClick = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    onTriggerScenario(scenarioId);

    setTimeout(() => {
      setActiveScenario(null);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-white">
          {language === 'zh' ? '情境模拟面板' : 'Scenario Simulator'}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isActive = activeScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleScenarioClick(scenario.id)}
              className={`group relative bg-gradient-to-br ${scenario.colorClass} hover:scale-105 active:scale-95 transition-all duration-200 rounded-lg p-2 text-left overflow-hidden shadow-lg hover:shadow-xl ${
                isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-white" />
                  <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-white/50 group-hover:bg-white'}`} />
                </div>

                <div>
                  <div className="text-xs font-bold text-white">
                    {language === 'zh' ? scenario.labelZh : scenario.labelEn}
                  </div>
                  <div className="text-[10px] text-white/80 leading-tight">
                    {language === 'zh' ? scenario.descZh : scenario.descEn}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 group-hover:bg-white/50 transition-colors" />
            </button>
          );
        })}
      </div>

      {activeScenario && (
        <div className="mt-2 p-2 bg-cyan-600/20 border border-cyan-500/30 rounded-lg animate-pulse">
          <p className="text-[10px] text-cyan-300 text-center font-medium">
            {language === 'zh' ? '✓ 场景已切换！请输入指令测试' : '✓ Scenario activated! Enter command'}
          </p>
          <p className="text-[10px] text-cyan-400/80 text-center mt-0.5">
            {language === 'zh' ? '试试：' : 'Try: '}"{scenarios.find(s => s.id === activeScenario)?.[language === 'zh' ? 'suggestZh' : 'suggestEn']}"
          </p>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-400 text-center">
          {language === 'zh'
            ? '① 点击场景 → ② 输入指令 → ③ 观察AI决策'
            : '① Click → ② Command → ③ Observe AI'}
        </p>
      </div>
    </div>
  );
}
