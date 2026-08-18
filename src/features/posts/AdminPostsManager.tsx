import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { ChevronLeft, ChevronRight, FileImage, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { db } from '../../lib/firestore';
import { deleteStorageFile, storage } from '../../lib/storage';
import {
  formatPostDate,
  isPostCategory,
  postCategoryLabels,
  type PostCategory,
  type PublishedPost,
} from './postTypes';
import styles from './AdminPostsManager.module.css';

const maximumImageSize = 5 * 1024 * 1024;
const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const postsPerPage = 5;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function AdminPostsManager() {
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [category, setCategory] = useState<PostCategory>('announcement');
  const [date, setDate] = useState(today());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('');
  const [existingPhotoPath, setExistingPhotoPath] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(db));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(db ? '' : 'Firestore is not configured.');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PostCategory>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const publishedListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!db) return;
    const postsQuery = query(collection(db, 'posts'), orderBy('date', 'desc'));
    return onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.flatMap((postDocument) => {
        const data = postDocument.data();
        if (!isPostCategory(data.category)) return [];
        return [{
          id: postDocument.id,
          category: data.category,
          date: typeof data.date === 'string' ? data.date : '',
          title: typeof data.title === 'string' ? data.title : '',
          description: typeof data.description === 'string' ? data.description : '',
          photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : '',
          photoPath: typeof data.photoPath === 'string' ? data.photoPath : '',
        }];
      }));
      setLoading(false);
      setError('');
    }, (snapshotError) => {
      console.error('Unable to load published posts.', snapshotError);
      setLoading(false);
      setError('Unable to load posts from Firestore.');
    });
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesSearch = !normalizedSearch
      || post.title.toLowerCase().includes(normalizedSearch)
      || post.description.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visiblePosts = filteredPosts.slice((safeCurrentPage - 1) * postsPerPage, safeCurrentPage * postsPerPage);

  const changePage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    publishedListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetForm = () => {
    setCategory('announcement');
    setDate(today());
    setTitle('');
    setDescription('');
    setPhoto(null);
    setExistingPhotoUrl('');
    setExistingPhotoPath('');
    setRemovePhoto(false);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const editPost = (post: PublishedPost) => {
    setCategory(post.category);
    setDate(post.date);
    setTitle(post.title);
    setDescription(post.description);
    setPhoto(null);
    setExistingPhotoUrl(post.photoUrl);
    setExistingPhotoPath(post.photoPath);
    setRemovePhoto(false);
    setEditingId(post.id);
    setMessage('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    document.querySelector('#post-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validatePhoto = (file: File | null) => {
    if (!file) return '';
    if (!acceptedImageTypes.includes(file.type)) return 'Use a JPEG, PNG, or WebP image.';
    if (file.size > maximumImageSize) return 'The photo must be smaller than 5 MB.';
    return '';
  };

  const savePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!db) return setError('Firestore is not configured.');
    const imageError = validatePhoto(photo);
    if (imageError) return setError(imageError);
    if (photo && !storage) return setError('Firebase Storage is not configured.');

    setSaving(true);
    const postRef = editingId ? doc(db, 'posts', editingId) : doc(collection(db, 'posts'));
    let nextPhotoUrl = removePhoto ? '' : existingPhotoUrl;
    let nextPhotoPath = removePhoto ? '' : existingPhotoPath;
    let uploadedPath = '';

    try {
      if (photo && storage) {
        uploadedPath = `posts/${postRef.id}/${Date.now()}-${safeFileName(photo.name)}`;
        const imageRef = ref(storage, uploadedPath);
        await uploadBytes(imageRef, photo, { contentType: photo.type });
        nextPhotoUrl = await getDownloadURL(imageRef);
        nextPhotoPath = uploadedPath;
      }

      const postData = {
        category,
        date,
        title: title.trim(),
        description: description.trim(),
        photoUrl: nextPhotoUrl,
        photoPath: nextPhotoPath,
        status: 'published',
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(postRef, postData);
      } else {
        await setDoc(postRef, { ...postData, createdAt: serverTimestamp() });
      }

      let oldPhotoCleanupFailed = false;
      const previousPhotoLocation = existingPhotoPath || existingPhotoUrl;
      const nextPhotoLocation = nextPhotoPath || nextPhotoUrl;
      if (
        (removePhoto || uploadedPath)
        && previousPhotoLocation
        && previousPhotoLocation !== nextPhotoLocation
      ) {
        try {
          await deleteStorageFile(existingPhotoPath, existingPhotoUrl);
        } catch (cleanupError) {
          oldPhotoCleanupFailed = true;
          console.error('The old post photo could not be removed from Storage.', cleanupError);
        }
      }

      const successMessage = editingId ? 'Post updated successfully.' : 'Post published successfully.';
      setMessage(oldPhotoCleanupFailed
        ? `${successMessage} The previous photo could not be removed from Storage; please try editing the post again.`
        : successMessage);
      if (!editingId) setCurrentPage(1);
      resetForm();
    } catch (saveError) {
      console.error('Unable to save post.', saveError);
      if (uploadedPath) await deleteStorageFile(uploadedPath).catch(() => undefined);
      setError('The post could not be saved. Confirm that Blaze Storage is active and try again.');
    } finally {
      setSaving(false);
    }
  };

  const removePost = async (post: PublishedPost) => {
    if (!db || !window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setMessage('');
    setError('');
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      let photoCleanupFailed = false;
      try {
        await deleteStorageFile(post.photoPath, post.photoUrl);
      } catch (cleanupError) {
        photoCleanupFailed = true;
        console.error('The deleted post photo could not be removed from Storage.', cleanupError);
      }
      if (editingId === post.id) resetForm();
      setMessage(photoCleanupFailed
        ? 'Post deleted from Firestore, but its photo could not be removed from Storage.'
        : 'Post and its photo deleted successfully.');
    } catch (deleteError) {
      console.error('Unable to delete post.', deleteError);
      setError('The post could not be deleted. Please try again.');
    }
  };

  return <section className={styles.manager} id="posts" aria-labelledby="posts-heading">
    <div className={styles.heading}>
      <div><p className="eyebrow">Public content</p><h2 id="posts-heading">Updates and certifications</h2><p>Updates appear in the public News section, while certifications appear beside the cooperative’s About content.</p></div>
      <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
    </div>

    <div className={styles.layout}>
      <form className={styles.form} id="post-editor" onSubmit={savePost}>
        <div className={styles.formHeading}><div><h3>{editingId ? 'Edit post' : 'Create a post'}</h3><p>All fields except the photo are required.</p></div>{editingId && <button type="button" onClick={resetForm} aria-label="Cancel editing"><X /></button>}</div>
        <div className={styles.row}>
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value as PostCategory)}><option value="announcement">Announcement</option><option value="news">News</option><option value="achievement">Achievement</option><option value="certification">Certification</option></select></label>
          <label>Date<input type="date" value={date} max="9999-12-31" onChange={(event) => setDate(event.target.value)} required /></label>
        </div>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={120} placeholder="Enter a clear title" required /></label>
        <label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={2000} rows={6} placeholder="Write the verified details for members and visitors" required /><small>{description.length}/2000</small></label>
        <label>Photo <span>(optional)</span><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = event.target.files?.[0] ?? null; setPhoto(selected); setRemovePhoto(false); }} /><small>JPEG, PNG, or WebP; maximum 5 MB.</small></label>
        {photo && <div className={styles.file}><FileImage /><span>{photo.name}</span><button type="button" onClick={() => { setPhoto(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} aria-label="Remove selected photo"><X /></button></div>}
        {!photo && existingPhotoUrl && !removePhoto && <div className={styles.existingPhoto}><img src={existingPhotoUrl} alt="Current post" /><button type="button" onClick={() => setRemovePhoto(true)}>Remove current photo</button></div>}
        {removePhoto && <button className={styles.restore} type="button" onClick={() => setRemovePhoto(false)}>Keep current photo</button>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {message && <p className={styles.success} role="status">{message}</p>}
        <button className={styles.submit} type="submit" disabled={saving}>{editingId ? <Pencil /> : <Plus />}{saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish post'}</button>
      </form>

      <div className={styles.list} aria-busy={loading} ref={publishedListRef}>
        <div className={styles.listHeading}><div className={styles.listTitle}><h3>Published posts</h3>{posts.length > 0 && <span>{filteredPosts.length === posts.length ? `${posts.length} total` : `${filteredPosts.length} of ${posts.length}`}</span>}</div><div className={styles.listFilters}><label className={styles.search}><Search aria-hidden="true" /><span className="srOnly">Search published posts</span><input type="search" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} placeholder="Search posts" /></label><label className={styles.categoryFilter}><span className="srOnly">Filter published posts by category</span><select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value as 'all' | PostCategory); setCurrentPage(1); }}><option value="all">All categories</option><option value="announcement">Announcements</option><option value="news">News</option><option value="achievement">Achievements</option><option value="certification">Certifications</option></select></label></div></div>
        {loading ? <p className={styles.empty}>Loading posts…</p> : posts.length === 0 ? <p className={styles.empty}>No posts have been published yet.</p> : filteredPosts.length === 0 ? <div className={styles.empty}><Search aria-hidden="true" /><strong>No matching posts</strong><span>Try a different search term or category.</span></div> : <>{visiblePosts.map((post) => <article key={post.id}>
          {post.photoUrl ? <img src={post.photoUrl} alt="" /> : <div className={styles.noPhoto}><FileImage aria-hidden="true" /></div>}
          <div className={styles.postBody}><div className={styles.meta}><span>{postCategoryLabels[post.category]}</span><time dateTime={post.date}>{formatPostDate(post.date)}</time></div><h4>{post.title}</h4><p>{post.description}</p><div className={styles.controls}><button type="button" onClick={() => editPost(post)}><Pencil /> Edit</button><button type="button" onClick={() => void removePost(post)}><Trash2 /> Delete</button></div></div>
        </article>)}{totalPages > 1 && <nav className={styles.pagination} aria-label="Published posts pagination"><button type="button" onClick={() => changePage(safeCurrentPage - 1)} disabled={safeCurrentPage === 1}><ChevronLeft /> Previous</button><span>Page <strong>{safeCurrentPage}</strong> of {totalPages}</span><button type="button" onClick={() => changePage(safeCurrentPage + 1)} disabled={safeCurrentPage === totalPages}>Next <ChevronRight /></button></nav>}</>}
      </div>
    </div>
  </section>;
}
