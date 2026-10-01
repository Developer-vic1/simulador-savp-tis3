import { student, scenarios } from "../data/demo.js";
import {
  answerScenario,
  buildCareerProfiles,
  explain,
  integrateEvidence,
  processAnalytics,
  processRiasec,
  retrieve,
} from "../processors/index.js";
import { EventBus } from "./EventBus.js";

export const phases = [
  {
    title: "Sistema en espera",
    node: "student",
    narrative:
      "El estudiante inicia una consulta. Los componentes permanecen en espera.",
  },
  {
    title: "Nueva ejecución",
    node: "student",
    narrative:
      "Se crea una ejecución independiente y su identificador de trazabilidad.",
  },
  {
    title: "Entradas validadas",
    node: "inputs",
    narrative:
      "Historial, consulta, intereses y 30 respuestas RIASEC se registran sin sustituir datos faltantes por cero.",
  },
  {
    title: "PETER 3 orquesta",
    node: "peter3",
    narrative:
      "PETER 3 prepara el contexto y distribuye el trabajo a tres procesadores.",
  },
  {
    title: "Procesamiento paralelo",
    node: "evidence",
    narrative:
      "RIASEC, analítica académica y recuperación documental se calculan en paralelo. La búsqueda local usa coincidencia léxica, no FAISS real.",
  },
  {
    title: "Motor de evidencia",
    node: "evidence",
    narrative:
      "Las evidencias se agrupan por dimensión. La ausencia de validación externa permanece como dato faltante.",
  },
  {
    title: "Bridge V2 y perfiles",
    node: "bridge",
    narrative:
      "Reglas explícitas relacionan intereses, asignaturas, BTH y documentos con perfiles ocupacionales.",
  },
  {
    title: "Experiencia profesional",
    node: "simulation",
    narrative:
      "Selecciona una carrera y responde tres situaciones. Cada respuesta crea evidencia de competencias.",
  },
  {
    title: "Nueva evidencia integrada",
    node: "evidence",
    narrative:
      "Las respuestas vuelven al motor de evidencia y se recalculan las dimensiones de cada perfil.",
  },
  {
    title: "Tutor basado en evidencia",
    node: "tutor",
    narrative:
      "La explicación incluye referencias a evidencias, datos ausentes y límites de la demo.",
  },
  {
    title: "Integración PETER 2",
    node: "peter2",
    narrative:
      "Se prepara el paquete JSON de intercambio para SAVP/PETER 2. Esta demo no envía datos a un servidor.",
  },
  {
    title: "Orientación trazable",
    node: "output",
    narrative:
      "La salida presenta dimensiones cualitativas y permite retroceder hasta sus fuentes.",
  },
];

let sequence = 0;
const clone = (value) => structuredClone(value);
const stamp = () => new Date().toISOString();
const localDate = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
};

export class SimulationEngine {
  constructor(demo = student) {
    this.demo = demo;
    this.bus = new EventBus();
    this.reset(false);
  }

  subscribe(listener) {
    return this.bus.subscribe(listener);
  }
  snapshot() {
    return clone(this.state);
  }
  notify() {
    this.bus.emit({ type: "STATE_CHANGED", state: this.snapshot() });
  }
  event(type, node, payload = {}) {
    const entry = {
      id: `EVT-${String(this.state.history.length + 1).padStart(4, "0")}`,
      type,
      node,
      payload,
      traceId: this.state.traceId,
      timestamp: stamp(),
      elapsedMs: this.state.startedAt
        ? Date.now() - Date.parse(this.state.startedAt)
        : 0,
    };
    this.state.history.push(entry);
    this.bus.emit(entry);
    return entry;
  }
  reset(announce = true) {
    clearTimeout(this.signalTimer);
    this.runVersion = (this.runVersion ?? 0) + 1;
    this.pending = false;
    this.checkpoints = [];
    this.state = {
      phase: 0,
      status: "waiting",
      mode: "guided",
      speed: 1,
      traceId: null,
      executionId: null,
      startedAt: null,
      student: this.demo,
      query: this.demo.query,
      inputs: null,
      riasecResult: null,
      learningAnalytics: null,
      retrieval: null,
      evidenceAnalysis: null,
      careerProfiles: [],
      selectedCareerId: null,
      scenarioAnswers: [],
      simulationEvidence: [],
      tutorResponse: null,
      integrationResult: null,
      finalResult: null,
      signals: [],
      history: [],
      warnings: [],
      limitations: [
        "Datos de demostración; requiere validación con fuentes y servicios reales.",
      ],
      missingData: [],
      nodes: {},
      completedPhases: [],
    };
    if (announce) {
      this.event("SIMULATION_RESET", "student");
      this.notify();
    }
  }
  start() {
    if (this.state.status !== "waiting") return;
    sequence += 1;
    const date = localDate();
    this.state.traceId = `SAVP-${date}-${String(sequence).padStart(4, "0")}`;
    this.state.executionId = crypto.randomUUID?.() ?? `${date}-${sequence}`;
    this.state.startedAt = stamp();
    this.state.status = "running";
    this.state.phase = 1;
    this.event("SIMULATION_CREATED", "student");
    this.event("TRACE_CREATED", "student", { traceId: this.state.traceId });
    this.event("SIMULATION_STARTED", "student");
    this.#phaseEvents();
    this.notify();
  }
  pause() {
    if (this.state.status === "running") {
      clearTimeout(this.signalTimer);
      this.state.status = "paused";
      this.event("SIMULATION_PAUSED", phases[this.state.phase].node);
      this.notify();
    }
  }
  resume() {
    if (this.state.status === "paused") {
      this.state.status = "running";
      this.event("SIMULATION_RESUMED", phases[this.state.phase].node);
      this.#settleSignals();
      this.notify();
    }
  }
  setMode(mode) {
    if (["guided", "explore"].includes(mode)) {
      this.state.mode = mode;
      this.notify();
    }
  }
  setSpeed(speed) {
    if ([0.5, 1, 1.5, 2].includes(Number(speed))) {
      this.state.speed = Number(speed);
      this.notify();
    }
  }
  selectCareer(id) {
    if (
      !this.state.careerProfiles.some((career) => career.id === id) ||
      this.state.scenarioAnswers.length > 0
    )
      return;
    this.state.selectedCareerId = id;
    if (this.state.phase >= 9)
      this.state.tutorResponse = explain(
        this.selectedCareer,
        this.state.evidenceAnalysis,
        this.state.traceId,
      );
    if (this.state.phase >= 10)
      this.state.integrationResult.careerProfiles = this.state.careerProfiles;
    if (this.state.phase >= 11)
      this.state.finalResult = {
        ...this.state.finalResult,
        profile: this.selectedCareer,
        explanation: this.state.tutorResponse,
      };
    this.notify();
  }
  get selectedCareer() {
    return this.state.careerProfiles.find(
      (career) => career.id === this.state.selectedCareerId,
    );
  }

  signal(type, source, target, payload = {}) {
    const signal = {
      id: `SIG-${String(this.state.history.length + 1).padStart(4, "0")}`,
      type,
      source,
      target,
      payload,
      traceId: this.state.traceId,
      status: "travelling",
      createdAt: stamp(),
    };
    this.state.signals.push(signal);
    this.event("SIGNAL_CREATED", source, { signalId: signal.id });
    this.event("SIGNAL_SENT", source, { signalId: signal.id, target });
    this.#settleSignals();
    return signal;
  }
  #settleSignals() {
    clearTimeout(this.signalTimer);
    if (this.state.status === "paused") return;
    this.signalTimer = setTimeout(() => {
      for (const item of this.state.signals)
        if (item.status === "travelling") {
          item.status = "received";
          this.event("SIGNAL_RECEIVED", item.target, { signalId: item.id });
        }
      this.notify();
    }, 1100 / this.state.speed);
  }
  #phaseEvents() {
    const phase = phases[this.state.phase];
    this.event("PHASE_STARTED", phase.node, { phase: this.state.phase });
    this.state.nodes[phase.node] = "processing";
  }
  #finishPhase() {
    const phase = phases[this.state.phase];
    this.state.nodes[phase.node] = "completed";
    this.state.completedPhases.push(this.state.phase);
    this.event("NODE_COMPLETED", phase.node);
    this.event("PHASE_COMPLETED", phase.node, { phase: this.state.phase });
  }
  async next() {
    if (
      this.pending ||
      this.state.status !== "running" ||
      this.state.phase >= phases.length - 1
    )
      return;
    if (
      this.state.phase === 7 &&
      this.state.scenarioAnswers.length !== scenarios.length
    )
      return;
    this.pending = true;
    const version = this.runVersion;
    this.checkpoints.push(this.snapshot());
    this.#finishPhase();
    this.state.phase += 1;
    this.#phaseEvents();
    const s = this.state;
    const traceId = s.traceId;
    switch (s.phase) {
      case 2:
        s.inputs = {
          history: s.student.periods,
          interests: s.student.interest,
          query: s.query,
          riasecAnswers: s.student.riasecAnswers,
          attendance: s.student.attendance,
          bth: s.student.bth,
          traceId,
        };
        this.event("INPUT_VALIDATED", "inputs", {
          fields: Object.keys(s.inputs),
        });
        for (const type of [
          "ACADEMIC_DATA",
          "VOCATIONAL_DATA",
          "QUERY",
          "INPUT_DATA",
        ])
          this.signal(type, "student", "inputs");
        break;
      case 3:
        this.event("NODE_PROCESSING", "peter3", {
          tasks: ["RIASEC", "Analytics", "Retrieval"],
        });
        this.signal("INPUT_DATA", "inputs", "peter3");
        break;
      case 4: {
        this.event("ANALYTICS_STARTED", "analytics");
        this.event("RETRIEVAL_STARTED", "retrieval");
        const [riasec, analytics, retrieval] = await Promise.all([
          Promise.resolve().then(() =>
            processRiasec(s.student.riasecAnswers, traceId),
          ),
          Promise.resolve().then(() =>
            processAnalytics(
              s.student.periods,
              s.student.attendance,
              s.student.activity,
              traceId,
            ),
          ),
          Promise.resolve().then(() => retrieve(s.query, traceId)),
        ]);
        if (version !== this.runVersion) return;
        s.riasecResult = riasec;
        s.learningAnalytics = analytics;
        s.retrieval = retrieval;
        for (const node of ["riasec", "analytics", "retrieval"]) {
          s.nodes[node] = "completed";
          this.signal("QUERY", "peter3", node);
        }
        riasec.answers?.forEach((answer, index) =>
          this.event("RIASEC_ITEM_PROCESSED", "riasec", {
            index,
            answer,
            normalized: answer - 1,
          }),
        );
        this.event("RIASEC_COMPLETED", "riasec", { code: riasec.code });
        this.event("ANALYTICS_COMPLETED", "analytics", {
          trends: analytics.trends,
        });
        this.event("DOCUMENTS_LOADED", "retrieval", {
          count: retrieval.documentCount,
        });
        this.event("CORPUS_CREATED", "retrieval");
        this.event("CHUNKS_CREATED", "retrieval", {
          count: retrieval.chunkCount,
        });
        this.event("SEARCH_STARTED", "retrieval", {
          method: retrieval.method,
        });
        this.event("EVIDENCE_RETRIEVED", "retrieval", {
          count: retrieval.evidence.length,
        });
        this.event("RETRIEVAL_COMPLETED", "retrieval");
        break;
      }
      case 5:
        this.event("EVIDENCE_ANALYSIS_STARTED", "evidence");
        s.evidenceAnalysis = integrateEvidence({
          riasec: s.riasecResult,
          analytics: s.learningAnalytics,
          retrieval: s.retrieval,
          student: s.student,
          traceId,
        });
        s.missingData = s.evidenceAnalysis.missing;
        s.warnings = s.evidenceAnalysis.warnings;
        for (const source of ["riasec", "analytics", "retrieval"])
          this.signal("RETRIEVED_EVIDENCE", source, "evidence");
        this.signal("ACADEMIC_EVIDENCE", "inputs", "evidence", {
          sourceId: "ESTUDIANTE-DEMO",
          field: "bth",
        });
        for (const item of s.evidenceAnalysis.evidence)
          this.event("EVIDENCE_ADDED", "evidence", { evidenceId: item.id });
        for (const item of s.missingData)
          this.event("MISSING_DETECTED", "evidence", { missingId: item.id });
        this.event("EVIDENCE_ANALYSIS_COMPLETED", "evidence");
        break;
      case 6:
        this.event("CROSSWALK_STARTED", "bridge");
        s.careerProfiles = buildCareerProfiles(
          s.evidenceAnalysis,
          s.student,
          traceId,
        );
        s.selectedCareerId =
          s.careerProfiles.find((career) => career.name === s.student.interest)
            ?.id ?? s.careerProfiles[0].id;
        for (const career of s.careerProfiles) {
          this.event("RELATION_CREATED", "bridge", {
            careerId: career.id,
            rules: career.rules,
          });
          this.event("CAREER_PROFILE_CREATED", career.id, {
            evidenceIds: career.evidenceIds,
          });
        }
        this.event("CROSSWALK_COMPLETED", "bridge");
        this.signal("CAREER_RELATION", "evidence", "bridge");
        this.signal("CAREER_RELATION", "bridge", "careers");
        break;
      case 7:
        this.event("SCENARIO_STARTED", "simulation", {
          careerId: s.selectedCareerId,
        });
        this.signal("CAREER_RELATION", "careers", "simulation");
        break;
      case 8:
        s.evidenceAnalysis = integrateEvidence({
          riasec: s.riasecResult,
          analytics: s.learningAnalytics,
          retrieval: s.retrieval,
          simulation: s.simulationEvidence,
          student: s.student,
          traceId,
        });
        s.careerProfiles = buildCareerProfiles(
          s.evidenceAnalysis,
          s.student,
          traceId,
        );
        s.missingData = s.evidenceAnalysis.missing;
        s.warnings = s.evidenceAnalysis.warnings;
        this.event("EVIDENCE_ANALYSIS_COMPLETED", "evidence", {
          reintegrated: true,
        });
        this.signal("SIMULATION_EVIDENCE", "simulation", "evidence", {
          evidenceIds: s.simulationEvidence.map((item) => item.id),
        });
        break;
      case 9:
        this.event("TUTOR_STARTED", "tutor");
        s.tutorResponse = explain(
          this.selectedCareer,
          s.evidenceAnalysis,
          traceId,
        );
        this.event("TUTOR_COMPLETED", "tutor", {
          evidenceIds: s.tutorResponse.evidenceIds,
        });
        this.signal("EXPLANATION", "careers", "tutor");
        this.signal("RETRIEVED_EVIDENCE", "evidence", "tutor");
        break;
      case 10:
        this.event("INTEGRATION_STARTED", "peter2");
        s.integrationResult = {
          student: s.student.id,
          careerProfiles: s.careerProfiles,
          evidence: s.evidenceAnalysis.evidence,
          warnings: s.warnings,
          missing: s.missingData,
          limitations: s.limitations,
          traceId,
          status: "demo package prepared",
        };
        this.event("INTEGRATION_COMPLETED", "peter2", {
          status: s.integrationResult.status,
        });
        this.signal("INTEGRATION", "tutor", "peter2");
        break;
      case 11:
        s.finalResult = {
          profile: this.selectedCareer,
          explanation: s.tutorResponse,
          evidence: s.evidenceAnalysis.evidence,
          sources: s.evidenceAnalysis.sources,
          warnings: s.warnings,
          missing: s.missingData,
          limitations: s.limitations,
          traceId,
        };
        this.event("FINAL_RESULT_CREATED", "output", {
          careerId: s.selectedCareerId,
        });
        this.signal("OUTPUT", "peter2", "output");
        s.status = "completed";
        break;
      default:
        break;
    }
    this.pending = false;
    this.notify();
  }
  previous() {
    if (this.pending) return;
    const previous = this.checkpoints.pop();
    if (!previous) return;
    clearTimeout(this.signalTimer);
    this.state = previous;
    this.state.status = "running";
    this.event("PHASE_STARTED", phases[this.state.phase].node, {
      revisited: true,
    });
    this.notify();
  }
  answer(scenarioId, choiceIndex) {
    const s = this.state;
    if (
      s.phase !== 7 ||
      s.scenarioAnswers.some((item) => item.scenarioId === scenarioId)
    )
      return;
    const scenario = scenarios.find((item) => item.id === scenarioId);
    if (!scenario || scenario.id !== scenarios[s.scenarioAnswers.length].id)
      return;
    const evidence = answerScenario(scenario, choiceIndex, s.traceId).map(
      (item) => ({ ...item, careerId: s.selectedCareerId }),
    );
    s.scenarioAnswers.push({ scenarioId, choiceIndex, traceId: s.traceId });
    s.simulationEvidence.push(...evidence);
    this.event("SCENARIO_ANSWERED", "simulation", { scenarioId, choiceIndex });
    for (const item of evidence)
      this.event("SIMULATION_EVIDENCE_CREATED", "simulation", {
        evidenceId: item.id,
      });
    if (s.scenarioAnswers.length === scenarios.length)
      this.event("SCENARIO_COMPLETED", "simulation");
    this.notify();
  }
}
