import { Application, Request, Response } from 'express';

import { log } from './logger';
import { rules, validate } from './middleware/validate';
import { processQuery } from './utils/processor';

export function routes(app: Application): void {
  app.post('/wit', rules(), validate, async (req: Request, res: Response) => {
    try {
      const response = await processQuery(req.query.search as string);
      if (response !== undefined) {
        const { data } = response;
        const { results, next, count } = data;
        return res.status(200).send(results);
      }
      res.status(400).send('Undefined response');
      throw new Error('Response is undefined');
    } catch (error) {
      log.error(error.message);
    }
  });
}
