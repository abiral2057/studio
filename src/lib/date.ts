import { format } from 'date-fns';

export const formatLedgerDate = (dateString: string) => {
  const date = new Date(dateString);
  
  const englishDate = format(date, 'dd MMM yyyy');
  // Return a placeholder for Nepali date for now
  const nepaliDate = format(date, 'yyyy-MM-dd');

  return {
    englishDate,
    nepaliDate,
  };
};
