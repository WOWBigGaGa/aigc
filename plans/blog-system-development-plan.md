# 博客系统开发计划

## 📋 项目概述

基于 AIGC Friendly Backend + AIGC Friendly Frontend 构建完整的博客系统

### 技术栈
- **后端**: NestJS + GraphQL + TypeScript + MySQL + Redis
- **前端**: React 19 + TypeScript + Vite + Ant Design + Apollo GraphQL
- **架构**: 分层架构 (adapters → usecases → modules → infrastructure → core → types)

---

## 🗓️ 开发计划（预计 30 天）

### 📅 第一周：数据库设计与基础架构（Day 1-7）

#### Day 1: 数据库设计与实体定义
**目标**: 设计数据库表结构并创建 TypeORM 实体

**任务清单**:
- [ ] 设计数据库表（文章、分类、标签、评论、用户、友链、文件）
- [ ] 创建 TypeORM 实体文件
- [ ] 定义枚举类型（文章状态、评论状态等）
- [ ] 创建数据库迁移文件

**提示词模板**:
```
根据以下需求设计数据库表结构并创建 TypeORM 实体：

1. 文章表 (article)
   - id, title, content (Markdown), coverImage, summary, status (DRAFT/PUBLISHED/ARCHIVED)
   - categoryId, tags (多对多), authorId, viewCount, likeCount
   - isPinned, publishedAt, createdAt, updatedAt, deletedAt (软删除)

2. 分类表 (category)
   - id, name, slug, description, parentId (树形结构), sort, createdAt, updatedAt

3. 标签表 (tag)
   - id, name, slug, createdAt, updatedAt

4. 评论表 (comment)
   - id, articleId, authorName, authorEmail, authorAvatar, content
   - parentId (楼中楼), status (PENDING/APPROVED/REJECTED/HIDDEN)
   - createdAt, updatedAt, deletedAt

5. 用户表 (user)
   - id, username, passwordHash, nickname, avatar, bio, email
   - createdAt, updatedAt

6. 友链表 (friend_link)
   - id, name, url, description, logo, sort, isActive, createdAt, updatedAt

7. 文件表 (file)
   - id, originalName, storedName, path, url, mimeType, size
   - uploadedBy, createdAt, updatedAt

请按照项目分层架构规范创建实体文件，放在 src/modules/blog/entities/ 目录下。
```

---

#### Day 2: Repository 与 QueryService
**目标**: 创建数据访问层和查询服务

**任务清单**:
- [ ] 创建各实体的 Repository
- [ ] 创建 QueryService 用于复杂查询
- [ ] 实现分页查询逻辑
- [ ] 实现搜索和筛选逻辑

**提示词模板**:
```
为博客系统创建 Repository 和 QueryService：

1. 创建 ArticleRepository，包含以下方法：
   - findPublishedWithPagination(page, limit)
   - findByCategory(categoryId, page, limit)
   - findByTags(tagIds, page, limit)
   - searchByKeyword(keyword, page, limit)
   - incrementViewCount(articleId)
   - incrementLikeCount(articleId)

2. 创建 ArticleQueryService，实现：
   - 文章列表查询（支持分页、排序、筛选）
   - 文章详情查询
   - 时间归档统计（按年月统计文章数）

3. 创建 CommentRepository，包含：
   - findApprovedByArticle(articleId, page, limit)
   - findPendingComments(page, limit)
   - 构建评论树（支持多级嵌套）

请遵循项目的 QueryService 规范文档。
```

---

#### Day 3: GraphQL Schema 定义
**目标**: 定义 GraphQL 类型、输入和查询

**任务清单**:
- [ ] 创建 GraphQL 类型定义
- [ ] 创建 GraphQL 输入类型
- [ ] 定义 Query 和 Mutation 结构
- [ ] 注册 GraphQL 枚举

**提示词模板**:
```
为博客系统创建 GraphQL Schema：

1. 创建以下 GraphQL 类型：
   - Article, Category, Tag, Comment, User, FriendLink, File
   - ArticleStats (文章统计)
   - Archive (归档数据)

2. 创建以下输入类型：
   - CreateArticleInput, UpdateArticleInput
   - CreateCategoryInput, UpdateCategoryInput
   - CreateTagInput, UpdateTagInput
   - CreateCommentInput, UpdateCommentInput
   - ArticleFilterInput, CommentFilterInput

3. 定义 Query：
   - articles(pagination, filter): [Article!]!
   - article(id): Article
   - categories: [Category!]!
   - tags: [Tag!]!
   - comments(articleId, pagination): [Comment!]!
   - dashboardStats: DashboardStats!
   - archives: [Archive!]!

4. 定义 Mutation：
   - createArticle(input): Article!
   - updateArticle(id, input): Article!
   - deleteArticle(id): Boolean!
   - toggleArticleStatus(id, status): Article!
   - createComment(input): Comment!
   - approveComment(id): Comment!
   - rejectComment(id): Comment!
   - uploadFile(file): File!

请将 schema 文件放在 src/adapters/api/graphql/blog/ 目录下。
```

---

#### Day 4: 后端 Usecase 层实现（文章模块）
**目标**: 实现文章相关的业务逻辑

**任务清单**:
- [ ] 创建 ArticleUsecase
- [ ] 实现创建文章逻辑
- [ ] 实现更新文章逻辑
- [ ] 实现删除文章逻辑（软删除）
- [ ] 实现文章上下架逻辑

**提示词模板**:
```
实现文章模块的 Usecase 层：

1. 创建 ArticleUsecase，包含以下方法：
   - createArticle(input, authorId): Promise<Article>
   - updateArticle(id, input, authorId): Promise<Article>
   - deleteArticle(id, authorId): Promise<void>
   - toggleArticleStatus(id, status, authorId): Promise<Article>
   - getArticleById(id): Promise<Article>
   - getArticles(filter, pagination): Promise<PaginatedResult<Article>>

2. 实现业务逻辑：
   - 创建文章时自动生成 slug
   - 更新文章时记录修改历史
   - 删除文章时使用软删除
   - 状态切换时验证权限

3. 使用 TransactionRunner 管理事务

请遵循项目的 usecase 规范文档。
```

---

#### Day 5: 后端 Usecase 层实现（评论模块）
**目标**: 实现评论相关的业务逻辑

**任务清单**:
- [ ] 创建 CommentUsecase
- [ ] 实现创建评论逻辑
- [ ] 实现评论审核逻辑
- [ ] 实现评论删除逻辑
- [ ] 实现楼中楼嵌套逻辑

**提示词模板**:
```
实现评论模块的 Usecase 层：

1. 创建 CommentUsecase，包含以下方法：
   - createComment(input): Promise<Comment>
   - approveComment(id): Promise<Comment>
   - rejectComment(id): Promise<Comment>
   - deleteComment(id): Promise<void>
   - getCommentsByArticle(articleId, pagination): Promise<PaginatedResult<Comment>>
   - getPendingComments(pagination): Promise<PaginatedResult<Comment>>

2. 实现业务逻辑：
   - 创建评论时自动生成头像（基于邮箱）
   - 支持楼中楼嵌套（最多3层）
   - 评论需要审核才能显示
   - 删除评论时级联删除子评论

3. 实现评论树构建逻辑

请遵循项目的 usecase 规范文档。
```

---

#### Day 6: 后端 GraphQL Resolver 实现
**目标**: 实现 GraphQL 解析器

**任务清单**:
- [ ] 创建 ArticleResolver
- [ ] 创建 CommentResolver
- [ ] 创建 CategoryResolver
- [ ] 创建 DashboardResolver
- [ ] 实现权限控制

**提示词模板**:
```
实现博客系统的 GraphQL Resolver：

1. 创建 ArticleResolver，实现：
   - Query: articles, article
   - Mutation: createArticle, updateArticle, deleteArticle, toggleArticleStatus

2. 创建 CommentResolver，实现：
   - Query: comments, pendingComments
   - Mutation: createComment, approveComment, rejectComment, deleteComment

3. 创建 CategoryResolver，实现：
   - Query: categories
   - Mutation: createCategory, updateCategory, deleteCategory

4. 创建 DashboardResolver，实现：
   - Query: dashboardStats, archives

5. 实现权限控制：
   - 创建/更新/删除文章需要认证
   - 审核评论需要认证
   - 公开接口无需认证

请遵循项目的 GraphQL adapter 规范文档。
```

---

#### Day 7: 后端测试与优化
**目标**: 编写测试并优化代码

**任务清单**:
- [ ] 编写单元测试
- [ ] 编写 e2e 测试
- [ ] 运行 lint 和 typecheck
- [ ] 优化查询性能
- [ ] 添加 Redis 缓存

**提示词模板**:
```
为博客系统编写测试并优化：

1. 编写单元测试：
   - ArticleUsecase 测试
   - CommentUsecase 测试
   - Repository 测试

2. 编写 e2e 测试：
   - 文章 CRUD 操作
   - 评论创建和审核
   - 分页查询
   - 搜索功能

3. 优化查询性能：
   - 为常用查询添加索引
   - 使用 Redis 缓存热门文章
   - 优化 N+1 查询问题

4. 运行检查：
   - npm run test:unit
   - npm run test:e2e
   - npm run lint
   - npm run typecheck

请遵循项目的测试规范文档。
```

---

### 📅 第二周：前台展示端（Day 8-14）

#### Day 8: 前端基础架构搭建
**目标**: 搭建前端项目基础结构

**任务清单**:
- [ ] 创建路由结构
- [ ] 创建布局组件
- [ ] 配置 Apollo GraphQL 客户端
- [ ] 创建全局状态管理

**提示词模板**:
```
搭建博客前端的基础架构：

1. 创建路由结构：
   - / (首页)
   - /article/:id (文章详情)
   - /category/:id (分类文章)
   - /tag/:id (标签文章)
   - /archive/:year/:month (归档)
   - /about (关于我)
   - /links (友链)

2. 创建布局组件：
   - MainLayout (主布局，包含 Header、Footer)
   - ArticleLayout (文章详情布局)

3. 配置 Apollo GraphQL 客户端：
   - 连接到后端 GraphQL endpoint
   - 配置错误处理（遵循 UNAUTHENTICATED 契约）
   - 配置请求拦截器

4. 创建全局状态：
   - 用户登录状态
   - 主题切换（深色/浅色模式）

请遵循前端项目的分层架构规范。
```

---

#### Day 9: 首页模块实现
**目标**: 实现首页功能

**任务清单**:
- [ ] 实现文章列表（分页加载）
- [ ] 实现文章置顶
- [ ] 实现博主简介/公告栏
- [ ] 实现侧边栏

**提示词模板**:
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

---

#### Day 10: 文章阅读模块实现
**目标**: 实现文章详情页

**任务清单**:
- [ ] 实现 Markdown 渲染
- [ ] 实现文章目录（TOC）
- [ ] 实现上一篇/下一篇
- [ ] 实现阅读量统计

**提示词模板**:
```
实现文章阅读模块：

1. 创建文章详情页 src/pages/article/[id]/index.tsx：
   - 文章标题、封面、作者信息
   - Markdown 内容渲染（使用 react-markdown）
   - 文章标签、分类、时间

2. 实现文章目录（TOC）：
   - 自动提取 Markdown 标题
   - 点击目录滚动到对应位置
   - 高亮当前阅读位置

3. 实现上一篇/下一篇导航：
   - 显示相邻文章标题和链接
   - 处理边界情况（第一篇/最后一篇）

4. 实现阅读量统计：
   - 页面加载时调用 GraphQL mutation
   - 显示阅读次数

5. 使用 Ant Design 组件：
   - Typography, Anchor, Divider, Breadcrumb

请遵循前端 UI 设计规范。
```

---

#### Day 11: 搜索与分类模块实现
**目标**: 实现搜索和分类功能

**任务清单**:
- [ ] 实现关键词搜索
- [ ] 实现分类筛选
- [ ] 实现标签筛选
- [ ] 实现时间归档

**提示词模板**:
```
实现搜索与分类模块：

1. 创建搜索页面 src/pages/search/index.tsx：
   - 搜索输入框
   - 搜索结果列表
   - 高亮搜索关键词

2. 创建分类页面 src/pages/category/[id]/index.tsx：
   - 分类名称和描述
   - 该分类下的文章列表

3. 创建标签页面 src/pages/tag/[id]/index.tsx：
   - 标签名称
   - 该标签下的文章列表

4. 创建归档页面 src/pages/archive/[year]/[month]/index.tsx：
   - 按年月显示文章列表
   - 显示文章数量统计

5. 实现筛选逻辑：
   - 使用 GraphQL 变量传递筛选条件
   - 支持组合筛选（分类 + 标签）

请遵循前端 UI 设计规范。
```

---

#### Day 12: 互动模块实现（点赞与评论）
**目标**: 实现点赞和评论功能

**任务清单**:
- [ ] 实现文章点赞
- [ ] 实现评论列表
- [ ] 实现评论回复（楼中楼）
- [ ] 实现评论留言表单

**提示词模板**:
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

---

#### Day 13: 独立页面实现
**目标**: 实现关于我和友链页面

**任务清单**:
- [ ] 实现关于我页面
- [ ] 实现友链页面
- [ ] 实现页面样式优化

**提示词模板**:
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

---

#### Day 14: 前端测试与优化
**目标**: 测试前台功能并优化

**任务清单**:
- [ ] 测试所有前台页面
- [ ] 测试响应式布局
- [ ] 测试深色模式
- [ ] 优化性能
- [ ] 修复 bug

**提示词模板**:
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

---

### 📅 第三周：后台管理端（Day 15-21）

#### Day 15: 后台基础架构搭建
**目标**: 搭建后台管理基础结构

**任务清单**:
- [ ] 创建后台路由
- [ ] 创建后台布局
- [ ] 实现权限控制
- [ ] 创建导航菜单

**提示词模板**:
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

---

#### Day 16: 仪表盘实现
**目标**: 实现数据统计仪表盘

**任务清单**:
- [ ] 实现基础数据统计
- [ ] 实现数据可视化
- [ ] 实现最近文章列表
- [ ] 实现待审核评论列表

**提示词模板**:
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

---

#### Day 17: 文章管理实现
**目标**: 实现文章 CRUD 功能

**任务清单**:
- [ ] 实现文章列表
- [ ] 实现文章创建（Markdown编辑器）
- [ ] 实现文章编辑
- [ ] 实现文章删除（软删除）
- [ ] 实现文章上下架

**提示词模板**:
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

---

#### Day 18: 分类与标签管理实现
**目标**: 实现分类和标签管理

**任务清单**:
- [ ] 实现分类列表
- [ ] 实现分类 CRUD
- [ ] 实现标签列表
- [ ] 实现标签 CRUD

**提示词模板**:
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

---

#### Day 19: 评论管理实现
**目标**: 实现评论审核和管理

**任务清单**:
- [ ] 实现评论列表
- [ ] 实现评论审核（通过/驳回）
- [ ] 实现评论回复
- [ ] 实现评论删除

**提示词模板**:
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

---

#### Day 20: 文件管理实现
**目标**: 实现文件上传和管理

**任务清单**:
- [ ] 实现图片上传
- [ ] 实现图片库浏览
- [ ] 实现图片删除
- [ ] 实现图片预览

**提示词模板**:
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

---

#### Day 21: 系统设置实现
**目标**: 实现个人设置和系统设置

**任务清单**:
- [ ] 实现修改博主信息
- [ ] 实现友情链接管理
- [ ] 实现修改密码

**提示词模板**:
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

---

### 📅 第四周：测试、优化与部署（Day 22-30）

#### Day 22: 后端测试完善
**目标**: 完善后端测试覆盖

**任务清单**:
- [ ] 补充单元测试
- [ ] 补充 e2e 测试
- [ ] 测试覆盖率检查
- [ ] 修复测试问题

**提示词模板**:
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

---

#### Day 23: 前端测试完善
**目标**: 完善前端测试覆盖

**任务清单**:
- [ ] 补充组件测试
- [ ] 补充集成测试
- [ ] 测试覆盖率检查
- [ ] 修复测试问题

**提示词模板**:
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

---

#### Day 24: 性能优化
**目标**: 优化系统性能

**任务清单**:
- [ ] 后端性能优化
- [ ] 前端性能优化
- [ ] 数据库优化
- [ ] 缓存优化

**提示词模板**:
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

---

#### Day 25: 安全加固
**目标**: 加强系统安全性

**任务清单**:
- [ ] 输入验证
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] CSRF 防护
- [ ] 权限控制

**提示词模板**:
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

---

#### Day 26: 代码审查与重构
**目标**: 审查代码并重构

**任务清单**:
- [ ] 代码审查
- [ ] 重构重复代码
- [ ] 优化代码结构
- [ ] 添加注释

**提示词模板**:
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

---

#### Day 27: 文档完善
**目标**: 完善项目文档

**任务清单**:
- [ ] 更新 README
- [ ] 编写 API 文档
- [ ] 编写部署文档
- [ ] 编写用户手册

**提示词模板**:
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

---

#### Day 28: 部署准备
**目标**: 准备部署环境

**任务清单**:
- [ ] 环境变量配置
- [ ] 数据库迁移脚本
- [ ] 构建脚本
- [ ] Docker 配置

**提示词模板**:
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

---

#### Day 29: 部署测试
**目标**: 测试部署流程

**任务清单**:
- [ ] 本地部署测试
- [ ] 功能测试
- [ ] 性能测试
- [ ] 监控配置

**提示词模板**:
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

---

#### Day 30: 项目交付
**目标**: 完成项目交付

**任务清单**:
- [ ] 最终测试
- [ ] 代码提交
- [ ] 项目归档
- [ ] 总结报告

**提示词模板**:
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

---

## 📝 每日工作流程

### 1. 开始工作前
```
阅读今天的任务计划，理解需求
阅读相关文档（docs/README.md 路由指引）
```

### 2. 实现阶段
```
使用提供的提示词模板
根据实际情况调整提示词
让 AI 生成代码
```

### 3. Review 阶段
```
让 AI review 生成的代码
检查是否符合项目规范
检查是否有重复实现
检查依赖方向是否正确
```

### 4. 测试阶段
```
运行单元测试
运行 e2e 测试
运行 lint 和 typecheck
手动测试功能
```

### 5. 提交阶段
```
git add .
git commit -m "描述今天的任务"
git push
```

---

## 🎯 关键里程碑

| 里程碑 | 时间 | 交付物 |
|--------|------|--------|
| 数据库设计完成 | Day 1 | 数据库表结构、实体文件 |
| 后端基础架构完成 | Day 7 | GraphQL API、Usecase、Repository |
| 前台展示端完成 | Day 14 | 所有前台页面和功能 |
| 后台管理端完成 | Day 21 | 所有后台页面和功能 |
| 测试优化完成 | Day 30 | 完整的博客系统 |

---

## 📚 参考文档

### 后端文档
- [docs/README.md](/home/yyan/projects/aigc-friendly-backend/docs/README.md)
- [docs/common/](/home/yyan/projects/aigc-friendly-backend/docs/common/)
- [docs/api/](/home/yyan/projects/aigc-friendly-backend/docs/api/)

### 前端文档
- [aigc-friendly-frontend/docs/README.md](/home/yyan/projects/aigc-friendly-backend/aigc-friendly-frontend/docs/README.md)
- [aigc-friendly-frontend/docs/ui-design/](/home/yyan/projects/aigc-friendly-backend/aigc-friendly-frontend/docs/ui-design/)

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

---

## 🚀 开始执行

从 **Day 1: 数据库设计与实体定义** 开始！

使用提供的提示词模板，让 AI 帮你实现功能。

祝你开发顺利！🎉