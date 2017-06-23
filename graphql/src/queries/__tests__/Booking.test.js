// @flow

import { Booking as BookingDataset } from '../../datasets';
import { graphql, RestApiMock } from '../../services/TestingTools';
import config from '../../../config/application';
import Booking from '../Booking';

beforeEach(() => {
  RestApiMock.onGet(config.restApiEndpoint.allBookings).replyWithData(
    BookingDataset.all,
  );

  ['CDG', 'LGW'].forEach(iata => {
    RestApiMock.onGet(
      config.restApiEndpoint.allLocations({
        term: iata,
      }),
    ).replyWithData({
      locations: [
        {
          id: 'MOCKED',
          city: {
            name: 'Mocked City Name',
          },
        },
      ],
    });
  });
});

describe('single booking query', () => {
  it('should be of Booking type', () => {
    expect(Booking.type.toString()).toBe('Booking');
  });

  it('should return valid fields', async () => {
    const arrivalQuery = `{
      booking(id: 2707251) {
        arrival {
          airport { city { name }, locationId }
        }
        departure {
          airport { city { name }, locationId }
        }
        legs {
          arrival {
            airport { city { name }, locationId }
          }
          departure {
            airport { city { name }, locationId }
          }
        }
      }
    }`;
    expect(await graphql(arrivalQuery)).toMatchSnapshot();
  });
});
