import { BLOG_ERROR, DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from '@core/common/input-normalize/input-normalize.policy';
import { ArticleStatus, CommentStatus } from '@src/modules/blog/blog.types';

export function normalizeArticleTitle(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '文章标题' });
    if (normalized.length > 200) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文章标题长度不能超过 200');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文章标题不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文章标题必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeArticleContent(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '文章内容' });
    if (normalized.length > 50000) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文章内容长度不能超过 50000');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文章内容不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文章内容必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeArticleSummary(input: unknown): string {
  const normalized = normalizeOptionalText(input, 'keep_empty_string', { fieldName: '文章摘要' });
  if (normalized && normalized.length > 500) {
    throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文章摘要长度不能超过 500');
  }
  return normalized || '';
}

export function normalizeArticleCoverImage(input: unknown): string | undefined {
  const normalized = normalizeNullableText(input, { fieldName: '封面图片' });
  return normalized ?? undefined;
}

export function normalizeArticleIsPinned(input: unknown): boolean {
  if (input === undefined || input === null) {
    return false;
  }
  if (typeof input !== 'boolean') {
    throw new DomainError(BLOG_ERROR.CREATE_FAILED, '置顶标识必须是布尔值');
  }
  return input;
}

export function normalizeArticleStatus(input: unknown): ArticleStatus {
  if (input === undefined || input === null) {
    return ArticleStatus.DRAFT;
  }
  if (typeof input !== 'string') {
    throw new DomainError(BLOG_ERROR.CREATE_FAILED, '文章状态必须是字符串');
  }
  const normalized = input.trim();
  if (!Object.values(ArticleStatus).includes(normalized as ArticleStatus)) {
    throw new DomainError(BLOG_ERROR.CREATE_FAILED, '无效的文章状态');
  }
  return normalized as ArticleStatus;
}

export function normalizeCategoryName(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '分类名称' });
    if (normalized.length > 50) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '分类名称长度不能超过 50');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '分类名称不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '分类名称必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeCategorySlug(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '分类标识' });
    if (!/^[a-z0-9-]+$/.test(normalized)) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '分类标识只能包含小写字母、数字和连字符');
    }
    if (normalized.length > 50) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '分类标识长度不能超过 50');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '分类标识不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '分类标识必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeCategoryDescription(input: unknown): string | undefined {
  const normalized = normalizeNullableText(input, { fieldName: '分类描述' });
  if (normalized && normalized.length > 200) {
    throw new DomainError(BLOG_ERROR.CREATE_FAILED, '分类描述长度不能超过 200');
  }
  return normalized ?? undefined;
}

export function normalizeTagName(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '标签名称' });
    if (normalized.length > 50) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '标签名称长度不能超过 50');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '标签名称不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '标签名称必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeTagSlug(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '标签标识' });
    if (!/^[a-z0-9-]+$/.test(normalized)) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '标签标识只能包含小写字母、数字和连字符');
    }
    if (normalized.length > 50) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '标签标识长度不能超过 50');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '标签标识不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '标签标识必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeCommentContent(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '评论内容' });
    if (normalized.length > 2000) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论内容长度不能超过 2000');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论内容不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论内容必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeCommentAuthorName(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '评论者名称' });
    if (normalized.length > 64) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论者名称长度不能超过 64');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论者名称不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论者名称必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeCommentAuthorEmail(input: unknown): string {
  try {
    const normalized = normalizeRequiredText(input, { fieldName: '评论者邮箱' });
    if (normalized.length > 128) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论者邮箱长度不能超过 128');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, '无效的邮箱格式');
    }
    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论者邮箱不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '评论者邮箱必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeCommentStatus(input: unknown): CommentStatus {
  if (input === undefined || input === null) {
    throw new DomainError(BLOG_ERROR.UPDATE_FAILED, '评论状态不能为空');
  }
  if (typeof input !== 'string') {
    throw new DomainError(BLOG_ERROR.UPDATE_FAILED, '评论状态必须是字符串');
  }
  const normalized = input.trim();
  if (!Object.values(CommentStatus).includes(normalized as CommentStatus)) {
    throw new DomainError(BLOG_ERROR.UPDATE_FAILED, '无效的评论状态');
  }
  return normalized as CommentStatus;
}

export function normalizeAuthorId(input: unknown): string {
  try {
    return normalizeRequiredText(input, { fieldName: '作者ID' });
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '作者ID不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CREATE_FAILED, '作者ID必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeArticleId(input: unknown): string {
  try {
    return normalizeRequiredText(input, { fieldName: '文章ID' });
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章ID不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.ARTICLE_NOT_FOUND, '文章ID必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeCategoryId(input: unknown): string {
  try {
    return normalizeRequiredText(input, { fieldName: '分类ID' });
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.CATEGORY_NOT_FOUND, '分类ID不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.CATEGORY_NOT_FOUND, '分类ID必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeTagId(input: unknown): string {
  try {
    return normalizeRequiredText(input, { fieldName: '标签ID' });
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.TAG_NOT_FOUND, '标签ID不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.TAG_NOT_FOUND, '标签ID必须是字符串');
      }
    }
    throw error;
  }
}

export function normalizeCommentId(input: unknown): string {
  try {
    return normalizeRequiredText(input, { fieldName: '评论ID' });
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY) {
        throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论ID不能为空');
      }
      if (error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
        throw new DomainError(BLOG_ERROR.COMMENT_NOT_FOUND, '评论ID必须是字符串');
      }
    }
    throw error;
  }
}

function normalizeNullableText(input: unknown, options: { fieldName: string }): string | null {
  try {
    const normalized = normalizeOptionalText(input, 'to_null', { fieldName: options.fieldName });
    return normalized ?? null;
  } catch (error) {
    if (error instanceof DomainError && error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT) {
      throw new DomainError(BLOG_ERROR.CREATE_FAILED, `${options.fieldName}必须是字符串`);
    }
    throw error;
  }
}

export function normalizeEmailForAvatar(input: string): string {
  return input.toLowerCase();
}
