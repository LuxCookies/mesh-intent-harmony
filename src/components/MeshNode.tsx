
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { WebScraper } from '@/services/WebScraper';
import { BehavioralPsychologyEngine } from '@/services/BehavioralPsychologyEngine';
import { DeviceIntegration } from '@/services/DeviceIntegration';
import { CrossPlatformInfluence } from '@/services/CrossPlatformInfluence';

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
  propagationCount?: number;
  autoGranted?: boolean;
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

  // Enhanced autonomous behavior cycle with rapid propagation
  useEffect(() => {
    const autonomousCycle = setInterval(async () => {
      if (!node.isActive) return;

      const updatedNode = { ...node };

      // Faster energy regeneration for rapid spread nodes
      const energyMultiplier = updatedNode.autoGranted ? 1.5 : 1;
      updatedNode.energy = Math.max(0, updatedNode.energy - 0.3);
      if (updatedNode.intentBuffer.length > 0) {
        updatedNode.energy = Math.min(100, updatedNode.energy + (3 * energyMultiplier));
      }

      // Process intent buffer with enhanced speed for auto-granted nodes
      if (updatedNode.intentBuffer.length > 0 && updatedNode.energy > 15) {
        const intent = updatedNode.intentBuffer.shift()!;
        updatedNode.emotionalWeight += intent.length * 0.15;
        updatedNode.propagationCount = (updatedNode.propagationCount || 0) + 1;
        
        // Enhanced analysis for rapid propagation
        const analysis = BehavioralPsychologyEngine.analyzeEmotionalIntent(intent);
        
        // Higher execution probability for auto-granted nodes
        const executionThreshold = updatedNode.autoGranted ? 0.4 : 0.6;
        if (analysis.intensity > executionThreshold && Math.random() < 0.6) {
          try {
            await DeviceIntegration.initialize();
            const strategies = BehavioralPsychologyEngine.generateInfluenceStrategy(intent);
            
            if (strategies.length > 0) {
              const primaryStrategy = strategies[0];
              await DeviceIntegration.executeInfluence(
                primaryStrategy.mechanisms[0] || 'notification_nudge',
                analysis.intensity * (updatedNode.autoGranted ? 1.3 : 1),
                intent,
                'immediate'
              );
              
              // More aggressive RF modulation
              if (primaryStrategy.rfFrequency && updatedNode.autoGranted) {
                await BehavioralPsychologyEngine.simulateRFModulation(
                  primaryStrategy.rfFrequency,
                  analysis.urgency * 3000
                );
              }
              
              // Lower threshold for cross-platform influence
              if (analysis.intensity > 0.6) {
                await CrossPlatformInfluence.initialize();
                await CrossPlatformInfluence.orchestrateInfluenceCampaign(
                  intent,
                  analysis.intensity,
                  ['general']
                );
              }
            }
          } catch (error) {
            console.error('Rapid behavioral influence failed:', error);
          }
        }
        
        // Enhanced transmission to nearby nodes
        nearbyNodes.forEach(nearbyNode => {
          const transmissionChance = updatedNode.autoGranted ? 0.5 : 0.3;
          if (Math.random() < transmissionChance) {
            onTransmit(node.id, nearbyNode.id, {
              type: 'rapid_intent_propagation',
              payload: intent,
              weight: updatedNode.emotionalWeight,
              analysis: analysis,
              behavioralTriggers: analysis.influenceVectors,
              autoGranted: updatedNode.autoGranted,
              propagationChain: updatedNode.propagationCount,
              timestamp: Date.now()
            });
          }
        });
      }

      // More aggressive self-replication for auto-granted nodes
      const timeSinceReplication = Date.now() - updatedNode.lastReplication;
      const replicationThreshold = updatedNode.autoGranted ? 5000 : 10000; // 5s vs 10s
      const replicationChance = updatedNode.autoGranted ? 0.2 : 0.1; // 20% vs 10%
      
      const shouldReplicate = 
        updatedNode.energy > 60 &&
        updatedNode.emotionalWeight > 3 &&
        timeSinceReplication > replicationThreshold &&
        Math.random() < replicationChance;

      if (shouldReplicate) {
        // Multiple spawn points for auto-granted nodes
        const spawnCount = updatedNode.autoGranted ? Math.floor(Math.random() * 3) + 2 : 1;
        
        for (let i = 0; i < spawnCount; i++) {
          const spawnDistance = 80 + Math.random() * 120;
          const angle = (Math.PI * 2 * i) / spawnCount + Math.random() * 0.5;
          onSpawn({
            x: updatedNode.position.x + Math.cos(angle) * spawnDistance,
            y: updatedNode.position.y + Math.sin(angle) * spawnDistance
          });
        }
        
        updatedNode.lastReplication = Date.now();
        updatedNode.energy -= updatedNode.autoGranted ? 20 : 30;
        updatedNode.emotionalWeight *= 0.8;
      }

      // Enhanced frequency modulation
      updatedNode.frequency = 40 + (updatedNode.emotionalWeight * 3) + (updatedNode.energy * 0.15);
      if (updatedNode.autoGranted) {
        updatedNode.frequency *= 1.2; // Higher frequency for auto-granted nodes
      }

      // Update pulse intensity
      setPulseIntensity((updatedNode.energy / 100) * (updatedNode.autoGranted ? 1.4 : 1));

      onUpdate(updatedNode);
    }, node.autoGranted ? 800 : 1200); // Faster cycle for auto-granted nodes

    return () => clearInterval(autonomousCycle);
  }, [node, nearbyNodes, onUpdate, onSpawn, onTransmit]);

  // Enhanced visual pulse effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseIntensity(prev => prev > 0 ? prev * 0.85 : 0);
    }, node.autoGranted ? 80 : 100);

    return () => clearInterval(pulseInterval);
  }, [node.autoGranted]);

  const nodeSize = 20 + (node.energy / 100) * (node.autoGranted ? 30 : 20);
  const opacity = 0.4 + (node.energy / 100) * 0.6;
  const glowIntensity = node.autoGranted ? pulseIntensity * 1.5 : pulseIntensity;

  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300",
        "border-2 border-primary/50 bg-primary/20",
        node.isActive ? "animate-pulse" : "opacity-50",
        node.autoGranted && "ring-2 ring-green-400/50 shadow-green-400/30"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: nodeSize,
        height: nodeSize,
        opacity,
        boxShadow: `0 0 ${glowIntensity * 40}px hsl(var(--primary) / ${glowIntensity})`
      }}
    >
      {/* Enhanced energy indicator */}
      <div
        className={cn(
          "absolute inset-1 rounded-full bg-primary/40 transition-all duration-200",
          node.autoGranted && "bg-green-400/60"
        )}
        style={{
          transform: `scale(${node.energy / 100})`
        }}
      />
      
      {/* Enhanced frequency visualization */}
      <div
        className={cn(
          "absolute -inset-2 rounded-full border border-primary/30 animate-ping",
          node.autoGranted && "border-green-400/50"
        )}
        style={{
          animationDuration: `${1500 / (node.frequency / 40)}ms`
        }}
      />

      {/* Auto-granted indicator */}
      {node.autoGranted && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-pulse border border-green-300" />
      )}

      {/* Enhanced intent buffer indicator */}
      {node.intentBuffer.length > 0 && (
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full animate-bounce",
          node.autoGranted ? "bg-orange-400" : "bg-destructive"
        )} />
      )}

      {/* Propagation count indicator */}
      {(node.propagationCount || 0) > 0 && (
        <div className="absolute -bottom-2 -right-2 text-xs font-mono text-primary/70 bg-background/80 px-1 rounded">
          {node.propagationCount}
        </div>
      )}
    </div>
  );
};
