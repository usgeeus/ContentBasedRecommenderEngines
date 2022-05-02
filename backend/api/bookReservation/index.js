const express = require('express');
const router = express.Router();
const ctrl = require('./bookReservation.ctrl');

router.get('/', ctrl.getAllBookReservations);
router.get('/:bookReservationId', ctrl.getOneBookReservation);
router.put('/:bookReservationId', ctrl.updateBookReservationStatus);

module.exports = router;