import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { ROLE_LABELS, type AdminRole, type AdminUser } from '../constants/permissions';
import Button from '../../components/ui/Button';

export default function AccountsPage() {
  const { user: currentUser, users, loading, fetchUsers, createUser, updateUser, deleteUser } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'staff' as AdminRole });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const ownerCount = users.filter((u) => u.role === 'owner' && u.is_active).length;

  const openAddForm = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'staff' });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (u: AdminUser) => {
    setEditingUser(u);
    setFormData({ username: u.username, password: '', role: u.role });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.username.trim()) {
      setFormError('請輸入用戶名');
      return;
    }

    if (!editingUser && !formData.password) {
      setFormError('請輸入密碼');
      return;
    }

    if (editingUser) {
      // 不能改自己角色
      if (editingUser.id === currentUser?.id && formData.role !== currentUser.role) {
        setFormError('不能修改自己的角色');
        return;
      }
      // 最後一個 owner 不能改角色
      if (editingUser.role === 'owner' && formData.role !== 'owner' && ownerCount <= 1) {
        setFormError('至少需要保留一個老闆帳號');
        return;
      }

      const data: Parameters<typeof updateUser>[1] = {};
      if (formData.username !== editingUser.username) data.username = formData.username.trim();
      if (formData.password) data.password = formData.password;
      if (formData.role !== editingUser.role) data.role = formData.role;

      const result = await updateUser(editingUser.id, data);
      if (!result.ok) {
        setFormError(result.error || '更新失敗');
        return;
      }
    } else {
      const result = await createUser(formData.username.trim(), formData.password, formData.role);
      if (!result.ok) {
        setFormError(result.error || '新增失敗');
        return;
      }
    }

    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const result = await deleteUser(deleteTarget.id);
    if (!result.ok) {
      alert(result.error || '刪除失敗');
    }
    setDeleteTarget(null);
  };

  const handleToggleActive = async (u: AdminUser) => {
    // 不能停用自己
    if (u.id === currentUser?.id) return;
    // 最後一個 owner 不能停用
    if (u.role === 'owner' && u.is_active && ownerCount <= 1) {
      alert('至少需要保留一個啟用的老闆帳號');
      return;
    }
    await updateUser(u.id, { is_active: !u.is_active });
  };

  const roleBadgeColor: Record<AdminRole, string> = {
    owner: 'bg-primary/15 text-primary',
    manager: 'bg-blue-100 text-blue-700',
    staff: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 標題列 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary font-serif">帳號管理</h1>
        <Button onClick={openAddForm} size="sm">
          <Plus size={16} className="mr-1 inline" />
          新增帳號
        </Button>
      </div>

      {/* 帳號列表 */}
      <div className="bg-card rounded-[12px] shadow-[var(--shadow-md)] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-secondary text-text-secondary text-sm">
              <th className="px-5 py-3 font-medium">用戶名</th>
              <th className="px-5 py-3 font-medium">角色</th>
              <th className="px-5 py-3 font-medium">狀態</th>
              <th className="px-5 py-3 font-medium">建立時間</th>
              <th className="px-5 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-text-hint">載入中...</td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-text-hint">尚無帳號</td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-text-primary">
                    {u.username}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-text-hint">(你)</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={u.id === currentUser?.id}
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        u.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-500 hover:bg-red-200'
                      } ${u.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {u.is_active ? '啟用' : '停用'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-sm text-text-secondary">
                    {new Date(u.created_at).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditForm(u)}
                        className="p-1.5 rounded-lg hover:bg-secondary text-text-secondary hover:text-primary transition-colors"
                        title="編輯"
                      >
                        <Pencil size={16} />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-error transition-colors"
                          title="刪除"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* 新增/編輯對話框 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-[12px] shadow-[var(--shadow-lg)] w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text-primary font-serif">
                {editingUser ? '編輯帳號' : '新增帳號'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-text-hint hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 用戶名 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">用戶名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-bg text-text-primary outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              {/* 密碼 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  密碼{editingUser && <span className="text-text-hint ml-1">(留空則不修改)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-bg text-text-primary outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* 角色 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                  disabled={editingUser?.id === currentUser?.id}
                  className="w-full h-11 px-3 rounded-lg border border-border bg-bg text-text-primary outline-none focus:border-primary transition-colors disabled:opacity-50"
                >
                  <option value="owner">{ROLE_LABELS.owner}</option>
                  <option value="manager">{ROLE_LABELS.manager}</option>
                  <option value="staff">{ROLE_LABELS.staff}</option>
                </select>
                {editingUser?.id === currentUser?.id && (
                  <p className="text-xs text-text-hint mt-1">不能修改自己的角色</p>
                )}
              </div>
            </div>

            {formError && (
              <p className="text-error text-sm mt-3">{formError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="secondary" fullWidth onClick={() => setShowForm(false)}>
                取消
              </Button>
              <Button type="submit" fullWidth>
                {editingUser ? '儲存' : '新增'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 刪除確認對話框 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-[12px] shadow-[var(--shadow-lg)] w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">確認刪除</h2>
            <p className="text-text-secondary mb-6">
              確定要刪除帳號 <span className="font-bold text-text-primary">{deleteTarget.username}</span>？此操作無法復原。
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>
                取消
              </Button>
              <Button variant="danger" fullWidth onClick={handleDelete}>
                刪除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
