export const setTokens = (access: string, refresh: string): Promise<void[]> =>
  Promise.all([
    localStorage.setItem("access_token", access),
    localStorage.setItem("refresh_token", refresh),
  ]);

export const getAccess = () =>
  localStorage.getItem("access_token");

export const clearTokens = (): Promise<void[]> =>
  Promise.all([
    localStorage.removeItem("access_token"),
  ]);