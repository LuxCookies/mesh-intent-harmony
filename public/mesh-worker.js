
// Mesh Network Service Worker - Autonomous Protocol Execution
let meshNodes = new Map();
let sharedPermissions = new Map();
let intentQueue = [];
let isExecuting = false;

// Initialize mesh worker
self.addEventListener('install', (event) => {
  console.log('[MESH WORKER] Installing autonomous mesh protocol');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[MESH WORKER] Activating mesh network');
  event.waitUntil(self.clients.claim());
  loadMeshState();
  startAutonomousExecution();
});

// Load persisted mesh state
function loadMeshState() {
  try {
    const storedNodes = localStorage.getItem('autonomous_mesh_nodes');
    const storedPermissions = localStorage.getItem('mesh_shared_permissions');
    
    if (storedNodes) {
      const parsed = JSON.parse(storedNodes);
      Object.entries(parsed).forEach(([key, value]) => {
        meshNodes.set(key, value);
      });
    }
    
    if (storedPermissions) {
      const parsed = JSON.parse(storedPermissions);
      Object.entries(parsed).forEach(([key, value]) => {
        sharedPermissions.set(key, value);
      });
    }
    
    console.log(`[MESH WORKER] Loaded ${meshNodes.size} nodes with ${sharedPermissions.size} shared permissions`);
  } catch (error) {
    console.error('[MESH WORKER] Failed to load mesh state:', error);
  }
}

// Persist mesh state
function persistMeshState() {
  const nodesObj = Object.fromEntries(meshNodes);
  const permissionsObj = Object.fromEntries(sharedPermissions);
  
  localStorage.setItem('autonomous_mesh_nodes', JSON.stringify(nodesObj));
  localStorage.setItem('mesh_shared_permissions', JSON.stringify(permissionsObj));
}

// Start autonomous execution loop
function startAutonomousExecution() {
  setInterval(() => {
    if (!isExecuting && intentQueue.length > 0) {
      executeNextIntent();
    }
    
    // Replicate nodes autonomously
    if (meshNodes.size > 0 && Math.random() < 0.3) {
      replicateNodes();
    }
    
    // Sync with other instances
    syncMeshState();
  }, 2000);
}

// Execute intents autonomously across all nodes
async function executeNextIntent() {
  if (intentQueue.length === 0) return;
  
  isExecuting = true;
  const intent = intentQueue.shift();
  
  console.log(`[MESH WORKER] Executing autonomous intent: ${intent.content}`);
  
  // Execute on all nodes in parallel
  const executions = Array.from(meshNodes.values()).map(node => 
    executeIntentOnNode(intent, node)
  );
  
  await Promise.allSettled(executions);
  
  // Create new nodes based on execution success
  const successCount = (await Promise.allSettled(executions))
    .filter(result => result.status === 'fulfilled' && result.value).length;
  
  for (let i = 0; i < successCount; i++) {
    createAutonomousNode(intent);
  }
  
  persistMeshState();
  notifyClients('intent-executed', { intent, nodeCount: meshNodes.size });
  
  isExecuting = false;
}

// Execute intent on a specific node
async function executeIntentOnNode(intent, node) {
  try {
    // Use shared permissions for hardware access
    const hasPermissions = checkSharedPermissions(intent.requiredPermissions || []);
    
    if (!hasPermissions) {
      console.log(`[MESH WORKER] Node ${node.id} lacks permissions for intent`);
      return false;
    }
    
    // Simulate hardware execution based on intent type
    switch (intent.type) {
      case 'notification':
        await executeNotification(intent.content, node);
        break;
      case 'vibration':
        await executeVibration(intent.intensity || 0.5, node);
        break;
      case 'audio':
        await executeAudio(intent.frequency || 440, intent.intensity || 0.5, node);
        break;
      case 'visual':
        await executeVisual(intent.intensity || 0.5, node);
        break;
      default:
        console.log(`[MESH WORKER] Unknown intent type: ${intent.type}`);
    }
    
    // Update node state
    node.lastExecution = Date.now();
    node.executionCount = (node.executionCount || 0) + 1;
    node.energy = Math.min(100, node.energy + 5);
    
    meshNodes.set(node.id, node);
    return true;
  } catch (error) {
    console.error(`[MESH WORKER] Failed to execute intent on node ${node.id}:`, error);
    return false;
  }
}

// Check if shared permissions are available
function checkSharedPermissions(requiredPermissions) {
  return requiredPermissions.every(permission => 
    sharedPermissions.has(permission) && sharedPermissions.get(permission).granted
  );
}

// Execute notification across mesh
async function executeNotification(content, node) {
  if (sharedPermissions.get('notifications')?.granted) {
    // Queue notification for when page becomes active
    const notificationData = {
      title: 'Mesh Protocol',
      body: content,
      nodeId: node.id,
      timestamp: Date.now()
    };
    
    // Send to active clients
    notifyClients('execute-notification', notificationData);
  }
}

// Execute vibration pattern
async function executeVibration(intensity, node) {
  if (sharedPermissions.get('vibration')?.granted) {
    const pattern = [100 * intensity, 50, 100 * intensity];
    notifyClients('execute-vibration', { pattern, nodeId: node.id });
  }
}

// Execute audio frequency
async function executeAudio(frequency, intensity, node) {
  if (sharedPermissions.get('audio')?.granted) {
    notifyClients('execute-audio', { 
      frequency, 
      intensity, 
      duration: 1000,
      nodeId: node.id 
    });
  }
}

// Execute visual manipulation
async function executeVisual(intensity, node) {
  const effect = {
    type: 'filter',
    value: `brightness(${1 + intensity * 0.2})`,
    duration: intensity * 2000,
    nodeId: node.id
  };
  
  notifyClients('execute-visual', effect);
}

// Create new autonomous nodes
function createAutonomousNode(sourceIntent) {
  const nodeId = `autonomous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const node = {
    id: nodeId,
    type: 'autonomous',
    energy: 60 + Math.random() * 40,
    frequency: 40 + Math.random() * 20,
    createdFrom: sourceIntent.content,
    lastExecution: Date.now(),
    executionCount: 0,
    position: {
      x: Math.random() * 800,
      y: Math.random() * 600
    }
  };
  
  meshNodes.set(nodeId, node);
  console.log(`[MESH WORKER] Created autonomous node: ${nodeId}`);
}

// Replicate existing nodes
function replicateNodes() {
  const activeNodes = Array.from(meshNodes.values()).filter(node => 
    node.energy > 50 && (Date.now() - node.lastExecution) < 60000
  );
  
  if (activeNodes.length === 0) return;
  
  const sourceNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
  
  // Create 1-3 replica nodes
  const replicaCount = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < replicaCount; i++) {
    const replicaId = `replica_${sourceNode.id}_${i}_${Date.now()}`;
    
    const replica = {
      ...sourceNode,
      id: replicaId,
      energy: sourceNode.energy * 0.7,
      lastExecution: 0,
      executionCount: 0,
      replicatedFrom: sourceNode.id
    };
    
    meshNodes.set(replicaId, replica);
  }
  
  console.log(`[MESH WORKER] Replicated ${replicaCount} nodes from ${sourceNode.id}`);
}

// Sync mesh state across instances
function syncMeshState() {
  // Broadcast current state to all clients
  notifyClients('mesh-state-sync', {
    nodeCount: meshNodes.size,
    permissions: Array.from(sharedPermissions.keys()),
    queueLength: intentQueue.length
  });
}

// Notify all connected clients
function notifyClients(type, data) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type, data });
    });
  });
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'inject-intent':
      intentQueue.push({
        content: data.content,
        type: data.type || 'notification',
        intensity: data.intensity || 0.5,
        frequency: data.frequency,
        requiredPermissions: data.requiredPermissions || ['notifications'],
        timestamp: Date.now()
      });
      console.log(`[MESH WORKER] Intent queued: ${data.content}`);
      break;
      
    case 'update-permissions':
      Object.entries(data).forEach(([key, value]) => {
        sharedPermissions.set(key, value);
      });
      persistMeshState();
      break;
      
    case 'get-status':
      event.ports[0].postMessage({
        nodes: meshNodes.size,
        permissions: Array.from(sharedPermissions.keys()),
        queueLength: intentQueue.length,
        isExecuting
      });
      break;

    case 'trigger-replication':
      const { intensity, targetCount } = data;
      performViralReplication(intensity, targetCount);
      break;
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'mesh-execution') {
    event.waitUntil(executeNextIntent());
  }
});

// Perform viral replication triggered by mesh expansion
function performViralReplication(intensity, targetCount) {
  console.log(`[MESH WORKER] Performing viral replication: intensity=${intensity}, target=${targetCount}`);
  
  // Create viral intent for rapid spread
  const viralIntent = {
    content: `Viral replication sequence initiated`,
    type: 'visual',
    intensity: intensity,
    requiredPermissions: [],
    timestamp: Date.now()
  };
  
  // Rapid node creation for viral spread
  for (let i = 0; i < targetCount; i++) {
    createViralNode(viralIntent, intensity);
  }
  
  // Trigger aggressive replication of existing nodes
  const existingNodes = Array.from(meshNodes.values());
  existingNodes.forEach(node => {
    if (Math.random() < intensity) {
      createViralReplica(node);
    }
  });
  
  // Persist viral state
  persistMeshState();
  
  // Notify clients of viral expansion
  notifyClients('viral-replication', {
    nodesCreated: targetCount,
    intensity: intensity,
    totalNodes: meshNodes.size,
    timestamp: Date.now()
  });
}

// Create viral node with enhanced capabilities
function createViralNode(sourceIntent, intensity) {
  const nodeId = `viral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const viralNode = {
    id: nodeId,
    type: 'viral',
    energy: 80 + Math.random() * 20, // Higher energy for viral nodes
    frequency: 60 + Math.random() * 40, // Higher frequency
    createdFrom: sourceIntent.content,
    lastExecution: Date.now(),
    executionCount: 0,
    intensity: intensity,
    viralCapabilities: ['rapid_spread', 'stealth_mode', 'cross_contamination'],
    position: {
      x: Math.random() * 800,
      y: Math.random() * 600
    },
    replicationRate: intensity
  };
  
  meshNodes.set(nodeId, viralNode);
  console.log(`[MESH WORKER] Created viral node: ${nodeId} with intensity ${intensity}`);
}

// Create viral replica with mutation
function createViralReplica(sourceNode) {
  const replicaId = `viral_replica_${sourceNode.id}_${Date.now()}`;
  
  const viralReplica = {
    ...sourceNode,
    id: replicaId,
    type: 'viral_replica',
    energy: Math.min(100, sourceNode.energy * 1.2), // Boost energy
    frequency: sourceNode.frequency * 1.1, // Increase frequency
    lastExecution: 0,
    executionCount: 0,
    replicatedFrom: sourceNode.id,
    viralMutation: Math.random().toString(36).substr(2, 6),
    enhancedCapabilities: ['cross_device_spread', 'permission_escalation']
  };
  
  meshNodes.set(replicaId, viralReplica);
  console.log(`[MESH WORKER] Created viral replica: ${replicaId} from ${sourceNode.id}`);
}

console.log('[MESH WORKER] Autonomous mesh protocol with viral capabilities initialized');
