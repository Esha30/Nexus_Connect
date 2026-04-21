import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TransactionStats {
  date: string;
  inflow: number;
  outflow: number;
}

interface TransactionChartProps {
 data: TransactionStats[];
}

export const TransactionChart: React.FC<TransactionChartProps> = ({ data }) => {
 return (
 <div className="h-[300px] w-full mt-6">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={data}>
 <defs>
 <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
 <XAxis 
 dataKey="date" 
 axisLine={false} 
 tickLine={false} 
 tick={{ fill: '#9CA3AF', fontSize: 12 }} 
 />
 <YAxis 
 axisLine={false} 
 tickLine={false} 
 tick={{ fill: '#9CA3AF', fontSize: 12 }} 
 tickFormatter={(value: number) => `$${value}`}
 />
 <Tooltip 
 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
 />
 <Area 
 type="monotone" 
 dataKey="inflow" 
 stroke="#10B981" 
 strokeWidth={3}
 fillOpacity={1} 
 fill="url(#colorInflow)" 
 />
 <Area 
 type="monotone" 
 dataKey="outflow" 
 stroke="#3B82F6" 
 strokeWidth={3}
 fillOpacity={1} 
 fill="url(#colorOutflow)" 
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 );
};
