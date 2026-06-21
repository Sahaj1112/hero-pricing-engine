const express = require('express');
const configurationsController = require('../controllers/configurationsController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/stats', asyncHandler((req, res) => configurationsController.getStats(req, res)));
router.get('/', asyncHandler((req, res) => configurationsController.getAll(req, res)));
router.get('/:id', asyncHandler((req, res) => configurationsController.getById(req, res)));
router.post('/', asyncHandler((req, res) => configurationsController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => configurationsController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => configurationsController.remove(req, res)));

module.exports = router;
