const configurationsService = require('../services/configurationsService');
const { parsePaginationQuery, sendPaginatedResponse } = require('../utils/pagination');

class ConfigurationsController {
    async getStats(req, res) {
        const stats = await configurationsService.getStats();
        res.json(stats);
    }

    async getAll(req, res) {
        const { page, limit, offset, search } = parsePaginationQuery(req.query);

        const result = await configurationsService.getConfigurations({ page, limit, offset, search });
        sendPaginatedResponse(res, result.data, result.pagination);
    }

    async getById(req, res) {
        const config = await configurationsService.getConfigurationById(req.params.id);
        res.json(config);
    }

    async create(req, res) {
        const { name, description, part_ids } = req.body;
        const config = await configurationsService.createConfiguration({
            name,
            description,
            partIds: part_ids,
        });
        res.json(config);
    }

    async update(req, res) {
        const { name, description, part_ids } = req.body;
        const config = await configurationsService.updateConfiguration(req.params.id, {
            name,
            description,
            partIds: part_ids,
        });
        res.json(config);
    }

    async remove(req, res) {
        const result = await configurationsService.deleteConfiguration(req.params.id);
        res.json(result);
    }
}

module.exports = new ConfigurationsController();
