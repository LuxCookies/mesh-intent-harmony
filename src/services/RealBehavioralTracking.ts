interface UserInteraction {
  type: 'click' | 'scroll' | 'hover' | 'keypress' | 'focus' | 'blur';
  element: string;
  timestamp: number;
  coordinates?: { x: number; y: number };
  value?: string;
}

interface BehavioralPattern {
  sessionId: string;
  interactions: UserInteraction[];
  timeSpent: number;
  scrollDepth: number;
  clickHeatmap: { x: number; y: number; intensity: number }[];
  attentionSpan: number;
  engagementScore: number;
}

interface RealTimeMetrics {
  activeTime: number;
  idleTime: number;
  mouseMovements: number;
  keypresses: number;
  scrollEvents: number;
  focusChanges: number;
}

export class RealBehavioralTracking {
  private static interactions: UserInteraction[] = [];
  private static patterns: Map<string, BehavioralPattern> = new Map();
  private static currentSession: string = '';
  private static startTime: number = 0;
  private static metrics: RealTimeMetrics = {
    activeTime: 0,
    idleTime: 0,
    mouseMovements: 0,
    keypresses: 0,
    scrollEvents: 0,
    focusChanges: 0
  };
  private static lastActivity: number = 0;
  private static isTracking = false;

  static startTracking(): void {
    if (this.isTracking) return;

    this.currentSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.startTime = Date.now();
    this.lastActivity = Date.now();
    this.isTracking = true;

    this.setupEventListeners();
    this.startActivityMonitoring();

    console.log('[TRACKING] Real behavioral tracking started for session:', this.currentSession);
  }

  private static setupEventListeners(): void {
    // Mouse tracking
    document.addEventListener('mousemove', (event) => {
      this.recordInteraction({
        type: 'hover',
        element: this.getElementPath(event.target as Element),
        timestamp: Date.now(),
        coordinates: { x: event.clientX, y: event.clientY }
      });
      this.metrics.mouseMovements++;
      this.lastActivity = Date.now();
    });

    // Click tracking
    document.addEventListener('click', (event) => {
      this.recordInteraction({
        type: 'click',
        element: this.getElementPath(event.target as Element),
        timestamp: Date.now(),
        coordinates: { x: event.clientX, y: event.clientY }
      });
      this.lastActivity = Date.now();
    });

    // Scroll tracking
    document.addEventListener('scroll', (event) => {
      this.recordInteraction({
        type: 'scroll',
        element: 'window',
        timestamp: Date.now(),
        value: window.scrollY.toString()
      });
      this.metrics.scrollEvents++;
      this.lastActivity = Date.now();
    });

    // Keyboard tracking
    document.addEventListener('keypress', (event) => {
      this.recordInteraction({
        type: 'keypress',
        element: this.getElementPath(event.target as Element),
        timestamp: Date.now(),
        value: event.key.length === 1 ? event.key : '[SPECIAL]'
      });
      this.metrics.keypresses++;
      this.lastActivity = Date.now();
    });

    // Focus tracking
    document.addEventListener('focusin', (event) => {
      this.recordInteraction({
        type: 'focus',
        element: this.getElementPath(event.target as Element),
        timestamp: Date.now()
      });
      this.metrics.focusChanges++;
      this.lastActivity = Date.now();
    });

    document.addEventListener('focusout', (event) => {
      this.recordInteraction({
        type: 'blur',
        element: this.getElementPath(event.target as Element),
        timestamp: Date.now()
      });
      this.lastActivity = Date.now();
    });
  }

  private static startActivityMonitoring(): void {
    setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - this.lastActivity;

      if (timeSinceLastActivity > 5000) { // 5 seconds of inactivity
        this.metrics.idleTime += 1000; // Add 1 second to idle time
      } else {
        this.metrics.activeTime += 1000; // Add 1 second to active time
      }
    }, 1000);
  }

  private static recordInteraction(interaction: UserInteraction): void {
    this.interactions.push(interaction);
    
    // Keep only last 1000 interactions to prevent memory issues
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000);
    }
  }

  private static getElementPath(element: Element | null): string {
    if (!element) return 'unknown';
    
    const parts = [];
    while (element && element !== document.body) {
      let selector = element.tagName.toLowerCase();
      
      if (element.id) {
        selector += `#${element.id}`;
      }
      
      if (element.className && typeof element.className === 'string') {
        selector += `.${element.className.split(' ').join('.')}`;
      }
      
      parts.unshift(selector);
      element = element.parentElement;
    }
    
    return parts.join(' > ');
  }

  static analyzeCurrentSession(): BehavioralPattern {
    const sessionInteractions = this.interactions.filter(
      i => i.timestamp >= this.startTime
    );

    const clickHeatmap = this.generateHeatmap(sessionInteractions);
    const scrollDepth = this.calculateScrollDepth(sessionInteractions);
    const attentionSpan = this.calculateAttentionSpan(sessionInteractions);
    const engagementScore = this.calculateEngagementScore();

    const pattern: BehavioralPattern = {
      sessionId: this.currentSession,
      interactions: sessionInteractions,
      timeSpent: Date.now() - this.startTime,
      scrollDepth,
      clickHeatmap,
      attentionSpan,
      engagementScore
    };

    this.patterns.set(this.currentSession, pattern);
    return pattern;
  }

  private static generateHeatmap(interactions: UserInteraction[]): { x: number; y: number; intensity: number }[] {
    const heatmap: Map<string, number> = new Map();
    
    interactions.forEach(interaction => {
      if (interaction.coordinates) {
        const key = `${Math.floor(interaction.coordinates.x / 50)}_${Math.floor(interaction.coordinates.y / 50)}`;
        heatmap.set(key, (heatmap.get(key) || 0) + 1);
      }
    });

    return Array.from(heatmap.entries()).map(([key, count]) => {
      const [x, y] = key.split('_').map(Number);
      return {
        x: x * 50,
        y: y * 50,
        intensity: Math.min(1, count / 10)
      };
    });
  }

  private static calculateScrollDepth(interactions: UserInteraction[]): number {
    const scrollEvents = interactions.filter(i => i.type === 'scroll');
    if (scrollEvents.length === 0) return 0;

    const maxScroll = Math.max(...scrollEvents.map(e => parseInt(e.value || '0')));
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    return documentHeight > 0 ? Math.min(1, maxScroll / documentHeight) : 0;
  }

  private static calculateAttentionSpan(interactions: UserInteraction[]): number {
    if (interactions.length < 2) return 0;

    const timeSpans = [];
    for (let i = 1; i < interactions.length; i++) {
      const span = interactions[i].timestamp - interactions[i - 1].timestamp;
      if (span < 10000) { // Less than 10 seconds between interactions
        timeSpans.push(span);
      }
    }

    return timeSpans.length > 0 ? 
      timeSpans.reduce((sum, span) => sum + span, 0) / timeSpans.length : 0;
  }

  private static calculateEngagementScore(): number {
    const totalTime = this.metrics.activeTime + this.metrics.idleTime;
    if (totalTime === 0) return 0;

    const activityRatio = this.metrics.activeTime / totalTime;
    const interactionDensity = this.interactions.length / (totalTime / 1000);
    const diversityScore = new Set(this.interactions.map(i => i.type)).size / 6; // 6 possible types

    return (activityRatio * 0.4) + (Math.min(1, interactionDensity / 2) * 0.4) + (diversityScore * 0.2);
  }

  static getRealTimeMetrics(): RealTimeMetrics & {
    engagementScore: number;
    interactionCount: number;
    sessionDuration: number;
  } {
    return {
      ...this.metrics,
      engagementScore: this.calculateEngagementScore(),
      interactionCount: this.interactions.length,
      sessionDuration: this.isTracking ? Date.now() - this.startTime : 0
    };
  }

  static getSessionHistory(): BehavioralPattern[] {
    return Array.from(this.patterns.values());
  }

  static predictNextAction(): { action: string; probability: number; confidence: number } {
    if (this.interactions.length < 5) {
      return { action: 'unknown', probability: 0, confidence: 0 };
    }

    // Analyze recent interaction patterns
    const recent = this.interactions.slice(-10);
    const patterns = new Map<string, number>();

    recent.forEach(interaction => {
      patterns.set(interaction.type, (patterns.get(interaction.type) || 0) + 1);
    });

    const mostCommon = Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const probability = mostCommon[1] / recent.length;
    const confidence = Math.min(1, recent.length / 10);

    return {
      action: mostCommon[0],
      probability,
      confidence
    };
  }

  static stopTracking(): void {
    this.isTracking = false;
    const finalPattern = this.analyzeCurrentSession();
    
    console.log('[TRACKING] Session ended:', {
      sessionId: this.currentSession,
      duration: finalPattern.timeSpent,
      interactions: finalPattern.interactions.length,
      engagement: finalPattern.engagementScore
    });
  }
}
