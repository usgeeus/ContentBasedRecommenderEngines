const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const smartLibrary = require('./api/smartLibrary');
const bookReservation = require('./api/bookReservation');
const similarBook = require('./api/similarBook');

if (process.env.NODE_ENV !== 'test'){
    app.use(morgan('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.use('/smtLibrs', smartLibrary);
app.use('/bookReservs', bookReservation);
app.use('/simBooks', similarBook);

module.exports = app;