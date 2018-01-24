// @flow

import DataLoader from 'dataloader';

import type { SearchParameters } from './flow/SearchParameters';
import {
  prepareRequestParameters,
  prepareRoomsRequestParameters,
} from '../services/ParametersFormatter';
import { queryWithParameters } from '../../../config/application';
import { get } from '../services/BookingComRequest';

const PriceStats = async (
  searchParams: SearchParameters,
  boundary: 'MAX' | 'MIN',
) => {
  const parameters = prepareRequestParameters(searchParams);
  const absoluteUrl = queryWithParameters(
    'https://distribution-xml.booking.com/2.0/json/hotelAvailability',
    {
      ...parameters,
      ...prepareRoomsRequestParameters(searchParams.roomsConfiguration),
      order_dir: boundary === 'MAX' ? 'desc' : 'asc',
      order_by: 'price',
      currency: 'EUR', // current limitation, price filter range works only with EUR
      rows: 1,
      offset: 0,
    },
  );
  const response = await get(absoluteUrl);

  return response.result.map(hotel => hotel.price);
};

export default new DataLoader(async (keys): Promise<Array<number | Error>> => {
  return Promise.all(
    keys.map(({ searchParams, boundary }) =>
      PriceStats(searchParams, boundary),
    ),
  );
});