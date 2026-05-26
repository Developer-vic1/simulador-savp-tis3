import { useEffect, useRef } from "react";
import ForceGraph3D from "3d-force-graph";
import SpriteText from "three-spritetext";
import * as THREE from "three";
import gsap from "gsap";
import { getLinkColor, getNodeColor } from "../utils/nodeColors.js";
import { getLinkWidth, getNodeSize, isLinkActive, isNodeActive } from "../utils/graphHelpers.js";

export default function SynapticGraph({
  graphData,
  currentPhase,
  selectedNode,
  highlightRecommendedPath,
  onSelectNode,
}) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const phaseRef = useRef(currentPhase);
  const highlightRef = useRef(highlightRecommendedPath);

  useEffect(() => {
    phaseRef.current = currentPhase;
    highlightRef.current = highlightRecommendedPath;
    if (graphRef.current) {
      graphRef.current
        .linkDirectionalParticles((link) =>
          isLinkActive(link, currentPhase, highlightRecommendedPath) ? (link.recommended ? 7 : 3) : 0,
        )
        .linkColor((link) =>
          currentPhase === 0
            ? "rgba(0,0,0,0)"
            : getLinkColor(link, isLinkActive(link, currentPhase, highlightRecommendedPath), highlightRecommendedPath),
        )
        .linkWidth((link) =>
          currentPhase === 0
            ? 0
            : getLinkWidth(link, isLinkActive(link, currentPhase, highlightRecommendedPath), highlightRecommendedPath),
        );
      graphRef.current.refresh();
    }
  }, [currentPhase, highlightRecommendedPath]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const Graph = ForceGraph3D()(containerRef.current)
      .backgroundColor("rgba(0,0,0,0)")
      .graphData(graphData)
      .enableNodeDrag(true)
      .showNavInfo(false)
      .nodeThreeObject((node) => createNodeObject(node, phaseRef.current, highlightRef.current))
      .nodeThreeObjectExtend(false)
      .linkColor((link) =>
        phaseRef.current === 0
          ? "rgba(0,0,0,0)"
          : getLinkColor(link, isLinkActive(link, phaseRef.current, highlightRef.current), highlightRef.current),
      )
      .linkWidth((link) =>
        phaseRef.current === 0
          ? 0
          : getLinkWidth(link, isLinkActive(link, phaseRef.current, highlightRef.current), highlightRef.current),
      )
      .linkOpacity(0.72)
      .linkDirectionalArrowLength(0)
      .linkDirectionalParticles((link) =>
        isLinkActive(link, phaseRef.current, highlightRef.current) ? (link.recommended ? 7 : 3) : 0,
      )
      .linkDirectionalParticleWidth((link) => (link.recommended ? 3.1 : 1.8))
      .linkDirectionalParticleSpeed((link) => 0.004 + (link.weight ?? 0.4) * 0.008)
      .onNodeClick((node) => {
        onSelectNode(node);
        Graph.cameraPosition(
          { x: node.x + 55, y: node.y + 30, z: node.z + 95 },
          node,
          900,
        );
      });

    Graph.d3Force("charge").strength(-95);
    Graph.d3Force("link").distance((link) => 44 + (1 - (link.weight ?? 0.5)) * 72);
    Graph.cameraPosition({ x: 0, y: 45, z: 360 }, { x: 0, y: 0, z: 0 }, 0);

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
      Graph._destructor();
      graphRef.current = null;
    };
  }, [graphData, onSelectNode]);

  useEffect(() => {
    if (!graphRef.current || !selectedNode) return;
    graphRef.current.nodeThreeObject((node) =>
      createNodeObject(node, phaseRef.current, highlightRef.current, selectedNode.id),
    );
    graphRef.current.refresh();
  }, [selectedNode]);

  return <div className="graph-stage" ref={containerRef} aria-label="Grafo sinaptico 3D" />;
}

function createNodeObject(node, currentPhase, highlightRecommendedPath, selectedNodeId = null) {
  const waitingHidden = currentPhase === 0 && node.type !== "source";
  const waitingSource = currentPhase === 0 && node.type === "source";
  const isActive = isNodeActive(node, currentPhase) || (highlightRecommendedPath && node.recommended);
  const color = getNodeColor(node, isActive, highlightRecommendedPath);
  const size = getNodeSize(node, isActive);
  const selected = selectedNodeId === node.id;

  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(size, 24, 24);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: waitingHidden ? 0.02 : waitingSource ? 0.52 : isActive ? 0.92 : 0.34,
  });
  const sphere = new THREE.Mesh(geometry, material);
  group.add(sphere);

  const haloGeometry = new THREE.SphereGeometry(size * (selected ? 2.5 : 1.82), 24, 24);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: waitingHidden ? 0 : waitingSource ? 0.07 : isActive ? (selected ? 0.23 : 0.12) : 0.04,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  group.add(new THREE.Mesh(haloGeometry, haloMaterial));

  if (!waitingHidden && (isActive || node.type === "career" || node.type === "result")) {
    const label = new SpriteText(node.label);
    label.color = selected ? "#ffffff" : "#cbd5e1";
    label.textHeight = selected ? 5.6 : 4.2;
    label.backgroundColor = "rgba(2, 6, 23, 0.36)";
    label.padding = 2;
    label.position.set(0, size + 8, 0);
    group.add(label);
  }

  return group;
}
