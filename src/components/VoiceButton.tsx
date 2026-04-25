interface Props {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  label: string;
  isActive?: boolean;
  error?: string | null;
}

export function VoiceButton({ isRecording, onStart, onStop, label, isActive = false, error }: Props) {
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onMouseDown={event => event.preventDefault()}
          onClick={isRecording ? onStop : onStart}
          className={`relative flex items-center gap-3 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isRecording
              ? 'bg-red-500 text-white shadow-[0_12px_24px_rgba(239,68,68,0.3)] hover:bg-red-600 recording-pulse'
              : isActive
                ? 'bg-amber-50 text-amber-dark border-2 border-amber-200 shadow-sm'
                : 'btn-ghost border-2 border-border/60'
            }`}
        >
          {isRecording ? (
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              <span>إيقاف إملاء {label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🎙️</span>
              <span>إملاء {label}</span>
            </div>
          )}
        </button>

        {isActive && !isRecording && (
          <span className="animate-scaleIn flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100 italic">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            النظام جاهز للاستماع
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-2 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
          <span>❌</span> {error}
        </p>
      )}

      {isRecording && (
        <div className="animate-fadeUp flex items-center gap-3 bg-amber-50/80 p-3 rounded-2xl border border-amber-100 shadow-inner">
          <div className="flex space-x-1 space-x-reverse items-center justify-center">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 20 + 8}px`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-xs text-amber-dark font-bold">
            جاري الاستماع... تحدّث الآن بوضوح وسيظهر كلامك داخل {label}.
          </p>
        </div>
      )}
    </div>
  );
}
