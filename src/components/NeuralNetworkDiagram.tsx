import React from 'react';
import { NNState } from '@/types';

interface NeuralNetworkDiagramProps {
  nnState: NNState;
  highlight: { nodes: string[]; weights: string[] };
}

// Node component remains a div for HTML/CSS based positioning and styling
const Node: React.FC<{ id: string; label: string; value: string; top: string; left: string; isActive: boolean }> = ({ id, label, value, top, left, isActive }) => (
  <div id={id} className={`nn-node ${isActive ? 'active' : ''}`} style={{ top, left, zIndex: 10 }}>
    <div className="font-bold">{label}</div>
    <div className="text-xs">{value}</div>
  </div>
);

// Connection component renders SVG elements
const Connection: React.FC<{ from: {x: number, y: number}, to: {x: number, y: number}, weight: number, label: string, isActive: boolean }> = ({ from, to, weight, label, isActive }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <g className={`transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        strokeWidth={isActive ? 0.8 : 0.4}
        className={isActive ? 'stroke-blue-600' : 'stroke-slate-400'}
      />
      <text
        x={midX}
        y={midY}
        dy={-0.5}
        textAnchor="middle"
        fontSize="2.5"
        className={isActive ? 'fill-blue-800 font-bold' : 'fill-slate-600'}
      >
        {label}: {weight.toFixed(4)}
      </text>
    </g>
  );
};

const NeuralNetworkDiagram: React.FC<NeuralNetworkDiagramProps> = ({ nnState, highlight }) => {
  const { inputs, weights, calculated } = nnState;

  // Use a numeric coordinate system for SVG positioning
  const nodePositions: { [key: string]: { x: number; y: number } } = {
    i1: { x: 15, y: 25 }, i2: { x: 15, y: 75 },
    h1: { x: 50, y: 25 }, h2: { x: 50, y: 75 },
    o1: { x: 85, y: 25 }, o2: { x: 85, y: 75 },
  };

  const connections = [
    { from: 'i1', to: 'h1', weight: 'w1' },
    { from: 'i1', to: 'h2', weight: 'w3' },
    { from: 'i2', to: 'h1', weight: 'w2' },
    { from: 'i2', to: 'h2', weight: 'w4' },
    { from: 'h1', to: 'o1', weight: 'w5' },
    { from: 'h1', to: 'o2', weight: 'w7' },
    { from: 'h2', to: 'o1', weight: 'w6' },
    { from: 'h2', to: 'o2', weight: 'w8' },
  ];

  return (
    <section id="nn-visualization" className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Neural Network Structure & Values</h2>
      <div className="relative h-96 w-full" id="nn-diagram-container">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {
            connections.map(({ from, to, weight }) => (
              <Connection 
                key={`${from}-${to}`}
                from={nodePositions[from]}
                to={nodePositions[to]}
                weight={weights[weight as keyof typeof weights]}
                label={weight}
                isActive={highlight.weights.includes(weight)}
              />
            ))
          }
        </svg>

        {
          Object.entries(nodePositions).map(([id, pos]) => {
            let label = id;
            let value = '?';
            if (id.startsWith('i')) value = inputs[id as keyof typeof inputs]?.toFixed(2) ?? '?';
            else if (id.startsWith('h')) value = calculated[`out_${id}` as keyof typeof calculated]?.toFixed(4) ?? '?';
            else if (id.startsWith('o')) value = calculated[`out_${id}` as keyof typeof calculated]?.toFixed(4) ?? '?';
            
            return (
              <Node 
                key={id} 
                id={id} 
                label={label} 
                value={value} 
                top={`${pos.y}%`} 
                left={`${pos.x}%`} 
                isActive={highlight.nodes.includes(id)} 
              />
            );
          })
        }
      </div>
    </section>
  );
};

export default NeuralNetworkDiagram;
