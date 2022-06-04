const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const basicAuth = require('express-basic-auth');
const helmet = require('helmet');

const { log } = require('./logger');
const { validate } = require('./middleware/validate');
const { rules } = require('./middleware/validate');
const { processQuery } = require('./utils/processor');

dotenv.config();

const app = express();
// Cors
const allowedOrigins = ['http://localhost:3000'];
const options = {
  origin: allowedOrigins,
  credentials: true,
};

// Middleware
app.use(cors(options));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(basicAuth({ users: { admin: process.env.CLIENT_KEY } }), (req, res, next) => {
  next();
});
app.use(helmet());

app.post('/wit', rules(), validate, async (req, res) => {
  try {
    const response = await processQuery(req.query.search);
    if (response !== undefined) {
      const { data } = response;
      const { results } = data;
      return res.status(200).send(results);
    }
    res.status(400).send('Undefined response');
    throw new Error('Response is undefined');
  } catch (error) {
    log.error(error.message);
  }
});

module.exports = app;
