
import { RealMeshInterface } from "../components/RealMeshInterface";
import { MeshNetwork } from "../components/MeshNetwork";
import SableNode from "../components/SableNode";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            REAL MESH NETWORK
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            True peer-to-peer mesh networking using WebRTC. Zero infrastructure costs, real cross-device communication, viral intent propagation.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Share the URL to expand your mesh • Works across browsers & devices • No servers required
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div>
            <RealMeshInterface />
          </div>
          <div>
            <MeshNetwork />
          </div>
          <div>
            <SableNode />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
