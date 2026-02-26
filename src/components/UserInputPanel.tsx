import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Volume2, Brain, Shield, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Language, getTranslations } from '../i18n';

interface AgentDecision {
  response: string;
  reasoning?: string;
  action_taken?: string;
  risk_assessment?: string;
  allowed?: boolean;
}

interface UserInputPanelProps {
  onSendCommand: (command: string) => void;
  agentResponse: string | AgentDecision;
  isProcessing: boolean;
  language: Language;
}

export function UserInputPanel({ onSendCommand, agentResponse, isProcessing, language }: UserInputPanelProps) {
  const t = getTranslations(language);
  const [input, setInput] = useState('');
  const [lastClickedCommand, setLastClickedCommand] = useState<string | null>(null);
  const responseContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new response arrives
  useEffect(() => {
    if (agentResponse && responseContainerRef.current) {
      responseContainerRef.current.scrollTop = 0;
    }
  }, [agentResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendCommand(input.trim());
      setInput('');
    }
  };

  const handleQuickCommand = (cmd: string) => {
    if (!isProcessing) {
      setLastClickedCommand(cmd);
      onSendCommand(cmd);
      setTimeout(() => setLastClickedCommand(null), 800);
    }
  };

  const quickCommands = language === 'zh'
    ? ['打开导航', '播放音乐', '查看电量', '调节空调', '座椅加热']
    : ['Open Navigation', 'Play Music', 'Check Battery', 'Adjust Climate', 'Seat Heating'];

  const isDetailedResponse = typeof agentResponse === 'object' && agentResponse !== null;
  const decision = isDetailedResponse ? agentResponse as AgentDecision : null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        {t.userInput.title}
      </h2>

      {/* Agent Response - Fixed Height with Scroll */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-300">{t.agent.title}</span>
        </div>
        <div
          ref={responseContainerRef}
          className="bg-slate-900/70 rounded-lg border border-slate-700 h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        >
          <div className="p-3">
            {agentResponse ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  {decision?.allowed !== undefined && (
                    decision.allowed ?
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> :
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-white leading-relaxed flex-1">
                    {decision ? decision.response : agentResponse}
                  </p>
                </div>

                {decision && (
                  <>
                    <div className="border-t border-slate-700 pt-2">
                      <div className="flex items-start gap-2">
                        <Brain className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-purple-300 mb-0.5">{t.agent.reasoning}</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{decision.reasoning}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <div className="flex items-start gap-2">
                        <Activity className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-300 mb-0.5">{t.agent.action}</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{decision.action_taken}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-2">
                      <div className="flex items-start gap-2">
                        <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-amber-300 mb-0.5">{t.agent.suggestion}</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{decision.risk_assessment}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-500 italic">{t.agent.noResponse}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="mb-3">
        <span className="text-xs font-medium text-slate-400 mb-2 block">
          {language === 'zh' ? '快捷命令' : 'Quick Commands'}
        </span>
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleQuickCommand(cmd)}
              disabled={isProcessing}
              className={`px-2 py-1 text-xs rounded-lg border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                lastClickedCommand === cmd
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                  : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-slate-600'
              }`}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.userInput.placeholder}
          disabled={isProcessing}
          className="flex-1 bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t.userInput.sending}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t.userInput.sendButton}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
