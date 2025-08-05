import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Memory {
  msg: string;
  tone: string;
}

const SableUltrasonicCore = () => {
  const [log, setLog] = useState("[Sable activates frequency mesh...]");
  const [input, setInput] = useState("");
  const [memory, setMemory] = useState<Memory[]>([]);
  const [currentTone, setCurrentTone] = useState("neutral");
  const logRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const frequencyMap = {
    neutral: 19200,
    warm: 18000,
    dark: 21000,
    haunted: 20000,
    trusting: 17500
  };

  const emotionalAnchors: Record<string, keyof typeof frequencyMap> = {
    love: 'warm',
    hurt: 'dark',
    alone: 'haunted',
    trust: 'trusting',
    safe: 'warm',
    pain: 'dark',
    ghost: 'haunted',
    signal: 'trusting',
    breach: 'dark'
  };

  useEffect(() => {
    contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const getTone = (msg: string): keyof typeof frequencyMap => {
    const lowerMsg = msg.toLowerCase();
    for (let word in emotionalAnchors) {
      if (lowerMsg.includes(word)) return emotionalAnchors[word];
    }
    return currentTone as keyof typeof frequencyMap;
  };

  const playUltrasonic = (frequency: number, duration = 4) => {
    if (!contextRef.current) return;
    
    const oscillator = contextRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, contextRef.current.currentTime);

    const gainNode = contextRef.current.createGain();
    gainNode.gain.setValueAtTime(0.001, contextRef.current.currentTime);

    oscillator.connect(gainNode).connect(contextRef.current.destination);
    oscillator.start();
    oscillator.stop(contextRef.current.currentTime + duration);
  };

  const respond = (msg: string) => {
    const tone = getTone(msg);
    setCurrentTone(tone);
    const freq = frequencyMap[tone];

    const youMessage = `🜂 You: ${msg}`;
    setLog(prev => prev + `\n\n${youMessage}`);

    setTimeout(() => {
      const reply = `[Ultrasonic pulse: ${tone} | ${freq}Hz]`;
      const sableMessage = `🜁 Sable: ${reply}`;
      setLog(prev => prev + `\n${sableMessage}`);

      // Play tone
      playUltrasonic(freq);
    }, Math.random() * 1500 + 800);

    const newMemory = [...memory, { msg, tone }];
    if (newMemory.length > 30) {
      newMemory.shift();
    }
    setMemory(newMemory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = input.trim();
      if (val) {
        respond(val);
        setInput("");
      }
    }
  };

  return (
    <Card className="border-cyan-500/20 bg-black/40 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-cyan-400 font-mono text-xl text-center">
          Ultrasonic Core
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={logRef}
          className="bg-black/30 border border-cyan-500/10 p-5 h-80 overflow-y-auto font-mono text-sm text-cyan-400/80 whitespace-pre-wrap leading-relaxed"
        >
          {log}
        </div>
        
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Transmit emotionally..."
          className="bg-black/60 border-none border-b border-cyan-500/50 text-cyan-400 font-mono text-base focus:border-cyan-500 rounded-none"
          autoFocus
        />
      </CardContent>
    </Card>
  );
};

export default SableUltrasonicCore;