const partsService = require('../services/partsService');
const { parsePaginationQuery, sendPaginatedResponse } = require('../utils/pagination');

class PartsController {
    async getAll(req, res) {
        const { page, limit, offset, search } = parsePaginationQuery(req.query);
        const category = (req.query.category || '').trim();

        const result = await partsService.getParts({ page, limit, offset, search, category });
        sendPaginatedResponse(res, result.data, result.pagination);
    }

    async create(req, res) {
        const part = await partsService.createPart(req.body);
        res.json(part);
    }

    async update(req, res) {
        const part = await partsService.updatePart(req.params.id, req.body);
        res.json(part);
    }

    async remove(req, res) {
        const result = await partsService.deletePart(req.params.id);
        res.json(result);
    }

    async getHistory(req, res) {
        const { page, limit, offset, search } = parsePaginationQuery(req.query);

        const result = await partsService.getPriceHistory(req.params.id, {
            page,
            limit,
            offset,
            search,
        });
        sendPaginatedResponse(res, result.data, result.pagination);
    }
}

module.exports = new PartsController();
