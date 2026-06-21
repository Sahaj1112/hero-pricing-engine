export default function Pagination({ pagination, onPage, loading = false }) {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, limit, totalRecords, totalPages, hasNextPage, hasPreviousPage } = pagination;
    const from = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, totalRecords);

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, i, arr) => {
            if (i > 0 && arr[i - 1] !== p - 1) acc.push('…');
            acc.push(p);
            return acc;
        }, []);

    return (
        <div className="pagination">
            <span className="pagination-info">
                {loading ? 'Loading…' : `Showing ${from}–${to} of ${totalRecords}`}
            </span>
            <div className="pagination-controls">
                <button className="pagination-btn" onClick={() => onPage(1)} disabled={!hasPreviousPage || loading}>«</button>
                <button className="pagination-btn" onClick={() => onPage(page - 1)} disabled={!hasPreviousPage || loading}>‹</button>
                {pages.map((p, i) =>
                    p === '…'
                        ? <span key={`e${i}`} className="pagination-btn" style={{ border: 'none' }}>…</span>
                        : <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)} disabled={loading}>{p}</button>
                )}
                <button className="pagination-btn" onClick={() => onPage(page + 1)} disabled={!hasNextPage || loading}>›</button>
                <button className="pagination-btn" onClick={() => onPage(totalPages)} disabled={!hasNextPage || loading}>»</button>
            </div>
        </div>
    );
}
