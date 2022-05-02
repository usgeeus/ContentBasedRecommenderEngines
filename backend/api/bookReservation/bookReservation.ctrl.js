const { QueryTypes } = require('sequelize');
const models = require('../../models');
const fetch = require('node-fetch');

const getAllBookReservations = async (req, res) => {
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

    models.BookReservation.findAndCountAll({
        attributes: {
            exclude: ['smLibraryId', 'userId'],
        },
        limit: limit,
        offset: (page - 1) * limit,
        include:[
            {
                model: models.User,
                attributes: ['id', 'name'],
            },
            {
                model: models.SmLibrary,
                attributes: ['id', 'name'],
            },
            {
                model: models.ReservedBook,
                attributes: ['ISBN', 'bookName']
            }
        ],
    }).then((data) => {
        const { count, rows } = data;

        return res.send({
            totalItems: rows.length,
            items: rows,
            totalPages: Math.ceil(rows.length / limit),
            currentPage: page,
        });
    })
};

const getOneBookReservation = async (req, res) => {
    const bookReservationId = parseInt(req.params.bookReservationId, 10);

    if (Number.isNaN(bookReservationId)){
        return res.status(400).end();
    }

    const bookReservationInfo = await models.BookReservation.findOne({
        attributes: {
            exclude: ['smLibraryId', 'userId']
        },
        where: {
            id: bookReservationId
        },
        include:[
            {
                model: models.User,
                attributes: ['id', 'name'],
            },
            {
                model: models.SmLibrary,
                attributes: ['id', 'name'],
            },
        ],
    }).then((data) => {
        if (!data){
            return res.status(404).end();
        }
        
        return data;
    });

    const reservedBooksInfo = await models.sequelize.query(
        `SELECT B.*
            FROM ReservedBooks as RB, Books as B
            WHERE RB.ISBN = B.ISBN AND RB.BookReservationId = ${bookReservationId};
        `,
        { 
            type: QueryTypes.SELECT,
            model: models.Book,
            mapToModel: true,
        }   
    );

    return res.send({
        id: bookReservationInfo.id,
        status: bookReservationInfo.status,
        createdAt: bookReservationInfo.createdAt,
        updatedAt: bookReservationInfo.updatedAt,
        User: bookReservationInfo.User,
        SmLibrary: bookReservationInfo.SmLibrary,
        ReservedBooks: reservedBooksInfo,
    });
};

const updateBookReservationStatus = (req, res) => {
    const bookReservationId = parseInt(req.params.bookReservationId, 10);
    const status = parseInt(req.body.status, 10);

    if (Number.isNaN(bookReservationId) || Number.isNaN(status)){
        return res.status(400).end();
    }

    if (status > 4 || status < 0){
        return res.status(400).end();
    }

    models.BookReservation.findOne({
        attributes:{
            exclude: ['userId', 'smLibraryId']
        },
        where: {
            id: bookReservationId
        }
    }).then((data) => {
        if (!data){
            return res.status(404).end();
        }

        data.status = status;
        data.save().then(() => {
            return res.json(data);
        });
    });
    
};


module.exports = {
    getAllBookReservations,
    getOneBookReservation,
    updateBookReservationStatus
};