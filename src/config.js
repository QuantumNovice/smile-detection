export const APP_STATES = Object.freeze({
  LOADING: "loading",
  READY: "ready",
  RUNNING: "running",
  FINISHED: "finished",
  ERROR: "error",
});

export const APP_CONFIG = Object.freeze({
  MODEL_PATH: "./weights",
  ROUND_DURATION_MS: 10_000,
  DETECTION_INTERVAL_MS: 120,
  SMILE_THRESHOLD: 0.72,
  MIN_SMILE_FRAMES: 3,
  SMILE_COOLDOWN_MS: 900,
  PLAYER_STALE_MS: 750,
  MAX_ASSIGNMENT_DISTANCE_RATIO: 0.22,
  MIN_CONFIDENCE: 0.5,
});

export const PLAYER_LABELS = Object.freeze(["Person 1", "Person 2"]);
