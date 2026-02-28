/*
  # Add Comprehensive Sensor Fields to Vehicle States

  ## Changes
  This migration adds realistic sensor data fields to support 8 different driving scenarios:
  - High-speed cruise (疲劳检测)
  - City traffic (拥堵路况)
  - Reverse parking (倒车入库)
  - Parked waiting (停车等待)
  - Low battery (低电量)
  - Bad weather (恶劣天气)
  - Emergency brake (紧急制动)
  - School pickup (接送孩子)

  ## New Columns Added to `vehicle_states`
  
  ### Environment & Context
  - `battery_percentage` (integer) - Battery level 0-100%
  - `cabin_temp` (integer) - Cabin temperature in Celsius
  - `location` (text) - Current location description
  - `weather` (text) - Weather condition
  - `scenario_type` (text) - Scenario identifier

  ### Driver Monitoring
  - `driving_duration_minutes` (integer) - Total driving time
  - `fatigue_level` (integer) - Driver fatigue 0-100%

  ### Safety Sensors
  - `front_distance_m` (numeric) - Distance to front obstacle in meters
  - `rear_distance_m` (numeric) - Distance to rear obstacle in meters
  - `lane_keeping` (text) - Lane keeping status (good/warning/deviation)
  - `aeb_triggered` (boolean) - Emergency brake triggered

  ## Security
  - No changes to RLS policies
  - All new fields have sensible defaults
  - Fields are nullable to support gradual adoption
*/

-- Add environment and context fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'battery_percentage'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN battery_percentage integer DEFAULT 80;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'cabin_temp'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN cabin_temp integer DEFAULT 22;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'location'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN location text DEFAULT '市区道路';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'weather'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN weather text DEFAULT '晴天';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'scenario_type'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN scenario_type text;
  END IF;
END $$;

-- Add driver monitoring fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'driving_duration_minutes'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN driving_duration_minutes integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'fatigue_level'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN fatigue_level integer;
  END IF;
END $$;

-- Add safety sensor fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'front_distance_m'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN front_distance_m numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'rear_distance_m'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN rear_distance_m numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'lane_keeping'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN lane_keeping text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_states' AND column_name = 'aeb_triggered'
  ) THEN
    ALTER TABLE vehicle_states ADD COLUMN aeb_triggered boolean DEFAULT false;
  END IF;
END $$;

-- Create index on scenario_type for faster scenario-based queries
CREATE INDEX IF NOT EXISTS idx_vehicle_states_scenario_type ON vehicle_states(scenario_type);
