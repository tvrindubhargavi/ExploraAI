/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Sidebar, NavTab } from './components/Sidebar';
import { Welcome } from './components/Welcome';
import { Dashboard } from './components/Dashboard';
import { Explorer } from './components/Explorer';
import { Planner } from './components/Planner';
import { Community } from './components/Community';
import { AIHub } from './components/AIHub';
import { ProfilePage } from './components/ProfilePage';
import { Translate } from './components/Translate';
import { Friends } from './components/Friends';
import { LiveTracking } from './components/LiveTracking';
import { Vouchers } from './components/Vouchers';
import { GlassContainer } from './components/ui/Glass';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Globe } from 'lucide-react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function MainApp() {
  const { user, profile, loading, login } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  if (loading) {
    return (
      <GlassContainer className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </GlassContainer>
    );
  }

  if (!user) {
    return <Welcome onLogin={login} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'explore': return <Explorer />;
      case 'tracker': return <LiveTracking />;
      case 'planner': return <Planner />;
      case 'assistant': return <AIHub />;
      case 'translate': return <Translate />;
      case 'experiences': return <Community />;
      case 'friends': return <Friends />;
      case 'profile': return <ProfilePage />;
      case 'vouchers': return <Vouchers />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 ml-[88px] lg:ml-32 p-4 md:p-8 lg:p-12 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center h-screen font-sans bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center max-w-lg p-8 bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white">
          <div className="w-20 h-20 bg-purple-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-purple-200">
            <Globe size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4">Google Maps API Key Required</h2>
          <p className="text-gray-600 font-medium mb-8">To unlock the full potential of ExploraAI, please configure your Google Maps Platform API key.</p>
          
          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">1</div>
              <p className="text-sm text-gray-600 pt-1 font-medium">
                Get an API Key from the <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener" className="text-purple-600 font-bold underline">Google Cloud Console</a>.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">2</div>
              <p className="text-sm text-gray-600 pt-1 font-medium">
                Enable the <strong>Places API</strong> and <strong>Maps JavaScript API</strong>.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">3</div>
              <div>
                <p className="text-sm text-gray-600 pt-1 font-medium mb-2">Add your key as a secret in AI Studio:</p>
                <ul className="text-xs text-gray-500 space-y-1 font-bold">
                  <li>â€¢ Open <strong>Settings</strong> (âš™ï¸ gear icon)</li>
                  <li>â€¢ Select <strong>Secrets</strong></li>
                  <li>â€¢ Name: <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
                </ul>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-purple-400 font-black uppercase tracking-widest animate-pulse">The app will rebuild automatically</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <APIProvider apiKey={API_KEY} version="weekly" libraries={['places']}>
        <MainApp />
      </APIProvider>
    </AuthProvider>
  );
}

