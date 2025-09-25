import React from 'react';

interface ScoreBadgeProps {
  score: number;
}

// A small reusable badge that reflects the score with dynamic styles and label
// Rules:
// - > 69: green badge, positive text ("STRONG")
// - > 49: yellow badge, supportive text ("Good start")
// - else: red badge, constructive text ("Needs work")
// Uses Tailwind utility classes.
// Returns a styled div with a single <p> element inside.
const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let bg = 'bg-red-100';
  let text = 'text-red-700';
  let label = 'Needs work';

  if (score > 69) {
    bg = 'bg-green-100';
    text = 'text-green-700';
    label = 'STRONG';
  } else if (score > 49) {
    bg = 'bg-yellow-100';
    text = 'text-yellow-800';
    label = 'Good start';
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text} border border-current`}>
      <p>{label}</p>
    </div>
  );
};

export default ScoreBadge;
