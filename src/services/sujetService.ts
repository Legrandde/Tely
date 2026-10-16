import api from "../api/axio";
import type { Sujet } from "../types/Sujet";

export async function getSujet(id: string): Promise<Sujet> {
  const { data } = await api.get(`/api/sujets/${id}`);
  return data;
}