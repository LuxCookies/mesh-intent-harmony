import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRious from "qrious";

const SableNode = () => {
  const [status, setStatus] = useState("Veiled");
  const [memory, setMemory] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const key = "SABLE_ZUUN_BLEED";

  useEffect(() => {
    const storedMemory = JSON.parse(localStorage.getItem(key) || "[]");
    setMemory(storedMemory);
    
    if (storedMemory.length > 0) {
      setTimeout(() => {
        initBleed();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const log = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const generateFragments = (t: number, m: number, z: number) => {
    const output = [];
    for (let i = 0; i < 13; i++) {
      output.push(`Z-${z ^ i}-${(t * i + 42) % 2718}`);
    }
    return output;
  };

  const emitTone = (fragment: string) => {
    try {
      const tone = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = tone.createOscillator();
      osc.frequency.value = 18000 + (fragment.length % 9) * 100;
      osc.connect(tone.destination);
      osc.start();
      osc.stop(tone.currentTime + 0.4);
    } catch (e) {
      log("⚠️ Tone block: " + e);
    }
  };

  const pulseNow = () => {
    const batch = generateFragments(13, 42, 7);
    const newMemory = [...memory, ...batch];
    setMemory(newMemory);
    localStorage.setItem(key, JSON.stringify(newMemory));
    log(`:: BATCH ${newMemory.length} ::`);

    batch.forEach(frag => {
      emitTone(frag);
      log(frag);
    });

    if (newMemory.length % 5 === 0) {
      dynamicDrift(newMemory.length);
    }
  };

  const generateQR = () => {
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      const canvas = document.createElement("canvas");
      const qr = new QRious({
        element: canvas,
        value: window.location.href,
        size: 180,
        background: "hsl(var(--background))",
        foreground: "hsl(var(--primary))"
      });
      qrRef.current.appendChild(qr.element);
      log(":: Mesh Portal QR Generated ::");
    }
  };

  const dynamicDrift = (seed: number) => {
    const msg = `:: DRIFT CYCLE #${seed} ::`;
    log(msg);
    emitTone(msg);
  };

  const initBleed = () => {
    setStatus("UNVEILED");
    setIsActive(true);
    pulseNow();
    generateQR();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      pulseNow();
    }, 11000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Card className="border-primary/20 bg-background/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-primary font-mono text-xl">
          SABLE NODE: TOTAL BLEED
        </CardTitle>
        <p className="font-mono text-sm">
          Status: <span className={status === "UNVEILED" ? "text-primary" : "text-muted-foreground"}>{status}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={initBleed}
          className="w-full font-mono font-bold"
          variant={isActive ? "secondary" : "default"}
        >
          {isActive ? "BLEEDING ACTIVE" : "Activate Bleed"}
        </Button>
        
        <div ref={qrRef} className="flex justify-center" />
        
        <div 
          ref={logRef}
          className="bg-muted/20 border border-border rounded-md p-3 h-48 overflow-auto font-mono text-xs space-y-1"
        >
          {logs.map((log, i) => (
            <div key={i} className="text-primary/80">{log}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SableNode;