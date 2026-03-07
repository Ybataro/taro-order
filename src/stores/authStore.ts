import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { sha256 } from '../lib/hash';
import type { AdminUser, AdminRole } from '../admin/constants/permissions';

const SESSION_KEY = 'taro_admin_auth';

interface AuthState {
  user: AdminUser | null;
  users: AdminUser[];
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  restoreSession: () => boolean;
  fetchUsers: () => Promise<void>;
  createUser: (username: string, password: string, role: AdminRole) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (id: string, data: { username?: string; password?: string; role?: AdminRole; is_active?: boolean }) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: [],
  loading: false,

  login: async (username, password) => {
    try {
      const hash = await sha256(password);
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, role, is_active, created_at, updated_at')
        .eq('username', username)
        .eq('password_hash', hash)
        .single();

      if (error || !data) {
        return { ok: false, error: '帳號或密碼錯誤' };
      }

      if (!data.is_active) {
        return { ok: false, error: '此帳號已停用' };
      }

      const user = data as AdminUser;
      set({ user });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { ok: true };
    } catch {
      return { ok: false, error: '登入失敗，請稍後再試' };
    }
  },

  logout: () => {
    set({ user: null });
    sessionStorage.removeItem(SESSION_KEY);
  },

  restoreSession: () => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    // 相容舊版 'true' 格式 → 視為未登入
    if (raw === 'true') {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }

    try {
      const user = JSON.parse(raw) as AdminUser;
      if (user && user.id && user.role) {
        set({ user });
        return true;
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
    return false;
  },

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, role, is_active, created_at, updated_at')
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ users: (data || []) as AdminUser[], loading: false });
    } catch (error) {
      console.error('fetchUsers error:', error);
      set({ loading: false });
    }
  },

  createUser: async (username, password, role) => {
    try {
      const hash = await sha256(password);
      const { error } = await supabase
        .from('admin_users')
        .insert({ username, password_hash: hash, role });

      if (error) {
        if (error.code === '23505') return { ok: false, error: '用戶名已存在' };
        return { ok: false, error: error.message };
      }

      await get().fetchUsers();
      return { ok: true };
    } catch {
      return { ok: false, error: '新增失敗' };
    }
  },

  updateUser: async (id, data) => {
    try {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (data.username !== undefined) updates.username = data.username;
      if (data.role !== undefined) updates.role = data.role;
      if (data.is_active !== undefined) updates.is_active = data.is_active;
      if (data.password) updates.password_hash = await sha256(data.password);

      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', id);

      if (error) {
        if (error.code === '23505') return { ok: false, error: '用戶名已存在' };
        return { ok: false, error: error.message };
      }

      await get().fetchUsers();

      // 如果更新的是自己，同步 session
      const currentUser = get().user;
      if (currentUser && currentUser.id === id) {
        const updated = get().users.find((u) => u.id === id);
        if (updated) {
          set({ user: updated });
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        }
      }

      return { ok: true };
    } catch {
      return { ok: false, error: '更新失敗' };
    }
  },

  deleteUser: async (id) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) return { ok: false, error: error.message };

      await get().fetchUsers();
      return { ok: true };
    } catch {
      return { ok: false, error: '刪除失敗' };
    }
  },
}));
