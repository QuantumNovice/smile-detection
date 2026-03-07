import test from "node:test";
import assert from "node:assert/strict";

import {
  createReadyState,
  finishRound,
  getWinnerLabel,
  startRound,
  updateScores,
} from "../src/game.js";

test("startRound creates a running state with a 10 second window by default", () => {
  const now = 1_000;
  const state = startRound(now);

  assert.equal(state.status, "running");
  assert.deepEqual(state.scores, [0, 0]);
  assert.equal(state.startedAt, now);
  assert.equal(state.endsAt, now + 10_000);
});

test("finishRound determines the winner from the final scores", () => {
  const running = updateScores(startRound(1_000), [3, 5]);
  const finished = finishRound(running);

  assert.equal(finished.status, "finished");
  assert.equal(finished.winner, "Person 2");
});

test("getWinnerLabel returns tie when scores are equal", () => {
  assert.equal(getWinnerLabel([4, 4]), "Tie");
});

test("createReadyState resets scores and keeps the app ready", () => {
  const ready = createReadyState("Ready again.");

  assert.equal(ready.status, "ready");
  assert.deepEqual(ready.scores, [0, 0]);
  assert.equal(ready.statusMessage, "Ready again.");
});
