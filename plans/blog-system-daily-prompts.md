# 博客系统开发计划 - 每日提示词

## 📋 项目架构规则

### 分层依赖方向
```
adapters → usecases → modules → infrastructure → core → types
```

### 核心规则
1. **Entity**：只表达持久化结构，不使用 GraphQL 装饰器
2. **Adapter**：输入解析、权限接入、输出封装，不实现业务逻辑
3. **Usecase**：业务编排、事务边界、权限控制
4. **Module**：同域读写服务，不跨域编排
5. **QueryService**：只读与规范化输出

---

## 🗓️ 第一周：后端基础架构（Day 1-7）

### Day 1: 数据库设计与实体定义

**实现提示词：**
```
根据博客系统需求设计数据库表结构并创建 TypeORM 实体：

1. 文章表 (article)
   - id, title, content (text), cover_image, summary, status (DRAFT/PUBLISHED/ARCHIVED)
   - category_id, author_id, view_count, like_count
   - is_pinned, published_at, created_at, updated_at, deleted_at (软删除)

2. 分类表 (category)
   - id, name, slug, description, parent_id (支持树形结构), sort, created_at, updated_at

3. 标签表 (tag)
   - id, name, slug, created_at, updated_at

4. 文章标签关联表 (article_tag)
   - article_id, tag_id

5. 评论表 (comment)
   - id, article_id, author_name, author_email, author_avatar, content
   - parent_id (楼中楼), status (PENDING/APPROVED/REJECTED/HIDDEN)
   - created_at, updated_at, deleted_at

6. 用户表 (user)
   - id, username, password_hash, nickname, avatar, bio, email
   - created_at, updated_at

7. 友链表 (friend_link)
   - id, name, url, description, logo, sort, is_active, created_at, updated_at

8. 文件表 (file)
   - id, original_name, stored_name, path, url, mime_type, size
   - uploaded_by, created_at, updated_at

请按照项目分层架构规范创建：
- 类型定义放在 src/modules/blog/blog.types.ts
- 实体文件放在 src/modules/blog/entities/
- 使用 snake_case 表名和字段名
- 实体只使用 TypeORM 装饰器，不使用 GraphQL 装饰器
```

**Review 提示词：**
```
请 review 今天创建的博客实体代码：

1. 检查是否符合 Entity 规则：
   - 是否只使用 TypeORM 装饰器
   - 是否没有 GraphQL/HTTP 装饰器
   - 是否没有 class-validator/class-transformer 装饰器

2. 检查命名规范：
   - 表名是否使用单数 snake_case
   - 字段名是否使用 snake_case

3. 检查结构规范：
   - 类型定义是否放在 blog.types.ts
   - 实体是否放在 entities/ 目录
```

---

### Day 2: Repository 与 QueryService

**实现提示词：**
```
为博客系统创建 Repository 和 QueryService：

1. 创建 ArticleRepository，包含以下方法：
   - findPublishedWithPagination(page, limit)
   - findByCategory(categoryId, page, limit)
   - findByTags(tagIds, page, limit)
   - searchByKeyword(keyword, page, limit)
   - findPinnedArticles()
   - incrementViewCount(articleId)
   - incrementLikeCount(articleId)

2. 创建 ArticleQueryService，实现：
   - getArticles(filter, pagination): Promise<PaginatedResult<ArticleView>>
   - getArticleById(id): Promise<ArticleView | null>
   - getArchives(): Promise<Archive[]>  // 按年月统计
   - getCategoryStats(): Promise<CategoryStats[]>

3. 创建 CommentRepository，包含：
   - findApprovedByArticle(articleId, page, limit)
   - findPendingComments(page, limit)
   - buildCommentTree(comments): CommentTree[]

4. 创建 CategoryRepository，支持树形结构查询

请将文件放在 src/modules/blog/ 目录下，遵循 QueryService 规范。
```

**Review 提示词：**
```
请 review 今天创建的 Repository 和 QueryService 代码：

1. 检查是否符合 Modules 规则：
   - 是否没有跨域编排
   - 是否没有全局事务入口
   - 是否没有直接依赖 infrastructure

2. 检查 QueryService：
   - 是否只做只读操作
   - 是否返回 View/DTO，不返回 ORM Entity

3. 检查依赖方向：
   - 是否只依赖 infrastructure 或 core
   - 是否没有依赖 adapters
```

---

### Day 3: GraphQL Schema 定义

**实现提示词：**
```
为博客系统创建 GraphQL Schema：

1. 创建以下 GraphQL 类型（放在 src/adapters/api/graphql/blog/types/）：
   - Article (ObjectType)
   - Category (ObjectType)
   - Tag (ObjectType)
   - Comment (ObjectType)
   - CommentTree (ObjectType) - 用于楼中楼
   - User (ObjectType)
   - FriendLink (ObjectType)
   - File (ObjectType)
   - PaginatedResult (通用分页类型)
   - Archive (ObjectType)
   - DashboardStats (ObjectType)

2. 创建以下输入类型（放在 src/adapters/api/graphql/blog/inputs/）：
   - CreateArticleInput
   - UpdateArticleInput
   - CreateCategoryInput
   - UpdateCategoryInput
   - CreateTagInput
   - UpdateTagInput
   - CreateCommentInput
   - ArticleFilterInput
   - PaginationInput

3. 定义枚举类型（注册到 schema.init.ts）：
   - ArticleStatus (DRAFT, PUBLISHED, ARCHIVED)
   - CommentStatus (PENDING, APPROVED, REJECTED, HIDDEN)

4. 定义查询类型（在 schema 文件中）：
   - articles(pagination, filter): PaginatedResult<Article>!
   - article(id): Article
   - categories: [Category!]!
   - tags: [Tag!]!
   - comments(articleId, pagination): PaginatedResult<CommentTree>!
   - dashboardStats: DashboardStats!
   - archives: [Archive!]!

5. 定义 Mutation：
   - createArticle(input): Article!
   - updateArticle(id, input): Article!
   - deleteArticle(id): Boolean!
   - toggleArticleStatus(id, status): Article!
   - createComment(input): Comment!
   - approveComment(id): Comment!
   - rejectComment(id): Comment!
   - uploadFile(file): File!

请遵循 Adapter 规范，DTO 与 Resolver 放在同一语义目录内。
```

**Review 提示词：**
```
请 review 今天创建的 GraphQL Schema 代码：

1. 检查是否符合 Adapter 规则：
   - 是否没有实现业务逻辑
   - 是否没有直接依赖 modules/service

2. 检查 Schema 组织：
   - 是否在 schema.init.ts 集中注册枚举
   - DTO 是否放在 adapters/api/graphql/blog/ 目录

3. 检查类型定义：
   - 是否有 ObjectType、InputType、ArgsType 的语义拆分
   - 是否使用正确的命名规范（*Input, *Args, *Result）
```

---

### Day 4: 后端 Usecase 层实现（文章模块）

**实现提示词：**
```
实现文章模块的 Usecase 层：

1. 创建 ArticleUsecase，包含以下方法：
   - createArticle(input: CreateArticleInput, authorId: string): Promise<ArticleView>
   - updateArticle(id: string, input: UpdateArticleInput, authorId: string): Promise<ArticleView>
   - deleteArticle(id: string, authorId: string): Promise<void>
   - toggleArticleStatus(id: string, status: ArticleStatus, authorId: string): Promise<ArticleView>
   - getArticleById(id: string): Promise<ArticleView | null>
   - getArticles(filter: ArticleFilterInput, pagination: PaginationInput): Promise<PaginatedResult<ArticleView>>
   - incrementViewCount(articleId: string): Promise<void>
   - incrementLikeCount(articleId: string): Promise<void>

2. 实现业务逻辑：
   - 创建文章时自动生成 slug
   - 删除文章使用软删除
   - 状态切换时验证权限

3. 使用 TransactionRunner 管理事务

4. 创建 usecases 模块和对应的 module 文件

请将文件放在 src/usecases/blog/ 目录下，遵循 Usecase 规范。
```

**Review 提示词：**
```
请 review 今天创建的 ArticleUsecase 代码：

1. 检查是否符合 Usecase 规则：
   - 是否负责写操作编排与业务流程协调
   - 是否不返回 ORM Entity
   - 是否使用 TransactionRunner 管理事务

2. 检查依赖方向：
   - 是否只依赖 modules/service 或 core
   - 是否没有直接依赖 infrastructure

3. 检查错误处理：
   - 是否使用 DomainError
   - 是否有适当的错误映射
```

---

### Day 5: 后端 Usecase 层实现（评论模块）

**实现提示词：**
```
实现评论模块的 Usecase 层：

1. 创建 CommentUsecase，包含以下方法：
   - createComment(input: CreateCommentInput): Promise<CommentView>
   - approveComment(id: string): Promise<CommentView>
   - rejectComment(id: string): Promise<CommentView>
   - deleteComment(id: string): Promise<void>
   - getCommentsByArticle(articleId: string, pagination: PaginationInput): Promise<PaginatedResult<CommentTree>>
   - getPendingComments(pagination: PaginationInput): Promise<PaginatedResult<CommentView>>

2. 实现业务逻辑：
   - 创建评论时自动生成头像（基于邮箱 MD5）
   - 支持楼中楼嵌套（最多3层）
   - 评论需要审核才能显示
   - 删除评论时级联删除子评论

3. 创建评论树构建逻辑

请将文件放在 src/usecases/blog/ 目录下，遵循 Usecase 规范。
```

**Review 提示词：**
```
请 review 今天创建的 CommentUsecase 代码：

1. 检查是否符合 Usecase 规则：
   - 是否负责写操作编排与业务流程协调
   - 是否不返回 ORM Entity

2. 检查业务逻辑：
   - 评论树构建是否正确
   - 权限控制是否到位
   - 是否有适当的错误处理

3. 检查依赖方向：
   - 是否只依赖 modules/service 或 core
```

---

### Day 6: 后端 GraphQL Resolver 实现

**实现提示词：**
```
实现博客系统的 GraphQL Resolver：

1. 创建 ArticleResolver（放在 src/adapters/api/graphql/blog/resolvers/）：
   - Query: articles, article
   - Mutation: createArticle, updateArticle, deleteArticle, toggleArticleStatus, incrementViewCount, incrementLikeCount

2. 创建 CommentResolver：
   - Query: comments, pendingComments
   - Mutation: createComment, approveComment, rejectComment, deleteComment

3. 创建 CategoryResolver：
   - Query: categories
   - Mutation: createCategory, updateCategory, deleteCategory

4. 创建 TagResolver：
   - Query: tags
   - Mutation: createTag, updateTag, deleteTag

5. 创建 DashboardResolver：
   - Query: dashboardStats, archives

6. 创建 FileResolver：
   - Mutation: uploadFile

7. 实现权限控制：
   - 创建/更新/删除文章需要认证（使用 AuthGuard）
   - 审核评论需要认证
   - 公开接口无需认证

请遵循 Adapter 规范，Resolver 只做协议适配。
```

**Review 提示词：**
```
请 review 今天创建的 Resolver 代码：

1. 检查是否符合 Adapter 规则：
   - 是否只做输入解析、权限接入与输出封装
   - 是否没有实现业务逻辑
   - 是否没有直接依赖 modules/service

2. 检查权限控制：
   - 是否正确使用 AuthGuard
   - 是否区分公开接口和需要认证的接口

3. 检查输出映射：
   - 是否正确映射 Usecase 返回的 View/DTO
   - 是否没有返回 ORM Entity
```

---

### Day 7: 后端测试与优化

**实现提示词：**
```
为博客系统编写测试并优化：

1. 编写单元测试：
   - ArticleUsecase 测试
   - CommentUsecase 测试
   - Repository 测试
   - QueryService 测试

2. 编写 e2e 测试：
   - 文章 CRUD 操作
   - 评论创建和审核
   - 分页查询
   - 搜索功能

3. 优化查询性能：
   - 为常用查询添加索引
   - 优化 N+1 查询问题（使用 join 或预加载）
   - 添加 Redis 缓存热门文章

4. 创建数据库迁移文件

5. 运行检查：
   - npm run test:unit
   - npm run test:e2e
   - npm run lint
   - npm run typecheck

请遵循项目的测试规范文档。
```

**Review 提示词：**
```
请 review 今天的测试和优化代码：

1. 检查测试覆盖率：
   - 单元测试是否覆盖主要功能
   - e2e 测试是否覆盖核心流程

2. 检查性能优化：
   - 是否添加了必要的索引
   - 是否解决了 N+1 查询问题

3. 检查代码质量：
   - 是否通过 lint 检查
   - 是否通过 typecheck 检查
```

---

## 🗓️ 第二周：前台展示端（Day 8-14）

### Day 8: 前端基础架构搭建

**实现提示词：**
```
搭建博客前端的基础架构：

1. 创建路由结构（使用 React Router Data Mode）：
   - / (首页)
   - /article/:id (文章详情)
   - /category/:slug (分类文章)
   - /tag/:slug (标签文章)
   - /archive/:year/:month (归档)
   - /about (关于我)
   - /links (友链)

2. 创建布局组件：
   - MainLayout (主布局，包含 Header、Footer)
   - ArticleLayout (文章详情布局)

3. 配置 Apollo GraphQL 客户端：
   - 连接到后端 GraphQL endpoint (http://127.0.0.1:3000/graphql)
   - 配置错误处理（遵循 UNAUTHENTICATED 契约）
   - 配置请求拦截器

4. 创建全局状态：
   - 用户登录状态
   - 主题切换（深色/浅色模式）

请遵循前端项目的分层架构规范，组件放在 src/pages/、src/layouts/、src/shared/ 目录。
```

**Review 提示词：**
```
请 review 今天创建的前端基础架构代码：

1. 检查路由结构：
   - 是否使用 React Router Data Mode
   - 是否符合项目目录结构

2. 检查 GraphQL 配置：
   - 是否正确配置 endpoint
   - 是否遵循错误契约

3. 检查代码规范：
   - 是否使用 TypeScript
   - 是否通过 typecheck
```

---

### Day 9: 首页模块实现

**实现提示词：**
```
实现博客首页模块：

1. 创建首页组件 src/pages/home/index.tsx：
   - 文章列表（支持分页）
   - 置顶文章显示在顶部
   - 文章卡片（标题、摘要、封面、标签、时间、阅读量）

2. 创建侧边栏组件 src/widgets/sidebar/：
   - 博主简介（头像、昵称、简介）
   - 公告栏
   - 分类列表
   - 标签云
   - 归档列表

3. 实现分页加载：
   - 使用 React Router Data Mode
   - 滚动到底部自动加载更多

4. 使用 Ant Design 组件：
   - Card, List, Pagination, Avatar, Tag

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的首页代码：

1. 检查组件结构：
   - 是否符合项目目录结构
   - 是否有适当的组件拆分

2. 检查 UI 规范：
   - 是否使用 Ant Design 组件
   - 是否遵循颜色规范

3. 检查功能实现：
   - 分页是否正常工作
   - 置顶文章是否正确显示
```

---

### Day 10: 文章阅读模块实现

**实现提示词：**
```
实现文章阅读模块：

1. 创建文章详情页 src/pages/article/[id]/index.tsx：
   - 文章标题、封面、作者信息
   - Markdown 内容渲染（使用 react-markdown 或类似库）
   - 文章标签、分类、时间

2. 实现文章目录（TOC）：
   - 自动提取 Markdown 标题
   - 点击目录滚动到对应位置
   - 高亮当前阅读位置

3. 实现上一篇/下一篇导航：
   - 显示相邻文章标题和链接
   - 处理边界情况

4. 实现阅读量统计：
   - 页面加载时调用 GraphQL mutation
   - 显示阅读次数

5. 使用 Ant Design 组件：
   - Typography, Anchor, Divider, Breadcrumb

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的文章阅读页面代码：

1. 检查功能完整性：
   - Markdown 渲染是否正常
   - TOC 是否正确生成和高亮
   - 上下篇导航是否正常

2. 检查 UI 规范：
   - 是否使用 Ant Design 组件
   - 是否有良好的阅读体验

3. 检查性能：
   - 是否有不必要的渲染
   - 是否有适当的缓存
```

---

### Day 11: 搜索与分类模块实现

**实现提示词：**
```
实现搜索与分类模块：

1. 创建搜索页面 src/pages/search/index.tsx：
   - 搜索输入框
   - 搜索结果列表
   - 高亮搜索关键词

2. 创建分类页面 src/pages/category/[slug]/index.tsx：
   - 分类名称和描述
   - 该分类下的文章列表

3. 创建标签页面 src/pages/tag/[slug]/index.tsx：
   - 标签名称
   - 该标签下的文章列表

4. 创建归档页面 src/pages/archive/[year]/[month]/index.tsx：
   - 按年月显示文章列表
   - 显示文章数量统计

5. 实现筛选逻辑：
   - 使用 GraphQL 变量传递筛选条件

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的搜索与分类页面代码：

1. 检查功能完整性：
   - 搜索是否正常工作
   - 分类/标签筛选是否正确
   - 归档统计是否正确

2. 检查路由：
   - 是否使用正确的动态路由
   - 参数处理是否正确

3. 检查用户体验：
   - 是否有加载状态
   - 是否有错误处理
```

---

### Day 12: 互动模块实现（点赞与评论）

**实现提示词：**
```
实现互动模块：

1. 实现文章点赞功能：
   - 点赞按钮（使用 Ant Design Like 组件）
   - 调用 GraphQL mutation
   - 显示点赞数量

2. 实现评论列表：
   - 显示已审核的评论
   - 支持楼中楼嵌套（最多3层）
   - 评论头像、昵称、时间、内容

3. 实现评论回复：
   - 回复按钮
   - 显示被回复的评论内容
   - 支持 @ 用户

4. 实现评论留言表单：
   - 昵称输入框
   - 邮箱输入框
   - 评论内容输入框
   - 提交按钮
   - 表单验证

5. 使用 Ant Design 组件：
   - Comment, Input, Button, Form, Message

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的互动模块代码：

1. 检查功能完整性：
   - 点赞功能是否正常
   - 评论列表是否正确显示
   - 楼中楼嵌套是否正确

2. 检查用户体验：
   - 表单验证是否完善
   - 是否有加载状态
   - 是否有错误提示

3. 检查代码质量：
   - 是否有适当的状态管理
   - 是否避免不必要的渲染
```

---

### Day 13: 独立页面实现（关于我、友链）

**实现提示词：**
```
实现独立页面：

1. 创建关于我页面 src/pages/about/index.tsx：
   - 博主头像
   - 个人简介
   - 技能标签
   - 社交链接

2. 创建友链页面 src/pages/links/index.tsx：
   - 友链列表（卡片形式）
   - 显示友链名称、描述、Logo
   - 点击跳转到友链网站

3. 实现页面样式：
   - 使用 Tailwind CSS 进行布局
   - 遵循深色模式规范
   - 响应式设计

4. 使用 Ant Design 组件：
   - Card, Avatar, Tag, Link

请遵循前端 UI 设计规范和颜色规范。
```

**Review 提示词：**
```
请 review 今天创建的独立页面代码：

1. 检查页面完整性：
   - 关于我页面是否完整
   - 友链页面是否完整

2. 检查 UI 规范：
   - 是否遵循颜色规范
   - 是否遵循响应式设计

3. 检查代码质量：
   - 是否有适当的组件拆分
   - 是否符合 TypeScript 规范
```

---

### Day 14: 前端测试与优化

**实现提示词：**
```
测试并优化前台功能：

1. 功能测试：
   - 测试所有页面路由
   - 测试文章阅读流程
   - 测试搜索和筛选
   - 测试评论和点赞
   - 测试分页加载

2. 兼容性测试：
   - 测试响应式布局（手机、平板、桌面）
   - 测试深色模式切换
   - 测试不同浏览器

3. 性能优化：
   - 图片懒加载
   - 代码分割
   - GraphQL 查询优化
   - 缓存策略

4. 运行检查：
   - npm run test:unit
   - npm run lint
   - npm run typecheck
   - npm run build

请遵循前端测试规范。
```

**Review 提示词：**
```
请 review 今天的测试和优化工作：

1. 检查测试覆盖：
   - 是否覆盖主要功能
   - 是否有适当的测试用例

2. 检查性能优化：
   - 是否实现图片懒加载
   - 是否有代码分割
   - 是否优化了 GraphQL 查询

3. 检查构建：
   - 是否通过 build
   - 是否有警告或错误
```

---

## 🗓️ 第三周：后台管理端（Day 15-21）

### Day 15: 后台基础架构搭建

**实现提示词：**
```
搭建后台管理基础架构：

1. 创建后台路由：
   - /admin/dashboard (仪表盘)
   - /admin/articles (文章管理)
   - /admin/categories (分类管理)
   - /admin/tags (标签管理)
   - /admin/comments (评论管理)
   - /admin/files (文件管理)
   - /admin/settings (系统设置)

2. 创建后台布局：
   - 侧边栏导航
   - 顶部导航栏
   - 内容区域

3. 实现权限控制：
   - 路由守卫（未登录跳转登录页）
   - 权限验证（只有管理员可访问）

4. 创建导航菜单：
   - 使用 Ant Design Menu 组件
   - 支持菜单展开/收起
   - 高亮当前页面

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的后台基础架构代码：

1. 检查路由结构：
   - 是否有完整的后台路由
   - 是否使用正确的路径

2. 检查布局：
   - 是否有侧边栏和顶部导航
   - 是否符合后台管理风格

3. 检查权限控制：
   - 是否有路由守卫
   - 是否验证管理员权限
```

---

### Day 16: 仪表盘实现

**实现提示词：**
```
实现后台仪表盘：

1. 创建仪表盘页面 src/pages/admin/dashboard/index.tsx：
   - 统计卡片：文章总数、评论总数、总阅读量、总点赞量
   - 数据图表：文章发布趋势、阅读量趋势
   - 最近文章列表（最近10篇）
   - 待审核评论列表（最近10条）

2. 实现数据统计：
   - 调用 GraphQL query 获取统计数据
   - 使用 Ant Design Statistic 组件显示

3. 实现数据可视化：
   - 使用 Ant Design Charts 组件
   - 文章发布趋势图（折线图）
   - 阅读量趋势图（柱状图）

4. 使用 Ant Design 组件：
   - Statistic, Card, Row, Col, List, Table

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的仪表盘代码：

1. 检查功能完整性：
   - 统计数据是否正确显示
   - 图表是否正常渲染
   - 列表是否正确显示

2. 检查 UI 规范：
   - 是否使用 Ant Design 组件
   - 是否有良好的视觉层次

3. 检查性能：
   - 是否有适当的数据缓存
   - 是否避免不必要的请求
```

---

### Day 17: 文章管理实现

**实现提示词：**
```
实现文章管理功能：

1. 创建文章列表页面 src/pages/admin/articles/index.tsx：
   - 文章表格（标题、分类、状态、发布时间、操作）
   - 搜索和筛选
   - 批量操作
   - 分页

2. 创建文章编辑页面 src/pages/admin/articles/[id]/edit.tsx：
   - Markdown 编辑器（使用 react-md-editor）
   - 实时预览
   - 封面图上传
   - 标题、摘要、分类、标签选择
   - 草稿/发布状态切换
   - 保存按钮

3. 实现文章操作：
   - 创建文章（调用 GraphQL mutation）
   - 更新文章
   - 删除文章（软删除）
   - 上下架文章

4. 使用 Ant Design 组件：
   - Table, Form, Input, Select, Button, Modal, Upload

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的文章管理代码：

1. 检查功能完整性：
   - CRUD 操作是否正常
   - Markdown 编辑器是否正常
   - 图片上传是否正常

2. 检查 UI 规范：
   - 是否使用 Ant Design 组件
   - 是否有良好的表单验证

3. 检查用户体验：
   - 是否有加载状态
   - 是否有成功/失败提示
```

---

### Day 18: 分类与标签管理实现

**实现提示词：**
```
实现分类与标签管理：

1. 创建分类管理页面 src/pages/admin/categories/index.tsx：
   - 分类树形表格
   - 创建分类（支持父分类）
   - 编辑分类
   - 删除分类
   - 排序功能

2. 创建标签管理页面 src/pages/admin/tags/index.tsx：
   - 标签列表
   - 创建标签
   - 编辑标签
   - 删除标签

3. 实现表单验证：
   - 分类名称不能为空
   - 标签名称不能重复
   - Slug 自动生成

4. 使用 Ant Design 组件：
   - Table, Tree, Form, Input, Button, Modal

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的分类与标签管理代码：

1. 检查功能完整性：
   - 分类 CRUD 是否正常
   - 标签 CRUD 是否正常
   - 树形结构是否正确

2. 检查表单验证：
   - 是否有必填字段验证
   - 是否有重复检测

3. 检查 UI 规范：
   - 是否使用 Ant Design 组件
   - 是否有良好的用户体验
```

---

### Day 19: 评论管理实现

**实现提示词：**
```
实现评论管理：

1. 创建评论管理页面 src/pages/admin/comments/index.tsx：
   - 评论列表（文章、作者、内容、状态、时间）
   - 筛选（全部/待审核/已通过/已驳回）
   - 批量操作
   - 分页

2. 实现评论审核：
   - 通过评论（调用 GraphQL mutation）
   - 驳回评论
   - 隐藏评论

3. 实现评论回复：
   - 管理员回复评论
   - 显示回复内容

4. 实现评论删除：
   - 删除评论
   - 级联删除子评论

5. 使用 Ant Design 组件：
   - Table, Button, Modal, Popconfirm, Tag

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的评论管理代码：

1. 检查功能完整性：
   - 评论列表是否正确显示
   - 审核功能是否正常
   - 删除功能是否正常

2. 检查权限控制：
   - 是否只有管理员可以审核
   - 是否有适当的权限验证

3. 检查用户体验：
   - 是否有确认对话框
   - 是否有成功/失败提示
```

---

### Day 20: 文件管理实现

**实现提示词：**
```
实现文件管理：

1. 创建文件管理页面 src/pages/admin/files/index.tsx：
   - 图片网格展示
   - 上传按钮
   - 删除按钮
   - 预览功能

2. 实现图片上传：
   - 拖拽上传
   - 点击上传
   - 支持多文件上传
   - 上传进度显示

3. 实现图片预览：
   - 点击图片查看大图
   - 使用 Ant Design Image 组件

4. 实现图片删除：
   - 删除确认
   - 调用 GraphQL mutation

5. 使用 Ant Design 组件：
   - Upload, Image, Button, Modal, Grid

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的文件管理代码：

1. 检查功能完整性：
   - 图片上传是否正常
   - 图片预览是否正常
   - 图片删除是否正常

2. 检查用户体验：
   - 是否有上传进度
   - 是否有拖拽上传
   - 是否有确认对话框

3. 检查代码质量：
   - 是否有适当的错误处理
   - 是否符合 TypeScript 规范
```

---

### Day 21: 系统设置实现

**实现提示词：**
```
实现系统设置：

1. 创建系统设置页面 src/pages/admin/settings/index.tsx：
   - Tab 切换（博主信息/友链/密码）

2. 实现博主信息设置：
   - 昵称
   - 简介
   - 头像上传
   - 保存按钮

3. 实现友链管理：
   - 友链列表
   - 添加友链
   - 编辑友链
   - 删除友链
   - 排序功能

4. 实现修改密码：
   - 原密码输入
   - 新密码输入
   - 确认密码输入
   - 密码强度验证

5. 使用 Ant Design 组件：
   - Tabs, Form, Input, Button, Upload, Table, Modal

请遵循前端 UI 设计规范。
```

**Review 提示词：**
```
请 review 今天创建的系统设置代码：

1. 检查功能完整性：
   - 博主信息设置是否正常
   - 友链管理是否正常
   - 修改密码是否正常

2. 检查表单验证：
   - 密码验证是否完善
   - 是否有密码强度提示

3. 检查用户体验：
   - 是否有 Tab 切换
   - 是否有成功/失败提示
```

---

## 🗓️ 第四周：测试、优化与部署（Day 22-30）

### Day 22: 后端测试完善

**实现提示词：**
```
完善后端测试：

1. 补充单元测试：
   - 所有 Usecase 的测试
   - 所有 Repository 的测试
   - 边界情况测试
   - 错误处理测试

2. 补充 e2e 测试：
   - 完整的用户流程测试
   - API 集成测试
   - 性能测试

3. 测试覆盖率检查：
   - 目标覆盖率 > 80%
   - 生成覆盖率报告

4. 运行检查：
   - npm run test:unit
   - npm run test:e2e
   - npm run test:cov

请遵循项目测试规范。
```

**Review 提示词：**
```
请 review 今天的测试完善工作：

1. 检查测试覆盖率：
   - 是否达到目标覆盖率
   - 是否覆盖边界情况

2. 检查测试质量：
   - 是否有适当的断言
   - 是否避免测试重复

3. 检查运行结果：
   - 是否通过所有测试
   - 是否有失败的测试需要修复
```

---

### Day 23: 前端测试完善

**实现提示词：**
```
完善前端测试：

1. 补充组件测试：
   - 所有 Page 组件的测试
   - 所有 Widget 组件的测试
   - 用户交互测试
   - 表单验证测试

2. 补充集成测试：
   - 路由测试
   - GraphQL 查询测试
   - 状态管理测试

3. 测试覆盖率检查：
   - 目标覆盖率 > 70%
   - 生成覆盖率报告

4. 运行检查：
   - npm run test:unit
   - npm run test:cov

请遵循项目测试规范。
```

**Review 提示词：**
```
请 review 今天的前端测试完善工作：

1. 检查测试覆盖率：
   - 是否达到目标覆盖率
   - 是否覆盖主要组件

2. 检查测试质量：
   - 是否有适当的断言
   - 是否模拟了 GraphQL 请求

3. 检查运行结果：
   - 是否通过所有测试
   - 是否有失败的测试需要修复
```

---

### Day 24: 性能优化

**实现提示词：**
```
优化系统性能：

1. 后端性能优化：
   - 优化 GraphQL 查询（避免 N+1）
   - 添加数据库索引
   - 使用 Redis 缓存热门数据
   - 优化图片处理

2. 前端性能优化：
   - 代码分割
   - 图片懒加载
   - 虚拟滚动（长列表）
   - 防抖和节流

3. 数据库优化：
   - 分析慢查询
   - 优化 SQL 语句
   - 添加合适的索引

4. 缓存优化：
   - Redis 缓存策略
   - 前端缓存策略
   - CDN 配置

请遵循性能优化最佳实践。
```

**Review 提示词：**
```
请 review 今天的性能优化工作：

1. 检查后端优化：
   - 是否解决了 N+1 查询问题
   - 是否添加了必要的索引
   - 是否配置了 Redis 缓存

2. 检查前端优化：
   - 是否实现了代码分割
   - 是否实现了图片懒加载
   - 是否有防抖和节流

3. 检查效果：
   - 是否有性能提升
   - 是否有性能测试验证
```

---

### Day 25: 安全加固

**实现提示词：**
```
加强系统安全性：

1. 输入验证：
   - 所有用户输入进行验证
   - 使用 class-validator
   - 限制输入长度

2. SQL 注入防护：
   - 使用参数化查询
   - TypeORM 自动防护

3. XSS 防护：
   - 前端转义用户输入
   - 使用 DOMPurify 清理 HTML

4. CSRF 防护：
   - 使用 CSRF Token
   - 验证请求来源

5. 权限控制：
   - 细粒度权限控制
   - JWT 认证
   - 角色权限

请遵循安全最佳实践。
```

**Review 提示词：**
```
请 review 今天的安全加固工作：

1. 检查输入验证：
   - 是否有完善的验证
   - 是否使用 class-validator

2. 检查安全防护：
   - 是否有 XSS 防护
   - 是否有 CSRF 防护

3. 检查权限控制：
   - 是否有细粒度权限控制
   - 是否使用 JWT 认证
```

---

### Day 26: 代码审查与重构

**实现提示词：**
```
审查并重构代码：

1. 代码审查：
   - 检查代码规范
   - 检查类型安全
   - 检查错误处理
   - 检查性能问题

2. 重构重复代码：
   - 提取公共函数
   - 创建公共组件
   - 使用设计模式

3. 优化代码结构：
   - 遵循分层架构
   - 遵循依赖方向
   - 避免循环依赖

4. 添加注释：
   - 复杂逻辑添加注释
   - API 文档
   - README 更新

5. 运行检查：
   - npm run lint
   - npm run typecheck
   - npm run build

请遵循项目代码规范。
```

**Review 提示词：**
```
请 review 今天的代码审查与重构工作：

1. 检查代码质量：
   - 是否通过 lint 检查
   - 是否通过 typecheck 检查

2. 检查重构效果：
   - 是否减少了重复代码
   - 是否有适当的抽象

3. 检查文档：
   - 是否有必要的注释
   - 是否更新了 README
```

---

### Day 27: 文档完善

**实现提示词：**
```
完善项目文档：

1. 更新 README：
   - 项目介绍
   - 技术栈
   - 快速开始
   - 项目结构

2. 编写 API 文档：
   - GraphQL Schema 文档
   - API 使用示例
   - 错误码说明

3. 编写部署文档：
   - 环境要求
   - 部署步骤
   - 配置说明
   - 常见问题

4. 编写用户手册：
   - 功能介绍
   - 使用指南
   - 截图说明

请遵循文档编写规范。
```

**Review 提示词：**
```
请 review 今天的文档完善工作：

1. 检查 README：
   - 是否完整
   - 是否有快速开始指南

2. 检查 API 文档：
   - 是否有 Schema 文档
   - 是否有使用示例

3. 检查部署文档：
   - 是否有环境要求
   - 是否有部署步骤
```

---

### Day 28: 部署准备

**实现提示词：**
```
准备部署环境：

1. 环境变量配置：
   - 生产环境变量
   - 敏感信息加密
   - 配置验证

2. 数据库迁移脚本：
   - 生产数据库迁移
   - 数据备份脚本
   - 回滚脚本

3. 构建脚本：
   - 前端构建
   - 后端构建
   - 构建优化

4. Docker 配置：
   - Dockerfile
   - docker-compose.yml
   - Nginx 配置

请遵循部署最佳实践。
```

**Review 提示词：**
```
请 review 今天的部署准备工作：

1. 检查环境配置：
   - 是否有生产环境变量
   - 是否加密敏感信息

2. 检查迁移脚本：
   - 是否有完整的迁移脚本
   - 是否有回滚脚本

3. 检查构建配置：
   - 是否有构建脚本
   - 是否有 Docker 配置
```

---

### Day 29: 部署测试

**实现提示词：**
```
测试部署流程：

1. 本地部署测试：
   - 启动所有服务
   - 检查服务健康
   - 检查日志

2. 功能测试：
   - 前台功能测试
   - 后台功能测试
   - API 测试

3. 性能测试：
   - 压力测试
   - 负载测试
   - 性能监控

4. 监控配置：
   - 日志收集
   - 错误追踪
   - 性能监控

请遵循部署测试规范。
```

**Review 提示词：**
```
请 review 今天的部署测试工作：

1. 检查服务状态：
   - 是否所有服务都正常运行
   - 是否有错误日志

2. 检查功能测试：
   - 是否所有功能都正常
   - 是否有 bug 需要修复

3. 检查性能测试：
   - 是否有性能问题
   - 是否需要优化
```

---

### Day 30: 项目交付

**实现提示词：**
```
完成项目交付：

1. 最终测试：
   - 完整功能测试
   - 兼容性测试
   - 安全测试

2. 代码提交：
   - Git 提交所有代码
   - 推送到远程仓库
   - 创建 Release

3. 项目归档：
   - 整理文档
   - 备份数据
   - 清理临时文件

4. 总结报告：
   - 项目总结
   - 技术亮点
   - 遇到的问题
   - 改进建议

请遵循项目交付规范。
```

**Review 提示词：**
```
请 review 今天的项目交付工作：

1. 检查最终测试：
   - 是否通过所有测试
   - 是否有遗留问题

2. 检查代码提交：
   - 是否有未提交的代码
   - 是否有合理的 commit message

3. 检查文档：
   - 是否完整
   - 是否有总结报告
```

---

## 📝 每日工作流程

### 开始工作前
```
阅读今天的任务计划
阅读相关文档（docs/README.md 路由指引）
检查昨天的代码是否需要 review
```

### 实现阶段
```
使用提供的提示词模板
根据实际情况调整提示词
让 AI 生成代码
```

### Review 阶段
```
让 AI review 生成的代码
检查是否符合项目规范
检查是否有重复实现
检查依赖方向是否正确
```

### 测试阶段
```
运行单元测试
运行 lint 和 typecheck
手动测试功能
```

### 提交阶段
```
git add .
git commit -m "描述今天的任务"
git push
```

---

## 📚 参考文档

### 后端文档
- [docs/README.md](/home/yyan/projects/aigc-friendly-backend/docs/README.md)
- [docs/common/usecase.rules.md](/home/yyan/projects/aigc-friendly-backend/docs/common/usecase.rules.md)
- [docs/common/entity.rules.md](/home/yyan/projects/aigc-friendly-backend/docs/common/entity.rules.md)
- [docs/api/adapters.rules.md](/home/yyan/projects/aigc-friendly-backend/docs/api/adapters.rules.md)

### 前端文档
- [aigc-friendly-frontend/docs/README.md](/home/yyan/projects/aigc-friendly-backend/aigc-friendly-frontend/docs/README.md)
- [aigc-friendly-frontend/docs/ui-design/README.md](/home/yyan/projects/aigc-friendly-backend/aigc-friendly-frontend/docs/ui-design/README.md)

---

## ⚠️ 注意事项

1. **严格遵循分层架构**：adapters → usecases → modules → infrastructure → core → types
2. **遵循依赖方向**：不要违反依赖规则
3. **使用公共 barrel**：跨模块引用使用 public barrel
4. **GraphQL 错误处理**：遵循 UNAUTHENTICATED 契约
5. **类型安全**：不使用 any，使用严格 TypeScript
6. **测试覆盖**：每个功能都要有测试
7. **代码规范**：遵循 ESLint 规则
8. **文档更新**：及时更新文档