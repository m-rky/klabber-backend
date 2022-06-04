import { log } from './logger';
import { routes } from './routes';

const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const basicAuth = require('express-basic-auth');
const helmet = require('helmet');

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

app.use(
  basicAuth({ users: { admin: process.env.CLIENT_KEY }, unauthorizedResponse: { error: 'Missing Headers' } }),
  (req, res, next) => {
    next();
  },
);
app.use(helmet());

try {
  app.listen(process.env.PORT || 3205, () => {
    log.info(`Successfully connected to: http://localhost:${process.env.PORT || 3205}`);

    routes(app);
  });
} catch (error) {
  log.error(`Error occurred: ${error.message}`);
}

module.exports = app;
