import axios, { AxiosResponse } from 'axios';

import { log } from '../logger';
import type { ExportedObject } from './processor';

// TODO: Format this section to be more maintainable... things are getting passed around a bit too much

const bodyExtractor = (body) => {
  const arrayOfStrings = body.split(' ');
  // getting rid of redundant words like "by"
  const triggers = new Set(['by', 'game']);
  const formatted = arrayOfStrings.filter((string) => !triggers.has(string));
  return formatted.join('');
};

const stringConstructor = (role, value) => {
  const items = [];
  const ratings = value.split('-');
  switch (role) {
    case 'aspect_of_game': {
      const getAspect = bodyExtractor(value);
      items.push(`tags=${getAspect as string}`);
      break;
    }
    case 'daterange': {
      const dateArray = value.split(' ');
      const triggers = new Set(['early', 'late']);
      const year = dateArray.find((date) => !triggers.has(date));
      // TODO: have to handle if someone enters a year like "early 2001" which should only change the months
      let final: string;
      const monthDayFillerStart = '-01-01';
      const monthDayFillerEnd = '-12-31';
      if (dateArray.includes('early')) {
        final = `${Number(year)}${monthDayFillerStart},${Number(year) + 5}${monthDayFillerEnd}`;
        items.push(`dates=${final}`);
      } else if (dateArray.includes('late')) {
        final = `${Number(year) + 5}-01-01,${Number(year) + 10}-12-31`;
        items.push(`dates=${final}`);
      } else if (value.length === 3) {
        const numbers = value.replace(/\D/u, '');
        // handling the shorthand decades
        // 40 because games were made after 1950
        if (Number(numbers) > 40) {
          items.push(`dates=19${numbers as string}${monthDayFillerStart},19${Number(numbers) + 9}${monthDayFillerEnd}`);
        } else {
          if (numbers === '00') {
            // fix for the year 2000, it was producing 209
            items.push(
              `dates=20${numbers as string}${monthDayFillerStart},200${Number(numbers) + 9}${monthDayFillerEnd}`,
            );
          }
          items.push(`dates=20${numbers as string}${monthDayFillerStart},20${Number(numbers) + 9}${monthDayFillerEnd}`);
        }
      }
      break;
    }
    case 'developer_of_game': {
      items.push(`developers=${value as string}`);
      break;
    }
    case 'publisher_of_game': {
      items.push(`publishers=${value as string}`);
      break;
    }
    case 'genre_of_game': {
      const getGenre = bodyExtractor(value);
      items.push(`genres=${getGenre as string}`);
      break;
    }
    case 'platform_of_game': {
      items.push(`platforms=${value as string}`);
      break;
    }
    case 'rating_of_game':
      items.push(`metacritic=${ratings.join(',') as string}`);
      break;
    case 'series_of_game':
      // TODO: handle series
      // handle special series case
      break;
    default:
      break;
  }
  return items;
};

export async function search(finalizedObject: ExportedObject[]): Promise<AxiosResponse> {
  log.info('Starting search...');
  const baseUrl = `https://api.rawg.io/api/games?key=${process.env.RAWG_KEY}&`;

  const itemToProcess = [];
  finalizedObject.map((element) => {
    if (Array.isArray(element)) {
      element.forEach((el) => {
        const { id, role, value } = el;
        const check = itemToProcess.findIndex((x) => x.role === role);
        if (check === -1) {
          itemToProcess.push({ id, role, value });
        } else if (check >= 0) {
          const previousValue = itemToProcess[check].value;
          const editedValue = `${value as string},${previousValue as string}`;
          itemToProcess[check].value = editedValue;
        }
      });
    }
  });

  try {
    const options = `&exclude_additions=true&ordering=-metacritic`;

    const filtered = itemToProcess.filter((item) => item !== undefined);
    // console.log('FILTERED:', filtered);

    const formatted = filtered.map(({ role, value }) => stringConstructor(role, value)).join('&');
    return await axios.get(`${baseUrl}${formatted}${options}`);
  } catch (error) {
    log.error(error.message);
  }
}
