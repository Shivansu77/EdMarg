export const getImageUrl = (url?: string, defaultName?: string, size = 300) => {
  if (!url || url === 'null' || url === 'undefined') {
    if (defaultName) {
      return `https://ui-avatars.com/api/?background=f1f5f9&color=0f172a&name=${encodeURIComponent(defaultName)}&size=${size}&bold=true`;
    }
    return '/default-avatar.png'; // Or some fallback
  }
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1\/?$/, '');
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
