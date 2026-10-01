import { careerCatalog, documents, riasecDimensions } from "../data/demo.js";

export function processRiasec(answers, traceId) {
  if (
    !Array.isArray(answers) ||
    answers.length !== 30 ||
    answers.some(
      (answer) => !Number.isInteger(answer) || answer < 1 || answer > 5,
    )
  ) {
    return {
      status: "missing",
      value: null,
      warning: "Se requieren 30 respuestas RIASEC entre 1 y 5.",
    };
  }
  const dimensions = Object.fromEntries(
    riasecDimensions.map((key, index) => [
      key,
      answers
        .slice(index * 5, index * 5 + 5)
        .reduce((sum, answer) => sum + answer - 1, 0),
    ]),
  );
  const code = [...riasecDimensions]
    .sort(
      (a, b) =>
        dimensions[b] - dimensions[a] ||
        riasecDimensions.indexOf(a) - riasecDimensions.indexOf(b),
    )
    .slice(0, 3)
    .join("");
  return { status: "present", answers, dimensions, code, traceId };
}

export function processAnalytics(periods, attendance, activity, traceId) {
  if (!periods?.length) return { status: "missing", value: null, traceId };
  const subjects = [
    ...new Set(periods.flatMap((period) => Object.keys(period.grades ?? {}))),
  ];
  const trends = Object.fromEntries(
    subjects.map((subject) => {
      const values = periods
        .map((period) => period.grades?.[subject])
        .filter(Number.isFinite);
      return [
        subject,
        {
          values,
          latest: values.at(-1) ?? null,
          change: values.length > 1 ? values.at(-1) - values[0] : null,
        },
      ];
    }),
  );
  const periodAverages = periods.map((period) => {
    const grades = Object.values(period.grades ?? {}).filter(Number.isFinite);
    return {
      name: period.name,
      value: grades.length
        ? Math.round(
            grades.reduce((sum, grade) => sum + grade, 0) / grades.length,
          )
        : null,
    };
  });
  return {
    status: "present",
    trends,
    periodAverages,
    attendance: Number.isFinite(attendance) ? attendance : null,
    activity: activity ?? null,
    traceId,
  };
}

export function retrieve(query, traceId, corpus = documents) {
  const tokens = (text) =>
    new Set(
      (text.toLocaleLowerCase("es").match(/[\p{L}]{4,}/gu) ?? []).filter(
        (word) =>
          ![
            "quiero",
            "conocer",
            "para",
            "sobre",
            "perfil",
            "relacionadas",
          ].includes(word),
      ),
    );
  const terms = tokens(query);
  const chunks = corpus.flatMap((document) =>
    document.text
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .map((content, index) => ({
        id: `${document.id}-CH-${index + 1}`,
        document,
        content,
      })),
  );
  const matches = chunks
    .map((chunk) => ({
      ...chunk,
      overlap: [...tokens(`${chunk.document.title} ${chunk.content}`)].filter(
        (term) => terms.has(term),
      ).length,
    }))
    .filter((chunk) => chunk.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 5);
  return {
    pipeline: [
      "FUENTES",
      "CORPUS",
      "CHUNKS",
      "VECTORES LÉXICOS",
      "ÍNDICE LOCAL",
      "BÚSQUEDA",
      "MATCHES",
    ],
    method: "coincidencia léxica local (sin embeddings ni FAISS reales)",
    documentCount: corpus.length,
    chunkCount: chunks.length,
    chunkSamples: chunks
      .slice(0, 20)
      .map((chunk) => ({
        id: chunk.id,
        title: chunk.document.title,
        content: chunk.content,
      })),
    candidateCount: matches.length,
    evidence: matches.map((match, index) => ({
      id: `DOC-EV-${index + 1}`,
      type: "documentary",
      sourceId: match.document.id,
      documentId: match.document.id,
      chunkId: match.id,
      title: match.document.title,
      source: match.document.source,
      verified: match.document.verified,
      relevance: `coincidencias: ${match.overlap}`,
      content: match.content,
      traceId,
      path: ["student", "inputs", "peter3", "retrieval", "evidence"],
    })),
    traceId,
  };
}

export function integrateEvidence({
  riasec,
  analytics,
  retrieval,
  simulation = [],
  student,
  traceId,
}) {
  const evidence = [];
  if (riasec.status === "present")
    evidence.push({
      id: "EV-RIASEC",
      type: "vocational",
      label: `Código Holland ${riasec.code}`,
      value: riasec.dimensions,
      sourceId: "RIASEC-30",
      traceId,
      path: ["student", "inputs", "peter3", "riasec", "evidence"],
    });
  if (analytics.status === "present")
    for (const [subject, trend] of Object.entries(analytics.trends)) {
      if (trend.latest !== null)
        evidence.push({
          id: `EV-AC-${subject}`,
          type: "academic",
          label: `${subject}: ${trend.latest}; tendencia ${trend.change === null ? "sin datos" : trend.change >= 0 ? `+${trend.change}` : trend.change}`,
          subject,
          value: trend.latest,
          sourceId: "HISTORIAL-DEMO",
          traceId,
          path: ["student", "inputs", "peter3", "analytics", "evidence"],
        });
    }
  if (student.bth)
    evidence.push({
      id: "EV-BTH",
      type: "technical",
      label: student.bth,
      value: student.bth,
      sourceId: "ESTUDIANTE-DEMO",
      traceId,
      path: ["student", "inputs", "evidence"],
    });
  evidence.push(...retrieval.evidence, ...simulation);
  const missing = [
    !Number.isFinite(analytics.attendance) && {
      id: "MISS-ATTENDANCE",
      label: "Asistencia",
      status: "missing",
      value: null,
      traceId,
    },
    !student.externalValidation && {
      id: "MISS-EXTERNAL",
      label: "Validación con fuentes externas",
      status: "missing",
      value: null,
      traceId,
    },
  ].filter(Boolean);
  const warnings = [
    ...(!retrieval.evidence.length
      ? ["La consulta no produjo coincidencias documentales."]
      : []),
    ...(!retrieval.evidence.every((item) => item.verified)
      ? ["El corpus de demostración no está verificado externamente."]
      : []),
  ];
  return {
    vocational: riasec,
    academic: analytics,
    documentary: retrieval.evidence,
    technical: student.bth,
    simulation,
    evidence,
    missing,
    warnings,
    sources: [...new Set(evidence.map((item) => item.sourceId))],
    traceId,
  };
}

export function buildCareerProfiles(
  integrated,
  student,
  traceId,
  catalog = careerCatalog,
) {
  return catalog.map((career) => {
    const holland = integrated.vocational.code ?? "";
    const riasecMatches = career.riasec.filter((dimension) =>
      holland.includes(dimension),
    );
    const subjects = career.subjects.map((name) => ({
      name,
      trend: integrated.academic.trends?.[name] ?? null,
    }));
    const available = subjects.filter(({ trend }) =>
      Number.isFinite(trend?.latest),
    );
    const strong = available.filter(({ trend }) => trend.latest >= 80);
    const technical = career.bth.includes(student.bth);
    const relatedDocs = integrated.documentary.filter(
      (item) => item.title === career.name,
    );
    const evidenceIds = [
      ...(riasecMatches.length ? ["EV-RIASEC"] : []),
      ...available.map(({ name }) => `EV-AC-${name}`),
      ...(technical ? ["EV-BTH"] : []),
      ...relatedDocs.map((item) => item.id),
      ...integrated.simulation
        .filter((item) => item.careerId === career.id)
        .map((item) => item.id),
    ];
    const rules = [
      {
        ruleId: "VOCATIONAL_OVERLAP",
        inputs: { holland, expected: career.riasec },
        result:
          riasecMatches.length >= 2
            ? "alta"
            : riasecMatches.length
              ? "parcial"
              : "sin relación observada",
        traceId,
      },
      {
        ruleId: "ACADEMIC_PREPARATION",
        inputs: { subjects },
        result: !available.length
          ? "sin evidencia"
          : strong.length === available.length
            ? "alta"
            : strong.length
              ? "parcial"
              : "por reforzar",
        traceId,
      },
      {
        ruleId: "BTH_CONTINUITY",
        inputs: { bth: student.bth, related: career.bth },
        result: technical ? "relacionada" : "no documentada",
        traceId,
      },
    ];
    return {
      ...career,
      traceId,
      affinity: rules[0].result,
      preparation: rules[1].result,
      declaredInterest:
        student.interest === career.name ? "declarado" : "no declarado",
      occupationalRelation:
        technical || relatedDocs.length
          ? "documentada"
          : "sin evidencia específica",
      technicalContinuity: rules[2].result,
      reinforcementAreas: [career.reinforcement],
      evidenceIds,
      evidenceCount: evidenceIds.length,
      sources: integrated.sources,
      missing: [
        ...integrated.missing,
        ...(!available.length
          ? [
              {
                id: `MISS-${career.id}`,
                label: `Preparación para ${career.name}`,
                status: "missing",
                value: null,
                traceId,
              },
            ]
          : []),
      ],
      warnings: integrated.warnings,
      rules,
    };
  });
}

export function answerScenario(scenario, choiceIndex, traceId) {
  const choice = scenario.choices[choiceIndex];
  if (!choice) throw new Error("Respuesta de escenario no válida");
  return Object.entries(choice.effects).map(([competency, level]) => ({
    id: `EV-${scenario.id}-${competency}`,
    type: "simulation",
    label: `${competency}: ${level}`,
    competency,
    level,
    sourceId: scenario.id,
    choice: choice.text,
    note: choice.note,
    traceId,
    path: ["student", "inputs", "peter3", "simulation", "evidence"],
  }));
}

export function explain(profile, integrated, traceId) {
  const refs = profile.evidenceIds.slice(0, 4);
  return {
    text: `${profile.name} presenta afinidad vocacional ${profile.affinity}, preparación académica ${profile.preparation} y continuidad técnica ${profile.technicalContinuity}. ${profile.reinforcementAreas.length ? `Conviene reforzar ${profile.reinforcementAreas.join(", ")}.` : ""} Esta orientación usa únicamente la evidencia disponible.`,
    evidenceIds: refs,
    missing: integrated.missing,
    warnings: integrated.warnings,
    traceId,
  };
}
