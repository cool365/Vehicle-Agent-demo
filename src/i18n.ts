export type Language = 'zh' | 'en';

export interface Translations {
  common: {
    vehicleStatus: string;
    userInput: string;
    performance: string;
    agentResponse: string;
  };
  vehicle: {
    gear: string;
    speed: string;
    speedUnit: string;
    safetyLevel: string;
    distractionLevel: string;
    arOpacity: string;
    gearP: string;
    gearR: string;
    gearN: string;
    gearD: string;
  };
  userInput: {
    title: string;
    placeholder: string;
    sendButton: string;
    sending: string;
  };
  agent: {
    title: string;
    loading: string;
    noResponse: string;
    action: string;
    reasoning: string;
    suggestion: string;
  };
  performance: {
    title: string;
    fps: string;
    latency: string;
    ms: string;
    cpu: string;
    memory: string;
  };
  arHud: {
    vehicleAgent: string;
    contextAware: string;
    speed: string;
    gear: string;
    safetyLevel: string;
    status: string;
    statusNormal: string;
    statusWarning: string;
    statusDanger: string;
    agentActive: string;
    agentStandby: string;
  };
}

export const translations: Record<Language, Translations> = {
  zh: {
    common: {
      vehicleStatus: '车辆状态',
      userInput: '用户输入',
      performance: '性能监控',
      agentResponse: 'Agent 响应',
    },
    vehicle: {
      gear: '档位',
      speed: '车速',
      speedUnit: 'km/h',
      safetyLevel: '安全等级',
      distractionLevel: '分心程度',
      arOpacity: 'AR透明度',
      gearP: '驻车档',
      gearR: '倒车档',
      gearN: '空档',
      gearD: '前进档',
    },
    userInput: {
      title: '与车辆 Agent 对话',
      placeholder: '输入指令或问题...',
      sendButton: '发送',
      sending: '发送中...',
    },
    agent: {
      title: 'Agent 分析',
      loading: '正在分析...',
      noResponse: '暂无响应',
      action: '建议操作',
      reasoning: '决策推理',
      suggestion: '安全建议',
    },
    performance: {
      title: '系统性能',
      fps: '帧率',
      latency: '延迟',
      ms: '毫秒',
      cpu: 'CPU使用率',
      memory: '内存使用',
    },
    arHud: {
      vehicleAgent: '车辆智能助手',
      contextAware: '场景感知系统',
      speed: '速度',
      gear: '档位',
      safetyLevel: '安全',
      status: '状态',
      statusNormal: '正常',
      statusWarning: '警告',
      statusDanger: '危险',
      agentActive: '激活',
      agentStandby: '待机',
    },
  },
  en: {
    common: {
      vehicleStatus: 'Vehicle Status',
      userInput: 'User Input',
      performance: 'Performance',
      agentResponse: 'Agent Response',
    },
    vehicle: {
      gear: 'Gear',
      speed: 'Speed',
      speedUnit: 'km/h',
      safetyLevel: 'Safety Level',
      distractionLevel: 'Distraction',
      arOpacity: 'AR Opacity',
      gearP: 'Park',
      gearR: 'Reverse',
      gearN: 'Neutral',
      gearD: 'Drive',
    },
    userInput: {
      title: 'Talk to Vehicle Agent',
      placeholder: 'Enter command or question...',
      sendButton: 'Send',
      sending: 'Sending...',
    },
    agent: {
      title: 'Agent Analysis',
      loading: 'Analyzing...',
      noResponse: 'No response yet',
      action: 'Suggested Action',
      reasoning: 'Reasoning',
      suggestion: 'Safety Suggestion',
    },
    performance: {
      title: 'System Performance',
      fps: 'FPS',
      latency: 'Latency',
      ms: 'ms',
      cpu: 'CPU Usage',
      memory: 'Memory',
    },
    arHud: {
      vehicleAgent: 'Vehicle Agent',
      contextAware: 'Context-Aware System',
      speed: 'Speed',
      gear: 'Gear',
      safetyLevel: 'Safety',
      status: 'Status',
      statusNormal: 'Normal',
      statusWarning: 'Warning',
      statusDanger: 'Danger',
      agentActive: 'Active',
      agentStandby: 'Standby',
    },
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}
