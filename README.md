# 2050 未来投资模拟器 · 文件架构

> 玩家在 2026→2050 的科技浪潮中扮演投资人，逐轮做投资决策，最终结算人格画像 +
> 「你最像哪位科技投资大师」。纯前端静态站，Supabase 直连上报数据。

## 文件清单

| 文件 | 用途 | 改它能干什么 |
|------|------|------|
| `index.html` | 页面骨架（封面/游戏/结算各 screen 容器） | 改页面结构、screen 容器 |
| `style.css` | 全部样式 | 改配色/布局/排版/动效 |
| `config.js` | **🔑 全局规则配置**（作者注释集中说明） | 调难度/概率/计分/健康衰减/存档 key/Supabase 连接 |
| `data-bundle.js` | **游戏数据合集**（自动合并，勿手改单块） | 改剧情/项目/结局/人格画像/大师数据 |
| `engine.js` | 音效 + 背景音乐引擎（自动合并 Sfx/Music） | 一般不动 |
| `game.js` | 渲染 + 流程逻辑（GAME 对象，含分享/二维码/截图） | 改交互流程、结算 UI、分享卡 |
| `portraits-inline.js` | 大师头像 base64 内嵌（绕过妙搭 CORS） | 换头像（重新生成 base64） |
| `vendor/` | 第三方库（html2canvas / qrcode） | 不动 |
| `audio/` | 背景音乐 / 音效素材 | 换音频 |
| `portraits/` | 头像原图（生成 inline 用，不直接引用） | 换头像原图 |

> ⚠️ `data-bundle.js` 和 `engine.js` 是**自动合并产物**。若有拆分的原始
> `data-*.js` / `engine-*.js`，改原始块后重跑 `merge_js.py` 再合并，不要手改合并文件。

## data-bundle.js 里的数据块

合并自多个数据源，含以下全局对象：

| 对象 | 内容 |
|------|------|
| `DATA_PERIODS` | 各时代剧情 + 投资项目 + 职位 |
| `DATA_ENDINGS` | 结局称号 + 阈值 |
| `PERSONA5` | 5 维人格画像 |
| `PROFILE` | 玩家画像定义 |
| `MASTERS` | 科技投资大师数据（用于「你最像谁」匹配） |

## 配置查找速查（config.js）

- `start.{aum,track,network,health,luck}` — 玩家初始属性
- `statMax.*` — 属性条 UI 归一化最大值
- `outcomeTiers.{SS,S,A,B,C}.mult` — 5 档结果的属性变动倍率
- `probability.tierCuts.{SS,S,A,B}` — 落档分数线
- `probability.baseAdjust` — 整体胜率微调
- `probability.luckPerPoint` / `luckClamp` — 运气影响强度
- `probability.perfWeight.{base,dice}` — 实力 vs 随机占比
- `trendReturn.*` — 顺势/逆势回报修正（边际递减、博险暴利）
- `supabase.{url,key}` — 数据上报连接（publishable key 公开安全）

## 数据上报（Supabase）

- 纯静态前端直连 Supabase，连接配在 `config.js` 的 `supabase` 块
- **future-2050 专属项目**，与 vc-simulator 独立（各自独立的库）
- 留空则不上报
- 存档/邀请 key 用 `__future2050__` / `future2050_invited_by`
  （**不可写成 `vcsim`**，与 vc_sim 项目区分）

## 与 vc_sim 的关系

- **独立项目**：业务逻辑（剧情/项目/大师）各不相同，**互不移植**
- **共性 UI/交互优化要同步**：两项目结果页结构相同（分享卡/雷达图/按钮 hover
  等），纯 UI/体验类改动一处发现问题，另一处大概率也有，应一起改
- future **无全栈版**（vc_sim 才有 vc_app 全栈镜像）

## 部署（2 处）

future 改动需发布到 **GitHub Pages + 妙搭 HTML**，共 2 处。

```bash
# ① GitHub Pages
cd ~/.openclaw/workspace/future_2050
# 先 bump 所有 ?v= 版本号破缓存，再：
git add -A && git commit -m "..."
GIT_TERMINAL_PROMPT=0 git push origin main   # ⚠️ 必带 GIT_TERMINAL_PROMPT=0
# 线上：https://slzcn.github.io/future-2050/

# ② 妙搭 HTML（准备干净目录，禁带 .bak/.cleanup_backup）
rm -rf /tmp/miaoda_future && mkdir -p /tmp/miaoda_future
cp index.html game.js config.js style.css data-bundle.js engine.js portraits-inline.js admin.html /tmp/miaoda_future/
cp -r vendor audio portraits /tmp/miaoda_future/
cd /tmp && lark-cli apps +html-publish --app-id "$MIAODA_APP" --path ./miaoda_future --as user
# 发布成功后可在妙搭控制台看到线上链接（企业内网，不写入公开仓）
```

> 完整升级/发布规范（含移植矩阵、自检清单、踩坑记录）见
> `~/.openclaw/workspace/memory/vc-projects-deploy-spec.md`。
