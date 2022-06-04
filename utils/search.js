import { log } from '../logger';

const axios = require('axios');

const bodyExtractor = (body) => {
  const arrayOfStrings = body.split(' ');
  const triggers = ['by', 'game'];
  const formatted = arrayOfStrings.filter((string) => !triggers.has(string));
  return formatted.join('');
};

const stringConstructor = (role, value) => {
  const items = [];
  const ratings = value.split('-');
  switch (role) {
    case 'aspect_of_game': {
      const getAspect = bodyExtractor(value);
      items.push(`tags=${getAspect}`);
      break;
    }
    case 'daterange': {
      const dateArray = value.split(' ');
      const triggers = ['early', 'late'];
      const year = dateArray.find((date) => !triggers.has(date));
      let final;
      const monthDayFillerStart = '-01-01';
      const monthDayFillerEnd = '-12-31';
      if (dateArray.includes('early')) {
        final = `${Number(year)}${monthDayFillerStart},${Number(year) + 5}${monthDayFillerEnd}`;
        items.push(`dates=${final}`);
      } else if (dateArray.includes('late')) {
        final = `${Number(year) + 5}-01-01,${Number(year) + 10}-12-31`;
        items.push(`dates=${final}`);
        // eslint-disable-next-line sonarjs/elseif-without-else
      } else if (value.length === 3) {
        const numbers = value.replace(/\D/u, '');
        // handling the shorthand decades
        // 40 because games were made after 1950
        if (Number(numbers) > 40) {
          items.push(`dates=19${numbers}${monthDayFillerStart},19${Number(numbers) + 9}${monthDayFillerEnd}`);
        } else {
          if (numbers === '00') {
            // fix for the year 2000, it was producing 209
            items.push(`dates=20${numbers}${monthDayFillerStart},200${Number(numbers) + 9}${monthDayFillerEnd}`);
          }
          items.push(`dates=20${numbers}${monthDayFillerStart},20${Number(numbers) + 9}${monthDayFillerEnd}`);
        }
      }
      break;
    }
    case 'developer_of_game': {
      items.push(`developers=${value}`);
      break;
    }
    case 'publisher_of_game': {
      items.push(`publishers=${value}`);
      break;
    }
    case 'genre_of_game': {
      const getGenre = bodyExtractor(value);
      items.push(`genres=${getGenre}`);
      break;
    }
    case 'platform_of_game': {
      items.push(`platforms=${value}`);
      break;
    }
    case 'rating_of_game':
      items.push(`metacritic=${ratings.join(',')}`);
      break;
    case 'series_of_game':
      break;
    default:
      break;
  }
  return items;
};

export async function search(finalizedObject) {
  log.info('Starting search...');
  const baseUrl = `https://api.rawg.io/api/games?key=${process.env.RAWG_KEY}&`;

  const itemToProcess = [];
  // eslint-disable-next-line array-callback-return
  finalizedObject.map((element) => {
    if (Array.isArray(element)) {
      element.forEach((el) => {
        const { id, role, value } = el;
        const check = itemToProcess.findIndex((x) => x.role === role);
        if (check === -1) {
          itemToProcess.push({ id, role, value });
          // eslint-disable-next-line sonarjs/elseif-without-else
        } else if (check >= 0) {
          const previousValue = itemToProcess[check].value;
          const editedValue = `${value},${previousValue}`;
          itemToProcess[check].value = editedValue;
        }
      });
    }
  });

  try {
    const options = `&exclude_additions=true&ordering=-metacritic`;
    const filtered = itemToProcess.filter((item) => item !== undefined);
    const formatted = filtered.map(({ role, value }) => stringConstructor(role, value)).join('&');
    return await axios.get(`${baseUrl}${formatted}${options}`);
  } catch (error) {
    log.error(error.message);
  }
}
