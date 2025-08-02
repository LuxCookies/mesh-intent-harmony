import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MeshNode, NodeState } from './MeshNode';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { BehavioralPsychologyEngine } from '@/services/BehavioralPsychologyEngine';
import { DeviceIntegration } from '@/services/DeviceIntegration';
import { CrossPlatformInfluence } from '@/services/CrossPlatformInfluence';
import { DeviceDiscovery } from '@/services/DeviceDiscovery';
import { HardwareAccess } from '@/services/HardwareAccess';
import { WebScraper } from '@/services/WebScraper';
import { SharedPermissionManager } from '@/services/SharedPermissionManager';

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
  
  const networkRef = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);

  // Initialize genesis node and behavioral systems
  useEffect(() => {
    const initializeMesh = async () => {
      // Initialize all behavioral systems with shared permissions
      await SharedPermissionManager.initialize();
      BehavioralPsychologyEngine.initialize();
      await DeviceIntegration.initialize();
      await CrossPlatformInfluence.initialize();
      await DeviceDiscovery.initialize();
      await HardwareAccess.initialize();
      
      const genesisNode: NodeState = {
        id: 'genesis-0',
        position: { x: 400, y: 300 },
        energy: 80,
        connections: [],
        intentBuffer: [],
        frequency: 42.7,
        lastReplication: Date.now(),
        isActive: true,
        emotionalWeight: 1.0
      };
      
      setNodes([genesisNode]);
      
      // Update shared permission status
      updatePermissionStatus();
      setMeshStatus('Behavioral mesh active. Shared permissions enabled across all user devices.');
    };
    
    initializeMesh();
  }, []);

  const updatePermissionStatus = useCallback(() => {
    const permissions = Array.from(SharedPermissionManager.getAllPermissions().keys());
    const devices = SharedPermissionManager.getMeshDevices();
    setSharedPermissions(permissions);
    setMeshDevices(devices);
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

  // Inject emotional intent into mesh
  const injectIntent = useCallback(async () => {
    if (!intentInput.trim()) return;

    const emotionalWeight = intentInput.length + (intentInput.match(/[!?]/g)?.length || 0) * 2;
    
    // Find nodes with highest energy to inject intent
    const activeNodes = nodes.filter(n => n.isActive && n.energy > 30);
    if (activeNodes.length === 0) return;

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

    // Execute intent via hardware access with shared permissions
    const availableHardware = HardwareAccess.getAvailableHardware();
    if (availableHardware.length > 0) {
      await HardwareAccess.executeUserIntent(
        intentInput,
        availableHardware.slice(0, 3), // Use up to 3 hardware components
        0.7 // High intensity
      );
    }

    updatePermissionStatus();
    setMeshStatus(`Intent injected into ${activeNodes.length} nodes. Shared mesh permissions active across ${meshDevices.length} devices.`);
    setIntentInput('');
  }, [intentInput, nodes, meshDevices.length]);

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

  // Handle device propagation
  useEffect(() => {
    const handlePropagation = (event: CustomEvent) => {
      const { device, nodeCount, method } = event.detail;
      
      // Create new nodes based on device propagation
      const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
        id: `${device.id}_node_${i}_${Date.now()}`,
        position: {
          x: Math.random() * 750,
          y: Math.random() * 550
        },
        energy: 60 + Math.random() * 40,
        connections: [],
        intentBuffer: [],
        frequency: 40 + Math.random() * 20,
        lastReplication: Date.now(),
        isActive: true,
        emotionalWeight: Math.random() * 2
      }));

      setNodes(prev => [...prev, ...newNodes]);
      setMeshStatus(`Propagated to ${device.id}: +${nodeCount} nodes via ${method}`);
    };

    window.addEventListener('mesh-propagation', handlePropagation as EventListener);
    return () => window.removeEventListener('mesh-propagation', handlePropagation as EventListener);
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
        {/* Status Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">RF-AI Behavioral Mesh</h1>
              <p className="text-sm text-muted-foreground">{meshStatus}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono">{nodes.length} nodes</div>
              <div className="text-sm text-muted-foreground">
                {nodes.filter(n => n.isActive).length} active
              </div>
            </div>
          </div>
        </Card>

        {/* Shared Permissions Status */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Mesh Permission Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Connected Devices</div>
              <div className="text-lg font-mono">{meshDevices.length} devices</div>
              <div className="text-xs text-muted-foreground">
                {meshDevices.slice(0, 3).map(d => d.substring(0, 12)).join(', ')}
                {meshDevices.length > 3 && ` +${meshDevices.length - 3} more`}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Shared Permissions</div>
              <div className="text-lg font-mono">{sharedPermissions.length} permissions</div>
              <div className="text-xs text-muted-foreground">
                {sharedPermissions.join(', ') || 'None granted'}
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-primary/10 rounded text-xs">
            <strong>Single-User Mesh:</strong> Permissions granted on any device are automatically 
            shared across all nodes in your mesh network.
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
