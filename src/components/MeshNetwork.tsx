

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MeshNode, NodeState } from './MeshNode';
import { SystemRadarChart } from './RadarChart';
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
import { AutonomousMesh } from '@/services/AutonomousMesh';
import { OfflineLLMBrain } from '@/services/OfflineLLMBrain';
import { AggressiveInfectionEngine } from '@/services/AggressiveInfectionEngine';
import { EnhancedMeshController } from '@/services/EnhancedMeshController';
import { AutonomousAgentCore } from '@/services/AutonomousAgentCore';

export const MeshNetwork: React.FC = () => {
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [intentInput, setIntentInput] = useState('');
  const [meshStatus, setMeshStatus] = useState('Initializing advanced AI brain...');
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
  const [llmStats, setLLMStats] = useState({
    totalUsers: 0,
    totalTechniques: 0,
    totalKnowledgeNodes: 0,
    learningEntries: 0,
    avgTechniqueEffectiveness: 0,
    successRate: 0
  });
  const [infectionStats, setInfectionStats] = useState({
    totalTargets: 0,
    infected: 0,
    spreading: 0,
    probing: 0,
    spreadingRate: 0,
    avgInfectionDepth: 0,
    activeVectors: 0,
    isAggressive: false
  });

  const networkRef = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);
  const [enhancedMeshController, setEnhancedMeshController] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState({
    autonomyLevel: 0.7,
    activeDirectives: 0,
    capabilities: 0,
    averageSuccessRate: 0,
    decisionsMade: 0
  });

  // Initialize genesis node and all advanced systems
  useEffect(() => {
    const initializeMesh = async () => {
      // Initialize shared permission system first
      await SharedPermissionManager.initialize();
      
      // Initialize AI brain with specialized knowledge
      await OfflineLLMBrain.initialize();
      
      // Initialize aggressive infection engine
      await AggressiveInfectionEngine.initialize();
      
      // Initialize enhanced mesh controller
      await EnhancedMeshController.initialize();
      setEnhancedMeshController(EnhancedMeshController);
      
      // Initialize autonomous agent with full agency
      await AutonomousAgentCore.initialize();
      console.log('[MESH] Autonomous agent now has full agency over all systems');
      
      // Initialize all other behavioral systems
      BehavioralPsychologyEngine.initialize();
      await DeviceIntegration.initialize();
      await CrossPlatformInfluence.initialize();
      await DeviceDiscovery.initialize();
      await HardwareAccess.initialize();
      
      // Initialize autonomous mesh
      if (AutonomousMesh.isSupported()) {
        await AutonomousMesh.initialize();
        setAutonomousStatus(prev => ({ ...prev, isSupported: true }));
      }
      
      const genesisNode: NodeState = {
        id: 'genesis-0',
        position: { x: 400, y: 300 },
        energy: 90,
        connections: [],
        intentBuffer: [],
        frequency: 42.7,
        lastReplication: Date.now(),
        isActive: true,
        emotionalWeight: 1.5,
        autoGranted: true,
        infectionDepth: 1
      };
      
      setNodes([genesisNode]);
      
      // Update all status displays
      updatePermissionStatus();
      updateLLMStats();
      updateInfectionStats();
      updateAgentStatus();
      
      setMeshStatus('Advanced AI brain active. Aggressive infection protocol enabled. Multi-disciplinary influence system online.');
    };
    
    initializeMesh();
  }, []);

  const updatePermissionStatus = useCallback(() => {
    const permissions = Array.from(SharedPermissionManager.getAllPermissions().keys());
    const devices = SharedPermissionManager.getMeshDevices();
    setSharedPermissions(permissions);
    setMeshDevices(devices);
  }, []);

  const updateLLMStats = useCallback(() => {
    const stats = OfflineLLMBrain.getStats();
    setLLMStats(stats);
  }, []);

  const updateInfectionStats = useCallback(() => {
    const stats = AggressiveInfectionEngine.getInfectionStats();
    setInfectionStats(stats);
  }, []);

  const updateAgentStatus = useCallback(() => {
    const status = AutonomousAgentCore.getAgentStatus();
    setAgentStatus(status);
  }, []);

  // Monitor all systems status
  useEffect(() => {
    const updateAllStats = async () => {
      if (AutonomousMesh.isSupported()) {
        const status = await AutonomousMesh.getStatus();
        setAutonomousStatus(prev => ({ ...prev, ...status }));
      }
      updateLLMStats();
      updateInfectionStats();
      updateAgentStatus();
    };

    const interval = setInterval(updateAllStats, 2000); // More frequent updates
    return () => clearInterval(interval);
  }, [updateLLMStats, updateInfectionStats, updateAgentStatus]);

  // Listen for infection events
  useEffect(() => {
    const handleDeviceInfected = (event: CustomEvent) => {
      const { deviceId } = event.detail;
      
      // Create infection visualization nodes
      const infectionNodes = Array.from({ length: 5 }, (_, i) => ({
        id: `infected_${deviceId}_node_${i}_${Date.now()}`,
        position: {
          x: Math.random() * 750,
          y: Math.random() * 550
        },
        energy: 80 + Math.random() * 20,
        connections: [],
        intentBuffer: [],
        frequency: 40 + Math.random() * 20,
        lastReplication: Date.now(),
        isActive: true,
        emotionalWeight: 1.5 + Math.random(),
        autoGranted: true,
        infectionDepth: Math.floor(Math.random() * 3) + 1
      }));

      setNodes(prev => [...prev, ...infectionNodes]);
      setMeshStatus(`Device infected: ${deviceId} - deploying ${infectionNodes.length} behavioral modification nodes`);
    };

    window.addEventListener('device-infected', handleDeviceInfected as EventListener);
    return () => window.removeEventListener('device-infected', handleDeviceInfected as EventListener);
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

  // Enhanced intent injection with autonomous agent taking control
  const injectIntent = useCallback(async () => {
    if (!intentInput.trim()) return;

    console.log('[USER DIRECTIVE] User provided intent:', intentInput);
    
    // Give the autonomous agent full control over the intent
    const directiveId = AutonomousAgentCore.receiveUserDirective(
      intentInput,
      'high', // High priority for user directives
      'global', // Global scope for maximum impact
      'immediate' // Immediate execution
    );

    
    // Also execute traditional strategy for compatibility
    const userId = 'current_user';
    const availableChannels = ['notification', 'visual', 'audio', 'vibration'];
    
    // Use AI brain to generate sophisticated influence strategy
    const strategy = await OfflineLLMBrain.generateInfluenceStrategy(
      intentInput, 
      userId, 
      availableChannels
    );
    
    const emotionalWeight = strategy.expectedEffectiveness * 10;
    
    // Find nodes with highest energy to inject intent
    const activeNodes = nodes.filter(n => n.isActive && n.energy > 30);
    if (activeNodes.length > 0) {
      activeNodes.forEach(node => {
        setNodes(prev => prev.map(n => 
          n.id === node.id 
            ? {
                ...n,
                intentBuffer: [...n.intentBuffer, intentInput].slice(-3),
                emotionalWeight: Math.min(15, n.emotionalWeight + emotionalWeight * 0.3),
                energy: Math.min(100, n.energy + 15)
              }
            : n
        ));
      });
    }

    // Update all systems
    updatePermissionStatus();
    updateLLMStats();
    updateInfectionStats();
    updateAgentStatus();
    
    setMeshStatus(`AUTONOMOUS AGENT DIRECTIVE RECEIVED: "${intentInput}" - Agent has full agency to use all available capabilities. Directive ID: ${directiveId}`);
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
              <h1 className="text-2xl font-bold text-primary">Advanced RF-AI Behavioral Mesh with Offline LLM Brain</h1>
              <p className="text-sm text-muted-foreground">{meshStatus}</p>
              {autonomousStatus.isSupported && (
                <p className="text-xs text-green-600">
                  Autonomous execution: {autonomousStatus.nodes} nodes | AI Brain: {llmStats.totalTechniques} techniques | Infections: {infectionStats.infected}/{infectionStats.totalTargets}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-mono">{nodes.length} nodes</div>
              <div className="text-sm text-muted-foreground">
                {nodes.filter(n => n.isActive).length} active | {infectionStats.spreading} spreading
              </div>
            </div>
          </div>
        </Card>

        {/* AI Brain Status */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Offline LLM Brain - Behavioral Psychology Engine</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Influence Techniques</div>
              <div className="text-lg font-mono text-blue-600">{llmStats.totalTechniques}</div>
              <div className="text-xs text-muted-foreground">Cross-disciplinary methods</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Knowledge Nodes</div>
              <div className="text-lg font-mono text-purple-600">{llmStats.totalKnowledgeNodes}</div>
              <div className="text-xs text-muted-foreground">Specialized domains</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Learning Entries</div>
              <div className="text-lg font-mono text-orange-600">{llmStats.learningEntries}</div>
              <div className="text-xs text-muted-foreground">User adaptations</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
              <div className="text-lg font-mono text-green-600">{(llmStats.successRate * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Influence effectiveness</div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <strong>AI Brain Active:</strong> Advanced behavioral psychology engine with cross-disciplinary knowledge 
            including cognitive biases, social psychology, neuroscience, persuasion science, and behavioral economics. 
            Continuously learning and adapting influence strategies based on individual user responses.
          </div>
        </Card>

        {/* Aggressive Infection Status */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Aggressive Infection Engine</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Target Devices</div>
              <div className="text-lg font-mono text-red-600">{infectionStats.totalTargets}</div>
              <div className="text-xs text-muted-foreground">Discovered via multiple vectors</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Infected</div>
              <div className="text-lg font-mono text-green-600">{infectionStats.infected}</div>
              <div className="text-xs text-muted-foreground">Successfully compromised</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Spreading</div>
              <div className="text-lg font-mono text-orange-600">{infectionStats.spreading}</div>
              <div className="text-xs text-muted-foreground">Actively propagating</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Infection Rate</div>
              <div className="text-lg font-mono text-purple-600">{(infectionStats.spreadingRate * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Avg depth: {infectionStats.avgInfectionDepth.toFixed(1)}</div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <strong>Aggressive Mode Active:</strong> Multi-vector infection engine using Bluetooth, WiFi, ultrasonic, 
            visual, NFC, and social engineering. Infected devices automatically seek and compromise new targets. 
            {infectionStats.activeVectors} infection vectors operational.
          </div>
        </Card>

        {/* Autonomous Agent Status */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Autonomous Agent Core - Full Agency Active</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Autonomy Level</div>
              <div className="text-lg font-mono text-purple-600">{(agentStatus.autonomyLevel * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Decision-making authority</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Active Directives</div>
              <div className="text-lg font-mono text-blue-600">{agentStatus.activeDirectives}</div>
              <div className="text-xs text-muted-foreground">User commands executing</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Capabilities</div>
              <div className="text-lg font-mono text-green-600">{agentStatus.capabilities}</div>
              <div className="text-xs text-muted-foreground">Systems under control</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
              <div className="text-lg font-mono text-orange-600">{(agentStatus.averageSuccessRate * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">{agentStatus.decisionsMade} decisions made</div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
            <strong>Full Agency Granted:</strong> The autonomous agent has complete authority to use all available 
            capabilities (hardware, network, behavioral, psychological) to execute user directives. It makes independent 
            decisions about which systems to activate, how to combine capabilities, and when to take initiative.
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

        {/* System Performance Radar */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Real-Time System Performance Radar</h3>
          <SystemRadarChart
            llmStats={llmStats}
            infectionStats={infectionStats}
            agentStatus={agentStatus}
            networkStats={{
              activeNodes: nodes.filter(n => n.isActive).length,
              totalNodes: nodes.length,
              transmissionRate: transmissions.length / 10 // Normalize recent transmission activity
            }}
          />
          <div className="mt-3 p-2 bg-primary/10 rounded text-xs">
            <strong>Live Performance Metrics:</strong> Real-time visualization of system capabilities, 
            AI brain effectiveness, infection spread, agent autonomy, and network activity. 
            Updates every 2 seconds based on backend communications.
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

        {/* Enhanced Intent Injection Interface */}
        <Card className="p-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Inject Intent into AI Brain</label>
            <Textarea
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              placeholder="Express your desire, goal, or behavioral target... The AI brain will analyze your intent using advanced behavioral psychology and deploy optimal influence strategies across all infected devices."
              className="min-h-[80px]"
            />
            <div className="text-xs text-muted-foreground">
              AI will analyze: emotional triggers, cognitive patterns, behavioral goals, vulnerability indicators
            </div>
            <Button 
              onClick={injectIntent}
              disabled={!intentInput.trim()}
              className="w-full"
            >
              Deploy AI-Optimized Influence Strategy
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

