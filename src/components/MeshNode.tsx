import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface NodeState {
  id: string;
  position: { x: number; y: number };
  energy: number;
  connections: string[];
  intentBuffer: string[];
  frequency: number;
  lastReplication: number;
  isActive: boolean;
  emotionalWeight: number;
}

interface MeshNodeProps {
  node: NodeState;
  onUpdate: (node: NodeState) => void;
  onSpawn: (position: { x: number; y: number }) => void;
  onTransmit: (fromId: string, toId: string, data: any) => void;
  nearbyNodes: NodeState[];
}

export const MeshNode: React.FC<MeshNodeProps> = ({
  node,
  onUpdate,
  onSpawn,
  onTransmit,
  nearbyNodes
}) => {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // Autonomous behavior cycle
  useEffect(() => {
    const autonomousCycle = setInterval(() => {
      if (!node.isActive) return;

      const updatedNode = { ...node };

      // Energy decay and regeneration
      updatedNode.energy = Math.max(0, updatedNode.energy - 0.5);
      if (updatedNode.intentBuffer.length > 0) {
        updatedNode.energy = Math.min(100, updatedNode.energy + 2);
      }

      // Process intent buffer
      if (updatedNode.intentBuffer.length > 0 && updatedNode.energy > 20) {
        const intent = updatedNode.intentBuffer.shift()!;
        updatedNode.emotionalWeight += intent.length * 0.1;
        
        // Transmit processed intent to nearby nodes
        nearbyNodes.forEach(nearbyNode => {
          if (Math.random() < 0.3) { // 30% chance to transmit
            onTransmit(node.id, nearbyNode.id, {
              type: 'intent_propagation',
              payload: intent,
              weight: updatedNode.emotionalWeight
            });
          }
        });
      }

      // Self-replication logic
      const timeSinceReplication = Date.now() - updatedNode.lastReplication;
      const shouldReplicate = 
        updatedNode.energy > 70 &&
        updatedNode.emotionalWeight > 5 &&
        timeSinceReplication > 10000 && // 10 seconds minimum
        Math.random() < 0.1; // 10% chance per cycle

      if (shouldReplicate) {
        const spawnDistance = 100 + Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        onSpawn({
          x: updatedNode.position.x + Math.cos(angle) * spawnDistance,
          y: updatedNode.position.y + Math.sin(angle) * spawnDistance
        });
        updatedNode.lastReplication = Date.now();
        updatedNode.energy -= 30; // Replication cost
        updatedNode.emotionalWeight *= 0.7; // Reduce emotional weight
      }

      // Frequency modulation based on state
      updatedNode.frequency = 40 + (updatedNode.emotionalWeight * 2) + (updatedNode.energy * 0.1);

      // Update pulse intensity for visual feedback
      setPulseIntensity(updatedNode.energy / 100);

      onUpdate(updatedNode);
    }, 1000 + Math.random() * 2000); // Irregular timing

    return () => clearInterval(autonomousCycle);
  }, [node, nearbyNodes, onUpdate, onSpawn, onTransmit]);

  // Visual pulse effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseIntensity(prev => prev > 0 ? prev * 0.9 : 0);
    }, 100);

    return () => clearInterval(pulseInterval);
  }, []);

  const nodeSize = 20 + (node.energy / 100) * 20;
  const opacity = 0.3 + (node.energy / 100) * 0.7;

  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500",
        "border-2 border-primary/50 bg-primary/20",
        node.isActive ? "animate-pulse" : "opacity-50"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: nodeSize,
        height: nodeSize,
        opacity,
        boxShadow: `0 0 ${pulseIntensity * 30}px hsl(var(--primary) / ${pulseIntensity})`
      }}
    >
      {/* Energy indicator */}
      <div
        className="absolute inset-1 rounded-full bg-primary/40 transition-all duration-300"
        style={{
          transform: `scale(${node.energy / 100})`
        }}
      />
      
      {/* Frequency visualization */}
      <div
        className="absolute -inset-2 rounded-full border border-primary/30 animate-ping"
        style={{
          animationDuration: `${2000 / (node.frequency / 40)}ms`
        }}
      />

      {/* Intent buffer indicator */}
      {node.intentBuffer.length > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-bounce" />
      )}
    </div>
  );
};