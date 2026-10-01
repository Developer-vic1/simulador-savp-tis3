import { describe, expect, it } from "vitest";
import { scenarios } from "../data/demo.js";
import { EventBus } from "./EventBus.js";
import { SimulationEngine } from "./SimulationEngine.js";

describe("EventBus", () => {
  it("entrega eventos hasta desuscribirse", () => {
    const bus = new EventBus();
    const received = [];
    const unsubscribe = bus.subscribe((event) => received.push(event.type));
    bus.emit({ type: "ONE" });
    unsubscribe();
    bus.emit({ type: "TWO" });
    expect(received).toEqual(["ONE"]);
  });
});

describe("SimulationEngine", () => {
  it("recorre la demo, exige escenarios y propaga el traceId hasta la salida", async () => {
    const engine = new SimulationEngine();
    engine.start();
    const traceId = engine.snapshot().traceId;
    for (let phase = 2; phase <= 7; phase++) await engine.next();
    expect(engine.snapshot().phase).toBe(7);
    await engine.next();
    expect(engine.snapshot().phase).toBe(7);
    for (const scenario of scenarios) engine.answer(scenario.id, 0);
    while (engine.snapshot().phase < 11) await engine.next();
    const state = engine.snapshot();
    expect(state.status).toBe("completed");
    expect(state.finalResult.traceId).toBe(traceId);
    expect(state.integrationResult.traceId).toBe(traceId);
    expect(
      state.simulationEvidence.every((item) => item.traceId === traceId),
    ).toBe(true);
    expect(state.history.every((event) => event.traceId === traceId)).toBe(
      true,
    );
    engine.previous();
    expect(engine.snapshot().phase).toBe(10);
    engine.reset();
    expect(engine.snapshot()).toMatchObject({
      phase: 0,
      status: "waiting",
      traceId: null,
    });
  });
  it("descarta resultados asíncronos de una ejecución reiniciada", async () => {
    const engine = new SimulationEngine();
    engine.start();
    await engine.next();
    await engine.next();
    const pending = engine.next();
    engine.reset();
    await pending;
    expect(engine.snapshot()).toMatchObject({
      phase: 0,
      status: "waiting",
      traceId: null,
    });
  });
});
