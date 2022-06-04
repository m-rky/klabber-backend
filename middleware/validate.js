import { log } from '../logger';

const query = require('express-validator');
const validationResult = require('express-validator');

export const rules = () => {
  return [
    query('search')
      .notEmpty()
      .isAlphanumeric('en-US', { ignore: ` -?` })
      .isLength({ min: 8 })
      .isString()
      .trim()
      .escape(),
  ];
};

export const validate = (req, res, next) => {
  log.info('Started validation');

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
    return;
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  log.info(errors);
  return res.status(422).json({ errors: extractedErrors });
};
