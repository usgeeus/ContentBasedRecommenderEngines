const getPagingOptions = (limit, page) => {
    const offset = (page - 1) * limit;

    return { limit, offset };
};

const appendPagingInfo = (data, limit, page) => {
    const { count, rows } = data;
    const totalPages = Math.ceil(count / limit);

    return {
        totalItems: count,
        items: rows,
        totalPages: totalPages,
        currentPage: page,
     };
};


module.exports = {
    getPagingOptions,
    appendPagingInfo
};