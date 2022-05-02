const express = require('express');
const router = express.Router();
const ctrl = require('./smartLibrary.ctrl');

router.get('/', ctrl.getAllSmartLibraries);
router.get('/:smtLibryId', ctrl.getOneSmartLibrary);
router.get('/:smtLibryId/books', ctrl.getAllSmartLibraryBooks);
router.get('/:smtLibryId/books/:smtLibryBookId', ctrl.getOneSmartLibraryBook);
router.put('/:smtLibryId/books/:smtLibryBookId', ctrl.updateSmartLibraryBookStatus);

module.exports = router;