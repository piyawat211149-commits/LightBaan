const authForm = document.querySelector("#authForm");
let authMode = "login";
const feedback = document.querySelector("#authFeedback");

function setAuthMode(mode, updateUrl = true) {
  authMode = mode === "register" ? "register" : "login";
  const register = authMode === "register";
  authForm.reset();
  feedback.hidden = true;
  document.querySelectorAll(".field-error").forEach(error => error.textContent = "");
  authForm.querySelectorAll("input").forEach(input => {
    input.removeAttribute("aria-invalid");
    if (input.name.toLowerCase().includes("password")) input.type = "password";
  });
  document.querySelectorAll("[data-password]").forEach(button => {
    button.textContent = "แสดง";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", button.dataset.password === "confirmPassword" ? "แสดงรหัสผ่านยืนยัน" : "แสดงรหัสผ่าน");
  });
  document.querySelectorAll(".register-only").forEach(field => {
    field.hidden = !register;
    const input = field.querySelector("input");
    input.disabled = !register;
    input.required = register;
  });
  document.querySelectorAll("[data-auth-mode]").forEach(button => {
    const active = button.dataset.authMode === authMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#formTitle").textContent = register ? "มาเป็นส่วนหนึ่งของ LightBaan" : "ยินดีต้อนรับกลับบ้าน";
  document.querySelector("#formEyebrow").textContent = register ? "JOIN OUR LITTLE COMMUNITY" : "WELCOME BACK";
  document.querySelector("#formDescription").textContent = register ? "เริ่มต้นด้วยความตั้งใจที่จะช่วยน้องแมว" : "เข้าสู่ระบบเพื่อเริ่มช่วยน้องไปด้วยกัน";
  document.querySelector("#authSubmit").textContent = register ? "ทดลองลงทะเบียน" : "ทดลองเข้าสู่ระบบ";
  document.querySelector("#switchText").textContent = register ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?";
  document.querySelector("#switchMode").textContent = register ? "เข้าสู่ระบบ" : "ลงทะเบียน";
  document.querySelector("#password").autocomplete = register ? "new-password" : "current-password";
  document.querySelector("#passwordHint").textContent = register ? "อย่างน้อย 8 ตัวอักษร ใช้รหัสผ่านสมมติในการทดลอง" : "ใช้รหัสผ่านสมมติสำหรับทดลองหน้านี้";
  document.title = (register ? "ลงทะเบียน" : "เข้าสู่ระบบ") + " | LightBaan";
  if (updateUrl) {
    const url = new URL(location.href);
    if (register) url.searchParams.set("mode", "register");
    else url.searchParams.delete("mode");
    history.replaceState(null, "", url);
  }
}

document.querySelectorAll("[data-auth-mode]").forEach(button => button.addEventListener("click", () => setAuthMode(button.dataset.authMode)));
document.querySelector("#switchMode").addEventListener("click", () => setAuthMode(authMode === "login" ? "register" : "login"));
document.querySelectorAll("[data-password]").forEach(button => button.addEventListener("click", () => {
  const input = document.getElementById(button.dataset.password);
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.textContent = show ? "ซ่อน" : "แสดง";
  button.setAttribute("aria-pressed", String(show));
  button.setAttribute("aria-label", (show ? "ซ่อน" : "แสดง") + (input.id === "confirmPassword" ? "รหัสผ่านยืนยัน" : "รหัสผ่าน"));
}));
authForm.addEventListener("input", event => {
  feedback.hidden = true;
  const error = document.getElementById(event.target.id + "Error");
  if (error) error.textContent = "";
  event.target.removeAttribute("aria-invalid");
});
authForm.addEventListener("submit", event => {
  event.preventDefault();
  let firstInvalid = null;
  const setError = (id, message) => {
    const input = document.getElementById(id);
    document.getElementById(id + "Error").textContent = message;
    input.setAttribute("aria-invalid", "true");
    if (!firstInvalid) firstInvalid = input;
  };
  document.querySelectorAll(".field-error").forEach(error => error.textContent = "");
  authForm.querySelectorAll("input").forEach(input => input.removeAttribute("aria-invalid"));
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  if (authMode === "register" && !document.querySelector("#displayName").value.trim()) setError("displayName", "กรุณากรอกชื่อที่แสดง");
  if (!email.value.trim() || !email.validity.valid) setError("email", "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com");
  if (!password.value) setError("password", "กรุณากรอกรหัสผ่าน");
  else if (authMode === "register" && password.value.length < 8) setError("password", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  if (authMode === "register" && (!document.querySelector("#confirmPassword").value || password.value !== document.querySelector("#confirmPassword").value)) setError("confirmPassword", "กรุณายืนยันรหัสผ่านให้ตรงกัน");
  if (firstInvalid) { firstInvalid.focus(); return; }
  feedback.textContent = "ตรวจรูปแบบข้อมูลผ่านแล้ว นี่คือการสาธิตฟอร์ม ระบบยังไม่สร้างบัญชีหรือเข้าสู่ระบบจริง และไม่ได้บันทึกข้อมูลของคุณ";
  feedback.hidden = false;
  authForm.querySelectorAll('input[name*="assword"]').forEach(input => input.value = "");
  feedback.focus();
});
setAuthMode(new URLSearchParams(location.search).get("mode"), false);
document.querySelector("#authSubmit").disabled = false;
