import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/Glass';
import { Languages, Send, Loader2, Globe, Mic, MicOff } from 'lucide-react';
import { translateText } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

const languages = [
    'Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Kannada', 
    'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Spanish', 
    'French', 'German', 'Italian', 'Japanese', 'Korean', 
    'Mandarin', 'Arabic', 'Russian', 'Portuguese', 'Turkish'
];

export function Translate() {
  const [input, setInput] = useState('');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleTranslate = async (textToTranslate: string = input) => {
    if (!textToTranslate.trim()) return;
    
    setInput('');
    setIsTyping(true);
    
    setMessages(prev => [...prev, { role: 'user', text: `Translate: "${textToTranslate}"` }]);

    try {
      const result = await translateText(textToTranslate, targetLang);
      setMessages(prev => [...prev, { role: 'bot', text: result || "Translation failed." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: "Error: Could not reach translation service." }]);
    } finally {
      setIsTyping(false);
    }
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
        handleTranslate(text);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-5xl font-black text-gray-800 tracking-tight">Speak Global</h1>
            <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-widest font-black opacity-60">Real-time Polyglot Engine</p>
        </div>
        <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-white shadow-xl shadow-blue-900/5">
            <span className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Target Language</span>
            <select 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-blue-600 border-none rounded-xl px-4 py-2 text-sm font-black text-white focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer shadow-lg shadow-blue-200 transition-all"
            >
              {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
        </div>
      </header>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-2xl border-white/50 bg-white/40 backdrop-blur-3xl rounded-[3rem]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-20"
                >
                <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner animate-pulse">
                    <Globe size={48} className="text-blue-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">Break the barriers.</h3>
                <p className="max-w-xs mt-3 text-gray-500 font-medium">Capture voice or type a message. ExplorAI handles the rest instantly.</p>
                </motion.div>
            )}

            {messages.map((m, i) => (
                <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                <div className={`max-w-[85%] p-6 rounded-[2.5rem] shadow-2xl ${
                    m.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-100' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-blue-50 shadow-gray-100'
                }`}>
                    <div className="prose prose-sm prose-invert font-bold text-lg leading-relaxed">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                </div>
                </motion.div>
            ))}

            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white p-6 rounded-[2.5rem] rounded-tl-none border border-blue-50 shadow-xl flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-blue-600 rounded-full" />
                        </div>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Translating...</span>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 bg-white/60 border-t border-white/60 backdrop-blur-xl">
          <div className="flex gap-4 p-3 bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 relative group">
            <button 
                onClick={startListening}
                className={cn(
                    "p-5 rounded-3xl transition-all shadow-xl active:scale-95",
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-blue-100"
                )}
            >
                {isListening ? <MicOff size={28} /> : <Mic size={28} />}
            </button>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTranslate();
                    }
                }}
                placeholder={`Tell me something to translate to ${targetLang}...`}
                className="flex-1 border-none rounded-3xl px-6 py-4 focus:ring-0 min-h-[72px] resize-none font-black text-xl text-gray-800 placeholder-gray-300"
            />
            <button 
                onClick={() => handleTranslate()}
                className="self-end p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl shadow-blue-200 hover:scale-[1.05] active:scale-95 transition-all outline-none"
            >
                <Send size={28} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
