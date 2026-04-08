import { getPublicEnv } from "../config/env";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${getPublicEnv().apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${path} with ${response.status}`);
  }

  return (await response.json()) as T;
}
