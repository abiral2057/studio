import { formatInTimeZone } from 'date-fns-tz';
import NepaliDate from 'nepali-date-converter';

export const formatLedgerDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // By formatting in UTC, we ensure the date is the same on server and client.
  const englishDate = formatInTimeZone(date, 'UTC', 'dd MMM yyyy');

  // To prevent hydration errors, we construct the NepaliDate from UTC parts.
  const nepaliDateObj = new NepaliDate(date);
  const nepaliDate = nepaliDateObj.format('DD MMMM, YYYY');

  return {
    englishDate,
    nepaliDate,
  };
};
