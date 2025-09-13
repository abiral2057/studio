import { formatInTimeZone } from 'date-fns-tz';

export const formatLedgerDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // By formatting in UTC, we ensure the date is the same on server and client.
  const englishDate = formatInTimeZone(date, 'UTC', 'dd MMM yyyy');

  return {
    englishDate,
    nepaliDate: '', // Removed nepali date logic
  };
};
