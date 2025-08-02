import { MirrorGardenWidget } from '@/components/MirrorGarden/MirrorGardenWidget';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Mirror Garden Support Framework
          </h1>
          <div className="prose prose-lg mx-auto text-center text-muted-foreground">
            <p>
              A consensual ambient computing system that monitors interaction patterns 
              and provides supportive environmental feedback through connected devices.
            </p>
            <p>
              All processing occurs locally on your device with full transparency and user control.
            </p>
          </div>
        </div>
      </div>
      
      <MirrorGardenWidget />
      <Toaster />
    </div>
  );
};

export default Index;
