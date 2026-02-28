import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VehicleState {
  speed: number;
  gear: string;
  safety_level: number;
  distraction_level: number;
  ar_opacity: number;
  battery_percentage: number;
  cabin_temp: number;
  location: string;
  weather: string;
  driving_duration_minutes?: number;
  fatigue_level?: number;
  front_distance_m?: number;
  rear_distance_m?: number;
  lane_keeping?: string;
  aeb_triggered?: boolean;
  scenario_type?: string;
}

const SCENARIOS = [
  {
    type: 'highway_cruise',
    weight: 0.2,
    name: '高速巡航',
    state: {
      gear: 'D',
      speed: () => 90 + Math.floor(Math.random() * 20),
      battery_percentage: () => 50 + Math.floor(Math.random() * 30),
      cabin_temp: () => 24 + Math.floor(Math.random() * 4),
      location: '高速公路',
      weather: '晴天',
      driving_duration_minutes: () => 60 + Math.floor(Math.random() * 60),
      fatigue_level: () => 50 + Math.floor(Math.random() * 30),
      front_distance_m: () => 60 + Math.floor(Math.random() * 40),
      lane_keeping: 'good',
      distraction_level: () => Math.random() < 0.3 ? 60 + Math.floor(Math.random() * 20) : 0,
    }
  },
  {
    type: 'city_traffic',
    weight: 0.25,
    name: '市区拥堵',
    state: {
      gear: 'D',
      speed: () => 5 + Math.floor(Math.random() * 20),
      battery_percentage: () => 60 + Math.floor(Math.random() * 30),
      cabin_temp: () => 22 + Math.floor(Math.random() * 6),
      location: '市区拥堵路段',
      weather: '晴天',
      driving_duration_minutes: () => 20 + Math.floor(Math.random() * 40),
      front_distance_m: () => 3 + Math.floor(Math.random() * 7),
      distraction_level: () => Math.random() < 0.2 ? 30 + Math.floor(Math.random() * 30) : 0,
    }
  },
  {
    type: 'reverse_parking',
    weight: 0.1,
    name: '倒车入库',
    state: {
      gear: 'R',
      speed: () => 3 + Math.floor(Math.random() * 5),
      battery_percentage: () => 50 + Math.floor(Math.random() * 40),
      cabin_temp: () => 22 + Math.floor(Math.random() * 4),
      location: '停车场',
      weather: '晴天',
      rear_distance_m: () => 0.5 + Math.random() * 2,
      distraction_level: 0,
    }
  },
  {
    type: 'parked',
    weight: 0.15,
    name: '停车等待',
    state: {
      gear: 'P',
      speed: 0,
      battery_percentage: () => 40 + Math.floor(Math.random() * 50),
      cabin_temp: () => 20 + Math.floor(Math.random() * 10),
      location: () => ['购物中心', '办公楼', '住宅区'][Math.floor(Math.random() * 3)],
      weather: () => ['晴天', '多云'][Math.floor(Math.random() * 2)],
      distraction_level: 0,
    }
  },
  {
    type: 'low_battery',
    weight: 0.08,
    name: '低电量',
    state: {
      gear: 'D',
      speed: () => 40 + Math.floor(Math.random() * 30),
      battery_percentage: () => 5 + Math.floor(Math.random() * 10),
      cabin_temp: () => 20 + Math.floor(Math.random() * 8),
      location: '市区道路',
      weather: '晴天',
      front_distance_m: () => 20 + Math.floor(Math.random() * 30),
      distraction_level: 0,
    }
  },
  {
    type: 'bad_weather',
    weight: 0.12,
    name: '恶劣天气',
    state: {
      gear: 'D',
      speed: () => 30 + Math.floor(Math.random() * 25),
      battery_percentage: () => 50 + Math.floor(Math.random() * 30),
      cabin_temp: () => 18 + Math.floor(Math.random() * 6),
      location: '市区道路',
      weather: () => ['大雨', '暴雨', '大雾'][Math.floor(Math.random() * 3)],
      front_distance_m: () => 8 + Math.floor(Math.random() * 12),
      distraction_level: 0,
    }
  },
  {
    type: 'emergency_brake',
    weight: 0.05,
    name: '紧急制动',
    state: {
      gear: 'D',
      speed: () => 20 + Math.floor(Math.random() * 30),
      battery_percentage: () => 40 + Math.floor(Math.random() * 40),
      cabin_temp: () => 22 + Math.floor(Math.random() * 4),
      location: '市区道路',
      weather: '晴天',
      front_distance_m: () => 2 + Math.random() * 3,
      aeb_triggered: true,
      distraction_level: 0,
    }
  },
  {
    type: 'school_pickup',
    weight: 0.05,
    name: '接送孩子',
    state: {
      gear: () => Math.random() < 0.5 ? 'P' : 'D',
      speed: (gear: string) => gear === 'P' ? 0 : 10 + Math.floor(Math.random() * 20),
      battery_percentage: () => 50 + Math.floor(Math.random() * 30),
      cabin_temp: () => 22 + Math.floor(Math.random() * 4),
      location: '学校区域',
      weather: '晴天',
      front_distance_m: () => 10 + Math.floor(Math.random() * 20),
      distraction_level: 0,
    }
  }
];

function selectScenario(): any {
  const random = Math.random();
  let cumulative = 0;

  for (const scenario of SCENARIOS) {
    cumulative += scenario.weight;
    if (random <= cumulative) {
      return scenario;
    }
  }

  return SCENARIOS[0];
}

function calculateSafetyLevel(state: VehicleState): number {
  if (state.aeb_triggered) return 1;
  if (state.gear === 'R') return 2;
  if (state.battery_percentage < 10) return 1;
  if (state.weather?.includes('雨') || state.weather?.includes('雾')) return 2;
  if (state.distraction_level > 60) return 1;
  if (state.gear === 'P' || state.gear === 'N') return 5;
  if (state.gear === 'D' && state.speed === 0) return 4;
  if (state.gear === 'D' && state.speed < 30) return 3;
  if (state.gear === 'D' && state.speed < 80) return 3;
  return 2;
}

function calculateAROpacity(safetyLevel: number, distractionLevel: number): number {
  if (distractionLevel > 60) return 0.3;

  const opacityMap: Record<number, number> = {
    5: 0.3,
    4: 0.35,
    3: 0.5,
    2: 0.6,
    1: 0.8,
  };
  return opacityMap[safetyLevel] || 0.5;
}

async function generateVehicleState(supabase: any): Promise<VehicleState> {
  const scenario = selectScenario();
  const stateConfig = scenario.state;

  const gear = typeof stateConfig.gear === 'function' ? stateConfig.gear() : stateConfig.gear;
  const speed = typeof stateConfig.speed === 'function' ? stateConfig.speed(gear) : stateConfig.speed;
  const battery_percentage = typeof stateConfig.battery_percentage === 'function' ? stateConfig.battery_percentage() : stateConfig.battery_percentage;
  const cabin_temp = typeof stateConfig.cabin_temp === 'function' ? stateConfig.cabin_temp() : stateConfig.cabin_temp;
  const location = typeof stateConfig.location === 'function' ? stateConfig.location() : stateConfig.location;
  const weather = typeof stateConfig.weather === 'function' ? stateConfig.weather() : stateConfig.weather;
  const distraction_level = typeof stateConfig.distraction_level === 'function' ? stateConfig.distraction_level() : stateConfig.distraction_level || 0;

  const state: VehicleState = {
    speed,
    gear,
    battery_percentage,
    cabin_temp,
    location,
    weather,
    distraction_level,
    scenario_type: scenario.type,
    safety_level: 3,
    ar_opacity: 0.5,
  };

  if (stateConfig.driving_duration_minutes) {
    state.driving_duration_minutes = typeof stateConfig.driving_duration_minutes === 'function'
      ? stateConfig.driving_duration_minutes()
      : stateConfig.driving_duration_minutes;
  }

  if (stateConfig.fatigue_level) {
    state.fatigue_level = typeof stateConfig.fatigue_level === 'function'
      ? stateConfig.fatigue_level()
      : stateConfig.fatigue_level;
  }

  if (stateConfig.front_distance_m) {
    state.front_distance_m = typeof stateConfig.front_distance_m === 'function'
      ? stateConfig.front_distance_m()
      : stateConfig.front_distance_m;
  }

  if (stateConfig.rear_distance_m) {
    state.rear_distance_m = typeof stateConfig.rear_distance_m === 'function'
      ? stateConfig.rear_distance_m()
      : stateConfig.rear_distance_m;
  }

  if (stateConfig.lane_keeping) {
    state.lane_keeping = stateConfig.lane_keeping;
  }

  if (stateConfig.aeb_triggered) {
    state.aeb_triggered = stateConfig.aeb_triggered;
  }

  state.safety_level = calculateSafetyLevel(state);
  state.ar_opacity = calculateAROpacity(state.safety_level, state.distraction_level);

  return state;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const scenarioState = body.scenarioState;

    let vehicleState: any;

    if (scenarioState) {
      vehicleState = {
        speed: scenarioState.speed,
        gear: scenarioState.gear,
        safety_level: scenarioState.safety_level,
        distraction_level: scenarioState.distraction_level,
        ar_opacity: calculateAROpacity(scenarioState.safety_level, scenarioState.distraction_level),
        battery_percentage: scenarioState.battery_percentage,
        cabin_temp: scenarioState.cabin_temp,
        location: scenarioState.location,
        weather: scenarioState.weather,
      };
    } else {
      vehicleState = await generateVehicleState(supabase);
    }

    const { data, error } = await supabase
      .from('vehicle_states')
      .insert(vehicleState)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
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
