import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

/* Required part categories (frame/gear/tyre) */
const REQUIRED_CATEGORIES = [
    { key: 'frame', label: 'Frame', icon: '🔩' },
    { key: 'gear',  label: 'Gear',  icon: '⚙️' },
    { key: 'tyre',  label: 'Tyre',  icon: '🔘' },
];

const PAGE_SIZE = 10;

/* ─── Searchable Single-Select Dropdown (for required parts) ─── */
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
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
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

/* ─── Accessory Multi-Select with search + tag chips ─── */
function AccessoryMultiSelect({ parts, selectedIds, onChange }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);
    const inputRef = useRef(null);

    const accessories = parts.filter(p => p.category === 'accessory');
    const filtered = accessories.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedParts = accessories.filter(p => selectedIds.includes(p.id));

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const openDropdown = () => {
        setOpen(true);
        setSearch('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const toggle = (part) => {
        if (selectedIds.includes(part.id)) {
            onChange(selectedIds.filter(id => id !== part.id));
        } else {
            onChange([...selectedIds, part.id]);
        }
    };

    const remove = (e, id) => {
        e.stopPropagation();
        onChange(selectedIds.filter(sid => sid !== id));
    };

    return (
        <div className="cat-select" ref={ref}>
            {/* Trigger */}
            <div
                className={`cat-select-trigger ${open ? 'focused' : ''} ${selectedParts.length > 0 ? 'has-value' : ''}`}
                onClick={openDropdown}
                style={{ height: 'auto', minHeight: '2.375rem', flexWrap: 'wrap', gap: '0.3rem', padding: selectedParts.length ? '0.3rem 0.5rem' : undefined }}
            >
                <span className="cat-select-label" style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                    {selectedParts.length === 0 ? (
                        <span className="cat-select-placeholder">Select Accessories… (optional)</span>
                    ) : (
                        selectedParts.map(p => (
                            <span
                                key={p.id}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    borderRadius: '9999px',
                                    padding: '0.15rem 0.5rem 0.15rem 0.625rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {p.name}
                                <button
                                    onClick={(e) => remove(e, p.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--primary)',
                                        padding: '0',
                                        lineHeight: 1,
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    ✕
                                </button>
                            </span>
                        ))
                    )}
                </span>
                <span className="cat-select-actions">
                    <span className="cat-chevron">{open ? '▲' : '▼'}</span>
                </span>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="cat-dropdown" style={{ zIndex: 1100 }}>
                    <div className="cat-search-wrap">
                        <input
                            ref={inputRef}
                            className="cat-search-input"
                            placeholder="Search accessories…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="cat-options">
                        {accessories.length === 0 ? (
                            <div className="cat-option-empty">No accessories available</div>
                        ) : filtered.length === 0 ? (
                            <div className="cat-option-empty">No matches found</div>
                        ) : (
                            filtered.map(p => {
                                const isSelected = selectedIds.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className={`cat-option ${isSelected ? 'active' : ''}`}
                                        onClick={() => toggle(p)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {/* Checkbox visual */}
                                        <span style={{
                                            width: '1rem',
                                            height: '1rem',
                                            borderRadius: '0.25rem',
                                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                                            background: isSelected ? 'var(--primary)' : 'transparent',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            fontSize: '0.6rem',
                                            color: 'white',
                                            transition: 'all 0.15s',
                                        }}>
                                            {isSelected && '✓'}
                                        </span>
                                        <span className="cat-option-name">{p.name}</span>
                                        <span className="cat-option-price">₹{parseFloat(p.price).toLocaleString('en-IN')}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {selectedIds.length > 0 && (
                        <div style={{
                            padding: '0.5rem 0.75rem',
                            borderTop: '1px solid var(--border-color)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <span>{selectedIds.length} selected</span>
                            <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600 }}
                                onClick={(e) => { e.stopPropagation(); onChange([]); }}
                            >
                                Clear all
                            </button>
                        </div>
                    )}
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

/* ─── Shared Config Form Body ─── */
function ConfigFormBody({
    parts,
    name, setName,
    desc, setDesc,
    selections, setSelections,
    selectedAccessories, setSelectedAccessories,
    nameError, setNameError,
    catErrors, setCatErrors,
}) {
    const selectPart = (cat, part) => {
        setSelections(prev => ({ ...prev, [cat]: part ? part.id : null }));
        if (catErrors[cat]) setCatErrors(prev => ({ ...prev, [cat]: false }));
    };

    // Price preview: required parts + accessories
    const requiredSelected = parts.filter(p =>
        REQUIRED_CATEGORIES.some(cat => selections[cat.key] === p.id)
    );
    const accessorySelected = parts.filter(p =>
        p.category === 'accessory' && selectedAccessories.includes(p.id)
    );
    const allSelectedParts = [...requiredSelected, ...accessorySelected];
    const total = allSelectedParts.reduce((s, p) => s + parseFloat(p.price), 0);

    const missedRequired = REQUIRED_CATEGORIES.filter(cat => !selections[cat.key]).length;

    return (
        <>
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

            {/* Required Parts */}
            <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                    <div className="builder-section-header" style={{ margin: 0 }}>
                        Select Parts<span className="required-star">*</span>
                    </div>
                    {missedRequired > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {3 - missedRequired}/3 selected
                        </span>
                    )}
                </div>

                <div className="builder-parts-2x2">
                    {REQUIRED_CATEGORIES.map(cat => (
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
            </div>

            {/* Divider */}
            <div className="builder-divider" style={{ margin: '0 0 1.25rem' }} />

            {/* Accessories (Optional) */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.625rem' }}>
                    <div className="builder-section-header" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🪛</span> Accessories
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--secondary)',
                            background: 'rgba(16,185,129,0.1)',
                            borderRadius: '9999px',
                            padding: '0.1rem 0.5rem',
                        }}>
                            Optional
                        </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Choose zero, one, or multiple accessories to include.
                    </p>
                </div>
                <AccessoryMultiSelect
                    parts={parts}
                    selectedIds={selectedAccessories}
                    onChange={setSelectedAccessories}
                />
            </div>

            {/* Price preview */}
            {allSelectedParts.length > 0 && (
                <div className="modal-price-preview">
                    <span className="modal-price-preview-label">Estimated Total</span>
                    <span className="modal-price-preview-value">₹{total.toLocaleString('en-IN')}</span>
                </div>
            )}
        </>
    );
}

/* ─── New Configuration Modal ─── */
function NewConfigModal({ parts, onClose, onSaved }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [selections, setSelections] = useState({ frame: null, gear: null, tyre: null });
    const [selectedAccessories, setSelectedAccessories] = useState([]);
    const [nameError, setNameError] = useState('');
    const [catErrors, setCatErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState('');

    const validate = () => {
        let valid = true;
        const newCatErrors = {};
        if (!name.trim()) { setNameError('Configuration name is required.'); valid = false; }
        REQUIRED_CATEGORIES.forEach(cat => {
            if (!selections[cat.key]) { newCatErrors[cat.key] = true; valid = false; }
        });
        setCatErrors(newCatErrors);
        return valid;
    };

    const save = async () => {
        if (!validate()) return;
        setSaving(true);
        setApiError('');
        try {
            const part_ids = [
                ...Object.values(selections).filter(Boolean),
                ...selectedAccessories,
            ];
            await axios.post(`${API_URL}/api/configurations`, {
                name: name.trim(),
                description: desc,
                part_ids,
            });
            onSaved();
            onClose();
        } catch {
            setApiError('Error saving configuration. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-dialog modal-dialog-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🚲</span>
                        <h3>New Configuration</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
                    <ConfigFormBody
                        parts={parts}
                        name={name} setName={setName}
                        desc={desc} setDesc={setDesc}
                        selections={selections} setSelections={setSelections}
                        selectedAccessories={selectedAccessories} setSelectedAccessories={setSelectedAccessories}
                        nameError={nameError} setNameError={setNameError}
                        catErrors={catErrors} setCatErrors={setCatErrors}
                    />
                    {apiError && <div className="form-error" style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>{apiError}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
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

/* ─── Edit Configuration Modal ─── */
function EditConfigModal({ config, parts, onClose, onSaved }) {
    const [name, setName] = useState(config.name);
    const [desc, setDesc] = useState(config.description || '');
    const [selections, setSelections] = useState({ frame: null, gear: null, tyre: null });
    const [selectedAccessories, setSelectedAccessories] = useState([]);
    const [nameError, setNameError] = useState('');
    const [catErrors, setCatErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState('');
    const [loadingParts, setLoadingParts] = useState(true);

    // Pre-populate selections from saved config
    useEffect(() => {
        axios.get(`${API_URL}/api/configurations/${config.id}`)
            .then(r => {
                const configParts = r.data.parts || [];
                const newSel = { frame: null, gear: null, tyre: null };
                const accIds = [];
                configParts.forEach(p => {
                    if (p.category === 'accessory') {
                        accIds.push(p.id);
                    } else if (newSel.hasOwnProperty(p.category)) {
                        newSel[p.category] = p.id;
                    }
                });
                setSelections(newSel);
                setSelectedAccessories(accIds);
            })
            .catch(() => { })
            .finally(() => setLoadingParts(false));
    }, [config.id]);

    const validate = () => {
        let valid = true;
        const newCatErrors = {};
        if (!name.trim()) { setNameError('Configuration name is required.'); valid = false; }
        REQUIRED_CATEGORIES.forEach(cat => {
            if (!selections[cat.key]) { newCatErrors[cat.key] = true; valid = false; }
        });
        setCatErrors(newCatErrors);
        return valid;
    };

    const save = async () => {
        if (!validate()) return;
        setSaving(true);
        setApiError('');
        try {
            const part_ids = [
                ...Object.values(selections).filter(Boolean),
                ...selectedAccessories,
            ];
            await axios.put(`${API_URL}/api/configurations/${config.id}`, {
                name: name.trim(),
                description: desc,
                part_ids,
            });
            onSaved();
            onClose();
        } catch {
            setApiError('Error updating configuration. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-dialog modal-dialog-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>✏️</span>
                        <h3>Edit Configuration</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
                    {loadingParts ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
                    ) : (
                        <ConfigFormBody
                            parts={parts}
                            name={name} setName={setName}
                            desc={desc} setDesc={setDesc}
                            selections={selections} setSelections={setSelections}
                            selectedAccessories={selectedAccessories} setSelectedAccessories={setSelectedAccessories}
                            nameError={nameError} setNameError={setNameError}
                            catErrors={catErrors} setCatErrors={setCatErrors}
                        />
                    )}
                    {apiError && <div className="form-error" style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>{apiError}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={save}
                        disabled={saving || loadingParts}
                        style={{ minWidth: '9rem' }}
                    >
                        {saving ? 'Saving…' : '💾 Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Delete Confirmation Modal ─── */
function DeleteConfigModal({ config, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const confirm = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${API_URL}/api/configurations/${config.id}`);
            onDeleted('Configuration deleted successfully.');
        } catch {
            onClose();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-dialog modal-dialog-sm" onClick={e => e.stopPropagation()}>
                <div className="delete-confirm-body">
                    <div className="delete-icon">🗑️</div>
                    <h3>Delete Configuration?</h3>
                    <p>
                        Are you sure you want to delete <strong>"{config.name}"</strong>? This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={deleting}>Cancel</button>
                    <button className="btn btn-danger btn-sm" onClick={confirm} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main ConfigBuilder ─── */
export default function ConfigBuilder() {
    const [parts, setParts] = useState([]);
    const [configs, setConfigs] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editConfig, setEditConfig] = useState(null);
    const [deleteConfig, setDeleteConfig] = useState(null);
    const [configPage, setConfigPage] = useState(1);
    const [toast, setToast] = useState('');
    const navigate = useNavigate();

    const [configSearch, setConfigSearch] = useState('');

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

    const handleUpdated = () => {
        loadData();
        showToast('Configuration updated successfully!');
    };

    const handleDeleted = (msg) => {
        loadData();
        setDeleteConfig(null);
        setConfigPage(1);
        showToast(msg);
    };

    const handleConfigSearch = (val) => { setConfigSearch(val); setConfigPage(1); };

    const filteredConfigs = configs.filter(c =>
        c.name.toLowerCase().includes(configSearch.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(configSearch.toLowerCase())
    );

    const pagedConfigs = filteredConfigs.slice((configPage - 1) * PAGE_SIZE, configPage * PAGE_SIZE);

    return (
        <div className="page-wrapper animate-fade-in">
            {toast && <div className="toast-notification">✓ {toast}</div>}

            {/* New Config Modal */}
            {modalOpen && (
                <NewConfigModal
                    parts={parts}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

            {/* Edit Config Modal */}
            {editConfig && (
                <EditConfigModal
                    config={editConfig}
                    parts={parts}
                    onClose={() => setEditConfig(null)}
                    onSaved={handleUpdated}
                />
            )}

            {/* Delete Config Modal */}
            {deleteConfig && (
                <DeleteConfigModal
                    config={deleteConfig}
                    onClose={() => setDeleteConfig(null)}
                    onDeleted={handleDeleted}
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
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Saved Configurations</h3>
                    {configs.length > 0 && (
                        <div className="table-toolbar" style={{ margin: 0, padding: 0, border: 'none', background: 'none', flex: '1', maxWidth: '360px' }}>
                            <div className="table-toolbar-search">
                                <span className="table-toolbar-icon">🔍</span>
                                <input
                                    id="config-search-input"
                                    className="table-toolbar-input"
                                    placeholder="Search configurations…"
                                    value={configSearch}
                                    onChange={e => handleConfigSearch(e.target.value)}
                                />
                                {configSearch && (
                                    <button className="table-toolbar-clear" onClick={() => handleConfigSearch('')} aria-label="Clear search">✕</button>
                                )}
                            </div>
                            {configSearch && (
                                <span className="table-toolbar-count">
                                    {filteredConfigs.length} result{filteredConfigs.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    )}
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
                                    <th style={{ width: '2.5rem' }}>#</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => navigate(`/config/${c.id}`)}
                                                >
                                                    View →
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ color: 'var(--primary)' }}
                                                    onClick={() => setEditConfig(c)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => setDeleteConfig(c)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredConfigs.length === 0 && configs.length > 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                                            No configurations match your search.
                                            <button className="btn-link" style={{ marginLeft: '0.5rem' }} onClick={() => handleConfigSearch('')}>Clear</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Pagination total={filteredConfigs.length} page={configPage} onPage={setConfigPage} />
                    </>
                )}
            </div>
        </div>
    );
}