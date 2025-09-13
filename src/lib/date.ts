import NepaliDate from "nepali-date-converter";

export const formatLedgerDate = (dateString: string) => {
  const date = new Date(dateString);
  const englishDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  
  const nepaliDate = new NepaliDate(date);
  const nepaliDateString = nepaliDate.format("DD MMMM, YYYY", "np");

  return {
    englishDate,
    nepaliDate: nepaliDateString,
  };
};
