import { log } from '../logger';
import { rules, validate } from '../middleware/validate';
import { processQuery } from '../utils/processor';

export function routes(app) {
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
}
