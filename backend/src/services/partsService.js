const partsRepository = require('../repositories/partsRepository');
const AppError = require('../utils/AppError');

class PartsService {
    async getAllParts() {
        return partsRepository.findAll();
    }

    async createPart(data) {
        return partsRepository.create(data);
    }

    async updatePart(id, data) {
        const existing = await partsRepository.findPriceById(id);
        if (!existing) {
            throw new AppError('Part not found', 404);
        }

        await partsRepository.recordPriceChange(id, existing.price, data.price);
        const updated = await partsRepository.update(id, data);
        return updated;
    }

    async deletePart(id) {
        await partsRepository.delete(id);
        return { message: 'Part deleted' };
    }

    async getPriceHistory(id) {
        return partsRepository.findPriceHistory(id);
    }
}

module.exports = new PartsService();
