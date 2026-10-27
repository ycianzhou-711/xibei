(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    if (attrs) for (const key in attrs) node.setAttribute(key, attrs[key]);
    if (text != null) node.textContent = text;
    return node;
  }
  // Use month-level age because only the birth month is known.
  const parts = new Intl.DateTimeFormat('en-AU', {timeZone:'Australia/Sydney',year:'numeric',month:'numeric'}).formatToParts(new Date());
  const year = Number(parts.find(p => p.type === 'year').value), month = Number(parts.find(p => p.type === 'month').value);
  const ageMonths = Math.max(0, (year - 2024) * 12 + month - 1);
  $('child-age').textContent = Math.floor(ageMonths / 12) + ' 岁 ' + ageMonths % 12 + ' 个月';
  const ageIndex = ageMonths < 12 ? 0 : ageMonths < 36 ? 1 : ageMonths < 60 ? 2 : 3;
  document.querySelectorAll('.age').forEach((node, i) => {
    node.open = i === ageIndex;
    let note = node.querySelector('.current-age-note');
    if (i === ageIndex && !note) { note = el('small', {class:'current-age-note'}, '小西贝当前年龄段'); node.querySelector('summary').append(note); }
    if (note) note.hidden = i !== ageIndex;
  });
  const pack = [...document.querySelectorAll('[data-pack]')], packKey = 'xibei-pack-v1';
  function updatePack() { $('pack-count').textContent = '已备 ' + pack.filter(x => x.checked).length + ' / ' + pack.length; }
  try {
    const saved = JSON.parse(localStorage.getItem(packKey) || '[]');
    if (Array.isArray(saved)) pack.forEach((box, i) => { box.checked = saved[i] === true; });
  } catch (_) { $('pack-status').textContent = '勾选可用，但此浏览器暂时无法保存状态。'; }
  function savePack() {
    updatePack();
    try { localStorage.setItem(packKey, JSON.stringify(pack.map(x => x.checked))); }
    catch (_) { $('pack-status').textContent = '勾选可用，但此浏览器暂时无法保存状态。'; }
  }
  pack.forEach(box => box.addEventListener('change', savePack));
  $('pack-reset').onclick = () => { pack.forEach(x => { x.checked = false; }); savePack(); };
  updatePack();

  const LABELS = {love:'爱吃',ok:'还行',trying:'在尝试',no:'拒绝'};
  const ORDER = ['trying','love','ok','no'];
  const COLORS = {love:'var(--gum)',ok:'var(--sun)',trying:'var(--jac)',no:'var(--warn)'};
  const KEY = 'xibei-foods', status = $('tracker-status'), cols = $('food-cols'), form = $('food-form');
  let foods = [], locked = false, undoFood = null;
  function normalize(items) {
    if (!Array.isArray(items) || items.length > 1000) throw new Error('Invalid records');
    const ids = new Set();
    return items.map(f => {
      if (!f || typeof f !== 'object' || typeof f.id !== 'string' || !f.id || f.id.length > 100 || ids.has(f.id) || typeof f.name !== 'string' || !f.name.trim() || f.name.length > 40 || !ORDER.includes(f.status) || !Number.isInteger(f.tries) || f.tries < 0 || f.tries > 100000 || (f.note != null && (typeof f.note !== 'string' || f.note.length > 120)) || (f.updated != null && (typeof f.updated !== 'string' || !Number.isFinite(Date.parse(f.updated))))) throw new Error('Invalid record');
      ids.add(f.id);
      return {id:f.id,name:f.name.trim(),status:f.status,tries:f.tries,note:f.note || '',updated:f.updated || ''};
    });
  }
  try { foods = normalize(JSON.parse(localStorage.getItem(KEY) || '[]')); }
  catch (_) { locked = true; status.textContent = '暂时无法读取现有记录。为保护原数据，已暂停修改；请检查浏览器存储后刷新。'; }
  function save(message = '') {
    try { localStorage.setItem(KEY, JSON.stringify(foods)); status.textContent = message; }
    catch (_) { status.textContent = '本次更改仅在当前页面有效，浏览器无法保存；请立即导出备份。'; }
  }
  function update(id, patch) {
    const f = foods.find(x => x.id === id); if (!f || locked) return;
    Object.assign(f, patch, {updated:new Date().toISOString()}); save(); render();
  }
  function render() {
    cols.replaceChildren(); $('food-export').disabled = locked;
    if (locked) return;
    if (undoFood) {
      const box = el('div', {class:'empty'}, '已删除“' + undoFood.name + '”。');
      const undo = el('button', {type:'button'}, '撤销删除');
      undo.onclick = () => { foods.push(undoFood); undoFood = null; save('已恢复记录。'); render(); };
      box.append(undo); cols.append(box);
    }
    if (!foods.length) { cols.append(el('div',{class:'empty'},'还没有记录。写下一样食物，选择反应，再点“记一笔”。')); return; }
    for (const s of ORDER) {
      const list = foods.filter(f => f.status === s).sort((a,b) => (b.updated || '').localeCompare(a.updated || ''));
      const col = el('div',{class:'col'}), h = el('h4');
      h.append(el('span',{class:'mark',style:'background:' + COLORS[s]}), document.createTextNode(LABELS[s] + ' · ' + list.length)); col.append(h);
      const ul = el('ul'); if (!list.length) ul.append(el('li',{class:'meta'},'暂无'));
      for (const f of list) {
        const li = el('li',{class:'food'}), top = el('div',{class:'top'});
        top.append(el('span',{class:'name'},f.name),el('span',{class:'n'},'试过 ' + f.tries + ' 次')); li.append(top);
        if (f.note) li.append(el('div',{class:'fn'},f.note));
        const acts = el('div',{class:'acts'}), plus = el('button',{type:'button'},'又试了一次');
        plus.disabled = f.tries >= 100000;
        plus.onclick = () => update(f.id,{tries:f.tries + 1}); acts.append(plus);
        for (const target of ORDER) {
          if (target === f.status) continue;
          const b = el('button',{type:'button'},'→ ' + LABELS[target]); b.onclick = () => update(f.id,{status:target}); acts.append(b);
        }
        const del = el('button',{type:'button','aria-label':'删除 ' + f.name},'删除');
        del.onclick = () => { undoFood = f; foods = foods.filter(x => x.id !== f.id); save('已删除，可在本页撤销。'); render(); }; acts.append(del);
        li.append(acts); ul.append(li);
      }
      col.append(ul); cols.append(col);
    }
  }
  form.addEventListener('submit', e => {
    e.preventDefault(); if (locked) return;
    const name = $('food-name').value.trim(); if (!name) return;
    const note = $('food-note').value.trim(), st = $('food-status').value, ex = foods.find(f => f.name === name);
    if (ex && ex.tries >= 100000) { status.textContent = '这项记录已达到次数上限。'; return; }
    if (ex) Object.assign(ex,{status:st,tries:ex.tries + 1,note:note || ex.note,updated:new Date().toISOString()});
    else {
      if (foods.length >= 1000) { status.textContent = '已达 1000 条记录，请先导出备份并整理。'; return; }
      foods.push({id:crypto.randomUUID(),name,status:st,tries:1,note,updated:new Date().toISOString()});
    }
    $('food-name').value = ''; $('food-note').value = ''; save('已记录。'); render();
  });
  $('food-export').onclick = () => {
    if (locked) return;
    const backup = {version:1,exportedAt:new Date().toISOString(),foods};
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
    const a = el('a',{href:url,download:'xibei-foods-' + new Date().toISOString().slice(0,10) + '.json'}); a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000); status.textContent = '备份已生成，请确认文件已保存。';
  };
  $('food-import').disabled = locked;
  $('food-import').onclick = () => $('food-file').click();
  $('food-file').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file || locked) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('File too big');
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data) && (!data || data.version !== 1)) throw new Error('Unsupported version');
      const incoming = normalize(Array.isArray(data) ? data : data.foods);
      const merged = new Map(foods.map(f => [f.id,f]));
      let count = 0;
      for (const f of incoming) {
        const existing = merged.get(f.id);
        // Preserve existing records on ID collision; importing the same backup twice is harmless.
        if (!existing) { merged.set(f.id,f); count++; }
      }
      if (merged.size > 1000) throw new Error('Too many records');
      foods = [...merged.values()]; save('已合并 ' + count + ' 条新记录，现有记录已保留。'); render();
    } catch (_) { status.textContent = '无法导入：请选有效的食物记录 JSON 备份（最多 1000 条、2 MB）。现有记录未改变。'; }
    finally { e.target.value = ''; }
  });
  $('food-add').disabled = locked;
  if (!locked) status.textContent = '';
  render();
})();
