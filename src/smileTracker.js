import { APP_CONFIG, PLAYER_LABELS } from "./config.js";

function createPlayer(index) {
  return {
    id: index,
    label: PLAYER_LABELS[index],
    score: 0,
    xCenter: null,
    lastSeenAt: null,
    lastSmileAt: Number.NEGATIVE_INFINITY,
    smileFrames: 0,
    smiling: false,
  };
}

export function createTrackerState() {
  return {
    players: [createPlayer(0), createPlayer(1)],
  };
}

export function sortFacesByX(faces) {
  return [...faces].sort((left, right) => left.xCenter - right.xCenter);
}

export function updateTracker(
  currentState,
  detectedFaces,
  now,
  {
    frameWidth,
    smileThreshold = APP_CONFIG.SMILE_THRESHOLD,
    minSmileFrames = APP_CONFIG.MIN_SMILE_FRAMES,
    smileCooldownMs = APP_CONFIG.SMILE_COOLDOWN_MS,
    playerStaleMs = APP_CONFIG.PLAYER_STALE_MS,
    maxAssignmentDistanceRatio = APP_CONFIG.MAX_ASSIGNMENT_DISTANCE_RATIO,
  }
) {
  const state = {
    players: currentState.players.map((player) => ({ ...player })),
  };
  const faces = sortFacesByX(detectedFaces).slice(0, state.players.length);
  const assignments = assignFaces(state.players, faces, frameWidth, maxAssignmentDistanceRatio);
  const scoreChanges = [0, 0];

  state.players.forEach((player, index) => {
    const face = assignments[index];

    if (!face) {
      if (player.lastSeenAt !== null && now - player.lastSeenAt >= playerStaleMs) {
        player.xCenter = null;
        player.smileFrames = 0;
        player.smiling = false;
      }
      return;
    }

    player.xCenter = face.xCenter;
    player.lastSeenAt = now;

    if (advanceSmileState(player, face.happy, now, smileThreshold, minSmileFrames, smileCooldownMs)) {
      player.score += 1;
      scoreChanges[index] = 1;
    }
  });

  return {
    state,
    scoreChanges,
    visibleFaceCount: detectedFaces.length,
  };
}

function advanceSmileState(player, happyScore, now, smileThreshold, minSmileFrames, smileCooldownMs) {
  if (happyScore < smileThreshold) {
    player.smileFrames = 0;
    player.smiling = false;
    return false;
  }

  player.smileFrames += 1;

  if (!player.smiling && player.smileFrames >= minSmileFrames) {
    player.smiling = true;

    if (now - player.lastSmileAt >= smileCooldownMs) {
      player.lastSmileAt = now;
      return true;
    }
  }

  return false;
}

function assignFaces(players, faces, frameWidth = 1, maxAssignmentDistanceRatio) {
  const assignments = new Array(players.length).fill(null);
  const unmatchedFaceIndexes = new Set(faces.map((_, index) => index));
  const maxDistance = Math.max(frameWidth * maxAssignmentDistanceRatio, 1);
  const knownPlayers = players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => player.xCenter !== null);

  const candidatePairs = [];

  knownPlayers.forEach(({ player, index }) => {
    faces.forEach((face, faceIndex) => {
      candidatePairs.push({
        faceIndex,
        playerIndex: index,
        distance: Math.abs(player.xCenter - face.xCenter),
      });
    });
  });

  candidatePairs
    .sort((left, right) => left.distance - right.distance)
    .forEach(({ playerIndex, faceIndex, distance }) => {
      if (distance > maxDistance) {
        return;
      }

      if (assignments[playerIndex] || !unmatchedFaceIndexes.has(faceIndex)) {
        return;
      }

      assignments[playerIndex] = faces[faceIndex];
      unmatchedFaceIndexes.delete(faceIndex);
    });

  const remainingFaces = [...unmatchedFaceIndexes].map((index) => faces[index]);
  const unassignedPlayers = players
    .map((_, index) => index)
    .filter((index) => assignments[index] === null);

  unassignedPlayers.forEach((playerIndex, sequenceIndex) => {
    assignments[playerIndex] = remainingFaces[sequenceIndex] ?? null;
  });

  return assignments;
}
