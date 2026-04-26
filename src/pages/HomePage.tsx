import { useState, useMemo } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeDetailModal } from '../components/RecipeDetailModal';
import { AddRecipeModal } from '../components/AddRecipeModal';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { SearchIcon } from '../components/common/SearchIcon';
import type { Recipe } from '../types';

export function HomePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { recipes, loading, error } = useRecipes();
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Memoize categories to avoid recalculating on every search keystroke
  const categories = useMemo(() => {
    return Array.from(
      new Set(recipes.map(r => (r.category || 'عام').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [recipes]);

  const categoryOptions = useMemo(() => ['الكل', ...categories], [categories]);

  // Memoize filtered recipes for performance
  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const q = search.toLowerCase();
      const matchesSearch =
        (r.title || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.category || 'عام').toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'الكل' || (r.category || 'عام') === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, search, selectedCategory]);

  const openAddFlow = () => {
    if (!user) { setAuthMode('login'); return; }
    setShowAdd(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden" dir="rtl" style={{ background: 'var(--page-background)' }}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/30 bg-white/72 backdrop-blur-2xl shadow-[0_4px_24px_rgba(30,42,55,0.07)]">
        <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white shadow-[0_10px_28px_rgba(212,119,58,0.30)]"
              style={{ background: 'linear-gradient(135deg,var(--color-coral),var(--color-gold))' }}
            >
              🍳
            </div>
            <div>
              <span className="font-display text-[1.2rem] font-bold text-charcoal leading-none">
                وصفات عائلة منى وسهيل
              </span>
              <p className="hidden text-[10px] text-stone mt-0.5 sm:block opacity-70">
                أشهى الوصفات المنزلية
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!authLoading && user ? (
              <>
                <div className="flex flex-col text-right">
                  <span className="hidden sm:inline text-[9px] font-bold text-stone uppercase tracking-wider">مسجّل الدخول</span>
                  <span className="text-[13px] sm:text-sm font-bold text-charcoal leading-tight">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    id="add-recipe-btn"
                    onClick={openAddFlow}
                    className="btn-primary flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow-lg"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H9v4a1 1 0 1 1-2 0V9H3a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1z" />
                    </svg>
                    <span className="hidden sm:inline">أضف وصفة</span>
                  </button>

                  <button
                    id="logout-btn"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="btn-ghost flex items-center justify-center rounded-full px-3 sm:px-4 py-2 text-xs font-bold"
                  >
                    <span className="hidden sm:inline">خروج</span>
                    <span className="sm:hidden" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6 2.75A1.75 1.75 0 0 1 7.75 1h3.5A1.75 1.75 0 0 1 13 2.75v10.5A1.75 1.75 0 0 1 11.25 15h-3.5A1.75 1.75 0 0 1 6 13.25V11.5a.75.75 0 0 1 1.5 0v1.75a.25.25 0 0 0 .25.25h3.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25V4.5A.75.75 0 0 1 6 4.5V2.75ZM2.22 8.53a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h4.69a.75.75 0 0 1 0 1.5H4.56l1.22 1.22a.75.75 0 1 1-1.06 1.06l-2.5-2.5Z" />
                      </svg>
                    </span>
                  </button>
                </div>
              </>
            ) : !authLoading ? (
              <button
                id="login-btn"
                onClick={() => setAuthMode('login')}
                className="btn-primary rounded-full px-6 py-2.5 text-sm font-bold"
              >
                دخول
              </button>
            ) : (
              <div className="h-9 w-24 bg-warm/50 rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </header>


      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pb-6 pt-8 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob absolute -right-20 -top-12 h-64 w-64 bg-[rgba(240,192,96,0.22)]" />
          <div className="blob absolute -left-20 bottom-0 h-56 w-56 bg-[rgba(232,98,58,0.15)]" />
        </div>

        <div
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.2rem] text-white shadow-[0_32px_90px_rgba(20,35,65,0.24)]"
          style={{
            background: 'linear-gradient(135deg, #1a2f3f 0%, #2c4f64 45%, #d97040 160%)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(240,192,96,0.18),transparent_30%)]" />

          <div className="relative grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-3 text-[11px] font-bold tracking-[0.35em] text-sand animate-fadeUp">
                ✦ وصفات العائلة
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight animate-fadeUp stagger-1 sm:text-5xl lg:text-[3.4rem]">
                وصفات عربية
                <br />
                <span style={{ color: 'var(--color-gold)' }}>بتجربة أنيقة</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-8 text-white/75 animate-fadeUp stagger-2">
                شارك وصفتك بسرعة، استخدم الإملاء الصوتي بالعربية لكل حقل، واستعرض الوصفات بأسلوب بصري أهدأ وأكثر احترافية.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5 animate-fadeUp stagger-3">
                {['موقع عائلي للوصفات', 'أقسام وفلترة واضحة', 'إملاء صوتي عربي'].map(f => (
                  <div
                    key={f}
                    className="rounded-full border border-white/16 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm"
                  >
                    {f}
                  </div>
                ))}
              </div>

              {!authLoading && !user && (
                <div className="mt-8 flex flex-wrap gap-3 animate-fadeUp stagger-4">
                  <button
                    id="hero-register-btn"
                    onClick={() => setAuthMode('register')}
                    className="rounded-full bg-white px-6 py-3 text-sm font-bold text-charcoal shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all hover:scale-105 hover:shadow-[0_16px_36px_rgba(0,0,0,0.22)] active:scale-98"
                  >
                    إنشاء حساب مجاني
                  </button>
                  <button
                    id="hero-login-btn"
                    onClick={() => setAuthMode('login')}
                    className="rounded-full border border-white/22 bg-white/12 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    تسجيل الدخول
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-4 animate-fadeUp stagger-3">
              <StatCard
                value={loading ? '—' : recipes.length}
                label="الوصفات المنشورة"
                sub="كل وصفة تُعرض بشكل مرتب وواضح مناسب للاستخدام العائلي اليومي."
              />
              <StatCard
                value={loading ? '—' : `${categories.length} قسم`}
                label="الأقسام العائلية"
                sub="يمكنك اختيار قسم موجود أو إنشاء قسم جديد عند إضافة وصفة جديدة."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* Discovery Bar */}
        {!loading && !error && (
          <div className="glass-panel mb-10 overflow-hidden rounded-4xl p-6 sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-charcoal flex items-center gap-2">
                    <span className="section-accent h-6 w-1 inline-block"></span>
                    استكشف الأقسام
                  </h2>
                  <p className="text-xs text-stone mt-1">{filtered.length} وصفة تنتظرك</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {categoryOptions.map(cat => (
                  <button
                    key={cat}
                    id={`cat-${cat}`}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`pill transition-all duration-300 ${selectedCategory === cat
                      ? 'text-white shadow-[0_10px_28px_rgba(212,119,58,0.28)]'
                      : 'text-charcoal hover:bg-[rgba(212,119,58,0.1)]'
                      }`}
                    style={
                      selectedCategory === cat
                        ? { background: 'linear-gradient(135deg,var(--color-coral),var(--color-gold))', border: 'none' }
                        : { background: 'var(--color-warm)', border: '1px solid var(--color-border)' }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative mt-2 animate-fadeIn stagger-2">
                <SearchIcon />
                <input
                  type="search"
                  id="main-search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث عن اسم وصفة، مكون، أو قسم..."
                  className="field-base w-full pr-12 py-4 text-base shadow-sm border-2 border-border/40"
                  style={{ borderRadius: '1.25rem', paddingRight: '3.5rem' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="glass-panel rounded-4xl py-20 text-center">
            <p className="mb-3 text-5xl">⚠️</p>
            <h3 className="mb-2 font-display text-xl font-semibold text-charcoal">
              تعذّر تحميل الوصفات
            </h3>
            <p className="text-sm text-stone">{error}</p>
            <p className="mt-4 text-xs text-stone/60 max-w-sm mx-auto leading-relaxed">
              تأكد من اتصالك بالإنترنت ومن صحة إعدادات Firebase في ملف الـ .env. 
              إذا استمرت المشكلة، يرجى مراجعة سجلات الـ Console.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="glass-panel rounded-4xl py-24 text-center animate-scaleIn">
            <p className="mb-4 text-6xl animate-float">{search ? '🔍' : '🍽️'}</p>
            <h3 className="mb-2 font-display text-2xl font-semibold text-charcoal">
              {search ? 'لا توجد نتائج' : 'لا توجد وصفات بعد'}
            </h3>
            <p className="text-sm text-stone">
              {search ? 'جرّب كلمة بحث مختلفة.' : 'كن أول من يشارك وصفة!'}
            </p>
            {!search && (
              <button
                id="empty-add-btn"
                onClick={openAddFlow}
                className="btn-primary mt-6 rounded-full px-7 py-3 text-sm font-semibold"
              >
                {user ? '🍴 أضف أول وصفة' : 'سجّل الدخول للإضافة'}
              </button>
            )}
          </div>
        )}

        {/* Recipe grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} onClick={setSelectedRecipe} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border py-10 text-center">
        <p className="text-base font-medium text-stone">
          🍳 وصفات العيلة
        </p>
        <p className="mt-1 text-xs text-stone/70">
          منصة عائلة أبو زيد لمشاركة الوصفات المنزلية
        </p>
      </footer>

      {/* Modals */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          categories={categories}
          onClose={() => setSelectedRecipe(null)}
          onUpdated={(recipe) => { setSelectedRecipe(recipe); }}
          onDeleted={() => { setSelectedRecipe(null); }}
        />
      )}
      {showAdd && (
        <AddRecipeModal
          onClose={() => setShowAdd(false)}
          onCreated={() => setShowAdd(false)}
          categories={categories}
        />
      )}
      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />
      )}
      
      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutConfirm(false); }}
        >
          <div className="animate-scaleIn w-full max-w-sm rounded-4xl border border-white/40 bg-white p-8 shadow-[0_40px_100px_rgba(15,23,42,0.25)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl mb-6 mx-auto border border-amber-100/50">
              🚪
            </div>
            <h3 className="text-center font-display text-2xl font-bold text-charcoal">تأكيد الخروج</h3>
            <p className="mt-4 text-center leading-relaxed text-stone">
              هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-ghost flex-1 py-3.5 text-sm font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  void logout();
                  setShowLogoutConfirm(false);
                }}
                className="btn-primary flex-1 py-3.5 text-sm font-bold rounded-xl shadow-lg shadow-amber-200"
              >
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
