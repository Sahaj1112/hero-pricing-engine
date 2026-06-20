const configurationsRepository = require('../repositories/configurationsRepository');
const partsRepository = require('../repositories/partsRepository');
const AppError = require('../utils/AppError');

class ConfigurationsService {
    async getStats() {
        const [configs, totalParts] = await Promise.all([
            configurationsRepository.findAllEnriched(),
            partsRepository.countAll(),
        ]);

        const totalConfigs = configs.length;
        const avgPrice = totalConfigs
            ? configs.reduce((sum, row) => sum + parseFloat(row.total_price), 0) / totalConfigs
            : 0;

        const mostExpensive = configs.reduce(
            (best, row) =>
                parseFloat(row.total_price) > (best ? parseFloat(best.total_price) : -Infinity)
                    ? row
                    : best,
            null
        );

        return {
            total_parts: totalParts,
            total_configs: totalConfigs,
            avg_price: avgPrice,
            most_expensive: mostExpensive,
            configs,
        };
    }

    async getAllConfigurations() {
        return configurationsRepository.findAll();
    }

    async getConfigurationById(id) {
        const config = await configurationsRepository.findById(id);
        if (!config) {
            throw new AppError('Not found', 404);
        }

        const parts = await configurationsRepository.findPartsByConfigId(id);
        const totalPrice = parts.reduce((sum, part) => sum + parseFloat(part.price), 0);

        return {
            ...config,
            parts,
            total_price: totalPrice,
        };
    }

    async createConfiguration(data) {
        return configurationsRepository.createWithParts(data);
    }

    async deleteConfiguration(id) {
        await configurationsRepository.delete(id);
        return { message: 'Configuration deleted' };
    }
}

module.exports = new ConfigurationsService();
