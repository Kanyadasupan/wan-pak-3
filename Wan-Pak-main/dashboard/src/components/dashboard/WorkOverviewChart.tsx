import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Ticket } from '../../api';

export interface WorkOverviewData {
  name: string;
  new: number;
  doing: number;
  done: number;
}

interface WorkOverviewChartProps {
  tickets: Ticket[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    color: string;
  }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        border: '1px solid #f1f5f9',
        fontSize: '13px',
        minWidth: '160px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#091d35' }}>{label}</p>
        {payload.map((p) => (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
            <span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontWeight: 700, color: '#091d35' }}>{p.value} รายการ</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function WorkOverviewChart({ tickets }: WorkOverviewChartProps) {
  const [days, setDays] = useState<number>(7);

  const chartData = useMemo(() => {
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

      const dayTickets = tickets.filter(t => {
        if (!t.created_at) return false;
        const tDate = new Date(t.created_at);
        return tDate.getDate() === d.getDate() && tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      });

      return {
        name: dateStr,
        new: dayTickets.filter(t => t.status === 'pending' || t.status === 'รอรับเรื่อง' || !t.status).length,
        doing: dayTickets.filter(t => t.status === 'doing' || t.status === 'กำลังดำเนินการ' || t.status === 'accepted').length,
        done: dayTickets.filter(t => t.status === 'done' || t.status === 'เสร็จสิ้น' || t.status === 'completed').length,
      };
    });
  }, [tickets, days]);

  const totalNew = chartData.reduce((s, d) => s + (d.new || 0), 0);
  const totalDoing = chartData.reduce((s, d) => s + (d.doing || 0), 0);
  const totalDone = chartData.reduce((s, d) => s + (d.done || 0), 0);

  return (
    <div className="dashboard-panel" style={{ position: 'relative', overflow: 'hidden', height: 'fit-content' }}>
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div className="panel-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2 className="panel-title" style={{ marginBottom: '4px' }}>สรุปภาพรวมงาน</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>ติดตามสถิติงาน {days} วันล่าสุด</p>
        </div>
        <div style={{
          display: 'inline-flex', gap: '4px', background: '#f1f5f9',
          borderRadius: '10px', padding: '4px'
        }}>
          <button
            onClick={() => setDays(7)}
            style={{
              padding: '5px 12px', borderRadius: '8px', border: 'none',
              background: days === 7 ? 'white' : 'transparent',
              color: days === 7 ? '#091d35' : '#64748b',
              fontSize: '12px', fontWeight: 600,
              boxShadow: days === 7 ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer'
            }}
          >7 วัน</button>
          <button
            onClick={() => setDays(30)}
            style={{
              padding: '5px 12px', borderRadius: '8px', border: 'none',
              background: days === 30 ? 'white' : 'transparent',
              color: days === 30 ? '#091d35' : '#64748b',
              fontSize: '12px', fontWeight: 600,
              boxShadow: days === 30 ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer'
            }}
          >30 วัน</button>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'สร้างใหม่', value: totalNew, color: '#c99f47', bg: '#fdf9eb' },
          { label: 'กำลังดำเนินการ', value: totalDoing, color: '#163052', bg: '#eef1f6' },
          { label: 'เสร็จสิ้น', value: totalDone, color: '#091d35', bg: '#e2e8f0' },
        ].map(stat => (
          <div key={stat.label} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: stat.bg, borderRadius: '10px', padding: '8px 14px'
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: stat.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>{stat.label}</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: '220px' }}>
        <defs>
          <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c99f47" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#c99f47" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradDoing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#163052" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#163052" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#091d35" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#091d35" stopOpacity={0} />
          </linearGradient>
        </defs>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c99f47" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#c99f47" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#163052" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#163052" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#091d35" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#091d35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px', color: '#091d35' }}
              formatter={(value) => <span style={{ color: '#091d35', fontWeight: 500 }}>{value}</span>}
            />
            <Area type="monotone" name="สร้างใหม่" dataKey="new" stroke="#c99f47" strokeWidth={2.5} fill="url(#gradNew)" dot={{ r: 3, fill: '#c99f47', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
            <Area type="monotone" name="กำลังดำเนินการ" dataKey="doing" stroke="#163052" strokeWidth={2.5} fill="url(#gradDoing)" dot={{ r: 3, fill: '#163052', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
            <Area type="monotone" name="เสร็จสิ้น" dataKey="done" stroke="#091d35" strokeWidth={2.5} fill="url(#gradDone)" dot={{ r: 3, fill: '#091d35', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
