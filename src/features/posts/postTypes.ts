export type PostCategory = 'announcement' | 'news' | 'achievement';

export type PublishedPost = {
  id: string;
  category: PostCategory;
  date: string;
  title: string;
  description: string;
  photoUrl: string;
  photoPath: string;
};

export const postCategoryLabels: Record<PostCategory, string> = {
  announcement: 'Announcement',
  news: 'News',
  achievement: 'Achievement',
};

export function isPostCategory(value: unknown): value is PostCategory {
  return value === 'announcement' || value === 'news' || value === 'achievement';
}

export function formatPostDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(parsed);
}
