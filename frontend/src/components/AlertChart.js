import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './AlertChart.css';

function AlertChart({ alerts }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 30 }, (_, i) => {
      const minuteStart = new Date(now.getTime() - (30 - i) * 60 * 1000);
      const minuteEnd = new Date(now.getTime() - (29 - i) * 60 * 1000);
      
      const count = alerts.filter(a => {
        try {
          const alertTime = new Date(a.timestamp);
          return alertTime >= minuteStart && alertTime < minuteEnd;
        } catch {
          return false;
        }
      }).length;
      
      return {
        time: minuteStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        alerts: count
      };
    });

    return buckets;
  }, [alerts]);

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey="alerts"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAlerts)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AlertChart;

