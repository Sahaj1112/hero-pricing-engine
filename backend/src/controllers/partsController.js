const partsService = require('../services/partsService');

class PartsController {
    async getAll(req, res) {
        const parts = await partsService.getAllParts();
        res.json(parts);
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
        const history = await partsService.getPriceHistory(req.params.id);
        res.json(history);
    }
}

module.exports = new PartsController();
