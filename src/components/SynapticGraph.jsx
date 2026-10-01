import { useEffect, useRef } from "react";
import ForceGraph3D from "3d-force-graph";
import SpriteText from "three-spritetext";
import * as THREE from "three";
import gsap from "gsap";
import { colors } from "../graph/graphModel.js";
import { phases } from "../simulation/SimulationEngine.js";

const endpoint = (value) => (typeof value === "object" ? value.id : value);

function nodeObject(node, state, selectedId, reducedMotion) {
  const group = new THREE.Group();
  const current = state.phase >= node.phase;
  const selected = selectedId === node.id;
  const status = state.nodes[node.id] ?? (current ? "completed" : "waiting");
  const color =
    status === "warning"
      ? "#e9ad67"
      : status === "error"
        ? "#e98282"
        : colors[node.type];
  const size = ["orchestrator", "evidence", "output"].includes(node.type)
    ? 8.5
    : node.type === "career"
      ? 4.3
      : 6;
  const opacity =
    state.phase === 0 && node.id !== "student" ? 0.1 : current ? 0.92 : 0.22;
  group.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(size, 14, 14),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity }),
    ),
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(size * (selected ? 2.2 : 1.6), 14, 14),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: selected ? 0.24 : current ? 0.1 : 0.015,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(halo);
  if (
    selected ||
    (node.type !== "career" && (current || state.phase > 0)) ||
    node.id === "student"
  ) {
    const label = new SpriteText(node.label);
    label.color = selected ? "#fff" : "#c9d9e8";
    label.textHeight = selected ? 5.5 : node.type === "career" ? 3.6 : 4.4;
    label.backgroundColor = "rgba(3, 9, 20, 0.52)";
    label.padding = 2;
    label.position.y = size + 7;
    group.add(label);
  }
  if (!reducedMotion && status === "processing") {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(size * 1.7, 0.42, 5, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }),
    );
    ring.rotation.x = Math.PI / 2.7;
    group.add(ring);
  }
  return group;
}

export default function SynapticGraph({
  graphData,
  state,
  selectedId,
  traceMode,
  highlightFlow,
  onSelectNode,
  onSelectLink,
  reducedMotion,
}) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const liveRef = useRef({
    state,
    selectedId,
    traceMode,
    highlightFlow,
    onSelectNode,
    onSelectLink,
    reducedMotion,
  });
  liveRef.current = {
    state,
    selectedId,
    traceMode,
    highlightFlow,
    onSelectNode,
    onSelectLink,
    reducedMotion,
  };

  useEffect(() => {
    const container = containerRef.current;
    const graph = ForceGraph3D()(container)
      .backgroundColor("rgba(0,0,0,0)")
      .graphData(graphData)
      .showNavInfo(false)
      .enableNodeDrag(false)
      .nodeThreeObject((node) =>
        nodeObject(
          node,
          liveRef.current.state,
          liveRef.current.selectedId,
          liveRef.current.reducedMotion,
        ),
      )
      .nodeThreeObjectExtend(false)
      .linkDirectionalArrowLength(0)
      .linkOpacity(0.75)
      .onNodeClick((node) => liveRef.current.onSelectNode(node.id))
      .onLinkClick((link) => liveRef.current.onSelectLink(link.id));
    graph.d3Force("charge").strength(-20);
    graph.cameraPosition({ x: 15, y: 24, z: 620 }, { x: 10, y: 0, z: 0 }, 0);
    graphRef.current = graph;
    const observer = new ResizeObserver(() => {
      graph.width(container.clientWidth).height(container.clientHeight);
    });
    observer.observe(container);
    const ambient = gsap.to(container, {
      "--ambient": 1,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    return () => {
      observer.disconnect();
      ambient.kill();
      graph._destructor();
      graphRef.current = null;
    };
  }, [graphData]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const travelling = new Set(
      state.signals
        .filter((signal) => signal.status === "travelling")
        .map((signal) => `${signal.source}:${signal.target}`),
    );
    const profile = state.careerProfiles.find(
      (item) => item.id === state.selectedCareerId,
    );
    const traced = new Set([
      "evidence:bridge",
      "bridge:careers",
      "careers:tutor",
      "evidence:tutor",
      "tutor:peter2",
      "peter2:output",
    ]);
    for (const id of profile?.evidenceIds ?? []) {
      const path =
        state.evidenceAnalysis?.evidence.find((item) => item.id === id)?.path ??
        [];
      for (let index = 1; index < path.length; index++)
        traced.add(`${path[index - 1]}:${path[index]}`);
    }
    graph
      .nodeThreeObject((node) =>
        nodeObject(node, state, selectedId, reducedMotion),
      )
      .linkColor((link) => {
        const source = endpoint(link.source);
        const target = endpoint(link.target);
        const active = state.phase >= link.phase;
        if (traceMode)
          return traced.has(link.id) ? "#e5c985" : "rgba(71,89,109,0.08)";
        if (travelling.has(link.id)) return "#89e9f2";
        if (
          highlightFlow &&
          (source === phases[state.phase].node ||
            target === phases[state.phase].node)
        )
          return "#a7d9ef";
        return active ? "rgba(118,155,188,0.55)" : "rgba(76,104,134,0.13)";
      })
      .linkWidth((link) =>
        travelling.has(link.id)
          ? 2.5
          : traceMode
            ? 1.5
            : state.phase >= link.phase
              ? 1.1
              : 0.3,
      )
      .linkDirectionalParticles((link) =>
        !reducedMotion && travelling.has(link.id) ? 3 : 0,
      )
      .linkDirectionalParticleWidth(2.5)
      .linkDirectionalParticleSpeed(0.012)
      .refresh();
  }, [state, selectedId, traceMode, highlightFlow, reducedMotion]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const id =
      selectedId ?? (state.mode === "guided" ? phases[state.phase].node : null);
    if (!id) return;
    const node = graph.graphData().nodes.find((item) => item.id === id);
    if (!node) return;
    const overview = !selectedId && (state.phase === 4 || state.phase === 11);
    const zoom = selectedId ? 145 : overview ? 620 : 225;
    const lookAt = overview
      ? { x: 12, y: 0, z: 0 }
      : { x: node.fx, y: node.fy, z: node.fz };
    const target = overview
      ? { x: 20, y: 24, z: zoom }
      : { x: node.fx + 35, y: node.fy + 25, z: node.fz + zoom };
    if (reducedMotion) graph.cameraPosition(target, lookAt, 0);
    else {
      const camera = { ...graph.cameraPosition() };
      const tween = gsap.to(camera, {
        ...target,
        duration: 0.9 / state.speed,
        ease: "power2.inOut",
        onUpdate: () => graph.cameraPosition(camera, lookAt, 0),
      });
      return () => tween.kill();
    }
  }, [state.phase, state.mode, state.speed, selectedId, reducedMotion]);

  return (
    <div
      className="graph-stage"
      ref={containerRef}
      role="img"
      aria-label="Red tridimensional del flujo SAVP-TIS3"
    />
  );
}
