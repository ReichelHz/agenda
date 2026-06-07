const DEFAULT_API_URL = 'https://agenda-dirh.onrender.com';

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL
).replace(/\/$/, '');