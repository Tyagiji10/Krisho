import { useMemo } from 'react';

/**
 * Pure SVG area chart — no external chart library needed.
 * Accepts an `orders` array and renders daily revenue for the last 7 days.
 */
const RevenueChart = ({ orders = [] }) => {
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const revenue = orders
        .filter(o => o.createdAt?.startsWith(dateStr))
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      days.push({ label, revenue });
    }
    return days;
  }, [orders]);

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);

  const W = 360, H = 120, PAD = 12;
  const xStep = (W - PAD * 2) / (chartData.length - 1);

  const toPoint = (i, val) => ({
    x: PAD + i * xStep,
    y: H - PAD - ((val / maxRevenue) * (H - PAD * 2)),
  });

  const pathD = chartData.map((d, i) => {
    const p = toPoint(i, d.revenue);
    return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
  }).join(' ');

  const areaD = [
    `M${PAD},${H - PAD}`,
    ...chartData.map((d, i) => { const p = toPoint(i, d.revenue); return `L${p.x},${p.y}`; }),
    `L${PAD + (chartData.length - 1) * xStep},${H - PAD}`,
    'Z',
  ].join(' ');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Revenue</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Last 7 Days</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaD} fill="url(#revGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Data points */}
        {chartData.map((d, i) => {
          const p = toPoint(i, d.revenue);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#2e7d32" strokeWidth="2.5" />
              {/* Tooltip on hover via title tag */}
              <title>₹{d.revenue} on {d.label}</title>
            </g>
          );
        })}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1">
        {chartData.map((d, i) => (
          <span key={i} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d.label}</span>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
