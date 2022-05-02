const models = require('../models');

module.exports = () => {
    const options = {
        //alter: true,
    };

    return models.sequelize.sync(options);
};