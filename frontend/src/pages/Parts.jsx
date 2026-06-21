import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const CATEGORIES = ['frame', 'gear', 'tyre', 'accessory'];
const PAGE_SIZE = 10;

const EMPTY_FORM = { name: '', category: 'frame', price: '', is_accessory: false };

/* ─── Reusable Pagination component ─── */
function Pagination({ total, page, onPage }) {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    return (
        <div className="pagination">
            <span className="pagination-info">Showing {from}–{to} of {total}</span>
            <div className="pagination-controls">
                <button className="pagination-btn" onClick={() => onPage(1)} disabled={page === 1}>«</button>
                <button className="pagination-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                        if (i > 0 && arr[i - 1] !== p - 1) acc.push('…');
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((p, i) =>
                        p === '…'
                            ? <span key={`e${i}`} className="pagination-btn" style={{ border: 'none' }}>…</span>
                            : <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
                    )}
                <button className="pagination-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages}>›</button>
                <button className="pagination-btn" onClick={() => onPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
        </div>
    );
}

/* ─── Part Form Modal (Add / Edit) ─── */
function PartFormModal({ initial, onClose, onSaved }) {
    const isEdit = !!initial;
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Part name is required.';
        if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
            e.price = 'A valid price is required.';
        return e;
    };

    const submit = async () => {
        const e = validate();
        if (Object.keys(e).length) return setErrors(e);
        setSaving(true);
        try {
            if (isEdit) {
                await axios.put(`${API_URL}/api/parts/${initial.id}`, form);
            } else {
                await axios.post(`${API_URL}/api/parts`, form);
            }
            onSaved(isEdit ? 'Part updated successfully!' : 'Part added successfully!');
        } catch {
            setErrors({ submit: 'Something went wrong. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-dialog" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isEdit ? 'Edit Part' : 'Add New Part'}</h3>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">
                            Part Name<span className="required-star">*</span>
                        </label>
                        <input
                            className={`form-input ${errors.name ? 'input-error' : ''}`}
                            placeholder="e.g. Carbon Fibre Frame"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                        />
                        {errors.name && <span className="form-error-inline">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            Category<span className="required-star">*</span>
                        </label>
                        <select
                            className="form-input"
                            value={form.category}
                            onChange={e => set('category', e.target.value)}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                            Price (₹)<span className="required-star">*</span>
                        </label>
                        <input
                            className={`form-input ${errors.price ? 'input-error' : ''}`}
                            placeholder="e.g. 4999"
                            type="number"
                            min="0"
                            value={form.price}
                            onChange={e => set('price', e.target.value)}
                        />
                        {errors.price && <span className="form-error-inline">{errors.price}</span>}
                    </div>
                    {errors.submit && <p className="form-error" style={{ marginTop: '1rem' }}>{errors.submit}</p>}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>
                        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Part'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Delete Confirmation Modal ─── */
function DeleteModal({ part, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const confirm = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${API_URL}/api/parts/${part.id}`);
            onDeleted('Part deleted successfully.');
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
                    <h3>Delete Part?</h3>

                    <p>
                        Are you sure you want to delete <strong>"{part.name}"</strong>? This action cannot be undone.
                    </p>

                    <p className="delete-note">
                        <strong>Note:</strong> Deleting this part will automatically unlink it from all configurations where it is currently used.
                    </p>

                    <p>
                        Are you sure you want to proceed?
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

/* ─── Main Parts Page ─── */
export default function Parts() {
    const [parts, setParts] = useState([]);
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [editPart, setEditPart] = useState(null);
    const [deletePart, setDeletePart] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const load = () => axios.get(`${API_URL}/api/parts`).then(r => setParts(r.data));
    useEffect(() => { load(); }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSaved = (msg) => {
        setAddOpen(false);
        setEditPart(null);
        load();
        showToast(msg);
    };

    const handleDeleted = (msg) => {
        setDeletePart(null);
        load();
        setPage(1);
        showToast(msg);
    };

    // Derived filtered list
    const filtered = parts.filter(p => {
        const matchName = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat  = categoryFilter === 'all' || p.category === categoryFilter;
        return matchName && matchCat;
    });

    const handleSearch = (val) => { setSearch(val); setPage(1); };
    const handleCategoryFilter = (val) => { setCategoryFilter(val); setPage(1); };

    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="page-wrapper animate-fade-in">
            {/* Toast notification */}
            {toast && (
                <div className="toast-notification">✓ {toast}</div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Parts Inventory</h1>
                    <p>Manage all cycle parts and their pricing.</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
                    + Add New Part
                </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="table-toolbar">
                <div className="table-toolbar-search">
                    <span className="table-toolbar-icon">🔍</span>
                    <input
                        id="parts-search-input"
                        className="table-toolbar-input"
                        placeholder="Search parts by name…"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                    />
                    {search && (
                        <button className="table-toolbar-clear" onClick={() => handleSearch('')} aria-label="Clear search">✕</button>
                    )}
                </div>
                <select
                    id="parts-category-filter"
                    className="table-toolbar-select"
                    value={categoryFilter}
                    onChange={e => handleCategoryFilter(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                </select>
                {(search || categoryFilter !== 'all') && (
                    <span className="table-toolbar-count">
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="data-table-wrapper" style={{ flex: 1 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Last Updated</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((p, i) => (
                            <tr key={p.id}>
                                <td className="text-muted" style={{ width: '3rem' }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{p.name}</td>
                                <td>
                                    <span className={`badge badge-${p.category}`}>{p.category}</span>
                                </td>
                                <td style={{ fontWeight: 600 }}>₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                                <td className="text-muted">{new Date(p.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td>
                                    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditPart(p)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => setDeletePart(p)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    {parts.length === 0
                                        ? <>No parts yet. Click <strong>"+ Add New Part"</strong> to get started.</>
                                        : <>No parts match your search. <button className="btn-link" onClick={() => { handleSearch(''); handleCategoryFilter('all'); }}>Clear filters</button></>}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination total={filtered.length} page={page} onPage={setPage} />
            </div>

            {/* Modals */}
            {addOpen && (
                <PartFormModal onClose={() => setAddOpen(false)} onSaved={handleSaved} />
            )}
            {editPart && (
                <PartFormModal initial={editPart} onClose={() => setEditPart(null)} onSaved={handleSaved} />
            )}
            {deletePart && (
                <DeleteModal part={deletePart} onClose={() => setDeletePart(null)} onDeleted={handleDeleted} />
            )}
        </div>
    );
}