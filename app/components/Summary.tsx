import React from 'react';
import ScoreGauge from '~/components/ScoreGauge';
import ScoreBadge from '~/components/ScoreBadge';
const Category = ({ title, score }: { title: string; score: number }) => {
  const textColor = score > 70 ? 'text-green-600' : score > 49 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <ScoreBadge score={score} />
          <span className={`ml-2 text-xs ${textColor}`}>{score}/100</span>
        </div>
      </div>
    </div>
  );
};
const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white rounded 2xl shadow-md w-full">
      <div className="flex flex-row items-center p-4 gap-4">
        <ScoreGauge score={feedback.overallScore} />

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold"></h2>
          <p className="text-sm text-gray-500">This score is calculated based on these variables.</p>
        </div>
      </div>
      <Category title="Tone and Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>
  );
};

export default Summary;
