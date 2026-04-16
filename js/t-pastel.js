// js/pastel.js
document.addEventListener('DOMContentLoaded', () => {
  const body       = document.body;
  const toggleBtn  = document.getElementById('themeToggle');
  if (!toggleBtn) return; // กัน error ถ้าหน้าไหนไม่มีปุ่ม

  const labelEl = toggleBtn.querySelector('.theme-label');
  const iconEl  = toggleBtn.querySelector('i');
  const STORAGE_KEY = 'slip_theme_mode'; // ใช้คีย์นี้ทุกหน้า

  // --- ฟังก์ชันเซ็ตโหมด ---
  function applyTheme(mode) {
    if (mode === 'pastel') {
      body.classList.add('pastel-mode');    // ✅ เปิดพาสเทล
      if (labelEl) labelEl.textContent = 'โหมดเดิม';
      if (iconEl) {
        iconEl.classList.remove('bi-moon-stars');
        iconEl.classList.add('bi-sun');
      }
    } else {
      body.classList.remove('pastel-mode'); // ✅ กลับโหมดเดิม
      if (labelEl) labelEl.textContent = 'โหมดพาสเทล';
      if (iconEl) {
        iconEl.classList.remove('bi-sun');
        iconEl.classList.add('bi-moon-stars');
      }
    }
  }

  // --- โหลดค่าจาก localStorage ตอนเปิดหน้า ---
  const savedMode = localStorage.getItem(STORAGE_KEY) || 'normal';
  applyTheme(savedMode);

  // --- เวลา user กดปุ่ม toggle ---
  toggleBtn.addEventListener('click', () => {
    const isPastel = body.classList.contains('pastel-mode');
    const nextMode = isPastel ? 'normal' : 'pastel';
    localStorage.setItem(STORAGE_KEY, nextMode);
    applyTheme(nextMode);
  });
});
