// แสดงหมุดของประกาศตัวอย่างเท่านั้น ไม่ขอตำแหน่งของผู้ชม
(() => {
  const container = document.querySelector("#catMap");
  if (!container) return;
  const status = document.querySelector("#catMapStatus");
  const button = document.querySelector("#returnToCatPin");
  const id = new URLSearchParams(location.search).get("id");
  const cat = window.LightBaanData.cats.find(item => item.id === id);
  if (cat && !cat.coordinates) { container.hidden=true; button.hidden=true; status.textContent="ผู้ประกาศยังไม่ได้ปักหมุด ดูชื่ออำเภอและบริเวณในรายละเอียดด้านบนได้"; return; }
  if (!window.L || !cat?.coordinates) {
    container.hidden = true;
    status.textContent = "โหลดแผนที่ไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วรีเฟรช โดยยังดูชื่อพื้นที่ของประกาศด้านบนได้";
    return;
  }
  const map = L.map(container, { scrollWheelZoom: true, touchZoom: true }).setView(cat.coordinates, 14);
  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  tiles.on("tileerror", () => {
    status.textContent = "ภาพแผนที่บางส่วนโหลดไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วรีเฟรช";
  });
  tiles.addTo(map);
  const popup = document.createElement("div");
  popup.textContent = `${cat.name} — ${cat.location} (หมุดตัวอย่าง)`;
  const icon = L.divIcon({
    className: "cat-map-pin",
    html: '<span aria-hidden="true">●</span>',
    iconSize: [32, 32], iconAnchor: [16, 16]
  });
  const marker = L.marker(cat.coordinates, {
    icon, draggable: false, title: `หมุดตัวอย่างของ${cat.name}`, alt: `หมุดตัวอย่างของ${cat.name}`
  }).addTo(map).bindPopup(popup).openPopup();
  status.textContent = "ลากเพื่อเลื่อนแผนที่ ใช้ล้อเมาส์หรือสองนิ้วเพื่อซูม หมุดนี้แสดงตำแหน่งตัวอย่างของประกาศ";
  button.disabled = false;
  button.addEventListener("click", () => {
    map.setView(cat.coordinates, 14);
    marker.openPopup();
  });
})();
