import api from "../api/axio";
import type { PlatformSettings, SettingsResponse } from "../types/parametre";

export async function fetchParametres(): Promise<PlatformSettings> {
  const res = await api.get<SettingsResponse>("/api/parametres");
  return res.data.parametres;
}

export async function saveParametres(parametres: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const res = await api.put<SettingsResponse>("/api/admin/parametres", { parametres });
  return res.data.parametres;
}
