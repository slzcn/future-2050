// ===== 全局游戏规则配置（所有可调参数集中在此）=====
// 改这一个文件就能调整：初始属性 / 概率档位 / 计分权重 / 健康衰减 / 存档键名等
// 作者 小龙虾

const CONFIG = {
  // 玩家初始属性
  start: { aum:100, track:100, network:100, health:100, luck:50 },

  // 属性条最大值（用于UI进度条归一化，不是硬上限）
  statMax: { aum:1200, track:1900, network:750, luck:100, health:100 },

  // 5档结果对应的属性变动倍率 + 显示样式
  // 2026-06-24 结局分布平衡: SS上调2.1(撑右尾封神), B/C翻车更狠(-0.6/-2.1, 让踩雷者跌进过山车带), A略升0.35
  outcomeTiers: {
    SS: { mult: 2.1,  label:'范式级回报', cls:'ss', emoji:'🚀' },
    S:  { mult: 1.0,  label:'押注命中', cls:'s',  emoji:'✅' },
    A:  { mult: 0.35, label:'勉强保本', cls:'a',  emoji:'➖' },
    B:  { mult:-0.6,  label:'押注落空', cls:'b',  emoji:'⚠️' },
    C:  { mult:-2.1,  label:'彻底归零', cls:'c',  emoji:'💀' },
  },

  // === 概率结算参数 ===
  // 表现分 = p*perfWeight.base + (1-dice)*perfWeight.dice
  // p = clamp(项目base + baseAdjust + luckBonus, baseClamp.min, baseClamp.max)
  // luckBonus = clamp((luck-8)*luckPerPoint, luckClamp.min, luckClamp.max)
  // 落档：表现分 ≥ tierCuts[X] → 档位 X
  probability: {
    baseAdjust: 0.02,                 // 全局基础胜率微调(正=整体偏好运)
    baseClamp: { min:0.05, max:0.93 },
    luckBase: 50,                     // 运气中位基准(0-100制)
    luckPerPoint: 0.004,              // 每点运气对胜率影响
    luckClamp: { min:-0.16, max:0.20 },
    perfWeight: { base:0.54, dice:0.46 },  // 2026-06-24:随机占比32→46%,结果更两极,掏空中段(资深)、补厚两端(过山车/封神)
    tierCuts: { SS:0.77, S:0.63, A:0.44, B:0.22 },  // 2026-06-24:SS降0.77(撑封神10%),B降0.22(放更多落C档翻车)
    trendBoost: { hot:0.08, down:0.08 },  // 风口/逆势 可博性加成(让博风口不至于纯送死)
  },

  // === 趋势回报修正(2026-06-21平衡:让顺势不能无脑封神,博险才有暴利)===
  // 仅作用于正收益(SS/S/A)。
  trendReturn: {
    upDecay: 0.85,    // 顺应时代:每多选一次,后续顺势回报×0.85^(已选次数)，边际递减(风口红利越吃越薄)
    upFloor: 0.4,     // 顺势回报衰减下限(至少保留40%)
    hotGain: 1.3,     // 2026-06-24:1.4→1.3,风口/逆势博中超额回报略降(配合整体分布下压)
  },

  // 运气增减（按结果档位）
  luckDelta: { SS:4, S:2, A:0, B:-2, C:-4 },

  // 健康衰减规则。2026-06-24:baseDecay 1.2→1.0(略放缓基础消耗), extraOnVeryBad 13→12(C档扣血微调)
  health: { baseDecay:1.0, rampPerPeriod:0.7, extraOnBad:6, extraOnVeryBad:12, bonusOnGreat:1, minHealth:0, maxHealth:100 },

  // 健康死亡相关
  healthDeath: {
    earlyOutTrackCap: 650,   // 2026-06-24:800→650,影响力门槛降低,让部分"心智死且影响力中等"者按低分落入过山车而非全判透支,使心智透支贴近10%
  },

  // === 综合评分（五属性归一化构成1000分，2026-06-21重设计）===
  // === 净值线性评分(2026-06-22重构)===  综合分 = (资本-100-累计投入)*a + (业绩-100)*b + (人脉-100)*c
  // 系数 a:b:c 守 资本:业绩:人脉=2:3:1 的"对分贡献",并经模拟反解让满分落1000+命中档位比例
  // 2026-06-24 结局分布平衡: 系数整体下压(峰左移,缓解资深超额), 维持 资本:业绩:人脉≈2:3:1
  scoreCoef: { a: 0.192, b: 0.227, c: 0.089 },  // 资本:业绩:人脉≈2:3:1, 模拟反解贴七档目标分布
  scoreClampMax: 1000,                          // 总分上限
  // 运气影响胜率: 实际胜率 = clamp(base + (运气-50)/50 * luckEffect, 0, 1)
  luckEffect: 0.4,        // 2026-06-24:0.3→0.4,运气影响加大,提升结果方差(配合两极化分布)
  deadPenalty: 0.48,       // 2026-06-24:0.6→0.48,心智归零打折更狠,压低透支者分数避免其落入高档
  // 结局音效门槛(跟 endingTiers 对齐:winBig=文明设计师/新世界缔造者, winMid=未来合伙人/清醒的幸存者, neutral=过山车赌徒, 以下lose)
  scoreTiersForSfx: { big: 550, mid: 250, neutral: 150 },

  // 小额参投(资本不够时兜底)回报系数
  smallTicketFactor: 0.5,

  // === MBTI风格判定阈值 ===
  // 某维度|分|≤midThreshold 视为接近中点(均衡倾向)
  mbtiMidThreshold: 2,

  // === 本地存档键名 ===
  storage: {
    save:   'fsim2050_save_v1',      // 中途进度
    result: 'fsim2050_result_v1',   // 上次结果
    stats:  'fsim2050_stats_v1',     // 历史统计
    music:  'fsim2050_music_v1',     // 音乐偏好
    playerId: 'fsim2050_pid_v1',     // 本机玩家专属ID
    playerName:'fsim2050_pname_v1',  // 本机玩家昵称
  },

  // === 音乐参数 ===
  music: {
    masterVolume: 0.9,
    fadeInMs: 300,
    fadeOutMs: 250,
    schedAheadSec: 0.2,
    lookaheadMs: 80,
    defaultOn: true,   // 默认开(首次交互时响起)
    enabled: true,     // 音乐总开关(已换真实mp3年代金曲风)
  },

  // === UI 文案（封面等通用文本，便于改）===
  ui: {
    coverTitle:    '2050<br>未来投资模拟器',
    coverYears:    '2026 — 2050',
    coverSub:      '从AGI临界点出发，押注人类未来二十四年的每一次范式跃迁。你不是在赚钱——你在用资本，给文明的走向投票。',
    coverRules:    '5大纪元 · 20次押注 · 下注当下不揭晓<br>每个纪元落幕，未来统一揭晓<br>主流叙事·泡沫狂热·逆共识，胜率不同，时运也算数<br>算力不够投不起大局，心智透支提前出局',
    coverCredit:   '🦞 小龙虾 出品 · 仅供娱乐<br>剧情纯属对未来的大胆想象，非投资建议',
    btnStart:      '开始游戏',
    btnContinue:   '⏎ 继续上次',
    btnViewLast:   '查看上次战绩',
    btnRestart:    '重新开始',
    confirmRestart:'确定放弃当前进度，回到首页重新开始吗？',
    musicTipNeed:  '点右上角🔇可开启纪元背景音乐',
    scrollHint:    '↓ 下滑了解玩法',
  },

  // === 游戏内文案(便于翻译/定制) ===
  text: {
    // 5档揭晓点评
    tierSS: '未来给了你最丰厚的回报——${name}成为范式级案例，你的判断被写进历史。',
    tierS:  '${name}稳稳兑现，你押对了方向，吃到了完整的时代红利。',
    tierA:  '${name}不功不过，勉强保本退出。有些投资，活着就是胜利。',
    tierB:  '${name}没能跑出来，你交了学费。${why}。',
    tierC:  '${name}彻底归零，血本无归。${why}——这一课，刻骨铭心。',
    // 邀请横幅
    invited: '🎉 你是被 <b>${name}</b> 邀请来的，开启属于你的二十四年吧',
    // 选择页
    choiceTitle: '${year} 年 · 投资抉择',
    choiceSub: '作为${title}，这一站你只能押注 1 个未来',
    choicePending: '⏳ 下注后不会立刻揭晓，本纪元落幕时才见分晓',
    // 项目锁定
    lockNoAum: '算力不足',
    lockNoTrack: '影响力不足',
    lockNoHealth: '心智不足',
    lockSmall: '算力不足·小额参投（回报减半）',
    // 封存页
    stagedTitle: '已下注 · 封存待揭晓',
    stagedTip: '你押上了 ${amt}M 算力。<br>这一笔是先知下注还是接盘踩雷，<br>要等这个纪元落幕才见分晓。',
    stagedUndo: '撤销，重选本站',
    // 揭晓页
    verdictMark: '— 时 代 落 幕 · 命 运 揭 晓 —',
    healthDeadWarn: '⚠️ 你的心智带宽已透支殆尽，认知亮起最后的红灯……',
    btnAfterPeriod: {
      dead: '迎接结局…',
      last: '见证你的二十四年',
      next: '走向下一个纪元',
    },
    // 按钮
    btnSeeChoices: '看看有哪些项目',
    btnEnterPeriod: '进入这个纪元',
    btnConfirmPick: '请选择一个项目',
    btnConfirmed: '确认押注',
    btnWitness: '见证时代的答案',
    btnContinue: '继续下一站',
    // 结局页 · 战绩卡
    endingRankLabel: '二 十 四 年 · 终 局',
    endingStatScore: '综合评分',
    endingStatAum: '最终算力',
    endingStatTrack: '影响力',
    endingStatHitMiss: '命中/踩坑',
    endingBestTitle: '🏆 先知一投',
    endingWorstTitle: '💀 至暗一坑',
    endingBestNone: '这一生，未曾抓住真正的大鱼',
    endingWorstNone: '谨慎如你，未踩重大深坑',
    endingRecordHead: '— 二十四年押注轨迹 —',
    endingFootBrand: '2050未来投资模拟器 · <b>2026—2050</b> · 🦞 小龙虾出品',
    endingFootQrTip: '长按扫码押注你自己的未来 · 仅供娱乐',
    // 五档结果简称(轨迹表/高光框用，区别于 outcomeTiers.label 长名)
    outcomeShort: { SS:'传奇', S:'命中', A:'保本', B:'失利', C:'惨败' },
    // 结局页按钮/提示
    btnCopyShare: '复制分享',
    btnEndingRestart: '重新开始',
    endingShareHint: '长图生成后会弹出预览，手机端长按图片即可保存到相册<br>复制链接发给朋友，挑战谁是更强的投资人',
    mbtiHead: '— 你的未来观人格画像 —',
    genImage: '生成战绩长图',
    genImageWait: '正在生成长图，请稍候…',
    genImageOk: '生成成功！',
    genImageFail: '生成失败，请直接截图保存',
    genImageTip: '✅ 战绩长图已生成<br>手机：长按图片保存到相册 ｜ 电脑：右键另存为',
    copyOk: '链接+文案已复制，去粘贴分享吧',
    copyFail: '请手动复制地址栏链接',
    promptName: '给自己起个未来投资人名号吧（让朋友知道是谁邀请的，可留空跳过）：',
    // 称号
    titles: ['观察员','押注人','未来合伙人','文明操盘手','时代设计师'],
  },

  // === 介绍首页内容(图文卡片,可自由增删改)===
  intro: [
    { icon:'🎮', title:'这是什么游戏',
      body:'一款关于「未来、押注与文明」的文字叙事投资游戏。你扮演一名未来投资人，从2026年AGI临界点出发，押注人类未来二十四年的每一次范式跃迁——每一次出手，都是在为文明的走向投票。' },
    { icon:'🚀', title:'故事背景',
      body:'从通用人工智能突破的2026年出发，穿越AGI临界、具身爆发、长生时代、星地经济、意识纪元五大纪元。每个纪元都有改写物种命运的造富神话，也有埋人无数的时代陷阱——你是看懂未来的先知，还是奇点浪潮的祭品？' },
    { icon:'⚙️', title:'核心设定',
      body:'<b>5大纪元</b>：2026-2050分为AGI临界→具身爆发→长生时代→星地经济→意识纪元。<br><b>5维属性</b>：算力、影响力、网络、时运、心智——算力不够投不起大局，心智透支提前出局。<br><b>叙事×时运</b>：项目分主流叙事/泡沫狂热/逆共识，胜率不同，但时运也掷骰子——同样选择，每局结果都不同。' },
    { icon:'🎯', title:'怎么玩',
      body:'每个纪元4次机会，每次从3个项目押注1个。<br><b>延迟揭晓</b>：下注后不立刻出结果，等整个纪元落幕才一次性揭晓（如真实押注未来，要数年才见分晓）。<br>看懂叙事、管好算力与心智，是穿越奇点的关键。' },
    { icon:'🏆', title:'你会得到什么',
      body:'走完二十四年，收获两张专属标签：<br><b>① 结局称号</b>——从「文明设计师·定义未来的人」到「时代的祭品」共7档，由战绩决定。<br><b>② 未来观人格</b>——审慎/加速 × 理性/信念，测出你是「奇点信徒」「人本守护者」还是「平衡预言家」。<br>结果可生成战绩长图，分享比拼。' },
    { icon:'💾', title:'贴心功能',
      body:'• 中途退出自动存档，下次接着玩<br>• 随时回看上次战绩<br>• 记录最高分与最常人格<br>• 5纪元专属背景音乐，可随时开关' },
  ],
};
