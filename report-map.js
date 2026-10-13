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
    "ปทุมธานี": [14.0208, 100.5250]
  };
  // Approximate reference points, not administrative boundaries.
  // Adapted from Open Admin Data, CC BY 4.0; selected 7 districts and converted to numeric pairs.
  // https://github.com/open-admin-data/thailand-administrative-divisions/blob/main/data/all-district.json
  // https://creativecommons.org/licenses/by/4.0/
  const districtCenters = {
    "ปทุมธานี/เมืองปทุมธานี": [14.031, 100.552],
    "ปทุมธานี/คลองหลวง": [14.125, 100.75],
    "ปทุมธานี/ธัญบุรี": [13.999, 100.687],
    "ปทุมธานี/หนองเสือ": [14.087, 100.778],
    "ปทุมธานี/ลาดหลุมแก้ว": [13.99, 100.449],
    "ปทุมธานี/ลำลูกกา": [13.955, 100.641],
    "ปทุมธานี/สามโคก": [14.043, 100.544],
  };
  const mapInteraction = { scrollWheelZoom: true, touchZoom: true, dragging: true, doubleClickZoom: true };
  const map = L.map("lostMap", mapInteraction).setView(centers["ปทุมธานี"], 11);
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
    map.setView(centers[event.target.value] || centers["ปทุมธานี"], 11);
  });
  document.querySelector("#lostDistrict").addEventListener("change", event => {
    clear();
    const province = document.querySelector("#lostProvince").value;
    const area = window.LightBaanData?.areas.find(item => item.id === event.target.value && item.province === province);
    const center = area && districtCenters[province + "/" + area.label.replace(/^(เขต|อำเภอ)/, "")];
    map.stop();
    if (center) {
      map.setView(center, 13, { animate: false });
      status.textContent = "แสดงบริเวณ" + area.label + "แล้ว เลื่อนแผนที่และปักหมุดจุดที่พบแมวครั้งสุดท้าย";
    } else {
      map.setView(centers[province] || centers["ปทุมธานี"], 11, { animate: false });
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
