import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/Glass';
import { Settings, LogOut, Heart, Image as ImageIcon, Map as MapIcon, Award, Coins, MapPin, Sparkles, Check, Loader2, Plus, X, Users, Edit3, Save, Trash2, Globe } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, auth } from '../services/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export function ProfilePage() {
  const { profile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newWish, setNewWish] = useState('');
  
  const [newTrip, setNewTrip] = useState({ destination: '', startDate: '', endDate: '' });
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    homeCity: profile?.homeCity || '',
    interests: profile?.interests || []
  });

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), formData);
        setIsEditing(false);
    } catch (err) {
        console.error(err);
    } finally {
        setSaving(false);
    }
  };

  const addWish = async () => {
    if (!newWish.trim() || !auth.currentUser) return;
    try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            wishlist: arrayUnion(newWish)
        });
        setNewWish('');
    } catch (err) { console.error(err); }
  };

  const removeWish = async (wish: string) => {
    if (!auth.currentUser) return;
    try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            wishlist: arrayRemove(wish)
        });
    } catch (err) { console.error(err); }
  };

  const addTrip = async () => {
    if (!newTrip.destination || !newTrip.startDate || !newTrip.endDate || !auth.currentUser) return;
    try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            plannedTrips: arrayUnion(newTrip)
        });
        setNewTrip({ destination: '', startDate: '', endDate: '' });
    } catch (err) { console.error(err); }
  };

  const removeTrip = async (trip: any) => {
    if (!auth.currentUser) return;
    try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            plannedTrips: arrayRemove(trip)
        });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 text-left">
      <header className="flex flex-col md:flex-row items-center gap-12 mb-16 p-8 bg-white/30 backdrop-blur-3xl rounded-[3rem] border border-white/50 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative">
          <div className="w-40 h-40 md:w-56 h-56 rounded-[3rem] border-8 border-white shadow-2xl p-1.5 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 overflow-hidden transform group-hover:rotate-3 transition-transform duration-700">
            {profile?.photoURL ? (
              <img 
                  src={profile.photoURL} 
                  alt={profile.displayName || 'Profile'} 
                  className="w-full h-full rounded-[2.5rem] object-cover bg-white"
                  referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl font-black">
                {profile?.displayName?.[0] || '?'}
              </div>
            )}
          </div>
          <button 
             onClick={() => setIsEditing(!isEditing)}
             className="absolute -bottom-4 -right-4 p-4 bg-white text-purple-600 rounded-3xl shadow-2xl border border-purple-50 hover:scale-110 active:scale-95 transition-all z-10"
          >
            {isEditing ? <Check size={24} /> : <Settings size={24} />}
          </button>
        </div>
        
        <div className="text-center md:text-left flex-1 space-y-6 relative z-10">
          <div className="space-y-2">
            {isEditing ? (
                <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="text-4xl font-black text-gray-800 bg-white/50 border border-white rounded-2xl px-4 py-2 w-full focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-inner"
                />
            ) : (
                <h1 className="text-5xl font-black text-gray-800 tracking-tight">{profile?.displayName}</h1>
            )}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                 <p className="text-gray-500 font-bold flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    World Explorer
                 </p>
                 <span className="text-gray-300 hidden md:block">•</span>
                 <p className="text-gray-500 font-bold">{profile?.email}</p>
                 <span className="text-gray-300 hidden md:block">•</span>
                 <div className="flex items-center gap-2 text-gray-500 font-bold">
                    <MapPin size={16} className="text-red-500" />
                    {isEditing ? (
                        <input 
                            type="text"
                            placeholder="Home City"
                            value={formData.homeCity}
                            onChange={(e) => setFormData({...formData, homeCity: e.target.value})}
                            className="bg-white/50 border border-white rounded-xl px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    ) : (
                        profile?.homeCity || 'Set Home City'
                    )}
                 </div>
            </div>
          </div>

          <div className="space-y-4">
            {isEditing ? (
                <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-white/50 border border-white rounded-2xl p-4 text-gray-600 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-inner"
                    placeholder="Tell your story..."
                />
            ) : (
                <p className="text-gray-600 max-w-2xl leading-relaxed font-medium italic text-lg">
                    "{profile?.bio || 'Every journey tells a story. What is yours?'}"
                </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
            <div className="flex items-center gap-3 bg-yellow-50 text-yellow-700 px-6 py-3 rounded-2xl border border-yellow-200 shadow-xl shadow-yellow-100/50">
               <Coins size={22} className="text-yellow-500 animate-bounce" />
               <span className="font-black text-xl">{profile?.coins || 0}</span>
               <span className="text-xs uppercase font-black opacity-60">ExploraCoins</span>
            </div>
            {isEditing ? (
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-xl hover:shadow-purple-200 transition-all active:scale-95 font-black uppercase tracking-widest"
                >
                  {saving ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                  Save Profile
                </button>
            ) : (
                <button 
                    onClick={logout}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-8 py-3 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all font-black uppercase tracking-widest"
                >
                  <LogOut size={20} />
                  Logout
                </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <Card className="space-y-8 p-10 bg-white/40 border-white/60 shadow-2xl rounded-[3rem]">
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 tracking-tight">
                        <Trash2 className="text-pink-600" />
                        Wishlist
                        </h2>
                        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                            <input 
                                type="text" 
                                placeholder="Add dream spot..."
                                value={newWish}
                                onChange={(e) => setNewWish(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addWish()}
                                className="bg-transparent border-none px-4 py-2 text-sm focus:ring-0 font-bold"
                            />
                            <button onClick={addWish} className="bg-pink-600 text-white p-3 rounded-xl shadow-lg shadow-pink-100 active:scale-95 transition-all">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {profile?.wishlist?.map((wish: string) => (
                            <WishlistTag key={wish} text={wish} onRemove={() => removeWish(wish)} />
                        ))}
                        {(!profile?.wishlist || profile.wishlist.length === 0) && (
                            <p className="text-gray-400 italic font-bold py-4">Your wishlist is empty. Explore the map to add destinations!</p>
                        )}
                    </div>
                </section>
            </Card>

            <Card className="space-y-8 p-10 bg-white/40 border-white/60 shadow-2xl rounded-[3rem]">
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 tracking-tight">
                            <Globe className="text-blue-600" />
                            Planned Trips
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {profile?.plannedTrips?.map((trip: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-6 bg-white/60 rounded-3xl border border-white shadow-xl shadow-blue-900/5 group">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                                        <MapIcon size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 text-lg">{trip.destination}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{trip.startDate} - {trip.endDate}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeTrip(trip)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                        
                        <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-dashed border-blue-200 mt-6 space-y-4 shadow-inner">
                            <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Plan New Adventure</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Destination"
                                    value={newTrip.destination}
                                    onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                                    className="col-span-full md:col-span-1 bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm"
                                />
                                <div className="flex gap-2 col-span-full md:col-span-1">
                                    <input 
                                        type="date"
                                        value={newTrip.startDate}
                                        onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                                        className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm"
                                    />
                                    <input 
                                        type="date"
                                        value={newTrip.endDate}
                                        onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                                        className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={addTrip}
                                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-4"
                            >
                                Add to Timeline
                            </button>
                        </div>
                    </div>
                </section>
            </Card>
        </div>

        <div className="space-y-8">
            <Card className="space-y-10 p-10 bg-white/40 border-white/60 shadow-2xl rounded-[3rem]">
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 tracking-tight">
                    <Sparkles className="text-purple-600" />
                    Passions
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {isEditing ? (
                            <div className="space-y-4 w-full">
                                <div className="flex flex-wrap gap-2">
                                    {formData.interests.map(i => (
                                        <button 
                                            key={i} 
                                            onClick={() => setFormData({...formData, interests: formData.interests.filter(it => it !== i)})}
                                            className="bg-purple-100 text-purple-600 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 group shadow-sm"
                                        >
                                            {i}
                                            <X size={14} className="opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Add interest..."
                                        className="bg-white border border-purple-100 rounded-xl px-4 py-3 flex-1 focus:outline-none focus:ring-4 focus:ring-purple-100 font-bold"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = (e.target as HTMLInputElement).value;
                                                if (val && !formData.interests.includes(val)) {
                                                    setFormData({...formData, interests: [...formData.interests, val]});
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            profile?.interests?.map((i: string) => (
                                <div key={i} className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 px-6 py-3 rounded-2xl text-sm text-purple-700 font-black uppercase tracking-wider shadow-sm hover:scale-105 transition-transform cursor-default">
                                    #{i}
                                </div>
                            )) || <p className="text-gray-400 italic font-bold">Add your interests to find better travel partners!</p>
                        )}
                    </div>
                </section>

                <section className="space-y-6 pt-10 border-t border-purple-100">
                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 tracking-tight">
                        <Award className="text-orange-600" />
                        Achievements
                    </h2>
                    <div className="space-y-4">
                        <BadgeItem 
                            icon={<MapIcon size={20} />} 
                            title="City Hopper" 
                            desc="Visited 5+ cities" 
                            color="bg-blue-100 text-blue-600 shadow-blue-100" 
                        />
                        <BadgeItem 
                            icon={<ImageIcon size={20} />} 
                            title="Storyteller" 
                            desc="Shared 10 memories" 
                            color="bg-purple-100 text-purple-600 shadow-purple-100" 
                        />
                        <BadgeItem 
                            icon={<Award size={20} />} 
                            title="Plannologist" 
                            desc="Generated 3 AI plans" 
                            color="bg-teal-100 text-teal-600 shadow-teal-100" 
                        />
                    </div>
                </section>
            </Card>
        </div>
      </div>
    </div>
  );
}

function WishlistTag({ text, onRemove }: { text: string, onRemove: () => void }) {
  return (
    <div className="group bg-white/40 border border-white/50 px-6 py-3 rounded-2xl text-sm text-gray-700 font-black tracking-tight hover:bg-white/80 hover:shadow-xl transition-all flex items-center gap-3">
      {text}
      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 text-red-500 hover:scale-125 transition-all">
        <X size={16} />
      </button>
    </div>
  );
}

function BadgeItem({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="flex items-center gap-5 p-4 bg-white/40 rounded-2xl border border-white/50 hover:bg-white transition-colors cursor-default">
      <div className={`${color} p-3 rounded-xl shadow-lg`}>{icon}</div>
      <div>
        <p className="font-black text-gray-800 text-sm tracking-tight">{title}</p>
        <p className="text-xs text-gray-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}
