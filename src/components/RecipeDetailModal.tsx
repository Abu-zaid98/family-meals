import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';
import type { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  onClose: () => void;
  categories: string[];
  onUpdated: (recipe: Recipe) => void;
  onDeleted: () => void;
}

export function RecipeDetailModal({ recipe, onClose, categories, onUpdated, onDeleted }: Props) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(!categories.includes(recipe.category || 'عام'));
  const [form, setForm] = useState({
    title: recipe.title,
    category: recipe.category || 'عام',
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
  });

  const isOwner = user?.uid === recipe.userId;
  const visibleCategory = isEditing ? (isAddingCategory ? (customCategory || 'قسم جديد') : form.category) : (recipe.category || 'عام');
  const ingredients = (isEditing ? form.ingredients : recipe.ingredients).split('\n').filter(Boolean);
  const steps = (isEditing ? form.steps : recipe.steps).split('\n').filter(Boolean);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteConfirm) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, showDeleteConfirm]);

  const saveChanges = async () => {
    const normalizedCategory = isAddingCategory ? customCategory.trim() : form.category.trim();
    if (!form.title.trim() || !normalizedCategory || !form.description.trim() || !form.ingredients.trim() || !form.steps.trim()) {
      setError('يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const updatedRecipe = await recipeService.update(recipe.id, {
        ...form,
        category: normalizedCategory,
      });
      onUpdated(updatedRecipe);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'تعذّر تعديل الوصفة.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCurrentRecipe = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await recipeService.remove(recipe.id);
      onDeleted();
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'تعذّر حذف الوصفة.');
      setShowDeleteConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const sectionCardClass = "glass-panel rounded-[1.75rem] p-5 sm:p-6 transition-all duration-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !showDeleteConfirm) onClose(); }}
    >
      <div className="animate-scaleIn flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.2rem] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.25)] border border-white/40">

        {/* Header Section (Sticky) */}
        <div className="sticky top-0 z-20 overflow-hidden border-b border-border bg-white/80 backdrop-blur-xl px-6 py-5 sm:px-8">
          <div className="absolute -top-10 right-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-coral/8 blur-3xl" />

          <div className="relative flex flex-col gap-4">
            {/* Top row: Category and Actions */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="pill" style={{ background: 'rgba(212,119,58,0.1)', color: 'var(--color-amber-dark)', border: '1px solid rgba(212,119,58,0.2)' }}>
                  {visibleCategory}
                </span>
                {!isEditing && isOwner && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    وصفتك الخاصة
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isOwner && (
                  <div className="flex items-center gap-2 mr-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={saveChanges}
                          disabled={submitting}
                          className="btn-primary flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
                        >
                          {submitting ? 'جار الحفظ...' : '💾 حفظ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setForm({
                              title: recipe.title,
                              category: recipe.category || 'عام',
                              description: recipe.description,
                              ingredients: recipe.ingredients,
                              steps: recipe.steps,
                            });
                          }}
                          className="btn-ghost rounded-full px-4 py-1.5 text-xs font-bold"
                        >
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="btn-ghost flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all hover:bg-amber-50 hover:text-amber-700"
                        >
                          <span>✏️</span> تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-100 transition-all hover:bg-red-100"
                        >
                          <span>🗑️</span> حذف
                        </button>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm/50 text-charcoal shadow-sm border border-border/40 backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-90"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.7 3.3a1 1 0 0 0-1.4 0L8 6.6 4.7 3.3a1 1 0 0 0-1.4 1.4L6.6 8l-3.3 3.3a1 1 0 1 0 1.4 1.4L8 9.4l3.3 3.3a1 1 0 0 0 1.4-1.4L9.4 8l3.3-3.3a1 1 0 0 0 0-1.4z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Title Section */}
            <div className="min-w-0">
              {isEditing ? (
                <input
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="field-base text-2xl font-bold bg-white/50!"
                  placeholder="عنوان الوصفة"
                />
              ) : (
                <h2 className="font-display text-3xl font-bold leading-tight text-charcoal sm:text-4xl">
                  {recipe.title}
                </h2>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] sm:text-xs font-bold text-stone">
                <span className="flex items-center gap-1.5 bg-warm text-amber-700 px-3 py-1.5 rounded-full border border-border/40 uppercase tracking-wide">
                  <span>📅</span>
                  {new Date(recipe.createdAt).toLocaleDateString('ar', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5 bg-warm text-amber-700 px-3 py-1.5 rounded-full border border-border/40 uppercase tracking-wide">
                  <span>👨‍🍳</span>
                  {recipe.authorName}
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* Content Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10 bg-[linear-gradient(180deg,#fffdfb,#fffaf5)] sm:p-10 pb-12">

          {isEditing && (
            <section className={sectionCardClass}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-charcoal">
                  <span className="section-accent"></span> القسم
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(prev => !prev)}
                  className="text-xs font-bold text-amber-dark bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100/50 hover:bg-amber-100 transition-colors"
                >
                  {isAddingCategory ? 'اختيار من القائمة' : 'إضافة قسم جديد'}
                </button>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-bold tracking-widest text-stone uppercase">القسم الإبداعي</label>
                {isAddingCategory ? (
                  <input
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    placeholder="مثل: حلويات شرقية"
                    className="field-base"
                  />
                ) : (
                  <select
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="field-base appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236b7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat"
                    style={{ backgroundSize: '1.25rem', backgroundPosition: 'left 0.75rem center' }}
                  >
                    {categories.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                )}
              </div>
            </section>
          )}

          <section className={sectionCardClass}>
            <div className="space-y-4">
              <label className="block text-[10px] font-bold tracking-widest text-stone uppercase">عن الوصفة</label>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="field-base"
                  placeholder="صف لنا روعة هذه الوصفة..."
                />
              ) : (
                <p className="leading-relaxed text-stone text-lg italic bg-warm/30 p-4 rounded-2xl border border-border/30">
                  "{recipe.description}"
                </p>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className={sectionCardClass}>
              <div className="space-y-5">
                <label className="block text-[10px] font-bold tracking-widest text-stone uppercase">المكونات والمقادير</label>
                {isEditing ? (
                  <textarea
                    rows={8}
                    value={form.ingredients}
                    onChange={e => setForm(prev => ({ ...prev, ingredients: e.target.value }))}
                    className="field-base"
                    placeholder="كل مكون في سطر..."
                  />
                ) : (
                  <ul className="space-y-4">
                    {ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-4 animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber ring-4 ring-amber-50" />
                        <span className="leading-relaxed text-stone text-[1.05rem]">{ing}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className={sectionCardClass}>
              <div className="space-y-5">
                <label className="block text-[10px] font-bold tracking-widest text-stone uppercase">خطوات التحضير</label>
                {isEditing ? (
                  <textarea
                    rows={8}
                    value={form.steps}
                    onChange={e => setForm(prev => ({ ...prev, steps: e.target.value }))}
                    className="field-base"
                    placeholder="كل خطوة في سطر..."
                  />
                ) : (
                  <div className="space-y-6">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-4 animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-light to-amber text-sm font-bold text-white shadow-md">
                          {i + 1}
                        </span>
                        <p className="pt-1 text-stone leading-[1.8] text-[1.05rem]">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {error && (
            <div className="animate-fadeDown rounded-4xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: 'rgba(2, 6, 23, 0.45)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
        >
          <div className="animate-scaleIn w-full max-w-md rounded-4xl border border-white/40 bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-4xl text-red-500 mb-6 mx-auto border border-red-100">
              🗑️
            </div>
            <h3 className="text-center font-display text-2xl font-bold text-charcoal">حذف الوصفة نهائياً؟</h3>
            <p className="mt-4 text-center leading-relaxed text-stone">
              هل أنت متأكد من حذف هذه الوصفة؟ هذا الإجراء لا يمكن التراجع عنه وسيتم مسح كل البيانات المتعلقة بها.
            </p>
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-ghost flex-1 py-3.5 text-sm font-bold rounded-2xl"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={deleteCurrentRecipe}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
