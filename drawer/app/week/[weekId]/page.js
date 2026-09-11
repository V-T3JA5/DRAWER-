import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getWeek,
  getWeekTitle,
  getWeekDesc,
  getTheoryText,
  getContentUrl,
  getContentWeekIds,
  getQuestionTitle,
} from '../../../lib/content';
import WeekPageClient from './WeekPageClient';

export function generateStaticParams() {
  return getContentWeekIds().map((id) => ({ weekId: String(id) }));
}

// Only weeks the manifest marks hasContent get a route at all — a
// "coming soon" week has no card link to it, and typing the URL by hand
// should 404 cleanly rather than render an empty page.
export const dynamicParams = false;

export default function WeekPage({ params }) {
  const weekId = Number(params.weekId);
  const week = getWeek(weekId);

  if (!week || !week.hasContent) {
    notFound();
  }

  const title = getWeekTitle(weekId);
  const desc = getWeekDesc(weekId);

  const theory = {
    prelab: {
      text: getTheoryText(weekId, 'prelab'),
      image: getContentUrl(weekId, week.theory.prelab.image),
    },
    postlab: {
      text: getTheoryText(weekId, 'postlab'),
      image: getContentUrl(weekId, week.theory.postlab.image),
    },
    procedure: {
      text: getTheoryText(weekId, 'procedure'),
      image: getContentUrl(weekId, week.theory.procedure.image),
    },
  };

  const questions = week.questions
    .filter((q) => q.hasTitle && q.stepCount > 0)
    .map((q) => ({
      id: q.id,
      title: getQuestionTitle(weekId, q.id),
      stepCount: q.stepCount,
    }));

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="wordmark-link">DRAWER</Link>
          <Link href="/" className="back-link">← All weeks</Link>
        </div>
      </header>
      <WeekPageClient weekId={weekId} title={title} desc={desc} theory={theory} questions={questions} />
    </>
  );
}
