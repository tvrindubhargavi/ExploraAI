import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { Card } from './ui/Glass';
import { Search, MapPin, Navigation, Info, Clock, History, Sparkles, Loader2, Star, Heart, X, Map as MapIcon, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPlaceDetails } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import { auth, db } from '../services/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { cn } from '../lib/utils';

export function Explorer() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [location, setLocation] = useState({ lat: 37.42, lng: -122.08 });
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedQuery(query);
    }, 800);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedPlace) {
        setPlaceDetails(null);
        return;
      }
      setLoadingDetails(true);
      try {
        const details = await getPlaceDetails(selectedPlace.displayName || selectedPlace.name);
        setPlaceDetails(details);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [selectedPlace]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const handleAddToWishlist = async () => {
    if (!auth.currentUser || !selectedPlace) return;
    try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            wishlist: arrayUnion(selectedPlace.displayName || selectedPlace.name)
        });
        alert('Added to your wishlist!');
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-10rem)] flex flex-col">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-gray-800 tracking-tight">Discovery Map</h1>
          <p className="text-gray-500 font-medium">Uncover heritage, hidden gems, and local secrets.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-96 relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search city or attraction..."
                    className="w-full bg-white/60 border-2 border-white/80 rounded-[2rem] px-14 py-5 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-2xl transition-all font-bold text-lg"
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-400" size={24} />
                {query && (
                    <button onClick={() => setQuery('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                        <X size={20} />
                    </button>
                )}
            </div>
            <button className="bg-purple-600 text-white p-5 rounded-[2rem] shadow-2xl hover:bg-purple-700 transition-all active:scale-95 shadow-purple-200">
                <Navigation size={28} />
            </button>
        </div>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        <Card className="flex-1 p-0 relative rounded-[3rem] overflow-hidden shadow-2xl border-white/60">
            <Map
              defaultCenter={location}
              center={location}
              defaultZoom={13}
              mapId="EXPLORAAI_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              onCameraChanged={() => {}}
            >
              <AdvancedMarker position={location}>
                <div className="w-12 h-12 bg-purple-600 rounded-[1.5rem] border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
                  <div className="w-4 h-4 bg-white rounded-full shadow-inner" />
                </div>
              </AdvancedMarker>
              
              <PlaceMarkers 
                query={debouncedQuery} 
                onPlacesLoaded={setPlaces} 
                onPlaceSelect={setSelectedPlace} 
                selectedPlace={selectedPlace} 
              />
            </Map>
          
          <AnimatePresence>
            {selectedPlace && (
              <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="absolute inset-x-8 bottom-8 z-10 max-h-[85%] overflow-y-auto custom-scrollbar"
              >
                <Card className="bg-white/95 backdrop-blur-3xl shadow-2xl p-0 overflow-hidden border-purple-100 rounded-[3rem]">
                  <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="font-black text-3xl text-gray-800 tracking-tight">{selectedPlace.displayName}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <MapPin size={16} className="text-purple-400" />
                                {selectedPlace.formattedAddress}
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedPlace(null)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    {loadingDetails ? (
                        <div className="flex flex-col items-center justify-center py-16 text-purple-600 gap-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-[2rem] flex items-center justify-center animate-pulse">
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                            <span className="font-black text-xl uppercase tracking-widest">Uncovering history...</span>
                        </div>
                    ) : placeDetails ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-[2.5rem] space-y-3 border border-purple-100 shadow-inner">
                                    <h4 className="font-black text-purple-800 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                                        <Clock size={16} />
                                        Timings
                                    </h4>
                                    <p className="text-lg text-purple-600 font-black">{placeDetails.timings}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-[2.5rem] space-y-3 border border-blue-100 shadow-inner">
                                    <h4 className="font-black text-blue-800 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                                        <Sparkles size={16} />
                                        Best Time
                                    </h4>
                                    <p className="text-lg text-blue-600 font-black">{placeDetails.bestTimeToVisit}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-black text-gray-800 flex items-center gap-2 text-xs uppercase tracking-[0.2em] mb-4">
                                    <History size={18} className="text-purple-600" />
                                    Legacy & History
                                </h4>
                                <div className="text-base text-gray-600 leading-relaxed bg-white/50 p-8 rounded-[3rem] border border-gray-100 shadow-inner">
                                    <ReactMarkdown>{placeDetails.history}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="bg-yellow-50/50 p-6 rounded-3xl border border-yellow-100 flex items-start gap-4">
                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl">
                                    <Star size={20} fill="currentColor" />
                                </div>
                                <p className="text-sm text-yellow-900 font-bold leading-snug">
                                    <span className="font-black mr-2 opacity-60 uppercase text-[10px] tracking-widest">Expert Tip:</span>
                                    {placeDetails.tips}
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-4">
                                <button 
                                    onClick={handleAddToWishlist}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    <Heart size={24} />
                                    Add to Wishlist
                                </button>
                                <button 
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.location.lat},${selectedPlace.location.lng}`)}
                                    className="flex-1 bg-white border-2 border-gray-100 text-gray-800 font-black py-6 rounded-[2rem] shadow-xl hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    <Navigation size={24} className="text-purple-600" />
                                    Get Directions
                                </button>
                            </div>
                        </div>
                    ) : null}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="w-96 space-y-4 overflow-y-auto pr-4 hidden lg:block custom-scrollbar">
          {places.map((place) => (
            <motion.div
                key={place.id}
                layout
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                    setSelectedPlace(place);
                    setLocation(place.location);
                }}
            >
                <Card className={cn(
                    "p-6 cursor-pointer border-transparent transition-all duration-300 rounded-[2rem]",
                    selectedPlace?.id === place.id 
                        ? "bg-white shadow-2xl border-purple-200 ring-2 ring-purple-100" 
                        : "bg-white/40 border-white/60 hover:bg-white/60"
                )}>
                  <div className="flex items-start gap-4">
                      <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                          selectedPlace?.id === place.id ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-400"
                      )}>
                          <MapIcon size={24} />
                      </div>
                      <div className="min-w-0">
                          <h3 className="font-black text-gray-800 line-clamp-1 text-lg">{place.displayName}</h3>
                          <p className="text-xs font-bold text-gray-400 mt-1 line-clamp-2 leading-tight">{place.formattedAddress}</p>
                      </div>
                  </div>
                </Card>
            </motion.div>
          ))}
          {places.length === 0 && query && (
              <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                    <Search size={40} className="text-gray-300 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-black text-gray-800">Scouring the world...</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Looking for hidden gems</p>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlaceMarkers({ query, onPlacesLoaded, onPlaceSelect, selectedPlace }: { 
    query: string, 
    onPlacesLoaded: (p: any[]) => void, 
    onPlaceSelect: (p: any) => void,
    selectedPlace: any
}) {
  const [places, setPlaces] = useState<any[]>([]);
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !query) return;

    const refinedQuery = query.length < 20 ? `${query} tourist attractions` : query;

    placesLib.Place.searchByText({
      textQuery: refinedQuery,
      fields: ['id', 'displayName', 'formattedAddress', 'location', 'types'],
      locationBias: map?.getCenter(),
      maxResultCount: 20
    }).then(({ places: results }) => {
      if (results && results.length > 0) {
        const formattedPlaces = results.map(p => ({
          id: p.id,
          displayName: p.displayName,
          formattedAddress: p.formattedAddress,
          location: {
            lat: p.location?.lat(),
            lng: p.location?.lng()
          },
          types: p.types
        }));
        setPlaces(formattedPlaces);
        onPlacesLoaded(formattedPlaces);
      }
    }).catch(err => {
      console.error("Places API (New) Error:", err);
    });
  }, [placesLib, map, query]);

  return (
    <>
      {places.map((p) => (
        <AdvancedMarker 
            key={p.id} 
            position={p.location} 
            onClick={() => onPlaceSelect(p)}
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <Pin background="#9333ea" borderColor="#fff" glyphColor="#fff" scale={selectedPlace?.id === p.id ? 1.5 : 1.2} />
          </motion.div>
        </AdvancedMarker>
      ))}
    </>
  );
}
