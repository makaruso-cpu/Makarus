"use strict";
// Demo records: sample geometry only, not a verified engineering dataset.
const BEARINGS = [
  {code:"6004",d:20,D:42,B:12},
  {code:"6204",d:20,D:47,B:14},
  {code:"6205",d:25,D:52,B:15},
  {code:"6305",d:25,D:62,B:17},
  {code:"6206",d:30,D:62,B:16},
  {code:"6306",d:30,D:72,B:19}
];
const $ = id => document.getElementById(id);
const fields = ["query","inner","outer","width"];
let saved = new Set();
try { saved = new Set(JSON.parse(localStorage.getItem("bearing-atlas-demo-favorites") || "[]")); } catch (_) { saved = new Set(); }
const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fullName = b => `Подшипник ${b.code}`;
function render(){
  const query = $("query").value.trim().toLowerCase();
  const filters = [["inner","d"],["outer","D"],["width","B"]];
  const data = BEARINGS.filter(b=>b.code.toLowerCase().includes(query) && filters.every(([id,key])=>$(id).value.trim()==="" || Number($(id).value)===b[key]));
  $("count").textContent = `${data.length} ${data.length===1?"позиция":data.length>=2&&data.length<=4?"позиции":"позиций"}`;
  $("results-label").textContent = data.length ? "Результаты поиска" : "Совпадений не найдено";
  $("results").innerHTML = data.length ? data.map(b=>`
    <article class="result">
      <div class="result-top"><span class="type-pill">Шариковый радиальный · пример</span><button class="favorite" type="button" aria-label="${saved.has(b.code)?"Удалить из избранного":"Добавить в избранное"} ${b.code}" aria-pressed="${saved.has(b.code)}" data-favorite="${b.code}" title="Избранное">${saved.has(b.code)?"★":"☆"}</button></div>
      <h3>${escapeHtml(b.code)}</h3><p class="family">Однорядный · демонстрационная запись</p>
      <div class="dim-grid"><div><small>d · мм</small><strong>${b.d}</strong></div><div><small>D · мм</small><strong>${b.D}</strong></div><div><small>B · мм</small><strong>${b.B}</strong></div></div>
      <div class="result-actions"><button type="button" class="outline-button" data-details="${b.code}">Открыть карточку ↗</button><button type="button" class="locked-button" data-pro="true" title="Только PRO">🔒 PRO</button></div>
    </article>`).join("") : `<div class="empty"><strong>Подшипники не найдены</strong>Попробуйте другое обозначение или сбросьте фильтры.</div>`;
}
function openDetails(b){
  $("dialog-body").innerHTML = `<h2 id="dialog-title">${escapeHtml(fullName(b))}</h2><table class="detail-data"><tbody><tr><th>Обозначение</th><td>${b.code}</td></tr><tr><th>Внутренний диаметр d</th><td>${b.d} мм</td></tr><tr><th>Наружный диаметр D</th><td>${b.D} мм</td></tr><tr><th>Ширина B</th><td>${b.B} мм</td></tr><tr><th>Тип</th><td>Шариковый радиальный (пример)</td></tr></tbody></table><p class="dialog-footnote">Демонстрационная информация. Допуски, нагрузки, модификации, производитель и аналоги не подтверждены.</p><div class="dialog-buttons"><button class="outline-button" type="button" id="copy-request">Скопировать заявку</button><button class="locked-button" type="button" id="detail-pro">🔒 Расшифровка PRO</button></div>`;
  $("detail-dialog").showModal();
  $("copy-request").addEventListener("click",async()=>{
    const text=`Запрос по подшипнику ${b.code}\nРазмеры (демо): d=${b.d} мм, D=${b.D} мм, B=${b.B} мм\nПрошу уточнить наличие, цену и характеристики.`;
    try { await navigator.clipboard.writeText(text); $("copy-request").textContent="Заявка скопирована ✓"; }
    catch { $("copy-request").textContent="Не удалось скопировать"; }
  });
  $("detail-pro").addEventListener("click",()=>{$("detail-dialog").close();$("pro-dialog").showModal()});
}
fields.forEach(id=>$(id).addEventListener("input",render));
$("clear").addEventListener("click",()=>{fields.forEach(id=>$(id).value="");render();$("query").focus()});
$("results").addEventListener("click",e=>{
  const fav=e.target.closest("[data-favorite]");
  if(fav){const code=fav.dataset.favorite;saved.has(code)?saved.delete(code):saved.add(code);try{localStorage.setItem("bearing-atlas-demo-favorites",JSON.stringify([...saved]))}catch(_){}render();return}
  const detail=e.target.closest("[data-details]");if(detail){const b=BEARINGS.find(b=>b.code===detail.dataset.details);if(b)openDetails(b);return}
  if(e.target.closest("[data-pro]"))$("pro-dialog").showModal();
});
$("close-dialog").addEventListener("click",()=>$("detail-dialog").close());
$("close-pro").addEventListener("click",()=>$("pro-dialog").close());
$("understood").addEventListener("click",()=>$("pro-dialog").close());
render();
