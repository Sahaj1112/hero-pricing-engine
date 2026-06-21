const pool = require('../config/database');

class ConfigurationsRepository {
    _buildSearchClause(search) {
        if (!search) {
            return { where: '', params: [], paramIndex: 1 };
        }

        return {
            where: 'WHERE (c.name ILIKE $1 OR c.description ILIKE $1)',
            params: [`%${search}%`],
            paramIndex: 2,
        };
    }

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

    async findPaginated({ search = '', limit, offset }) {
        const { where, params, paramIndex } = this._buildSearchClause(search);

        const result = await pool.query(
            `SELECT c.* FROM configurations c ${where} ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, limit, offset]
        );
        return result.rows;
    }

    async countFiltered({ search = '' }) {
        const { where, params } = this._buildSearchClause(search);

        const result = await pool.query(
            `SELECT COUNT(*)::int AS cnt FROM configurations c ${where}`,
            params
        );
        return result.rows[0].cnt;
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

    async updateWithParts(id, { name, description, partIds }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const config = await client.query(
                'UPDATE configurations SET name = $1, description = $2 WHERE id = $3 RETURNING *',
                [name, description, id]
            );
            if (config.rows.length === 0) throw new Error('Not found');

            await client.query('DELETE FROM config_parts WHERE config_id = $1', [id]);
            for (const partId of partIds) {
                await client.query(
                    'INSERT INTO config_parts (config_id, part_id) VALUES ($1, $2)',
                    [id, partId]
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

    async findByName(name, excludeId = null) {
        let query = 'SELECT * FROM configurations WHERE LOWER(name) = LOWER($1)';
        const params = [name];
        
        if (excludeId) {
            query += ' AND id != $2';
            params.push(excludeId);
        }
        
        const result = await pool.query(query, params);
        return result.rows[0] || null;
    }
}

module.exports = new ConfigurationsRepository();
