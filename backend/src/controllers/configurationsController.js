const configurationsService = require('../services/configurationsService');

class ConfigurationsController {
    async getStats(req, res) {
        const stats = await configurationsService.getStats();
        res.json(stats);
    }

    async getAll(req, res) {
        const configs = await configurationsService.getAllConfigurations();
        res.json(configs);
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
        console.log(req.body)
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
