import { Request, Response, NextFunction } from 'express';
import { query, ValidationChain, validationResult } from 'express-validator';

import { log } from '../logger';

export const rules = (): ValidationChain[] => {
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

export const validate = (req: Request, res: Response, next: NextFunction): Response => {
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
