import { useEffect, useState } from 'react';
import { VehicleStatusPanel } from './components/VehicleStatusPanel';
import { ARHUDDisplay } from './components/ARHUDDisplay';
import { UserInputPanel } from './components/UserInputPanel';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { DynamicContentOverlay } from './components/DynamicContentOverlay';
import { LanguageToggle } from './components/LanguageToggle';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { Car } from 'lucide-react';
import { VehicleState, PerformanceMetrics } from './types';
import { Language, getTranslations } from './i18n';

interface AgentDecision {
  response: string;
  reasoning?: string;
  action_taken?: string;
  risk_assessment?: string;
  allowed?: boolean;
}

type FeatureType = 'navigation' | 'music' | 'battery' | 'climate' | 'seat' | null;

function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [vehicleState, setVehicleState] = useState<VehicleState | null>(null);
  const [agentResponse, setAgentResponse] = useState<string | AgentDecision>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommandVehicleStateId, setLastCommandVehicleStateId] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<FeatureType>(null);
  const [isFeatureAllowed, setIsFeatureAllowed] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 0,
    totalRequests: 0,
    lastUpdateTime: 0,
    apiLatency: 0,
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const t = getTranslations(language);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const [isScenarioActive, setIsScenarioActive] = useState(false);

  useEffect(() => {
    if (!supabaseUrl) {
      console.error('VITE_SUPABASE_URL is not defined');
      return;
    }
    fetchVehicleState();
    const interval = setInterval(() => {
      if (!isScenarioActive) {
        fetchVehicleState();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isScenarioActive]);

  const fetchVehicleState = async () => {
    if (!supabaseUrl) return;

    const startTime = Date.now();
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/vehicle-state-simulator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVehicleState(data);
        const latency = Date.now() - startTime;
        setMetrics(prev => ({
          ...prev,
          apiLatency: latency,
          lastUpdateTime: 0,
        }));
      } else {
        console.error('Failed to fetch vehicle state:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch vehicle state:', error);
    }
  };

  // Keep responses visible longer - clear after 3 vehicle state updates (24 seconds)
  const [stateUpdatesSinceCommand, setStateUpdatesSinceCommand] = useState(0);

  useEffect(() => {
    if (vehicleState && lastCommandVehicleStateId && vehicleState.id !== lastCommandVehicleStateId) {
      setStateUpdatesSinceCommand(prev => prev + 1);

      // Clear response after 3 state updates (approximately 24 seconds)
      if (stateUpdatesSinceCommand >= 2) {
        setAgentResponse('');
        setLastCommandVehicleStateId(null);
        setStateUpdatesSinceCommand(0);
      }
    }
  }, [vehicleState, lastCommandVehicleStateId, stateUpdatesSinceCommand]);

  const handleSendCommand = async (command: string) => {
    if (!vehicleState || !supabaseUrl) return;

    setIsProcessing(true);
    const startTime = Date.now();

    // Detect feature type from command - Enhanced with comprehensive keyword matching
    const detectFeature = (cmd: string): FeatureType => {
      const lowerCmd = cmd.toLowerCase();

      // Navigation: 导航相关
      if (lowerCmd.includes('导航') || lowerCmd.includes('navigation') ||
          lowerCmd.includes('地图') || lowerCmd.includes('路线') ||
          lowerCmd.includes('去') || lowerCmd.includes('到') || lowerCmd.includes('前往')) {
        return 'navigation';
      }

      // Music: 音乐/娱乐相关（包括情绪状态："无聊"）
      if (lowerCmd.includes('音乐') || lowerCmd.includes('music') ||
          lowerCmd.includes('播放') || lowerCmd.includes('歌曲') ||
          lowerCmd.includes('歌') || lowerCmd.includes('play') ||
          lowerCmd.includes('无聊') || lowerCmd.includes('bored')) {
        return 'music';
      }

      // Battery: 电量/续航相关
      if (lowerCmd.includes('电量') || lowerCmd.includes('battery') ||
          lowerCmd.includes('电池') || lowerCmd.includes('续航') ||
          lowerCmd.includes('充电') || lowerCmd.includes('能耗')) {
        return 'battery';
      }

      // Seat: 座椅加热/通风相关（优先级高，因为"好冷"主要触发座椅加热）
      if (lowerCmd.includes('座椅') || lowerCmd.includes('加热') ||
          lowerCmd.includes('seat') || lowerCmd.includes('按摩') ||
          lowerCmd.includes('椅子') || lowerCmd.includes('好冷') || lowerCmd.includes('冷')) {
        return 'seat';
      }

      // Climate: 空调/温度相关（包括情绪状态："好热"）
      if (lowerCmd.includes('空调') || lowerCmd.includes('climate') ||
          lowerCmd.includes('温度') || lowerCmd.includes('热') ||
          lowerCmd.includes('通风') || lowerCmd.includes('制冷') ||
          lowerCmd.includes('制热') || lowerCmd.includes('好热')) {
        return 'climate';
      }

      return null;
    };

    const feature = detectFeature(command);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/agent-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: command,
          gear: vehicleState.gear,
          distraction_level: vehicleState.distraction_level,
          safety_level: vehicleState.safety_level,
          speed: vehicleState.speed,
          vehicle_state_id: vehicleState.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // 确保响应数据完整，提供fallback
        const agentDecision = {
          response: data.response || '已收到您的指令，正在处理中...',
          reasoning: data.reasoning || 'AI正在分析最佳处理方案',
          action_taken: data.action_taken || '执行指令',
          risk_assessment: data.risk_assessment || '安全评估中',
          allowed: data.allowed !== undefined ? data.allowed : true,
        };

        setAgentResponse(agentDecision);
        setIsFeatureAllowed(agentDecision.allowed);
        setLastCommandVehicleStateId(vehicleState.id);
        setStateUpdatesSinceCommand(0); // Reset counter on new command

        // Show feature overlay after AI response
        if (feature) {
          setActiveFeature(feature);

          // Auto-hide feature overlay after 5 seconds
          setTimeout(() => {
            setActiveFeature(null);
          }, 5000);
        }

        const responseTime = Date.now() - startTime;
        setMetrics(prev => ({
          avgResponseTime: prev.totalRequests === 0
            ? responseTime
            : Math.round((prev.avgResponseTime * prev.totalRequests + responseTime) / (prev.totalRequests + 1)),
          totalRequests: prev.totalRequests + 1,
          lastUpdateTime: 0,
          apiLatency: prev.apiLatency,
        }));
      } else {
        console.error('Failed to get agent response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);

        // 提供友好的错误响应
        setAgentResponse({
          response: '抱歉，AI助手暂时无法处理您的请求。请稍后重试。',
          reasoning: '服务器响应异常，可能是网络问题或服务暂时不可用',
          action_taken: '请求失败，未执行任何操作',
          risk_assessment: '无风险：操作未执行',
          allowed: false,
        });
        setActiveFeature(null);
      }
    } catch (error) {
      console.error('Failed to get agent response:', error);

      // 提供友好的错误响应
      setAgentResponse({
        response: '抱歉，AI助手连接失败。请检查网络连接后重试。',
        reasoning: '网络连接异常或服务不可达',
        action_taken: '请求失败，未执行任何操作',
        risk_assessment: '无风险：操作未执行',
        allowed: false,
      });
      setActiveFeature(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTriggerScenario = async (scenarioType: string) => {
    if (!vehicleState || !supabaseUrl) return;

    const scenarioStates: Record<string, Partial<VehicleState>> = {
      'low-battery': {
        battery_percentage: 15,
        location: language === 'zh' ? '市区拥堵路段' : 'Urban Traffic',
        speed: 25,
        safety_level: 2,
        gear: 'D',
        distraction_level: 2,
        weather: language === 'zh' ? '晴天' : 'Sunny',
        cabin_temp: 24,
      },
      'high-temp': {
        cabin_temp: 32,
        weather: language === 'zh' ? '晴天高温' : 'Hot Sunny',
        speed: 60,
        gear: 'D',
        safety_level: 3,
        distraction_level: 1,
        battery_percentage: 75,
      },
      'arrived': {
        location: language === 'zh' ? '商业区 - 购物中心' : 'Shopping Mall',
        speed: 0,
        gear: 'P',
        distraction_level: 0,
        safety_level: 5,
        battery_percentage: 60,
        cabin_temp: 24,
        weather: language === 'zh' ? '晴天' : 'Sunny',
      },
      'fatigue': {
        distraction_level: 4,
        speed: 80,
        safety_level: 2,
        gear: 'D',
        battery_percentage: 50,
        location: language === 'zh' ? '高速公路' : 'Highway',
        weather: language === 'zh' ? '晴天' : 'Sunny',
        cabin_temp: 24,
      },
      'bad-weather': {
        weather: language === 'zh' ? '大雨' : 'Heavy Rain',
        speed: 45,
        safety_level: 1,
        gear: 'D',
        distraction_level: 2,
        battery_percentage: 65,
        location: language === 'zh' ? '市区道路' : 'City Road',
        cabin_temp: 22,
      },
      'emergency': {
        speed: 30,
        safety_level: 1,
        distraction_level: 5,
        gear: 'D',
        battery_percentage: 40,
        location: language === 'zh' ? '紧急制动路段' : 'Emergency Brake Zone',
        weather: language === 'zh' ? '晴天' : 'Sunny',
        cabin_temp: 24,
      },
    };

    const scenarioData = scenarioStates[scenarioType];
    if (!scenarioData) return;

    const newState = {
      ...vehicleState,
      ...scenarioData,
    };

    setIsScenarioActive(true);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/vehicle-state-simulator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioState: newState,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setVehicleState(data);
      } else {
        console.error('Failed to sync scenario state:', response.status);
        setVehicleState(newState);
      }
    } catch (error) {
      console.error('Failed to sync scenario state:', error);
      setVehicleState(newState);
    }

    setTimeout(() => {
      setIsScenarioActive(false);
    }, 30000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        lastUpdateTime: prev.lastUpdateTime + 100,
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!supabaseUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-2">Configuration Error</h2>
            <p className="text-red-300">VITE_SUPABASE_URL is not configured. Please check your environment variables.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <LanguageToggle currentLang={language} onToggle={toggleLanguage} />
      <div className="container mx-auto px-4 py-4">
        <header className="mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {language === 'zh' ? '智能座舱情境感知决策系统' : 'Context-Aware Decision System'}
              </h1>
              <p className="text-xs text-slate-400">
                {language === 'zh' ? '座舱部门技术演示 v1.0' : 'Cockpit Dept Tech Demo v1.0'}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <ARHUDDisplay vehicleState={vehicleState} language={language} />
              <DynamicContentOverlay activeFeature={activeFeature} isAllowed={isFeatureAllowed} language={language} />
            </div>
            <UserInputPanel
              onSendCommand={handleSendCommand}
              agentResponse={agentResponse}
              isProcessing={isProcessing}
              language={language}
            />
            <ScenarioSimulator onTriggerScenario={handleTriggerScenario} language={language} />
          </div>

          <div className="space-y-4">
            <VehicleStatusPanel vehicleState={vehicleState} language={language} />
            <PerformanceMonitor metrics={metrics} language={language} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
