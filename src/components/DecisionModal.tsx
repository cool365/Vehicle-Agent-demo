import { X, Brain, CheckCircle2, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { Language } from '../i18n';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: {
    response: string;
    reasoning?: string;
    action_taken?: string;
    risk_assessment?: string;
    allowed?: boolean;
  };
  language: Language;
  isProcessing?: boolean;
}

export function DecisionModal({ isOpen, onClose, decision, language, isProcessing }: DecisionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-slate-700/50 shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isProcessing ? 'bg-cyan-600 animate-pulse' : decision.allowed ? 'bg-green-600' : 'bg-red-600'}`}>
              {isProcessing ? (
                <Brain className="w-6 h-6 text-white" />
              ) : decision.allowed ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'zh' ? 'AI决策分析' : 'AI Decision Analysis'}
              </h2>
              <p className="text-xs text-slate-400">
                {isProcessing
                  ? (language === 'zh' ? '正在分析情境...' : 'Analyzing context...')
                  : (language === 'zh' ? '情境感知决策引擎' : 'Context-Aware Decision Engine')
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Processing State */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-cyan-600/20 border border-cyan-500/30 rounded-lg">
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-cyan-300">
                    {language === 'zh' ? '① 读取传感器数据' : '① Reading Sensor Data'}
                  </div>
                  <div className="text-xs text-cyan-400/80">
                    {language === 'zh' ? '车速、档位、电量、温度、天气...' : 'Speed, Gear, Battery, Temp, Weather...'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-300">
                    {language === 'zh' ? '② 情境理解分析' : '② Context Understanding'}
                  </div>
                  <div className="text-xs text-blue-400/80">
                    {language === 'zh' ? 'AI正在理解当前驾驶场景...' : 'AI analyzing current driving scenario...'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-purple-400 animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-purple-300">
                    {language === 'zh' ? '③ 安全风险评估' : '③ Safety Risk Assessment'}
                  </div>
                  <div className="text-xs text-purple-400/80">
                    {language === 'zh' ? '评估操作安全性...' : 'Evaluating safety...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Decision Result */}
          {!isProcessing && (
            <>
              {/* Main Response */}
              <div className={`p-4 rounded-lg border ${
                decision.allowed
                  ? 'bg-green-600/20 border-green-500/30'
                  : 'bg-red-600/20 border-red-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {decision.allowed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm font-semibold mb-1 ${
                      decision.allowed ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {language === 'zh' ? '决策结果' : 'Decision Result'}
                    </div>
                    <p className="text-base text-white leading-relaxed">
                      {decision.response}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              {decision.reasoning && (
                <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-blue-300 mb-1">
                        {language === 'zh' ? '推理过程' : 'Reasoning Process'}
                      </div>
                      <p className="text-sm text-blue-100 leading-relaxed">
                        {decision.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Taken */}
              {decision.action_taken && (
                <div className="p-4 bg-cyan-600/20 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-cyan-300 mb-1">
                        {language === 'zh' ? '执行动作' : 'Action Taken'}
                      </div>
                      <p className="text-sm text-cyan-100 leading-relaxed">
                        {decision.action_taken}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              {decision.risk_assessment && (
                <div className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-purple-300 mb-1">
                        {language === 'zh' ? '风险评估' : 'Risk Assessment'}
                      </div>
                      <p className="text-sm text-purple-100 leading-relaxed">
                        {decision.risk_assessment}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
          <div className="text-xs text-slate-400">
            {language === 'zh' ? '基于多维传感器数据的智能决策' : 'Intelligent decision based on multi-sensor data'}
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg transition-all"
            >
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
