const TOKEN_KEY = 'rutacontrol_token';
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = token => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

export async function api(path, options = {}) {
  const headers = { 'Accept': 'application/json', ...options.headers };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que el backend esté ejecutándose.');
  }
  let result;
  try { result = await response.json(); } catch { result = {}; }
  if (!response.ok) {
    if (response.status === 401 && path !== '/api/auth/login') {
      clearToken();
      window.dispatchEvent(new Event('session-expired'));
    }
    throw new Error(result.error || `Error HTTP ${response.status}`);
  }
  return result;
}
