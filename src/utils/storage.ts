// utils/storage.ts

const ACCESS_KEY = "access_token";
export const setAccess = (token: string): void => {
  localStorage.setItem(ACCESS_KEY, token);
};

export const getAccess = (): string | null => {
  return localStorage.getItem(ACCESS_KEY);
};

export const clearAccess = (): void => {
  localStorage.removeItem(ACCESS_KEY);
};