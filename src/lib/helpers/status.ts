export function formatStatusTime(updatedAt: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(updatedAt));
}

export function getStatusLabel(stale: boolean, updatedAt: string | null): string {
  if (!updatedAt) {
    return 'LOADING';
  }

  return `${stale ? 'STALE' : 'LIVE'} ${formatStatusTime(updatedAt)}`;
}
