const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Hero Cycles API running ✅' }));
app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
