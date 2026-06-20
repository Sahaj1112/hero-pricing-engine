const express = require('express');
const partsController = require('../controllers/partsController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler((req, res) => partsController.getAll(req, res)));
router.post('/', asyncHandler((req, res) => partsController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => partsController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => partsController.remove(req, res)));
router.get('/:id/history', asyncHandler((req, res) => partsController.getHistory(req, res)));

module.exports = router;
