const express = require('express');
const partsRoutes = require('./parts.routes');
const configurationsRoutes = require('./configurations.routes');

const router = express.Router();

router.use('/parts', partsRoutes);
router.use('/configurations', configurationsRoutes);

module.exports = router;
