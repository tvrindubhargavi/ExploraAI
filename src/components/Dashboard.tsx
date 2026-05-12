import { motion } from 'motion/react';
import { Card } from './ui/Glass';
import { MapPin, Navigation, TrendingUp, Gift, Coins } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Welcome back, {profile?.displayName?.split(' ')[0]}!</h1>
        <p className="text-gray-600 mt-2">Where would you like to explore next?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={<Coins className="text-yellow-600" />} 
          label="ExploraCoins" 
          value={profile?.coins || 0} 
          color="bg-yellow-100"
        />
        <StatsCard 
          icon={<MapPin className="text-purple-600" />} 
          label="Places Visited" 
          value={profile?.travelStats?.placesVisited || 0} 
          color="bg-purple-100"
        />
        <StatsCard 
          icon={<Navigation className="text-blue-600" />} 
          label="Total Distance" 
          value={`${profile?.travelStats?.distanceTraveled || 0} km`} 
          color="bg-blue-100"
        />
        <StatsCard 
          icon={<TrendingUp className="text-orange-600" />} 
          label="XP Level" 
          value="Explorer II" 
          color="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            Your Recent Journeys
          </h2>
          <div className="space-y-4">
            <TripItem title="Summer in Kyoto" location="Japan" date="May 2026" status="Completed" />
            <TripItem title="Desert Escape" location="Dubai" date="Feb 2026" status="Completed" />
            <TripItem title="Swiss Alps" location="Switzerland" date="Dec 2025" status="Completed" />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Gift size={20} className="text-teal-600" />
            Travel Vouchers
          </h2>
          <div className="space-y-4">
            <VoucherItem partner="Expedia" discount="15%" />
            <VoucherItem partner="MakeMyTrip" discount="₹500 Off" />
            <VoucherItem partner="Uber" discount="20% Off" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <Card className="flex items-center gap-4 border-none shadow-md">
      <div className={`${color} p-3 rounded-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </Card>
  );
}

function TripItem({ title, location, date, status }: { title: string, location: string, date: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl border border-white/30">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center font-bold text-purple-600">
          {location[0]}
        </div>
        <div>
          <p className="font-bold text-gray-800">{title}</p>
          <p className="text-sm text-gray-500">{location} • {date}</p>
        </div>
      </div>
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        {status}
      </span>
    </div>
  );
}

function VoucherItem({ partner, discount }: { partner: string, discount: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl border border-white/30">
      <div>
        <p className="font-bold text-gray-800">{partner}</p>
        <p className="text-sm text-teal-600">{discount}</p>
      </div>
      <button className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg">Claim</button>
    </div>
  );
}
