import { useState, useEffect } from 'react';
import { Plus, Pencil, Eye, EyeOff, Trash2, X, Upload, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useMenuStore } from '../../stores/menuStore';
import type { MenuItem, ComboItemEntry } from '../../types';
import Button from '../../components/ui/Button';
import { translateText } from '../../lib/translate';

const AVAILABLE_TAGS = ['招牌', '熱銷', '新品', '季節限定'];

export default function MenuManagePage() {
  const {
    categories,
    menuItems,
    fetchCategories,
    fetchMenuItems,
    fetchAddons,
    addMenuItem,
    updateMenuItem,
    toggleAvailability,
    deleteMenuItem,
    setManualStock
  } = useMenuStore();
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
    tags: [] as string[],
    nameEn: '',
    nameJa: '',
    descriptionEn: '',
    descriptionJa: '',
    dailyLimit: null as number | null,
    isCombo: false,
    comboItems: [] as ComboItemEntry[],
  });
  const [showI18n, setShowI18n] = useState(false);

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
      tags: [],
      nameEn: '',
      nameJa: '',
      descriptionEn: '',
      descriptionJa: '',
      dailyLimit: null,
      isCombo: false,
      comboItems: [],
    });
    setShowI18n(false);
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
      tags: item.tags || [],
      nameEn: item.nameEn || '',
      nameJa: item.nameJa || '',
      descriptionEn: item.descriptionEn || '',
      descriptionJa: item.descriptionJa || '',
      dailyLimit: item.dailyLimit,
      isCombo: item.isCombo,
      comboItems: item.comboItems || [],
    });
    setShowI18n(!!(item.nameEn || item.nameJa || item.descriptionEn || item.descriptionJa));
    setShowForm(true);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!formData.name.trim() || isTranslating) return;
    setIsTranslating(true);
    try {
      const [nameEn, nameJa, descEn, descJa] = await Promise.all([
        translateText(formData.name, 'en'),
        translateText(formData.name, 'ja'),
        formData.description.trim() ? translateText(formData.description, 'en') : Promise.resolve(''),
        formData.description.trim() ? translateText(formData.description, 'ja') : Promise.resolve(''),
      ]);
      setFormData((prev) => ({
        ...prev,
        nameEn,
        nameJa,
        descriptionEn: descEn,
        descriptionJa: descJa,
      }));
      setShowI18n(true);
    } catch {
      alert('翻譯失敗，請稍後再試');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.price <= 0) return;

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        comboItems: formData.isCombo && formData.comboItems.length > 0 ? formData.comboItems : null,
      };
      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
      } else {
        const newItem: MenuItem = {
          id: `m${Date.now()}`,
          ...payload,
          isAvailable: true,
          currentStock: payload.dailyLimit,
          stockResetDate: payload.dailyLimit != null
            ? new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' })
            : null,
        };
        await addMenuItem(newItem);
      }
      setShowForm(false);
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗：' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSaving(false);
    }
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

  // 套餐：新增品項
  const addComboItem = (menuItemId: string) => {
    const existing = menuItems.find((m) => m.id === menuItemId);
    if (!existing) return;
    setFormData((p) => ({
      ...p,
      comboItems: [...p.comboItems, { menuItemId, name: existing.name, quantity: 1 }],
    }));
  };

  // 套餐：移除品項
  const removeComboItem = (index: number) => {
    setFormData((p) => ({
      ...p,
      comboItems: p.comboItems.filter((_, i) => i !== index),
    }));
  };

  // 套餐：更新數量
  const updateComboQty = (index: number, qty: number) => {
    if (qty < 1) return;
    setFormData((p) => ({
      ...p,
      comboItems: p.comboItems.map((ci, i) => (i === index ? { ...ci, quantity: qty } : ci)),
    }));
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  // 庫存重置按鈕
  const handleResetStock = async (item: MenuItem) => {
    if (item.dailyLimit == null) return;
    try {
      await setManualStock(item.id, item.dailyLimit);
    } catch {
      alert('庫存重置失敗');
    }
  };

  // 載入菜單資料並啟用即時訂閱
  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
    fetchAddons();

    // 啟用 Supabase 即時訂閱
    const unsubscribe = useMenuStore.getState().subscribeToMenu();

    return unsubscribe;
  }, [fetchCategories, fetchMenuItems, fetchAddons]);

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
              <th className="text-left p-4">庫存</th>
              <th className="text-left p-4">分類</th>
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
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{item.name}</span>
                    {item.isCombo && (
                      <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary">
                        套餐
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-hint mt-0.5 truncate max-w-48">{item.description}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map(tag => (
                        <span key={tag} className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent/20 text-accent">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-4 font-semibold font-['Poppins'] text-text-primary">
                  ${item.price}
                </td>
                <td className="p-4 text-sm">
                  {item.dailyLimit != null ? (
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${item.currentStock === 0 ? 'text-error' : 'text-text-primary'}`}>
                        {item.currentStock ?? 0}/{item.dailyLimit}
                      </span>
                      <button
                        onClick={() => handleResetStock(item)}
                        className="p-1 text-info hover:bg-info/10 rounded cursor-pointer"
                        title="重置庫存"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-text-hint">不限量</span>
                  )}
                </td>
                <td className="p-4 text-sm text-text-secondary">{getCategoryName(item.categoryId)}</td>
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

              {/* 翻譯區塊 */}
              <div className="border border-border rounded-[8px] overflow-hidden">
                <div
                  onClick={() => setShowI18n(!showI18n)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary text-sm font-semibold text-text-secondary cursor-pointer select-none"
                >
                  <span>🌐 翻譯（English / 日本語）</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoTranslate}
                      disabled={!formData.name.trim() || isTranslating}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      {isTranslating ? '翻譯中...' : '自動翻譯'}
                    </button>
                    {showI18n ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                {showI18n && (
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1">English Name / 英文品名</label>
                      <input
                        type="text"
                        value={formData.nameEn}
                        onChange={(e) => setFormData((p) => ({ ...p, nameEn: e.target.value }))}
                        className="w-full h-10 px-4 border border-border rounded-[8px] bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Signature Taro Shaved Ice"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1">日本語名 / 日文品名</label>
                      <input
                        type="text"
                        value={formData.nameJa}
                        onChange={(e) => setFormData((p) => ({ ...p, nameJa: e.target.value }))}
                        className="w-full h-10 px-4 border border-border rounded-[8px] bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="例：看板タロイモかき氷"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1">English Description / 英文描述</label>
                      <input
                        type="text"
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData((p) => ({ ...p, descriptionEn: e.target.value }))}
                        className="w-full h-10 px-4 border border-border rounded-[8px] bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Taro balls, mochi, tapioca"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1">日本語説明 / 日文描述</label>
                      <input
                        type="text"
                        value={formData.descriptionJa}
                        onChange={(e) => setFormData((p) => ({ ...p, descriptionJa: e.target.value }))}
                        className="w-full h-10 px-4 border border-border rounded-[8px] bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="例：タロボール、白玉、タピオカ"
                      />
                    </div>
                  </div>
                )}
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

              {/* 每日限量 */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">每日限量</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={formData.dailyLimit ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        dailyLimit: val === '' ? null : Math.max(0, Number(val)),
                      }));
                    }}
                    className="w-32 h-11 px-4 border border-border rounded-[8px] bg-card text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="不限量"
                    min={0}
                  />
                  <span className="text-sm text-text-hint">留空 = 不限量</span>
                </div>
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

              {/* 標籤 */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">標籤</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => (
                    <label key={tag} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-text-secondary border-border hover:border-primary'
                    }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.tags.includes(tag)}
                        onChange={(e) => {
                          setFormData(p => ({
                            ...p,
                            tags: e.target.checked
                              ? [...p.tags, tag]
                              : p.tags.filter(t => t !== tag)
                          }));
                        }}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>

              {/* 套餐設定 */}
              <div className="border border-border rounded-[8px] p-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={formData.isCombo}
                    onChange={(e) => setFormData((p) => ({ ...p, isCombo: e.target.checked }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-semibold text-text-secondary">此品項為套餐組合</span>
                </label>

                {formData.isCombo && (
                  <div className="flex flex-col gap-3">
                    <label className="block text-sm font-semibold text-text-secondary">套餐內容</label>

                    {/* 已選品項 */}
                    {formData.comboItems.map((ci, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-bg rounded-[8px] px-3 py-2">
                        <span className="flex-1 text-sm text-text-primary">{ci.name}</span>
                        <input
                          type="number"
                          value={ci.quantity}
                          onChange={(e) => updateComboQty(idx, Number(e.target.value))}
                          className="w-16 h-8 px-2 border border-border rounded-[6px] text-sm text-center"
                          min={1}
                        />
                        <button
                          onClick={() => removeComboItem(idx)}
                          className="p-1 text-error hover:bg-error/10 rounded cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {/* 選擇品項下拉 */}
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) addComboItem(e.target.value);
                      }}
                      className="w-full h-10 px-4 border border-border rounded-[8px] bg-card text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">+ 新增品項到套餐...</option>
                      {menuItems
                        .filter((m) => !m.isCombo && m.id !== editingItem?.id)
                        .map((m) => (
                          <option key={m.id} value={m.id}>{m.name} (${m.price})</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" fullWidth onClick={() => setShowForm(false)} disabled={isSaving}>
                  取消
                </Button>
                <Button fullWidth onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? '儲存中...' : (editingItem ? '儲存修改' : '新增品項')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
