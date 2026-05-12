import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Glass';
import { Heart, MessageCircle, Share2, Plus, Send, Image as ImageIcon, MapPin, X, Loader2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { db, auth } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { cn } from '../lib/utils';

export function Community() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [content, setContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
        console.error("Firestore Listen Error:", error);
        setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: auth.currentUser.uid,
        userName: profile?.displayName || 'Anonymous',
        userPhoto: profile?.photoURL || '',
        content,
        locationName,
        imageUrl: imageBase64 || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800',
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setContent('');
      setLocationName('');
      setImageBase64('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
                <Sparkles size={14} fill="currentColor" />
                Shared Stories
            </div>
            <h1 className="text-6xl font-black text-gray-800 tracking-tight">Travel Experiences</h1>
            <p className="text-gray-500 font-medium max-w-lg">Revisit the world through the eyes of the ExploraAI community.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl shadow-purple-200 transition-all hover:scale-105 active:scale-95 outline-none font-black text-xl"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500" />
          Share Your Memory
        </button>
      </header>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 opacity-40">
           <Loader2 size={64} className="animate-spin text-purple-600 mb-6" />
           <p className="text-2xl font-black uppercase tracking-[0.3em] text-gray-400">Syncing Memories...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
           <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center shadow-inner">
                <ImageIcon size={64} className="text-gray-200" />
           </div>
           <div>
            <p className="text-2xl font-black text-gray-800">The world is silent.</p>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mt-1">Be the first to break it with your story.</p>
           </div>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 pb-12">
          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid">
                <FeedPost post={post} />
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 40 }}
               className="relative w-full max-w-2xl"
            >
                <Card className="p-10 shadow-2xl border-white/60 bg-white/95 rounded-[3.5rem] overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Capture Moment</h2>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Share the magic of your discovery</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                            <X size={28} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleShare} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">The Experience</label>
                             <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What happened out there? Tell us the story behind the photo..."
                                className="w-full bg-gray-50 border-2 border-transparent rounded-[2.5rem] p-8 min-h-[160px] focus:outline-none focus:border-purple-300 focus:bg-white transition-all font-bold text-lg shadow-inner"
                                required
                             />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Location</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
                                    <input 
                                        type="text"
                                        value={locationName}
                                        onChange={(e) => setLocationName(e.target.value)}
                                        placeholder="Paris, France"
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-3xl pl-14 pr-6 py-5 focus:outline-none focus:border-purple-300 focus:bg-white transition-all font-bold shadow-inner"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Visual Memory</label>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-3 py-5 rounded-3xl border-2 border-dashed transition-all font-black text-sm",
                                        imageBase64 
                                            ? "bg-green-50 border-green-200 text-green-600" 
                                            : "bg-gray-50 border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-600 shadow-inner"
                                    )}
                                >
                                    {imageBase64 ? (
                                        <>
                                            <Check size={20} />
                                            Photo Loaded
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={20} />
                                            Upload From System
                                        </>
                                    )}
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black h-20 rounded-[2.5rem] shadow-2xl shadow-purple-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-xl"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={28} />
                            ) : (
                                <>
                                    <Sparkles size={28} />
                                    Post to Community
                                </>
                            )}
                        </button>
                    </form>
                </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeedPost({ post }: { post: any }) {
  const isLiked = post.likedBy?.includes(auth.currentUser?.uid);

  const toggleLike = async () => {
    if (!auth.currentUser) return;
    const postRef = doc(db, 'posts', post.id);
    try {
        if (isLiked) {
            await updateDoc(postRef, {
                likes: post.likes - 1,
                likedBy: arrayRemove(auth.currentUser.uid)
            });
        } else {
            await updateDoc(postRef, {
                likes: post.likes + 1,
                likedBy: arrayUnion(auth.currentUser.uid)
            });
        }
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <Card className="p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
            src={post.imageUrl} 
            alt={post.locationName} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
          <MapPin size={12} />
          {post.locationName}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 p-0.5 border border-white/50">
             {post.userPhoto ? (
                 <img src={post.userPhoto} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
             ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold text-purple-600 uppercase">{post.userName[0]}</div>
             )}
          </div>
          <span className="font-black text-gray-800 text-sm">{post.userName}</span>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{post.content}"</p>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <button 
            onClick={toggleLike}
            className={`flex items-center gap-2 font-bold text-xs transition-all ${isLiked ? 'text-pink-600 scale-110' : 'text-gray-400 hover:text-pink-400'}`}
          >
            <Heart size={18} className={isLiked ? 'fill-pink-600' : ''} />
            {post.likes}
          </button>
          <div className="flex gap-4">
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <MessageCircle size={18} />
            </button>
            <button className="text-gray-400 hover:text-purple-500 transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
