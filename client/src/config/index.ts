/**
 * =======================================================================
 * Production-Ready Runtime Configuration System
 * =======================================================================
 *
 * In Production (Docker / Nginx), values can be altered directly inside
 * 'public/config.json' without rebuilding the frontend bundle (zero rebuilds).
 *
 * Architecture:
 * 1. Build-time fallback (via import.meta.env) for offline dev & tests.
 * 2. Async runtime loader (loadAppConfig) called in main.tsx before React mounts.
 * 3. Dynamic cache-busting timestamp to bypass CDN / browser HTTP cache.
 * 4. Immutable singleton export for simple, type-safe imports anywhere in the app.
 */

export interface AppConfig {
  apiUrl: string;
  api?: {
    baseUrl: string;
    timeoutMs?: number;
  };
  app: {
    name: string;
    nameEn: string;
    tagline: string;
    badge: string;
    defaultCity: string;
    supportedCities: string[];
  };
  branding?: {
    name: string;
    nameEn: string;
    tagline: string;
    badge: string;
  };
  geo?: {
    defaultCity: string;
    supportedCities: string[];
  };
  contact: {
    phone: string;
    phoneDisplay: string;
    phoneTel: string;
    whatsappUrl: string;
    email: string;
    emailMailto: string;
    address: string;
    workingHours: string;
  };
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    whatsapp: string;
  };
  features: {
    enableRegistration: boolean;
    enableCitySelector: boolean;
    enableNewsletter: boolean;
    enableMapIntegration: boolean;
    maintenanceMode: boolean;
  };
  keys: {
    locationIqApiKey: string;
  };
  storage: {
    userKey: string;
    jwtCookie: string;
    themeKey: string;
  };
  env: {
    isDev: boolean;
    isProd: boolean;
    mode: string;
  };
  $metadata?: {
    version?: string;
    description?: string;
  };
}

function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

function formatPhoneTel(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `tel:+20${cleaned.slice(1)}`;
  }
  return `tel:+${cleaned}`;
}

function formatWhatsappUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `https://wa.me/20${cleaned.slice(1)}`;
  }
  return `https://wa.me/${cleaned}`;
}

const fallbackConfig: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://localhost:7223/api',
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://localhost:7223/api',
    timeoutMs: 15000,
  },
  app: {
    name: 'لمه مبرمجين',
    nameEn: 'DevMeet Egypt',
    tagline: 'Connect, Learn & Grow with Egyptian Tech Communities',
    badge: 'Egypt Dev Community 🇪🇬',
    defaultCity: 'Cairo',
    supportedCities: ['Cairo', 'Alexandria', 'Giza', 'El Gouna', 'Dahab', 'Sahel', 'Mansoura', 'Assiut'],
  },
  branding: {
    name: 'لمه مبرمجين',
    nameEn: 'DevMeet Egypt',
    tagline: 'Connect, Learn & Grow with Egyptian Tech Communities',
    badge: 'Egypt Dev Community 🇪🇬',
  },
  geo: {
    defaultCity: 'Cairo',
    supportedCities: ['Cairo', 'Alexandria', 'Giza', 'El Gouna', 'Dahab', 'Sahel', 'Mansoura', 'Assiut'],
  },
  contact: {
    phone: '01016659869',
    phoneDisplay: '0101 665 9869',
    phoneTel: 'tel:+201016659869',
    whatsappUrl: 'https://wa.me/201016659869',
    email: 'support@devmeet.com',
    emailMailto: 'mailto:support@devmeet.com',
    address: 'The Greek Campus, Downtown Cairo, Egypt',
    workingHours: 'Sat - Thu: 9:00 AM - 6:00 PM',
  },
  socials: {
    github: 'https://github.com/ahmed-Basal/Event-Hub',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    facebook: 'https://facebook.com',
    whatsapp: 'https://wa.me/201016659869',
  },
  features: {
    enableRegistration: true,
    enableCitySelector: true,
    enableNewsletter: true,
    enableMapIntegration: true,
    maintenanceMode: false,
  },
  keys: {
    locationIqApiKey: import.meta.env.VITE_LOCATIONIQ_API_KEY || 'pk.45e9ac96fc4487ad1f59f38cc6e357e2',
  },
  storage: {
    userKey: '__dm_usr_sess_v1',
    jwtCookie: '__Secure-dm_auth_tkn',
    themeKey: '__dm_pref_thm',
  },
  env: {
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  },
};

function normalizeConfig(raw: Record<string, any>, fallback: AppConfig): AppConfig {
  const rawApiUrl = raw.api?.baseUrl || raw.apiUrl || fallback.apiUrl;
  const rawBranding = raw.branding || raw.app || fallback.branding;
  const rawGeo = raw.geo || raw.app || fallback.geo;

  const phone = raw.contact?.phone || fallback.contact.phone;
  const email = raw.contact?.email || fallback.contact.email;

  const contact = {
    ...fallback.contact,
    ...(raw.contact || {}),
    phone,
    email,
    phoneDisplay: raw.contact?.phoneDisplay || formatPhoneDisplay(phone),
    phoneTel: raw.contact?.phoneTel || formatPhoneTel(phone),
    whatsappUrl: raw.contact?.whatsappUrl || formatWhatsappUrl(phone),
    emailMailto: raw.contact?.emailMailto || `mailto:${email}`,
  };

  const app = {
    ...fallback.app,
    ...(raw.app || {}),
    name: rawBranding?.name || fallback.app.name,
    nameEn: rawBranding?.nameEn || fallback.app.nameEn,
    tagline: rawBranding?.tagline || fallback.app.tagline,
    badge: rawBranding?.badge || fallback.app.badge,
    defaultCity: rawGeo?.defaultCity || fallback.app.defaultCity,
    supportedCities: rawGeo?.supportedCities || fallback.app.supportedCities,
  };

  return {
    ...fallback,
    ...raw,
    apiUrl: rawApiUrl,
    api: {
      baseUrl: rawApiUrl,
      timeoutMs: raw.api?.timeoutMs || 15000,
    },
    app,
    branding: {
      name: app.name,
      nameEn: app.nameEn,
      tagline: app.tagline,
      badge: app.badge,
    },
    geo: {
      defaultCity: app.defaultCity,
      supportedCities: app.supportedCities,
    },
    contact,
    socials: {
      ...fallback.socials,
      ...(raw.socials || {}),
      whatsapp: raw.socials?.whatsapp || contact.whatsappUrl,
    },
    features: {
      ...fallback.features,
      ...(raw.features || {}),
    },
    keys: {
      ...fallback.keys,
      ...(raw.keys || {}),
    },
    storage: {
      ...fallback.storage,
      ...(raw.storage || {}),
    },
    env: fallback.env,
    $metadata: raw.$metadata,
  };
}

// Singleton configuration instance
export const config: AppConfig = { ...fallbackConfig };

/**
 * Loads runtime configuration from '/config.json' before the React app renders.
 * Uses a timestamp cache-buster so updates in production are immediately effective.
 */
export async function loadAppConfig(): Promise<AppConfig> {
  try {
    const res = await fetch(`/config.json?v=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (res.ok) {
      const runtimeConfig = await res.json();
      const normalized = normalizeConfig(runtimeConfig, fallbackConfig);
      Object.assign(config, normalized);
    }
  } catch (err) {
    console.warn('[Config] Failed to load runtime config.json, using fallback configuration.', err);
  }
  return config;
}

export default config;
