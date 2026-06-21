import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

export default function ConfigView() {
    const { id } = useParams();
    const [config, setConfig] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_URL}/api/configurations/${id}`).then(r => setConfig(r.data));
    }, [id]);

    if (!config) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-muted">Loading configuration...</div>
        </div>
    );

    const total = parseFloat(config.total_price);

    return (
        <div className="page-wrapper animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>

            {/* Back button */}
            <button
                className="btn btn-secondary btn-sm"
                style={{ marginBottom: '0.875rem' }}
                onClick={() => navigate('/builder')}
            >
                ← Back to Configurations
            </button>

            {/* Main card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderTop: '3px solid var(--primary)' }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    gap: '1rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🚲</span>
                        <div>
                            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                                {config.name}
                            </h1>
                            {config.description
                                ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>{config.description}</p>
                                : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0', fontStyle: 'italic' }}>No description</p>
                            }
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                            Config ID
                        </div>
                        <div style={{
                            fontFamily: 'ui-monospace, monospace',
                            fontSize: '0.8125rem',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            padding: '0.2rem 0.625rem',
                            borderRadius: '0.375rem',
                            fontWeight: 700,
                            display: 'inline-block',
                        }}>
                            #{id.toString().padStart(4, '0')}
                        </div>
                    </div>
                </div>

                {/* Parts table */}
                <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '0.6rem 1.25rem', fontSize: '0.7rem' }}>Component</th>
                            <th style={{ padding: '0.6rem 1.25rem', fontSize: '0.7rem' }}>Category</th>
                            <th style={{ padding: '0.6rem 1.25rem', fontSize: '0.7rem', textAlign: 'right' }}>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {config.parts.map(p => (
                            <tr key={p.id}>
                                <td style={{ padding: '0.6rem 1.25rem', fontWeight: 500 }}>{p.name}</td>
                                <td style={{ padding: '0.6rem 1.25rem' }}>
                                    <span className={`badge badge-${p.category}`} style={{ fontSize: '0.7rem' }}>
                                        {p.category}
                                    </span>
                                </td>
                                <td style={{ padding: '0.6rem 1.25rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                    ₹{parseFloat(p.price).toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td
                                colSpan={2}
                                style={{
                                    padding: '0.7rem 1.25rem',
                                    textAlign: 'right',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    background: 'var(--primary-light)',
                                    borderBottom: 'none',
                                }}
                            >
                                Total Price
                            </td>
                            <td style={{
                                padding: '0.7rem 1.25rem',
                                textAlign: 'right',
                                fontWeight: 800,
                                fontSize: '1.0625rem',
                                color: 'var(--primary)',
                                background: 'var(--primary-light)',
                                borderBottom: 'none',
                                fontFamily: "'Outfit', sans-serif",
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                ₹{total.toLocaleString('en-IN')}
                            </td>
                        </tr>
                    </tfoot>
                </table>

            </div>
        </div>
    );
}