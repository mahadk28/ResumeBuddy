import React from "react";

export type ATSTip = {
  type: "good" | "improve";
  tip: string;
};

interface ATSProps {
  score: number; // 0-100
  suggestions: ATSTip[]; // tips classified as good or improve
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  // Normalize score to 0-100
  const s = clamp(Math.round(score), 0, 100);

  // Tiering logic: >69 green, >49 yellow, else red
  const tier = s > 69 ? "green" : s > 49 ? "yellow" : "red";

  // Gradient + subtle overlay for readability
  const gradients: Record<string, string> = {
    green: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700",
    yellow: "bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600",
    red: "bg-gradient-to-br from-rose-500 via-red-600 to-red-700",
  };

  const borderColors: Record<string, string> = {
    green: "border-emerald-300/50",
    yellow: "border-amber-300/50",
    red: "border-rose-300/50",
  };

  const goodTips = suggestions.filter((t) => t.type === "good");
  const improveTips = suggestions.filter((t) => t.type === "improve");

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 shadow-lg ${gradients[tier]} border ${borderColors[tier]}`}
    >
      {/* soft noise/overlay for dark mode readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-white/90 text-sm tracking-wide uppercase">ATS Score</p>
          <p className="text-white text-3xl font-extrabold drop-shadow-sm">{s}/100</p>
        </div>

        <div className="text-right">
          <span className="inline-block rounded-full bg-white/20 text-white px-3 py-1 text-xs font-medium shadow-sm">
            {tier === "green" ? "Strong Match" : tier === "yellow" ? "Decent Match" : "Needs Work"}
          </span>
        </div>
      </div>

      {(goodTips.length > 0 || improveTips.length > 0) && (
        <div className="relative z-10 mt-4 grid sm:grid-cols-2 gap-4">
          {goodTips.length > 0 && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-white/90 text-sm font-semibold mb-2">What's Good</p>
              <ul className="list-disc list-inside space-y-1">
                {goodTips.map((t, i) => (
                  <li key={`good-${i}`} className="text-white/90 text-sm">
                    {t.tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improveTips.length > 0 && (
            <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-white/90 text-sm font-semibold mb-2">Improvements</p>
              <ul className="list-disc list-inside space-y-1">
                {improveTips.map((t, i) => (
                  <li key={`improve-${i}`} className="text-white/90 text-sm">
                    {t.tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATS;