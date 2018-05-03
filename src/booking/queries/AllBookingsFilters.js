// @flow

import { DateTime } from 'luxon';

import type { BookingsItem } from '../Booking';

export function filterOnlyBookings(
  timeFrame: 'future' | 'past',
  bookings: $ReadOnlyArray<BookingsItem>,
) {
  const bookingGroups = bookings.reduce(
    (acc, curVal) => {
      if (isPastBooking(curVal) === true) {
        acc.past.push(curVal);
      } else {
        acc.future.push(curVal);
      }
      return acc;
    },
    {
      future: [],
      past: [],
    },
  );

  if (timeFrame === 'future') {
    return bookingGroups.future;
  }
  return bookingGroups.past;
}

/**
 * Past booking is booking where every arrival date of every leg is in past
 * (considering local time).
 */
export function isPastBooking(singleBooking: BookingsItem) {
  const when = singleBooking.arrival.when;
  if (!when) {
    return true;
  }

  return (
    DateTime.fromJSDate(when.utc, {
      zone: 'utc',
    })
      .diffNow('milliseconds')
      .toObject().milliseconds < 0
  );
}