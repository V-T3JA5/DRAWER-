import { getAllWeeks, getWeekTitle, getWeekDesc, getContentUrl } from '../lib/content';
import HomeClient from './HomeClient';

export default function HomePage() {
  const weeks = getAllWeeks().map((week) => {
    if (!week.hasContent) {
      return { id: week.id, hasContent: false, title: null, desc: null, cover: null };
    }
    return {
      id: week.id,
      hasContent: true,
      title: getWeekTitle(week.id),
      desc: getWeekDesc(week.id),
      cover: getContentUrl(week.id, week.cover),
    };
  });

  return <HomeClient weeks={weeks} />;
}
