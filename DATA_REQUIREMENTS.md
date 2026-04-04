# MassMotion 数据端需求文档 v2.0

**定位变更：** 从播放量驱动 → 精品策展 + 发现平台（豆瓣 + MyDramaList 短剧版）

---

## 1. 核心数据模型

### 1.1 Drama（剧集主表）

```typescript
interface Drama {
  // === 基础标识 ===
  id: string;                    // 唯一 ID（建议用豆瓣 ID 或自定义）

  // === 标题信息 ===
  titleChinese: string;          // 中文标题（主标题）
  titleEnglish: string;          // 英文标题
  alternativeTitles?: string[];  // 别名（如：又名、原名）

  // === 视觉资源 ===
  poster: string;                // 海报图 URL（竖版，2:3 比例，推荐 400x600）
  backdrop?: string;             // 背景横图 URL（16:9 比例，1280x720）
  gallery?: string[];            // 剧照集合（可选，最多 10 张）

  // === 评分与质量 ===
  doubanRating?: number;         // 豆瓣评分（0-10，精确到 0.1）
  doubanRatingCount?: number;    // 豆瓣评分人数
  curatedScore: number;          // 策展评分（0-10，编辑团队评分，必填）

  // === 基础信息 ===
  year: number;                  // 年份（如 2024）
  episodeCount: number;          // 集数
  episodeDuration: number;       // 单集时长（分钟）
  totalDuration: number;         // 总时长（分钟，自动计算：episodeCount * episodeDuration）
  status: 'completed' | 'ongoing'; // 更新状态

  // === 内容分类 ===
  genres: string[];              // 类型标签（如：["现代都市", "霸总", "甜宠"]）
  themes: string[];              // 主题标签（如：["复仇", "重生", "婚恋"]）
  moods: Mood[];                 // 情绪标签（cry, sweet, hype, laugh, dogblood）

  // === 剧情信息 ===
  synopsis: string;              // 剧情简介（100-200 字，中文）
  synopsisEn?: string;           // 剧情简介（英文，可选）
  highlights: string[];          // 看点/亮点（3-5 个短句，如："女主逆袭爽快"）

  // === 演员与制作 ===
  cast: CastMember[];            // 演员列表（主演+配角）
  director?: string;             // 导演
  screenwriter?: string;         // 编剧
  productionCompany?: string;    // 出品公司

  // === 播放信息 ===
  youtubeId?: string;            // YouTube 视频 ID（完整版合集）
  youtubeUrl?: string;           // YouTube 完整 URL
  youtubeChannelName?: string;   // 频道名称

  // === 策展信息 ===
  isEditorPick: boolean;         // 是否编辑推荐
  editorNote?: string;           // 编辑推荐语（20-50 字）
  curatedAt?: string;            // 策展时间（ISO 8601）

  // === 元数据 ===
  createdAt: string;             // 创建时间（ISO 8601）
  updatedAt: string;             // 更新时间（ISO 8601）
}

type Mood = 'cry' | 'sweet' | 'hype' | 'laugh' | 'dogblood';

interface CastMember {
  id: string;                    // 演员唯一 ID
  name: string;                  // 中文名
  nameEn?: string;               // 英文名
  avatar: string;                // 演员头像 URL（正方形，推荐 200x200）
  role: string;                  // 角色名（如："陆总"）
  characterDescription?: string; // 角色描述（如："霸道总裁"）
  isLead: boolean;               // 是否主演
}
```

---

## 2. 数据质量要求

### 2.1 必填字段（Hard Requirements）

所有剧集必须包含以下字段，否则不得录入：

```
✅ 必填字段清单：
- id
- titleChinese
- titleEnglish
- poster (海报图)
- curatedScore (策展评分)
- year
- episodeCount
- episodeDuration
- genres (至少 1 个)
- moods (至少 1 个)
- synopsis (中文简介)
- cast (至少 1 个主演，isLead: true)
- isEditorPick
```

### 2.2 图片资源要求

| 类型 | 尺寸要求 | 格式 | 必填 |
|------|---------|------|------|
| poster | 400x600 (2:3) | JPG/WebP | ✅ 是 |
| backdrop | 1280x720 (16:9) | JPG/WebP | ⚠️ 推荐 |
| actor avatar | 200x200 (1:1) | JPG/WebP | ✅ 是（主演） |
| gallery | 800x450 (16:9) | JPG/WebP | ❌ 可选 |

**图片来源优先级：**
1. 豆瓣官方图片（最高质量）
2. YouTube 缩略图（需要人工筛选，避免拼贴图）
3. 官方宣发渠道
4. 人工拍摄截图（最后手段）

### 2.3 评分规则

#### 策展评分（curatedScore）
- **范围：** 0-10（精确到 0.1）
- **评分维度：**
  - 剧本质量（30%）
  - 演员表现（25%）
  - 制作水平（20%）
  - 情绪节奏（15%）
  - 创新性（10%）
- **门槛：** 入库最低 6.0 分（精品标准）

#### 豆瓣评分（doubanRating）
- 直接同步豆瓣数据
- 如果豆瓣没有该剧，留空
- 不得人工编造

---

## 3. 数据分类体系

### 3.1 Genres（类型标签）

```typescript
// 一级分类
const PRIMARY_GENRES = [
  '现代都市',      // Modern Urban
  '古装历史',      // Historical/Period
  '悬疑推理',      // Mystery/Thriller
  '奇幻玄幻',      // Fantasy/Supernatural
  '科幻未来',      // Sci-Fi
  '校园青春',      // Campus/Youth
];

// 二级分类（细分类型）
const SECONDARY_GENRES = [
  '霸总',          // CEO Romance
  '甜宠',          // Sweet Romance
  '虐恋',          // Angst Romance
  '复仇',          // Revenge
  '重生',          // Rebirth
  '穿越',          // Time Travel
  '婚恋',          // Marriage
  '家庭',          // Family
  '职场',          // Workplace
  '医疗',          // Medical
  '悬疑',          // Suspense
  '喜剧',          // Comedy
];
```

**使用规则：**
- 每部剧 1 个一级分类（必填）
- 1-3 个二级分类（推荐）
- 示例：`["现代都市", "霸总", "甜宠"]`

### 3.2 Themes（主题标签）

```typescript
const THEMES = [
  '复仇',          // Revenge
  '逆袭',          // Underdog Rise
  '重生',          // Rebirth
  '穿越',          // Time Travel
  '契约婚姻',      // Contract Marriage
  '隐藏身份',      // Secret Identity
  '萌宝',          // Cute Baby
  '婆媳',          // Mother-in-law Conflict
  '追妻火葬场',    // Chase Wife Crematorium
  '破镜重圆',      // Reconciliation
  '灰姑娘',        // Cinderella
  '强强',          // Power Couple
];
```

### 3.3 Moods（情绪标签）

```typescript
type Mood = 'cry' | 'sweet' | 'hype' | 'laugh' | 'dogblood';

const MOOD_DEFINITIONS = {
  cry: '催泪/感动',       // Tearjerker
  sweet: '甜蜜/温馨',     // Sweet
  hype: '爽感/热血',      // Hype/Thrilling
  laugh: '搞笑/轻松',     // Funny
  dogblood: '狗血/戏剧',  // Melodramatic
};
```

**使用规则：**
- 每部剧 1-3 个情绪标签
- 按主次排序（第一个为主情绪）

---

## 4. 数据文件格式

### 4.1 推荐格式：JSON Lines (.jsonl)

**原因：** 便于增量更新、diff、版本控制

```jsonl
{"id":"drama001","titleChinese":"灰姑娘遇霸总","titleEnglish":"Cinderella Meets CEO","poster":"https://...","curatedScore":8.5,...}
{"id":"drama002","titleChinese":"重生之我是首富","titleEnglish":"Reborn as the Richest","poster":"https://...","curatedScore":7.8,...}
```

### 4.2 可选格式：单一 JSON 文件

```json
{
  "version": "2.0.0",
  "lastUpdated": "2026-04-04T12:00:00Z",
  "dramas": [
    { "id": "drama001", ... },
    { "id": "drama002", ... }
  ],
  "actors": [ ... ],
  "metadata": {
    "totalDramas": 100,
    "genreDistribution": { ... }
  }
}
```

### 4.3 演员独立表（可选）

如果演员数据需要复用，可以独立存储：

```json
// actors.json
{
  "actors": [
    {
      "id": "actor001",
      "name": "张三",
      "nameEn": "Zhang San",
      "avatar": "https://...",
      "bio": "新生代短剧演员",
      "filmography": ["drama001", "drama005"]
    }
  ]
}
```

---

## 5. 数据获取流程

### 5.1 数据源优先级

```
1. 豆瓣短剧条目
   ├─ 评分、简介、演员
   ├─ 海报、剧照
   └─ 类型标签

2. MyDramaList 补充
   ├─ 英文标题
   ├─ 演员英文名
   └─ 国际评分

3. YouTube 官方频道
   ├─ 播放链接
   ├─ 集数信息
   └─ 缩略图（需筛选）

4. 人工策展
   ├─ curatedScore 评分
   ├─ editorNote 推荐语
   └─ highlights 看点提炼
```

### 5.2 数据采集 Checklist

对每部剧，ShortData 团队需要完成：

```
□ 豆瓣数据抓取
  □ 标题、年份、集数
  □ 评分 + 评分人数
  □ 简介
  □ 海报图（高清）
  □ 演员列表 + 头像

□ YouTube 匹配
  □ 找到完整版视频链接
  □ 验证视频与豆瓣条目一致
  □ 记录频道名称

□ 人工审核
  □ 检查图片质量
  □ 补充英文标题
  □ 添加情绪标签（moods）
  □ 提炼看点（highlights）
  □ 评定策展评分（curatedScore）

□ 质量验证
  □ 所有必填字段完整
  □ 图片链接可访问
  □ YouTube 链接有效
  □ 评分在合理范围（6.0-10.0）
```

---

## 6. 数据交付规范

### 6.1 文件结构

```
shortdata/
├── dramas.jsonl          # 主数据文件
├── actors.json           # 演员独立表（可选）
├── images/               # 本地图片存储（如果需要）
│   ├── posters/
│   ├── backdrops/
│   └── actors/
└── metadata.json         # 数据集元信息
```

### 6.2 metadata.json 示例

```json
{
  "version": "2.0.0",
  "generatedAt": "2026-04-04T12:00:00Z",
  "stats": {
    "totalDramas": 120,
    "editorPicks": 30,
    "avgCuratedScore": 7.8,
    "genreDistribution": {
      "现代都市": 45,
      "古装历史": 30,
      "悬疑推理": 15
    }
  },
  "sources": {
    "douban": 120,
    "mydramalist": 85,
    "youtube": 120
  }
}
```

### 6.3 增量更新

**新增剧集：**
```bash
# 追加到 dramas.jsonl
echo '{"id":"drama121",...}' >> dramas.jsonl
```

**修改剧集：**
```bash
# 使用 jq 更新 JSON
jq '(.dramas[] | select(.id == "drama001") | .curatedScore) = 9.0' dramas.json
```

---

## 7. 数据验证脚本需求

ShortData 团队需要提供以下验证脚本：

### 7.1 Schema 验证

```bash
node validate-schema.js dramas.jsonl
# 检查所有必填字段
# 检查数据类型
# 检查枚举值（moods, genres）
```

### 7.2 图片链接验证

```bash
node validate-images.js dramas.jsonl
# 检查所有图片 URL 可访问
# 检查图片尺寸符合要求
# 生成损坏链接报告
```

### 7.3 YouTube 链接验证

```bash
node validate-youtube.js dramas.jsonl
# 检查 YouTube 链接有效
# 检查视频是否被删除/私有化
# 记录视频时长与剧集总时长差异
```

---

## 8. 初期数据规模建议

**MVP 阶段（第一批）：**
- ✅ 精品剧集：50 部
- ✅ 编辑推荐：15-20 部
- ✅ 覆盖所有主要类型（现代都市、古装、悬疑各 15+ 部）

**Growth 阶段（第二批）：**
- 📈 扩展到 150-200 部
- 📈 增加冷门高分剧集
- 📈 补充演员数据库（Top 50 演员完整 filmography）

**数据更新频率：**
- 新剧入库：每周 3-5 部
- 数据修正：按需更新
- 大版本更新：每月一次（重新评分、补充字段）

---

## 9. 数据权限与使用

**ShortData 团队职责：**
- 数据采集与清洗
- 质量验证
- 定期更新

**MassMotion 前端职责：**
- 数据消费（只读）
- UI 展示
- 用户交互（收藏、评分等本地功能）

**数据存储：**
- Git 仓库：`/Volumes/Lexar/oneweekoneproject/shortdata`
- 版本控制：每次更新提交 commit
- MassMotion 通过 Git submodule 或定期同步获取数据

---

## 10. 数据示例

完整示例见附件：`drama-example.json`

```json
{
  "id": "drama001",
  "titleChinese": "灰姑娘遇霸总",
  "titleEnglish": "Cinderella Meets CEO",
  "alternativeTitles": ["灰姑娘的霸道总裁"],
  "poster": "https://img.douban.com/view/photo/l/public/p2876543210.jpg",
  "backdrop": "https://i.ytimg.com/vi/zrO_my-AAVk/maxresdefault.jpg",
  "doubanRating": 8.2,
  "doubanRatingCount": 15420,
  "curatedScore": 8.5,
  "year": 2024,
  "episodeCount": 80,
  "episodeDuration": 2,
  "totalDuration": 160,
  "status": "completed",
  "genres": ["现代都市", "霸总", "甜宠"],
  "themes": ["契约婚姻", "灰姑娘", "隐藏身份"],
  "moods": ["sweet", "hype"],
  "synopsis": "普通女孩因一次意外与霸道总裁签订契约婚姻，在相处过程中逐渐发现彼此隐藏的秘密，最终收获真爱。",
  "synopsisEn": "An ordinary girl enters a contract marriage with a domineering CEO after an accident, gradually discovering each other's hidden secrets and finding true love.",
  "highlights": [
    "女主逆袭爽快，打脸渣男前男友",
    "霸总宠妻无节制，甜度爆表",
    "反转剧情紧凑，全程无尿点"
  ],
  "cast": [
    {
      "id": "actor001",
      "name": "李晨",
      "nameEn": "Li Chen",
      "avatar": "https://...",
      "role": "陆景琛",
      "characterDescription": "霸道总裁",
      "isLead": true
    },
    {
      "id": "actor002",
      "name": "赵丽",
      "nameEn": "Zhao Li",
      "avatar": "https://...",
      "role": "苏晴",
      "characterDescription": "灰姑娘女主",
      "isLead": true
    }
  ],
  "director": "王导",
  "youtubeId": "zrO_my-AAVk",
  "youtubeUrl": "https://www.youtube.com/watch?v=zrO_my-AAVk",
  "youtubeChannelName": "短剧天堂",
  "isEditorPick": true,
  "editorNote": "2024年最甜霸总剧，演员演技在线，剧情节奏紧凑",
  "curatedAt": "2026-04-01T10:00:00Z",
  "createdAt": "2026-03-15T08:00:00Z",
  "updatedAt": "2026-04-04T12:00:00Z"
}
```

---

**文档版本：** 2.0.0
**最后更新：** 2026-04-04
**负责人：** ShortData 团队
**审核人：** MassMotion 产品负责人
