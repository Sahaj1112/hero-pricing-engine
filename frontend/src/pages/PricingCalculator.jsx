import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

/* ─── Category definitions (keys match DB category column) ─── */
const CATEGORIES = [
    { key: 'frame',     label: 'Frame',    icon: '🔩' },
    { key: 'gear',      label: 'Gear Set', icon: '⚙️' },
    { key: 'tyre',      label: 'Tyre',     icon: '🔘' },
    { key: 'accessory', label: 'Accessory',icon: '🪛' },
];

/* ─── Searchable dropdown (same pattern as ConfigBuilder) ─── */
function PartDropdown({ category, parts, value, onChange }) {
    const [open, setOpen]     = useState(false);
    const [search, setSearch] = useState('');
    const ref                 = useRef(null);
    const inputRef            = useRef(null);

    const options  = parts.filter(p => p.category === category.key);
    const filtered = options.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const selected = options.find(p => p.id === value) || null;

    useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const open_ = () => { setOpen(true); setSearch(''); setTimeout(() => inputRef.current?.focus(), 40); };
    const pick  = (p) => { onChange(p); setOpen(false); setSearch(''); };
    const clear = (e) => { e.stopPropagation(); onChange(null); };

    return (
        <div className="cat-select" ref={ref}>
            <div
                className={`cat-select-trigger ${open ? 'focused' : ''} ${selected ? 'has-value' : ''}`}
                onClick={open_}
            >
                <span className="cat-select-label">
                    {selected
                        ? <><strong>{selected.name}</strong>
                             <span className="cat-select-price">₹{parseFloat(selected.price).toLocaleString('en-IN')}</span></>
                        : <span className="cat-select-placeholder">Choose {category.label}…</span>
                    }
                </span>
                <span className="cat-select-actions">
                    {selected && <button className="cat-clear-btn" onClick={clear}>✕</button>}
                    <span className="cat-chevron">{open ? '▲' : '▼'}</span>
                </span>
            </div>

            {open && (
                <div className="cat-dropdown">
                    <div className="cat-search-wrap">
                        <input
                            ref={inputRef}
                            className="cat-search-input"
                            placeholder={`Search ${category.label}…`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="cat-options">
                        {options.length === 0
                            ? <div className="cat-option-empty">No {category.label} parts in inventory</div>
                            : filtered.length === 0
                            ? <div className="cat-option-empty">No matches found</div>
                            : filtered.map(p => (
                                <div
                                    key={p.id}
                                    className={`cat-option ${p.id === value ? 'active' : ''}`}
                                    onClick={() => pick(p)}
                                >
                                    <span className="cat-option-name">{p.name}</span>
                                    <span className="cat-option-price">₹{parseFloat(p.price).toLocaleString('en-IN')}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Main Pricing Calculator ─── */
export default function PricingCalculator() {
    const [parts,      setParts]      = useState([]);
    const [selections, setSelections] = useState({ frame: null, gear: null, tyre: null, accessory: null });
    const [prevTotal,  setPrevTotal]  = useState(0);
    const [flash,      setFlash]      = useState(false);

    useEffect(() => {
        axios.get(`${API_URL}/api/parts`).then(r => setParts(r.data));
    }, []);

    const select = (catKey, part) => {
        setSelections(prev => ({ ...prev, [catKey]: part ? part.id : null }));
    };

    const selectedParts = CATEGORIES
        .map(cat => {
            const part = parts.find(p => p.id === selections[cat.key]);
            return part ? { ...part, catLabel: cat.label, catIcon: cat.icon } : null;
        })
        .filter(Boolean);

    const total       = selectedParts.reduce((s, p) => s + parseFloat(p.price), 0);
    const count       = selectedParts.length;
    const avgPrice    = count > 0 ? total / count : 0;

    // Flash animation when total changes
    useEffect(() => {
        if (total !== prevTotal && total > 0) {
            setFlash(true);
            setTimeout(() => setFlash(false), 600);
            setPrevTotal(total);
        }
    }, [total]);

    const allSelected = count === CATEGORIES.length;

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Pricing Calculator</h1>
                    <p>Select parts from each category to calculate your custom cycle price in real time.</p>
                </div>
                {count > 0 && (
                    <div className="calc-live-badge">
                        🟢 Live Calculation
                    </div>
                )}
            </div>

            <div className="calc-main-layout">
                {/* ── Left Column ── */}
                <div className="calc-left">

                    {/* Part Selection Grid */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div className="builder-section-header" style={{ marginBottom: 0 }}>Select Components</div>
                        </div>
                        <div className="calc-dropdowns-grid">
                            {CATEGORIES.map(cat => (
                                <div key={cat.key} className="calc-dropdown-cell">
                                    <label className="calc-dropdown-label">
                                        <span>{cat.icon}</span> {cat.label}
                                        {!selections[cat.key] && (
                                            <span className="calc-not-selected">not selected</span>
                                        )}
                                    </label>
                                    <PartDropdown
                                        category={cat}
                                        parts={parts}
                                        value={selections[cat.key]}
                                        onChange={(p) => select(cat.key, p)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Table */}
                    <div className="data-table-wrapper" style={{ marginTop: '1rem' }}>
                        <table className="data-table calc-table">
                            <thead>
                                <tr>
                                    <th>Component</th>
                                    <th>Selected Part</th>
                                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CATEGORIES.map(cat => {
                                    const part = parts.find(p => p.id === selections[cat.key]);
                                    return (
                                        <tr key={cat.key} className={part ? '' : 'calc-empty-row'}>
                                            <td>
                                                <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                                    {cat.icon} {cat.label}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.8125rem' }}>
                                                {part
                                                    ? <span style={{ fontWeight: 500 }}>{part.name}</span>
                                                    : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
                                                }
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: part ? 700 : 400, fontSize: '0.8125rem', color: part ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                {part ? `₹${parseFloat(part.price).toLocaleString('en-IN')}` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="calc-grand-total-row">
                                    <td colSpan={2} style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                                        Total ({count}/{CATEGORIES.length} components selected)
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                                        {total > 0 ? `₹${total.toLocaleString('en-IN')}` : '—'}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Validation hint */}
                    {count > 0 && !allSelected && (
                        <div className="calc-validation-hint">
                            ⚠️ Select all {CATEGORIES.length} components to complete the configuration.
                        </div>
                    )}
                </div>

                {/* ── Right Column: Summary Card ── */}
                <div className="calc-right">
                    <div className={`calc-summary-card ${flash ? 'calc-flash' : ''}`}>
                        <div className="calc-summary-label">Total Cycle Price</div>
                        <div className="calc-summary-price">
                            {total > 0 ? `₹${total.toLocaleString('en-IN')}` : '₹—'}
                        </div>
                        <div className="calc-summary-meta">
                            {count > 0
                                ? `${count} component${count !== 1 ? 's' : ''} selected`
                                : 'No components selected yet'
                            }
                        </div>

                        {count > 0 && (
                            <>
                                <div className="calc-summary-divider" />

                                <div className="calc-stat-row">
                                    <span className="calc-stat-label">Components</span>
                                    <span className="calc-stat-value">{count} / {CATEGORIES.length}</span>
                                </div>
                                <div className="calc-stat-row">
                                    <span className="calc-stat-label">Avg. Price</span>
                                    <span className="calc-stat-value">₹{Math.round(avgPrice).toLocaleString('en-IN')}</span>
                                </div>

                                <div className="calc-summary-divider" />

                                <div className="calc-breakdown-list">
                                    {selectedParts.map(p => (
                                        <div key={p.id} className="calc-breakdown-row">
                                            <span className="calc-breakdown-name">{p.catIcon} {p.name}</span>
                                            <span className="calc-breakdown-price">
                                                ₹{parseFloat(p.price).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {count === 0 && (
                            <div style={{ marginTop: '1.25rem', opacity: 0.6, fontSize: '0.8125rem', textAlign: 'center' }}>
                                Use the dropdowns to the left to start building your custom cycle.
                            </div>
                        )}
                    </div>

                    {allSelected && (
                        <div className="calc-complete-badge">
                            ✅ All components selected
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
