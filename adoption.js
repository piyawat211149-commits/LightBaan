// Local demonstration workflow. One write commits each request transition.
(() => {
  const demo = window.LightBaanDemo;
  const read = () => { try { return JSON.parse(sessionStorage.getItem('lightbaan-adoptions')) || []; } catch { return []; } };
  const save = requests => sessionStorage.setItem('lightbaan-adoptions', JSON.stringify(requests));
  const owner = cat => cat.owner || 'demo@lightbaan.test';
  const catById = id => window.LightBaanData?.cats.find(c => c.id === id);
  const labels = {pending:'รอตรวจสอบ',interview:'นัดพูดคุย',approved:'อนุมัติ · รอส่งมอบ',rejected:'ไม่อนุมัติ',delivered:'ส่งมอบแล้ว'};
  const active = requests => requests.find(r => ['approved','delivered'].includes(r.status));
  const lifecycle = cat => {
    const accepted = active(read().filter(r => r.catId === cat.id));
    if (accepted?.status === 'delivered' || cat.closed) return 'closed';
    return accepted ? 'reserved' : 'open';
  };
  const statusLabel = cat => lifecycle(cat) === 'closed' ? ({adopt:'มีผู้รับเลี้ยงแล้ว',lost:'กลับบ้านแล้ว',found:'พบเจ้าของแล้ว'}[cat.type]) : lifecycle(cat) === 'reserved' ? 'รอส่งมอบ' : ({adopt:'หาบ้าน · กำลังหาผู้รับเลี้ยง',lost:'แมวหาย · กำลังตามหา',found:'พบแมว · ตามหาเจ้าของเดิม'}[cat.type]);
  window.LightBaanAdoption = {
    owner, labels, lifecycle, statusLabel,
    mine: () => read().filter(r => r.applicant === demo.user()?.email),
    incoming: () => read().filter(r => owner(catById(r.catId) || {}) === demo.user()?.email),
    submit(catId, answers) {
      const user = demo.user(), cat = catById(catId), requests = read();
      if (!user) throw Error('กรุณาเข้าสู่ระบบก่อนส่งคำขอ');
      if (!cat || cat.type !== 'adopt' || lifecycle(cat) !== 'open') throw Error('ประกาศนี้ไม่เปิดรับคำขอแล้ว');
      if (owner(cat) === user.email) throw Error('ไม่สามารถขอรับเลี้ยงจากประกาศของตัวเอง');
      if (requests.some(r => r.catId === catId && r.applicant === user.email)) throw Error('คุณส่งคำขอสำหรับน้องตัวนี้แล้ว ดูสถานะได้ที่คำขอของฉัน');
      const clean = {};
      for (const key of ['contact','home','space','safety','permission','household','pets','experience','time','budget','reason']) {
        clean[key] = String(answers[key] || '').trim();
        if (!clean[key] || clean[key].length > 1000) throw Error('กรุณากรอกข้อมูลให้ครบ และไม่เกิน 1,000 ตัวอักษรต่อช่อง');
      }
      requests.push({id:crypto.randomUUID(),catId,applicant:user.email,name:user.name,answers:clean,status:'pending',createdAt:new Date().toISOString(),note:''});
      save(requests);
    },
    transition(id, next, note = '') {
      const requests = read(), request = requests.find(r => r.id === id);
      const cat = request && catById(request.catId);
      if (!cat || owner(cat) !== demo.user()?.email) throw Error('เฉพาะผู้ลงประกาศเท่านั้นที่เปลี่ยนสถานะได้');
      const allowed = {pending:['interview','approved','rejected'],interview:['approved','rejected'],approved:['delivered','rejected']};
      if (!allowed[request.status]?.includes(next)) throw Error('ไม่สามารถเปลี่ยนสถานะตามขั้นตอนนี้');
      if (next === 'approved' && (cat.closed || active(requests.filter(r => r.catId === cat.id)))) throw Error('ประกาศนี้มีผู้ได้รับอนุมัติแล้วหรือปิดแล้ว');
      request.status = next;
      request.note = String(note).trim().slice(0,1000);
      if (next === 'delivered') requests.filter(r=>r.catId===cat.id && r.id!==id && ['pending','interview'].includes(r.status)).forEach(r=>{r.status='rejected';r.note='ประกาศนี้ส่งมอบน้องให้ผู้รับเลี้ยงแล้ว';});
      save(requests);
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    const cat = catById(new URLSearchParams(location.search).get('id'));
    if (document.querySelector('#catDetail') && cat?.type === 'adopt') {
      const button = document.querySelector('.detail-actions [data-coming-soon]');
      if (button) {
        button.removeAttribute('data-coming-soon');
        const isOwner = owner(cat) === demo.user()?.email;
        const sent = window.LightBaanAdoption.mine().some(r=>r.catId===cat.id);
        button.textContent = isOwner ? 'ตรวจคำขอรับเลี้ยง' : sent ? 'ดูคำขอของฉัน' : lifecycle(cat) !== 'open' ? statusLabel(cat) : 'สนใจรับเลี้ยงน้อง';
        button.disabled = !isOwner && !sent && lifecycle(cat) !== 'open';
        button.onclick = () => {
          if (isOwner || sent) {location.href=isOwner?'adoptions.html?view=incoming':'adoptions.html';return;}
          let dialog=document.querySelector('#adoptionDialog');
          if(!dialog) {
            dialog=document.createElement('dialog');dialog.id='adoptionDialog';dialog.setAttribute('aria-labelledby','adoptionDialogTitle');
            dialog.innerHTML='<button class="dialog-close" type="button" aria-label="ปิดฟอร์มรับเลี้ยง">×</button><h2 id="adoptionDialogTitle">แบบฟอร์มขอรับเลี้ยง</h2><div id="adoptionModalContent"></div>';
            document.body.append(dialog);
            dialog.querySelector('button').onclick=()=>dialog.close();
            dialog.addEventListener('close',()=>button.focus());
            window.LightBaanRenderAdoption(dialog.querySelector('#adoptionModalContent'),'apply');
          }
          dialog.showModal();
        };
      }
    }
    const list = document.querySelector('#myPosts');
    list?.querySelectorAll('[data-toggle-post]').forEach(button => {
      const cat = catById(button.dataset.togglePost);
      if (cat?.type !== 'adopt') return;
      const link = document.createElement('a');link.href='adoptions.html?view=incoming';link.className='secondary-button';link.textContent='ตรวจคำขอ / ยืนยันส่งมอบ';button.replaceWith(link);
    });
  });
})();
