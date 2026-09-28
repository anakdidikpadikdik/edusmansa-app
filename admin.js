// ============================================
// EDUSMANSA — ADMIN PANEL LOGIC & MANAGEMENT
// ============================================

const ANALYTICS_KEY = 'schoolhub_analytics';

let schoolData = null;
let analyticsChart = null;

document.addEventListener('DOMContentLoaded', () => {
  // ── Firebase Auth Gatekeeper ──
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
      const authGate = document.getElementById('auth-gate');
      const authStatus = document.getElementById('auth-gate-status');
      const mainContent = document.getElementById('admin-main-content');
      const emailBadge = document.getElementById('admin-user-email');

      if (user) {
        // Admin terautentikasi resmi
        if (emailBadge) emailBadge.textContent = user.email || 'Admin Terdaftar';
        if (authGate) authGate.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';

        await loadSchoolData();
        renderAdminAnnouncements();
        renderAdminTeachers();
        initAnalyticsChart();
      } else {
        // Belum login -> tolak akses & alihkan
        if (authStatus) {
          authStatus.innerHTML = '<span style="color:#F43F5E;">⛔ Akses ditolak! Kamu belum login sebagai Admin.<br>Mengalihkan kembali ke portal siswa...</span>';
        }
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1800);
      }
    });
  } else {
    // Fallback jika offline / mode lokal
    loadSchoolData().then(() => {
      renderAdminAnnouncements();
      renderAdminTeachers();
      initAnalyticsChart();
    });
  }
});

async function loadSchoolData() {
  if (typeof db !== 'undefined') {
    try {
      const docSnap = await db.collection('edusmansa').doc('schoolData').get();
      if (docSnap.exists) {
        schoolData = docSnap.data();
        console.log('✅ Admin Panel memuat data dari Cloud Firestore.');
        return;
      }
    } catch (err) {
      console.warn('Gagal membaca dari Firestore, beralih ke fallback:', err);
    }
  }

  // Fallback membaca file JSON lokal
  if (!schoolData) {
    try {
      const res = await fetch('data/school_data.json');
      schoolData = await res.json();
    } catch(err){}
  }
}

// Simpan perubahan ke Cloud Firestore agar seluruh HP siswa langsung menerima update
async function saveAdminOverrides() {
  if (schoolData && typeof db !== 'undefined') {
    try {
      await db.collection('edusmansa').doc('schoolData').set(schoolData);
      console.log('✅ Data berhasil diperbarui di Cloud Firestore!');
    } catch (err) {
      console.error('❌ Gagal simpan ke Firestore:', err);
      alert('Gagal menyimpan ke Cloud: ' + err.message);
    }
  }
}

async function saveData() {
  await saveAdminOverrides();
}

async function handleAdminLogout() {
  const isConfirmed = await showConfirmModal('&#10067; Konfirmasi Logout', 'Yakin ingin keluar dari Admin Panel?', false, 'Ya, Keluar');
    if (isConfirmed) {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
      });
    } else {
      window.location.href = 'index.html';
    }
  }
}

// ── 0. Schedule Editor ─────────────────────────
// Time slots for normal schedule (period → time string)
const ADMIN_TIME_SLOTS = {
  1:  '06:50 - 07:30',
  2:  '07:30 - 08:10',
  3:  '08:10 - 08:50',
  4:  '08:50 - 09:30',
  5:  '10:00 - 10:40',
  6:  '10:40 - 11:20',
  7:  '11:20 - 12:00',
  8:  '13:00 - 13:40',
  9:  '13:40 - 14:20',
  10: '14:20 - 15:00',
};

function renderScheduleEditor() {
  const container = document.getElementById('schedule-editor-table');
  const classSelect = document.getElementById('sched-class-select');
  const daySelect = document.getElementById('sched-day-select');
  if (!container || !classSelect || !daySelect || !schoolData) return;

  const selectedClass = classSelect.value;
  const selectedDay   = daySelect.value;
  if (!selectedClass || !selectedDay) return;

  // Get existing schedule items for this class/day
  const existing = (schoolData.schedules && schoolData.schedules[selectedClass] && schoolData.schedules[selectedClass][selectedDay]) || [];

  // Build a lookup: period → {subject, teacher}
  const byPeriod = {};
  existing.forEach(item => { byPeriod[item.period] = item; });

  // Build teacher options HTML
  const teachers = (schoolData.teachers || []);
  const teacherOptions = teachers.map(t =>
    `<option value="${t.subject}">${t.name} (${t.subject})</option>`
  ).join('');

  // Build table rows for jam 1 to 10
  // Build table rows for jam 1 to 10
  const datalistOptions = teachers.map(t => `<option value="${t.name} (${t.subject})">`).join('');
  let rows = '';
  for (let p = 1; p <= 10; p++) {
    const curr = byPeriod[p] || {};
    const timeStr = ADMIN_TIME_SLOTS[p] || '-';
    const subjVal = (curr.subject || '').replace(/"/g, '&quot;');
    const teacherVal = curr.teacher || '';
    let teacherDisplayVal = '';
    if (teacherVal && teacherVal !== '-') {
      const tObj = teachers.find(t => t.subject === teacherVal);
      teacherDisplayVal = tObj ? `${tObj.name} (${tObj.subject})` : teacherVal;
    }
    teacherDisplayVal = teacherDisplayVal.replace(/"/g, '&quot;');

    rows += `
      <tr>
        <td style="white-space:nowrap;">
          <span class="sched-period-badge">${p}</span>
          <br><span class="sched-time-label">${timeStr}</span>
        </td>
        <td>
          <input
            type="text"
            class="sched-subject-input"
            id="sched-subj-${p}"
            value="${subjVal}"
            placeholder="Kode mapel, misal: BInd"
          />
        </td>
        <td>
          <input 
            type="text" 
            list="dl-teachers"
            class="sched-teacher-select" 
            id="sched-teacher-${p}"
            value="${teacherDisplayVal}"
            placeholder="Ketik cari nama / kode guru..."
          />
        </td>
      </tr>`;
  }

  container.innerHTML = `
    <table class="sched-editor-table">
      <thead>
        <tr>
          <th style="width:110px;">Jam & Waktu</th>
          <th>Mata Pelajaran</th>
          <th>Guru Pengajar</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <datalist id="dl-teachers">${datalistOptions}</datalist>`;

  // Clear status
  const status = document.getElementById('schedule-save-status');
  if (status) status.textContent = '';
}

async function saveClassSchedule() {
  const classSelect = document.getElementById('sched-class-select');
  const daySelect   = document.getElementById('sched-day-select');
  const btn         = document.getElementById('btn-save-schedule');
  const status      = document.getElementById('schedule-save-status');
  if (!classSelect || !daySelect || !schoolData) return;

  const selectedClass = classSelect.value;
  const selectedDay   = daySelect.value;
  if (!selectedClass || !selectedDay) return;

  // Collect updated schedule items
  const updatedItems = [];
  for (let p = 1; p <= 10; p++) {
    const subjEl    = document.getElementById(`sched-subj-${p}`);
    const teacherEl = document.getElementById(`sched-teacher-${p}`);
    if (!subjEl || !teacherEl) continue;
    const subject = subjEl.value.trim();
    let teacher = teacherEl.value.trim();
    
    // Parse the code from "Budi Santoso, S.Pd (Fis01)"
    const match = teacher.match(/\(([^)]+)\)$/);
    if (match) {
        teacher = match[1];
    }

    // Only add if there is a subject
    if (subject) {
      updatedItems.push({
        period:  p,
        subject: subject,
        teacher: teacher || '-',
        room:    '-',
        time:    ADMIN_TIME_SLOTS[p] || '-',
      });
    }
  }

  // ── ANTI-BENTROK: Scan bentrok sebelum menyimpan ──────────────────
  const conflicts = detectScheduleConflicts(selectedClass, selectedDay, updatedItems);
  if (conflicts.length > 0) {
      let htmlMsg = `<p style="margin-bottom:10px;">Ditemukan <strong>${conflicts.length}</strong> potensi bentrok:</p><ul style="margin-left: 20px; margin-bottom: 15px; color: var(--text-muted);">`;
      conflicts.forEach(c => {
        htmlMsg += `<li><strong>${c.teacherDisplay}</strong> sudah terjadwal di <span style="color: #F43F5E;">${c.otherClass}</span> (${c.day}, Jam ke-${c.period})</li>`;
      });
      htmlMsg += `</ul><p>Apakah Anda tetap ingin melanjutkan penyimpanan? (Guru akan terhitung mengajar di dua kelas sekaligus).</p>`;
      
      const isConfirmed = await showConfirmModal('&#9888;&#65039; Peringatan Bentrok', htmlMsg);
      if (!isConfirmed) {
        if (status) {
          status.innerHTML = '&#9888;&#65039; Penyimpanan dibatalkan karena bentrok jadwal.';
          status.style.color = '#F43F5E';
          setTimeout(() => { if (status) status.textContent = ''; }, 5000);
        }
        return;
      }
    }
  // ─────────────────────────────────────────────────────────────────

  // Write back into schoolData
  if (!schoolData.schedules) schoolData.schedules = {};
  if (!schoolData.schedules[selectedClass]) schoolData.schedules[selectedClass] = {};
  schoolData.schedules[selectedClass][selectedDay] = updatedItems;

  // Persist to Firestore
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Menyimpan...'; }
  if (status) { status.textContent = ''; }

  await saveAdminOverrides();

  if (btn) { btn.disabled = false; btn.textContent = '💾 Simpan Jadwal ke Cloud'; }
  if (status) {
    status.textContent = `✅ Jadwal ${selectedClass} — ${selectedDay} berhasil diperbarui!`;
    status.style.color = '#34d399';
    setTimeout(() => { if (status) status.textContent = ''; }, 4000);
  }
}

// ── Anti-Bentrok: Deteksi tabrakan guru di kelas/hari/jam lain ──────
function detectScheduleConflicts(currentClass, currentDay, newItems) {
  const conflicts = [];
  if (!schoolData || !schoolData.schedules) return conflicts;

  // Buat lookup: teacherCode -> period untuk jadwal baru
  const newTeacherPeriods = {};
  newItems.forEach(item => {
    if (item.teacher && item.teacher !== '-') {
      const key = String(item.teacher).toLowerCase();
      if (!newTeacherPeriods[key]) newTeacherPeriods[key] = [];
      newTeacherPeriods[key].push(item.period);
    }
  });

  // Scan semua kelas lain
  for (const cls in schoolData.schedules) {
    if (cls === currentClass) continue; // Lewati kelas yang sedang diedit

    const daySchedule = schoolData.schedules[cls][currentDay];
    if (!daySchedule) continue;

    daySchedule.forEach(item => {
      if (!item.teacher || item.teacher === '-') return;
      const tKey = String(item.teacher).toLowerCase();
      if (newTeacherPeriods[tKey] && newTeacherPeriods[tKey].includes(item.period)) {
        // Resolve nama guru yang bisa dibaca manusia
        let teacherDisplay = item.teacher;
        if (schoolData.teachers) {
          const tObj = schoolData.teachers.find(t => String(t.subject).toLowerCase() === tKey);
          if (tObj) teacherDisplay = `${tObj.name} (${item.teacher})`;
        }
        conflicts.push({
          teacherDisplay,
          otherClass: cls,
          day: currentDay,
          period: item.period,
        });
      }
    });
  }

  return conflicts;
}

// ── Bulk Edit Schedules ────────────────────────
let bulkMatches = [];

function searchBulkSchedule() {
  const keyword = document.getElementById('bulk-search-input').value.trim().toLowerCase();
  const type = document.getElementById('bulk-search-type').value;
  const container = document.getElementById('bulk-results-container');
  const title = document.getElementById('bulk-results-title');
  const list = document.getElementById('bulk-results-list');
  
  // Ambil kelas yang sedang dipilih di dropdown Editor Jadwal
  const classSelect = document.getElementById('sched-class-select');
  const selectedClass = classSelect ? classSelect.value : '';
  
  if (!keyword || !schoolData || !schoolData.schedules) return;
  if (!selectedClass) {
    alert("Silakan pilih kelas terlebih dahulu di bagian Editor Jadwal Pelajaran.");
    return;
  }
  
  bulkMatches = [];
  const teachers = schoolData.teachers || [];
  
  // Hanya cari di kelas yang dipilih
  const cls = selectedClass;
  if (schoolData.schedules[cls]) {
    for (const day in schoolData.schedules[cls]) {
      const items = schoolData.schedules[cls][day];
      items.forEach((item, index) => {
        let valToSearch = '';
        let displayTeacher = item.teacher || '-';
        
        if (type === 'teacher') {
          // item.teacher menyimpan KODE (misal Sen03)
          // Kita cari di data guru untuk mendapatkan nama aslinya
          const tObj = teachers.find(t => t.subject === item.teacher);
          if (tObj) {
            valToSearch = `${tObj.name} (${tObj.subject})`;
            displayTeacher = valToSearch;
          } else {
            valToSearch = item.teacher;
          }
        } else {
          valToSearch = item.subject;
        }
        
        if (valToSearch && valToSearch.toLowerCase().includes(keyword)) {
          bulkMatches.push({
             cls, day, period: item.period, itemIndex: index, subject: item.subject, teacher: item.teacher, displayTeacher
          });
        }
      });
    }
  }
  
  if (bulkMatches.length > 0) {
    title.textContent = `Ditemukan ${bulkMatches.length} jadwal di kelas ${cls}:`;
    let html = '';
    bulkMatches.forEach((m, idx) => {
      html += `
        <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; padding:4px 0; border-bottom:1px solid var(--border); cursor:pointer;">
          <input type="checkbox" class="bulk-match-cb" value="${idx}" checked>
          <span><strong>${m.cls}</strong> (${m.day}, Jam ${m.period}) — Mapel: <span style="color:var(--text-head); font-weight:600;">${m.subject}</span>, Guru: <span style="color:var(--text-head); font-weight:600;">${m.displayTeacher}</span></span>
        </label>
      `;
    });
    list.innerHTML = html;
    container.style.display = 'block';
  } else {
    title.textContent = `Tidak ditemukan jadwal dengan keyword "${keyword}" di kelas ${cls}`;
    list.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">Pastikan nama/kode yang Anda cari sesuai dengan yang terdaftar di kelas ini.</p>';
    container.style.display = 'block';
  }
}

function toggleAllBulkResults(cb) {
  const boxes = document.querySelectorAll('.bulk-match-cb');
  boxes.forEach(b => b.checked = cb.checked);
}

async function executeBulkReplace() {
  let replaceStr = document.getElementById('bulk-replace-input').value.trim();
  const type = document.getElementById('bulk-search-type').value;
  
  if (!replaceStr) {
    alert("Mohon masukkan nilai pengganti (Nama Guru/Mapel Baru)!");
    return;
  }
  
  const boxes = document.querySelectorAll('.bulk-match-cb:checked');
  if (boxes.length === 0) {
    alert("Pilih minimal satu jadwal yang ingin diganti (centang kotaknya).");
    return;
  }
  
  if (type === 'teacher') {
    // Ekstrak kode guru jika user menginput format lengkap "Nama (Kode)"
    const match = replaceStr.match(/\(([^)]+)\)$/);
    if (match) {
        replaceStr = match[1]; // Simpan kodenya saja ke memory
    }
  }

  // ── ANTI-BENTROK: Cek bentrok untuk setiap jadwal yang akan diganti ──
  if (type === 'teacher') {
    const bulkConflicts = [];
    const teacherKey = replaceStr.toLowerCase();
    
    boxes.forEach(b => {
      const idx = parseInt(b.value);
      const m = bulkMatches[idx];
      
      // Scan kelas lain pada hari dan jam yang sama
      for (const cls in schoolData.schedules) {
        if (cls === m.cls) continue;
        const daySchedule = schoolData.schedules[cls][m.day];
        if (!daySchedule) continue;
        
        daySchedule.forEach(item => {
          if (!item.teacher || item.teacher === '-') return;
          if (String(item.teacher).toLowerCase() === teacherKey && item.period === m.period) {
            let teacherDisplay = replaceStr;
            if (schoolData.teachers) {
              const tObj = schoolData.teachers.find(t => String(t.subject).toLowerCase() === teacherKey);
              if (tObj) teacherDisplay = `${tObj.name} (${replaceStr})`;
            }
            bulkConflicts.push({
              teacherDisplay,
              sourceClass: m.cls,
              otherClass: cls,
              day: m.day,
              period: m.period,
            });
          }
        });
      }
    });

    if (bulkConflicts.length > 0) {
        let htmlMsg = `<p style="margin-bottom:10px;">Guru pengganti ini sudah terjadwal di:</p><ul style="margin-left: 20px; margin-bottom: 15px; color: var(--text-muted);">`;
        bulkConflicts.forEach(c => {
          htmlMsg += `<li><strong>${c.teacherDisplay}</strong> di <span style="color: #F43F5E;">${c.otherClass}</span> (${c.day}, Jam ke-${c.period})</li>`;
        });
        htmlMsg += `</ul><p>Apakah Anda tetap ingin melanjutkan penerapan perubahan secara massal?</p>`;
        
        const isConfirmed = await showConfirmModal('&#9888;&#65039; Peringatan Bentrok', htmlMsg);
        if (!isConfirmed) return;
      }
  }
  // ─────────────────────────────────────────────────────────────────
  
  if (!confirm(`Yakin ingin menerapkan perubahan pada ${boxes.length} jadwal tersebut? (Klik 'Simpan Jadwal ke Cloud' nanti untuk mempermanenkan)`)) return;
  
  boxes.forEach(b => {
    const idx = parseInt(b.value);
    const m = bulkMatches[idx];
    if (type === 'teacher') {
      schoolData.schedules[m.cls][m.day][m.itemIndex].teacher = replaceStr;
    } else {
      schoolData.schedules[m.cls][m.day][m.itemIndex].subject = replaceStr;
    }
  });
  
  alert(`Berhasil menerapkan perubahan pada ${boxes.length} jadwal!\n\nPENTING: Perubahan masih di memori lokal. Jangan lupa klik tombol biru "Simpan Jadwal ke Cloud" di atas untuk mempermanenkannya.`);
  
  document.getElementById('bulk-replace-input').value = '';
  document.getElementById('bulk-results-container').style.display = 'none'; // Sembunyikan hasil
  if(document.getElementById('sched-class-select').value) {
    renderScheduleEditor(); // Refresh editor UI agar terlihat perubahannya
  }
}

function switchAdminTab(tabName) {
  const tabs = document.querySelectorAll('.admin-tab');
  const sections = document.querySelectorAll('.admin-section');

  tabs.forEach(t => t.classList.remove('active'));
  sections.forEach(s => s.classList.remove('active'));

  document.querySelector(`[onclick="switchAdminTab('${tabName}')"]`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');

  if (tabName === 'analytics') {
    initAnalyticsChart();
  }
  if (tabName === 'schedules') {
    initScheduleClassDropdown();
    renderScheduleEditor();
  }
}

function initScheduleClassDropdown() {
  const sel = document.getElementById('sched-class-select');
  if (!sel || !schoolData || !schoolData.classes) return;
  if (sel.options.length > 0) return; // already populated
  schoolData.classes.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = cls;
    sel.appendChild(opt);
  });
}

// ── 1. Announcements Management ────────────────
function renderAdminAnnouncements() {
  const container = document.getElementById('admin-announcement-list');
  if (!schoolData || !schoolData.announcements) return;

  let html = `
    <table style="width:100%; border-collapse:collapse; font-size:0.85rem; color:var(--text-body);">
      <thead>
        <tr style="border-bottom:2px solid var(--border); text-align:left; color:var(--text-muted);">
          <th style="padding:8px;">Judul</th>
          <th style="padding:8px;">Kategori</th>
          <th style="padding:8px;">Tanggal</th>
          <th style="padding:8px;">Aksi</th>
        </tr>
      </thead>
      <tbody>
  `;

  schoolData.announcements.forEach((ann, idx) => {
    html += `
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:10px 8px; font-weight:600; color:var(--text-head);">${ann.title}</td>
        <td style="padding:10px 8px;"><span class="ann-tag">${ann.category}</span></td>
        <td style="padding:10px 8px; color:var(--text-muted);">${ann.date}</td>
        <td style="padding:10px 8px;">
          <button onclick="deleteAnnouncement(${idx})" class="btn-danger" style="padding:4px 8px; font-size:0.75rem;">Hapus</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

async function handleAddAnnouncement(e) {
  e.preventDefault();
  const title = document.getElementById('ann-title').value.trim();
  const date = document.getElementById('ann-date').value;
  const category = document.getElementById('ann-category').value;
  const content = document.getElementById('ann-content').value.trim();

  if (!title || !date || !content) return;

  const newAnn = {
    id: Date.now(),
    title,
    date,
    category,
    content
  };

  schoolData.announcements.unshift(newAnn);
  saveAdminOverrides();
  renderAdminAnnouncements();

  document.getElementById('form-add-announcement').reset();
  await showConfirmModal('&#9989; Berhasil', 'Pengumuman baru berhasil ditambahkan! Perubahan akan tampil di portal siswa.', true);
}

async function deleteAnnouncement(idx) {
  const isConfirmed = await showConfirmModal('&#9888;&#65039; Konfirmasi Hapus', 'Yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.', false, 'Ya, Hapus');
    if (isConfirmed) {
    schoolData.announcements.splice(idx, 1);
    saveAdminOverrides();
    renderAdminAnnouncements();
  }
}

// ── 2. Teachers Management ─────────────────────
function renderAdminTeachers() {
  const container = document.getElementById('admin-teacher-list');
  if (!schoolData || !schoolData.teachers) return;

  let html = `
    <table style="width:100%; border-collapse:collapse; font-size:0.85rem; color:var(--text-body);">
      <thead>
        <tr style="border-bottom:2px solid var(--border); text-align:left; color:var(--text-muted);">
          <th style="padding:8px;">Nama Guru</th>
          <th style="padding:8px;">Mapel</th>
          <th style="padding:8px;">Aksi</th>
        </tr>
      </thead>
      <tbody>
  `;

  schoolData.teachers.forEach((t, idx) => {
    html += `
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:10px 8px; font-weight:600; color:var(--text-head);">${t.name}</td>
        <td style="padding:10px 8px;">${t.subject}</td>
        <td style="padding:10px 8px;">
          <button onclick="deleteTeacher(${idx})" class="btn-danger" style="padding:4px 8px; font-size:0.75rem;">Hapus</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

async function handleAddTeacher(e) {
  e.preventDefault();
  const name = document.getElementById('teacher-name').value.trim();
  const subject = document.getElementById('teacher-subject').value.trim();
  const contact = document.getElementById('teacher-contact').value.trim();

  if (!name || !subject) return;

  schoolData.teachers.push({ name, subject, room: '-', contact });
  saveAdminOverrides();
  renderAdminTeachers();

  document.getElementById('form-add-teacher').reset();
  await showConfirmModal('&#9989; Berhasil', 'Data guru berhasil ditambahkan! Perubahan akan tampil di portal siswa.', true);
}

async function deleteTeacher(idx) {
  const isConfirmed = await showConfirmModal('&#9888;&#65039; Konfirmasi Hapus', 'Yakin ingin menghapus data guru ini? Tindakan ini tidak dapat dibatalkan.', false, 'Ya, Hapus');
    if (isConfirmed) {
    schoolData.teachers.splice(idx, 1);
    saveAdminOverrides();
    renderAdminTeachers();
  }
}

// ── 3. Analytics Chart ─────────────────────────
let _analyticsUnsubscribe = null;

function initAnalyticsChart() {
  const canvas = document.getElementById('analyticsChart');
  if (!canvas) return;

  const CATEGORIES = ["Jadwal Pelajaran", "Guru & Ruangan", "Ujian & Libur", "Tata Tertib", "Pengumuman", "Profil & Ekskul", "Lain-lain"];
  const defaultData = { "Jadwal Pelajaran": 0, "Guru & Ruangan": 0, "Ujian & Libur": 0, "Tata Tertib": 0, "Pengumuman": 0, "Profil & Ekskul": 0, "Lain-lain": 0 };

  function renderChart(dataObj) {
    const labels = CATEGORIES;
    const values = CATEGORIES.map(cat => dataObj[cat] || 0);

    if (analyticsChart) {
      // Update existing chart data (smoother than destroying)
      analyticsChart.data.labels = labels;
      analyticsChart.data.datasets[0].data = values;
      analyticsChart.update();
      return;
    }

    const ctx = canvas.getContext('2d');
    analyticsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Frekuensi Pertanyaan Siswa',
          data: values,
          backgroundColor: ['#06B6D4', '#3B82F6', '#8B5CF6', '#10B981', '#F43F5E', '#F97316', '#94A3B8'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(255,255,255,0.05)' }, 
            ticks: { color: '#94A3B8', precision: 0 } 
          },
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  // Try Firestore real-time listener first
  if (typeof db !== 'undefined') {
    // Unsubscribe previous listener to avoid duplicates
    if (_analyticsUnsubscribe) _analyticsUnsubscribe();

    _analyticsUnsubscribe = db.collection('edusmansa').doc('analytics').onSnapshot(
      (docSnap) => {
        const data = docSnap.exists ? { ...defaultData, ...docSnap.data() } : { ...defaultData };
        renderChart(data);
      },
      (err) => {
        console.warn('Analytics Firestore error, fallback to localStorage:', err);
        // Fallback to localStorage if listener fails
        const saved = localStorage.getItem(ANALYTICS_KEY);
        try { renderChart(saved ? JSON.parse(saved) : defaultData); } catch(e) { renderChart(defaultData); }
      }
    );
  } else {
    // No Firestore — use localStorage
    const saved = localStorage.getItem(ANALYTICS_KEY);
    try { renderChart(saved ? JSON.parse(saved) : defaultData); } catch(e) { renderChart(defaultData); }
  }

  // Handle Reset Button Custom UI
  const btnReset = document.getElementById('btn-reset-analytics');
  const resetModal = document.getElementById('modal-confirm-reset');
  const btnCancelReset = document.getElementById('btn-cancel-reset');
  const btnDoReset = document.getElementById('btn-do-reset');

  if (btnReset && resetModal && btnCancelReset && btnDoReset) {
    // Tampilkan modal custom saat tombol diklik
    btnReset.onclick = () => {
      resetModal.style.display = 'flex';
    };

    // Tutup modal jika batal
    btnCancelReset.onclick = () => {
      resetModal.style.display = 'none';
    };

    // Eksekusi reset jika dikonfirmasi
    btnDoReset.onclick = async () => {
      btnDoReset.disabled = true;
      btnDoReset.textContent = 'Mereset...';
      
      if (typeof db !== 'undefined') {
        try {
          await db.collection('edusmansa').doc('analytics').set(defaultData);
        } catch (err) {
          alert('❌ Gagal mereset data di Cloud: ' + err.message);
        }
      }
      
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(defaultData));
      renderChart(defaultData);
      
      resetModal.style.display = 'none';
      btnDoReset.disabled = false;
      btnDoReset.textContent = 'Ya, Reset Data';
    };
  }
}

// ── 4. Import / Export / Reset ─────────────────
function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schoolData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `EduSmansa_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed.schoolInfo && parsed.schedules) {
        schoolData = parsed;
        saveData();
        renderAdminAnnouncements();
        renderAdminTeachers();
        alert('✅ Database sekolah berhasil diperbarui dari file JSON!');
      } else {
        alert('❌ File JSON tidak valid. Format data sekolah tidak cocok.');
      }
    } catch(err) {
      alert('❌ Gagal membaca file JSON.');
    }
  };
  reader.readAsText(file);
}

async function resetDefaultData() {
  const isConfirmed = await showConfirmModal('&#9888;&#65039; Konfirmasi Reset', 'Apakah kamu yakin ingin mengembalikan seluruh data ke standar awal SMAN 1 Sumedang? Semua pengumuman dan perubahan guru yang disimpan akan hilang.', false, 'Ya, Reset');
  if (isConfirmed) {
    // 1. Fetch JSON default lokal
    fetch('data/school_data.json')
      .then(res => res.json())
      .then(async (defaultData) => {
        // 2. Timpa data di memory
        schoolData = defaultData;
        // 3. Simpan ke Firestore
        await saveData();
        alert('✅ Database telah direset ke data default awal.');
        location.reload();
      })
      .catch(err => {
        console.error(err);
        alert('❌ Gagal mereset data: ' + err.message);
      });
  }
}


// ==============================================================
// Custom Promise-based Confirm Modal
// ==============================================================
function showConfirmModal(titleHtml, messageHtml, isAlertOnly = false, okText = 'Tetap Lanjutkan') {
  return new Promise((resolve) => {
    const overlay = document.getElementById('modal-custom-confirm');
    const titleEl = document.getElementById('modal-custom-title');
    const msgEl = document.getElementById('modal-custom-message');
    const btnCancel = document.getElementById('btn-custom-cancel');
    const btnOk = document.getElementById('btn-custom-ok');

    if (!overlay) {
      resolve(confirm(messageHtml.replace(/<[^>]+>/g, '')));
      return;
    }

    titleEl.innerHTML = titleHtml;
    msgEl.innerHTML = messageHtml;
    
    if (isAlertOnly) {
      btnCancel.style.display = 'none';
      btnOk.textContent = 'Tutup';
      btnOk.style.background = '#3B82F6';
    } else {
      btnCancel.style.display = 'inline-block';
      btnOk.textContent = okText;
      btnOk.style.background = '#F43F5E';
    }
    
    overlay.style.display = 'flex';

    const cleanup = () => {
      overlay.style.display = 'none';
      btnCancel.removeEventListener('click', onCancel);
      btnOk.removeEventListener('click', onOk);
    };

    const onCancel = () => { cleanup(); resolve(false); };
    const onOk = () => { cleanup(); resolve(true); };

    btnCancel.addEventListener('click', onCancel);
    btnOk.addEventListener('click', onOk);
  });
}
