# MassMotion v2.0 重构执行计划

**版本：** 1.0 → 2.0（播放量驱动 → 精品策展）
**开始日期：** 2026-04-04
**预计完成：** 2026-04-25（3 周）

---

## 1. 项目概览

### 1.1 重构范围

| 模块 | v1.0 现状 | v2.0 目标 | 变化程度 |
|------|----------|----------|---------|
| 数据源 | marsdrama + youtubeshortsdata（播放量） | 豆瓣 + 人工策展 | 🔴 完全重构 |
| 数据模型 | 简化模型（9 个字段） | 丰富模型（25+ 字段，含演员） | 🔴 完全重构 |
| 首页 | 情绪优先（Mood Chips） | 策展推荐 + 评分优先 | 🟡 部分重构 |
| 详情页 | 基础信息 | 完整元数据 + 演员 | 🟡 部分重构 |
| 浏览/筛选 | 按情绪筛选 | 多维筛选（类型+情绪+评分+年份） | 🟢 增强 |
| 演员页面 | ❌ 无 | ✅ 新增 | 🟢 新功能 |
| 搜索 | ❌ 无 | ✅ 新增 | 🟢 新功能 |
| 匿名反应 | Supabase | 保留（可选） | ⚪ 保留 |

### 1.2 团队分工

**ShortData 团队（数据端）：**
- 豆瓣数据采集
- YouTube 视频匹配
- 人工策展评分
- 数据质量验证
- 交付 JSONL 文件

**MassMotion 前端团队（产品端）：**
- UI/UX 重构
- 数据消费层开发
- 搜索/筛选功能
- 部署与优化

---

## 2. 阶段划分

### 🔵 Phase 0: 准备阶段（Week 0 - 4月4日-4月6日，3天）

**目标：** 对齐需求，准备数据规范

#### 2.1 ShortData 任务

```
□ 阅读 DATA_REQUIREMENTS.md
□ 确认数据模型可行性
□ 准备数据采集工具（豆瓣爬虫 / API）
□ 确认图片托管方案（CDN 或本地）
□ 试采集 5 部剧集，验证流程

交付物：
  - 5 部剧集样本数据（drama-samples.json）
  - 数据采集工具代码
  - 问题反馈（如：豆瓣某字段获取困难）
```

#### 2.2 MassMotion 前端任务

```
□ 阅读 PRODUCT_DESIGN.md
□ 评估技术栈变更（是否需要新依赖）
□ 设计新的数据消费层（lib/data.ts）
□ 创建 TypeScript 类型定义（types/drama-v2.ts）
□ 搭建新的组件框架（可复用现有 UI）

交付物：
  - 技术方案文档（TECH_SPEC.md）
  - 依赖清单（package.json 更新）
  - 组件清单（需要新建 / 修改的组件）
```

#### 2.3 联合评审

```
□ 召开 Kick-off 会议（30分钟）
  - ShortData：数据采集计划
  - MassMotion：UI 重构计划
  - 确认接口格式（JSON schema）
  - 确认时间节点

□ 确定数据交付方式
  - 方案 A：Git 仓库（推荐，便于版本控制）
  - 方案 B：定期导出 JSON 文件
```

**里程碑：** 双方对齐，数据规范锁定

---

### 🟢 Phase 1: 数据准备（Week 1 - 4月7日-4月13日）

**目标：** ShortData 完成 MVP 数据集（50 部剧）

#### 1.1 ShortData 核心任务

**优先级 P0（必须完成）：**
```
□ 采集 50 部精品剧集数据
  □ 豆瓣信息（标题、评分、简介、海报）
  □ YouTube 链接匹配
  □ 主演信息（至少 2 位，含头像）
  □ 类型标签（genres）
  □ 情绪标签（moods）

□ 人工策展
  □ 评定 curatedScore（策展评分）
  □ 撰写 editorNote（15 部编辑推荐）
  □ 提炼 highlights（看点）

□ 数据验证
  □ 运行 validate-schema.js（检查必填字段）
  □ 运行 validate-images.js（检查图片链接）
  □ 运行 validate-youtube.js（检查视频有效性）

□ 数据交付
  - /Volumes/Lexar/oneweekoneproject/shortdata/dramas.jsonl
  - /Volumes/Lexar/oneweekoneproject/shortdata/metadata.json
```

**剧集选择策略：**
```
类型分布（建议）：
- 现代都市 / 霸总：20 部
- 古装历史：10 部
- 甜宠 / 虐恋：10 部
- 悬疑 / 重生：5 部
- 其他（喜剧、奇幻）：5 部

评分分布：
- 9.0+：5 部（神剧）
- 8.0-8.9：20 部（精品）
- 7.0-7.9：20 部（优秀）
- 6.0-6.9：5 部（合格）

编辑推荐：
- 从 8.0+ 分剧集中选 15 部
- 确保类型多样性
```

#### 1.2 MassMotion 前端任务（并行）

```
□ 搭建 v2.0 开发分支（massmotion-v2）
□ 实现数据消费层
  - lib/data.ts（读取 JSONL）
  - 搜索索引（Fuse.js 配置）
  - 筛选逻辑（genre + mood + rating）

□ 创建 TypeScript 类型
  - types/drama-v2.ts
  - types/actor.ts
  - 确保与 DATA_REQUIREMENTS.md 一致

□ 设计系统准备
  - 定义色彩变量（Tailwind config）
  - 设计评分组件（DualRating）
  - 设计情绪标签组件（MoodChip）
```

**里程碑：** ShortData 交付 50 部剧集数据，前端完成数据层

---

### 🟡 Phase 2: UI 重构（Week 2 - 4月14日-4月20日）

**目标：** MassMotion 完成核心页面开发

#### 2.1 首页重构

**任务清单：**
```
□ Hero Banner 组件
  - 3-5 部轮播（编辑精选）
  - Backdrop 背景 + 暗化
  - 评分显示（双评分）
  - [立即观看] 按钮

□ Editor Picks 区域
  - 横向滚动卡片
  - 显示海报 + 评分 + 情绪标签

□ High Rated 区域
  - 网格布局（4列桌面 / 2列手机）
  - 评分 ≥ 8.0 的剧集

□ By Mood 区域
  - 5 个情绪分类横向滚动
  - 每个情绪 6 部剧集

□ By Genre 区域
  - 类型卡片（带代表剧海报）
```

**组件拆分：**
```
src/components/
├── HeroBanner.tsx          # 首页顶部轮播
├── DramaCard.tsx           # 剧集卡片（复用）
├── DramaGrid.tsx           # 网格布局
├── DramaCarousel.tsx       # 横向滚动
├── MoodChip.tsx            # 情绪标签
├── DualRating.tsx          # 双评分组件
└── GenreCard.tsx           # 类型卡片
```

#### 2.2 详情页重构

**任务清单：**
```
□ Hero 区域
  - Backdrop 背景
  - 海报 + 标题（中英）
  - 双评分显示
  - 基础信息（年份、集数、时长）
  - 标签（类型 + 情绪）
  - [在 YouTube 观看] 按钮

□ 剧情简介
  - 中英文简介
  - 看点亮点（highlights）

□ 演员列表
  - 主演头像 + 姓名 + 角色
  - 点击跳转演员详情页

□ 相似推荐
  - 基于类型 + 情绪推荐 6 部
  - 横向滚动

□ 技术信息（可折叠）
  - 导演、编剧、出品公司
  - YouTube 频道、上架时间
```

**组件拆分：**
```
src/components/drama-detail/
├── DramaHero.tsx           # 顶部 Hero
├── Synopsis.tsx            # 简介区域
├── CastList.tsx            # 演员列表
├── CastMemberCard.tsx      # 演员卡片
├── SimilarDramas.tsx       # 相似推荐
└── TechnicalInfo.tsx       # 技术信息
```

#### 2.3 浏览页面

**任务清单：**
```
□ 筛选栏（FilterBar）
  - 类型下拉（多选）
  - 情绪下拉（多选）
  - 年份下拉
  - 评分范围滑块

□ 排序选项
  - 策展评分
  - 豆瓣评分
  - 最新上架

□ 剧集网格
  - 响应式（4/3/2 列）
  - 实时筛选更新

□ 筛选状态
  - 显示当前筛选条件
  - "找到 X 部剧集"
  - [清除筛选] 按钮
```

**组件拆分：**
```
src/components/browse/
├── FilterBar.tsx           # 筛选栏
├── SortSelect.tsx          # 排序选择
├── FilterChip.tsx          # 筛选条件标签
└── ResultsGrid.tsx         # 结果网格
```

#### 2.4 演员详情页（新增）

**任务清单：**
```
□ Hero 区域
  - 演员头像
  - 姓名（中英）
  - 参演数量 + 平均评分

□ Filmography
  - 参演剧集列表
  - 显示角色名 + 主演标识
  - 按评分排序
```

#### 2.5 搜索功能（新增）

**任务清单：**
```
□ 搜索框组件
  - 实时搜索（防抖 300ms）
  - 搜索历史（localStorage）
  - 热门搜索

□ 搜索结果页
  - 分类显示（剧集 / 演员 / 标签）
  - 高亮匹配文本
```

**技术选型：**
- Fuse.js（模糊搜索）
- 搜索字段：titleChinese, titleEnglish, cast.name, genres, themes

**里程碑：** 核心页面开发完成，本地可运行

---

### 🟣 Phase 3: 集成测试（Week 3前半 - 4月21日-4月23日）

**目标：** ShortData 和 MassMotion 集成测试

#### 3.1 数据集成测试

**ShortData 任务：**
```
□ 补充到 80-100 部剧集（如果 Week 1 只完成 50 部）
□ 修复数据问题（根据前端反馈）
□ 补充演员数据（完善 filmography）
```

**MassMotion 任务：**
```
□ 连接真实数据源
  - 从 /Volumes/Lexar/oneweekoneproject/shortdata 读取
  - 或通过 Git submodule 引入

□ 数据验证
  - 检查所有图片可加载
  - 检查 YouTube 链接有效
  - 检查评分数据合理性

□ 边界情况测试
  - 缺失字段处理（如：无 doubanRating）
  - 长文本处理（如：超长简介）
  - 特殊字符处理（如：标题中的 emoji）
```

#### 3.2 功能测试

**测试清单：**
```
□ 首页
  - Hero Banner 轮播正常
  - 所有区域数据加载
  - 图片懒加载生效

□ 详情页
  - 路由参数正确（/drama/:id）
  - YouTube 按钮跳转正确
  - 相似推荐算法合理

□ 浏览页
  - 筛选逻辑正确
  - 多条件组合筛选
  - 排序功能

□ 演员页
  - 演员数据完整
  - Filmography 显示正确

□ 搜索
  - 模糊搜索准确
  - 中英文搜索都生效
  - 搜索历史保存
```

#### 3.3 性能测试

**测试指标：**
```
□ Lighthouse 评分
  - Performance ≥ 90
  - Accessibility ≥ 95
  - Best Practices ≥ 90
  - SEO ≥ 90

□ Core Web Vitals
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

□ 包体积
  - JS bundle < 500KB（压缩后）
  - 首屏加载 < 3s（3G 网络）
```

**优化清单：**
```
□ 代码分割（React.lazy）
□ 图片优化（WebP + 懒加载）
□ 字体优化（子集化）
□ Service Worker 缓存
```

**里程碑：** 所有测试通过，性能达标

---

### 🔴 Phase 4: 部署上线（Week 3后半 - 4月24日-4月25日）

**目标：** 生产环境部署

#### 4.1 部署准备

**MassMotion 任务：**
```
□ 生产环境配置
  - 环境变量设置（Vercel）
  - CDN 配置（图片加速）
  - 域名配置（如果需要）

□ SEO 优化
  - sitemap.xml 生成
  - robots.txt
  - Open Graph meta tags
  - Schema.org 结构化数据

□ 监控配置
  - Vercel Analytics
  - 错误追踪（Sentry）
  - 性能监控
```

#### 4.2 数据同步方案

**方案 A：Git Submodule（推荐）**
```bash
# MassMotion 仓库中
git submodule add /Volumes/Lexar/oneweekoneproject/shortdata data/shortdata

# 每次数据更新后
cd data/shortdata && git pull
cd ../.. && git add data/shortdata && git commit -m "data: update dramas"
```

**方案 B：自动化脚本**
```bash
# 定时任务（每天凌晨）
#!/bin/bash
cp /Volumes/Lexar/oneweekoneproject/shortdata/dramas.jsonl src/data/
git add src/data/dramas.jsonl
git commit -m "data: auto-sync $(date +%Y-%m-%d)"
git push
```

#### 4.3 部署步骤

```
□ 合并 massmotion-v2 分支到 main
□ 推送到 GitHub
□ 触发 Vercel 自动部署
□ 验证生产环境
  - 首页加载正常
  - 所有链接有效
  - 图片加载正常
  - YouTube 跳转正常

□ 切换域名（如果需要）
□ 清除旧版缓存
```

#### 4.4 上线检查清单

```
□ 功能检查
  - 所有页面可访问
  - 搜索功能正常
  - 筛选功能正常
  - 移动端适配正常

□ 数据检查
  - 剧集数量正确
  - 图片全部加载
  - 评分数据显示

□ 性能检查
  - 首屏加载 < 3s
  - 图片懒加载生效
  - 无 JavaScript 错误

□ SEO 检查
  - Google 可索引
  - Open Graph 正确
  - sitemap 提交
```

**里程碑：** v2.0 正式上线

---

## 3. 风险与应对

### 3.1 数据采集风险

**风险：** 豆瓣反爬虫，数据获取困难

**应对：**
- Plan A：使用豆瓣 API（如果有）
- Plan B：手动录入（50 部可接受）
- Plan C：使用其他数据源（如 TMDB、MDL）

### 3.2 YouTube 链接失效风险

**风险：** 部分剧集视频被删除或私有化

**应对：**
- 定期验证（validate-youtube.js 脚本）
- 备用链接机制（同一剧集多个 YouTube 来源）
- 标记"链接失效"状态

### 3.3 演员数据缺失风险

**风险：** 部分剧集演员信息不全

**应对：**
- 降低要求：至少 1 位主演即可
- 允许"未知演员"占位符
- 逐步补充（v2.1 优化）

### 3.4 性能风险

**风险：** 数据量增大（100+ 部），首屏加载慢

**应对：**
- 虚拟滚动（react-window）
- 分页加载（每页 20 部）
- Service Worker 缓存

---

## 4. 迁移策略

### 4.1 数据迁移

**v1.0 → v2.0 字段映射：**

| v1.0 字段 | v2.0 字段 | 迁移逻辑 |
|-----------|-----------|---------|
| id | id | 直接复制 |
| title | titleChinese | 直接复制 |
| titleChinese | titleChinese | 直接复制 |
| - | titleEnglish | **新字段，需要补充** |
| thumbnail | poster | 直接复制 |
| - | backdrop | **新字段，YouTube 缩略图** |
| - | doubanRating | **新字段，需要采集** |
| scoreV0 | curatedScore | 直接复制（需要人工重新评定） |
| episodeCount | episodeCount | 直接复制 |
| totalDurationHours | totalDuration | 转换：小时 → 分钟 |
| vibes | moods | 直接复制 |
| tropes | themes | 直接复制 |
| - | genres | **新字段，需要分类** |
| - | synopsis | **新字段，需要采集** |
| - | cast | **新字段，需要采集** |
| youtubeUrl | youtubeUrl | 直接复制 |
| - | isEditorPick | **新字段，标记编辑推荐** |

**迁移脚本示例：**
```javascript
// migrate-v1-to-v2.js
const v1Data = require('./src/data/dramas.json');

const v2Data = v1Data.dramas
  .filter(d => d.isEditorPick) // 只迁移 Editor Picks
  .map(drama => ({
    id: drama.id,
    titleChinese: drama.titleChinese,
    titleEnglish: drama.title, // 临时用英文标题
    poster: drama.thumbnail,
    backdrop: drama.youtubeUrl.replace('watch?v=', 'vi/') + '/maxresdefault.jpg',
    curatedScore: drama.scoreV0, // 需要人工重新评定
    episodeCount: drama.episodeCount,
    totalDuration: Math.round(drama.totalDurationHours * 60),
    moods: drama.vibes,
    themes: drama.tropes,
    genres: inferGenres(drama), // 需要实现
    synopsis: '', // 需要采集
    cast: [], // 需要采集
    youtubeUrl: drama.youtubeUrl,
    isEditorPick: true,
    // ... 其他必填字段
  }));
```

### 4.2 URL 兼容性

**v1.0 路由：**
```
/                    # 首页
```

**v2.0 路由：**
```
/                    # 首页
/browse              # 浏览
/drama/:id           # 剧集详情
/actor/:id           # 演员详情
/search?q=xxx        # 搜索
```

**兼容策略：**
- 保留 v1.0 首页路由
- 新增 v2.0 路由
- 301 重定向（如果有旧链接）

### 4.3 用户数据迁移

**v1.0 用户数据（localStorage）：**
```
massmotion_watch_later: ["drama001", "drama002"]
massmotion_session: "uuid-xxx"
```

**v2.0 兼容：**
- 保留 localStorage key
- 自动迁移旧 ID（如果存在）
- 清除失效数据

---

## 5. 发布计划

### 5.1 版本号规范

```
v1.0.0 - 当前版本（播放量驱动）
v2.0.0 - 重构版本（精品策展）
```

### 5.2 发布流程

```
1. Code Freeze（4月23日）
   - 停止新功能开发
   - 只修复 critical bugs

2. 内部测试（4月24日）
   - 团队成员试用
   - 收集反馈

3. Soft Launch（4月24日晚）
   - 部署到生产环境
   - 不公开宣传
   - 观察错误日志

4. Official Launch（4月25日）
   - 社交媒体宣传
   - 更新 README
   - 发布 CHANGELOG
```

### 5.3 回滚计划

**触发条件：**
- Critical bug 导致网站无法访问
- 数据错误（如：评分全部显示 0）
- 性能严重下降（LCP > 5s）

**回滚步骤：**
```bash
# 1. 回滚 Vercel 部署到 v1.0
vercel rollback [DEPLOYMENT_URL]

# 2. 修复问题
git checkout massmotion-v2
# fix bugs...

# 3. 重新部署
git push origin massmotion-v2
```

---

## 6. 后续优化（v2.1+）

**Phase 5: 增强功能（Week 4+）**
```
□ 用户账号系统（可选）
  - 评分功能
  - 收藏同步（云端）
  - 观看历史

□ 社区功能
  - 剧评系统
  - 评论区
  - 用户推荐

□ 个性化推荐
  - 基于观看历史
  - 基于收藏喜好
  - 基于评分偏好

□ 数据分析
  - 热门剧集统计
  - 用户行为分析
  - A/B 测试
```

---

## 7. 成功指标

### 7.1 数据质量指标

```
✅ 剧集数量：≥ 50 部（MVP）
✅ 数据完整性：100% 必填字段
✅ 图片有效性：≥ 95%
✅ YouTube 有效性：≥ 95%
✅ 策展评分覆盖：100%
```

### 7.2 产品质量指标

```
✅ Lighthouse Performance：≥ 90
✅ Lighthouse Accessibility：≥ 95
✅ 移动端适配：100% 页面
✅ 浏览器兼容：Chrome/Safari/Firefox 最新版
✅ 无 Console Error
```

### 7.3 用户体验指标（上线后追踪）

```
📊 平均停留时长：≥ 3 分钟
📊 跳出率：< 60%
📊 搜索使用率：≥ 20%
📊 YouTube 点击率：≥ 30%
```

---

## 8. 沟通机制

### 8.1 日常沟通

**工具：**
- Slack / 微信群：日常快速沟通
- GitHub Issues：Bug 追踪、需求讨论
- Notion / 飞书文档：文档共享

**频率：**
- 每日同步（异步）：进度更新、问题反馈
- 每周会议（同步）：周一 Kick-off，周五 Review

### 8.2 数据交付流程

```
ShortData 团队：
  1. 完成数据采集
  2. 运行验证脚本
  3. 提交到 /Volumes/Lexar/oneweekoneproject/shortdata
  4. Git commit + push
  5. 通知 MassMotion 团队

MassMotion 团队：
  1. Git pull 获取最新数据
  2. 本地测试
  3. 反馈问题（如有）
  4. 部署到生产
```

---

## 9. 文档清单

**已完成：**
- ✅ DATA_REQUIREMENTS.md（数据端需求）
- ✅ PRODUCT_DESIGN.md（产品端设计）
- ✅ REFACTOR_PLAN.md（本文档）

**待完成（Phase 0）：**
- ⏳ TECH_SPEC.md（技术规范，MassMotion）
- ⏳ DATA_COLLECTION_GUIDE.md（数据采集指南，ShortData）
- ⏳ API_SPEC.md（数据接口规范）

**待完成（Phase 4）：**
- ⏳ CHANGELOG.md（版本更新日志）
- ⏳ README.md（更新项目介绍）
- ⏳ DEPLOYMENT.md（部署文档）

---

## 10. 附录：快速参考

### 10.1 关键命令

**ShortData 数据验证：**
```bash
cd /Volumes/Lexar/oneweekoneproject/shortdata
node validate-schema.js dramas.jsonl
node validate-images.js dramas.jsonl
node validate-youtube.js dramas.jsonl
```

**MassMotion 本地开发：**
```bash
cd /Volumes/Lexar/oneweekoneproject/openshort_cc/MassMotion
git checkout massmotion-v2
npm install
npm run dev
```

**部署：**
```bash
git add .
git commit -m "feat: implement v2.0 refactor"
git push origin massmotion-v2
# Vercel 自动部署
```

### 10.2 联系人

**ShortData 团队：**
- 负责人：[待补充]
- 数据工程师：[待补充]

**MassMotion 团队：**
- 产品负责人：[待补充]
- 前端开发：[待补充]

---

**文档版本：** 1.0.0
**最后更新：** 2026-04-04
**状态：** 📝 待执行
