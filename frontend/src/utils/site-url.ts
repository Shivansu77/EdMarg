const FALLBACK_SITE_URL = 'https://edmarg.com';

const normalizeSiteUrl = (value?: string) => {
  if (!value) {
    return FALLBACK_SITE_URL;
  }

  try {
    const parsed = new URL(value);
    return parsed.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
};

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const SITE_HOSTNAME = new URL(SITE_URL).hostname;
