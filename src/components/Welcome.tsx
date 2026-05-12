import { motion } from 'motion/react';
import { GlassContainer, Card } from './ui/Glass';
import { Globe, LogIn } from 'lucide-react';

export function Welcome({ onLogin }: { onLogin: () => void }) {
  return (
    <GlassContainer className="flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-purple-300 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-blue-300 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl px-4"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white/30 backdrop-blur-xl rounded-2xl shadow-xl">
            <Globe size={48} className="text-purple-600" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
          ExploraAI
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 font-medium mb-8">
          Your intelligent travel partner — plan, explore, and relive your journeys.
        </p>

        <Card className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome Traveler</h2>
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-purple-200"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
          
          <p className="mt-6 text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </Card>
      </motion.div>
    </GlassContainer>
  );
}
