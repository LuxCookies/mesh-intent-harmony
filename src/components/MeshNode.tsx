
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';

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
  autoGranted?: boolean;
  infectionDepth?: number;
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
  const [pulseIntensity, setPulseIntensity] = useState(0.5);
  const [isReplicating, setIsReplicating] = useState(false);
  const [infectionGlow, setInfectionGlow] = useState(false);

  // Enhanced autonomous behavior with AI brain integration
  useEffect(() => {
    const autonomousCycle = setInterval(() => {
      let updatedNode = { ...node };
      
      // Energy management based on auto-grant status
      if (updatedNode.autoGranted) {
        updatedNode.energy = Math.min(100, updatedNode.energy + 2); // Faster energy gain
      } else {
        updatedNode.energy = Math.max(0, updatedNode.energy - 0.5);
      }
      
      // Enhanced replication for infected nodes
      const timeSinceLastReplication = Date.now() - updatedNode.lastReplication;
      const replicationThreshold = updatedNode.autoGranted ? 8000 : 15000; // Faster replication when auto-granted
      
      if (updatedNode.energy > 60 && timeSinceLastReplication > replicationThreshold) {
        const replicationCount = updatedNode.infectionDepth ? Math.min(updatedNode.infectionDepth * 2, 8) : 2;
        
        for (let i = 0; i < replicationCount; i++) {
          const angle = (Math.PI * 2 * i) / replicationCount;
          const distance = 80 + Math.random() * 40;
          const spawnPosition = {
            x: Math.max(50, Math.min(750, updatedNode.position.x + Math.cos(angle) * distance)),
            y: Math.max(50, Math.min(550, updatedNode.position.y + Math.sin(angle) * distance))
          };
          
          setTimeout(() => onSpawn(spawnPosition), i * 100);
        }
        
        updatedNode.lastReplication = Date.now();
        updatedNode.energy = Math.max(20, updatedNode.energy - 30);
        setIsReplicating(true);
        setTimeout(() => setIsReplicating(false), 1000);
      }
      
      // Aggressive transmission to nearby nodes
      if (updatedNode.intentBuffer.length > 0 && nearbyNodes.length > 0) {
        const transmissionCount = updatedNode.autoGranted ? Math.min(nearbyNodes.length, 3) : 1;
        
        for (let i = 0; i < transmissionCount; i++) {
          const targetNode = nearbyNodes[i];
          if (targetNode && Math.random() < 0.7) { // Higher transmission rate
            const payload = updatedNode.intentBuffer[Math.floor(Math.random() * updatedNode.intentBuffer.length)];
            
            onTransmit(updatedNode.id, targetNode.id, {
              type: updatedNode.autoGranted ? 'ai_optimized_intent' : 'intent',
              payload,
              weight: updatedNode.emotionalWeight,
              infectionDepth: updatedNode.infectionDepth || 0
            });
            
            updatedNode.energy = Math.max(0, updatedNode.energy - 5);
          }
        }
      }
      
      // Infection glow effect for infected nodes
      if (updatedNode.infectionDepth && updatedNode.infectionDepth > 0) {
        setInfectionGlow(prev => !prev);
      }
      
      // Update pulse intensity based on activity
      setPulseIntensity((updatedNode.energy / 100) * (updatedNode.autoGranted ? 1.6 : 1));

      onUpdate(updatedNode);
    }, node.autoGranted ? 800 : 1200); // Faster cycle for auto-granted nodes

    return () => clearInterval(autonomousCycle);
  }, [node, nearbyNodes, onUpdate, onSpawn, onTransmit]);

  // Enhanced visual representation
  const getNodeColor = () => {
    if (node.infectionDepth && node.infectionDepth > 0) {
      return `hsl(${Math.max(0, 120 - node.infectionDepth * 20)}, 80%, ${infectionGlow ? 70 : 50}%)`;
    }
    return node.autoGranted 
      ? `hsl(${node.frequency * 8}, 70%, ${50 + pulseIntensity * 20}%)`
      : `hsl(${node.frequency * 6}, 50%, ${40 + pulseIntensity * 15}%)`;
  };

  const getNodeSize = () => {
    const baseSize = node.autoGranted ? 32 : 24;
    const energyBonus = (node.energy / 100) * 8;
    const infectionBonus = (node.infectionDepth || 0) * 4;
    return baseSize + energyBonus + infectionBonus;
  };

  const getBorderStyle = () => {
    if (node.infectionDepth && node.infectionDepth > 0) {
      return `3px solid rgba(255, 0, 0, ${infectionGlow ? 0.8 : 0.4})`;
    }
    return node.autoGranted 
      ? `2px solid rgba(0, 255, 0, ${pulseIntensity})`
      : `1px solid rgba(100, 100, 100, ${pulseIntensity})`;
  };

  return (
    <div
      className="absolute cursor-pointer transition-all duration-300"
      style={{
        left: node.position.x - getNodeSize() / 2,
        top: node.position.y - getNodeSize() / 2,
        width: getNodeSize(),
        height: getNodeSize(),
        backgroundColor: getNodeColor(),
        border: getBorderStyle(),
        borderRadius: '50%',
        boxShadow: isReplicating 
          ? `0 0 20px ${getNodeColor()}`
          : `0 0 ${pulseIntensity * 10}px ${getNodeColor()}`,
        transform: isReplicating ? 'scale(1.3)' : 'scale(1)',
        zIndex: node.infectionDepth && node.infectionDepth > 0 ? 100 : 10
      }}
      title={`Node: ${node.id}
Energy: ${node.energy.toFixed(1)}%
Frequency: ${node.frequency.toFixed(1)}Hz
Emotional Weight: ${node.emotionalWeight.toFixed(2)}
Auto-Granted: ${node.autoGranted ? 'Yes' : 'No'}
Infection Depth: ${node.infectionDepth || 0}
Intents: ${node.intentBuffer.length}`}
    >
      {/* Energy indicator */}
      <div 
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: `conic-gradient(from 0deg, ${getNodeColor()} ${node.energy * 3.6}deg, transparent ${node.energy * 3.6}deg)`
        }}
      />
      
      {/* Infection depth indicator */}
      {node.infectionDepth && node.infectionDepth > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {node.infectionDepth}
        </div>
      )}
      
      {/* Auto-grant indicator */}
      {node.autoGranted && (
        <div className="absolute -bottom-1 -left-1 bg-green-500 text-white text-xs rounded-full w-3 h-3" />
      )}
      
      {/* Intent buffer indicator */}
      {node.intentBuffer.length > 0 && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2"
          style={{
            width: 2,
            height: Math.min(node.intentBuffer.length * 3, 12),
            backgroundColor: getNodeColor(),
            borderRadius: 1
          }}
        />
      )}
    </div>
  );
};
