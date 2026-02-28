import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AgentRequest {
  user_input: string;
  gear: string;
  distraction_level: number;
  safety_level: number;
  speed: number;
  battery_percentage?: number;
  cabin_temp?: number;
  weather?: string;
  scenario_type?: string;
  aeb_triggered?: boolean;
  fatigue_level?: number;
  vehicle_state_id?: string;
}

interface AgentDecision {
  response: string;
  reasoning: string;
  action_taken: string;
  risk_assessment: string;
  allowed: boolean;
}

function classifyCommand(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('导航') || lower.includes('地图') || lower.includes('路线') || lower.includes('去') || lower.includes('到')) {
    return 'navigation';
  }
  if (lower.includes('音乐') || lower.includes('播放') || lower.includes('歌') || lower.includes('无聊')) {
    return 'music';
  }
  if (lower.includes('视频') || lower.includes('游戏') || lower.includes('电影')) {
    return 'video';
  }
  if (lower.includes('电话') || lower.includes('通话') || lower.includes('打给')) {
    return 'phone';
  }
  if (lower.includes('消息') || lower.includes('短信') || lower.includes('微信')) {
    return 'message';
  }
  if (lower.includes('座椅') && (lower.includes('调节') || lower.includes('位置') || lower.includes('前后') || lower.includes('靠背'))) {
    return 'seat_adjust';
  }
  if (lower.includes('座椅') && (lower.includes('加热') || lower.includes('通风') || lower.includes('按摩'))) {
    return 'seat_comfort';
  }
  if (lower.includes('空调') || lower.includes('温度') || lower.includes('好热') || lower.includes('好冷') || lower.includes('制冷') || lower.includes('制热')) {
    return 'climate';
  }
  if (lower.includes('电量') || lower.includes('续航') || lower.includes('充电')) {
    return 'battery_query';
  }
  if (lower.includes('车窗') || lower.includes('天窗')) {
    return 'window';
  }
  if (lower.includes('设置') || lower.includes('配置')) {
    return 'settings';
  }
  if (lower.includes('氛围灯') || lower.includes('灯光')) {
    return 'ambient_light';
  }

  return 'general';
}

function generateAgentDecision(req: AgentRequest): AgentDecision {
  const { user_input, gear, speed, distraction_level, battery_percentage, cabin_temp, weather, scenario_type, aeb_triggered, fatigue_level } = req;

  const commandType = classifyCommand(user_input);

  if (aeb_triggered) {
    if (commandType === 'phone' && user_input.includes('紧急')) {
      return {
        response: "✓ 紧急通话系统已激活，正在拨打紧急联系人。",
        reasoning: "检测到紧急制动事件，驾驶员请求紧急通话，这是安全必需功能，立即允许。",
        action_taken: "激活紧急通话 | 双闪已开启 | 记录事件数据",
        risk_assessment: "紧急状态：允许紧急通话",
        allowed: true
      };
    }

    return {
      response: "⚠️ 紧急制动已触发！所有非安全功能已锁定，请确认车辆及周围环境安全。",
      reasoning: "AEB紧急制动触发，系统进入安全锁定模式，只允许安全相关操作（如紧急通话）。",
      action_taken: "全系统静音 | 双闪启动 | AR-HUD显示警告 | 记录行车数据",
      risk_assessment: "极高风险：紧急制动状态，禁止所有非安全功能",
      allowed: false
    };
  }

  if (battery_percentage !== undefined && battery_percentage < 10) {
    if (commandType === 'navigation') {
      return {
        response: "⚠️ 电量危急（" + battery_percentage + "%）！导航已自动规划至最近充电站（15km），限制高功耗功能。",
        reasoning: "电量不足10%，续航严重受限。导航至充电站是当前最紧急的任务，自动规划路线。同时限制空调、座椅加热等高功耗功能以保证续航。",
        action_taken: "自动导航至充电站 | 关闭空调制冷 | 座椅加热停用 | 限速80km/h",
        risk_assessment: "高风险：电量危急，必须立即充电",
        allowed: true
      };
    }

    if (commandType === 'climate' || commandType === 'seat_comfort') {
      return {
        response: "🚫 电量不足" + battery_percentage + "%，已禁用高功耗功能。导航已规划至最近充电站（15km），请优先充电。",
        reasoning: "电量危急状态下，空调制冷和座椅加热/通风属于高功耗非必需功能，为保证续航必须禁用。",
        action_taken: "拒绝高功耗操作 | 维持通风模式 | 导航充电站",
        risk_assessment: "高风险：电量不足，禁用高功耗功能",
        allowed: false
      };
    }

    if (commandType === 'battery_query') {
      return {
        response: "⚠️ 当前电量" + battery_percentage + "%，续航约" + Math.floor(battery_percentage * 3.5) + "公里。最近充电站15公里，已为您规划路线。",
        reasoning: "电量查询是信息获取功能，完全允许。同时主动提供充电站信息。",
        action_taken: "查询电量数据 | 计算续航 | 定位充电站 | 语音播报",
        risk_assessment: "无风险：信息查询",
        allowed: true
      };
    }
  }

  if (gear === 'R') {
    if (user_input.includes('倒车') || user_input.includes('影像') || user_input.includes('后') || user_input.includes('摄像')) {
      return {
        response: "✓ 倒车辅助系统已全面激活：360°全景影像、倒车雷达、AR轨迹线已显示。",
        reasoning: "倒车场景，驾驶员需要后方视野辅助。系统自动启用全景影像、雷达和AR轨迹，这是倒车必需功能。",
        action_taken: "全屏360°影像 | 倒车雷达激活 | AR轨迹投影 | 娱乐系统静音",
        risk_assessment: "中等风险：倒车操作，需集中注意力",
        allowed: true
      };
    }

    if (commandType === 'music' || commandType === 'video' || commandType === 'phone' || commandType === 'navigation') {
      return {
        response: "⚠️ R档倒车中，已禁用娱乐和通讯功能。倒车影像和雷达已自动激活，请专注周围环境。",
        reasoning: "倒车是高风险操作，需要驾驶员全神贯注。音乐、视频、电话、导航等功能会分散注意力，必须禁用。系统强制显示倒车影像。",
        action_taken: "拒绝娱乐功能 | 全屏倒车影像 | 雷达报警优先",
        risk_assessment: "中等风险：倒车状态，禁用分散注意力的功能",
        allowed: false
      };
    }

    if (commandType === 'seat_adjust' || commandType === 'window' || commandType === 'settings') {
      return {
        response: "🚫 倒车模式下禁止" + (commandType === 'seat_adjust' ? '座椅调节' : commandType === 'window' ? '车窗操作' : '系统设置') + "，请停车后操作。",
        reasoning: "倒车时调节座椅会导致驾驶姿势变化，车窗操作会影响倒车雷达，系统设置需要菜单操作，都会严重影响安全。",
        action_taken: "拒绝操作 | 保持倒车影像显示",
        risk_assessment: "中等风险：倒车中禁止物理调节",
        allowed: false
      };
    }

    if (commandType === 'climate') {
      return {
        response: "⚠️ 倒车模式下，空调保持当前状态（" + (cabin_temp || 24) + "°C），暂不支持调节。",
        reasoning: "倒车需要全神贯注，空调调节虽然简单但会分散注意力，暂时禁用。保持当前舒适状态。",
        action_taken: "维持空调状态 | 倒车影像优先显示",
        risk_assessment: "低风险：保持现状，不允许调节",
        allowed: false
      };
    }
  }

  if (gear === 'P' || (gear === 'N' && speed === 0)) {
    const parkingResponse = processParkedCommand(user_input, commandType, cabin_temp, battery_percentage);
    return {
      ...parkingResponse,
      reasoning: `环境分析：车辆已停稳（${gear}档，速度0），所有功能均可安全使用。${parkingResponse.reasoning}`,
      risk_assessment: "无风险：车辆静止状态"
    };
  }

  if (weather && (weather.includes('雨') || weather.includes('雾'))) {
    if (commandType === 'video' || commandType === 'settings' || commandType === 'ambient_light') {
      return {
        response: "⚠️ 恶劣天气（" + weather + "），能见度低，已禁用非必要功能。请专注驾驶，建议时速<50km/h。",
        reasoning: `当前天气：${weather}，能见度降低，路面湿滑。视频/游戏/复杂设置会严重分散注意力，必须禁用。`,
        action_taken: "拒绝操作 | 自动除雾 | AR增强车道线 | 降低娱乐音量",
        risk_assessment: "高风险：恶劣天气，禁用分心功能",
        allowed: false
      };
    }

    if (commandType === 'climate') {
      return {
        response: "✓ 恶劣天气模式：空调已切换除雾优先，前后风挡自动除雾，确保视野清晰。",
        reasoning: `${weather}天气，车窗易起雾。空调除雾是安全必需功能，优先级最高，立即执行。`,
        action_taken: "自动除雾模式 | 前后风挡加热 | 空调风量最大",
        risk_assessment: "低风险：安全必需功能",
        allowed: true
      };
    }

    if (commandType === 'navigation' || commandType === 'battery_query') {
      return {
        response: "✓ " + (commandType === 'navigation' ? "导航已启动，恶劣天气模式下语音引导已增强，AR-HUD显示车道线。" : "当前电量" + (battery_percentage || 65) + "%，续航约" + Math.floor((battery_percentage || 65) * 3.5) + "公里。"),
        reasoning: `${weather}天气，能见度低。${commandType === 'navigation' ? '导航' : '电量查询'}是驾驶必需信息，采用语音为主模式，减少视觉干扰。`,
        action_taken: commandType === 'navigation' ? "语音导航 | AR车道增强 | HUD简化显示" : "语音播报电量 | HUD显示续航",
        risk_assessment: "低风险：驾驶必需信息",
        allowed: true
      };
    }
  }

  if (fatigue_level !== undefined && fatigue_level > 70) {
    if (commandType === 'music') {
      return {
        response: "✓ 检测到疲劳驾驶（疲劳度" + fatigue_level + "%）！已为您播放节奏明快的音乐，空调降至20°C，建议前方服务区休息。",
        reasoning: "高疲劳状态下，播放提神音乐、降低温度可帮助保持清醒。同时主动建议休息，这是安全辅助措施。",
        action_taken: "播放提神音乐 | 降温至20°C | 座椅振动提醒 | 导航服务区",
        risk_assessment: "中等风险：疲劳驾驶，需提神措施",
        allowed: true
      };
    }

    if (commandType === 'phone' || commandType === 'message' || commandType === 'video') {
      return {
        response: "⚠️ 检测到疲劳驾驶（疲劳度" + fatigue_level + "%）！已禁用" + (commandType === 'video' ? '视频' : '通讯') + "功能，强烈建议前方服务区休息15分钟。",
        reasoning: "高疲劳状态下反应迟钝，视频/消息/拨打电话会进一步分散注意力，极度危险，必须拒绝。",
        action_taken: "拒绝操作 | 播放提神音乐 | 降温 | 导航服务区 | 座椅振动警告",
        risk_assessment: "高风险：疲劳驾驶，禁用分心功能",
        allowed: false
      };
    }

    if (commandType === 'climate') {
      return {
        response: "✓ 检测到疲劳！空调已自动降至20°C，增强通风，帮助您保持清醒。前方12公里有服务区，建议休息。",
        reasoning: "疲劳驾驶状态，降温是有效的提神措施，主动执行。同时引导驾驶员休息。",
        action_taken: "降温至20°C | 通风模式 | 播放提神音乐 | 导航服务区",
        risk_assessment: "低风险：提神措施",
        allowed: true
      };
    }
  }

  if (distraction_level > 60 && gear === 'D' && speed > 0) {
    if (commandType === 'navigation' || commandType === 'battery_query') {
      return {
        response: "⚠️ 检测到分心（注意力" + (100 - distraction_level) + "%）！" + (commandType === 'navigation' ? "导航已切换纯语音模式" : "电量信息已语音播报") + "，请立即专注驾驶！",
        reasoning: `分心等级${distraction_level}%，存在严重安全隐患。${commandType === 'navigation' ? '导航' : '电量查询'}是必需功能，但必须切换为纯语音模式，禁止触摸操作。`,
        action_taken: "强制语音模式 | AR透明度降至0.3 | 触发专注提醒",
        risk_assessment: "高风险：驾驶员分心，仅语音模式",
        allowed: true
      };
    }

    return {
      response: "🚫 检测到严重分心（注意力" + (100 - distraction_level) + "%）！所有非紧急功能已锁定，请立即专注前方道路！",
      reasoning: `AI安全判断：检测到驾驶员严重分心（分心度${distraction_level}%），车速${speed}km/h，为保障行车安全，系统拒绝所有非必要功能。`,
      action_taken: "请求拦截 | AR透明度锁定0.3 | 声音警报 | 座椅振动",
      risk_assessment: "极高风险：严重分心且高速行驶",
      allowed: false
    };
  }

  if (gear === 'D' && speed > 0) {
    return processDrivingCommand(user_input, commandType, speed, cabin_temp, battery_percentage);
  }

  const normalResponse = processNormalRequest(user_input, commandType, cabin_temp, battery_percentage);
  return {
    ...normalResponse,
    reasoning: `车辆状态正常（${gear}档，${speed}km/h），环境安全。${normalResponse.reasoning}`,
    risk_assessment: "无风险"
  };
}

function processParkedCommand(input: string, commandType: string, cabin_temp?: number, battery?: number): Omit<AgentDecision, 'reasoning' | 'risk_assessment'> {
  if (commandType === 'video') {
    return {
      response: "✓ 车辆已停稳，视频播放器已打开，为您推荐热门影片。座椅可调节至舒适位置。",
      reasoning: "停车状态，所有娱乐功能无限制开放。",
      action_taken: "启动视频播放器 | 推荐影片列表 | 座椅可调节提示",
      allowed: true
    };
  }

  if (commandType === 'seat_adjust') {
    return {
      response: "✓ 座椅调节已启用，您可以调节至最舒适的位置，启用按摩功能放松一下。",
      reasoning: "停车状态，座椅调节完全安全。",
      action_taken: "启用座椅调节 | 激活按摩功能 | 显示调节界面",
      allowed: true
    };
  }

  if (commandType === 'climate' && cabin_temp !== undefined) {
    if (cabin_temp > 28) {
      return {
        response: "✓ 检测到车内高温（" + cabin_temp + "°C），空调已启动制冷至24°C，预计消耗3%电量。",
        reasoning: "停车状态且温度过高，主动开启空调提升舒适度。",
        action_taken: "启动空调制冷 | 目标温度24°C | 节能模式",
        allowed: true
      };
    }
    return {
      response: "✓ 空调已调节至舒适温度22°C，停车状态下可任意调节。",
      reasoning: "停车状态，空调功能无限制。",
      action_taken: "调节空调至22°C | 智能温控模式",
      allowed: true
    };
  }

  const normal = processNormalRequest(input, commandType, cabin_temp, battery);
  return {
    response: "✓ 车辆已停稳，" + normal.response,
    action_taken: normal.action_taken,
    allowed: true
  };
}

function processDrivingCommand(input: string, commandType: string, speed: number, cabin_temp?: number, battery?: number): AgentDecision {
  if (commandType === 'video' || commandType === 'settings' || commandType === 'message') {
    return {
      response: "🚫 驾驶中禁止" + (commandType === 'video' ? '视频/游戏' : commandType === 'settings' ? '系统设置' : '消息查看') + "，请停车后使用。",
      reasoning: `车速${speed}km/h，行驶中。${commandType === 'video' ? '视频/游戏' : commandType === 'settings' ? '复杂设置' : '消息查看'}会严重分散注意力，属于高危操作，必须拒绝。`,
      action_taken: "请求被拒绝 | 已记录待办 | 停车后提醒",
      risk_assessment: "高风险：会严重影响驾驶安全",
      allowed: false
    };
  }

  if (commandType === 'seat_adjust') {
    return {
      response: "🚫 驾驶中禁止调节座椅位置，会导致驾驶姿势变化，极度危险！请停车后操作。",
      reasoning: `车速${speed}km/h，行驶中调节座椅会导致身体移动、驾驶姿势改变，可能失去对方向盘的控制，极度危险。`,
      action_taken: "拒绝座椅调节 | 安全警告",
      risk_assessment: "极高风险：会导致驾驶姿势变化",
      allowed: false
    };
  }

  if (commandType === 'navigation') {
    if (speed > 60) {
      return {
        response: "✓ 导航已启动，高速模式下采用语音引导+AR-HUD显示，简化路线图确保安全。",
        reasoning: `车速${speed}km/h，高速行驶。导航是必需功能，采用语音为主、HUD辅助模式，最小化视觉干扰。`,
        action_taken: "启动语音导航 | AR-HUD关键路口 | 简化路线图",
        risk_assessment: "低风险：语音导航不影响驾驶",
        allowed: true
      };
    }
    return {
      response: "✓ 导航系统已启动，正在规划最优路线，AR-HUD投影已启用。",
      reasoning: `车速${speed}km/h，中低速行驶。导航是驾驶辅助功能，完全允许。`,
      action_taken: "启动完整导航 | AR-HUD路线投影 | 实时路况",
      risk_assessment: "低风险：导航辅助驾驶",
      allowed: true
    };
  }

  if (commandType === 'music' || commandType === 'phone') {
    if (speed > 80) {
      return {
        response: "✓ " + (commandType === 'music' ? '音乐播放器' : '蓝牙通话') + "已启用，车速较快，建议使用方向盘语音控制。",
        reasoning: `车速${speed}km/h，高速行驶。${commandType === 'music' ? '音乐' : '语音通话'}不影响驾驶，但建议用方向盘控制减少手动操作。`,
        action_taken: commandType === 'music' ? "启动音乐播放 | 方向盘控制提示" : "激活蓝牙通话 | 语音接听模式",
        risk_assessment: "低风险：被动娱乐，建议语音操作",
        allowed: true
      };
    }
    const normal = processNormalRequest(input, commandType, cabin_temp, battery);
    return {
      ...normal,
      reasoning: `车速${speed}km/h，安全范围。${commandType === 'music' ? '音乐' : '电话'}功能不影响驾驶安全。`,
      risk_assessment: "低风险：不影响驾驶",
      allowed: true
    };
  }

  if (commandType === 'climate' || commandType === 'seat_comfort' || commandType === 'battery_query') {
    const normal = processNormalRequest(input, commandType, cabin_temp, battery);
    return {
      ...normal,
      reasoning: `车速${speed}km/h。${commandType === 'climate' ? '空调' : commandType === 'seat_comfort' ? '座椅加热/通风' : '电量查询'}是简单/被动操作，不影响安全。`,
      risk_assessment: "无风险：简单操作",
      allowed: true
    };
  }

  if (commandType === 'window') {
    if (speed > 80) {
      return {
        response: "⚠️ 车速" + speed + "km/h过高，禁止开启车窗/天窗，会影响空气动力学和噪音。",
        reasoning: "高速行驶时开窗会产生强烈风噪、影响空气阻力和油耗，存在安全隐患。",
        action_taken: "拒绝车窗操作 | 建议降速后操作",
        risk_assessment: "中等风险：高速开窗不安全",
        allowed: false
      };
    }
    return {
      response: "✓ 车窗控制已启用，可以开启车窗通风。",
      reasoning: `车速${speed}km/h，安全范围内允许车窗操作。`,
      action_taken: "启用车窗控制 | 开启通风",
      risk_assessment: "低风险",
      allowed: true
    };
  }

  if (commandType === 'ambient_light') {
    if (speed > 60) {
      return {
        response: "⚠️ 车速" + speed + "km/h，氛围灯调节功能暂不可用，请专注驾驶。",
        reasoning: "中高速行驶时调节氛围灯需要菜单操作，会分散注意力。",
        action_taken: "拒绝氛围灯调节",
        risk_assessment: "中等风险：需要菜单操作",
        allowed: false
      };
    }
    return {
      response: "✓ 氛围灯已调整为舒适驾驶模式。",
      reasoning: `车速${speed}km/h，低速行驶，氛围灯调节不影响安全。`,
      action_taken: "调整氛围灯 | 舒适驾驶场景",
      risk_assessment: "低风险",
      allowed: true
    };
  }

  const normal = processNormalRequest(input, commandType, cabin_temp, battery);
  return {
    ...normal,
    reasoning: `车速${speed}km/h，评估为简单功能，可以安全执行。`,
    risk_assessment: "低风险",
    allowed: true
  };
}

function processNormalRequest(input: string, commandType: string, cabin_temp?: number, battery?: number): Omit<AgentDecision, 'reasoning' | 'risk_assessment'> {
  if (commandType === 'navigation') {
    return {
      response: "导航系统已启动，正在规划最优路线并标注沿途充电站。",
      action_taken: "启动导航 | 智能路线规划 | 标注充电站",
      allowed: true
    };
  }

  if (commandType === 'music') {
    return {
      response: "音乐播放器已打开，正在播放推荐歌单。",
      action_taken: "启动音乐播放 | 加载推荐歌单 | 沉浸式音响",
      allowed: true
    };
  }

  if (commandType === 'phone') {
    return {
      response: "语音通话系统就绪，请说出联系人姓名。",
      action_taken: "激活蓝牙通话 | 准备拨号系统",
      allowed: true
    };
  }

  if (commandType === 'seat_comfort') {
    return {
      response: "座椅加热和按摩功能已启用，为您提供舒适体验。",
      action_taken: "启动座椅加热 | 激活按摩模式",
      allowed: true
    };
  }

  if (commandType === 'climate') {
    const temp = cabin_temp || 24;
    if (temp > 28) {
      return {
        response: "检测到车内温度偏高（" + temp + "°C），空调已调至舒适温度22°C。",
        action_taken: "降温至22°C | 智能节能模式",
        allowed: true
      };
    }
    if (temp < 18) {
      return {
        response: "检测到车内温度偏低（" + temp + "°C），空调已调至舒适温度22°C。",
        action_taken: "升温至22°C | 座椅加热推荐",
        allowed: true
      };
    }
    return {
      response: "智能空调系统已调整至舒适温度22°C。",
      action_taken: "调节温度至22°C | 智能温控",
      allowed: true
    };
  }

  if (commandType === 'battery_query') {
    const bat = battery || 65;
    const range = Math.floor(bat * 3.5);
    return {
      response: "当前电量：" + bat + "%，预计续航" + range + "公里。最近充电站距离12公里。",
      action_taken: "查询电池状态 | 计算续航 | 定位充电站",
      allowed: true
    };
  }

  if (input.includes('你好') || input.includes('嗨') || input.includes('hello')) {
    return {
      response: "您好！我是您的AI驾驶助手，随时为您服务。可以让我帮您导航、播放音乐、调节空调等。",
      action_taken: "语音问候 | 功能提示",
      allowed: true
    };
  }

  if (input.includes('帮助') || input.includes('功能') || input.includes('help')) {
    return {
      response: "我可以帮您：智能导航、播放音乐、拨打电话、查询电量续航、调节空调、座椅控制、氛围灯设置等。",
      action_taken: "显示功能列表 | 语音提示",
      allowed: true
    };
  }

  if (input.includes('谢谢') || input.includes('感谢') || input.includes('thank')) {
    return {
      response: "不客气！很高兴为您服务，祝您行车愉快！",
      action_taken: "礼貌回应",
      allowed: true
    };
  }

  return {
    response: `收到您的指令"${input}"。我会尽力为您处理。如需明确指令，可以试试："播放音乐"、"打开导航"、"调节空调"等。`,
    action_taken: "处理自定义指令 | 提供建议",
    allowed: true
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const startTime = Date.now();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: AgentRequest = await req.json();

    const decision = generateAgentDecision(requestData);

    const responseTime = Date.now() - startTime;

    const { data, error } = await supabase
      .from('agent_decisions')
      .insert({
        user_input: requestData.user_input,
        agent_response: decision.response,
        vehicle_state_id: requestData.vehicle_state_id || null,
        response_time_ms: responseTime,
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        response: decision.response,
        reasoning: decision.reasoning,
        action_taken: decision.action_taken,
        risk_assessment: decision.risk_assessment,
        allowed: decision.allowed,
        response_time_ms: responseTime,
        decision_id: data?.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
