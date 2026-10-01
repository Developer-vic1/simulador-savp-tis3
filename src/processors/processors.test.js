import { describe, expect, it } from "vitest";
import { student, careerCatalog, scenarios } from "../data/demo.js";
import {
  answerScenario,
  buildCareerProfiles,
  integrateEvidence,
  processAnalytics,
  processRiasec,
  retrieve,
} from "./index.js";

const traceId = "SAVP-TEST-0001";
describe("evidencia calculada", () => {
  it("normaliza cada respuesta RIASEC y deriva el código Holland", () => {
    const result = processRiasec(student.riasecAnswers, traceId);
    expect(result.dimensions.I).toBe(
      student.riasecAnswers
        .slice(5, 10)
        .reduce((sum, answer) => sum + answer - 1, 0),
    );
    expect(result.code).toHaveLength(3);
    expect(new Set(result.code).size).toBe(3);
    expect(result.traceId).toBe(traceId);
  });
  it("conserva los datos ausentes como null y no infiere una nota", () => {
    const analytics = processAnalytics([], null, null, traceId);
    expect(analytics).toMatchObject({ status: "missing", value: null });
    const riasec = processRiasec([], traceId);
    expect(riasec.value).toBeNull();
  });
  it("deriva tendencias y perfiles sin compatibilidades prefijadas", () => {
    const vocational = processRiasec(student.riasecAnswers, traceId);
    const analytics = processAnalytics(
      student.periods,
      student.attendance,
      student.activity,
      traceId,
    );
    expect(analytics.trends.Matemática.change).toBe(8);
    const retrieval = retrieve(student.query, traceId);
    expect(retrieval.documentCount).toBeGreaterThan(0);
    expect(retrieval.evidence[0]).toMatchObject({ traceId, verified: false });
    const evidence = integrateEvidence({
      riasec: vocational,
      analytics,
      retrieval,
      student,
      traceId,
    });
    expect(
      evidence.missing.find((item) => item.id === "MISS-EXTERNAL"),
    ).toMatchObject({ status: "missing", value: null });
    const profiles = buildCareerProfiles(evidence, student, traceId);
    expect(profiles).toHaveLength(careerCatalog.length);
    expect(
      profiles.every((profile) =>
        profile.rules.every((rule) => rule.traceId === traceId),
      ),
    ).toBe(true);
    expect(
      profiles.every((profile) => !("expectedCompatibility" in profile)),
    ).toBe(true);
  });
  it("convierte opciones de escenarios en evidencia diferente y trazable", () => {
    const first = answerScenario(scenarios[0], 0, traceId);
    const second = answerScenario(scenarios[0], 1, traceId);
    expect(first).not.toEqual(second);
    expect(second[0]).toMatchObject({
      sourceId: "SIM-01",
      traceId,
      type: "simulation",
    });
  });
});
