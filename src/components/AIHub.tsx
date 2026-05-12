import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/Glass';
import { Camera, Mic, Send, Bot, User, Loader2, Globe, Sparkles, MicOff, X } from 'lucide-react';
import { identifyLandmark, getChatResponse } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export function AIHub() {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const history = newMessages.map(m => ({ 
        role: m.role === 'bot' ? 'model' : 'user', 
        parts: [{ text: m.text }] 
      }));
      const response = await getChatResponse(text, history);
      setMessages([...newMessages, { role: 'bot', text: response || "I couldn't understand that." }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'bot', text: "Forgive me, but my connection is momentarily interrupted. Please try again in a few seconds." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setIsTyping(true);
      setMessages(prev => [...prev, { role: 'user', text: "📸 [Identifying this landmark...]" }]);
      
      try {
        const result = await identifyLandmark(base64);
        setMessages(prev => [...prev, { role: 'bot', text: result || "I couldn't identify this specific location. Do you have another photo?" }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsTyping(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech Recognition not supported in this browser.");
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        handleSend(text);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-purple-200">
                <Bot size={32} />
            </div>
            <div>
                <h1 className="text-4xl font-black text-gray-800 tracking-tight leading-none">Travel Assistant</h1>
                <p className="text-purple-600 font-black text-[10px] uppercase tracking-[0.2em] mt-1">AI-Powered Concierge</p>
            </div>
        </div>
        <div className="flex -space-x-4">
            {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 shadow-sm overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=ai${i}`} alt="AI" className="w-full h-full object-cover" />
                </div>
            ))}
            <div className="w-10 h-10 rounded-full border-4 border-white bg-purple-100 flex items-center justify-center text-purple-600 text-[10px] font-black">
                +12
            </div>
        </div>
      </header>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-2xl border-white/40 bg-white/40 backdrop-blur-3xl rounded-[3rem]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center opacity-50 py-10"
                >
                <div className="bg-purple-100 p-8 rounded-[3rem] mb-6 shadow-inner animate-pulse">
                    <Sparkles size={64} className="text-purple-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">Your Digital Nomad Companion</h2>
                <p className="max-w-xs mx-auto mt-2 font-bold text-gray-500">I can plan itineraries, identify landmarks from photos, and guide your journey.</p>
                </motion.div>
            )}

            {messages.map((m, i) => (
                <motion.div
                key={i}
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                <div className={cn(
                    "max-w-[85%] p-8 rounded-[3rem] shadow-2xl relative group",
                    m.role === 'user' 
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-tr-none shadow-purple-100' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-purple-50 shadow-gray-100'
                )}>
                    {m.role === 'bot' && (
                        <div className="absolute -left-14 top-2 w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Bot size={20} />
                        </div>
                    )}
                    <div className="prose prose-sm prose-invert font-bold text-lg leading-relaxed">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                </div>
                </motion.div>
            ))}

            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white p-6 rounded-[2.5rem] rounded-tl-none border border-purple-50 shadow-xl flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-purple-400 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-purple-500 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-purple-600 rounded-full" />
                        </div>
                        <span className="text-xs font-black text-purple-600 uppercase tracking-[0.2em]">Consulting the oracle...</span>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 bg-white/60 border-t border-white/60 backdrop-blur-xl">
          <div className="flex items-center gap-4 bg-white p-3 rounded-[3rem] shadow-2xl border border-purple-50 relative group">
            <div className="flex gap-2 ml-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 bg-purple-50 text-purple-600 rounded-[2rem] hover:bg-purple-100 transition-all shadow-xl active:scale-95 group/btn relative"
                    title="Identity Landmark"
                >
                <Camera size={28} />
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Visual ID
                </span>
                </button>
                <button 
                    onClick={startListening}
                    className={cn(
                        "p-5 rounded-[2rem] transition-all shadow-xl active:scale-95",
                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-blue-100"
                    )}
                >
                {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />

            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Where should we go today?"
                className="flex-1 bg-transparent border-none px-6 focus:ring-0 font-black text-xl text-gray-800 placeholder-gray-300"
            />
            
            <button 
                onClick={() => handleSend()}
                className="p-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] shadow-2xl shadow-purple-200 hover:scale-[1.05] active:scale-95 transition-all outline-none"
            >
                <Send size={28} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
