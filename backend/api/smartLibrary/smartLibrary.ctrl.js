const models = require('../../models');
const fetch = require('node-fetch');

const { AUTH_KEY } = process.env;

const getAllSmartLibraries = (req, res) => {
    req.query.limit = req.query.limit || 10;
    req.query.page = req.query.page || 1;

    let limit = parseInt(req.query.limit, 10);
    const page = parseInt(req.query.page, 10);
    
    if (Number.isNaN(limit) || Number.isNaN(page)){
        return res.status(400).end();
    }

    if (limit > 50){
        limit = 50;
    }  

    models.SmLibrary
        .findAndCountAll({
            limit: limit,
            offset: (page - 1) * limit,
        })
        .then((data) => {
            const { count, rows } = data;
            const totalPages = Math.ceil(count / limit);

            res.send({
                totalItems: count,
                items: rows,
                totalPages: totalPages,
                currentPage: page,
             });
        });
};

const getOneSmartLibrary = (req, res) => {
    req.query.analysisInfoYN = req.query.analysisInfoYN || 'N';

    const smtLibryId = parseInt(req.params.smtLibryId, 10);

    if (Number.isNaN(smtLibryId)){
        return res.status(400).end();
    }

    if (['Y', 'y', 'N', 'n'].indexOf(req.query.analysisInfoYN) == -1){
        return res.status(400).end();
    }

    models.SmLibrary
        .findOne({
            where: { id: smtLibryId },
            include: [
                {
                    model: models.Region,
                    attributes: ['name']
                }
            ],
            raw: true
        }).then((data) => {
            if (!data){
                return res.status(404).end();
            }
            
            if (req.query.analysisInfoYN === 'Y'){
                models.sequelize.query(
                    `SELECT classNo DIV 100 AS classNumber, count(*) AS count
                        FROM SmLibraryBooks as SB, Books as B
                        WHERE SB.smtLibraryId = ${smtLibryId} AND SB.ISBN = B.ISBN
                        GROUP BY classNumber
                        ORDER BY classNumber ASC;
                    `,
                    { type: models.QueryTypes.SELECT }
                ).then((analysisInfo) => {
                    res.send({...data, analysisInfo});
                });
            }
            else{
                res.json(data);
            }
        });
};

const getAllSmartLibraryBooks = (req, res) => {
    req.query.limit = req.query.limit || 10;
    req.query.page = req.query.page || 1;
    req.query.sort_by = req.query.sort_by || 'placedAt';
    req.query.order_by = req.query.order_by || 'DESC';

    let limit = parseInt(req.query.limit, 10);
    const page = parseInt(req.query.page, 10);
    const smtLibryId = parseInt(req.params.smtLibryId, 10);

    if (Number.isNaN(limit) || Number.isNaN(page) || Number.isNaN(smtLibryId)){
        return res.status(400).end();
    }

    if (limit > 50){
        limit = 50;
    }

    const sortingCriteria = ['id', 'ISBN', 'bookName', 'classNo', 'smLibraryName', 'reLibraryName', 'placedAt', 'lastLoanedAt', 'loanCnt', 'status'];
    const orderingCriteria = ['ASC', 'asc', 'DESC', 'desc'];

    if (sortingCriteria.indexOf(req.query.sort_by) === -1 ||
        orderingCriteria.indexOf(req.query.order_by) === -1){
        return res.status(400).end();
    }

    models.sequelize.query(
        `SELECT SB.id, SB.ISBN, B.bookName, B.publisher, B.classNo, S.name AS smLibraryName, R.name as reLibraryName, SB.placedAt, SB.lastLoanedAt, SB.loanCnt, SB.status
            FROM SmLibraryBooks as SB, Books as B, SmLibraries as S, ReLibraries as R
            WHERE SB.smtLibraryId = ${smtLibryId} AND SB.ISBN = B.ISBN AND SB.smtLibraryID = S.id AND SB.reLibraryId = R.id
            ORDER BY ${req.query.sort_by} ${req.query.order_by}
            LIMIT ${(page-1)*limit}, ${limit};
        `,
        { type: models.QueryTypes.SELECT }
    ).then((data) => {
        if (data.length === 0){
            return res.status(404).end();
        } 

        res.send({
            totalItems: data.length,
            items: data,
            totalPages: Math.ceil(data.length / limit),
            currentPage: page,
        });
    });
};

const getOneSmartLibraryBook = async (req, res) => {
    const smtLibryId = parseInt(req.params.smtLibryId, 10);
    const smtLibryBookId = parseInt(req.params.smtLibryBookId, 10);

    if (Number.isNaN(smtLibryId) || Number.isNaN(smtLibryBookId)){
        return res.status(400).end();
    }

    const data = await models.SmLibraryBook.findOne({
        attributes: {
            exclude: ['smtLibraryId', 'reLibraryId']
        },
        where: {
            id: smtLibryBookId,
            smtLibraryId: smtLibryId,
        },
        include: [
            {
                model: models.SmLibrary,
                attributes: ['id', 'name']
            },
            {
                model: models.ReLibrary,
                attributes: ['id', 'name']
            },
        ],
    });

    if (!data){
        return res.status(404).end();
    }

    Promise.all([
        models.Book.findOne({ where: { ISBN: data.ISBN }}),
        fetch(`http://data4library.kr/api/usageAnalysisList?authKey=${AUTH_KEY}&isbn13=${data.ISBN}&loaninfoYN=Y&format=json`)
    ]).then(async (datas) => {
        const bookInfo = datas[0];
        const usageAnalysisList = await datas[1].json();

        res.send({
            id: data.id,
            placedAt: data.placedAt,
            lastLoanedAt: data.lastLoanedAt,
            loanCnt: data.loanCnt,
            status: data.status,
            smLibrary: data.SmLibrary,
            reLibrary: data.ReLibrary,
            bookInfo,
            loanHistory: usageAnalysisList.response.loanHistory,
        });
    });
};

const updateSmartLibraryBookStatus = (req, res) => {
    const smtLibryId = parseInt(req.params.smtLibryId, 10);
    const smtLibryBookId = parseInt(req.params.smtLibryBookId, 10);

    if (Number.isNaN(smtLibryId) || Number.isNaN(smtLibryBookId)){
        return res.status(400).end();
    }

    const status = parseInt(req.body.status, 10);

    if (Number.isNaN(status)){
        return res.status(400).end();
    }

    if (status > 4 || status < 0){
        return res.status(400).end();
    }

    models.SmLibraryBook.findOne({
        where: {
            id: smtLibryBookId,
            smtLibraryId: smtLibryId
        }
    }).then((data) => {
        if (!data){
            return res.status(404).end();
        }

        data.status = status;
        data.save().then(() => {
            res.json(data);
        });
    });
}

module.exports = {
    getAllSmartLibraries,
    getOneSmartLibrary,
    getAllSmartLibraryBooks,
    getOneSmartLibraryBook,
    updateSmartLibraryBookStatus,
};