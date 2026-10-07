const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('chat_token');
  }

  public setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_token', token);
    }
  }

  public clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data.data as T;
  }

  // Auth Endpoints
  async register(body: { email: string; username: string; password: string }) {
    return this.request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(body: { emailOrUsername: string; password: string }) {
    return this.request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getMe() {
    return this.request<{ user: any }>('/api/auth/me');
  }

  // User Endpoints
  async searchUsers(query: string) {
    return this.request<any[]>(`/api/users?q=${encodeURIComponent(query)}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }

  async updateProfile(body: { bio?: string; avatarUrl?: string }) {
    return this.request<any>('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // Conversation Endpoints
  async getConversations() {
    return this.request<any[]>('/api/conversations');
  }

  async createDirectConversation(recipientId: string) {
    return this.request<any>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  }

  async getMessages(conversationId: string, limit = 50, before?: string) {
    let url = `/api/conversations/${conversationId}/messages?limit=${limit}`;
    if (before) url += `&before=${encodeURIComponent(before)}`;
    return this.request<any[]>(url);
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request<any>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async markAsRead(conversationId: string) {
    return this.request<{ readMessageIds: string[] }>(`/api/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
