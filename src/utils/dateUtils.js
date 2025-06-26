/**
 * Formats a date string into a more readable format (e.g., "June 26, 2025").
 * This function is robust and can handle both 'YYYY-MM-DD' and full ISO date strings.
 * @param {string} dateString The date string to format.
 * @returns {string} The formatted date, or 'Invalid Date' if the input is invalid.
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'No Date';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.warn('Invalid date string provided to formatDate:', dateString);
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Assuming dates from DB are UTC to avoid off-by-one day errors
  }).format(date);
}; 