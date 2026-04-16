// js/exp.js
// ฟังก์ชันช่วยจัดการ expire_at ใช้ได้ทุกหน้า

(function (window) {
  'use strict';

  /**
   * แปลงค่า string เป็น Date ให้รองรับทั้ง:
   * - "2025-12-31"
   * - "2025-12-31 23:59:59"
   * - "2025-12-31T23:59:59"
   */
  function parseDateSafe(value) {
    if (!value) return null;

    // ตัด space แล้วแทนด้วย 'T' เผื่อ format "YYYY-MM-DD HH:MM:SS"
    var normalized = String(value).trim().replace(' ', 'T');
    var d = new Date(normalized);

    if (isNaN(d.getTime())) {
      return null;
    }
    return d;
  }

  /**
   * format วันที่ภาษาไทยจาก expire_at
   * @param {string|Date} value
   * @param {Object} opts  (optional) { withTime: true/false }
   * @returns {string}
   */
  function formatExpireAt(value, opts) {
    opts = opts || {};
    var d = value instanceof Date ? value : parseDateSafe(value);
    if (!d) return '-';

    // วันที่แบบไทย
    var dateStr = d.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (opts.withTime) {
      var timeStr = d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return dateStr + ' ' + timeStr + ' น.';
    }

    return dateStr;
  }

  /**
   * คืนสถานะวันหมดอายุ
   * @param {string|Date} value
   * @returns {"expired"|"active"|"none"}
   */
  function getExpireStatus(value) {
    var d = value instanceof Date ? value : parseDateSafe(value);
    if (!d) return 'none';

    var now = new Date();
    // เปรียบเทียบเฉพาะวันที่ (ตัดเวลาออก)
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (target < today) return 'expired';
    return 'active';
  }

  /**
   * ใช้กับ DataTables โดยตรงเป็น render function
   * data = expire_at (string)
   */
  function renderExpireAt(data, type, row) {
    if (type === 'display' || type === 'filter') {
      var status = getExpireStatus(data);
      var text = formatExpireAt(data);

      // ถ้าอยากเอาแค่วันที่เฉย ๆ ให้ return text; ได้เลย
      // ถ้าอยากมี badge สี แสดงสถานะด้วย:
      if (status === 'expired') {
        return '<span class="badge bg-danger-subtle text-danger">' +
               text +
               '</span>';
      }
      if (status === 'active') {
        return '<span class="badge bg-success-subtle text-success">' +
               text +
               '</span>';
      }
      return '<span class="text-muted">-</span>';
    }

    // สำหรับ sort / type อื่น ๆ ให้ส่งค่าเดิมกลับไป
    return data;
  }

  // export ออกไปให้ใช้ทั่วหน้าเว็บ
  window.expireUtils = {
    parseDateSafe: parseDateSafe,
    formatExpireAt: formatExpireAt,
    getExpireStatus: getExpireStatus,
    renderExpireAt: renderExpireAt
  };
})(window);
