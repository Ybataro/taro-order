import { useState } from 'react';
import { Plus, Pencil, Eye, EyeOff, Trash2, X, Upload } from 'lucide-react';
import { useMenuStore } from '../../stores/menuStore';
import type { MenuItem } from '../../types';
import Button from '../../components/ui/Button';

export default function MenuManagePage() {
  const { categories, menuItems, addMenuItem, updateMenuItem, toggleAvailability, deleteMenuItem } = useMenuStore();
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: categories[0]?.id || '',
    subcategoryId: '',
    image: '',
  });

  const filteredItems = filterCategoryId === 'all'
    ? menuItems
    : menuItems.filter((i) => i.categoryId === filterCategoryId);

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || '';

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.subcategories.find((s) => s.id === subcategoryId)?.name || '';
  };

  const openAddForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id || '',
      subcategoryId: categories[0]?.subcategories[0]?.id || '',
      image: '',
    });
    setShowForm(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      subcategoryId: item.subcategoryId,
      image: item.image,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name || formData.price <= 0) return;

    if (editingItem) {
      updateMenuItem(editingItem.id, formData);
    } else {
      const newItem: MenuItem = {
        id: `m${Date.now()}`,
        ...formData,
        isAvailable: true,
      };
      addMenuItem(newItem);
    }
    setShowForm(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">菜單管理</h1>
        <Button onClick={openAddForm}>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            新增品項
          </span>
        </Button>
      </div>

      {/* 分類篩選 */}
      <div className="mb-6">
        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className="h-11 px-4 border border-border rounded-[8px] bg-card text-text-primary text-base focus:outline-none focus:border-primary"
        >
          <option value="all">全部分類</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* 品項表格 */}
      <div className="bg-card rounded-[12px] shadow-[var(--shadow-card)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary text-text-secondary text-sm">
              <th className="text-left p-4">圖片</th>
              <th className="text-left p-4">品名</th>
              <th className="text-left p-4">價格</th>
              <th className="text-left p-4">分類</th>
              <th className="text-left p-4">子分類</th>
              <th className="text-center p-4">狀態</th>
              <th className="text-center p-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-warm-white/50">
                <td className="p-4">
                  <div className="w-12 h-12 rounded-[8px] bg-secondary flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🍠</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-text-primary">{item.name}</span>
                  <p className="text-xs text-text-hint mt-0.5 truncate max-w-48">{item.description}</p>
                </td>
                <td className="p-4 font-semibold font-['Poppins'] text-text-primary">
                  ${item.price}
                </td>
                <td className="p-4 text-sm text-text-secondary">{getCategoryName(item.categoryId)}</td>
                <td className="p-4 text-sm text-text-secondary">{getSubcategoryName(item.categoryId, item.subcategoryId)}</td>
                <td className="p-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    item.isAvailable
                      ? 'bg-status-done-bg text-success'
                      : 'bg-gray-100 text-text-hint'
                  }`}>
                    {item.isAvailable ? '● 上架' : '○ 下架'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-2 text-info hover:bg-status-cooking-bg rounded-[8px] cursor-pointer"
                      title="編輯"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`p-2 rounded-[8px] cursor-pointer ${
                        item.isAvailable
                          ? 'text-warning hover:bg-status-pending-bg'
                          : 'text-success hover:bg-status-done-bg'
                      }`}
                      title={item.isAvailable ? '下架' : '上架'}
                    >
                      {item.isAvailable ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => { if (confirm('確定要刪除此品項嗎？')) deleteMenuItem(item.id); }}
                      className="p-2 text-error hover:bg-[#FDECEA] rounded-[8px] cursor-pointer"
                      title="刪除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-text-hint">
            <p>目前沒有品項</p>
          </div>
        )}
      </div>

      {/* 新增/編輯表單對話框 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-[12px] shadow-[var(--shadow-lg)] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                {editingItem ? '編輯品項' : '新增品項'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-text-hint hover:text-text-primary cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* 圖片上傳 */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">品項圖片</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-[8px] bg-secondary flex items-center justify-center overflow-hidden">
                    {formData.image ? (
                      <img src={formData.image} alt="預覽" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={24} className="text-text-hint" />
                    )}
                  </div>
                  <label className="px-4 py-2 bg-secondary text-primary rounded-[8px] cursor-pointer hover:bg-accent/20 text-sm font-semibold">
                    選擇圖片
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* 品名 */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">品名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-11 px-4 border border-border rounded-[8px] bg-card text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="輸入品項名稱"
                />
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full h-20 p-4 border border-border rounded-[8px] bg-card text-base resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="輸入品項描述"
                />
              </div>

              {/* 價格 */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">價格 (NT$) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))}
                  className="w-full h-11 px-4 border border-border rounded-[8px] bg-card text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  min={0}
                />
              </div>

              {/* 分類 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">分類</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const catId = e.target.value;
                      const cat = categories.find((c) => c.id === catId);
                      setFormData((p) => ({
                        ...p,
                        categoryId: catId,
                        subcategoryId: cat?.subcategories[0]?.id || '',
                      }));
                    }}
                    className="w-full h-11 px-4 border border-border rounded-[8px] bg-card text-base focus:outline-none focus:border-primary"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">子分類</label>
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData((p) => ({ ...p, subcategoryId: e.target.value }))}
                    className="w-full h-11 px-4 border border-border rounded-[8px] bg-card text-base focus:outline-none focus:border-primary"
                  >
                    {selectedCategory?.subcategories.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" fullWidth onClick={() => setShowForm(false)}>
                  取消
                </Button>
                <Button fullWidth onClick={handleSubmit}>
                  {editingItem ? '儲存修改' : '新增品項'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
