export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HIDDEN = 'HIDDEN',
}

export interface Article {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  summary: string;
  status: ArticleStatus;
  categoryId: string | null;
  authorId: string;
  viewCount: number;
  likeCount: number;
  isPinned: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleTag {
  articleId: string;
  tagId: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  parentId: string | null;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendLink {
  id: string;
  name: string;
  url: string;
  description: string | null;
  logo: string | null;
  sort: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  originalName: string;
  storedName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  coverImage?: string;
  summary: string;
  categoryId?: string;
  isPinned?: boolean;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  coverImage?: string | null;
  summary?: string;
  categoryId?: string | null;
  isPinned?: boolean;
  status?: ArticleStatus;
}

export interface CreateCommentInput {
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  parentId?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sort?: number;
}

export interface CreateTagInput {
  name: string;
  slug?: string;
}
