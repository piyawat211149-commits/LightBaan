const data = window.LightBaanData;
const catGrid = document.querySelector("#catGrid");
const typeFilter = document.querySelector("#typeFilter");
const districtFilter = document.querySelector("#districtFilter");
const provinceFilter = document.querySelector("#provinceFilter");
const imageUrl = (cat, width = 700) => `https://images.unsplash.com/${cat.image}?auto=format&fit=crop&w=${width}&q=85`;
// อ้างอิง URL ของภาพที่ใช้จริง ไม่ระบุชื่อช่างภาพหากยังไม่ได้ยืนยัน
const imageCredit = cat => `<p class="image-credit">ที่มาภาพ: <a href="https://images.unsplash.com/${cat.image}" target="_blank" rel="noopener noreferrer" aria-label="เปิดภาพต้นทางของ ${cat.name} จาก Unsplash (แท็บใหม่)">Unsplash ↗</a></p>`;

function createCatCard(cat) {
  return `<article class="cat-card">
    <a class="cat-photo" href="cat.html?id=${cat.id}" aria-label="ดูรายละเอียด ${cat.name}">
      <img src="${imageUrl(cat)}" alt="ภาพประกอบประกาศ ${cat.name}" loading="lazy">
      <span class="status ${cat.type}">${data.types[cat.type]}</span>
    </a>
    <div class="cat-info">${imageCredit(cat)}<h3><a href="cat.html?id=${cat.id}">${cat.name}</a></h3><p>${cat.detail}</p>
      <div class="cat-meta"><span>⌖ ${cat.location}</span><a href="cat.html?id=${cat.id}" aria-label="ดูรายละเอียด ${cat.name}">ดูรายละเอียด →</a></div>
    </div>
  </article>`;
}

function renderCats() {
  const filtered = data.cats.filter(cat =>
    (typeFilter.value === "all" || cat.type === typeFilter.value) &&
    (provinceFilter.value === "all" || data.areas.find(area => area.id === cat.district)?.province === provinceFilter.value) &&
    (districtFilter.value === "all" || cat.district === districtFilter.value)
  );
  catGrid.innerHTML = filtered.map(createCatCard).join("");
  document.querySelector("#resultCount").textContent = `${filtered.length} ประกาศ`;
  document.querySelector("#emptyState").hidden = filtered.length > 0;
  document.querySelectorAll("[data-filter]").forEach(button => {
    const active = button.dataset.filter === typeFilter.value;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateDistricts() {
  const selected = provinceFilter.value !== "all";
  districtFilter.replaceChildren(new Option(selected ? "ทุกเขต / อำเภอ" : "เลือกจังหวัดก่อน", "all"));
  districtFilter.disabled = !selected;
  if (selected) {
    data.areas.filter(area => area.province === provinceFilter.value)
      .sort((a, b) => a.label.localeCompare(b.label, "th"))
      .forEach(area => districtFilter.append(new Option(area.label, area.id)));
  }
}

if (catGrid) {
  [...new Set(data.areas.map(area => area.province))].forEach(province => provinceFilter.append(new Option(province, province)));
  updateDistricts();
  provinceFilter.addEventListener("change", () => {
    updateDistricts();
    renderCats();
  });
  const initialType = new URLSearchParams(location.search).get("type");
  if (Object.hasOwn(data.types, initialType)) typeFilter.value = initialType;
  document.querySelector("#searchForm").addEventListener("submit", event => {
    event.preventDefault();
    renderCats();
    document.querySelector("#cats").scrollIntoView({ behavior: "smooth" });
  });
  [typeFilter, districtFilter].forEach(select => select.addEventListener("change", renderCats));
  document.querySelectorAll("[data-filter], [data-category]").forEach(control => {
    control.addEventListener("click", () => {
      typeFilter.value = control.dataset.filter || control.dataset.category;
      renderCats();
    });
  });
  document.querySelector("#resetFilters").addEventListener("click", () => {
    typeFilter.value = "all";
    provinceFilter.value = "all";
    updateDistricts();
    renderCats();
  });
  renderCats();
}

const menu = document.querySelector("#menuButton");
const nav = document.querySelector("#navLinks");
if (menu && nav) {
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "ปิดเมนู" : "เปิดเมนู");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "เปิดเมนู");
  }));
}

const dialog = document.querySelector("#comingSoonDialog");
document.addEventListener("click", event => {
  if (event.target.closest("[data-coming-soon]") && dialog) dialog.showModal();
  if (event.target.closest("[data-close-dialog]") && dialog) dialog.close();
});

const detailRoot = document.querySelector("#catDetail");
if (detailRoot) {
  const id = new URLSearchParams(location.search).get("id");
  const cat = data.cats.find(item => item.id === id);
  if (!cat) {
    document.title = "ไม่พบประกาศ | LightBaan";
    detailRoot.innerHTML = '<div class="not-found"><span class="dialog-icon">⌕</span><h1>ไม่พบประกาศนี้</h1><p>ลิงก์อาจไม่ถูกต้อง ลองเลือกน้องจากรายการในหน้าแรกอีกครั้ง</p><a class="primary-button" href="index.html#cats">กลับไปดูประกาศ</a></div>';
  } else {
    document.title = `${cat.name} — ${data.types[cat.type]} | LightBaan`;
    const area = data.areas.find(item => item.id === cat.district);
    const action = cat.type === "adopt" ? "สนใจรับเลี้ยงน้อง" : cat.type === "lost" ? "แจ้งเบาะแสให้ผู้ประกาศ" : "ติดต่อเพื่อยืนยันเจ้าของ";
    detailRoot.innerHTML = `
      <nav class="breadcrumb" aria-label="เส้นทางหน้าเว็บ"><a href="index.html">หน้าแรก</a><span>/</span><a href="index.html#cats">ประกาศแมว</a><span>/</span><span aria-current="page">${cat.name}</span></nav>
      <div class="detail-grid">
        <div class="detail-photo-wrap"><img class="detail-photo" src="${imageUrl(cat, 1200)}" alt="ภาพประกอบประกาศ ${cat.name}">${imageCredit(cat)}<p class="sample-note">ภาพประกอบและข้อมูลตัวอย่าง ไม่ใช่ประกาศรับเลี้ยงหรือแจ้งหายจริง</p></div>
        <div class="detail-summary"><span class="status ${cat.type}">${data.types[cat.type]}</span><p class="section-label">EVERY CAT HAS A STORY</p><h1>${cat.name}</h1><p class="detail-location">⌖ ${area.label}, ${area.province}</p><p class="detail-intro">${cat.detail}</p>
          <dl class="cat-facts"><div><dt>เพศ</dt><dd>${cat.sex}</dd></div><div><dt>อายุ</dt><dd>${cat.age}</dd></div><div><dt>สี / ลายขน</dt><dd>${cat.coat}</dd></div><div><dt>ลักษณะเด่น</dt><dd>${cat.trait}</dd></div></dl>
          <div class="detail-actions"><button class="primary-button" type="button" data-coming-soon>${action}</button><button class="secondary-button" type="button" id="shareCat">คัดลอกลิงก์ประกาศ ↗</button></div>
          <p class="share-feedback" id="shareFeedback" role="status"></p><div id="shareFallback" hidden><label for="shareLink">คัดลอกลิงก์นี้เพื่อส่งให้เพื่อน</label><input id="shareLink" type="url" readonly></div>
        </div>
      </div>
      <div class="detail-bottom"><div class="detail-story"><h2>เรื่องราวของ${cat.name}</h2><p>${cat.story}</p><h2>ข้อมูลการดูแล</h2><p>${cat.care}</p><h2>${cat.type === "adopt" ? "ก่อนตัดสินใจรับเลี้ยง" : "ก่อนส่งต่อเบาะแส"}</h2><p>${cat.type === "adopt" ? "พูดคุยเรื่องพื้นที่อยู่อาศัย เวลาในการดูแล และความพร้อมของทุกคนในบ้าน นัดทำความรู้จักน้องกับผู้ดูแลก่อนตัดสินใจ" : "เปรียบเทียบภาพและลักษณะเฉพาะตัว พร้อมจดพื้นที่และเวลาที่พบ ข้อมูลที่คล้ายกันเป็นเพียงเบาะแส ผู้ประกาศต้องตรวจสอบและยืนยันอีกครั้ง"}</p></div>
      <aside class="publisher"><p class="section-label">THE PERSON BEHIND THE POST</p><h2>ข้อมูลผู้ประกาศ</h2><div class="publisher-avatar" aria-hidden="true">♡</div><h3>${cat.publisher}</h3><p>พื้นที่: ${area.label}</p><p>ประกาศนี้ใช้สาธิตหน้าเว็บ จึงยังไม่มีหมายเลขโทรศัพท์หรือช่องทางติดต่อจริง</p><button class="secondary-button" type="button" data-coming-soon>ดูช่องทางติดต่อ</button></aside></div>
      <section class="related-section" aria-labelledby="relatedTitle"><div class="section-heading"><div><p class="section-label">MORE LITTLE STORIES</p><h2 id="relatedTitle">รู้จักน้องตัวอื่น ๆ</h2></div><a class="text-link" href="index.html#cats">ดูทั้งหมด →</a></div><div class="cat-grid">${data.cats.filter(item => item.id !== cat.id).sort((a, b) => Number(b.type === cat.type) - Number(a.type === cat.type)).slice(0, 3).map(createCatCard).join("")}</div></section>`;
    document.querySelector("#shareCat").addEventListener("click", async () => {
      const url = new URL(`cat.html?id=${cat.id}`, location.href).href;
      try {
        await navigator.clipboard.writeText(url);
        document.querySelector("#shareFeedback").textContent = "คัดลอกลิงก์แล้ว ส่งต่อให้เพื่อนได้เลย";
      } catch {
        document.querySelector("#shareFallback").hidden = false;
        const input = document.querySelector("#shareLink");
        input.value = url;
        input.focus();
        input.select();
        document.querySelector("#shareFeedback").textContent = "เลือกและคัดลอกลิงก์ด้านล่างได้เลย";
      }
    });
  }
}
