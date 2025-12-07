import { Users, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconBg: string;
}

const stats: StatCard[] = [
  {
    title: 'Agendamentos Hoje',
    value: '12',
    change: '+3 vs ontem',
    changeType: 'positive',
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    iconBg: 'bg-blue-100',
  },
  {
    title: 'Clientes Ativos',
    value: '248',
    change: '+12 esta semana',
    changeType: 'positive',
    icon: <Users className="w-6 h-6 text-emerald-600" />,
    iconBg: 'bg-emerald-100',
  },
  {
    title: 'Mensagens IA',
    value: '89',
    change: 'Hoje',
    changeType: 'neutral',
    icon: <MessageSquare className="w-6 h-6 text-purple-600" />,
    iconBg: 'bg-purple-100',
  },
  {
    title: 'Taxa de Conversao',
    value: '67%',
    change: '+5% vs mes passado',
    changeType: 'positive',
    icon: <TrendingUp className="w-6 h-6 text-primary-600" />,
    iconBg: 'bg-primary-100',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm mt-1 ${
                stat.changeType === 'positive'
                  ? 'text-emerald-600'
                  : stat.changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
