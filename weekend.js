/* Weekly content lives in weekend.json; this file only renders it. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const el = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  function link(label, value) {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid URL');
    const a = el('a', label); a.href = url.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
  }
  function fact(list, label, value) { list.append(el('dt', label), el('dd', value)); }
  function activity(item) {
    const card = el('article', null, 'card activity-card');
    card.append(el('p', item.time, 'eyebrow'), el('h3', item.title));
    const facts = el('dl', null, 'facts');
    fact(facts, '车程', item.drive); fact(facts, '费用', item.price); fact(facts, '预约', item.booking);
    card.append(facts);
    const actions = el('div', null, 'activity-actions');
    if (item.officialUrl) actions.append(link('官网 / 预约 ↗', item.officialUrl));
    if (item.mapUrl) actions.append(link('地图路线 ↗', item.mapUrl));
    if (actions.childElementCount) card.append(actions);
    const details = el('details'); details.append(el('summary', '行程详情与预算'), el('p', item.description));
    if (item.budget) details.append(el('p', item.budget.label), el('p', item.budget.note, 'meta'));
    if (item.rating && item.reviewUrl) {
      const p = el('p', '场地评分（不是本次活动评分）：' + item.rating + ' · ');
      p.append(link('查看最新 Google 评价', item.reviewUrl)); details.append(p);
    }
    card.append(details, el('p', item.verifiedAt ? '官网核实：' + item.verifiedAt : '沿用原有信息 · 本次未核实，出发前请确认', 'verified'));
    return card;
  }
  function check(data) {
    if (data.schemaVersion !== 1 || !Array.isArray(data.activities) || !Array.isArray(data.alternatives) || !Array.isArray(data.sources) || !Array.isArray(data.recommendedIds) || data.recommendedIds.length !== 2) throw new Error('Invalid data');
    for (const key of ['startDate','endDate','updatedAt']) if (!/^\d{4}-\d{2}-\d{2}$/.test(data[key])) throw new Error('Invalid date');
    const ids = data.activities.map(x => x.id);
    if (new Set(ids).size !== ids.length || new Set(data.recommendedIds).size !== 2 || data.recommendedIds.some(id => !ids.includes(id))) throw new Error('Invalid IDs');
    for (const a of data.activities) for (const key of ['id','title','time','drive','price','booking','description']) if (typeof a[key] !== 'string') throw new Error('Missing field');
    return data;
  }
  function render(data) {
    const fragment = document.createDocumentFragment();
    const grid = el('div', null, 'grid2');
    data.recommendedIds.forEach(id => grid.append(activity(data.activities.find(x => x.id === id))));
    fragment.append(grid);
    const more = el('details', null, 'fold');
    more.append(el('summary', '更多选择 · 傍晚、远一点、下雨备案'));
    const options = el('div', null, 'grid2');
    data.activities.filter(x => !data.recommendedIds.includes(x.id)).forEach(x => options.append(activity(x)));
    more.append(options); fragment.append(more);
    const other = el('details', null, 'fold'); other.append(el('summary', '其他活动 · ' + data.alternatives.length + ' 个'));
    const list = el('div', null, 'alternative-list');
    for (const a of data.alternatives) {
      const row = el('article'); const h = el('h3'); h.append(link(a.title + ' ↗', a.officialUrl));
      row.append(h, el('p', a.time + ' · ' + a.location), el('p', a.price + ' · ' + a.suitable, 'meta'), link('地图路线 ↗', a.mapUrl), el('p', a.verifiedAt ? '官网核实：' + a.verifiedAt : '本次未核实，时间及票价请查官网', 'meta')); list.append(row);
    }
    other.append(list); fragment.append(other);
    const note = el('p', data.reminder + ' ', 'note'); note.append(link('查看天气 ↗', data.weatherUrl)); fragment.append(note);
    const sources = el('details', null, 'fold sources'); sources.append(el('summary', '信息来源与更新说明'));
    for (const source of data.sources) { const p = el('p'); p.append(link(source.label, source.url)); sources.append(p); }
    sources.append(el('p', '内容更新于 ' + data.updatedAt + '。更新日期不等于逐项核实日期；未核实活动的时间、价格和名额请以主办方为准。'));
    fragment.append(sources);
    $('weekend-content').replaceChildren(fragment);
    $('weekend-title').textContent = data.title;
    $('weekend-intro').textContent = data.intro;
    $('weekend-updated').textContent = '活动更新于 ' + data.updatedAt;
    const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    $('weekend-status').textContent = today > data.endDate ? '这份周末计划已过期，请等候下一次更新；下方内容仅作参考。' : '先看两个主活动，其余选择点开查看。';
  }
  async function load() {
    $('weekend-content').setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('weekend.json', {cache:'no-cache'});
      if (!response.ok) throw new Error('Load failed');
      render(check(await response.json()));
    } catch (_) {
      $('weekend-intro').textContent = '暂时无法读取活动，请联网后重试。';
      $('weekend-status').textContent = '';
      $('weekend-updated').textContent = '活动暂未载入';
      const retry = el('button', '重新加载'); retry.type = 'button'; retry.onclick = load;
      $('weekend-content').replaceChildren(retry);
    } finally { $('weekend-content').setAttribute('aria-busy', 'false'); }
  }
  load();
})();
