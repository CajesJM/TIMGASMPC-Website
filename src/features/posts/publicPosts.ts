import { isPostCategory, type PublishedPost } from './postTypes';

type FirestoreValue = { stringValue?: string };
type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
};

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

export async function fetchPublishedPosts(): Promise<PublishedPost[]> {
  if (!projectId || !apiKey) return [];

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'posts' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'status' },
              op: 'EQUAL',
              value: { stringValue: 'published' },
            },
          },
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`Firestore returned ${response.status}.`);
  const results = await response.json() as Array<{ document?: FirestoreDocument }>;

  return results.flatMap(({ document }) => {
    if (!document?.fields) return [];
    const category = document.fields.category?.stringValue;
    if (!isPostCategory(category)) return [];
    return [{
      id: document.name?.split('/').pop() ?? crypto.randomUUID(),
      category,
      date: document.fields.date?.stringValue ?? '',
      title: document.fields.title?.stringValue ?? '',
      description: document.fields.description?.stringValue ?? '',
      photoUrl: document.fields.photoUrl?.stringValue ?? '',
      photoPath: document.fields.photoPath?.stringValue ?? '',
    }];
  }).filter((post) => post.title && post.description)
    .sort((first, second) => second.date.localeCompare(first.date));
}
