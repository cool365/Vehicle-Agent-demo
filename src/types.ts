export interface VehicleState {
  id: string;
  speed: number;
  gear: string;
  safety_level: number;
  distraction_level: number;
  ar_opacity: number;
  created_at: string;
}

export interface AgentDecision {
  id: string;
  user_input: string;
  agent_response: string;
  vehicle_state_id: string | null;
  response_time_ms: number;
  created_at: string;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  totalRequests: number;
  lastUpdateTime: number;
  apiLatency: number;
}
