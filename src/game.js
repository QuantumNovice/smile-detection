import { APP_CONFIG, APP_STATES } from "./config.js";

export function createInitialState() {
  return {
    status: APP_STATES.LOADING,
    scores: [0, 0],
    startedAt: null,
    endsAt: null,
    winner: null,
    statusMessage: "Loading face detection models...",
    errorMessage: "",
  };
}

export function createReadyState(message = "Camera ready. Click Start to begin.") {
  return {
    status: APP_STATES.READY,
    scores: [0, 0],
    startedAt: null,
    endsAt: null,
    winner: null,
    statusMessage: message,
    errorMessage: "",
  };
}

export function startRound(now = Date.now(), durationMs = APP_CONFIG.ROUND_DURATION_MS) {
  return {
    status: APP_STATES.RUNNING,
    scores: [0, 0],
    startedAt: now,
    endsAt: now + durationMs,
    winner: null,
    statusMessage: "Round in progress.",
    errorMessage: "",
  };
}

export function updateScores(state, scores) {
  return {
    ...state,
    scores: [...scores],
  };
}

export function finishRound(state, now = Date.now()) {
  return {
    ...state,
    status: APP_STATES.FINISHED,
    endsAt: state.endsAt ?? now,
    winner: getWinnerLabel(state.scores),
    statusMessage: "Round finished.",
    errorMessage: "",
  };
}

export function createErrorState(message) {
  return {
    status: APP_STATES.ERROR,
    scores: [0, 0],
    startedAt: null,
    endsAt: null,
    winner: null,
    statusMessage: "The app could not start.",
    errorMessage: message,
  };
}

export function getWinnerLabel(scores) {
  if (scores[0] === scores[1]) {
    return "Tie";
  }

  return scores[0] > scores[1] ? "Person 1" : "Person 2";
}
