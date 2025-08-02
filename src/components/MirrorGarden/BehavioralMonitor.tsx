import React, { useEffect, useRef, useCallback } from 'react';

export interface BehavioralSignals {
  mouseVelocity: number;
  cursorJitter: number;
  scrollMomentum: number;
  typingLatency: number;
  focusStability: number;
  timestamp: number;
}

export interface CognitiveState {
  focusLevel: number; // 0-1
  stressLevel: number; // 0-1
  engagementLevel: number; // 0-1
  confidenceScore: number; // 0-1
}

interface BehavioralMonitorProps {
  onSignalsUpdate: (signals: BehavioralSignals) => void;
  onStateInferred: (state: CognitiveState) => void;
  isActive: boolean;
}

export const BehavioralMonitor: React.FC<BehavioralMonitorProps> = ({
  onSignalsUpdate,
  onStateInferred,
  isActive
}) => {
  const mouseHistory = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const scrollHistory = useRef<Array<{ y: number; time: number }>>([]);
  const typingHistory = useRef<Array<{ time: number; key: string }>>([]);
  const focusHistory = useRef<Array<{ focused: boolean; time: number }>>([]);
  
  const calculateJitter = useCallback((positions: Array<{ x: number; y: number; time: number }>) => {
    if (positions.length < 3) return 0;
    
    let totalDeviation = 0;
    for (let i = 2; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const next = positions[i + 1] || curr;
      
      const expectedX = prev.x + (curr.x - prev.x) * ((next.time - prev.time) / (curr.time - prev.time));
      const expectedY = prev.y + (curr.y - prev.y) * ((next.time - prev.time) / (curr.time - prev.time));
      
      const deviation = Math.sqrt(Math.pow(curr.x - expectedX, 2) + Math.pow(curr.y - expectedY, 2));
      totalDeviation += deviation;
    }
    
    return totalDeviation / (positions.length - 2);
  }, []);

  const calculateVelocity = useCallback((positions: Array<{ x: number; y: number; time: number }>) => {
    if (positions.length < 2) return 0;
    
    const recent = positions.slice(-5);
    let totalDistance = 0;
    let totalTime = 0;
    
    for (let i = 1; i < recent.length; i++) {
      const distance = Math.sqrt(
        Math.pow(recent[i].x - recent[i-1].x, 2) + 
        Math.pow(recent[i].y - recent[i-1].y, 2)
      );
      totalDistance += distance;
      totalTime += recent[i].time - recent[i-1].time;
    }
    
    return totalTime > 0 ? totalDistance / totalTime : 0;
  }, []);

  const inferCognitiveState = useCallback((signals: BehavioralSignals): CognitiveState => {
    // Heuristic-based inference (not biometric classification)
    const normalizedJitter = Math.min(signals.cursorJitter / 50, 1);
    const normalizedVelocity = Math.min(signals.mouseVelocity / 1000, 1);
    const normalizedLatency = Math.min(signals.typingLatency / 500, 1);
    
    // Focus: stable movement, consistent typing
    const focusLevel = Math.max(0, 1 - (normalizedJitter * 0.6 + normalizedLatency * 0.4));
    
    // Stress: erratic movement, high jitter
    const stressLevel = Math.min(1, normalizedJitter * 0.7 + normalizedVelocity * 0.3);
    
    // Engagement: active scrolling, consistent interaction
    const engagementLevel = Math.min(1, (signals.scrollMomentum / 100) * 0.4 + signals.focusStability * 0.6);
    
    // Confidence in inference based on data quality
    const confidenceScore = Math.min(1, signals.focusStability * 0.5 + (1 - normalizedJitter) * 0.5);
    
    return {
      focusLevel: Math.round(focusLevel * 100) / 100,
      stressLevel: Math.round(stressLevel * 100) / 100,
      engagementLevel: Math.round(engagementLevel * 100) / 100,
      confidenceScore: Math.round(confidenceScore * 100) / 100
    };
  }, []);

  const updateSignals = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    const recentWindow = 2000; // 2 seconds

    // Filter recent data
    const recentMouse = mouseHistory.current.filter(p => now - p.time < recentWindow);
    const recentScroll = scrollHistory.current.filter(p => now - p.time < recentWindow);
    const recentTyping = typingHistory.current.filter(p => now - p.time < recentWindow);
    const recentFocus = focusHistory.current.filter(p => now - p.time < recentWindow);

    const signals: BehavioralSignals = {
      mouseVelocity: calculateVelocity(recentMouse),
      cursorJitter: calculateJitter(recentMouse),
      scrollMomentum: recentScroll.length > 1 ? 
        Math.abs(recentScroll[recentScroll.length - 1].y - recentScroll[0].y) / (recentWindow / 1000) : 0,
      typingLatency: recentTyping.length > 1 ?
        recentTyping.reduce((acc, curr, i) => i > 0 ? acc + (curr.time - recentTyping[i-1].time) : acc, 0) / (recentTyping.length - 1) : 0,
      focusStability: recentFocus.length > 0 ? 
        recentFocus.filter(f => f.focused).length / recentFocus.length : 1,
      timestamp: now
    };

    onSignalsUpdate(signals);
    
    const cognitiveState = inferCognitiveState(signals);
    onStateInferred(cognitiveState);
  }, [isActive, onSignalsUpdate, onStateInferred, calculateJitter, calculateVelocity, inferCognitiveState]);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseHistory.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
      if (mouseHistory.current.length > 100) {
        mouseHistory.current.shift();
      }
    };

    const handleScroll = () => {
      scrollHistory.current.push({ y: window.scrollY, time: Date.now() });
      if (scrollHistory.current.length > 50) {
        scrollHistory.current.shift();
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      typingHistory.current.push({ time: Date.now(), key: e.key });
      if (typingHistory.current.length > 50) {
        typingHistory.current.shift();
      }
    };

    const handleFocus = () => {
      focusHistory.current.push({ focused: true, time: Date.now() });
      if (focusHistory.current.length > 50) {
        focusHistory.current.shift();
      }
    };

    const handleBlur = () => {
      focusHistory.current.push({ focused: false, time: Date.now() });
      if (focusHistory.current.length > 50) {
        focusHistory.current.shift();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('keypress', handleKeyPress);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    const interval = setInterval(updateSignals, 1000);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearInterval(interval);
    };
  }, [isActive, updateSignals]);

  return null; // This is a headless component
};