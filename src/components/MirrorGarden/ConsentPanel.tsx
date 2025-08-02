import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, Shield, Zap, Volume2, Lightbulb, Smartphone, Monitor, Info } from 'lucide-react';

export interface ConsentSettings {
  behavioralMonitoring: boolean;
  cognitiveInference: boolean;
  deviceControl: boolean;
  dataRetention: boolean;
  audioActions: boolean;
  lightActions: boolean;
  displayActions: boolean;
  vibrationActions: boolean;
}

interface ConsentPanelProps {
  settings: ConsentSettings;
  onSettingsChange: (settings: ConsentSettings) => void;
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
  className?: string;
}

export const ConsentPanel: React.FC<ConsentPanelProps> = ({
  settings,
  onSettingsChange,
  isActive,
  onActiveChange,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const updateSetting = (key: keyof ConsentSettings, value: boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const resetToDefaults = () => {
    onSettingsChange({
      behavioralMonitoring: false,
      cognitiveInference: false,
      deviceControl: false,
      dataRetention: false,
      audioActions: false,
      lightActions: false,
      displayActions: false,
      vibrationActions: false
    });
    onActiveChange(false);
  };

  const enableResearchMode = () => {
    onSettingsChange({
      behavioralMonitoring: true,
      cognitiveInference: true,
      deviceControl: true,
      dataRetention: false, // Always false for privacy
      audioActions: true,
      lightActions: true,
      displayActions: true,
      vibrationActions: true
    });
  };

  const permissionCount = Object.values(settings).filter(Boolean).length;

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Mirror Garden
          </CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-muted-foreground">
            Ambient Support System
          </span>
          <Switch
            checked={isActive}
            onCheckedChange={onActiveChange}
            disabled={permissionCount === 0}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This system monitors your interaction patterns to provide ambient environmental support. 
            All processing is local to your device.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Behavioral Monitoring</span>
            </div>
            <Switch
              checked={settings.behavioralMonitoring}
              onCheckedChange={(checked) => updateSetting('behavioralMonitoring', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Cognitive State Inference</span>
            </div>
            <Switch
              checked={settings.cognitiveInference}
              onCheckedChange={(checked) => updateSetting('cognitiveInference', checked)}
              disabled={!settings.behavioralMonitoring}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Device Control</span>
            </div>
            <Switch
              checked={settings.deviceControl}
              onCheckedChange={(checked) => updateSetting('deviceControl', checked)}
              disabled={!settings.cognitiveInference}
            />
          </div>

          {settings.deviceControl && (
            <>
              <Separator />
              <div className="text-xs font-medium text-muted-foreground">Ambient Actions</div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3 w-3" />
                  <span className="text-xs">Audio</span>
                  <Switch
                    checked={settings.audioActions}
                    onCheckedChange={(checked) => updateSetting('audioActions', checked)}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3 w-3" />
                  <span className="text-xs">Lighting</span>
                  <Switch
                    checked={settings.lightActions}
                    onCheckedChange={(checked) => updateSetting('lightActions', checked)}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Monitor className="h-3 w-3" />
                  <span className="text-xs">Display</span>
                  <Switch
                    checked={settings.displayActions}
                    onCheckedChange={(checked) => updateSetting('displayActions', checked)}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Smartphone className="h-3 w-3" />
                  <span className="text-xs">Haptic</span>
                  <Switch
                    checked={settings.vibrationActions}
                    onCheckedChange={(checked) => updateSetting('vibrationActions', checked)}
                    className="scale-75"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults} className="flex-1">
            Reset All
          </Button>
          <Button variant="outline" size="sm" onClick={enableResearchMode} className="flex-1">
            Research Mode
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-xs"
        >
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </Button>

        {showDetails && (
          <div className="text-xs text-muted-foreground space-y-2 p-3 rounded bg-muted/50">
            <div><strong>Data Processing:</strong> All analysis occurs locally in your browser</div>
            <div><strong>Privacy:</strong> No personal data leaves your device</div>
            <div><strong>Reversibility:</strong> All ambient actions are temporary and reversible</div>
            <div><strong>Transparency:</strong> All system actions are logged and visible</div>
            <div><strong>Control:</strong> You can stop all activity instantly</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};