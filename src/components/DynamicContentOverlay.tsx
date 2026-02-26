import { MapPin, Music, Battery, Thermometer, Flame, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Language } from '../i18n';

interface DynamicContentOverlayProps {
  activeFeature: string | null;
  isAllowed: boolean;
  language: Language;
}

export function DynamicContentOverlay({ activeFeature, isAllowed, language }: DynamicContentOverlayProps) {
  const [musicProgress, setMusicProgress] = useState(0);

  useEffect(() => {
    if (activeFeature === 'music' && isAllowed) {
      const interval = setInterval(() => {
        setMusicProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 0.5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeFeature, isAllowed]);

  if (!activeFeature) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-in fade-in duration-500">
      <div className="w-full max-w-xl mx-4">
        {activeFeature === 'navigation' && renderNavigation()}
        {activeFeature === 'music' && renderMusic()}
        {activeFeature === 'battery' && renderBattery()}
        {activeFeature === 'climate' && renderClimate()}
        {activeFeature === 'seat' && renderSeat()}
      </div>
    </div>
  );

  function renderNavigation() {
    return (
      <div className={`bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border-2 shadow-xl h-[340px] ${
        isAllowed ? 'border-green-500/50' : 'border-red-500/50'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isAllowed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <MapPin className={`w-7 h-7 ${isAllowed ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl">
              {language === 'zh' ? '导航系统' : 'Navigation System'}
            </h2>
            <p className="text-slate-400 text-xs">
              {language === 'zh' ? 'Navigation System' : '导航系统'}
            </p>
          </div>
        </div>

        {isAllowed ? (
          <div className="space-y-3">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-400 font-medium">
                  {language === 'zh' ? '路线规划中...' : 'Planning route...'}
                </span>
              </div>
              <div className="text-white text-base mb-1">
                {language === 'zh' ? '📍 目的地: 市中心商业区' : '📍 Destination: Downtown Business District'}
              </div>
              <div className="text-slate-300 text-sm">
                {language === 'zh' ? '预计时间: 15分钟 | 距离: 8.5公里' : 'ETA: 15 min | Distance: 8.5 km'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-xl p-3 text-center">
                <div className="text-cyan-400 text-2xl font-bold">15</div>
                <div className="text-xs text-cyan-300">
                  {language === 'zh' ? '预计分钟' : 'Minutes'}
                </div>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl p-3 text-center">
                <div className="text-blue-400 text-2xl font-bold">8.5</div>
                <div className="text-xs text-blue-300">
                  {language === 'zh' ? '公里距离' : 'Kilometers'}
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
              <p className="text-green-400 text-sm">
                {language === 'zh' ? '✓ 导航已激活，HUD路线投影已启用' : '✓ Navigation active, HUD route projection enabled'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-4">
            <p className="text-red-400 font-medium mb-1">
              {language === 'zh' ? '🚫 当前无法启用导航' : '🚫 Navigation unavailable'}
            </p>
            <p className="text-red-300 text-sm">
              {language === 'zh' ? '驾驶模式下导航功能受限，请在安全条件下使用' : 'Navigation limited in driving mode, use only in safe conditions'}
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderMusic() {
    return (
      <div className={`bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border-2 shadow-xl h-[340px] ${
        isAllowed ? 'border-green-500/50' : 'border-red-500/50'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isAllowed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <Music className={`w-7 h-7 ${isAllowed ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl">
              {language === 'zh' ? '音乐播放器' : 'Music Player'}
            </h2>
            <p className="text-slate-400 text-xs">
              {language === 'zh' ? 'Music Player' : '音乐播放器'}
            </p>
          </div>
        </div>

        {isAllowed ? (
          <div className="space-y-3">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">晴天</h3>
                <p className="text-slate-400 text-sm">周杰伦 - 叶惠美</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>{Math.floor(musicProgress * 2.4 / 60)}:{String(Math.floor(musicProgress * 2.4 % 60)).padStart(2, '0')}</span>
                  <span>4:00</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${musicProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-500/15 border border-green-500/40 rounded-lg p-3 text-center">
              <span className="text-green-400 text-sm font-medium">
                {language === 'zh' ? '🎵 正在播放 - 音质: 无损' : '🎵 Now Playing - Quality: Lossless'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-4">
            <p className="text-red-400 font-medium mb-1">
              {language === 'zh' ? '🚫 音乐功能暂时不可用' : '🚫 Music temporarily unavailable'}
            </p>
            <p className="text-red-300 text-sm">
              {language === 'zh' ? '当前驾驶环境下娱乐功能受限，请注意安全' : 'Entertainment features limited in current driving environment'}
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderBattery() {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border-2 border-cyan-500/50 shadow-xl h-[340px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/20">
            <Battery className="w-7 h-7 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl">
              {language === 'zh' ? '电池状态' : 'Battery Status'}
            </h2>
            <p className="text-slate-400 text-xs">
              {language === 'zh' ? 'Battery Status' : '电池状态'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">
                {language === 'zh' ? '当前电量' : 'Current Charge'}
              </span>
              <span className="text-cyan-400 text-3xl font-bold">85%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 w-[85%]" />
            </div>
            <div className="text-sm text-slate-400">
              {language === 'zh' ? '电池状态良好，剩余电量充足' : 'Battery in good condition, sufficient charge remaining'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
              <div className="text-cyan-400 text-2xl font-bold">420</div>
              <div className="text-xs text-slate-400">
                {language === 'zh' ? '续航里程 (km)' : 'Range (km)'}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
              <div className="text-green-400 text-2xl font-bold">
                {language === 'zh' ? '优秀' : 'Excellent'}
              </div>
              <div className="text-xs text-slate-400">
                {language === 'zh' ? '电池健康' : 'Battery Health'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderClimate() {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-500/50 shadow-xl h-[340px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <Thermometer className="w-7 h-7 text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl">
              {language === 'zh' ? '空调系统' : 'Climate Control'}
            </h2>
            <p className="text-slate-400 text-xs">
              {language === 'zh' ? 'Climate Control' : '空调系统'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
            <div className="text-center mb-3">
              <div className="text-blue-400 text-5xl font-bold mb-1">22°C</div>
              <div className="text-slate-400 text-sm">
                {language === 'zh' ? '目标温度' : 'Target Temperature'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-xs">16°</span>
              <div className="flex-1 h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400 rounded-full" />
              <span className="text-orange-400 text-xs">28°</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-slate-700/50">
              <div className="text-blue-400 text-base font-bold">
                {language === 'zh' ? '自动' : 'Auto'}
              </div>
              <div className="text-xs text-slate-400">
                {language === 'zh' ? '运行模式' : 'Mode'}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-slate-700/50">
              <div className="text-green-400 text-base font-bold">
                {language === 'zh' ? '中档' : 'Medium'}
              </div>
              <div className="text-xs text-slate-400">
                {language === 'zh' ? '风速' : 'Fan Speed'}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-slate-700/50">
              <div className="text-cyan-400 text-base font-bold">
                {language === 'zh' ? '运行中' : 'Active'}
              </div>
              <div className="text-xs text-slate-400">
                {language === 'zh' ? '状态' : 'Status'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSeat() {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border-2 border-orange-500/50 shadow-xl h-[340px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-orange-500/20">
            <Flame className="w-7 h-7 text-orange-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-xl">
              {language === 'zh' ? '座椅加热' : 'Seat Heating'}
            </h2>
            <p className="text-slate-400 text-xs">
              {language === 'zh' ? 'Seat Heating' : '座椅加热'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">
                {language === 'zh' ? '加热等级' : 'Heating Level'}
              </span>
              <span className="text-orange-400 text-3xl font-bold">
                {language === 'zh' ? '2级' : 'Level 2'}
              </span>
            </div>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`flex-1 h-3 rounded-full transition-all ${
                    level <= 2 ? 'bg-gradient-to-r from-orange-500 to-orange-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-slate-400">
              {language === 'zh' ? '舒适温度，按摩功能可用' : 'Comfortable temperature, massage available'}
            </div>
          </div>

          <div className="bg-orange-500/15 border border-orange-500/40 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              <span className="text-orange-400 text-sm font-medium">
                {language === 'zh' ? '座椅加热系统已激活' : 'Seat heating system activated'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
