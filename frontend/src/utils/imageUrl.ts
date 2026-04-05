const withVersion = (value: string, version?: number) => {
  if (!version) {
    return value;
  }

  const separator = value.includes('?') ? '&' : '?';
  return `${value}${separator}v=${version}`;
};

export const getImageUrl = (url?: string, defaultName?: string, size = 300, version?: number) => {
  if (!url || url === 'null' || url === 'undefined') {
    if (defaultName) {
      return `https://ui-avatars.com/api/?background=f1f5f9&color=0f172a&name=${encodeURIComponent(defaultName)}&size=${size}&bold=true`;
    }
    return '/default-avatar.png'; // Or some fallback
  }
  if (url.startsWith('http') || url.startsWith('data:')) {
    return withVersion(url, version);
  }
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1\/?$/, '');
  return withVersion(`${API_URL}${url.startsWith('/') ? '' : '/'}${url}`, version);
};
