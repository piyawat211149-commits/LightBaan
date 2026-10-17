// Demo only: session data stays in this browser tab. Never store passwords.
(() => {
  const read = (key, fallback) => { try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => sessionStorage.setItem(key, JSON.stringify(value));
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalizeEmail = email => email.trim().toLowerCase();
  const passwordHash = async (password, salt) => {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:new Uint8Array(salt),iterations:100000,hash:'SHA-256'},key,256);
    return Array.from(new Uint8Array(bits), b=>b.toString(16).padStart(2,'0')).join('');
  };
  window.LightBaanDemo = {
    user: () => read('lightbaan-user', null),
    async register(name,email,password) {
      email=normalizeEmail(email);
      const accounts=read('lightbaan-accounts',[]);
      if(email==='demo@lightbaan.test'||accounts.some(a=>a.email===email)) throw new Error('อีเมลนี้ถูกใช้แล้วในแท็บนี้');
      const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));
      const hash=await passwordHash(password,salt);
      write('lightbaan-accounts',[...accounts,{name:name.trim(),email,salt,hash}]);
    },
    async login(email,password) {
      email=normalizeEmail(email);
      if(email==='demo@lightbaan.test'&&password==='Demo1234') {write('lightbaan-user',{name:'ผู้ใช้ตัวอย่าง',email});return true;}
      const account=read('lightbaan-accounts',[]).find(a=>a.email===email);
      if(!account||await passwordHash(password,account.salt)!==account.hash) return false;
      write('lightbaan-user',{name:account.name,email}); return true;
    },
    posts: () => read('lightbaan-posts', []),
    save(post) { write('lightbaan-posts', [{...post,owner:this.user()?.email}, ...this.posts()]); },
    escape
  };
  if (window.LightBaanData) {
    const posts = window.LightBaanDemo.posts().filter(p => /^demo-[a-z0-9-]+$/.test(p.id));
    const safe = posts.map(post => Object.fromEntries(Object.entries(post).map(([key,value]) => {
      if (key === 'image') return [key, /^data:image\/(jpeg|png|webp);base64,/.test(value) ? value : 'Logo.jpg'];
      return [key, typeof value === 'string' ? escape(value) : value];
    })));
    window.LightBaanData.cats.unshift(...safe);
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (window.LightBaanDemo.user()) document.querySelectorAll('.auth-actions').forEach(el => {
      el.innerHTML = `<a class="profile-link" href="profile.html" aria-label="โปรไฟล์ของ ${escape(window.LightBaanDemo.user().name)}"><span class="profile-mini-avatar" aria-hidden="true">${escape(Array.from(window.LightBaanDemo.user().name)[0] || '♡')}</span><span class="profile-link-name">${escape(window.LightBaanDemo.user().name)}</span></a><a class="login-button" href="my-posts.html">ประกาศของฉัน</a>`;
    });
    document.querySelectorAll('[data-logout]').forEach(button => button.onclick = () => {sessionStorage.removeItem('lightbaan-user'); location.href='index.html';});
    const root = document.querySelector('#myPosts');
    if (root) {
      const posts = window.LightBaanDemo.posts().filter(p=>(p.owner||"demo@lightbaan.test")===window.LightBaanDemo.user()?.email);
      root.innerHTML = window.LightBaanDemo.user() ? '<p class="demo-notice">ประกาศจำลองอยู่ในแท็บนี้เท่านั้น ปิดแท็บแล้วข้อมูลจะหาย ไม่ได้เผยแพร่ให้ผู้อื่น</p><p><a class="primary-button" href="report.html">ลงประกาศใหม่</a></p>' + (posts.length ? posts.map(p=>`<article class="demo-post"><h2>${escape(p.name)}</h2><p>${escape(p.location)} · ${window.LightBaanAdoption.statusLabel(p)}</p><a class="text-link" href="cat.html?id=${p.id}">ดูรายละเอียด →</a><button class="secondary-button" data-toggle-post="${p.id}">${p.closed ? 'เปิดประกาศอีกครั้ง' : 'ปิดประกาศ — ช่วยน้องสำเร็จ'}</button></article>`).join('') : '<p>ยังไม่มีประกาศ ลองลงประกาศแรกของคุณได้เลย</p>') : '<p>กรุณาเข้าสู่ระบบจำลองก่อน</p><a class="primary-button" href="auth.html">เข้าสู่ระบบ</a>';
      root.querySelectorAll('[data-toggle-post]').forEach(button => button.onclick = () => { const items=window.LightBaanDemo.posts(); const post=items.find(p=>p.id===button.dataset.togglePost && (p.owner||'demo@lightbaan.test')===window.LightBaanDemo.user()?.email); if(!post)return; post.closed=!post.closed; try {write('lightbaan-posts',items);location.reload();} catch {alert('บันทึกไม่ได้ กรุณาตรวจพื้นที่จัดเก็บของเบราว์เซอร์');} });
    }
    const detail = document.querySelector('#catDetail');
    if (detail && window.LightBaanData) {
      const cat=window.LightBaanData.cats.find(c=>c.id===new URLSearchParams(location.search).get('id'));
      if (!cat) return;
      if (cat.closed) {const notice=document.createElement('p');notice.className='demo-notice';notice.textContent=window.LightBaanAdoption.statusLabel(cat);detail.prepend(notice);}
      const dialog=document.querySelector('#comingSoonDialog');
      if (dialog) {
        dialog.querySelector('h2').textContent='ติดต่อ / ส่งเบาะแส (จำลอง)';
        dialog.querySelector('p').textContent='ข้อความนี้ใช้สาธิตเท่านั้น ไม่มีการส่งถึงผู้ประกาศจริง';
        const form=document.createElement('form');
        form.innerHTML='<label for="tipMessage">ข้อความถึงผู้ประกาศ</label><textarea id="tipMessage" required maxlength="1000" rows="3"></textarea><button class="primary-button">ทดลองส่งข้อความ</button><p role="status" id="tipStatus"></p>';
        form.onsubmit=e=>{e.preventDefault();if(!form.querySelector('textarea').value.trim())return;form.querySelector('#tipStatus').textContent='ส่งข้อความจำลองสำเร็จ ไม่มีการส่งข้อมูลออกจากเครื่อง';form.reset();};
        dialog.append(form);
      }
    }
  });
})();
