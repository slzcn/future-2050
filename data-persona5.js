// 未来观人格五维画像数据层（与 6 位未来大师一一对应，同源）
// 玩家五维(0-100) → 欧氏距离最近的人格原型 = 你的人格，必然对应同名大师
// 五维：risk 审慎↔加速 / data 信念↔理性 / horizon 短线↔长期 / focus 分散↔集中 / decisive 观望↔果断
// 人格 anchor 直接采用对应大师的五维坐标；配色对齐大师流派色
// 语境：2026-2050 奇点叙事
// 作者 小龙虾

const PERSONA5 = {
  DIM: ['risk','data','horizon','focus','decisive'],
  // 6 大人格原型 ←→ 6 大师 一一对应
  archetypes: [
    { key:'cold_oracle', emoji:'🧊', title:'冷算先知', color:'#27d3e0', master:'hassabis',
      anchor:{risk:35,data:95,horizon:88,focus:78,decisive:55},
      tag:'只信数据 · 验证真理',
      desc:'你是最让出资人安心的那类未来投资人——只押推得通、算得清的科学突破，对每一个「颠覆世界」的故事都先泼一盆冷水。在所有人为奇点狂热时，你像一块沉静的寒冰。你的天花板也许不够耀眼，但你几乎从不接盘泡沫。在加速的时代里，清醒就是你最锋利的武器。' },
    { key:'quantum_quant', emoji:'📐', title:'量子量化师', color:'#5a4b8a', master:'simons',
      anchor:{risk:60,data:100,horizon:12,focus:18,decisive:100},
      tag:'纯数据 · 拒绝故事',
      desc:'你对故事和情怀完全免疫，只信数字和模型。在未来的信息洪流里捞出确定的金子，让算法替你做决定——你赢在概率，而不是直觉。情绪是噪音，模型才是信仰，市场的每一次波动在你眼里都只是数据点。' },
    { key:'singularity_believer', emoji:'🔮', title:'奇点信徒', color:'#9a6ad9', master:'altman',
      anchor:{risk:92,data:55,horizon:82,focus:70,decisive:95},
      tag:'押注 AGI · All in 未来',
      desc:'你为「人类与 AI 合体」的未来全情燃烧，坚信通用智能必将降临，愿意为一个让你心动的奇点 All in。你能押中定义时代的公司，也最容易在泡沫顶点接最后一棒。你的人生大起大落，但你从不后悔——因为你真的相信过那个更好的未来。' },
    { key:'interstellar', emoji:'🚀', title:'星际布道者', color:'#f0942a', master:'musk',
      anchor:{risk:88,data:45,horizon:100,focus:80,decisive:90},
      tag:'文明跃迁 · 押注疯狂',
      desc:'别人算 ROI，你算「这能不能让文明跃迁到下一级」。火星、星际、永生——你押的从来不是公司，是科幻照进现实。你愿意为一个百年后的未来下注，也甘愿为之倾尽所有。要么名垂青史，要么血本无归，中间地带从不属于你。' },
    { key:'paradigm_hunter', emoji:'⚡', title:'范式猎手', color:'#c2554a', master:'thiel',
      anchor:{risk:82,data:72,horizon:60,focus:98,decisive:88},
      tag:'反共识 · 猎拐点',
      desc:'你专猎范式拐点，最大的快感是在所有人都看错时独自看对。你像一只埋伏在拐点的猎鹰，平时按兵不动，机会来临时集中重兵一击致命。你对「从零到一」极度敏感，真正的暴利永远藏在共识的对面——但赌错方向时，孤注一掷也会让你伤得最重。' },
    { key:'longevity_guardian', emoji:'🌿', title:'长存守护者', color:'#5ab0a0', master:'johnson',
      anchor:{risk:25,data:88,horizon:100,focus:55,decisive:35},
      tag:'慢与持久 · 不追风口',
      desc:'你押注未来时谨慎，却比谁都更看重「人」与「持久」。当所有人冲向最快的赛道，你押的是健康、生命与时间本身。你不追风口，却总能在那些「慢而正确」的方向上收获时间的礼物。你的软肋是有时太念旧、太相信长期，对认定的方向下不去止损的手。' },
  ],

  match(ps){
    let best=null, bd=1e9;
    for(const a of this.archetypes){
      let s=0;
      for(const k of this.DIM){ const d=(ps[k]||50)-a.anchor[k]; s+=d*d; }
      const dist=Math.sqrt(s);
      if(dist<bd){ bd=dist; best=a; }
    }
    return best;
  },

  // 动态副标题：取偏离中点最远的前 3 维，拼成"加速·理性·长期"
  subFromDims(ps, dimsMeta){
    const arr = this.DIM.map(k=>{
      const v=ps[k]!=null?ps[k]:50;
      const meta=dimsMeta.find(d=>d.key===k);
      const word = v>=50 ? (meta?meta.high:k) : (meta?meta.low:k);
      return { k, dev:Math.abs(v-50), word };
    }).sort((a,b)=>b.dev-a.dev);
    const picked = arr.filter(x=>x.dev>=8).slice(0,3).map(x=>x.word);
    return picked.length? picked.join(' · ') : '攻守兼备 · 不走极端';
  },

  // 桥接句：玩家和匹配大师在哪 1-2 维最契合
  bridge(ps, masterP6, masterName, dimsMeta){
    const cand = this.DIM.map(k=>{
      const pv=ps[k]!=null?ps[k]:50;
      const mv=masterP6[k]!=null?masterP6[k]:50;
      return { k, diff:Math.abs(pv-mv), dev:Math.abs(pv-50), pv };
    }).filter(x=>x.dev>=15).sort((a,b)=>a.diff-b.diff).filter(x=>x.diff<=22);
    if(!cand.length) return '';
    const words = cand.slice(0,2).map(x=>{
      const meta=dimsMeta.find(d=>d.key===x.k);
      return x.pv>=50 ? (meta?meta.high:x.k) : (meta?meta.low:x.k);
    });
    const mn = masterName.replace(/\(.*\)/,'');
    return `在「${words.join('、')}」上，你和${mn}几乎重合——`;
  },
};

if (typeof window !== 'undefined') window.PERSONA5 = PERSONA5;
