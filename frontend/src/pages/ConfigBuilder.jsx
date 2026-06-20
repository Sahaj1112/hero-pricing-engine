import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

const CATEGORIES = [
    { key: 'frame',     label: 'Frame',     icon: '🔩' },
    { key: 'gear',      label: 'Gear',      icon: '⚙️' },
    { key: 'tyre',      label: 'Tyre',      icon: '🔘' },
    { key: 'accessory', label: 'Accessory', icon: '🪛' },
];

const PAGE_SIZE = 10;

/* ─── Searchable Select Dropdown ─── */
function CategorySelect({ category, parts, value, onChange, hasError }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);
    const inputRef = useRef(null);

    const filtered = parts
        .filter(p => p.category === category.key)
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const selected = parts.find(p => p.id === value) || null;

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const openDropdown = () => {
        setOpen(true);
        setSearch('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const pick = (part) => { onChange(part); setOpen(false); setSearch(''); };
    const clear = (e) => { e.stopPropagation(); onChange(null); };

    return (
        <div className="cat-select" ref={ref}>
            <div
                className={`cat-select-trigger ${open ? 'focused' : ''} ${selected ? 'has-value' : ''} ${hasError ? 'cat-select-error' : ''}`}
                onClick={openDropdown}
            >
                <span className="cat-select-label">
                    {selected
                        ? <><strong>{selected.name}</strong><span className="cat-select-price">₹{parseFloat(selected.price).toLocaleString('en-IN')}</span></>
                        : <span className="cat-select-placeholder">Select {category.label}…</span>
                    }
                </span>
                <span className="cat-select-actions">
                    {selected && <button className="cat-clear-btn" onClick={clear}>✕</button>}
                    <span className="cat-chevron">{open ? '▲' : '▼'}</span>
                </span>
            </div>
            {open && (
                <div className="cat-dropdown" style={{ zIndex: 1100 }}>
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
                        {filtered.length === 0
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

/* ─── Compact Pagination ─── */
function Pagination({ total, page, onPage }) {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    return (
        <div className="pagination">
            <span className="pagination-info">Showing {from}–{to} of {total}</span>
            <div className="pagination-controls">
                <button className="pagination-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
                ))}
                <button className="pagination-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages}>›</button>
            </div>
        </div>
    );
}

/* ─── New Configuration Modal ─── */
function NewConfigModal({ parts, onClose, onSaved }) {
    const [name, setName]           = useState('');
    const [desc, setDesc]           = useState('');
    const [selections, setSelections] = useState({ frame: null, gear: null, tyre: null, accessory: null });
    const [nameError, setNameError] = useState('');
    const [catErrors, setCatErrors] = useState({});
    const [saving, setSaving]       = useState(false);
    const [apiError, setApiError]   = useState('');

    const selectPart = (cat, part) => {
        setSelections(prev => ({ ...prev, [cat]: part ? part.id : null }));
        // Clear individual category error when user picks
        if (catErrors[cat]) {
            setCatErrors(prev => ({ ...prev, [cat]: false }));
        }
    };

    const selectedParts = parts.filter(p => Object.values(selections).includes(p.id));
    const total = selectedParts.reduce((s, p) => s + parseFloat(p.price), 0);

    const save = async () => {
        let valid = true;
        const newCatErrors = {};

        if (!name.trim()) { setNameError('Configuration name is required.'); valid = false; }

        CATEGORIES.forEach(cat => {
            if (!selections[cat.key]) {
                newCatErrors[cat.key] = true;
                valid = false;
            }
        });

        setCatErrors(newCatErrors);
        if (!valid) return;

        setSaving(true);
        setApiError('');
        try {
            await axios.post(`${API_URL}/api/configurations`, {
                name: name.trim(),
                description: desc,
                part_ids: Object.values(selections).filter(Boolean),
            });
            onSaved();
            onClose();
        } catch {
            setApiError('Error saving configuration. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const missedCount = CATEGORIES.filter(cat => !selections[cat.key]).length;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-dialog modal-dialog-lg" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🚲</span>
                        <h3>New Configuration</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>

                    {/* Config Details */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div className="builder-section-header" style={{ marginBottom: '0.625rem' }}>
                            Configuration Details
                        </div>
                        <div className="builder-two-col">
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.3rem' }}>
                                    Name<span className="required-star">*</span>
                                </label>
                                <input
                                    id="config-name-input"
                                    className={`form-input form-input-sm ${nameError ? 'input-error' : ''}`}
                                    placeholder="e.g. Road Racer Pro"
                                    value={name}
                                    onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }}
                                    autoFocus
                                />
                                {nameError && <span className="form-error-inline">{nameError}</span>}
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.3rem' }}>
                                    Description{' '}
                                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional)</span>
                                </label>
                                <input
                                    id="config-desc-input"
                                    className="form-input form-input-sm"
                                    placeholder="Brief description"
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="builder-divider" style={{ margin: '0 0 1.25rem' }} />

                    {/* Select Parts */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                            <div className="builder-section-header" style={{ margin: 0 }}>
                                Select Parts<span className="required-star">*</span>
                            </div>
                            {missedCount > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {4 - missedCount}/4 selected
                                </span>
                            )}
                        </div>

                        <div className="builder-parts-2x2">
                            {CATEGORIES.map(cat => (
                                <div key={cat.key} className="builder-cat-cell">
                                    <label className={`builder-cat-cell-label ${catErrors[cat.key] ? 'builder-cat-label-error' : ''}`}>
                                        <span>{cat.icon}</span> {cat.label}
                                        <span className="required-star">*</span>
                                    </label>
                                    <CategorySelect
                                        category={cat}
                                        parts={parts}
                                        value={selections[cat.key]}
                                        onChange={(part) => selectPart(cat.key, part)}
                                        hasError={!!catErrors[cat.key]}
                                    />
                                    {catErrors[cat.key] && (
                                        <span className="form-error-inline">Please select a {cat.label.toLowerCase()}.</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Price preview inside modal */}
                        {selectedParts.length > 0 && (
                            <div className="modal-price-preview">
                                <span className="modal-price-preview-label">Estimated Total</span>
                                <span className="modal-price-preview-value">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        {apiError && (
                            <div className="form-error" style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>{apiError}</div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button
                        id="save-configuration-btn"
                        className="btn btn-primary"
                        onClick={save}
                        disabled={saving}
                        style={{ minWidth: '9rem' }}
                    >
                        {saving ? 'Saving…' : '💾 Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main ConfigBuilder ─── */
export default function ConfigBuilder() {
    const [parts, setParts]       = useState([]);
    const [configs, setConfigs]   = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [configPage, setConfigPage] = useState(1);
    const [toast, setToast]       = useState('');
    const navigate = useNavigate();

    const loadData = () => {
        axios.get(`${API_URL}/api/parts`).then(r => setParts(r.data));
        axios.get(`${API_URL}/api/configurations`).then(r => setConfigs(r.data));
    };

    useEffect(() => { loadData(); }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleSaved = () => {
        loadData();
        setConfigPage(1);
        showToast('Configuration saved successfully!');
    };

    const pagedConfigs = configs.slice((configPage - 1) * PAGE_SIZE, configPage * PAGE_SIZE);

    return (
        <div className="page-wrapper animate-fade-in">
            {toast && <div className="toast-notification">✓ {toast}</div>}

            {/* Modal */}
            {modalOpen && (
                <NewConfigModal
                    parts={parts}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Build Configuration</h1>
                    <p>Manage your saved cycle configurations.</p>
                </div>
                <button
                    id="new-configuration-btn"
                    className="btn btn-primary btn-sm"
                    onClick={() => setModalOpen(true)}
                >
                    + New Configuration
                </button>
            </div>

            {/* Saved Configurations Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Saved Configurations</h3>
                </div>

                {configs.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-muted mb-4" style={{ marginBottom: '1rem' }}>
                            No configurations yet. Create your first bike configuration!
                        </p>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setModalOpen(true)}
                        >
                            + New Configuration
                        </button>
                    </div>
                ) : (
                    <>
                        <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedConfigs.map((c, i) => (
                                    <tr key={c.id}>
                                        <td className="text-muted" style={{ width: '2.5rem' }}>
                                            {(configPage - 1) * PAGE_SIZE + i + 1}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                                        <td className="text-muted">{c.description || <em>—</em>}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => navigate(`/config/${c.id}`)}
                                            >
                                                View →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination total={configs.length} page={configPage} onPage={setConfigPage} />
                    </>
                )}
            </div>
        </div>
    );
}