const express = require('express');
const authRoutes = require('./auth.routes');
const partsRoutes = require('./parts.routes');
const configurationsRoutes = require('./configurations.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/parts', partsRoutes);
router.use('/configurations', configurationsRoutes);

module.exports = router;
