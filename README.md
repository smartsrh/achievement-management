# 科研成果管理系统

基于 Next.js + Supabase 的科研成果管理平台，支持12种成果类型的统一管理。

## 功能特性

- 📊 **数据概览** - 实时统计各类成果数量
- 📝 **论文管理** - 期刊论文、会议论文
- 💡 **知识产权** - 专利、软件著作权、标准
- 🎯 **学术活动** - 会议报告、举办会议
- 📚 **出版物** - 学术专著
- 🏆 **成果奖励** - 科研奖励、人才培养
- 🔬 **其他成果** - 技术转移、其他研究成果

## 技术栈

- **前端**: Next.js 14 + TypeScript + Ant Design
- **后端**: Supabase (PostgreSQL + 实时API)
- **样式**: Tailwind CSS
- **部署**: Vercel (免费)

## 快速开始

### 1. 环境要求

- Node.js 18+ 
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 数据库设计

系统支持以下12种成果类型：

1. **期刊论文** - 标题、期刊、影响因子、作者等
2. **会议论文** - 论文类型、会议信息等  
3. **学术专著** - ISBN、出版社等
4. **专利** - 国别、申请号、状态等
5. **会议报告** - 报告类型、会议类型等
6. **标准** - 国家/国际标准、标准号等
7. **软件著作权** - 登记号、权利范围等
8. **科研奖励** - 奖项类型、级别、颁奖机构等
9. **人才培养** - 培养类别、人才类型等
10. **举办学术会议** - 参会人数、会议规模等
11. **成果技术转移** - 转移形式、交易金额等
12. **其他重要研究成果** - 数据库、标本、设备等

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署完成

## 开发指南

### 项目结构

```
achievement-management/
├── app/                 # Next.js App Router
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 主页面
├── lib/                # 工具库
│   └── supabase.ts     # Supabase 客户端
├── package.json        # 依赖配置
└── README.md          # 项目说明
```

### 添加新功能

1. 在 `app/` 目录下创建新页面
2. 在 `lib/` 目录下添加数据处理逻辑
3. 使用 Ant Design 组件构建 UI

## 许可证

MIT License

## 支持

如有问题，请提交 Issue 或联系开发团队。 