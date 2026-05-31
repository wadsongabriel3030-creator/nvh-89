import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { attendanceData } from '@/lib/mock-data';

export function AttendanceChart() {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Asistencia Mensual</h3>
          <p className="text-sm text-muted-foreground">Cultos, Oración y PLCs</p>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={attendanceData}>
            <defs>
              <linearGradient id="colorCulto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(234, 89%, 58%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(234, 89%, 58%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOracao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPLC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(220, 9%, 46%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(220, 9%, 46%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="culto"
              name="Cultos"
              stroke="hsl(234, 89%, 58%)"
              fillOpacity={1}
              fill="url(#colorCulto)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="oracao"
              name="Oración"
              stroke="hsl(38, 92%, 50%)"
              fillOpacity={1}
              fill="url(#colorOracao)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="plc"
              name="PLCs"
              stroke="hsl(142, 76%, 36%)"
              fillOpacity={1}
              fill="url(#colorPLC)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}