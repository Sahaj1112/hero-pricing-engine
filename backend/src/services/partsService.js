const partsRepository = require('../repositories/partsRepository');
const AppError = require('../utils/AppError');
const { buildPaginationMeta } = require('../utils/pagination');

class PartsService {
    async getParts({ page, limit, offset, search, category }) {
        const [data, totalRecords] = await Promise.all([
            partsRepository.findPaginated({ search, category, limit, offset }),
            partsRepository.countFiltered({ search, category }),
        ]);

        return {
            data,
            pagination: buildPaginationMeta(page, limit, totalRecords),
        };
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

    async getPriceHistory(id, { page, limit, offset, search }) {
        const [data, totalRecords] = await Promise.all([
            partsRepository.findPriceHistoryPaginated(id, { search, limit, offset }),
            partsRepository.countPriceHistory(id, { search }),
        ]);

        return {
            data,
            pagination: buildPaginationMeta(page, limit, totalRecords),
        };
    }
}

module.exports = new PartsService();
