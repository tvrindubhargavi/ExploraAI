import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Glass';
import { Navigation2, Flag, Coins, MapPin, Loader2, Sparkles, Target, Zap, Trophy, ChevronRight } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, auth } from '../services/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export function LiveTracking() {
  return <LiveTrackingContent />;
}

function LiveTrackingContent() {
  const { profile } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState(0);
  const [lastPos, setLastPos] = useState<{lat: number, lng: number} | null>(null);
  const [duration, setDuration] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isDestinationReached, setIsDestinationReached] = useState(false);
  const [searchingDest, setSearchingDest] = useState(false);

  const placesLib = useMapsLibrary('places');
  const timerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTracking && destCoords && coords) {
        const distToDest = calculateDistance(coords, destCoords);
        if (distToDest < 0.1) { // Within 100 meters
            setIsDestinationReached(true);
            stopTrip();
        }
    }
  }, [coords, destCoords, isTracking]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const calculateDistance = (p1: any, p2: any) => {
    const R = 6371;
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTrip = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    if (!placesLib) return alert("Maps library still loading. Please wait.");

    setSearchingDest(true);
    const refinedQuery = destination;
    
    try {
        const { places } = await placesLib.Place.searchByText({
            textQuery: refinedQuery,
            fields: ['id', 'displayName', 'location'],
            maxResultCount: 1
        });

        if (places && places.length > 0) {
            const place = places[0];
            setDestCoords({
                lat: place.location?.lat() || 0,
                lng: place.location?.lng() || 0
            });
            setDestination(place.displayName || destination);
            
            // Continue with trip start logic
            setIsTracking(true);
            setDistance(0);
            setDuration(0);
            setCoinsEarned(0);
            setIsDestinationReached(false);
            setSearchingDest(false);

            watchIdRef.current = navigator.geolocation.watchPosition((pos) => {
              const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setCoords(newPos);
              
              if (lastPos) {
                const d = calculateDistance(lastPos, newPos);
                if (d > 0.005) { // 5 meters
                     setDistance(prev => prev + d);
                }
              }
              setLastPos(newPos);
            }, (err) => console.error(err), { enableHighAccuracy: true });

            timerRef.current = setInterval(() => {
              setDuration(prev => prev + 1);
            }, 1000);
        } else {
            alert("Could not find destination. Please be more specific.");
            setSearchingDest(false);
        }
    } catch (err) {
        console.error("Places API (New) Error:", err);
        alert("Search failed. Please check your connectivity and API permissions.");
        setSearchingDest(false);
    }
  };

  const stopTrip = async () => {
    setIsTracking(false);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    // More rewards for reaching destination
    const tripBonus = isDestinationReached ? 50 : 5;
    const earned = Math.floor(distance * 20) + tripBonus; 
    setCoinsEarned(earned);
    
    if (earned > 0 && auth.currentUser) {
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
                coins: increment(earned),
                'travelStats.distanceTraveled': increment(Math.round(distance))
            });
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.6 }
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
            <Zap size={14} fill="currentColor" />
            Live Quest
        </div>
        <h1 className="text-5xl font-black text-gray-800 tracking-tight">Active Expedition</h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto">Turn your walks into rewards. Reach destinations to unlock massive coin bonuses.</p>
      </header>

      <AnimatePresence mode="wait">
        {!isTracking && coinsEarned === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="p-12 space-y-8 bg-white/40 border-white/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-purple-200 mb-8 animate-bounce">
                            <Navigation2 size={48} className="rotate-45" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">Set Your Course</h2>
                        <p className="text-gray-500 font-bold max-w-md">Record your path, explore new areas, and collect ExploraCoins as you move.</p>
                    </div>

                    <div className="max-w-lg mx-auto space-y-6 relative z-10">
                        <div className="relative group">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-500 group-focus-within:text-purple-600 transition-colors" size={24} />
                            <input 
                                type="text" 
                                placeholder="Where are you heading?"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full bg-white/60 border-2 border-white/80 rounded-3xl pl-16 pr-8 py-6 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-100 font-black text-xl shadow-inner transition-all"
                            />
                        </div>
                        
                        <button 
                            onClick={startTrip}
                            disabled={!destination || searchingDest}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:scale-[1.02] active:scale-95 text-white font-black h-20 rounded-3xl shadow-2xl shadow-purple-100 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale text-xl"
                        >
                            {searchingDest ? (
                                <Loader2 className="animate-spin" size={28} />
                            ) : (
                                <>
                                    <Target size={28} />
                                    Launch Expedition
                                </>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/50 p-6 rounded-3xl text-center border border-white">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Standard Rate</p>
                            <p className="font-black text-gray-800">20 Coins / km</p>
                        </div>
                        <div className="bg-purple-600/5 p-6 rounded-3xl text-center border border-purple-100">
                            <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">Arrival Bonus</p>
                            <p className="font-black text-purple-600">+50 Coins</p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        ) : isTracking ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TrackingStat label="Active Time" value={formatTime(duration)} icon={<Loader2 className="animate-spin text-blue-500" size={24} />} />
                    <TrackingStat label="Tracked" value={`${distance.toFixed(2)} km`} icon={<Navigation2 className="text-purple-500" size={24} />} color="purple" />
                    <TrackingStat label="Earnings" value={Math.floor(distance * 20) + 5} icon={<Coins className="text-yellow-500" size={24} />} color="yellow" />
                </div>

                <Card className="p-0 overflow-hidden h-[400px] relative flex flex-col items-center justify-center bg-gray-50 border-white/60 shadow-2xl rounded-[3rem]">
                    <div className="absolute inset-0 bg-[url('https://www.google.com/maps/about/images/mymaps/mymaps-desktop-16x9.png')] bg-cover opacity-20 contrast-125" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-purple-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl animate-bounce border-8 border-white">
                            <MapPin size={40} />
                        </div>
                        <div className="mt-8 bg-white/80 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-xl border border-white text-center">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Current Coordinates</p>
                            <p className="font-black text-gray-800 text-lg">
                                {coords ? `${coords.lat.toFixed(6)}° N, ${coords.lng.toFixed(6)}° E` : "Calibrating Sensors..."}
                            </p>
                        </div>
                    </div>
                    
                    <div className="absolute top-6 left-6 right-6">
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white shadow-lg flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">En Route To</p>
                                    <p className="font-black text-gray-800">{destination}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Est. Trip</p>
                                <p className="font-black text-purple-600">Active Stage</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={stopTrip}
                        className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 font-black py-6 rounded-[2rem] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        <Flag size={24} className="group-hover:-rotate-12 transition-transform" />
                        Abort Journey
                    </button>
                    <button 
                        onClick={stopTrip}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Trophy size={24} />
                        I've Arrived!
                    </button>
                </div>
            </motion.div>
        ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <Card className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
                    
                    <div className="relative z-10 flex flex-col items-center space-y-8">
                        <div className="w-24 h-24 bg-white/30 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                            <Trophy size={56} className="text-white drop-shadow-lg" />
                        </div>
                        
                        <div className="space-y-2">
                             <h2 className="text-5xl font-black tracking-tight">{isDestinationReached ? "Quest Complete!" : "Trip Summary"}</h2>
                             <p className="text-yellow-50 text-xl font-bold opacity-90">
                                {isDestinationReached ? `You reached ${destination} successfully!` : "You've gained valuable explorer distance."}
                             </p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl">
                             <div className="flex-1 bg-white/20 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/30 shadow-inner flex flex-col items-center">
                                 <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-4">Total Loot</p>
                                 <div className="flex items-center gap-4">
                                     <Coins size={48} className="text-yellow-200" />
                                     <span className="text-7xl font-black">{isSaving ? "..." : coinsEarned}</span>
                                 </div>
                             </div>
                             <div className="flex-1 space-y-4">
                                <div className="bg-white/10 p-5 rounded-[2rem] flex items-center justify-between border border-white/10">
                                    <span className="font-bold opacity-70">Distance</span>
                                    <span className="font-black text-xl">{distance.toFixed(2)} km</span>
                                </div>
                                <div className="bg-white/10 p-5 rounded-[2rem] flex items-center justify-between border border-white/10">
                                    <span className="font-bold opacity-70">Bonus</span>
                                    <span className="font-black text-xl">+{isDestinationReached ? 50 : 5}</span>
                                </div>
                             </div>
                        </div>

                        <button 
                            onClick={() => { setCoinsEarned(0); setDistance(0); }}
                            className="bg-white text-orange-600 font-black px-12 py-5 rounded-3xl hover:bg-yellow-50 transition-all shadow-2xl shadow-orange-900/20 flex items-center gap-3 text-xl active:scale-95"
                        >
                            Back To Quests
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrackingStat({ label, value, icon, color = 'blue' }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) {
    const colors: any = {
        blue: 'from-blue-50 to-indigo-50 border-blue-100 text-blue-600',
        purple: 'from-purple-50 to-indigo-50 border-purple-100 text-purple-600',
        yellow: 'from-yellow-50 to-orange-50 border-yellow-100 text-yellow-600'
    };

    return (
        <Card className={`flex flex-col items-center justify-center p-8 bg-gradient-to-br ${colors[color]} shadow-xl border shadow-blue-900/5 transition-transform hover:scale-105 duration-300`}>
            <div className="mb-3 bg-white/80 p-3 rounded-2xl shadow-sm">{icon}</div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
            <p className="text-3xl font-black text-gray-800 mt-2">{value}</p>
        </Card>
    );
}
