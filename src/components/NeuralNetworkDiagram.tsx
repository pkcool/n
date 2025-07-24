import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NNState } from '@/types';

interface NeuralNetworkDiagramProps {
  nnState: NNState;
  highlight: { nodes: string[]; weights: string[] };
}

interface NodeData {
  id: string;
  x: number;
  y: number;
  layer: number;
  value: string;
  label: string;
}

interface LinkData {
  source: string;
  target: string;
  weight: string;
  value: number;
}

const NeuralNetworkDiagram: React.FC<NeuralNetworkDiagramProps> = ({ nnState, highlight }) => {
  const { inputs, weights, calculated } = nnState;
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw the network with D3
  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create layers for better z-index control
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define node positions in layers (input, hidden, output)
    const layers = [
      { id: 'input', nodes: ['i1', 'i2'], x: 0.1 },
      { id: 'hidden', nodes: ['h1', 'h2'], x: 0.5 },
      { id: 'output', nodes: ['o1', 'o2'], x: 0.9 }
    ];

    // Create nodes data
    const nodes: NodeData[] = [];
    layers.forEach((layer, layerIndex) => {
      layer.nodes.forEach((nodeId, i) => {
        let value = '?';
        if (nodeId.startsWith('i')) {
          value = inputs[nodeId as keyof typeof inputs]?.toFixed(2) ?? '?';
        } else if (nodeId.startsWith('h') || nodeId.startsWith('o')) {
          value = calculated[`out_${nodeId}` as keyof typeof calculated]?.toFixed(4) ?? '?';
        }

        nodes.push({
          id: nodeId,
          x: layer.x * width,
          y: ((i + 1) / (layer.nodes.length + 1)) * height,
          layer: layerIndex,
          value,
          label: nodeId
        });
      });
    });

    // Create links data
    const links: LinkData[] = [
      { source: 'i1', target: 'h1', weight: 'w1', value: weights.w1 },
      { source: 'i1', target: 'h2', weight: 'w3', value: weights.w3 },
      { source: 'i2', target: 'h1', weight: 'w2', value: weights.w2 },
      { source: 'i2', target: 'h2', weight: 'w4', value: weights.w4 },
      { source: 'h1', target: 'o1', weight: 'w5', value: weights.w5 },
      { source: 'h1', target: 'o2', weight: 'w7', value: weights.w7 },
      { source: 'h2', target: 'o1', weight: 'w6', value: weights.w6 },
      { source: 'h2', target: 'o2', weight: 'w8', value: weights.w8 },
    ];

    // Draw links
    const linkGroup = g.append('g').attr('class', 'links');
    
    linkGroup.selectAll<SVGPathElement, LinkData>('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: LinkData) => {
        const source = nodes.find(n => n.id === d.source)!;
        const target = nodes.find(n => n.id === d.target)!;
        return `M${source.x},${source.y} L${target.x},${target.y}`;
      })
      .style('stroke', (d: LinkData) => highlight.weights.includes(d.weight) ? '#3b82f6' : '#94a3b8')
      .style('stroke-width', (d: LinkData) => highlight.weights.includes(d.weight) ? 2.5 : 1.5)
      .style('stroke-opacity', (d: LinkData) => highlight.weights.includes(d.weight) ? 1 : 0.6)
      .style('fill', 'none');

    // Add weight labels
    linkGroup.selectAll<SVGTextElement, LinkData>('.weight-label')
      .data(links)
      .enter()
      .append('text')
      .attr('class', 'weight-label')
      .attr('x', (d: LinkData) => {
        const source = nodes.find(n => n.id === d.source)!;
        const target = nodes.find(n => n.id === d.target)!;
        return (source.x + target.x) / 2;
      })
      .attr('y', (d: LinkData) => {
        const source = nodes.find(n => n.id === d.source)!;
        const target = nodes.find(n => n.id === d.target)!;
        return (source.y + target.y) / 2 - 5;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', (d: LinkData) => highlight.weights.includes(d.weight) ? '#1e40af' : '#475569')
      .attr('font-weight', (d: LinkData) => highlight.weights.includes(d.weight) ? 'bold' : 'normal')
      .text((d: LinkData) => `${d.weight}: ${d.value.toFixed(4)}`);

    // Draw nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    const nodeElements = nodeGroup.selectAll<SVGGElement, NodeData>('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: NodeData) => `translate(${d.x},${d.y})`);

    // Add node circles
    nodeElements.append('circle')
      .attr('r', 30)
      .style('fill', (d: NodeData) => highlight.nodes.includes(d.id) ? '#dbeafe' : '#f1f5f9')
      .style('stroke', (d: NodeData) => highlight.nodes.includes(d.id) ? '#3b82f6' : '#94a3b8')
      .style('stroke-width', (d: NodeData) => highlight.nodes.includes(d.id) ? 2 : 1.5);

    // Add node labels
    nodeElements.append('text')
      .attr('dy', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', (d: NodeData) => highlight.nodes.includes(d.id) ? '#1e40af' : '#1f2937')
      .text((d: NodeData) => d.label);

    // Add node values
    nodeElements.append('text')
      .attr('dy', 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', (d: NodeData) => highlight.nodes.includes(d.id) ? '#1e40af' : '#4b5563')
      .text((d: NodeData) => d.value);

  }, [nnState, highlight, dimensions]);

  return (
    <section id="nn-visualization" className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Neural Network Structure & Values</h2>
      <div 
        ref={containerRef}
        className="relative w-full"
        style={{ height: '500px' }}
      >
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%"
          className="absolute top-0 left-0"
        />
      </div>
    </section>
  );
};

export default NeuralNetworkDiagram;
