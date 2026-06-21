function parsePaginationQuery(query, { defaultLimit = 10, maxLimit = 100 } = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
    const offset = (page - 1) * limit;
    const search = (query.search || '').trim();

    return { page, limit, offset, search };
}

function buildPaginationMeta(page, limit, totalRecords) {
    const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit);

    return {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}

function sendPaginatedResponse(res, data, pagination) {
    res.json({
        success: true,
        data,
        pagination,
    });
}

module.exports = {
    parsePaginationQuery,
    buildPaginationMeta,
    sendPaginatedResponse,
};
