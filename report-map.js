// ตำแหน่งเก็บเฉพาะในหน้านี้ ไม่ใช้ตำแหน่งปัจจุบันและไม่ส่งประกาศ
(() => {
  const status = document.querySelector("#mapStatus");
  const centerButton = document.querySelector("#pinMapCenter");
  const clearButton = document.querySelector("#clearMapPin");
  if (!window.L) {
    status.textContent = "โหลดแผนที่ไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วรีเฟรช หรือกรอกบริเวณที่หายเป็นข้อความได้";
    document.querySelector("#lostMap").hidden = true;
    return;
  }
  const centers = {
    "กรุงเทพมหานคร": [13.7563, 100.5018],
    "นนทบุรี": [13.8621, 100.5144],
    "ปทุมธานี": [14.0208, 100.5250]
  };
  // Approximate reference points, not administrative boundaries.
  // Adapted from Open Admin Data, CC BY 4.0; selected 63 districts and converted to numeric pairs.
  // https://github.com/open-admin-data/thailand-administrative-divisions/blob/main/data/all-district.json
  // https://creativecommons.org/licenses/by/4.0/
  const districtCenters = {
    "กรุงเทพมหานคร/พระนคร": [13.753, 100.5],
    "กรุงเทพมหานคร/ดุสิต": [13.758, 100.517],
    "กรุงเทพมหานคร/หนองจอก": [13.872, 100.81],
    "กรุงเทพมหานคร/บางรัก": [13.725, 100.514],
    "กรุงเทพมหานคร/บางเขน": [13.868, 100.606],
    "กรุงเทพมหานคร/บางกะปิ": [13.786, 100.635],
    "กรุงเทพมหานคร/ปทุมวัน": [13.744, 100.52],
    "กรุงเทพมหานคร/ป้อมปราบศัตรูพ่าย": [13.752, 100.507],
    "กรุงเทพมหานคร/พระโขนง": [13.692, 100.626],
    "กรุงเทพมหานคร/มีนบุรี": [13.804, 100.723],
    "กรุงเทพมหานคร/ลาดกระบัง": [13.723, 100.771],
    "กรุงเทพมหานคร/ยานนาวา": [13.682, 100.533],
    "กรุงเทพมหานคร/สัมพันธวงศ์": [13.734, 100.513],
    "กรุงเทพมหานคร/พญาไท": [13.782, 100.545],
    "กรุงเทพมหานคร/ธนบุรี": [13.731, 100.49],
    "กรุงเทพมหานคร/บางกอกใหญ่": [13.743, 100.486],
    "กรุงเทพมหานคร/ห้วยขวาง": [13.769, 100.577],
    "กรุงเทพมหานคร/คลองสาน": [13.731, 100.497],
    "กรุงเทพมหานคร/ตลิ่งชัน": [13.76, 100.456],
    "กรุงเทพมหานคร/บางกอกน้อย": [13.759, 100.481],
    "กรุงเทพมหานคร/บางขุนเทียน": [13.605, 100.395],
    "กรุงเทพมหานคร/ภาษีเจริญ": [13.727, 100.457],
    "กรุงเทพมหานคร/หนองแขม": [13.714, 100.351],
    "กรุงเทพมหานคร/ราษฎร์บูรณะ": [13.67, 100.51],
    "กรุงเทพมหานคร/บางพลัด": [13.781, 100.482],
    "กรุงเทพมหานคร/ดินแดง": [13.778, 100.567],
    "กรุงเทพมหานคร/บึงกุ่ม": [13.808, 100.65],
    "กรุงเทพมหานคร/สาทร": [13.71, 100.532],
    "กรุงเทพมหานคร/บางซื่อ": [13.82, 100.529],
    "กรุงเทพมหานคร/จตุจักร": [13.826, 100.565],
    "กรุงเทพมหานคร/บางคอแหลม": [13.706, 100.508],
    "กรุงเทพมหานคร/ประเวศ": [13.687, 100.656],
    "กรุงเทพมหานคร/คลองเตย": [13.723, 100.571],
    "กรุงเทพมหานคร/สวนหลวง": [13.726, 100.628],
    "กรุงเทพมหานคร/จอมทอง": [13.702, 100.476],
    "กรุงเทพมหานคร/ดอนเมือง": [13.925, 100.593],
    "กรุงเทพมหานคร/ราชเทวี": [13.752, 100.528],
    "กรุงเทพมหานคร/ลาดพร้าว": [13.84, 100.6],
    "กรุงเทพมหานคร/วัฒนา": [13.743, 100.56],
    "กรุงเทพมหานคร/บางแค": [13.683, 100.396],
    "กรุงเทพมหานคร/หลักสี่": [13.871, 100.58],
    "กรุงเทพมหานคร/สายไหม": [13.898, 100.63],
    "กรุงเทพมหานคร/คันนายาว": [13.821, 100.677],
    "กรุงเทพมหานคร/สะพานสูง": [13.761, 100.688],
    "กรุงเทพมหานคร/วังทองหลาง": [13.779, 100.609],
    "กรุงเทพมหานคร/คลองสามวา": [13.854, 100.745],
    "กรุงเทพมหานคร/บางนา": [13.672, 100.616],
    "กรุงเทพมหานคร/ทวีวัฒนา": [13.758, 100.348],
    "กรุงเทพมหานคร/ทุ่งครุ": [13.651, 100.51],
    "กรุงเทพมหานคร/บางบอน": [13.646, 100.37],
    "นนทบุรี/เมืองนนทบุรี": [13.823, 100.492],
    "นนทบุรี/บางกรวย": [13.811, 100.453],
    "นนทบุรี/บางใหญ่": [13.854, 100.434],
    "นนทบุรี/บางบัวทอง": [13.914, 100.422],
    "นนทบุรี/ไทรน้อย": [13.976, 100.344],
    "นนทบุรี/ปากเกร็ด": [13.902, 100.55],
    "ปทุมธานี/เมืองปทุมธานี": [14.031, 100.552],
    "ปทุมธานี/คลองหลวง": [14.125, 100.75],
    "ปทุมธานี/ธัญบุรี": [13.999, 100.687],
    "ปทุมธานี/หนองเสือ": [14.087, 100.778],
    "ปทุมธานี/ลาดหลุมแก้ว": [13.99, 100.449],
    "ปทุมธานี/ลำลูกกา": [13.955, 100.641],
    "ปทุมธานี/สามโคก": [14.043, 100.544],
  };
  const mapInteraction = { scrollWheelZoom: true, touchZoom: true, dragging: true, doubleClickZoom: true };
  const map = L.map("lostMap", mapInteraction).setView(centers["กรุงเทพมหานคร"], 11);
  const addTiles = target => {
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(target);
    tiles.on("tileerror", () => {
      status.textContent = "ภาพแผนที่บางส่วนโหลดไม่ได้ กรุณาตรวจอินเทอร์เน็ต หรือระบุบริเวณเป็นข้อความ";
    });
  };
  addTiles(map);
  let point = null;
  let marker = null;
  let previewMap = null;
  let previewMarker = null;
  const icon = L.divIcon({
    className: "lost-pin",
    html: '<span aria-hidden="true">●</span>',
    iconSize: [30, 30], iconAnchor: [15, 15]
  });
  const hidePreview = () => { document.querySelector("#reportPreview").hidden = true; };
  function pick(latlng) {
    point = L.latLng(latlng.lat, latlng.wrap().lng);
    if (!marker) {
      marker = L.marker(point, { icon, draggable: true, title: "จุดที่พบครั้งสุดท้าย ลากเพื่อย้าย", alt: "หมุดจุดที่พบครั้งสุดท้าย" }).addTo(map);
      marker.on("dragend", () => pick(marker.getLatLng()));
    } else marker.setLatLng(point);
    status.textContent = "ปักหมุดแล้ว: " + point.lat.toFixed(5) + ", " + point.lng.toFixed(5) + " — กดจุดใหม่หรือลากหมุดเพื่อแก้ไข";
    clearButton.disabled = false;
    hidePreview();
  }
  function clear() {
    if (marker) map.removeLayer(marker);
    marker = null;
    point = null;
    clearButton.disabled = true;
    status.textContent = "ยังไม่ได้ปักหมุด เลือกจุดที่พบแมวครั้งสุดท้ายบนแผนที่";
    document.querySelector("#resultMapSection").hidden = true;
    document.querySelector("#resultDirections").removeAttribute("href");
    hidePreview();
  }
  map.on("click", event => pick(event.latlng));
  centerButton.disabled = false;
  centerButton.addEventListener("click", () => pick(map.getCenter()));
  clearButton.addEventListener("click", clear);
  clear();
  document.querySelector("#lostProvince").addEventListener("change", event => {
    clear();
    map.setView(centers[event.target.value] || centers["กรุงเทพมหานคร"], 11);
  });
  document.querySelector("#lostDistrict").addEventListener("change", event => {
    clear();
    const province = document.querySelector("#lostProvince").value;
    const area = window.LightBaanData?.areas.find(item => item.id === event.target.value && item.province === province);
    const center = area && districtCenters[province + "/" + area.label.replace(/^(เขต|อำเภอ)/, "")];
    map.stop();
    if (center) {
      map.setView(center, province === "กรุงเทพมหานคร" ? 14 : 13, { animate: false });
      status.textContent = "แสดงบริเวณ" + area.label + "แล้ว เลื่อนแผนที่และปักหมุดจุดที่พบแมวครั้งสุดท้าย";
    } else {
      map.setView(centers[province] || centers["กรุงเทพมหานคร"], 11, { animate: false });
    }
  });
  window.LightBaanMap = {
    renderPreview() {
      const section = document.querySelector("#resultMapSection");
      section.hidden = !point;
      if (!point) return;
      if (!previewMap) {
        previewMap = L.map("resultMap", mapInteraction);
        addTiles(previewMap);
      }
      previewMap.invalidateSize();
      previewMap.setView(point, 16);
      if (previewMarker) previewMarker.setLatLng(point);
      else previewMarker = L.marker(point, { icon, alt: "จุดที่พบแมวครั้งสุดท้าย" }).addTo(previewMap);
      document.querySelector("#resultCoordinates").textContent = "พิกัดที่ผู้แจ้งเลือก: " + point.lat.toFixed(5) + ", " + point.lng.toFixed(5);
      document.querySelector("#resultDirections").href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(point.lat + "," + point.lng);
    }
  };
})();
