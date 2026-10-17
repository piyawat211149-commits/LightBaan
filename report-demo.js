const reportType = ['lost', 'found', 'adopt'].includes(new URLSearchParams(location.search).get('type')) ? new URLSearchParams(location.search).get('type') : 'lost';
const reportTitles = {lost:'แจ้งแมวหาย', found:'แจ้งพบแมว', adopt:'ลงประกาศหาบ้าน'};
const dateLabels = {lost:'วันที่หาย',found:'วันที่พบแมว',adopt:'วันที่ลงประกาศ'};
document.querySelector('#reportHeading').textContent = reportTitles[reportType];
document.title = reportTitles[reportType] + ' | LightBaan';
document.querySelector('label[for="lostDate"]').textContent = dateLabels[reportType] + ' *';
document.querySelector('label[for="lostTime"]').textContent = reportType === 'adopt' ? 'เวลาที่สะดวกติดต่อ (ถ้าทราบ)' : 'เวลาที่พบครั้งสุดท้าย (ถ้าทราบ)';
document.querySelectorAll('fieldset legend')[1].textContent = reportType === 'lost' ? '02 · น้องหายที่ไหน' : reportType === 'found' ? '02 · พบแมวที่ไหน' : '02 · พื้นที่ของผู้ดูแล';
document.querySelector('label[for="lostPlace"]').textContent = 'บริเวณ / จุดสังเกต *';
document.querySelector('#mapTitle').textContent = 'ปักหมุดพื้นที่ของประกาศ (ไม่บังคับ)';
document.querySelector('#lostStory').placeholder = reportType === 'adopt' ? 'นิสัย สุขภาพ การทำหมัน และเงื่อนไขรับเลี้ยง' : 'รายละเอียดเหตุการณ์และข้อมูลเพิ่มเติม';
document.querySelector('#resultMapTitle').textContent = 'พื้นที่ที่ปักหมุด';
const previewBadge = document.querySelector('.report-result-grid .status');
previewBadge.className = 'status ' + reportType;
previewBadge.textContent = window.LightBaanData.types[reportType];
document.querySelector('#reportForm').addEventListener('submit', () => {
  if (!document.querySelector('#reportPreview').hidden) document.querySelector('#resultDate').textContent = dateLabels[reportType] + ': ' + document.querySelector('#lostDate').value;
});
document.querySelector('#saveReport').addEventListener('click', async () => {
  const status = document.querySelector('#saveStatus');
  if (!window.LightBaanDemo.user()) {
    status.replaceChildren(document.createTextNode('กรุณาเข้าสู่ระบบจำลองก่อนบันทึก (เมื่อเปลี่ยนหน้า แบบฟอร์มที่ยังไม่บันทึกจะหาย) '));
    const link=document.createElement('a'); link.href='auth.html'; link.textContent='เข้าสู่ระบบ';status.append(link);return;
  }
  if (document.querySelector('#reportPreview').hidden || !document.querySelector('#reportForm').reportValidity()) return;
  const button=document.querySelector('#saveReport');button.disabled=true;
  try {
    const file=document.querySelector('#catPhoto').files[0];
    const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
    const value=id=>document.getElementById(id).value.trim();
    const area=window.LightBaanData.areas.find(a=>a.id===value('lostDistrict'));
    const post={id:'demo-'+Date.now().toString(36),name:value('catName'),type:reportType,district:area.id,
      detail:[value('catCoat'),value('catSex'),value('catTraits')].join(' · '),location:area.label+', ปทุมธานี',image,imagePosition:'50% 40%',
      sex:value('catSex'),age:value('catAge')||'ยังไม่ระบุ',coat:value('catCoat'),trait:value('catTraits'),
      story:[dateLabels[reportType]+': '+value('lostDate'),value('lostPlace'),value('lostStory')].join(' — '),care:'สอบถามข้อมูลการดูแลจากผู้ประกาศ (ข้อมูลจำลอง)',
      publisher:value('contactName')+' (ประกาศจำลองของฉัน)',contact:value('contactPhone'),line:value('contactLine'),coordinates:window.LightBaanMap?.getPoint()||null,custom:true,closed:false};
    window.LightBaanDemo.save(post);
    location.href='cat.html?id='+post.id;
  } catch {
    status.textContent='บันทึกไม่สำเร็จ พื้นที่ในแท็บอาจเต็มหรือถูกปิดกั้น ลองใช้รูปขนาดเล็กลง ข้อมูลในฟอร์มยังอยู่';
    button.disabled=false;
  }
});

if (!window.LightBaanDemo.user()) {
  const notice=document.createElement('p');notice.className='demo-notice';notice.innerHTML='ต้องการบันทึกประกาศ? <a href="auth.html"><strong>เข้าสู่ระบบจำลองก่อนเริ่มกรอก →</strong></a> หรือทดลองดูตัวอย่างได้โดยไม่ล็อกอิน';document.querySelector('#reportForm').prepend(notice);
}
if (reportType !== 'lost') {
  document.querySelector('#mapHelp').textContent='ลากเพื่อเลื่อนแผนที่ ใช้ล้อเมาส์หรือสองนิ้วเพื่อซูม กดเพื่อปักหมุดบริเวณของประกาศ เลือกบริเวณใกล้เคียงได้';
  document.querySelector('.report-tips li:last-child').textContent='บอกพื้นที่ วันที่ และข้อมูลสำคัญของประกาศ';
  document.querySelector('.location-picker small').textContent='เลือกอำเภอเพื่อซูม แล้วปักหมุดบริเวณของประกาศ หมุดไม่เปลี่ยนอำเภอให้อัตโนมัติ';
}

document.querySelector(".report-lead").textContent = reportType === "adopt" ? "เล่าเรื่องของน้องและความพร้อมในการรับเลี้ยง เพื่อช่วยให้น้องได้พบครอบครัวใหม่" : reportType === "found" ? "รูปและข้อมูลพื้นที่ที่พบ อาจช่วยให้เจ้าของตามหาน้องเจอ" : "ทุกเบาะแสมีความหมาย เริ่มจากข้อมูลเล็ก ๆ ที่ช่วยให้คนจดจำน้องได้";
