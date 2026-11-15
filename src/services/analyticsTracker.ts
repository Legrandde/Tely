import api from "../api/axio";
import { hasAnalyticsConsent } from "../components/site/consent";

export interface AnalyticsSummary {
  total_visits: number;
  unique_visitors: number;
  page_views: number;
  user_actions: number;
  bounce_rate: string;
  avg_duration: string;
  /** Évolution vs période précédente (null = pas de point de comparaison) */
  trends?: {
    total_visits: number | null;
    unique_visitors: number | null;
    page_views: number | null;
    user_actions: number | null;
    bounce_rate: number | null;
  };
}

export interface AnalyticsTimelineItem {
  date: string;
  visits: number;
  visitors: number;
}

export interface AnalyticsCountryItem {
  country: string;
  country_code: string;
  total: number;
  percentage: number;
}

export interface AnalyticsOSItem {
  os: string;
  total: number;
  percentage: number;
}

export interface AnalyticsBrowserItem {
  browser: string;
  total: number;
  percentage: number;
}

export interface AnalyticsDeviceItem {
  device: string;
  total: number;
  percentage: number;
}

export interface AnalyticsActionItem {
  action: string;
  total: number;
}

export interface AnalyticsRecentActivity {
  id: number;
  action: string;
  path: string;
  country: string;
  country_code: string;
  city: string;
  os: string;
  browser: string;
  device_type: string;
  ip_address: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    avatar_url?: string | null;
  } | null;
  created_at: string;
  time_ago: string;
}

export interface AdminAnalyticsData {
  period: string;
  summary: AnalyticsSummary;
  timeline: AnalyticsTimelineItem[];
  countries: AnalyticsCountryItem[];
  operating_systems: AnalyticsOSItem[];
  browsers: AnalyticsBrowserItem[];
  devices: AnalyticsDeviceItem[];
  actions: AnalyticsActionItem[];
  recent_activities: AnalyticsRecentActivity[];
}

// Session = activité continue ; elle expire après 30 min d'inactivité.
// Stockée dans localStorage pour ne pas créer une nouvelle session à chaque onglet.
const SESSION_KEY = "tely_analytics_session";
const SESSION_TTL_MS = 30 * 60 * 1000;

function getSessionId(): string {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(SESSION_KEY);
    const stored = raw ? (JSON.parse(raw) as { id: string; last: number }) : null;
    const id =
      stored && now - stored.last < SESSION_TTL_MS
        ? stored.id
        : "sid_" + Math.random().toString(36).substring(2, 12) + now.toString(36);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, last: now }));
    return id;
  } catch {
    return "sid_default";
  }
}

// Anti-doublon : React StrictMode (dev) et les re-rendus déclenchent parfois
// deux fois le même événement à quelques millisecondes d'intervalle.
const recentEvents = new Map<string, number>();
const DEDUPE_WINDOW_MS = 2000;

function isDuplicate(key: string): boolean {
  const now = Date.now();
  const last = recentEvents.get(key);
  recentEvents.set(key, now);
  return last !== undefined && now - last < DEDUPE_WINDOW_MS;
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/windows nt 10/i.test(ua)) return "Windows 10/11";
  if (/windows nt/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/iphone/i.test(ua)) return "iOS (iPhone)";
  if (/ipad/i.test(ua)) return "iOS (iPad)";
  if (/macintosh|mac os x/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Autre";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) return "Microsoft Edge";
  if (/chrome|crios/i.test(ua)) return "Google Chrome";
  if (/firefox|fxios/i.test(ua)) return "Mozilla Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Apple Safari";
  if (/opr\//i.test(ua)) return "Opera";
  return "Autre";
}

function detectDevice(): "desktop" | "mobile" | "tablet" {
  const ua = navigator.userAgent;
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export async function trackEvent(
  action: string,
  path?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // RGPD : aucune mesure d'audience sans consentement explicite (bandeau cookies)
  if (!hasAnalyticsConsent()) return;

  const resolvedPath = path || window.location.pathname;
  if (isDuplicate(`${action}|${resolvedPath}|${JSON.stringify(metadata ?? {})}`)) return;

  try {
    const payload = {
      action,
      path: resolvedPath,
      session_id: getSessionId(),
      os: detectOS(),
      browser: detectBrowser(),
      device_type: detectDevice(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      metadata,
    };

    await api.post("/api/analytics/track", payload);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[Analytics] Échec de l'envoi de l'événement:", err);
    }
  }
}

export async function fetchAdminAnalytics(
  period: "today" | "7d" | "30d" | "year" = "30d"
): Promise<AdminAnalyticsData> {
  const { data } = await api.get<AdminAnalyticsData>(`/api/admin/analytics?period=${period}`);
  return data;
}
