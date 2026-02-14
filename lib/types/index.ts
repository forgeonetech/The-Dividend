// ============================================
// THE DIVIDEND — TypeScript Types
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  avatar_url: string | null;
  bio: string;
  provider: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  image_url: string;
  post_count: number;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  banner_url: string | null;
  excerpt: string;
  content: Record<string, unknown>;
  author_id: string;
  category_id: string | null;
  read_time: number;
  views: number;
  likes: number;
  is_featured: boolean;
  is_editors_pick: boolean;
  status: 'draft' | 'published';
  seo_keywords: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  // Joined fields
  author?: User;
  category?: Category;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  user?: User;
  replies?: Comment[];
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  // Joined
  article?: Article;
}

export interface ArticleLike {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  description: string;
  price: number;
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
}

export interface Purchase {
  id: string;
  user_id: string;
  book_id: string;
  amount: number;
  paystack_reference: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
  // Joined
  book?: Book;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'general' | 'article' | 'comment' | 'message' | 'purchase';
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  // Joined
  sender?: User;
  receiver?: User;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  article_id: string;
  last_read_at: string;
  // Joined
  article?: Article;
}

// ============================================
// API & Component Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ArticleFilters {
  category?: string;
  search?: string;
  sort?: 'newest' | 'trending' | 'most_read';
  page?: number;
  pageSize?: number;
}

export interface BookFilters {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export type EditorContent = {
  type: string;
  content: unknown[];
};
