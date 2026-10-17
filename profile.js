const profileRoot = document.querySelector('#profileContent');
const profileUser = window.LightBaanDemo.user();
if (!profileUser) {
  profileRoot.innerHTML = '<section class="profile-card"><h2>เข้าสู่ระบบเพื่อดูโปรไฟล์</h2><p>ใช้บัญชีที่สมัครในแท็บนี้ หรือบัญชีทดลองของเว็บไซต์</p><a class="primary-button" href="auth.html">เข้าสู่ระบบ</a> <a class="text-link" href="auth.html?mode=register">ลงทะเบียน →</a></section>';
} else {
  const escapeProfile = window.LightBaanDemo.escape;
  const posts = window.LightBaanDemo.posts().filter(post => (post.owner || 'demo@lightbaan.test') === profileUser.email);
  const closed = posts.filter(post => post.closed).length;
  profileRoot.innerHTML = `
    <section class="profile-card" aria-labelledby="profileName">
      <div class="profile-identity"><span class="profile-avatar" aria-hidden="true">${escapeProfile(Array.from(profileUser.name)[0] || '♡')}</span><div><span class="profile-badge">เข้าสู่ระบบแล้ว · บัญชีจำลอง</span><h2 id="profileName">${escapeProfile(profileUser.name)}</h2><p class="profile-email">${escapeProfile(profileUser.email || 'demo@lightbaan.test')}</p></div></div>
      <p>ยินดีต้อนรับ ${escapeProfile(profileUser.name)} พร้อมช่วยน้องแมวไปด้วยกันแล้ว</p>
      <div class="profile-stats"><div><strong>${posts.length}</strong><span>ประกาศทั้งหมด</span></div><div><strong>${posts.length - closed}</strong><span>กำลังดำเนินการ</span></div><div><strong>${closed}</strong><span>ปิดประกาศแล้ว</span></div></div>
      <div class="profile-actions"><a class="primary-button" href="my-posts.html">ดูประกาศของฉัน →</a><a class="secondary-button" href="report.html">ลงประกาศใหม่</a></div>
    </section>
    <section class="profile-card"><h2>เริ่มช่วยน้องได้เลย</h2><nav class="demo-types" aria-label="ลงประกาศ"><a href="report.html?type=lost">แจ้งแมวหาย</a><a href="report.html?type=found">แจ้งพบแมว</a><a href="report.html?type=adopt">ลงประกาศหาบ้าน</a></nav><p class="sample-note">บัญชีและประกาศเป็นข้อมูลจำลองในแท็บนี้ ไม่ใช้ข้ามเครื่อง เมื่อปิดแท็บข้อมูลจะหมดอายุ</p><button class="login-button" type="button" id="profileLogout">ออกจากระบบ</button></section>`;
  document.querySelector('#profileLogout').addEventListener('click', () => {
    sessionStorage.removeItem('lightbaan-user');
    location.href = 'auth.html';
  });
}
