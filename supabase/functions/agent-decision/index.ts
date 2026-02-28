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
  vehicle_state_id?: string;
}

interface AgentDecision {
  response: string;
  reasoning: string;
  action_taken: string;
  risk_assessment: string;
  allowed: boolean;
}

function generateAgentDecision(input: string, gear: string, distractionLevel: number, safetyLevel: number, speed: number): AgentDecision {
  const inputLower = input.toLowerCase();

  // 分类功能类型
  const isNavigation = inputLower.includes('导航') || inputLower.includes('地图') || inputLower.includes('路线');
  const isMusic = inputLower.includes('音乐') || inputLower.includes('歌曲') || inputLower.includes('播放');
  const isPhone = inputLower.includes('电话') || inputLower.includes('通话');
  const isVideo = inputLower.includes('视频') || inputLower.includes('游戏');
  const isSettings = inputLower.includes('设置') || inputLower.includes('配置');
  const isComfortControl = inputLower.includes('空调') || inputLower.includes('温度') ||
                          inputLower.includes('座椅') || inputLower.includes('加热');
  const isInfoQuery = inputLower.includes('电量') || inputLower.includes('续航') ||
                      inputLower.includes('天气') || inputLower.includes('能耗');
  const isEmotionalInput = inputLower.includes('无聊') || inputLower.includes('累') ||
                          inputLower.includes('困') || inputLower.includes('放松');

  // 1. 停车/空档状态 - 最高优先级：车辆静止，所有功能开放
  if (gear === 'P' || gear === 'N') {
    const normalResponse = processNormalRequest(inputLower);
    return {
      response: "✓ 车辆已停稳，" + normalResponse.response,
      reasoning: `环境分析：车辆处于${gear === 'P' ? '停车' : '空档'}状态，速度为0，所有功能均可安全使用。即使驾驶员分心也不影响安全。`,
      action_taken: normalResponse.action,
      risk_assessment: "无风险：车辆静止，环境安全",
      allowed: true
    };
  }

  // 2. 倒车状态 - 需要全神贯注
  if (gear === 'R') {
    if (inputLower.includes('倒车') || inputLower.includes('后退') || inputLower.includes('影像')) {
      return {
        response: "✓ 倒车辅助已激活，360度全景影像已启用。",
        reasoning: "倒车场景识别：驾驶员需要后方视野，AI自动启动全景影像和倒车雷达。",
        action_taken: "启动全景影像 | 激活倒车雷达 | 娱乐系统静音",
        risk_assessment: "中等风险：倒车操作，需集中注意力",
        allowed: true
      };
    }
    return {
      response: "⚠️ 倒车模式下，娱乐功能已自动静音，请注意周围环境。",
      reasoning: "AI安全策略：倒车为高风险操作，系统自动限制可能分散注意力的功能。",
      action_taken: "娱乐系统静音 | 后视摄像头激活 | 雷达启动",
      risk_assessment: "中等风险：倒车状态，需保持警觉",
      allowed: false
    };
  }

  // 3. 分心状态 - 仅在驾驶中检查（D档且速度>0）
  if (distractionLevel > 0 && gear === 'D' && speed > 0) {
    // 导航和信息查询在分心状态下仍允许（驾驶必需）
    if (isNavigation || isInfoQuery) {
      return {
        response: "⚠️ 检测到分心状态！" + (isNavigation ? "导航系统已切换为语音模式，" : "信息已通过语音播报，") + "请专注驾驶。",
        reasoning: `分析驾驶员注意力：分心等级${distractionLevel}%，存在安全风险。${isNavigation ? '导航' : '信息查询'}属于驾驶必需功能，允许使用但切换为纯语音模式，减少视觉干扰。`,
        action_taken: "强制语音模式 | AR透明度降至0.3 | 触发专注提醒",
        risk_assessment: "中等风险：驾驶员分心，仅允许必需功能",
        allowed: true
      };
    }
    return {
      response: "⚠️ 检测到分心状态！请立即专注驾驶，非紧急任务已推迟。",
      reasoning: `AI安全判断：检测到驾驶员注意力不集中（分心等级${distractionLevel}%），为保障行车安全，系统拒绝非必要功能请求。`,
      action_taken: "请求被拦截 | AR透明度锁定0.3 | 触发警报",
      risk_assessment: "高风险：驾驶员分心且请求非必要功能",
      allowed: false
    };
  }

  // 4. 驾驶状态（D档且速度>0）- 分级处理
  if (gear === 'D' && speed > 0) {
    // 4.1 绝对禁止：视频、游戏、复杂设置
    if (isVideo || isSettings) {
      return {
        response: `🚫 驾驶模式下禁止${isVideo ? '视频/游戏' : '设置操作'}，请停车后使用。`,
        reasoning: `安全优先原则：车速${speed}km/h，${isVideo ? '视频/游戏' : '复杂设置'}会严重分散注意力，AI判定为高危操作。`,
        action_taken: "请求被拒绝 | 已记录待办事项 | 停车后提醒",
        risk_assessment: "高风险：会严重影响驾驶安全",
        allowed: false
      };
    }

    // 4.2 导航：驾驶必需功能，始终允许
    if (isNavigation) {
      if (speed > 60) {
        return {
          response: "✓ 导航已启动，高速模式下自动切换为语音引导，HUD显示关键路口信息。",
          reasoning: `AI智能判断：车速${speed}km/h，高速行驶中。导航是驾驶必需功能，采用语音为主、HUD辅助的模式，确保安全。`,
          action_taken: "启动语音导航 | HUD显示关键信息 | 简化路线图",
          risk_assessment: "低风险：语音导航不影响驾驶",
          allowed: true
        };
      }
      return {
        response: "✓ 导航系统已启动，正在为您规划最优路线。",
        reasoning: `车速${speed}km/h，低中速行驶。导航是驾驶辅助功能，完全允许使用。`,
        action_taken: "启动完整导航 | HUD路线投影 | 实时路况",
        risk_assessment: "低风险：导航辅助驾驶",
        allowed: true
      };
    }

    // 4.3 音乐/电话/情绪化输入：允许但建议语音控制
    if (isMusic || isPhone || isEmotionalInput) {
      if (speed > 80 || safetyLevel < 2) {
        return {
          response: `✓ ${isMusic ? '音乐' : isPhone ? '电话' : '娱乐'}功能已启用，但当前车速较快，建议使用方向盘语音控制。`,
          reasoning: `AI决策：车速${speed}km/h，安全等级${safetyLevel}。${isMusic ? '音乐播放' : isPhone ? '语音通话' : '放松娱乐'}不影响驾驶，但建议用语音控制减少手动操作。`,
          action_taken: isMusic ? "启动音乐播放 | 方向盘控制提示" : isPhone ? "激活蓝牙通话 | 语音接听模式" : "启动娱乐功能 | 语音控制模式",
          risk_assessment: "低风险：被动娱乐，建议语音操作",
          allowed: true
        };
      }
      const normalResponse = processNormalRequest(inputLower);
      return {
        response: "✓ " + normalResponse.response,
        reasoning: `车速${speed}km/h，安全等级${safetyLevel}。${isMusic ? '音乐' : isPhone ? '电话' : '娱乐'}功能不影响驾驶安全，完全允许。`,
        action_taken: normalResponse.action,
        risk_assessment: "低风险：不影响驾驶",
        allowed: true
      };
    }

    // 4.4 舒适性控制：完全允许（空调、座椅等）
    if (isComfortControl) {
      const normalResponse = processNormalRequest(inputLower);
      return {
        response: "✓ " + normalResponse.response,
        reasoning: `车速${speed}km/h。舒适性功能（空调/座椅）是简单操作，不影响驾驶安全，完全允许。`,
        action_taken: normalResponse.action,
        risk_assessment: "无风险：舒适性功能",
        allowed: true
      };
    }

    // 4.5 信息查询：完全允许（电量、天气等）
    if (isInfoQuery) {
      const normalResponse = processNormalRequest(inputLower);
      return {
        response: "✓ " + normalResponse.response,
        reasoning: `车速${speed}km/h。信息查询是被动获取，通过语音播报，不影响驾驶。`,
        action_taken: normalResponse.action + " | 语音播报",
        risk_assessment: "无风险：信息查询",
        allowed: true
      };
    }

    // 4.6 其他请求：根据速度和安全等级判断
    const normalResponse = processNormalRequest(inputLower);
    return {
      response: normalResponse.response,
      reasoning: `车速${speed}km/h，安全等级${safetyLevel}。AI评估该操作为简单功能，可以安全执行。`,
      action_taken: normalResponse.action,
      risk_assessment: "低风险：简单操作",
      allowed: true
    };
  }

  // 5. 其他状态（如D档但速度为0）
  const normalResponse = processNormalRequest(inputLower);
  return {
    response: normalResponse.response,
    reasoning: "车辆状态正常，驾驶员注意力集中，所有功能可安全使用。",
    action_taken: normalResponse.action,
    risk_assessment: "无风险",
    allowed: true
  };
}

function processNormalRequest(input: string): { response: string; action: string } {
  // Navigation - 导航相关
  if (input.includes('导航') || input.includes('地图') || input.includes('路线') ||
      input.includes('去') || input.includes('到') || input.includes('前往')) {
    return {
      response: "导航系统已启动，正在规划最优路线并考虑沿途充电站。",
      action: "启动导航系统 | 规划智能路线 | 标注充电站"
    };
  }

  // Music & Entertainment - 音乐娱乐（增强情绪识别）
  if (input.includes('音乐') || input.includes('歌曲') || input.includes('播放') || input.includes('歌')) {
    return {
      response: "音乐播放器已打开，正在为您播放推荐歌单。",
      action: "启动音乐播放器 | 加载推荐歌单 | 沉浸式音响"
    };
  }

  // Emotion: Bored - 无聊时提供娱乐建议
  if (input.includes('无聊') || input.includes('boring') || input.includes('bored')) {
    return {
      response: "检测到您可能需要一些放松～为您打开音乐播放器，推荐轻松愉快的歌曲帮您缓解疲劳。",
      action: "启动音乐播放器 | 推荐放松歌单 | 调节氛围灯"
    };
  }

  // Phone Call - 电话通讯
  if (input.includes('电话') || input.includes('通话') || input.includes('联系')) {
    return {
      response: "语音通话系统就绪，请说出联系人姓名。",
      action: "激活语音通话 | 准备拨号系统"
    };
  }

  // Weather - 天气查询
  if (input.includes('天气')) {
    return {
      response: "当前天气：晴，22°C，适合驾驶。",
      action: "查询天气数据 | 建议开启节能模式"
    };
  }

  // Seat Heating - 座椅加热（优先级高，包括情绪："好冷"）
  if (input.includes('座椅') || input.includes('加热') || input.includes('通风') ||
      input.includes('好冷') || input.includes('冷')) {
    return {
      response: "座椅加热已开启，按摩功能可用。",
      action: "启动座椅加热 | 激活按摩功能"
    };
  }

  // Climate Control - 空调系统（包括情绪："好热"）
  if (input.includes('空调') || input.includes('温度') || input.includes('好热') ||
      input.includes('热') || input.includes('制冷') || input.includes('制热')) {
    return {
      response: "智能空调系统已调整至舒适温度22°C。",
      action: "调节温度至22°C | 热泵模式 | 能效优化"
    };
  }

  // Battery Status - 电量续航
  if (input.includes('电量') || input.includes('续航') || input.includes('充电') ||
      input.includes('电池')) {
    return {
      response: "当前电量：85%，预计续航420公里。最近充电站距离12公里。",
      action: "查询电池状态 | 计算续航里程 | 定位充电站"
    };
  }

  // Energy Consumption - 能耗分析
  if (input.includes('能耗') || input.includes('能量')) {
    return {
      response: "当前能耗：15.2kWh/100km，驾驶效率良好。",
      action: "分析能耗数据 | 提供节能建议"
    };
  }

  // Ambient Light - 氛围灯
  if (input.includes('氛围灯') || input.includes('灯光')) {
    return {
      response: "智能氛围灯已调整为舒适驾驶模式。",
      action: "调整氛围灯 | 舒适驾驶场景"
    };
  }

  // Emotion: Tired - 疲劳时提供建议
  if (input.includes('累') || input.includes('困') || input.includes('疲劳') || input.includes('tired')) {
    return {
      response: "检测到您可能有些疲劳，建议您：降低空调温度保持清醒、播放节奏明快的音乐，或者就近寻找休息区。安全第一！",
      action: "调低温度至20°C | 播放提神音乐 | 搜索休息区"
    };
  }

  // Emotion: Relaxed - 放松娱乐
  if (input.includes('放松') || input.includes('休息') || input.includes('relax')) {
    return {
      response: "为您营造放松氛围：调节舒适温度、播放轻音乐、调整座椅按摩模式。",
      action: "舒适温度22°C | 轻音乐播放 | 座椅按摩启动"
    };
  }

  // General greeting - 打招呼
  if (input.includes('你好') || input.includes('嗨') || input.includes('hello') || input.includes('hi')) {
    return {
      response: "您好！我是您的AI驾驶助手，随时为您服务。您可以让我帮您导航、播放音乐、调节空调等。",
      action: "语音问候 | 功能提示"
    };
  }

  // Help & Features - 帮助功能
  if (input.includes('帮助') || input.includes('功能') || input.includes('help')) {
    return {
      response: "我可以帮您：智能导航、播放音乐、拨打电话、查询电量续航、调节空调、座椅控制、氛围灯设置等。试试说'无聊'、'好冷'、'播放音乐'等。",
      action: "显示功能列表 | 语音提示"
    };
  }

  // Thanks - 感谢
  if (input.includes('谢谢') || input.includes('感谢') || input.includes('thank')) {
    return {
      response: "不客气！很高兴为您服务，祝您行车愉快！",
      action: "礼貌回应"
    };
  }

  // Default fallback - 更友好的未识别响应
  return {
    response: `收到您的指令"${input}"。我会尽力为您处理。如果我理解有误，您可以试试说："播放音乐"、"打开导航"、"调节空调"等明确指令。`,
    action: "处理自定义指令 | 提供指令建议"
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

    const decision = generateAgentDecision(
      requestData.user_input,
      requestData.gear,
      requestData.distraction_level,
      requestData.safety_level,
      requestData.speed
    );

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
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        response: decision.response,
        reasoning: decision.reasoning,
        action_taken: decision.action_taken,
        risk_assessment: decision.risk_assessment,
        allowed: decision.allowed,
        response_time_ms: responseTime,
        decision_id: data.id,
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
