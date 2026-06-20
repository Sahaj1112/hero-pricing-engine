const pool = require('../config/database');

class PartsRepository {
    async findAll() {
        const result = await pool.query('SELECT * FROM parts ORDER BY category, name');
        return result.rows;
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

    async findPriceHistory(partId) {
        const result = await pool.query(
            'SELECT * FROM price_history WHERE part_id = $1 ORDER BY changed_at DESC',
            [partId]
        );
        return result.rows;
    }

    async countAll() {
        const result = await pool.query('SELECT COUNT(*)::int AS cnt FROM parts');
        return result.rows[0].cnt;
    }
}

module.exports = new PartsRepository();
