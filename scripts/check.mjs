import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

const data = JSON.parse(readFileSync(new URL('../weekend.json', import.meta.url), 'utf8'));
function text(value, label) { assert.equal(typeof value,'string',label); assert(value.trim(),label + ' is empty'); }
function date(value, label) {
  assert.match(value,/^\d{4}-\d{2}-\d{2}$/,label);
  assert.equal(new Date(value).toISOString().slice(0,10),value,label);
}
function url(value, label, nullable = false) {
  if (nullable && value === null) return;
  text(value,label); assert(['https:','http:'].includes(new URL(value).protocol),label);
}
function verified(value, label) { if (value !== null) { date(value,label); assert(value <= data.updatedAt,label + ' is after content update'); } }
assert.equal(data.schemaVersion,1);
for (const key of ['startDate','endDate','updatedAt']) date(data[key],key);
assert(data.startDate <= data.endDate,'date range');
for (const key of ['title','intro','reminder']) text(data[key],key);
url(data.weatherUrl,'weatherUrl');
assert(Array.isArray(data.activities) && data.activities.length >= 2,'activities');
const ids = new Set();
for (const a of data.activities) {
  for (const key of ['id','title','time','drive','price','booking','description']) text(a[key],a.id + '.' + key);
  assert(!ids.has(a.id),'duplicate activity id ' + a.id); ids.add(a.id);
  assert(/\d{4}/.test(a.time),'activity time needs full year: ' + a.id);
  for (const key of ['officialUrl','mapUrl','reviewUrl']) url(a[key],a.id + '.' + key,true);
  if (a.rating !== null) { text(a.rating,a.id + '.rating'); assert(a.reviewUrl,'rating requires review link'); }
  verified(a.verifiedAt,a.id + '.verifiedAt');
  if (a.budget !== null) { text(a.budget.label,a.id + '.budget.label'); text(a.budget.note,a.id + '.budget.note'); }
}
assert(Array.isArray(data.recommendedIds) && data.recommendedIds.length === 2,'exactly two recommendations');
assert.equal(new Set(data.recommendedIds).size,2,'distinct recommendations');
for (const id of data.recommendedIds) assert(ids.has(id),'missing recommended id: ' + id);
assert(Array.isArray(data.alternatives),'alternatives');
for (const a of data.alternatives) {
  for (const key of ['title','time','location','price','suitable']) text(a[key],'alternative.' + key);
  assert(/\d{4}/.test(a.time),'alternative time needs full year: ' + a.title);
  url(a.officialUrl,'alternative.officialUrl'); url(a.mapUrl,'alternative.mapUrl'); verified(a.verifiedAt,'alternative.verifiedAt');
}
assert(Array.isArray(data.sources) && data.sources.length,'sources');
for (const source of data.sources) { text(source.label,'source.label'); url(source.url,'source.url'); }
for (const file of ['weekend.js','app.js']) execFileSync(process.execPath,['--check',new URL('../' + file,import.meta.url).pathname]);
console.log(`Checked ${data.activities.length} activities, ${data.alternatives.length} alternatives, dates, references, links and JavaScript syntax.`);
