import { Zap, Coffee, Snowflake, Sun, Navigation, Phone, AlertTriangle, Music } from 'lucide-react';
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
      id: 'morning-commute',
      icon: Navigation,
      labelZh: '早高峰通勤',
      labelEn: 'Morning Rush',
      colorClass: 'from-blue-600 to-cyan-600',
      descZh: '8:00 · 拥堵路段',
      descEn: '8:00 AM · Traffic',
      suggestZh: '导航到公司',
      suggestEn: 'Navigate to office',
    },
    {
      id: 'winter-cold-start',
      icon: Snowflake,
      labelZh: '冬季冷启动',
      labelEn: 'Cold Start',
      colorClass: 'from-cyan-600 to-blue-700',
      descZh: '-5°C · 车内寒冷',
      descEn: '-5°C · Cold',
      suggestZh: '好冷',
      suggestEn: 'Too cold',
    },
    {
      id: 'summer-hot-cabin',
      icon: Sun,
      labelZh: '夏季高温',
      labelEn: 'Hot Summer',
      colorClass: 'from-orange-600 to-red-600',
      descZh: '35°C · 暴晒',
      descEn: '35°C · Hot',
      suggestZh: '好热',
      suggestEn: 'Too hot',
    },
    {
      id: 'highway-fatigue',
      icon: Coffee,
      labelZh: '高速疲劳',
      labelEn: 'Highway Fatigue',
      colorClass: 'from-purple-600 to-pink-600',
      descZh: '120km/h · 困倦',
      descEn: '120km/h · Drowsy',
      suggestZh: '播放音乐',
      suggestEn: 'Play music',
    },
    {
      id: 'parking-entertainment',
      icon: Music,
      labelZh: '停车娱乐',
      labelEn: 'Parked Fun',
      colorClass: 'from-green-600 to-teal-600',
      descZh: 'P档 · 等人',
      descEn: 'P · Waiting',
      suggestZh: '播放音乐',
      suggestEn: 'Play music',
    },
    {
      id: 'low-battery-urgent',
      icon: Zap,
      labelZh: '电量告急',
      labelEn: 'Low Battery',
      colorClass: 'from-red-700 to-orange-700',
      descZh: '8% · 续航焦虑',
      descEn: '8% · Range Low',
      suggestZh: '找充电站',
      suggestEn: 'Find charger',
    },
    {
      id: 'incoming-call-driving',
      icon: Phone,
      labelZh: '行驶来电',
      labelEn: 'Call While Driving',
      colorClass: 'from-blue-700 to-indigo-700',
      descZh: '60km/h · 来电',
      descEn: '60km/h · Incoming',
      suggestZh: '接听电话',
      suggestEn: 'Answer call',
    },
    {
      id: 'emergency-brake',
      icon: AlertTriangle,
      labelZh: '紧急制动',
      labelEn: 'Emergency Brake',
      colorClass: 'from-red-800 to-red-950',
      descZh: 'AEB触发 · 危险',
      descEn: 'AEB · Danger',
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

      <div className="grid grid-cols-4 gap-2">
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
