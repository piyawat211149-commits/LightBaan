function renderAdoptionPage(root, mode) {
  const api = window.LightBaanAdoption, demo = window.LightBaanDemo, e = demo.escape;
  const example = mode === 'requests' && new URLSearchParams(location.search).get('view') === 'example';
  const sampleRequest = {id:'example-request',catId:'mochi',name:'คุณเมย์ (ผู้สมัครสมมติ)',applicant:'may@example.test',createdAt:'2026-10-17T09:00:00+07:00',status:'pending',note:'',answers:{contact:'may@example.test (ข้อมูลสมมติ)',home:'ทาวน์โฮม 2 ชั้น ในอำเภอธัญบุรี',space:'เตรียมห้องแยกสำหรับปรับตัว มีที่นอน กระบะทราย จุดวางน้ำและอาหาร และของเล่นลับเล็บ',safety:'ติดมุ้งลวดและตาข่ายหน้าต่าง ปิดทางออกสู่ระเบียง เลี้ยงระบบปิดและตรวจประตูก่อนเข้าออก',permission:'เจ้าของบ้านอนุญาตให้เลี้ยงแมวแล้ว',household:'สมาชิก 3 คนเห็นด้วย และตกลงแบ่งหน้าที่ดูแล',pets:'ไม่มีสัตว์เลี้ยงอื่นในบ้าน',experience:'เคยช่วยครอบครัวเลี้ยงแมว 3 ปี',time:'ทำงานที่บ้าน 4 วันต่อสัปดาห์ วันที่ออกไปทำงานมีพี่สาวช่วยดูแล และเตรียมผู้ดูแลสำรองเมื่อเดินทาง',budget:'เตรียมค่าอาหารและอุปกรณ์เดือนละ 2,000 บาท พร้อมเงินสำรองรักษาพยาบาล 10,000 บาท',reason:'สนใจโมจิและพร้อมให้เวลาปรับตัว จะสอบถามประวัติสุขภาพ อาหาร และนิสัยจากผู้ดูแลก่อนรับเลี้ยง พร้อมนัดพูดคุยก่อนตัดสินใจ'}};
  const user = example ? {name:'ผู้ดูแลตัวอย่าง',email:'demo@lightbaan.test'} : demo.user();
  if (!user) { root.innerHTML='<p class="demo-notice">กรุณาเข้าสู่ระบบก่อนใช้งานคำขอรับเลี้ยง</p><a class="primary-button" href="auth.html">เข้าสู่ระบบ</a>';return; }
  const params = new URLSearchParams(location.search);
  const catById = id => window.LightBaanData.cats.find(c=>c.id===id);
  const fieldNames = {contact:'ช่องทางติดต่อ (ข้อมูลสมมติ)',home:'ประเภทที่พัก',space:'พื้นที่ที่เตรียมให้น้อง',safety:'การป้องกันแมวหลุดและตกจากที่สูง',permission:'ที่พักอนุญาตให้เลี้ยงสัตว์หรือไม่',household:'สมาชิกในบ้านเห็นด้วยหรือไม่',pets:'สัตว์เลี้ยงที่มีอยู่',experience:'ประสบการณ์เลี้ยงแมว',time:'เวลาที่ดูแลและผู้ดูแลสำรอง',budget:'ความพร้อมค่าอาหารและค่ารักษาพยาบาล',reason:'เหตุผลที่สนใจและความพร้อมดูแลน้องตัวนี้'};
  const choices = {
    home:['บ้าน','ทาวน์เฮาส์ / ทาวน์โฮม','คอนโด','หอพัก / อพาร์ตเมนต์','อื่น ๆ (อธิบายด้านล่าง)'],
    permission:['อนุญาตให้เลี้ยงแมว','ยังไม่ได้สอบถาม / ยังไม่แน่ใจ','ไม่อนุญาตให้เลี้ยงแมว'],
    safety:['มีมุ้งลวด / ตาข่าย และปิดประตูหน้าต่างได้ปลอดภัย','กำลังเตรียมปรับพื้นที่ให้ปลอดภัย','ยังไม่มีการป้องกัน / ต้องการคำแนะนำ'],
    household:['ทุกคนเห็นด้วย','อยู่คนเดียว','ยังไม่ได้พูดคุยกับทุกคน','มีสมาชิกที่ยังไม่เห็นด้วย'],
    experience:['เคยเลี้ยงแมว','เคยเลี้ยงสัตว์อื่น แต่ยังไม่เคยเลี้ยงแมว','ไม่เคยเลี้ยงสัตว์'],
    budget:['เตรียมค่าอาหาร อุปกรณ์ และเงินสำรองรักษาพยาบาลแล้ว','กำลังวางแผนค่าใช้จ่าย','ยังไม่พร้อม / ต้องการข้อมูลเพิ่มเติม']
  };
  const hints={space:'เช่น ห้องแยก มุมพัก กระบะทราย และพื้นที่เล่น ไม่ต้องระบุที่อยู่บ้าน',pets:'ถ้ามี ระบุชนิด จำนวน และแผนแยกพื้นที่ช่วงแรก ถ้าไม่มีให้ระบุว่าไม่มี',time:'น้องต้องอยู่ลำพังวันละกี่ชั่วโมง ใครช่วยดูแลเมื่อคุณไม่อยู่',reason:'อธิบายเพิ่มเติมเกี่ยวกับที่พัก แผนดูแล และความต้องการของน้องตัวนี้',contact:'อีเมลหรือช่องทางติดต่อสมมติ'};
  const question = key => '<div class="field"><label for="answer-'+key+'">'+fieldNames[key]+' *</label>'+(choices[key] ? '<select id="answer-'+key+'" name="'+key+'" required><option value="">เลือกคำตอบ</option>'+choices[key].map(value=>'<option>'+value+'</option>').join('')+'</select>' : '<textarea id="answer-'+key+'" name="'+key+'" rows="2" maxlength="1000" placeholder="'+(hints[key]||'')+'" required></textarea>')+'</div>';
  if (mode === 'apply') {
    const cat = catById(params.get('id'));
    if (!cat || cat.type !== 'adopt') {root.innerHTML='<p>ไม่พบประกาศหาบ้านนี้</p><a href="cats.html?type=adopt">กลับไปเลือกแมว</a>';return;}
    if (api.owner(cat)===user.email) {root.innerHTML='<p>นี่คือประกาศของคุณ</p><a href="adoptions.html?view=incoming">ไปตรวจคำขอรับเลี้ยง →</a>';return;}
    if (api.mine().some(r=>r.catId===cat.id)) {root.innerHTML='<p>คุณส่งคำขอนี้แล้ว</p><a href="adoptions.html">ดูสถานะคำขอ →</a>';return;}
    if (api.lifecycle(cat)!=='open') {root.innerHTML='<p>ประกาศนี้ไม่เปิดรับคำขอใหม่แล้ว</p><a href="cats.html?type=adopt">ดูประกาศอื่น →</a>';return;}
    root.innerHTML=`<section class="profile-card"><h2>ประเมินความพร้อมรับเลี้ยง ${cat.name}</h2><p>ผู้ยื่นคำขอ: ${e(user.name)}</p><p>ข้อมูลของน้อง: ${cat.trait}</p><p>${cat.care}</p><p class="demo-notice">แบบฟอร์มจำลอง ใช้ข้อมูลสมมติ ผู้ลงประกาศจะอ่านคำตอบและพิจารณาเอง ไม่มีการอนุมัติอัตโนมัติ</p>
      <form id="adoptionForm"><fieldset><legend>1. สถานที่เลี้ยงเหมาะสมหรือไม่</legend>${["home","permission","space","safety","household"].map(question).join('')}</fieldset><fieldset><legend>2. ความพร้อมในการดูแล</legend>${["pets","experience","time","budget","reason"].map(question).join('')}</fieldset><fieldset><legend>3. ช่องทางติดต่อ</legend>${question("contact")}</fieldset>
      <label class="adoption-consent"><input type="checkbox" required> ฉันเข้าใจว่าผู้ดูแลต้องพูดคุยและประเมินความพร้อมก่อนรับเลี้ยง</label><p id="adoptionFeedback" role="status"></p><button class="primary-button" type="submit">ส่งคำขอรับเลี้ยงจำลอง</button></form></section>`;
    root.querySelector('form').onsubmit = event => {
      event.preventDefault();
      try {api.submit(cat.id,Object.fromEntries(new FormData(event.target)));location.href='adoptions.html';}
      catch(error){document.querySelector('#adoptionFeedback').textContent=error.message;}
    };
    return;
  }
  const incoming = example || params.get('view') === 'incoming';
  document.querySelector('#adoptionHeading').textContent = example ? 'ตัวอย่างคำขอที่เจ้าของแมวได้รับ' : incoming ? 'ตรวจคำขอรับเลี้ยง' : 'คำขอรับเลี้ยงของฉัน';
  function render() {
    const requests = example ? [sampleRequest] : incoming ? api.incoming() : api.mine();
    root.innerHTML=`<nav class="demo-types" aria-label="มุมมองคำขอ"><a href="adoptions.html" ${!incoming?'aria-current="page"':''}>คำขอของฉัน</a><a href="adoptions.html?view=incoming" ${incoming?'aria-current="page"':''}>คำขอถึงประกาศของฉัน</a></nav>
      <p class="demo-notice">${example ? "นี่คือตัวอย่างแบบฟอร์มที่ส่งแล้วในมุมเจ้าของแมว ข้อมูลทั้งหมดเป็นสมมติ ลองนัดพูดคุย อนุมัติ หรือไม่อนุมัติได้โดยไม่ส่งข้อความจริงและไม่เปลี่ยนประกาศ รีเฟรชเพื่อเริ่มใหม่" : "ข้อมูลจำลองเฉพาะแท็บนี้ สลับบัญชีผู้ขอและผู้ลงประกาศเพื่อสาธิตได้ ประกาศตัวอย่างเดิมดูแลโดยบัญชี demo@lightbaan.test"}</p>
      <p id="reviewFeedback" role="status"></p>
      ${requests.length ? requests.slice().reverse().map(r=>{
        const cat=catById(r.catId);if(!cat)return '';
        const steps = r.status==='approved' ? [['delivered','ยืนยันส่งมอบแล้ว'],['rejected','ยกเลิกการอนุมัติ']] : ['pending','interview'].includes(r.status) ? [...(r.status==='pending'?[['interview','นัดพูดคุย']]:[]),['approved','อนุมัติ — รอส่งมอบ'],['rejected','ไม่อนุมัติ']] : [];
        return `<article class="profile-card request-card"><span class="profile-badge">${api.labels[r.status]}</span><h2>${cat.name}</h2><p>ผู้ขอ: ${e(r.name)} · ${e(r.applicant)}</p><p>ส่งเมื่อ ${new Date(r.createdAt).toLocaleString('th-TH')}</p><a class="text-link" href="cat.html?id=${encodeURIComponent(cat.id)}">ดูประกาศแมว →</a><details ${example ? "open" : ""}><summary>อ่านคำตอบในแบบฟอร์ม</summary><dl>${Object.entries(fieldNames).map(([key,label])=>`<dt>${label}</dt><dd>${e(r.answers[key] || "ไม่ได้ระบุในแบบฟอร์มรุ่นก่อน")}</dd>`).join('')}</dl></details>${r.note?`<p class="review-note">ข้อความจากผู้ดูแล: ${e(r.note)}</p>`:''}
          ${incoming && steps.length ? `<label for="note-${r.id}">ข้อความ / รายละเอียดนัดหมายให้ผู้ขอ</label><textarea id="note-${r.id}" maxlength="1000" rows="2" placeholder="เช่น นัดพูดคุยวันเสาร์ เวลา 10:00 น."></textarea>${r.status==='approved'?`<label class="adoption-consent"><input id="handover-${r.id}" type="checkbox"> ยืนยันว่าได้ส่งมอบน้องให้ผู้รับเลี้ยงแล้ว</label>`:''}<div class="profile-actions">${steps.map(([status,label])=>`<button class="secondary-button" data-request="${r.id}" data-next="${status}">${label}</button>`).join('')}</div>`:''}</article>`;
      }).join(''):'<section class="profile-card"><h2>ยังไม่มีคำขอ</h2><p>เมื่อมีการส่งคำขอ รายการจะแสดงที่นี่</p><a class="text-link" href="cats.html?type=adopt">ดูน้องที่กำลังหาบ้าน →</a></section>'}`;
    root.querySelectorAll('[data-request]').forEach(button=>button.onclick=()=>{
      const feedback=document.querySelector('#reviewFeedback');
      try {
        if(button.dataset.next==='delivered'&&!document.getElementById('handover-'+button.dataset.request).checked) throw Error('กรุณายืนยันการส่งมอบก่อนเปลี่ยนสถานะ');
        const note = document.getElementById('note-'+button.dataset.request).value;
        if (example) { sampleRequest.status = button.dataset.next; sampleRequest.note = note.trim().slice(0,1000); }
        else api.transition(button.dataset.request,button.dataset.next,note);
        render();document.querySelector('#reviewFeedback').textContent='บันทึกสถานะแล้ว';
      } catch(error){feedback.textContent=error.message;feedback.scrollIntoView({block:'center'});}
    });
  }
  render();
}
window.LightBaanRenderAdoption = renderAdoptionPage;
if (document.querySelector('#adoptionContent')) renderAdoptionPage(document.querySelector('#adoptionContent'), document.body.dataset.adoptionPage);
