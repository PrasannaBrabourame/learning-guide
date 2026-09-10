/* Shared lab chrome, theme toggle, tab deep links, the scenario drill and the
   navigation interface. This lived in all thirteen lab pages as thirteen
   identical copies, which is how two bugs got in: a callout that needed a size
   rule needed thirteen separate patches, and one lab shipped a stale copy of a
   rule because it was generated from an old snapshot. One file now.

   Loaded AFTER each page's own script, because the drill reads the .exam-line
   elements that script renders and the interface reads the rendered panes.
   Every block is defensive about what it does not find: a page with no drill
   host, or no tabs, simply skips that part. */

/* ================= THEME ================= */
/* shares the study guide's stored preference so the two pages agree */
(function(){
  const KEY='study-theme', root=document.documentElement;
  const read=()=>{ try{ return JSON.parse(localStorage.getItem(KEY)) }catch{ return null } };
  const apply=m=>{ root.dataset.theme=m; const b=document.getElementById('themeBtn');
                   if(b) b.textContent = m==='dark' ? '☀️ theme' : '🌙 theme'; };
  let mode=read();
  if(mode!=='dark' && mode!=='light')
    mode = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  apply(mode);
  /* crossfade rather than hard-cut (see the theme-fade rule in lab.css) */
  let fadeT=0;
  const fade=()=>{ try{ if(matchMedia('(prefers-reduced-motion: reduce)').matches) return; }catch{}
    root.classList.add('theme-fade'); clearTimeout(fadeT);
    fadeT=setTimeout(()=>root.classList.remove('theme-fade'), 400); };
  document.getElementById('themeBtn').onclick=()=>{
    fade();
    mode = root.dataset.theme==='dark' ? 'light' : 'dark';
    apply(mode);
    try{ localStorage.setItem(KEY, JSON.stringify(mode)) }catch{}
  };
})();

/* deep links: cloud.html#pane-cheat should open that tab, and the URL should follow the tab */
(function(){
  const open = id => {
    const tab = document.querySelector(`.tab[data-pane="${id}"]`), pane = document.getElementById('pane-'+id);
    if(!tab || !pane) return false;
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
    document.querySelectorAll('.pane').forEach(x=>x.classList.remove('on'));
    tab.classList.add('on'); pane.classList.add('on');
    return true;
  };
  const fromHash = () => {
    const m = (location.hash||'').match(/^#pane-([\w-]+)$/);
    if (m) open(m[1]);
  };
  fromHash();
  addEventListener('hashchange', fromHash);
  document.querySelectorAll('.tab[data-pane]').forEach(t=>t.addEventListener('click',()=>{
    history.replaceState(null,'','#pane-'+t.dataset.pane);
  }));
})();

/* ================= SCENARIO DRILL =================
   Reads the page's own .exam-line entries at runtime, so it can never
   drift from the content and a new scenario becomes a new question free.
   Distractors are the answers to other scenarios on the same page, which
   makes them plausible by construction rather than by invention. */
(function(){
  const host=document.getElementById('drillHost');
  if(!host) return;
  const src=[...document.querySelectorAll('.exam-line')].map(el=>{
    const html=el.innerHTML;
    /* .exam-line is also used for pillar notes, which are multi-fact and start differently.
       A drillable scenario is authored as <b>“…”</b> → answer, so require that shape. */
    if(!/^\s*<b>\s*&ldquo;/.test(html)) return null;
    const i=html.indexOf('&rarr;')>=0?html.indexOf('&rarr;'):html.indexOf('→');
    if(i<0) return null;
    const q=html.slice(0,i).replace(/<\/?b>/g,'').replace(/&ldquo;|&rdquo;/g,'').trim();
    const full=html.slice(i+6).trim();
    /* the headline answer is the first sentence; the rest is the explanation */
    const m=full.match(/^(.*?[.!?])(\s|$)([\s\S]*)$/);
    const head=(m?m[1]:full).replace(/^\s+/,'');
    return {q, head, rest:(m?m[3]:'').trim(), full};
  }).filter(Boolean);
  /* some pages author the same content as a three-column table instead of exam lines:
     scenario | answer | because. Collect those too, so one engine serves both shapes. */
  [...document.querySelectorAll('table')].forEach(tb=>{
    const h=tb.innerHTML;
    if(!/When the scenario says/i.test(h)) return;
    const rows=h.match(/<tr>[\s\S]*?<\/tr>/g)||[];
    rows.forEach(r=>{
      const cells=(r.match(/<td[^>]*>([\s\S]*?)<\/td>/g)||[]).map(c=>c.replace(/^<td[^>]*>|<\/td>$/g,'').trim());
      if(cells.length<2) return;
      const q=cells[0].replace(/<\/?b>/g,'').trim();
      const head=cells[1].replace(/<\/?b>/g,'').trim();
      if(!q||!head) return;
      src.push({q:'&ldquo;'+q+'&rdquo;', head, rest:(cells[2]||'').trim(), full:head});
    });
  });
  if(src.length<4){ host.innerHTML='<div class="simnote">Not enough scenarios on this page to drill.</div>'; return; }

  let order=[], idx=0, chosen=null, score=[], opts=[];
  let seed=src.length*7919;
  const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff;};
  function shuffle(a){const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b;}
  function build(){
    order=shuffle(src.map((_,i)=>i)); idx=0; score=[]; chosen=null; setOpts(); render();
  }
  function setOpts(){
    const cur=src[order[idx]];
    const others=shuffle(src.filter(x=>x!==cur && x.head!==cur.head)).slice(0,3);
    opts=shuffle([cur,...others]);
  }
  function render(){
    const cur=src[order[idx]];
    const done=idx>=order.length;
    if(done){
      const right=score.filter(Boolean).length;
      host.innerHTML='<div class="drl">'+
        '<div style="font-family:var(--display);font-size:22px;margin-bottom:8px">'+right+' of '+score.length+'</div>'+
        '<div class="plain-line" style="margin-bottom:12px">'+
          (right===score.length?'Every one. Worth re-running it. The questions come back in a different order and the wrong answers move around.'
           :right/score.length>=0.7?'Solid. The ones you missed are the ones worth reading again, and they are the ones an interviewer will reach for.'
           :'Worth another pass. These are not memory questions, each one has a reason underneath it, and the reason is what makes the next one answerable.')+
        '</div><button class="btn" id="drlAgain">run it again</button></div>';
      host.querySelector('#drlAgain').onclick=build; return;
    }
    host.innerHTML='<div class="drl">'+
      '<div class="drl-bar">'+order.map((_,i)=>'<i class="'+(i<score.length?(score[i]?'ok':'no'):i===idx?'now':'')+'"></i>').join('')+'</div>'+
      '<div style="font-family:var(--mono);font-size:10.5px;color:var(--muted);margin-bottom:6px">SCENARIO '+(idx+1)+' OF '+order.length+'</div>'+
      '<div class="drl-q">'+cur.q+'</div>'+
      opts.map((o,i)=>'<button class="drl-o'+(chosen===null?'':(o===cur?' right':(o===chosen?' wrong':' muted')))+'" data-i="'+i+'"'+(chosen!==null?' disabled':'')+'>'+o.head+'</button>').join('')+
      (chosen!==null?'<div class="'+(chosen===cur?'ok':'lzbad')+'" style="margin-top:12px">'+
          (chosen===cur?'<b>Right.</b> ':'<b>Not that one.</b> ')+cur.head+(cur.rest?' '+cur.rest:'')+'</div>'+
        '<button class="btn" id="drlNext" style="margin-top:12px">next scenario ▸</button>':'')+
      '</div>';
    host.querySelectorAll('.drl-o').forEach(b=>b.onclick=()=>{
      if(chosen!==null) return;
      chosen=opts[+b.dataset.i]; score[idx]=(chosen===cur); render();
    });
    const n=host.querySelector('#drlNext');
    if(n) n.onclick=()=>{ idx++; chosen=null; if(idx<order.length) setOpts(); render(); };
  }
  build();
})();

/* ================= INTERFACE =================
   Navigation and orientation only. Nothing here touches what a simulation does, and it is
   wrapped so that if any of it fails, the content and the simulations still work. */
(function(){
 try{
  const tabsEl=document.querySelector('.tabs');
  if(!tabsEl||!tabsEl.parentNode) return;

  /* --- sticky bar + reading progress --- */
  const wrap=document.createElement('div'); wrap.className='tabwrap';
  tabsEl.parentNode.insertBefore(wrap, tabsEl); wrap.appendChild(tabsEl);
  const prog=document.createElement('div'); prog.className='rprog';
  const progBar=document.createElement('i');
  prog.appendChild(progBar);
  document.body.appendChild(prog);
  const onScroll=()=>{
    const h=document.documentElement.scrollHeight-window.innerHeight;
    progBar.style.width=(h>0?Math.min(100,window.scrollY/h*100):0)+'%';
  };
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* --- count the simulations in each tab, and mark their cards --- */
  const panes=[...document.querySelectorAll('.pane')];
  /* mark the cards that contain a simulation, by looking down rather than up */
  panes.forEach(p=>{
    p.querySelectorAll('.card').forEach(c=>{
      if(c.querySelectorAll('.simplain').length) c.classList.add('issim');
    });
  });
  [...tabsEl.querySelectorAll('.tab')].forEach(t=>{
    const p=document.getElementById('pane-'+t.dataset.pane);
    if(!p) return;
    const n=p.querySelectorAll('.simplain').length;
    if(n) t.insertAdjacentHTML('beforeend','<span class="tcount">'+n+'</span>');
  });

  /* --- wrap the panes so a rail can sit beside them --- */
  const first=panes[0]; if(!first) return;
  const grid=document.createElement('div'); grid.className='labgrid';
  const main=document.createElement('div');
  first.parentNode.insertBefore(grid, first);
  panes.forEach(p=>main.appendChild(p));
  grid.appendChild(main);
  const railCol=document.createElement('div'); railCol.className='railcol';
  const railHead=document.createElement('div'); railHead.className='railhead'; railHead.textContent='on this tab';
  const rail=document.createElement('nav'); rail.className='rail'; rail.id='labRail';
  railCol.appendChild(railHead); railCol.appendChild(rail);
  grid.appendChild(railCol);

  let spy=null;
  function buildRail(){
    const pane=document.querySelector('.pane.on'); if(!pane) return;
    /* walk cards rather than headings, so “is this section interactive?” is answered
       by the card that owns the heading instead of by climbing the tree */
    const rows=[];
    pane.querySelectorAll('.card').forEach((c,i)=>{
      const h=c.querySelector('h2.sec'); if(!h) return;
      if(!h.id) h.id='s-'+pane.id.replace('pane-','')+'-'+i;
      rows.push({id:h.id, sim:c.querySelectorAll('.simplain').length>0,
                 txt:h.textContent.replace(/^Try it\s*[, –-]\s*/,'').trim()});
    });
    const heads=rows.map(r=>document.getElementById(r.id)).filter(Boolean);
    rail.innerHTML=rows.map(r=>
      '<a href="#'+r.id+'" data-t="'+r.id+'" class="'+(r.sim?'sim':'')+'"><i></i><span>'+r.txt+'</span></a>').join('');
    rail.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{
      e.preventDefault();
      const el=document.getElementById(a.dataset.t);
      if(el) window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-84, behavior:'smooth'});
    }));
    if(spy) spy.disconnect();
    if(typeof IntersectionObserver!=='undefined'&&heads.length){
      spy=new IntersectionObserver(es=>{
        es.forEach(en=>{
          if(!en.isIntersecting) return;
          rail.querySelectorAll('a').forEach(a=>a.classList.toggle('on',a.dataset.t===en.target.id));
        });
      },{rootMargin:'-84px 0px -70% 0px'});
      heads.forEach(h=>spy.observe(h));
    }
    const f=rail.querySelector('a'); if(f) f.classList.add('on');
  }

  /* --- keep the active tab visible, and rebuild the rail on every switch --- */
  function afterSwitch(){
    const on=tabsEl.querySelector('.tab.on');
    if(on&&on.scrollIntoView) on.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
    buildRail();
  }
  tabsEl.addEventListener('click',e=>{ if(e.target.closest('.tab')) setTimeout(afterSwitch,0); });
  buildRail();

  function switchTo(pane){
    const t=tabsEl.querySelector('.tab[data-pane="'+pane+'"]');
    if(t){ t.click(); setTimeout(afterSwitch,0); }
  }

  /* --- command palette over every heading on the page --- */
  const idx=[];
  panes.forEach(p=>{
    const label=(tabsEl.querySelector('.tab[data-pane="'+p.id.replace('pane-','')+'"]')||{}).textContent||'';
    p.querySelectorAll('h2.sec').forEach((h,i)=>{
      if(!h.id) h.id='s-'+p.id.replace('pane-','')+'-'+i;
      idx.push({pane:p.id.replace('pane-',''), tab:label.replace(/\d+$/,'').trim(), id:h.id, name:h.textContent.trim()});
    });
  });
  const pal=document.createElement('div'); pal.className='cmdk';
  const box=document.createElement('div'); box.className='cmdbox';
  box.setAttribute('role','dialog'); box.setAttribute('aria-label','Find a section');
  const inp=document.createElement('input');
  inp.id='cmdInput'; inp.placeholder='Find a section…';
  inp.setAttribute('autocomplete','off'); inp.setAttribute('spellcheck','false');
  const list=document.createElement('div'); list.className='cmdlist'; list.id='cmdList';
  const foot=document.createElement('div'); foot.className='cmdfoot';
  foot.innerHTML='<span><b>↑↓</b> move</span><span><b>↵</b> jump</span><span><b>esc</b> close</span>';
  box.appendChild(inp); box.appendChild(list); box.appendChild(foot);
  pal.appendChild(box); document.body.appendChild(pal);
  let hits=[], sel=0;
  function draw(q){
    const s=q.trim().toLowerCase();
    hits=(s?idx.filter(x=>(x.name+' '+x.tab).toLowerCase().includes(s)):idx).slice(0,60);
    sel=0;
    list.innerHTML=hits.length
      ? hits.map((h,i)=>'<button data-i="'+i+'" class="'+(i===0?'on':'')+'"><span class="cmdtab">'+h.tab+'</span><span class="cmdname">'+h.name+'</span></button>').join('')
      : '<div class="cmdnone">Nothing matches that.</div>';
    list.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.i)));
  }
  function go(i){
    const h=hits[i]; if(!h) return;
    close(); switchTo(h.pane);
    setTimeout(()=>{ const el=document.getElementById(h.id);
      if(el) window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-84,behavior:'smooth'}); },60);
  }
  function open(){ pal.classList.add('on'); inp.value=''; draw(''); if(inp.focus) inp.focus(); }
  function close(){ pal.classList.remove('on'); }
  const fb=document.getElementById('findBtn'); if(fb) fb.addEventListener('click',open);
  pal.addEventListener('click',e=>{ if(e.target===pal) close(); });
  inp.addEventListener('input',()=>draw(inp.value));
  inp.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault(); if(!hits.length) return;
      sel=(sel+(e.key==='ArrowDown'?1:-1)+hits.length)%hits.length;
      list.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('on',i===sel));
      const b=list.querySelectorAll('button')[sel]; if(b&&b.scrollIntoView) b.scrollIntoView({block:'nearest'});
    } else if(e.key==='Enter'){ e.preventDefault(); go(sel); }
    else if(e.key==='Escape'){ close(); }
  });
  draw('');

  /* --- keyboard --- */
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape') close();   /* closing an open overlay is dialog behaviour, not a shortcut */
  });
 }catch(err){ if(window.console) console.warn('interface enhancements unavailable:', err); }
})();

/* ================= LABS MENU =================
   The thirteen labs, grouped and ordered exactly as the dashboard groups and
   orders them. This table is the reason the header could shrink: the twelve
   sibling-lab chips each page used to carry are generated from here instead,
   behind one control, and the page can tell the reader where they are standing.
   pca and sap are tabs inside the cloud lab rather than pages of their own,
   which is why they are deep links. */
(function(){
  const TRACKS = [
    { name:'Build, run and govern an agent', labs:[
      ['adk.html',       'ADK, building an agent that behaves'],
      ['frames.html',    'Pick your frame: five ways to build the same agent'],
      ['agentcore.html', 'AgentCore. An agent you can trust'],
      ['agentbuild.html','Agents building agents'],
      ['evals.html',     'Evaluation, how do you know it got better?'],
      ['metrics.html',   'The number to trust: metrics for asymmetric mistakes'],
      ['govern.html',    'Govern and secure an estate of agents'],
      ['gemini.html',    'Rolling it out to a whole company'],
      ['peakweek.html',  'Peak Week, one agent, all the way through'] ] },
    { name:'Cloud and architecture', labs:[
      ['cloud.html',            'How the cloud actually works'],
      ['design.html',           'Diagrams, a picture that argues'],
      ['cloud.html#pane-pca',   'GCP Architect exam'],
      ['cloud.html#pane-cheat', 'SAP-C02 cheatsheet'] ] },
    { name:'Under the hood', labs:[
      ['gpu.html',     'The machine underneath'],
      ['train.html',   'Wrong, then less wrong: watch a model learn'],
      ['classic.html', 'Before the network: four little machines'],
      ['llm.html',     'One token at a time'],
      ['serving.html', 'The engine, not the model'],
      ['fleet.html',   'Twenty engines, one endpoint'] ] }
  ];

  const btn = document.getElementById('labsBtn');
  const wrap = document.getElementById('labsWrap');
  if (!btn || !wrap) return;
  const here = ((location.pathname || '').split('/').pop() || 'index.html');

  const menu = document.createElement('div');
  menu.className = 'labmenu'; menu.id = 'labMenu'; menu.hidden = true;
  menu.setAttribute('role','group');
  menu.setAttribute('aria-label','All labs, in reading order');
  const cheatRow = `<div class="lmgrp"><h4>Revision</h4><div class="lmlist">`
    + `<a href="cheatsheet.html"${here==='cheatsheet.html'?' class="here" aria-current="page"':''}><i>&#9636;</i><span>Cheatsheet: the whole guide on one page</span></a>`
    + `</div></div>`;
  menu.innerHTML = cheatRow + TRACKS.map(t => {
    const items = t.labs.map(([href, title], i) => {
      const on = href === here;   // deep links into cloud never match, by design
      return `<a href="${href}"${on ? ' class="here" aria-current="page"' : ''}>`
           + `<i>${i + 1}</i><span>${title}</span></a>`;
    }).join('');
    return `<div class="lmgrp"><h4>${t.name} · ${t.labs.length} labs, in order</h4>`
         + `<div class="lmlist">${items}</div></div>`;
  }).join('');
  wrap.appendChild(menu);

  const open = v => {
    menu.hidden = !v;
    btn.setAttribute('aria-expanded', String(v));
    btn.classList.toggle('on', v);
    if (v) { const a = menu.querySelector('a.here') || menu.querySelector('a'); if (a) a.focus(); }
  };
  btn.addEventListener('click', e => { e.stopPropagation(); open(menu.hidden); });
  document.addEventListener('click', e => { if (!menu.hidden && !wrap.contains(e.target)) open(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); }
  });

  /* the track line under the title: which track this lab is in, and where in it */
  const line = document.getElementById('trackLine');
  if (line) {
    for (const t of TRACKS) {
      const i = t.labs.findIndex(([h]) => h === here);
      if (i < 0) continue;
      const nxt = t.labs[i + 1];
      line.innerHTML = `<span class="tkname">${t.name}</span> · lab ${i + 1} of ${t.labs.length}`
        + (nxt ? ` · next: <a href="${nxt[0]}">${nxt[1]}</a>` : ' · last in this track');
      break;
    }
  }
})();

/* ================= MOTION GUARD =================
   Simulation outputs animate in when they mount (see the motion block in
   lab.css). Outputs driven by a range slider re-render on every input event,
   and a restarting entrance animation under a drag reads as flicker, so the
   first drag marks the enclosing card as live and the motion rules stand
   down for it. Done here rather than in markup so every slider, present and
   future, is covered without anyone remembering to opt out. */
document.addEventListener('input', function(e){
  const r = e.target;
  if (r && r.type === 'range' && r.closest) {
    const card = r.closest('.card');
    if (card) card.classList.add('live');
  }
}, true);

/* ================= VERSION =================
   Stamped at deploy into assets/version.js; a local checkout says "dev". */
(function(){
  if (typeof GUIDE_VERSION === 'undefined') return;
  const f = document.querySelector('.lab-foot');
  if (!f || !f.insertAdjacentHTML) return;
  f.insertAdjacentHTML('beforeend',
    ' \u00b7 <span class="ver"' + (GUIDE_VERSION.sha ? ' title="commit ' + GUIDE_VERSION.sha + '"' : '') + '>' +
    (GUIDE_VERSION.v === 'dev' ? 'local dev build' : GUIDE_VERSION.v) + '</span>');
})();
