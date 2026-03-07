import test from "node:test";
import assert from "node:assert/strict";

import { createTrackerState, updateTracker } from "../src/smileTracker.js";

function frame(xCenter, happy) {
  return { xCenter, happy };
}

test("counts a smile only once for a continuous happy sequence", () => {
  let tracker = createTrackerState();
  const options = {
    frameWidth: 400,
    minSmileFrames: 3,
    smileThreshold: 0.7,
    smileCooldownMs: 900,
  };

  tracker = updateTracker(tracker, [frame(100, 0.8)], 0, options).state;
  tracker = updateTracker(tracker, [frame(100, 0.8)], 100, options).state;
  tracker = updateTracker(tracker, [frame(100, 0.8)], 200, options).state;
  tracker = updateTracker(tracker, [frame(100, 0.8)], 300, options).state;

  assert.equal(tracker.players[0].score, 1);
});

test("requires a neutral reset before another smile can count", () => {
  let tracker = createTrackerState();
  const options = {
    frameWidth: 400,
    minSmileFrames: 2,
    smileThreshold: 0.7,
    smileCooldownMs: 300,
  };

  tracker = updateTracker(tracker, [frame(100, 0.9)], 0, options).state;
  tracker = updateTracker(tracker, [frame(100, 0.9)], 100, options).state;
  tracker = updateTracker(tracker, [frame(100, 0.9)], 500, options).state;
  assert.equal(tracker.players[0].score, 1);

  tracker = updateTracker(tracker, [frame(100, 0.1)], 600, options).state;
  tracker = updateTracker(tracker, [frame(100, 0.9)], 700, options).state;
  tracker = updateTracker(tracker, [frame(100, 0.9)], 800, options).state;
  assert.equal(tracker.players[0].score, 2);
});

test("keeps player lanes stable when detections arrive in a different order", () => {
  let tracker = createTrackerState();
  const options = {
    frameWidth: 500,
    minSmileFrames: 1,
    smileThreshold: 0.7,
    smileCooldownMs: 0,
  };

  tracker = updateTracker(tracker, [frame(100, 0.9), frame(360, 0.1)], 0, options).state;
  tracker = updateTracker(tracker, [frame(365, 0.1), frame(105, 0.9)], 100, options).state;

  assert.equal(tracker.players[0].xCenter, 105);
  assert.equal(tracker.players[1].xCenter, 365);
  assert.equal(tracker.players[0].score, 1);
  assert.equal(tracker.players[1].score, 0);
});

test("clears a player lane after the face disappears for too long", () => {
  let tracker = createTrackerState();
  const options = {
    frameWidth: 500,
    minSmileFrames: 1,
    smileThreshold: 0.7,
    smileCooldownMs: 0,
    playerStaleMs: 200,
  };

  tracker = updateTracker(tracker, [frame(120, 0.1)], 0, options).state;
  tracker = updateTracker(tracker, [], 300, options).state;

  assert.equal(tracker.players[0].xCenter, null);
  assert.equal(tracker.players[0].smiling, false);
});

test("does not let a far-away face hijack an existing lane", () => {
  let tracker = createTrackerState();
  const options = {
    frameWidth: 500,
    minSmileFrames: 1,
    smileThreshold: 0.7,
    smileCooldownMs: 0,
    maxAssignmentDistanceRatio: 0.1,
  };

  tracker = updateTracker(tracker, [frame(100, 0.1), frame(380, 0.1)], 0, options).state;
  tracker = updateTracker(tracker, [frame(390, 0.9)], 100, options).state;

  assert.equal(tracker.players[0].xCenter, 100);
  assert.equal(tracker.players[1].xCenter, 390);
});
