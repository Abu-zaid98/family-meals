import type { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  index: number;
  onClick: (recipe: Recipe) => void;
}

/* Emoji pool for food variety — deterministic by title length */
const FOOD_EMOJIS = ['🍲', '🥘', '🍛', '🥗', '🫕', '🍜', '🥙', '🍱', '🫔', '🍢'];

function getFoodEmoji(title: string) {
  return FOOD_EMOJIS[title.length % FOOD_EMOJIS.length];
}

/* Gradient pool for the icon badge */
const GRADIENTS = [
  'linear-gradient(135deg,#e8623a,#f0c060)',
  'linear-gradient(135deg,#e8623a,#e8a96e)',
  'linear-gradient(135deg,#f0c060,#e8a96e)',
  'linear-gradient(135deg,#d4773a,#f0c060)',
  'linear-gradient(135deg,#e05c3a,#d4773a)',
];

function getGradient(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

export function RecipeCard({ recipe, index, onClick }: Props) {
  const stagger = Math.min(index + 1, 6);
  const category = recipe.category || 'عام';
  const emoji = getFoodEmoji(recipe.title);
  const gradient = getGradient(index);
  const dateStr = new Date(recipe.createdAt).toLocaleDateString('ar', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className={`recipe-card animate-fadeUp stagger-${stagger} cursor-pointer rounded-[1.8rem] group overflow-hidden`}
      onClick={() => onClick(recipe)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(recipe)}
    >
      {/* Top accent stripe */}
      <div
        className="h-1.5 w-full"
        style={{ background: gradient }}
      />

      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Category badge */}
            <span
              className="pill"
              style={{
                background: 'rgba(212,119,58,0.12)',
                color: 'var(--color-amber-dark)',
                border: '1px solid rgba(212,119,58,0.18)',
              }}
            >
              {category}
            </span>

            {/* Title */}
            <h3 className="mt-3 font-display text-[1.35rem] font-bold leading-snug text-charcoal transition-colors duration-200 group-hover:text-amber-dark line-clamp-2">
              {recipe.title}
            </h3>
          </div>

          {/* Icon badge */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-[0_8px_20px_rgba(212,119,58,0.22)] transition-transform duration-300 group-hover:scale-110"
            style={{ background: gradient }}
          >
            {emoji}
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-3 text-sm leading-[1.85] text-stone">
          {recipe.description}
        </p>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div className="flex flex-col gap-0.5 text-xs text-stone">
            <span>{dateStr}</span>
            <span className="font-medium text-charcoal">
              {recipe.authorName}
            </span>
          </div>

          <span
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200"
            style={{
              background: 'rgba(212,119,58,0.1)',
              color: 'var(--color-amber-dark)',
            }}
          >
            عرض الوصفة
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="currentColor"
              style={{ transform: 'rotate(180deg)' }}
            >
              <path d="M10.7 8.7a1 1 0 0 0 0-1.4l-4-4a1 1 0 1 0-1.4 1.4L8.6 8l-3.3 3.3a1 1 0 1 0 1.4 1.4l4-4z" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}
