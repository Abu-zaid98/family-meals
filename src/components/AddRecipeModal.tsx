import { useState, useEffect, useCallback, useRef } from 'react';
import { recipeService } from '../services/recipeService';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { VoiceButton } from './VoiceButton';
import { useAuth } from '../context/AuthContext';


interface Props {
  onClose: () => void;
  onCreated: () => void;
  categories: string[];
}

type DictationField = 'title' | 'description' | 'ingredients' | 'steps' | null;

export function AddRecipeModal({ onClose, onCreated, categories }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    category: categories[0] || '',
    description: '',
    ingredients: '',
    steps: '',
  });
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(categories.length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dictationField, setDictationField] = useState<DictationField>(null);
  const activeFieldRef = useRef<DictationField>(null);

  const handleTranscript = useCallback((text: string) => {
    const field = activeFieldRef.current;
    if (!field) return;

    let nextValue = text;

    if (field === 'ingredients') {
      nextValue = text.replace(/\s*[،,]\s*/g, '\n').replace(/\n{2,}/g, '\n');
    }

    if (field === 'steps') {
      nextValue = text
        .replace(/\s*(ثم|بعد ذلك|بعدها)\s+/g, '\n')
        .replace(/\s*[.،]\s*/g, '\n')
        .replace(/\n{2,}/g, '\n');
    }

    setForm(prev => ({ ...prev, [field]: nextValue }));
  }, []);

  const { isRecording, error: voiceError, startRecording, stopRecording } = useVoiceInput({
    onTranscript: handleTranscript,
    language: 'ar-PS',
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isRecording) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, isRecording]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCategory = isAddingCategory ? customCategory.trim() : form.category.trim();

    if (!form.title.trim() || !normalizedCategory || !form.description.trim() || !form.ingredients.trim() || !form.steps.trim()) {
      setError('يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await recipeService.create({
        ...form,
        category: normalizedCategory,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'تعذّر إضافة الوصفة.');
    } finally {
      setSubmitting(false);
    }
  };

  const startFieldDictation = async (field: DictationField) => {
    if (!field) return;
    if (isRecording) stopRecording();

    activeFieldRef.current = field;
    setDictationField(field);

    const currentValue = form[field] || '';
    const separator = currentValue.trim()
      ? field === 'ingredients' || field === 'steps'
        ? '\n'
        : ' '
      : '';

    await startRecording({ initialText: currentValue, separator });
  };

  const stopFieldDictation = () => {
    activeFieldRef.current = null;
    stopRecording();
  };

  const dictationLabelMap: Record<Exclude<DictationField, null>, string> = {
    title: 'العنوان',
    description: 'الوصف',
    ingredients: 'المكونات',
    steps: 'الخطوات',
  };

  const fieldWrapperClass = "glass-panel rounded-[1.75rem] p-5 sm:p-6 space-y-3 transition-all duration-300 border-white/50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isRecording) onClose(); }}
    >
      <div className="animate-scaleIn flex h-full max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.2rem] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.25)] border border-white/40">

        {/* Modal Header (Sticky) */}
        <div className="sticky top-0 z-10 overflow-hidden border-b border-border bg-white/80 backdrop-blur-xl px-6 py-6 sm:px-8">
          <div className="absolute -top-10 left-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl text-amber-500!" />
          <div className="absolute -bottom-10 right-6 h-28 w-28 rounded-full bg-coral/8 blur-3xl text-coral!" />
          
          <button
            onClick={() => { if (!isRecording) onClose(); }}
            className="absolute top-5 left-5 flex h-10 w-10 items-center justify-center rounded-full bg-warm/50 text-charcoal shadow-sm border border-border/50 backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.7 3.3a1 1 0 0 0-1.4 0L8 6.6 4.7 3.3a1 1 0 0 0-1.4 1.4L6.6 8l-3.3 3.3a1 1 0 1 0 1.4 1.4L8 9.4l3.3 3.3a1 1 0 0 0 1.4-1.4L9.4 8l3.3-3.3a1 1 0 0 0 0-1.4z" />
            </svg>
          </button>

          <p className="text-[10px] font-bold tracking-[0.3em] text-amber-dark uppercase">✦ إضافة وصفة ✦</p>
          <h2 className="font-display text-2xl font-bold text-charcoal mt-1">اكتب وصفتك بلمسة فاخرة</h2>
          <p className="mt-2 text-[11px] sm:text-xs text-stone font-medium leading-relaxed max-w-sm">
            استخدم الإملاء الصوتي الذكي لكل خانة لتجربة أسرع وأسهل في تدوين وصفاتك المنزلية.
          </p>
        </div>


        {/* Form Body (Scrollable) */}
        <form id="recipe-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-8 bg-[linear-gradient(180deg,#fffdf9,#ffffff)] px-6 py-8 sm:px-10 pb-12">

          {/* Welcome Info Card */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-amber-800">
            <div className="flex gap-3">
              <span className="text-xl">✨</span>
              <p className="leading-relaxed">
                مرحباً <span className="font-bold">{user?.displayName || user?.email}</span>، يمكنك الضغط على زر الميكروفون للبدء في الإملاء الصوتي مباشرة داخل أي خانة.
              </p>
            </div>
          </div>

          {/* Title Field */}
          <div className={fieldWrapperClass}>
            <label className="block text-[10px] font-bold tracking-widest text-stone uppercase mb-2">
              عنوان الوصفة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="مثال: منسف بلدي بالجميد"
              className={`field-base ${dictationField === 'title' ? 'field-active' : ''}`}
            />
            <VoiceButton
              label={dictationLabelMap.title}
              isRecording={isRecording && dictationField === 'title'}
              isActive={dictationField === 'title'}
              onStart={() => void startFieldDictation('title')}
              onStop={stopFieldDictation}
              error={dictationField === 'title' ? voiceError : null}
            />
          </div>

          {/* Category Field */}
          <div className={fieldWrapperClass}>
            <div className="flex items-center justify-between gap-3">
              <label className="block text-[10px] font-bold tracking-widest text-stone uppercase">
                التصنيف <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => { setIsAddingCategory(prev => !prev); setError(null); }}
                className="text-[10px] font-bold text-amber-dark bg-white px-2 py-1 rounded-full border border-border/50 hover:bg-warm transition-colors"
              >
                {isAddingCategory ? 'اختر تصنيفاً موجوداً' : 'أضف تصنيفاً جديداً'}
              </button>
            </div>

            {isAddingCategory ? (
              <input
                type="text"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="مثال: مأكولات شعبية"
                className="field-base"
              />
            ) : (
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="field-base appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236b7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat"
                style={{ backgroundSize: '1.25rem', backgroundPosition: 'left 0.75rem center' }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}
          </div>

          {/* Description Field */}
          <div className={fieldWrapperClass}>
            <label className="block text-[10px] font-bold tracking-widest text-stone uppercase mb-2">
              الوصف <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="اكتب وصفاً مختصراً يشوق الجميع لتجربة الوصفة..."
              className={`field-base ${dictationField === 'description' ? 'field-active' : ''}`}
            />
            <VoiceButton
              label={dictationLabelMap.description}
              isRecording={isRecording && dictationField === 'description'}
              isActive={dictationField === 'description'}
              onStart={() => void startFieldDictation('description')}
              onStop={stopFieldDictation}
              error={dictationField === 'description' ? voiceError : null}
            />
          </div>

          {/* Ingredients Field */}
          <div className={fieldWrapperClass}>
            <label className="block text-[10px] font-bold tracking-widest text-stone uppercase mb-2">
              المكونات <span className="text-red-500">*</span>
              <span className="mr-2 font-normal text-stone lowercase opacity-60">(كل مكون في سطر)</span>
            </label>
            <textarea
              rows={5}
              value={form.ingredients}
              onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))}
              placeholder={'٣ أكواب أرز\n١ كغم لحم\nبهارات منوعة'}
              className={`field-base ${dictationField === 'ingredients' ? 'field-active' : ''}`}
            />
            <VoiceButton
              label={dictationLabelMap.ingredients}
              isRecording={isRecording && dictationField === 'ingredients'}
              isActive={dictationField === 'ingredients'}
              onStart={() => void startFieldDictation('ingredients')}
              onStop={stopFieldDictation}
              error={dictationField === 'ingredients' ? voiceError : null}
            />
          </div>

          {/* Steps Field */}
          <div className={fieldWrapperClass}>
            <label className="block text-[10px] font-bold tracking-widest text-stone uppercase mb-2">
              خطوات التحضير <span className="text-red-500">*</span>
              <span className="mr-2 font-normal text-stone lowercase opacity-60">(كل خطوة في سطر)</span>
            </label>
            <textarea
              rows={6}
              value={form.steps}
              onChange={e => setForm(p => ({ ...p, steps: e.target.value }))}
              placeholder={'١. اسلق اللحم مع المطيبات\n٢. انقع الأرز جيداً\n٣. حضر الجميد الأردني'}
              className={`field-base ${dictationField === 'steps' ? 'field-active' : ''}`}
            />
            <VoiceButton
              label={dictationLabelMap.steps}
              isRecording={isRecording && dictationField === 'steps'}
              isActive={dictationField === 'steps'}
              onStart={() => void startFieldDictation('steps')}
              onStop={stopFieldDictation}
              error={dictationField === 'steps' ? voiceError : null}
            />
          </div>

          {error && (
            <div className="animate-fadeDown rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-3">
              <span>⚠️</span> {error}
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="flex gap-4 border-t border-border bg-gray-50/50 px-6 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => { if (!isRecording) onClose(); }}
            className="btn-ghost flex-1 py-3.5 text-sm font-bold rounded-2xl"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="recipe-form"
            disabled={submitting}
            className="btn-primary flex-[1.5] flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-2xl"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                جار النشر...
              </>
            ) : (
              '🍴 انشر وصفتك الآن'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
