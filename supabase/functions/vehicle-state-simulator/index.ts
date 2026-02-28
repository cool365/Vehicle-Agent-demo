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
}

function calculateSafetyLevel(gear: string, distractionLevel: number, speed: number): number {
  let safety = 5;

  if (distractionLevel > 0) {
    safety = 2;
  }

  if (gear === 'D' && speed > 0) {
    safety = Math.min(safety, 1);
  }

  if (gear === 'P' || gear === 'N') {
    if (distractionLevel === 0) {
      safety = 5;
    } else {
      safety = 3;
    }
  }

  return Math.max(1, Math.min(5, safety));
}

function calculateAROpacity(safetyLevel: number, distractionLevel: number): number {
  if (distractionLevel > 0) {
    return 0.4;
  }

  if (safetyLevel === 1) {
    return 0.7;
  }

  const opacityMap: Record<number, number> = {
    5: 0.3,
    4: 0.35,
    3: 0.5,
    2: 0.4,
    1: 0.7,
  };
  return opacityMap[safetyLevel] || 0.5;
}

async function generateVehicleState(supabase: any): Promise<VehicleState> {
  const { data: lastState } = await supabase
    .from('vehicle_states')
    .select('gear')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let gear = 'P';
  const gears = ['P', 'R', 'N', 'D'];

  if (lastState) {
    if (lastState.gear === 'R') {
      gear = Math.random() < 0.3 ? 'R' : gears[Math.floor(Math.random() * gears.length)];
    } else if (lastState.gear === 'D') {
      gear = Math.random() < 0.6 ? 'D' : gears[Math.floor(Math.random() * gears.length)];
    } else {
      gear = Math.random() < 0.5 ? lastState.gear : gears[Math.floor(Math.random() * gears.length)];
    }
  } else {
    gear = gears[Math.floor(Math.random() * gears.length)];
  }

  let speed = 0;
  if (gear === 'D') speed = Math.floor(Math.random() * 121);
  else if (gear === 'R') speed = Math.floor(Math.random() * 15) + 3;

  const isDistracted = Math.random() < 0.1;
  const distraction_level = isDistracted ? Math.floor(Math.random() * 31) + 70 : 0;

  const safety_level = calculateSafetyLevel(gear, distraction_level, speed);
  const ar_opacity = calculateAROpacity(safety_level, distraction_level);

  return {
    speed,
    gear,
    safety_level,
    distraction_level,
    ar_opacity,
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
