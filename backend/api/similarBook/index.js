const express = require('express');
const router = express.Router();
const ctrl = require('./similarBook.ctrl');

router.get('/:ISBN', ctrl.getAllSimilarBooks);

module.exports = router;