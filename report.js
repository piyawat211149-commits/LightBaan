const reportForm = document.querySelector("#reportForm");
const reportProvince = document.querySelector("#lostProvince");
const reportDistrict = document.querySelector("#lostDistrict");
const reportPhoto = document.querySelector("#catPhoto");
const photoPreview = document.querySelector("#photoPreview");
const reportPreview = document.querySelector("#reportPreview");
let photoUrl = "";
let photoVersion = 0;
const reportValue = id => document.getElementById(id).value.trim();
const today = new Date();
document.querySelector("#lostDate").max = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
[...new Set(window.LightBaanData.areas.map(area => area.province))].forEach(province => reportProvince.append(new Option(province, province)));
reportProvince.addEventListener("change", () => {
  reportDistrict.replaceChildren(new Option(reportProvince.value ? "เลือกเขต / อำเภอ" : "เลือกจังหวัดก่อน", ""));
  reportDistrict.disabled = !reportProvince.value;
  window.LightBaanData.areas.filter(area => area.province === reportProvince.value)
    .sort((a, b) => a.label.localeCompare(b.label, "th"))
    .forEach(area => reportDistrict.append(new Option(area.label, area.id)));
});
reportPhoto.addEventListener("change", async () => {
  const version = ++photoVersion;
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = "";
  photoPreview.hidden = true;
  photoPreview.removeAttribute("src");
  document.querySelector("#resultPhoto").removeAttribute("src");
  const error = document.querySelector("#photoError");
  error.textContent = "";
  reportPhoto.setCustomValidity("");
  const file = reportPhoto.files[0];
  if (!file) return;
  const reject = message => { error.textContent = message; reportPhoto.setCustomValidity(message); };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return reject("กรุณาเลือกไฟล์ JPG, PNG หรือ WebP");
  if (file.size > 5 * 1024 * 1024) return reject("รูปมีขนาดเกิน 5 MB กรุณาเลือกรูปที่เล็กลง");
  reportPhoto.setCustomValidity("กำลังตรวจสอบรูปภาพ กรุณารอสักครู่");
  const candidate = URL.createObjectURL(file);
  const probe = new Image();
  probe.src = candidate;
  try {
    await probe.decode();
    if (version !== photoVersion) { URL.revokeObjectURL(candidate); return; }
    photoUrl = candidate;
    photoPreview.src = photoUrl;
    photoPreview.hidden = false;
    reportPhoto.setCustomValidity("");
  } catch {
    URL.revokeObjectURL(candidate);
    if (version === photoVersion) reject("เปิดรูปนี้ไม่ได้ กรุณาเลือกไฟล์ภาพใหม่");
  }
});
const contactPhone = document.querySelector("#contactPhone");
contactPhone.addEventListener("input", () => contactPhone.setCustomValidity(""));
reportForm.addEventListener("input", () => { reportPreview.hidden = true; });
reportForm.addEventListener("change", () => { reportPreview.hidden = true; });
reportForm.addEventListener("submit", event => {
  event.preventDefault();
  const digits = contactPhone.value.replace(/[\s()-]/g, "");
  contactPhone.setCustomValidity(/^(0\d{8,9}|\+66\d{8,9})$/.test(digits) ? "" : "กรุณากรอกเบอร์โทรศัพท์ไทยให้ถูกต้อง");
  for (const input of reportForm.querySelectorAll('input[type="text"], textarea[required]')) {
    input.setCustomValidity(input.required && !input.value.trim() ? "กรุณากรอกข้อมูล" : "");
    input.oninput = () => input.setCustomValidity("");
  }
  if (!reportForm.reportValidity() || !photoUrl) return;
  const put = (id, value) => { document.getElementById(id).textContent = value; };
  put("resultName", reportValue("catName"));
  put("resultTraits", [reportValue("catSex"), reportValue("catAge") || "ไม่ระบุอายุ", reportValue("catCoat"), reportValue("catTraits")].join(" · "));
  put("resultArea", reportDistrict.selectedOptions[0].textContent + ", " + reportProvince.value);
  const date = new Date(reportValue("lostDate") + "T00:00:00");
  put("resultDate", "หายเมื่อ " + date.toLocaleDateString("th-TH", { dateStyle: "long" }) + (reportValue("lostTime") ? " เวลา " + reportValue("lostTime") + " น." : ""));
  put("resultPlace", "บริเวณ: " + reportValue("lostPlace"));
  put("resultStory", reportValue("lostStory"));
  put("resultContact", "ติดต่อ " + reportValue("contactName") + " · " + reportValue("contactPhone") + (reportValue("contactLine") ? " · LINE: " + reportValue("contactLine") : ""));
  document.querySelector("#resultPhoto").src = photoUrl;
  reportPreview.hidden = false;
  document.querySelector("#previewTitle").focus();
  reportPreview.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#editReport").addEventListener("click", () => {
  reportPreview.hidden = true;
  document.querySelector("#catName").focus();
});
document.querySelector("#previewReport").disabled = false;
