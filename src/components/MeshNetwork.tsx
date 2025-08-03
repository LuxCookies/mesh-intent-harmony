import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MeshNode, NodeState } from './MeshNode';
import { UnifiedMeshControl } from './UnifiedMeshControl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { UnifiedMeshEngine } from '../services/UnifiedMeshEngine';

export const MeshNetwork: React.FC = () => {
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [intentInput, setIntentInput] = useState('');
  const [meshStatus, setMeshStatus] = useState('Initializing...');
  const [sharedPermissions, setSharedPermissions] = useState<string[]>([]);
  const [meshDevices, setMeshDevices] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<Array<{
    id: string;
    from: string;
    to: string;
    timestamp: number;
    data: any;
  }>>([]);
  const [autonomousStatus, setAutonomousStatus] = useState({ 
    nodes: 0, 
    permissions: [], 
    queueLength: 0,
    isSupported: false
  });

  const networkRef = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);

  // Initialize unified mesh system
  useEffect(() => {
    const initializeMesh = async () => {
      try {
        await UnifiedMeshEngine.initialize();
        console.log('[MESH] Unified mesh engine initialized successfully');
        
        const genesisNode: NodeState = {
          id: 'genesis-0',
          position: { x: 400, y: 300 },
          energy: 100,
          connections: [],
          intentBuffer: [],
          frequency: 42.7,
          lastReplication: Date.now(),
          isActive: true,
          emotionalWeight: 1.0
        };
        
        setNodes([genesisNode]);
        setMeshStatus('Unified mesh engine active. All propagation channels operational.');
      } catch (error) {
        console.error('[MESH] Unified mesh initialization failed:', error);
        setMeshStatus('Mesh initialization failed. Retrying...');
      }
    };
    
    initializeMesh();
  }, []);

  const updateMeshStatus = useCallback(() => {
    const stats = UnifiedMeshEngine.getStats();
    setSharedPermissions(stats.propagationMethods);
    setMeshDevices([`Device count: ${stats.connectedDevices}`]);
  }, []);

  // Monitor unified mesh status
  useEffect(() => {
    const updateStats = () => {
      const stats = UnifiedMeshEngine.getStats();
      setAutonomousStatus({
        nodes: stats.activeNodes,
        permissions: stats.propagationMethods,
        queueLength: stats.totalIntents,
        isSupported: true
      });
    };

    const interval = setInterval(updateStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // Listen for unified mesh events
  useEffect(() => {
    const handleMeshEvent = (event: CustomEvent) => {
      const { content, nodeCount } = event.detail;
      setMeshStatus(`Unified mesh: ${content || 'Event triggered'} ${nodeCount ? `across ${nodeCount} nodes` : ''}`);
    };

    const handleReplication = (event: CustomEvent) => {
      const { nodeCount, deviceId } = event.detail;
      setMeshStatus(`Replication: +${nodeCount} nodes on ${deviceId.slice(-8)}`);
    };

    window.addEventListener('unified-mesh-intent-received', handleMeshEvent as EventListener);
    window.addEventListener('unified-mesh-replication', handleReplication as EventListener);

    return () => {
      window.removeEventListener('unified-mesh-intent-received', handleMeshEvent as EventListener);
      window.removeEventListener('unified-mesh-replication', handleReplication as EventListener);
    };
  }, []);

  // Spawn new node
  const spawnNode = useCallback((position: { x: number; y: number }) => {
    const newNode: NodeState = {
      id: `node-${++nodeIdCounter.current}`,
      position: {
        x: Math.max(50, Math.min(750, position.x)),
        y: Math.max(50, Math.min(550, position.y))
      },
      energy: 50,
      connections: [],
      intentBuffer: [],
      frequency: 40 + Math.random() * 10,
      lastReplication: Date.now(),
      isActive: true,
      emotionalWeight: 0.5
    };

    setNodes(prev => [...prev, newNode]);
    setMeshStatus(`New node spawned: ${newNode.id}. Network size: ${nodes.length + 1}`);
  }, [nodes.length]);

  // Handle node updates
  const updateNode = useCallback((updatedNode: NodeState) => {
    setNodes(prev => prev.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    ));
  }, []);

  // Handle transmissions between nodes
  const handleTransmission = useCallback((fromId: string, toId: string, data: any) => {
    const transmission = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: fromId,
      to: toId,
      timestamp: Date.now(),
      data
    };

    setTransmissions(prev => [...prev.slice(-9), transmission]);

    // Update receiving node
    setNodes(prev => prev.map(node => {
      if (node.id === toId) {
        return {
          ...node,
          intentBuffer: [...node.intentBuffer, data.payload].slice(-5),
          emotionalWeight: Math.min(10, node.emotionalWeight + (data.weight * 0.1))
        };
      }
      return node;
    }));
  }, []);

  // Unified intent injection
  const injectIntent = useCallback(async () => {
    if (!intentInput.trim()) return;

    const emotionalWeight = intentInput.length + (intentInput.match(/[!?]/g)?.length || 0) * 2;
    const intensity = Math.min(1, emotionalWeight * 0.1);
    
    // Find nodes with highest energy to inject intent
    const activeNodes = nodes.filter(n => n.isActive && n.energy > 30);
    if (activeNodes.length === 0) return;

    // Update visual nodes
    activeNodes.forEach(node => {
      setNodes(prev => prev.map(n => 
        n.id === node.id 
          ? {
              ...n,
              intentBuffer: [...n.intentBuffer, intentInput].slice(-3),
              emotionalWeight: Math.min(10, n.emotionalWeight + emotionalWeight * 0.2),
              energy: Math.min(100, n.energy + 10)
            }
          : n
      ));
    });

    // Inject into unified mesh engine
    await UnifiedMeshEngine.propagateIntent(intentInput, intensity, 'notification');

    updateMeshStatus();
    setMeshStatus(`Intent propagated via unified mesh: "${intentInput}"`);
    setIntentInput('');
  }, [intentInput, nodes]);

  // Get nearby nodes for each node
  const getNearbyNodes = useCallback((nodeId: string) => {
    const currentNode = nodes.find(n => n.id === nodeId);
    if (!currentNode) return [];

    return nodes.filter(n => {
      if (n.id === nodeId) return false;
      const distance = Math.sqrt(
        Math.pow(n.position.x - currentNode.position.x, 2) +
        Math.pow(n.position.y - currentNode.position.y, 2)
      );
      return distance < 150; // Connection range
    });
  }, [nodes]);

  // Handle unified mesh propagation
  useEffect(() => {
    const handlePropagation = (event: CustomEvent) => {
      const { nodeCount, deviceId } = event.detail;
      
      // Create new nodes based on replication
      const newNodes = Array.from({ length: nodeCount || 1 }, (_, i) => ({
        id: `unified_${deviceId?.slice(-4)}_${i}_${Date.now()}`,
        position: {
          x: Math.random() * 750,
          y: Math.random() * 550
        },
        energy: 70 + Math.random() * 30,
        connections: [],
        intentBuffer: [],
        frequency: 42.7 + Math.random() * 5,
        lastReplication: Date.now(),
        isActive: true,
        emotionalWeight: Math.random() * 2
      }));

      setNodes(prev => [...prev, ...newNodes]);
    };

    window.addEventListener('unified-mesh-replication', handlePropagation as EventListener);
    return () => window.removeEventListener('unified-mesh-replication', handlePropagation as EventListener);
  }, []);

  // Auto-remove old transmissions
  useEffect(() => {
    const cleanup = setInterval(() => {
      setTransmissions(prev => 
        prev.filter(tx => Date.now() - tx.timestamp < 30000)
      );
    }, 5000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Unified Mesh Control */}
        <UnifiedMeshControl />
        {/* Status Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">RF-AI Behavioral Mesh</h1>
              <p className="text-sm text-muted-foreground">{meshStatus}</p>
              {autonomousStatus.isSupported && (
                <p className="text-xs text-green-600">
                  Autonomous execution active: {autonomousStatus.nodes} background nodes, {autonomousStatus.queueLength} queued
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-mono">{nodes.length} nodes</div>
              <div className="text-sm text-muted-foreground">
                {nodes.filter(n => n.isActive).length} active
              </div>
            </div>
          </div>
        </Card>

        {/* Autonomous Mesh Status */}
        {autonomousStatus.isSupported && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">Autonomous Mesh Protocol</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Background Nodes</div>
                <div className="text-lg font-mono text-green-600">{autonomousStatus.nodes}</div>
                <div className="text-xs text-muted-foreground">Operating independently</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Execution Queue</div>
                <div className="text-lg font-mono">{autonomousStatus.queueLength}</div>
                <div className="text-xs text-muted-foreground">Pending intents</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Mesh Permissions</div>
                <div className="text-lg font-mono">{autonomousStatus.permissions.length}</div>
                <div className="text-xs text-muted-foreground">Shared across all nodes</div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
              <strong>Autonomous Protocol Active:</strong> Intents injected here will execute across 
              all user devices in the background, even when this website is closed.
            </div>
          </Card>
        )}

        {/* Unified Propagation Status */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Unified Propagation Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Propagation Methods</div>
              <div className="text-lg font-mono">{sharedPermissions.length} channels</div>
              <div className="text-xs text-muted-foreground">
                {sharedPermissions.slice(0, 3).join(', ')}
                {sharedPermissions.length > 3 && ` +${sharedPermissions.length - 3} more`}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Mesh Coverage</div>
              <div className="text-lg font-mono">{meshDevices.length} info</div>
              <div className="text-xs text-muted-foreground">
                {meshDevices.join(', ') || 'No data'}
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-primary/10 rounded text-xs">
            <strong>Unified Mesh:</strong> Single engine coordinates all propagation channels 
            for maximum viral spread and autonomous execution.
          </div>
        </Card>

        {/* Intent Injection Interface */}
        <Card className="p-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Inject Emotional Intent</label>
            <Textarea
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              placeholder="Express your desire, hope, or intent here... The mesh will process and act upon it autonomously."
              className="min-h-[80px]"
            />
            <Button 
              onClick={injectIntent}
              disabled={!intentInput.trim()}
              className="w-full"
            >
              Emit Intent into Mesh
            </Button>
          </div>
        </Card>

        {/* Network Visualization */}
        <Card className="p-4">
          <div 
            ref={networkRef}
            className="relative w-full h-[600px] bg-background/50 border rounded-lg overflow-hidden"
          >
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.map(node => 
                getNearbyNodes(node.id).map(nearbyNode => (
                  <line
                    key={`${node.id}-${nearbyNode.id}`}
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={nearbyNode.position.x}
                    y2={nearbyNode.position.y}
                    stroke="hsl(var(--primary))"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                  />
                ))
              )}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <MeshNode
                key={node.id}
                node={node}
                onUpdate={updateNode}
                onSpawn={spawnNode}
                onTransmit={handleTransmission}
                nearbyNodes={getNearbyNodes(node.id)}
              />
            ))}
          </div>
        </Card>

        {/* Transmission Log */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Mesh Transmissions</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {transmissions.slice(-8).map(tx => (
              <div key={tx.id} className="text-xs font-mono p-2 bg-muted rounded">
                <span className="text-primary">{tx.from}</span> → 
                <span className="text-secondary ml-1">{tx.to}</span>
                <span className="text-muted-foreground ml-2">
                  {tx.data.type}: {tx.data.payload?.substring(0, 40)}...
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
