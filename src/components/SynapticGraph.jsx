import { useEffect, useRef } from "react";
import ForceGraph3D from "3d-force-graph";
import SpriteText from "three-spritetext";
import * as THREE from "three";
import gsap from "gsap";
import { forceX, forceY, forceZ } from "d3-force-3d";
import { getLinkColor, getNodeColor, getParticleColor, ringColors } from "../utils/nodeColors.js";
import {
  getLinkWidth,
  getNodeSize,
  getParticleCount,
  isLinkActive,
  isNodeActive,
} from "../utils/graphHelpers.js";

const permanentLabelTypes = new Set(["source", "profile", "career", "result"]);

export default function SynapticGraph({
  graphData,
  currentPhase,
  selectedNode,
  highlightRecommendedPath,
  theme,
  onSelectNode,
}) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const nodeObjectsRef = useRef(new Map());
  const phaseRef = useRef(currentPhase);
  const highlightRef = useRef(highlightRecommendedPath);
  const selectedNodeIdRef = useRef(selectedNode?.id ?? null);
  const themeRef = useRef(theme);

  useEffect(() => {
    phaseRef.current = currentPhase;
    highlightRef.current = highlightRecommendedPath;
    selectedNodeIdRef.current = selectedNode?.id ?? null;
    themeRef.current = theme;

    updateNodeObjects(nodeObjectsRef.current, currentPhase, highlightRecommendedPath, selectedNode?.id ?? null, theme);

    if (graphRef.current) {
      graphRef.current
        .linkDirectionalParticles((link) =>
          getParticleCount(link, isLinkActive(link, currentPhase, highlightRecommendedPath), highlightRecommendedPath),
        )
        .linkDirectionalParticleColor((link) =>
          getParticleColor(link, isLinkActive(link, currentPhase, highlightRecommendedPath), highlightRecommendedPath, theme),
        )
        .linkColor((link) =>
          currentPhase === 0
            ? "rgba(0,0,0,0)"
            : getLinkColor(link, isLinkActive(link, currentPhase, highlightRecommendedPath), highlightRecommendedPath, theme),
        )
        .linkWidth((link) =>
          currentPhase === 0
            ? 0
            : getLinkWidth(link, isLinkActive(link, currentPhase, highlightRecommendedPath), highlightRecommendedPath),
        );
      graphRef.current.refresh();
    }
  }, [currentPhase, highlightRecommendedPath, selectedNode, theme]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const Graph = ForceGraph3D()(containerRef.current)
      .backgroundColor("rgba(0,0,0,0)")
      .graphData(graphData)
      .enableNodeDrag(true)
      .showNavInfo(false)
      .nodeThreeObject((node) => {
        const nodeObject = createNodeObject(
          node,
          phaseRef.current,
          highlightRef.current,
          selectedNodeIdRef.current,
          themeRef.current,
        );
        nodeObjectsRef.current.set(node.id, { node, object: nodeObject });
        return nodeObject;
      })
      .nodeThreeObjectExtend(false)
      .linkColor((link) =>
        phaseRef.current === 0
          ? "rgba(0,0,0,0)"
          : getLinkColor(link, isLinkActive(link, phaseRef.current, highlightRef.current), highlightRef.current, themeRef.current),
      )
      .linkWidth((link) =>
        phaseRef.current === 0
          ? 0
          : getLinkWidth(link, isLinkActive(link, phaseRef.current, highlightRef.current), highlightRef.current),
      )
      .linkOpacity(1)
      .linkDirectionalArrowLength(0)
      .linkDirectionalParticles((link) =>
        getParticleCount(link, isLinkActive(link, phaseRef.current, highlightRef.current), highlightRef.current),
      )
      .linkDirectionalParticleColor((link) =>
        getParticleColor(link, isLinkActive(link, phaseRef.current, highlightRef.current), highlightRef.current, themeRef.current),
      )
      .linkDirectionalParticleWidth((link) => {
        if (link.recommended) return highlightRef.current ? 3 : 2.2;
        if (link.alternative || link.alert) return 1.8;
        return 1.2;
      })
      .linkDirectionalParticleSpeed((link) => 0.003 + (link.weight ?? 0.4) * 0.006)
      .onNodeClick((node) => {
        onSelectNode(node);
        Graph.cameraPosition({ x: node.x + 55, y: node.y + 30, z: node.z + 110 }, node, 900);
      });

    const renderer = Graph.renderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

    Graph.d3Force("charge").strength(-70);
    Graph.d3Force("link").distance((link) => 46 + (1 - (link.weight ?? 0.5)) * 68);
    Graph.d3Force("x", forceX((node) => node.layerX ?? 0).strength(0.16));
    Graph.d3Force("y", forceY((node) => node.layerY ?? 0).strength(0.08));
    Graph.d3Force("z", forceZ((node) => node.layerZ ?? 0).strength(0.035));
    Graph.d3VelocityDecay(0.34);
    Graph.cameraPosition({ x: 25, y: 42, z: 430 }, { x: 55, y: 0, z: 0 }, 0);

    const resizeObserver = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = containerRef.current;
      Graph.width(clientWidth);
      Graph.height(clientHeight);
    });
    resizeObserver.observe(containerRef.current);

    graphRef.current = Graph;
    const ambientPulse = gsap.to(containerRef.current, {
      "--synaptic-glow": 1,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      ambientPulse.kill();
      resizeObserver.disconnect();
      disposeNodeObjects(nodeObjectsRef.current);
      nodeObjectsRef.current.clear();
      Graph._destructor();
      graphRef.current = null;
    };
  }, [graphData, onSelectNode]);

  return <div className="graph-stage" ref={containerRef} aria-label="Grafo sinaptico 3D" />;
}

function createNodeObject(node, currentPhase, highlightRecommendedPath, selectedNodeId = null, theme = "dark") {
  const group = new THREE.Group();
  const sphereGeometry = new THREE.SphereGeometry(1, 24, 24);
  const haloGeometry = new THREE.SphereGeometry(1, 24, 24);
  const ringGeometry = new THREE.TorusGeometry(1.22, 0.045, 8, 48);

  const sphere = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshBasicMaterial({ transparent: true, depthWrite: true }),
  );
  const halo = new THREE.Mesh(
    haloGeometry,
    new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const selectedHalo = new THREE.Mesh(
    haloGeometry.clone(),
    new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const ring = new THREE.Mesh(
    ringGeometry,
    new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const label = new SpriteText("");

  label.padding = 3;
  label.borderRadius = 4;
  label.material.depthWrite = false;
  label.renderOrder = 10;

  group.add(halo);
  group.add(selectedHalo);
  group.add(sphere);
  group.add(ring);
  group.add(label);
  group.userData.parts = { sphere, halo, selectedHalo, ring, label };

  updateNodeObject(group, node, currentPhase, highlightRecommendedPath, selectedNodeId, theme);
  return group;
}

function updateNodeObjects(nodeObjects, currentPhase, highlightRecommendedPath, selectedNodeId, theme) {
  nodeObjects.forEach(({ node, object }) => {
    updateNodeObject(object, node, currentPhase, highlightRecommendedPath, selectedNodeId, theme);
  });
}

function updateNodeObject(group, node, currentPhase, highlightRecommendedPath, selectedNodeId, theme) {
  const { sphere, halo, selectedHalo, ring, label } = group.userData.parts;
  const waitingHidden = currentPhase === 0 && node.type !== "source";
  const waitingSource = currentPhase === 0 && node.type === "source";
  const active = isNodeActive(node, currentPhase) || (highlightRecommendedPath && node.recommended);
  const selected = selectedNodeId === node.id;
  const color = getNodeColor(node, active, highlightRecommendedPath, theme);
  const size = getNodeSize(node, active || selected);
  const ringColor = ringColors[node.type] ?? color;

  sphere.scale.setScalar(size);
  sphere.material.color.set(color);
  sphere.material.opacity = waitingHidden ? 0.025 : waitingSource ? 0.56 : active ? 0.92 : 0.24;

  halo.scale.setScalar(size * (selected ? 2.6 : 1.84));
  halo.material.color.set(color);
  halo.material.opacity = waitingHidden ? 0 : waitingSource ? 0.08 : active ? (selected ? 0.22 : 0.1) : 0.025;

  selectedHalo.scale.setScalar(size * 3.15);
  selectedHalo.material.opacity = selected ? 0.16 : 0;

  ring.scale.setScalar(size * (selected ? 1.2 : 1));
  ring.material.color.set(selected ? "#ffffff" : ringColor);
  ring.material.opacity = waitingHidden ? 0 : selected ? 0.82 : active ? 0.58 : 0.22;

  const showLabel = shouldShowLabel(node, waitingHidden, active, selected);
  label.visible = showLabel;
  if (showLabel) {
    label.text = getNodeLabel(node);
    label.color = theme === "light" ? "#0f172a" : selected ? "#ffffff" : "#e0f2fe";
    label.textHeight = selected ? 5.2 : permanentLabelTypes.has(node.type) ? 4.25 : 3.55;
    label.backgroundColor = theme === "light" ? "rgba(255, 255, 255, 0.78)" : "rgba(2, 6, 23, 0.58)";
    label.position.set(0, size + 8.5, 0);
  }
}

function shouldShowLabel(node, waitingHidden, active, selected) {
  if (waitingHidden) return false;
  if (permanentLabelTypes.has(node.type)) return true;
  return active || selected;
}

function getNodeLabel(node) {
  const label = abbreviateLabel(node.label, node.type === "career" ? 22 : 24);
  if (node.type === "career" && Number.isFinite(node.score)) return `${label} - ${Math.round(node.score)}%`;
  return label;
}

function abbreviateLabel(label, maxLength) {
  if (label.length <= maxLength) return label;
  const compact = label
    .replace("Ingenieria", "Ing.")
    .replace("Administracion", "Admin.")
    .replace("Tecnologica", "Tec.")
    .replace("Compatibilidad", "Compat.")
    .replace("Simulacion", "Sim.")
    .replace("Academico-Profesional", "Acad.-Prof.");

  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trim()}...`;
}

function disposeNodeObjects(nodeObjects) {
  nodeObjects.forEach(({ object }) => {
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
        else child.material.dispose();
      }
    });
  });
}
