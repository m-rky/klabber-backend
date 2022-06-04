const axios = require('axios');

const { log } = require('../logger');
const { search } = require('./search');

const processQuery = async (query) => {
  log.info('Starting processing...');
  try {
    const res = await axios.get(`https://api.wit.ai/message?v=20210705&q=${encodeURI(query)}`, {
      headers: {
        Authorization: `Bearer ${process.env.WIT_TOKEN}`,
      },
    });
    const { data } = res;
    const test = Object.keys(data).length > 0 && Object.keys(data.entities).length > 0 && data.constructor === Object;

    if (test) {
      const { intents, entities } = data;

      if (intents[0]?.name === 'find_games' && intents[0]?.confidence >= 0.5) {
        const finalized = [];
        for (const [key] of Object.entries(entities)) {
          switch (key) {
            case 'aspect_of_game:aspect_of_game':
              finalized.push(entities[key]);
              break;
            case 'character_of_game:character_of_game':
              finalized.push(entities[key]);
              break;
            case 'class_of_game:class_of_game':
              finalized.push(entities[key]);
              break;
            case 'developer_of_game:developer_of_game':
              finalized.push(entities[key]);
              break;
            case 'publisher_of_game:publisher_of_game':
              finalized.push(entities[key]);
              break;
            case 'date_of_game:date_of_game':
              finalized.push(entities[key]);
              break;
            case 'engine_of_game:engine_of_game':
              finalized.push(entities[key]);
              break;
            case 'genre_of_game:genre_of_game':
              finalized.push(entities[key]);
              break;
            case 'platform_of_game:platform_of_game':
              finalized.push(entities[key]);
              break;
            case 'rating_of_game:rating_of_game':
              finalized.push(entities[key]);
              break;
            case 'series_of_game:series_of_game':
              finalized.push(entities[key]);
              break;
            case 'setting_of_game:setting_of_game':
              finalized.push(entities[key]);
              break;
            case 'status_of_game:status_of_game':
              finalized.push(entities[key]);
              break;
            case 'daterange:daterange':
              finalized.push(entities[key]);
              break;
            default:
              break;
          }
        }
        return await search(finalized);
      }
    }

    throw new Error(`Question didn't make sense`);
  } catch (error) {
    log.error(`From within processQuery: ${error.message}`);
  }
};

exports.processQuery = processQuery;
