import api from "../api/axio";

export interface AnalyticsSummary {
  total_visits: number;
  unique_visitors: number;
  page_views: number;
  user_actions: number;
  bounce_rate: string;
  avg_duration: string;
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

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem("tely_analytics_sid");
    if (!sid) {
      sid = "sid_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      sessionStorage.setItem("tely_analytics_sid", sid);
    }
    return sid;
  } catch {
    return "sid_default";
  }
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
  try {
    const payload = {
      action,
      path: path || window.location.pathname,
      session_id: getSessionId(),
      os: detectOS(),
      browser: detectBrowser(),
      device_type: detectDevice(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      metadata,
    };

    const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
    const url = `${apiBase}/api/analytics/track`;

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      await api.post("/api/analytics/track", payload);
    }
  } catch {
    // Ignore tracking failures silently
  }
}

export async function fetchAdminAnalytics(
  period: "today" | "7d" | "30d" | "year" = "30d"
): Promise<AdminAnalyticsData> {
  const { data } = await api.get<AdminAnalyticsData>(`/api/admin/analytics?period=${period}`);
  return data;
}
