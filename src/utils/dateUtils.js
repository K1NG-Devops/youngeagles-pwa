export const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 