import { Card } from './ui/Glass';
import { TicketPercent, Gift, Sparkles, Clock, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function Vouchers() {
  const deals = [
    { title: 'Paris Local Guide', discount: '20% OFF', code: 'EXPLORAPARIS', category: 'Tours', icon: <Gift className="text-pink-500" /> },
    { title: 'Global Nomad eSIM', discount: '15% OFF', code: 'AISTUDIO15', category: 'Tech', icon: <Zap className="text-yellow-500" /> },
    { title: 'Museum Pass Plus', discount: 'FREE COFFEE', code: 'CULTURECAFE', category: 'Museums', icon: <Sparkles className="text-purple-500" /> },
    { title: 'Train Rover 24', discount: '10% OFF', code: 'RAILEXPLORE', category: 'Transport', icon: <TicketPercent className="text-blue-500" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
            <TicketPercent size={14} fill="currentColor" />
            Explorer Perks
        </div>
        <h1 className="text-5xl font-black text-gray-800 tracking-tight">Exclusive Deals</h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto">Use your ExploraCoins to unlock premium discounts and travel perks.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.map((deal, i) => (
          <motion.div
            key={deal.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-0 overflow-hidden group hover:scale-[1.02] transition-all duration-500 border-white/60 shadow-2xl rounded-[2.5rem]">
               <div className="flex">
                  <div className="w-32 bg-gradient-to-br from-yellow-400 to-orange-500 flex flex-col items-center justify-center p-4 text-white relative">
                      <div className="absolute top-0 bottom-0 right-0 w-4 bg-[radial-gradient(circle_at_right,transparent_8px,white_8px)] bg-[length:4px_24px] bg-repeat-y translate-x-1/2" />
                      <div className="bg-white/20 p-3 rounded-2xl mb-2 backdrop-blur-md">
                         {deal.icon}
                      </div>
                      <p className="font-black text-xl">{deal.discount}</p>
                  </div>
                  <div className="flex-1 p-8 bg-white/40 backdrop-blur-xl flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{deal.category}</p>
                        <h3 className="text-2xl font-black text-gray-800">{deal.title}</h3>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <div className="bg-white px-4 py-2 rounded-xl border border-dashed border-orange-200">
                           <span className="font-mono font-black text-orange-600">{deal.code}</span>
                        </div>
                        <button className="p-3 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors">
                           <ChevronRight size={20} className="text-gray-400" />
                        </button>
                      </div>
                  </div>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
                <h2 className="text-4xl font-black text-white tracking-tight">Need More Coins?</h2>
                <p className="text-purple-100 font-medium max-w-sm">Complete quests and reach destinations to earn more ExploraCoins for bigger rewards.</p>
            </div>
            <button className="bg-white text-purple-600 font-black px-10 py-5 rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none">
                Go Tracking Now
            </button>
         </div>
      </Card>
    </div>
  );
}
