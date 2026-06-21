const pool = require('../config/database');

const VALID_CATEGORIES = ['frame', 'gear', 'tyre', 'accessory'];

class PartsRepository {
    _buildFilterClause(search, category) {
        const conditions = [];
        const params = [];
        let paramIndex = 1;

        if (search) {
            conditions.push(`(name ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category && category !== 'all' && VALID_CATEGORIES.includes(category)) {
            conditions.push(`category = $${paramIndex}`);
            params.push(category);
            paramIndex++;
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        return { where, params, paramIndex };
    }

    async findPaginated({ search = '', category = '', limit, offset }) {
        const { where, params, paramIndex } = this._buildFilterClause(search, category);

        const result = await pool.query(
            `SELECT * FROM parts ${where} ORDER BY category, name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, limit, offset]
        );
        return result.rows;
    }

    async countFiltered({ search = '', category = '' }) {
        const { where, params } = this._buildFilterClause(search, category);

        const result = await pool.query(
            `SELECT COUNT(*)::int AS cnt FROM parts ${where}`,
            params
        );
        return result.rows[0].cnt;
    }

    async create({ name, category, price }) {
        const result = await pool.query(
            'INSERT INTO parts (name, category, price) VALUES ($1, $2, $3) RETURNING *',
            [name, category, price]
        );
        return result.rows[0];
    }

    async findPriceById(id) {
        const result = await pool.query('SELECT price FROM parts WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async recordPriceChange(partId, oldPrice, newPrice) {
        await pool.query(
            'INSERT INTO price_history (part_id, old_price, new_price) VALUES ($1, $2, $3)',
            [partId, oldPrice, newPrice]
        );
    }

    async update(id, { name, category, price }) {
        const result = await pool.query(
            'UPDATE parts SET name=$1, category=$2, price=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
            [name, category, price, id]
        );
        return result.rows[0] || null;
    }

    async delete(id) {
        await pool.query('DELETE FROM parts WHERE id = $1', [id]);
    }

    async findPriceHistoryPaginated(partId, { search = '', limit, offset }) {
        const params = [partId];
        let where = 'WHERE part_id = $1';

        if (search) {
            params.push(`%${search}%`);
            where += ` AND (old_price::text ILIKE $2 OR new_price::text ILIKE $2)`;
        }

        params.push(limit, offset);
        const limitIdx = params.length - 1;
        const offsetIdx = params.length;

        const result = await pool.query(
            `SELECT * FROM price_history ${where} ORDER BY changed_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
            params
        );
        return result.rows;
    }

    async countPriceHistory(partId, { search = '' }) {
        const params = [partId];
        let where = 'WHERE part_id = $1';

        if (search) {
            params.push(`%${search}%`);
            where += ` AND (old_price::text ILIKE $2 OR new_price::text ILIKE $2)`;
        }

        const result = await pool.query(
            `SELECT COUNT(*)::int AS cnt FROM price_history ${where}`,
            params
        );
        return result.rows[0].cnt;
    }

    async countAll() {
        const result = await pool.query('SELECT COUNT(*)::int AS cnt FROM parts');
        return result.rows[0].cnt;
    }
}

module.exports = new PartsRepository();
