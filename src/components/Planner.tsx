import { useState } from 'react';
import { Card } from './ui/Glass';
import { Plane, DollarSign, Calendar, Sparkles, Download, Loader2 } from 'lucide-react';
import { generateItinerary } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

export function Planner() {
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('3');
  const [pref, setPref] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);

  const preferencesOptions = ['Adventure', 'Nature', 'Local Cuisine', 'Museums', 'Nightlife', 'Relaxation'];

  const togglePref = (p: string) => {
    setPref(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleGenerate = async () => {
    if (!city || !budget) return;
    setLoading(true);
    setItinerary(null);
  try {
    const result = await generateItinerary(city, parseInt(budget), parseInt(days), pref);
    setItinerary(result);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (err) {
    console.error("Failed to generate itinerary:", err);
    alert("ExploraAI encountered an issue manifesting your itinerary. Please try again with slightly different preferences.");
  } finally {
    setLoading(false);
  }
  };

  const handleDownload = () => {
    if (!itinerary) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(itinerary.title, 20, 20);
    doc.setFontSize(14);
    let y = 40;
    itinerary.itinerary.forEach((day: any) => {
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${day.day}`, 20, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      day.activities.forEach((act: string) => {
        const lines = doc.splitTextToSize(`• ${act}`, 170);
        doc.text(lines, 25, y);
        y += (lines.length * 7);
        if (y > 270) { doc.addPage(); y = 20; }
      });
      y += 10;
    });
    doc.save(`${city}_itinerary.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Smart Trip Planner</h1>
        <p className="text-gray-600 mt-2">Let AI curate your perfect getaway based on your budget and preferences.</p>
      </header>

      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Plane size={16} className="text-purple-600" /> Destination City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kyoto, Japan"
                className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign size={16} className="text-teal-600" /> Budget ($)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" /> Duration (Days)
                </label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-white/50 border border-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">What are you into?</label>
            <div className="grid grid-cols-2 gap-3">
              {preferencesOptions.map(p => (
                <button
                  key={p}
                  onClick={() => togglePref(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    pref.includes(p) 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                      : 'bg-white/40 text-gray-600 border border-white/50 hover:bg-white/60'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !city || !budget}
          className="w-full mt-8 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-purple-200 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Manifesting your itinerary...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              Generate Magic Itinerary
            </>
          )}
        </button>
      </Card>

      <AnimatePresence>
        {itinerary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">{itinerary.title}</h2>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white/40 border border-white/50 px-4 py-2 rounded-xl text-purple-600 font-semibold hover:bg-white/60 transition-colors"
              >
                <Download size={20} />
                Export PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {itinerary.itinerary.map((day: any) => (
                <Card key={day.day} className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg text-sm">Day {day.day}</span>
                    {day.title || 'Exploration'}
                  </h3>
                  <ul className="space-y-4">
                    {day.activities.map((act: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-gray-700 text-sm">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                        {act}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
