/*
  # Vehicle Agent System Database Schema

  ## Overview
  This migration creates the database structure for a vehicle agent demonstration system
  that tracks vehicle states, agent decisions, and performance metrics.

  ## New Tables

  ### `vehicle_states`
  Stores real-time vehicle status information
  - `id` (uuid, primary key) - Unique identifier
  - `speed` (integer) - Current vehicle speed in km/h
  - `gear` (text) - Current gear (P/R/N/D/S)
  - `safety_level` (integer) - Safety level 1-5 (5 is safest)
  - `distraction_level` (integer) - Driver distraction level 0-100
  - `ar_opacity` (numeric) - AR HUD opacity 0.0-1.0
  - `created_at` (timestamptz) - Timestamp of the state

  ### `agent_decisions`
  Logs all agent decision interactions
  - `id` (uuid, primary key) - Unique identifier
  - `user_input` (text) - User command/query
  - `agent_response` (text) - Agent's response
  - `vehicle_state_id` (uuid) - Reference to vehicle state at time of decision
  - `response_time_ms` (integer) - Response time in milliseconds
  - `created_at` (timestamptz) - Timestamp of the decision

  ## Security
  - Enable RLS on all tables
  - Allow public read access (demo system)
  - Allow public write access for simulation purposes
*/

-- Create vehicle_states table
CREATE TABLE IF NOT EXISTS vehicle_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  speed integer NOT NULL DEFAULT 0,
  gear text NOT NULL DEFAULT 'P',
  safety_level integer NOT NULL DEFAULT 5,
  distraction_level integer NOT NULL DEFAULT 0,
  ar_opacity numeric NOT NULL DEFAULT 0.3,
  created_at timestamptz DEFAULT now()
);

-- Create agent_decisions table
CREATE TABLE IF NOT EXISTS agent_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_input text NOT NULL,
  agent_response text NOT NULL,
  vehicle_state_id uuid REFERENCES vehicle_states(id),
  response_time_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vehicle_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;

-- Public read access policies (demo system)
CREATE POLICY "Allow public read access to vehicle_states"
  ON vehicle_states FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to vehicle_states"
  ON vehicle_states FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to agent_decisions"
  ON agent_decisions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to agent_decisions"
  ON agent_decisions FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicle_states_created_at ON vehicle_states(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created_at ON agent_decisions(created_at DESC);