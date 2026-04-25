import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';

interface Props {
  mode: 'login' | 'register';
  onClose: () => void;
}

export function AuthModal({ mode: initialMode, onClose }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      onClose();
    } catch (error) {
      setError(getErrorMessage(error, 'فشل التحقق من بيانات الحساب.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(12px)' }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="animate-scaleIn bg-white rounded-[2.2rem] w-full max-w-md p-8 shadow-[0_40px_100px_rgba(15,23,42,0.25)] border border-white/40 overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[rgba(240,192,96,0.12)] blur-3xl p-6" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[rgba(232,98,58,0.1)] blur-3xl p-6" />

        <div className="relative flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-amber-dark uppercase mb-1">✦ مجتمع الطهاة ✦</p>
            <h2 className="text-3xl font-bold text-charcoal font-display">
              {mode === 'login' ? 'أهلاً بك مرة أخرى' : 'اصنع مطبخك الخاص'}
            </h2>
            <p className="text-sm text-stone mt-2 leading-relaxed">
              {mode === 'login'
                ? 'سجل دخولك لتتمكن من إضافة وصفاتك ومشاركتها مع العائلة.'
                : 'انضم إلينا اليوم وابدأ في تدوين أجمل اللحظات والنكهات.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-warm/50 text-charcoal hover:bg-white hover:scale-110 active:scale-90 transition-all border border-border/40 backdrop-blur-md shadow-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-5">
          {mode === 'register' && (
            <div className="animate-slideInRight stagger-1">
              <label className="block text-xs font-bold tracking-widest text-charcoal uppercase mb-2">اسمك الظاهر</label>
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="مثال: الشيف أحمد"
                className="field-base"
                required
              />
            </div>
          )}

          <div className="animate-slideInRight stagger-2">
            <label className="block text-xs font-bold tracking-widest text-charcoal uppercase mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="chef@example.com"
              className="field-base"
              required
            />
          </div>

          <div className="animate-slideInRight stagger-3">
            <label className="block text-xs font-bold tracking-widest text-charcoal uppercase mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="٦ أحرف على الأقل"
              className="field-base"
              required
            />
          </div>

          {error && (
            <div className="animate-fadeDown rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-3">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-4 text-sm font-bold rounded-2xl mt-4 flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                جارٍ التحقق...
              </>
            ) : (
              mode === 'login' ? '🍴 دخول' : '✨ إنشاء الحساب'
            )}
          </button>
        </form>

        <div className="relative mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-stone">
            {mode === 'login' ? 'لا تملك حساباً بعد؟' : 'لديك حساب بالفعل؟'}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="px-2 font-bold text-amber-dark hover:underline decoration-amber-200 underline-offset-4"
            >
              {mode === 'login' ? 'سجّل مجاناً' : 'سجّل دخولك'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
