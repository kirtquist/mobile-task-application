// src/api/tasks.ts
// export async function fetchTasks(category: string = 'all'): Promise<any> {

import { getItem } from '../lib/storage';

// export const BASE_URL = import.meta.env.VITE_API_URL;
export const BASE_URL = "https://task-app-service-backend-426afe5-57fc7zcbta-uw.a.run.app/api";
if (!/\/api$/.test(BASE_URL)) {
    // Optional: throw instead of warn if you want to hard-fail
    console.warn(`VITE_API_URL may be missing '/api': ${BASE_URL}`);
} else {
    console.log(`Using VITE_API_URL: ${BASE_URL}`);
}

type ApiFetchOptions = RequestInit & {
  headers?: HeadersInit;
};


export const apiFetchOld = async <T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  // const token = localStorage.getItem('access_token');
  const token = await getItem('access_token');

if (!BASE_URL) {
  throw new Error("🚨 VITE_API_URL (BASE_URL) is undefined!");
}
  // console.log("🔎 Calling:", `${BASE_URL}${endpoint}`);
  // console.log("🔐 Token being sent:", token);
  // console.log("📦 Options before fetch:", options);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  console.log("📥 Status:", response.status);
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    console.warn("⚠️ 401 — attempting refresh with:", refreshToken);

    if (refreshToken) {
      const refreshResponse = await fetch(`${BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('access_token', data.access);

        return apiFetch<T>(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${data.access}`,
          },
        });
      } else {
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      throw new Error('Not authenticated. Please log in.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
};


export const apiFetch2 = async <T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  // const BASE_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = "https://task-app-service-backend-426afe5-57fc7zcbta-uw.a.run.app/api";
  const token = localStorage.getItem('access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  console.log(`➡️ apiFetch: ${BASE_URL}${endpoint}`);
  console.log('➡️ Headers:', headers);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.warn('🔐 Unauthorized — attempting token refresh');
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      const refreshResponse = await fetch(`${BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('access_token', data.access);

        // 🔁 Retry the original request with new token
        return apiFetch<T>(endpoint, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${data.access}`,
          },
        });
      } else {
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      throw new Error('Not authenticated. Please log in.');
    }
  }

  if (!response.ok) {
    const errorText = await response.clone().text();
    throw new Error(errorText || 'API request failed');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
};

