import { Activity, Clock, Zap, Database } from 'lucide-react';
import { PerformanceMetrics } from '../types';
import { Language, getTranslations } from '../i18n';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  language: Language;
}

export function PerformanceMonitor({ metrics, language }: PerformanceMonitorProps) {
  const t = getTranslations(language);
  const formatTime = (ms: number) => {
    return `${ms}ms`;
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-400';
    if (latency < 300) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyBg = (latency: number) => {
    if (latency < 100) return 'bg-green-500/20';
    if (latency < 300) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        {t.performance.title}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Average Response Time */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-1 text-slate-300">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">{language === 'zh' ? '平均响应' : 'Avg Response'}</span>
          </div>
          <div className="text-xl font-bold text-cyan-400">
            {formatTime(metrics.avgResponseTime)}
          </div>
        </div>

        {/* Total Requests */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-1 text-slate-300">
            <Database className="w-3 h-3" />
            <span className="text-xs font-medium">{language === 'zh' ? '总请求数' : 'Total Requests'}</span>
          </div>
          <div className="text-xl font-bold text-purple-400">
            {metrics.totalRequests}
          </div>
        </div>

        {/* API Latency */}
        <div className={`rounded-lg p-3 border border-slate-700 col-span-2 ${getLatencyBg(metrics.apiLatency)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-3 h-3 ${getLatencyColor(metrics.apiLatency)}`} />
            <span className="text-xs font-medium text-white">{language === 'zh' ? 'API延迟' : 'API Latency'}</span>
          </div>
          <div className="flex items-end justify-between mb-2">
            <div className={`text-2xl font-bold ${getLatencyColor(metrics.apiLatency)}`}>
              {formatTime(metrics.apiLatency)}
            </div>
            <div className="text-xs text-slate-400">
              {language === 'zh' ? `上次更新: ${metrics.lastUpdateTime}ms前` : `Last update: ${metrics.lastUpdateTime}ms ago`}
            </div>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.apiLatency < 100
                  ? 'bg-green-500'
                  : metrics.apiLatency < 300
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((metrics.apiLatency / 500) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/30 col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-400">
                {language === 'zh' ? '系统在线' : 'System Online'}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {language === 'zh' ? '所有服务正常' : 'All services operational'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
