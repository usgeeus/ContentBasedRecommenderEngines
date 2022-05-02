const { QueryTypes } = require('sequelize');
const models = require('../../models');
const fetch = require('node-fetch');

const getAllSimilarBooks = async (req, res) => {
    req.query.limit = req.query.limit || 20;

    let limit = parseInt(req.query.limit);
    const ISBN = parseInt(req.params.ISBN);

    if (Number.isNaN(limit) || Number.isNaN(ISBN)){
        return res.status(400).end();
    }

    if (limit > 100){
        limit = 100;
    }

    const targetBookInfo = await models.Book.findOne({
        where: {
            ISBN: ISBN,
        },
    }).then((data) => {
        if (!data){
            return res.status(404).end();
        }

        return data.toJSON();
    });

    models.sequelize.query(
        `SELECT B.*, SB.ranking
            FROM SimilarBooks AS SB, Books AS B
            WHERE SB.similarBookISBN = B.ISBN AND SB.targetBookISBN = ${ISBN} AND SB.ranking <= ${limit}
            ORDER BY SB.ranking ASC
        `,
        {
            type: QueryTypes.SELECT
        }
    ).then((data) => {
        
        return res.send({
            targetBook: targetBookInfo,
            similarBooks: data,
        });
    });
};

module.exports = {
    getAllSimilarBooks,
};