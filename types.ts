export interface Measurement {
  id: string;
  timestamp: number;
  angle: number;
  side: 'Left' | 'Right' | 'Center';
  location: string;
  notes?: string;
  interpretation?: string;
}

export interface SensorData {
  beta: number | null;
  gamma: number | null;
  alpha: number | null;
}

export enum AppState {
  IDLE = 'IDLE',
  CALIBRATING = 'CALIBRATING',
  MEASURING = 'MEASURING',
  RESULTS = 'RESULTS'
}

export interface GeminiResponse {
  summary: string;
  recommendations: string[];
}