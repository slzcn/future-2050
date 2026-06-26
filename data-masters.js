// 未来大师匹配数据层 - 把玩家的五维画像映射到最像的「未来世代代表」
// 五维：risk 审慎↔加速 / data 信念↔理性 / horizon 短线↔长期 / focus 分散↔集中 / decisive 观望↔果断
// 锚点范围 0~100，50 为中性
// 语境：2026-2050 奇点叙事 —— 6 位押注人类未来的传奇投资人(真实原型 + 风格化代号)
// 作者 小龙虾

const MASTERS = {
  // 流派主题色（卡片配色跟随，对齐人格气质色）
  schools: {
    architect: { name:'AI 文明派', color:'#27d3e0' },   // 冷算先知
    quant:     { name:'量化决断派', color:'#5a4b8a' },   // 量子量化师
    singular:  { name:'奇点信仰派', color:'#9a6ad9' },   // 奇点信徒
    interstellar:{ name:'星际远征派', color:'#f0942a' }, // 星际布道者
    hunter:    { name:'范式狩猎派', color:'#c2554a' },   // 范式猎手
    longevity: { name:'长存人本派', color:'#5ab0a0' },   // 长存守护者
  },
  // 大师五维锚点 p6{risk,data,horizon,focus,decisive}(0~100) + 标签 + 对话感点评
  list: [
    { id:'hassabis', name:'冷算先知', en:'The Cold Oracle · 图灵转世', emoji:'🧊', school:'architect',
      p6:{risk:35,data:95,horizon:88,focus:78,decisive:55}, tags:'数据为王 · 科学长征',
      blurb:'AI 文明的总设计师。你和他都信奉「先把问题算清楚，再谈改变世界」——在所有人为奇点狂热时，你像一块沉静的寒冰，只押推得通、证得明的科学突破。你赌的不是风口，是真理被验证的那一刻。' },
    { id:'simons', name:'量子量化师', en:'The Quantum Quant · 量子先生', emoji:'📐', school:'quant',
      p6:{risk:60,data:100,horizon:12,focus:18,decisive:100}, tags:'纯数据驱动 · 模型至上',
      blurb:'量化决断的化身。你和他一样对故事与情怀完全免疫，只信数字和模型说话——在未来的信息洪流里捞出确定的金子，让算法替你做决定。情绪是噪音，概率才是信仰。' },
    { id:'altman', name:'奇点信徒', en:'The Singularity Believer', emoji:'🔮', school:'singular',
      p6:{risk:92,data:55,horizon:82,focus:70,decisive:95}, tags:'押注 AGI 必至 · All in 未来',
      blurb:'坚信奇点终将降临的布道者。你和他都为「人类与 AI 合体」的未来全情下注，相信通用智能必将到来，敢在别人还在争论时果断 All in。你押的不是一家公司，是一整个新物种的诞生。' },
    { id:'musk', name:'星际布道者', en:'The Interstellar Evangelist', emoji:'🚀', school:'interstellar',
      p6:{risk:88,data:45,horizon:100,focus:80,decisive:90}, tags:'文明跃迁 · 火星与长生',
      blurb:'活在百年之后的远征者。别人算 ROI，你算「这能不能让文明跃迁到下一级」。火星、星际、永生——你押的从来不是季度财报，是科幻照进现实。要么名垂青史，要么血本无归，中间地带不存在。' },
    { id:'thiel', name:'范式猎手', en:'The Paradigm Hunter', emoji:'⚡', school:'hunter',
      p6:{risk:82,data:72,horizon:60,focus:98,decisive:88}, tags:'反共识 · 押注拐点',
      blurb:'专猎范式拐点的反共识者。你和他都对「从零到一」极度敏感，最大的快感是在所有人都看错时独自看对。你不在热闹里凑份子，只在无人问津的角落里集中重兵——真正的暴利，永远藏在共识的对面。' },
    { id:'johnson', name:'长存守护者', en:'The Longevity Guardian', emoji:'🌿', school:'longevity',
      p6:{risk:25,data:88,horizon:100,focus:55,decisive:35}, tags:'慢与持久 · 不追风口',
      blurb:'押注「活得更久」的长期主义者。你和他一样不追风口、只信人本与持久——当所有人冲向最快的赛道，你押的是健康、生命与时间本身。慢，是你最深的远见；活下去，就是最终极的复利。' },
  ],
};

// 五维匹配：玩家五维画像 p6{risk,data,horizon,focus,decisive}（0~100）
// 与每位大师的 p6 算欧氏距离，最近的即最像
MASTERS.DIM6 = ['risk','data','horizon','focus','decisive'];
MASTERS.match = function(p6){
  const keys = MASTERS.DIM6;
  const ranked = MASTERS.list.map(m=>{
    let s=0;
    for(const k of keys){ const d=(p6[k]||50)-(m.p6?m.p6[k]:50); s+=d*d; }
    return { m, d: Math.sqrt(s) };
  }).sort((a,b)=> a.d - b.d);
  // 相似度:最大距离 sqrt(5*100^2)=223.6,映射为 0~100% 百分比
  const MAXD=Math.sqrt(5*100*100);
  const pct=Math.round((1-ranked[0].d/MAXD)*100);
  return {
    best: ranked[0].m,
    bestPct: Math.max(0,Math.min(100,pct)),
    others: ranked.slice(1, 3).map(x=>x.m),   // 次相似 2 位
    school: MASTERS.schools[ranked[0].m.school],
  };
};

if (typeof window !== 'undefined') window.MASTERS = MASTERS;
