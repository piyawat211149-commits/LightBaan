const cats = [
  { name: "มะลิ", type: "lost", detail: "ส้มขาว · เพศเมีย · ปลอกคอสีเขียว", location: "บางนา, กรุงเทพมหานคร", image: "photo-1514888286974-6c03e2ca1dba" },
  { name: "น้องลายสลิด", type: "found", detail: "ลายสลิด · เป็นมิตร · ไม่มีปลอกคอ", location: "อารีย์, กรุงเทพมหานคร", image: "photo-1573865526739-10659fec78a5" },
  { name: "โมจิ", type: "adopt", detail: "ขาวส้ม · อายุ 8 เดือน · ขี้อ้อน", location: "เมือง, นนทบุรี", image: "photo-1495360010541-f48722b34f7d" },
  { name: "ถุงเงิน", type: "adopt", detail: "แมวส้ม · อายุ 1 ปี · ชอบเล่นกับคน", location: "ลาดพร้าว, กรุงเทพมหานคร", image: "photo-1518791841217-8f162f1e1131" },
  { name: "ตาใส", type: "found", detail: "ขนสีอ่อน · ตาสีฟ้า · เชื่อง", location: "บางเขน, กรุงเทพมหานคร", image: "photo-1511044568932-338cba0ad803" },
  { name: "ชาร์โคล", type: "lost", detail: "สีเทา · เพศผู้ · ไม่สวมปลอกคอ", location: "ปากเกร็ด, นนทบุรี", image: "photo-1533738363-b7f9aef128ce" },
];

const typeLabels = { lost: "แมวหาย", found: "พบแมว", adopt: "หาบ้าน" };
const catGrid = document.querySelector("#catGrid");
const typeFilter = document.querySelector("#typeFilter");
const searchInput = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const dialog = document.querySelector("#comingSoonDialog");

function createCatCard(cat) {
  return `
    <article class="cat-card">
      <div class="cat-photo">
        <img src="https://images.unsplash.com/${cat.image}?auto=format&fit=crop&w=700&q=80" alt="ภาพประกาศตัวอย่างของ ${cat.name}" loading="lazy">
        <span class="status ${cat.type}">${typeLabels[cat.type]}</span>
      </div>
      <div class="cat-info">
        <h3>${cat.name}</h3>
        <p>${cat.detail}</p>
        <div class="cat-meta">
          <span>⌖ ${cat.location}</span>
          <button type="button" data-coming-soon>ดูรายละเอียด →</button>
        </div>
      </div>
    </article>`;
}

function renderCats() {
  const selectedType = typeFilter.value;
  const keyword = searchInput.value.trim().toLocaleLowerCase("th");
  const filteredCats = cats.filter((cat) => {
    const matchesType = selectedType === "all" || cat.type === selectedType;
    const searchableText = `${cat.name} ${cat.detail} ${cat.location}`.toLocaleLowerCase("th");
    return matchesType && searchableText.includes(keyword);
  });

  catGrid.innerHTML = filteredCats.map(createCatCard).join("");
  resultCount.textContent = `${filteredCats.length} ประกาศ`;
  emptyState.hidden = filteredCats.length > 0;

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === selectedType);
  });
}

document.querySelector("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  renderCats();
  document.querySelector("#cats").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    typeFilter.value = button.dataset.filter;
    renderCats();
  });
});

document.querySelector("#menuButton").addEventListener("click", () => {
  const navLinks = document.querySelector("#navLinks");
  const isOpen = navLinks.classList.toggle("open");
  document.querySelector("#menuButton").setAttribute("aria-expanded", isOpen);
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-coming-soon]")) dialog.showModal();
});

document.querySelector("#dialogClose").addEventListener("click", () => dialog.close());
document.querySelector("#dialogConfirm").addEventListener("click", () => dialog.close());

renderCats();
