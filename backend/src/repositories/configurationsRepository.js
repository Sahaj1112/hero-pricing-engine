const pool = require('../config/database');

class ConfigurationsRepository {
    async findAllEnriched() {
        const result = await pool.query(`
            SELECT
                c.id,
                c.name,
                c.description,
                c.created_at,
                COUNT(cp.part_id)::int                        AS part_count,
                COALESCE(SUM(p.price), 0)::numeric(10,2)     AS total_price
            FROM configurations c
            LEFT JOIN config_parts cp ON cp.config_id = c.id
            LEFT JOIN parts        p  ON p.id = cp.part_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);
        return result.rows;
    }

    async findAll() {
        const result = await pool.query(
            'SELECT * FROM configurations ORDER BY created_at DESC'
        );
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query('SELECT * FROM configurations WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findPartsByConfigId(configId) {
        const result = await pool.query(
            `SELECT p.* FROM parts p
             JOIN config_parts cp ON cp.part_id = p.id
             WHERE cp.config_id = $1`,
            [configId]
        );
        return result.rows;
    }

    async createWithParts({ name, description, partIds }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const config = await client.query(
                'INSERT INTO configurations (name, description) VALUES ($1, $2) RETURNING *',
                [name, description]
            );
            const configId = config.rows[0].id;

            for (const partId of partIds) {
                await client.query(
                    'INSERT INTO config_parts (config_id, part_id) VALUES ($1, $2)',
                    [configId, partId]
                );
            }

            await client.query('COMMIT');
            return config.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async delete(id) {
        await pool.query('DELETE FROM configurations WHERE id = $1', [id]);
    }
}

module.exports = new ConfigurationsRepository();
