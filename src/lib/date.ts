import NepaliDate from "nepali-date-converter";

export const formatLedgerDate = (dateString: string) => {
  const date = new Date(dateString);
  const englishDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  
  // By creating the NepaliDate from UTC components, we avoid timezone-related hydration errors.
  const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const nepaliDate = new NepaliDate(utcDate);
  const nepaliDateString = nepaliDate.format("DD MMMM, YYYY", "np");

  return {
    englishDate,
    nepaliDate: nepaliDateString,
  };
};
