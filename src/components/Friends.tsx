import { useState, useEffect } from 'react';
import { Card } from './ui/Glass';
import { Search, MapPin, Send, MessageCircle, UserPlus, Heart, Users, Check, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { db, auth } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDocs, orderBy } from 'firebase/firestore';

export function Friends() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch users (in a real app, this would be a search query or proximity search)
    const qUsers = query(collection(db, 'users'), where('uid', '!=', auth.currentUser.uid));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch my requests
    const qReq = query(collection(db, 'friendRequests'), 
      where('fromId', '==', auth.currentUser.uid));
    const qInbound = query(collection(db, 'friendRequests'), 
      where('toId', '==', auth.currentUser.uid));

    const unsub1 = onSnapshot(qReq, (snapshot) => {
        const out = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(prev => [...prev.filter(r => r.toId !== auth.currentUser?.uid), ...out]);
    });
    const unsub2 = onSnapshot(qInbound, (snapshot) => {
        const inb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(prev => [...prev.filter(r => r.fromId !== auth.currentUser?.uid), ...inb]);
    });

    setLoading(false);
    return () => {
        unsubscribeUsers();
        unsub1();
        unsub2();
    };
  }, []);

  const sendRequest = async (targetUser: any) => {
    if (!auth.currentUser) return;
    try {
        await addDoc(collection(db, 'friendRequests'), {
            fromId: auth.currentUser.uid,
            fromName: profile?.displayName || 'Traveler',
            toId: targetUser.uid,
            toName: targetUser.displayName,
            status: 'pending',
            createdAt: serverTimestamp()
        });
    } catch (err) {
        console.error(err);
    }
  };

  const respondRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
      try {
          await updateDoc(doc(db, 'friendRequests', requestId), { status });
      } catch (err) {
          console.error(err);
      }
  };

  const getRequestStatus = (userId: string) => {
      return requests.find(r => r.fromId === userId || r.toId === userId);
  };

  const isPlanningSameTrip = (user: any) => {
    if (!profile?.plannedTrips || !user.plannedTrips) return false;
    return user.plannedTrips.some((otherTrip: any) => 
        profile.plannedTrips?.some((myTrip: any) => 
            otherTrip.destination.toLowerCase() === myTrip.destination.toLowerCase() &&
            // Check if dates overlap (simplified check)
            otherTrip.startDate <= myTrip.endDate && myTrip.startDate <= otherTrip.endDate
        )
    );
  };

  const filteredUsers = allUsers.filter(u => {
      const matchSearch = u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
                          u.interests?.some((i: string) => i.toLowerCase().includes(search.toLowerCase())) ||
                          u.plannedTrips?.some((t: any) => t.destination.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
  });

  const recommendedUsers = filteredUsers.filter(u => {
      // Logic for same interests OR planning same trip
      const sameInterest = u.interests?.some((i: string) => profile?.interests?.includes(i));
      const sameTrip = isPlanningSameTrip(u);
      return sameInterest || sameTrip;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Make a Friend</h1>
          <p className="text-gray-500 mt-2 font-medium">Connect with explorers who share your vibe and future trip plans.</p>
        </div>
        <div className="bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" />
            <span className="text-sm font-bold text-purple-700">{recommendedUsers.length} matches based on your interests</span>
        </div>
      </header>

      <div className="relative group">
        <input 
            type="text" 
            placeholder="Search by interest, destination, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/40 border-2 border-white/60 backdrop-blur-md rounded-3xl px-14 py-5 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-2xl transition-all font-medium text-lg"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={24} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
            <div className="col-span-full py-20 flex justify-center">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        ) : filteredUsers.map((user) => {
          const request = getRequestStatus(user.uid);
          const isAccepted = request?.status === 'accepted';
          const isPending = request?.status === 'pending';
          const isFromMe = request?.fromId === auth.currentUser?.uid;

          return (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="p-0 overflow-hidden h-full flex flex-col border-white/50 bg-white/40 backdrop-blur-xl hover:shadow-2xl transition-all duration-500">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500" />
                
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-50 rounded-3xl flex items-center justify-center font-black text-3xl text-purple-600 shadow-inner relative group-hover:rotate-3 transition-transform">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                            user.displayName?.[0]
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                        </div>
                        <div>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{user.displayName}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold bg-white/50 px-3 py-1 rounded-full">
                                <MapPin size={12} className="text-red-400" />
                                {user.homeCity || 'Citizen of Earth'}
                            </div>
                            {isPlanningSameTrip(user) && (
                                <div className="flex items-center gap-1.5 text-blue-600 text-xs font-black bg-blue-50 px-3 py-1 rounded-full border border-blue-100 animate-pulse">
                                    <Sparkles size={12} />
                                    Same Trip
                                </div>
                            )}
                        </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {user.interests?.map((i: string) => (
                        <span key={i} className="text-[10px] bg-white border border-purple-100 text-purple-600 px-3 py-1.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                            {i}
                        </span>
                        ))}
                    </div>

                    <p className="text-gray-600 italic text-sm mb-8 flex-1 leading-relaxed">
                        "{user.bio || 'Ready for my next adventure!'}"
                    </p>

                    <div className="grid grid-cols-1 gap-4 mt-auto">
                        {isAccepted ? (
                            <button 
                                onClick={() => setActiveChat(user)}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-95 group"
                            >
                                <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
                                Start Chat
                            </button>
                        ) : isPending ? (
                            isFromMe ? (
                                <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-black cursor-not-allowed">
                                    Request Sent
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => respondRequest(request.id, 'accepted')}
                                        className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-600"
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => respondRequest(request.id, 'rejected')}
                                        className="w-16 bg-red-50 text-red-500 border border-red-100 rounded-2xl flex items-center justify-center"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )
                        ) : (
                            <button 
                                onClick={() => sendRequest(user)}
                                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-purple-100 text-purple-600 py-4 rounded-2xl font-black hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-lg transition-all active:scale-95"
                            >
                                <UserPlus size={20} />
                                Connect
                            </button>
                        )}
                    </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeChat && (
            <ChatModal user={activeChat} onClose={() => setActiveChat(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatModal({ user, onClose }: { user: any, onClose: () => void }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const chatId = [auth.currentUser?.uid, user.uid].sort().join('_');

    useEffect(() => {
        const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
        const unsub = onSnapshot(q, (sn) => {
            setMessages(sn.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, [chatId]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !auth.currentUser) return;
        
        try {
            // Ensure chat doc exists
            await updateDoc(doc(db, 'chats', chatId), {
                members: [auth.currentUser.uid, user.uid],
                lastActive: serverTimestamp()
            }).catch(() => {
                 // Create if it doesn't exist
                 return addDoc(collection(db, 'chats'), {
                     id: chatId,
                     members: [auth.currentUser.uid, user.uid],
                     lastActive: serverTimestamp()
                 });
            });

            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                chatId,
                senderId: auth.currentUser.uid,
                text,
                createdAt: serverTimestamp()
            });
            setText('');
        } catch (err) { console.error(err); }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg">
                <Card className="h-[600px] flex flex-col p-0 overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-600 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 p-0.5">
                                <img src={user.photoURL} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                                <p className="font-black">{user.displayName}</p>
                                <p className="text-[10px] opacity-70">Active Now</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((m) => {
                            const isMe = m.senderId === auth.currentUser?.uid;
                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-medium ${isMe ? 'bg-purple-600 text-white' : 'bg-white border border-gray-100 text-gray-800'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={send} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                        <input 
                            type="text" 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 font-medium"
                        />
                        <button type="submit" className="bg-purple-600 text-white p-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                            <Send size={20} />
                        </button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
