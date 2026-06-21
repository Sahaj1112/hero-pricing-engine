import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

/* ─── SVG Bar Chart ─── */
function BarChart({ configs }) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(600);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            setWidth(entries[0].contentRect.width);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    if (!configs || configs.length === 0) {
        return (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No configurations to display yet.
            </div>
        );
    }

    const H = 220;
    const PAD = { top: 16, right: 16, bottom: 56, left: 64 };
    const chartW = width - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const maxPrice = Math.max(...configs.map(c => parseFloat(c.total_price)));
    const niceMax  = Math.ceil(maxPrice / 1000) * 1000 || 1000;
    const ticks    = 4;

    const barW = Math.max(20, Math.min(48, chartW / configs.length - 12));

    const xPos = (i) => PAD.left + (chartW / configs.length) * i + (chartW / configs.length) / 2;
    const yPos = (val) => PAD.top + chartH - (val / niceMax) * chartH;

    const fmt = (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`;

    return (
        <div ref={containerRef} style={{ width: '100%' }}>
            <svg width="100%" height={H} style={{ overflow: 'visible', display: 'block' }}>
                <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="1" />
                    </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {Array.from({ length: ticks + 1 }, (_, i) => {
                    const val = (niceMax / ticks) * i;
                    const y   = yPos(val);
                    return (
                        <g key={i}>
                            <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
                                stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 3" />
                            <text x={PAD.left - 8} y={y + 4} textAnchor="end"
                                fontSize="10" fill="var(--text-muted)" fontFamily="Inter, sans-serif">
                                {fmt(val)}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {configs.map((c, i) => {
                    const price = parseFloat(c.total_price);
                    const bh    = (price / niceMax) * chartH;
                    const x     = xPos(i) - barW / 2;
                    const y     = yPos(price);
                    const label = c.name.length > 10 ? c.name.slice(0, 9) + '…' : c.name;

                    return (
                        <g key={c.id} style={{ cursor: 'pointer' }}>
                            {/* Bar background (hover track) */}
                            <rect x={x - 4} y={PAD.top} width={barW + 8} height={chartH}
                                fill="transparent" rx="4" />
                            {/* Bar */}
                            <rect x={x} y={y} width={barW} height={bh}
                                fill="url(#barGrad)" rx="4" ry="4"
                                style={{ transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.setAttribute('fill', 'url(#barGradHover)')}
                                onMouseLeave={e => e.currentTarget.setAttribute('fill', 'url(#barGrad)')}
                            />
                            {/* Price label above bar */}
                            <text x={xPos(i)} y={y - 5} textAnchor="middle"
                                fontSize="9.5" fontWeight="700" fill="var(--primary)"
                                fontFamily="Inter, sans-serif">
                                {fmt(price)}
                            </text>
                            {/* X-axis label */}
                            <text x={xPos(i)} y={H - 6} textAnchor="middle"
                                fontSize="10" fill="var(--text-muted)" fontFamily="Inter, sans-serif">
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* Y-axis line */}
                <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH}
                    stroke="var(--border-color)" strokeWidth="1" />
                {/* X-axis line */}
                <line x1={PAD.left} y1={PAD.top + chartH} x2={PAD.left + chartW} y2={PAD.top + chartH}
                    stroke="var(--border-color)" strokeWidth="1" />
            </svg>
        </div>
    );
}

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, sub, accent, onClick }) {
    const colors = {
        blue:   { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
        green:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
        violet: { bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6' },
        amber:  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    };
    const c = colors[accent] || colors.blue;

    const isClickable = typeof onClick === 'function';

    return (
        <div
            className="card"
            onClick={onClick}
            style={{
                padding: '1rem 1.125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                transition: 'all 0.2s',
                cursor: isClickable ? 'pointer' : 'default',
                userSelect: 'none',
            }}
            onMouseEnter={e => {
                if (isClickable) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                }
            }}
            onMouseLeave={e => {
                if (isClickable) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                }
            }}
        >
            <div style={{
                width: '2.75rem', height: '2.75rem', borderRadius: '0.625rem', flexShrink: 0,
                background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem',
            }}>
                {icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    {label}
                </div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {value}
                </div>
                {sub && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub}
                    </div>
                )}
            </div>
            {isClickable && (
                <div style={{ color: c.color, fontSize: '1rem', flexShrink: 0, opacity: 0.7 }}>→</div>
            )}
        </div>
    );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = () => {
        setLoading(true);
        axios.get(`${API_URL}/api/configurations/stats`)
            .then(r => { setStats(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const configs       = stats?.configs || [];
    const avgPrice      = stats?.avg_price ?? 0;
    const mostExpensive = stats?.most_expensive;

    // Sort by most recently updated/created and take top 5
    const recentConfigs = [...configs]
        .sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at);
            const dateB = new Date(b.updated_at || b.created_at);
            return dateB - dateA;
        })
        .slice(0, 5);

    const fmt = (v) => `₹${parseFloat(v).toLocaleString('en-IN')}`;

    return (
        <div className="page-wrapper animate-fade-in">

            {/* Page header */}
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>System overview — parts, configurations and pricing insights.</p>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
            ) : (
                <>
                    {/* ── Stat Cards ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                        <StatCard
                            icon="⚙️"
                            label="Total Parts"
                            value={stats?.total_parts ?? 0}
                            accent="blue"
                            onClick={() => navigate('/parts')}
                        />
                        <StatCard
                            icon="🚲"
                            label="Total Configurations"
                            value={stats?.total_configs ?? 0}
                            accent="green"
                            onClick={() => navigate('/builder')}
                        />
                        <StatCard
                            icon="📊"
                            label="Avg. Config Price"
                            value={stats?.total_configs ? fmt(avgPrice.toFixed(0)) : '—'}
                            accent="violet"
                        />
                        <StatCard
                            icon="🏆"
                            label="Most Expensive"
                            value={mostExpensive ? fmt(mostExpensive.total_price) : '—'}
                            sub={mostExpensive?.name}
                            accent="amber"
                        />
                    </div>

                    {/* ── Bar Chart (full width) ── */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Configuration Price Analytics</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>Total price per configuration</p>
                            </div>
                            <span style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontWeight: 600 }}>
                                {configs.length} configs
                            </span>
                        </div>
                        <div style={{ padding: '1rem 1.25rem 0.5rem' }}>
                            <BarChart configs={configs} />
                        </div>
                    </div>

                    {/* ── Recent Configurations Table ── */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Recent Configurations</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>Most recently created or updated</p>
                            </div>
                            {configs.length > 0 && (
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/builder')}>
                                    View All →
                                </button>
                            )}
                        </div>

                        {configs.length === 0 ? (
                            <div className="empty-state">
                                <p className="text-muted" style={{ marginBottom: '1rem' }}>No configurations yet. Build your first bike!</p>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/builder')}>
                                    Start Building
                                </button>
                            </div>
                        ) : (
                            <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '0.6rem 1.25rem' }}>Configuration Name</th>
                                        <th style={{ padding: '0.6rem 1.25rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentConfigs.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ padding: '0.75rem 1.25rem', fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '1rem' }}>🚲</span>
                                                    {c.name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => navigate(`/config/${c.id}`)}
                                                >
                                                    View Details →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}