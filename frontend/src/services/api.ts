const BASE_URL = '/api'

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers ?? {}) },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((error as any).error ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    register: (username: string, password: string) =>
      request<{ token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    login: (username: string, password: string) =>
      request<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
  },

  food: {
    search: (q: string) =>
      request<{ foods: FoodItem[] }>(`/food/search?q=${encodeURIComponent(q)}`),
  },

  logs: {
    getAll: (date?: string) =>
      request<{ logs: FoodLog[] }>(`/logs${date ? `?date=${date}` : ''}`),
    add: (entry: Omit<FoodLog, 'id' | 'logged_at'>) =>
      request<{ id: number }>('/logs', { method: 'POST', body: JSON.stringify(entry) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/logs/${id}`, { method: 'DELETE' }),
    summary: (date?: string) =>
      request<MacroSummary>(`/logs/summary${date ? `?date=${date}` : ''}`),
  },

  goals: {
    get: () => request<MacroGoals>('/goals'),
    set: (goals: MacroGoals) =>
      request<{ success: boolean }>('/goals', { method: 'PUT', body: JSON.stringify(goals) }),
  },
}

export interface FoodItem {
  name: string
  brand: string
  servingSize: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

export interface FoodLog {
  id?: number
  food_name: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  quantity: number
  unit: string
  logged_at?: string
}

export interface MacroSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MacroGoals {
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}
