import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWeek, getWeekTitle, getQuestionTitle, getStepText, getContentUrl, getAllQuestionParams } from '../../../../../lib/content';
import TutorialClient from './TutorialClient';

export function generateStaticParams() {
  return getAllQuestionParams();
}

export const dynamicParams = false;

export default function TutorialPage({ params }) {
  const weekId = Number(params.weekId);
  const questionId = Number(params.questionId);

  const week = getWeek(weekId);
  if (!week || !week.hasContent) {
    notFound();
  }

  const question = week.questions.find((q) => q.id === questionId);
  if (!question || !question.hasTitle || question.stepCount === 0) {
    notFound();
  }

  const weekTitle = getWeekTitle(weekId);
  const questionTitle = getQuestionTitle(weekId, questionId);

  const steps = question.steps.map((s) => ({
    step: s.step,
    text: getStepText(weekId, questionId, s.step),
    image: getContentUrl(weekId, s.image),
  }));

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="wordmark-link">DRAWER</Link>
          <Link href={`/week/${weekId}`} className="back-link">← Back to {weekTitle}</Link>
        </div>
      </header>
      <TutorialClient weekId={weekId} weekTitle={weekTitle} questionTitle={questionTitle} steps={steps} />
    </>
  );
}
