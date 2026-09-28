// ai-studio.js (Fase 5: Full Stack Client-Server Mode)

// 1. Generate Daftar 36 Kelas (X-1 s/d XII-12)
const allClasses = [];
for(let i=1; i<=12; i++) allClasses.push(`X-${i}`);
for(let i=1; i<=12; i++) allClasses.push(`XI-${i}`);
for(let i=1; i<=12; i++) allClasses.push(`XII-${i}`);

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const PERIODS_PER_DAY = { 'Senin': 10, 'Selasa': 10, 'Rabu': 10, 'Kamis': 10, 'Jumat': 10 };
const TIME_SLOTS = {
  'Senin': { 1: '06:50 - 07:30', 2: '07:30 - 08:10', 3: '08:10 - 08:50', 4: '08:50 - 09:30', 5: '10:00 - 10:40', 6: '10:40 - 11:20', 7: '11:20 - 12:00', 8: '12:30 - 13:10', 9: '13:10 - 13:50', 10: '13:50 - 14:30' },
  'Selasa': { 1: '06:50 - 07:30', 2: '07:30 - 08:10', 3: '08:10 - 08:50', 4: '08:50 - 09:30', 5: '10:00 - 10:40', 6: '10:40 - 11:20', 7: '11:20 - 12:00', 8: '12:30 - 13:10', 9: '13:10 - 13:50', 10: '13:50 - 14:30' },
  'Rabu': { 1: '06:50 - 07:30', 2: '07:30 - 08:10', 3: '08:10 - 08:50', 4: '08:50 - 09:30', 5: '10:00 - 10:40', 6: '10:40 - 11:20', 7: '11:20 - 12:00', 8: '12:30 - 13:10', 9: '13:10 - 13:50', 10: '13:50 - 14:30' },
  'Kamis': { 1: '06:50 - 07:30', 2: '07:30 - 08:10', 3: '08:10 - 08:50', 4: '08:50 - 09:30', 5: '10:00 - 10:40', 6: '10:40 - 11:20', 7: '11:20 - 12:00', 8: '12:30 - 13:10', 9: '13:10 - 13:50', 10: '13:50 - 14:30' },
  'Jumat': { 1: '06:50 - 07:30', 2: '07:30 - 08:10', 3: '08:10 - 08:50', 4: '08:50 - 09:30', 5: '10:00 - 10:40', 6: '10:40 - 11:20', 7: '11:20 - 12:00', 8: '13:00 - 13:40', 9: '13:40 - 14:20', 10: '14:20 - 15:00' }
};

let globalTeacherMap = {};

const fullCurriculum = [
  { subject: 'Pend. Agama', code: 'PAI', jp: 3 },
  { subject: 'PPKn', code: 'PKn', jp: 2 },
  { subject: 'B. Indonesia', code: 'Ind', jp: 4 },
  { subject: 'Matematika Wajib', code: 'Mat', jp: 4 },
  { subject: 'Sejarah Indo', code: 'Sej', jp: 2 },
  { subject: 'B. Inggris', code: 'Ing', jp: 2 },
  { subject: 'Seni Budaya', code: 'Sen', jp: 2 },
  { subject: 'PJOK', code: 'Pjk', jp: 3 },
  { subject: 'Prakarya', code: 'Pkw', jp: 2 },
  { subject: 'Matematika Minat', code: 'MatM', jp: 3 }, // Dikurangi 1 agar pas
  { subject: 'Fisika', code: 'Fis', jp: 3 },
  { subject: 'Kimia', code: 'Kim', jp: 3 },
  { subject: 'Biologi', code: 'Bio', jp: 3 },
  { subject: 'Lintas Minat 1', code: 'Lm1', jp: 2 }, // Dikurangi 1 agar pas
  { subject: 'Bimbingan Konseling', code: 'BK', jp: 1 },
  { subject: 'Muatan Lokal', code: 'Mul', jp: 1 } // Dikurangi 1 agar pas
];

let globalSchedule = {};

// === TERMINAL LOGGER SYSTEM ===
function logTerminal(message, type = 'normal') {
  const terminalBody = document.getElementById('terminal-log');
  const cursorLine = document.getElementById('terminal-cursor-line');
  if (!terminalBody) return;
  const div = document.createElement('div');
  div.className = 'log-line';
  if (type === 'sys') div.classList.add('log-sys');
  if (type === 'err') div.classList.add('log-err');
  if (type === 'warn') div.classList.add('log-warn');
  div.textContent = message;
  
  if (cursorLine) terminalBody.insertBefore(div, cursorLine);
  else terminalBody.appendChild(div);
  
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
  const terminalBody = document.getElementById('terminal-log');
  terminalBody.innerHTML = '<div id="terminal-cursor-line">> <span class="cursor-blink"></span></div>';
  logTerminal('[SYS] Web Klien AI Engine v4.0 siap.', 'sys');
  logTerminal('[INFO] Algoritma dialihkan ke Backend Python (Port 5000).', 'sys');

  const btnGenerate = document.querySelector('.btn-generate');
  if (btnGenerate) {
    btnGenerate.addEventListener('click', async () => {
      btnGenerate.disabled = true;
      btnGenerate.innerHTML = 'Mengirim ke Server... â³';
      
      logTerminal('------------------------------------------------');
      logTerminal('[CMD] Menyusun kurikulum untuk dikirim ke AI Server...');
      
      await sendToPythonServer();
      
      btnGenerate.disabled = false;
      btnGenerate.innerHTML = 'Mulai Auto-Generate 🚀';
    });
  }
});

async function sendToPythonServer() {
  const rules = {
    ko_x: document.getElementById('chk-ko-x') ? document.getElementById('chk-ko-x').checked : true,
    jumat_7: document.getElementById('chk-jumat-7') ? document.getElementById('chk-jumat-7').checked : true,
    gw_rabu: document.getElementById('chk-gw-rabu') ? document.getElementById('chk-gw-rabu').checked : true,
    ko_xi: document.getElementById('chk-ko-xi') ? document.getElementById('chk-ko-xi').checked : true,
    allow_3jp: document.getElementById('chk-allow3jp') ? document.getElementById('chk-allow3jp').checked : false
  };
  logTerminal(`[CMD] Menyedot beban mengajar asli dari data V2 (school_data.json)...`);
  let jobs = [];
  try {
    const res = await fetch('data/school_data.json');
    const realData = await res.json();
      if (realData.teachers) { realData.teachers.forEach(t => { globalTeacherMap[t.subject] = t.name; }); }
    
    // Ekstrak beban kerja tiap guru dari data asli V2
    for (const c of allClasses) {
      let classJobs = {};
      if (realData.schedules[c]) {
        for (const d of DAYS) {
          if (realData.schedules[c][d]) {
            for (const item of realData.schedules[c][d]) {
              // Kita hanya abaikan Ko(11), Ko(12), UPACARA, dan jam kosong ('-') karena sudah diurus Python
              if (item.subject === 'UPACARA' || item.subject === 'Ko(11)' || item.subject === 'Ko(12)' || item.subject === '-') continue;
              
              const subj = item.subject;
              const teacher = item.teacher || '-';
              const key = subj + "|||" + teacher;
              if (!classJobs[key]) classJobs[key] = 0;
              classJobs[key]++;
            }
          }
        }
      }
      // Ubah jadi format blok (Prioritaskan 2 JP dan 1 JP agar packing matematis tidak buntu)
      for (const [key, jpTotal] of Object.entries(classJobs)) {
        const [subj, teacher] = key.split("|||");
        let remainingJP = jpTotal;
          while (remainingJP > 0) {
            if (remainingJP >= 4) {
              jobs.push({ class_name: c, subject: subj, teacher: teacher, jp: 2 });
              remainingJP -= 2;
            } else if (remainingJP === 3) {
              if (subj.startsWith('Ko(')) {
                jobs.push({ class_name: c, subject: subj, teacher: teacher, jp: 2 });
                remainingJP -= 2;
              } else if (rules.allow_3jp) {
                jobs.push({ class_name: c, subject: subj, teacher: teacher, jp: 3 });
                remainingJP -= 3;
              } else {
                jobs.push({ class_name: c, subject: subj, teacher: teacher, jp: 2 });
                remainingJP -= 2;
              }
            } else if (remainingJP === 2) {
              jobs.push({ class_name: c, subject: subj, teacher: teacher, jp: 2 });
              remainingJP -= 2;
            } else {
              jobs.push({ class_name: c, subject: subj, teacher: teacher, jp: 1 });
              remainingJP -= 1;
            }
          }
      }
      // Suntik GW untuk X-1 jika belum ada
      if (c === 'X-1' && !classJobs['GW|||-']) {
        jobs.push({ class_name: 'X-1', subject: 'GW', teacher: '-', jp: 1 });
      }
    }
    logTerminal(`[INFO] Berhasil mengekstrak ${jobs.length} blok pelajaran asli dari V2.`);

    // ====== SAKLAR MASTER 1: Custom Kurikulum ======
    const useCustomCurr = document.getElementById('chk-use-curriculum')?.checked;
    if (useCustomCurr) {
      let savedCurr = {};
      try { const r = localStorage.getItem('customCurriculum'); if (r) savedCurr = JSON.parse(r); } catch(e) {}
      if (Object.keys(savedCurr).length > 0) {
        logTerminal('[CMD] Menerapkan Custom Kurikulum dari Tab Mapel & Kelas...');
        // Hapus jobs yang mapelnya ada di custom untuk kelas terkait, lalu tambahkan dari custom
        const newJobs = [];
        for (const c of allClasses) {
          const grade = c.startsWith('XI-') ? 'XI-' : c.startsWith('XII-') ? 'XII-' : 'X';
          const key = (grade === 'X') ? 'X' : c; // Kelas X pakai master 'X', lainnya per kelas
          const currForClass = savedCurr[key];
          if (!currForClass) {
            // Tidak ada custom untuk kelas ini, pakai jobs asli
            jobs.filter(j => j.class_name === c).forEach(j => newJobs.push(j));
            continue;
          }
          // Ambil daftar teacher dari jobs asli untuk kelas ini sebagai referensi
          const teacherRef = {};
          jobs.filter(j => j.class_name === c).forEach(j => { teacherRef[j.subject] = j.teacher; });
          // Buat jobs baru dari custom JP
          for (const [subj, jpTotal] of Object.entries(currForClass)) {
            const teacher = teacherRef[subj] || '-';
            let rem = jpTotal;
            while (rem > 0) {
              if (rem >= 4) { newJobs.push({ class_name: c, subject: subj, teacher, jp: 2 }); rem -= 2; }
              else if (rem === 3) {
                if (rules.allow_3jp) { newJobs.push({ class_name: c, subject: subj, teacher, jp: 3 }); rem -= 3; }
                else { newJobs.push({ class_name: c, subject: subj, teacher, jp: 2 }); rem -= 2; }
              }
              else if (rem === 2) { newJobs.push({ class_name: c, subject: subj, teacher, jp: 2 }); rem -= 2; }
              else { newJobs.push({ class_name: c, subject: subj, teacher, jp: 1 }); rem -= 1; }
            }
          }
        }
        jobs = newJobs;
        logTerminal(`[INFO] Custom Kurikulum diterapkan. Total blok baru: ${jobs.length}`);
      }
    }

    // ====== SAKLAR MASTER 2: Custom Teacher Prefs (Hari Libur/Sibuk) ======
    const useTeacherPrefs = document.getElementById('chk-use-teacher-prefs')?.checked;
    if (useTeacherPrefs) {
      let savedPrefs = {};
      try { const r = localStorage.getItem('teacherPrefs'); if (r) savedPrefs = JSON.parse(r); } catch(e) {}
      if (Object.keys(savedPrefs).length > 0) {
        logTerminal('[CMD] Mengirim preferensi hari libur guru ke Server Python...');
        // teacher_day_off: { "Eko02": ["Senin","Rabu"], ... }
        rules.teacher_day_off = {};
        for (const [code, pref] of Object.entries(savedPrefs)) {
          if (pref.daysOff && pref.daysOff.length > 0) {
            rules.teacher_day_off[code] = pref.daysOff;
          }
        }
      }
    }

  } catch (err) {
    logTerminal(`[ERROR] Gagal membaca data/school_data.json: ${err.message}`, 'err');
    return;
  }


  const payload = { classes: allClasses, jobs: jobs, rules: rules };

  logTerminal(`[NETWORK] Menghubungi Server AI...`);
  logTerminal(`[PROCESS] Server sedang berfikir... Ini bisa memakan waktu hingga 15 menit. Tunggu!`);
  
  try {
    const startTime = performance.now();
    // GANTI LINK DI BAWAH DENGAN LINK DARI HUGGING FACE SAAT DEPLOY
    const API_URL = 'http://localhost:7860/solve'; 
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error("Server Python bermasalah atau mati.");
    
    const data = await response.json();
    const endTime = performance.now();
    
    if (data.status === 'success') {
      logTerminal(`[SUCCESS] Jadwal sempurna ditemukan oleh Server Python!`, 'sys');
      logTerminal(`[METRIC] Waktu komputasi server: ${((endTime - startTime)/1000).toFixed(2)} detik`);
      globalSchedule = data.schedule;
      renderScheduleResult();
    } else {
      logTerminal(`[ERROR] Server merespon: ${data.message}`, 'err');
    }
  } catch (error) {
    logTerminal(`[ERROR] Koneksi terputus: ${error.message}`, 'err');
    logTerminal(`[INFO] Pastikan skrip 'python solver.py' sedang menyala di terminal Anda!`, 'warn');
  }
}

function renderScheduleResult() {
  const resultContent = document.getElementById("result-content");
  if(!resultContent) return;
  const toolbar = document.getElementById("toolbar");
  if(toolbar) toolbar.style.display = "flex";
  let html = window.renderDashboard() + "<div style=\"overflow-x: auto; width: 100%; padding-bottom: 20px;\"><div class=\"schedule-grid\" style=\"display: flex; gap: 20px;\">";
  const displayClasses = allClasses;
  for(const c of displayClasses) {
    html += `<div style="min-width: 300px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;">
        <div style="background: var(--navy); color: white; padding: 10px; text-align: center; font-weight: 700;">Kelas ${c}</div>
        <div style="padding: 10px; background: white;">`;
    
    for(const d of DAYS) {
      html += `<div style="font-size: 0.8rem; font-weight: 800; margin-top: 10px; color: var(--navy-light); border-bottom: 1px solid #eee; padding-bottom: 4px;">${d}</div>`;
      for(let p = 1; p <= PERIODS_PER_DAY[d]; p++) {
        const cell = globalSchedule[c][d][p - 1]; // Array dari python indexnya 0-based
        if (cell) {
          let badgeColor = cell.teacher === '-' ? 'background: #FEE2E2; color: #EF4444;' : 'background: #F1F5F9; color: #334155;';
          if (cell.subject === 'UPACARA' || cell.subject.includes('SHOLAT')) badgeColor = 'background: #FEF3C7; color: #D97706;';
          if (cell.subject.startsWith('Ko(')) badgeColor = 'background: #FEF3C7; color: #D97706;';
          html += `<div class="drop-zone" data-class="${c}" data-day="${d}" data-period="${p}" ondrop="dropSlot(event)" ondragover="allowDrop(event)" style="display: flex; gap: 8px; font-size: 0.75rem; padding: 4px 0; border-bottom: 1px dashed #f1f1f1; min-height: 28px; transition: background 0.2s;">
              <span style="font-weight: 600; width: 35px;">Jam ${p}</span>
              <span class="drag-item" draggable="true" ondragstart="dragSlot(event)" data-class="${c}" data-day="${d}" data-period="${p}" style="flex: 1; padding: 2px 6px; border-radius: 4px; ${badgeColor} font-weight: 600; cursor: grab;">
                ${cell.subject} ${cell.teacher !== '-' ? `(<b>${globalTeacherMap[cell.teacher] || cell.teacher}</b>)` : ''}
              </span>
            </div>`;
        } else {
          html += `<div class="drop-zone" data-class="${c}" data-day="${d}" data-period="${p}" ondrop="dropSlot(event)" ondragover="allowDrop(event)" style="display: flex; gap: 8px; font-size: 0.75rem; padding: 4px 0; border-bottom: 1px dashed #f1f1f1; min-height: 28px; transition: background 0.2s;">
              <span style="font-weight: 600; width: 35px; color: #cbd5e1;">Jam ${p}</span>
              <span class="drag-item" draggable="true" ondragstart="dragSlot(event)" data-class="${c}" data-day="${d}" data-period="${p}" style="flex: 1; padding: 2px 6px; color: #94a3b8; font-style: italic; cursor: grab;">Kosong</span>
            </div>`;
        }
      }
    }
    html += `</div></div>`;
  }
  html += `</div></div>`;
  resultContent.innerHTML = html;
}

// === EXPORT TO JSON ===
window.exportToJSONFile = function() {
  const finalJson = { classes: allClasses, schedules: {} };
  for(const c of allClasses) {
    finalJson.schedules[c] = {};
    for(const d of DAYS) {
      finalJson.schedules[c][d] = [];
      for(let p = 1; p <= PERIODS_PER_DAY[d]; p++) {
        const cell = globalSchedule[c][d][p-1];
        if (cell) {
          finalJson.schedules[c][d].push({
            subject: cell.subject,
            teacher: cell.teacher,
            period: p,
            time: TIME_SLOTS[d][p],
            room: "-"
          });
        }
      }
    }
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalJson, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "school_data_ai.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
// === FILTER GURU ===
window.filterTeacher = function() {
  const keyword = document.getElementById('teacher-search').value.toLowerCase();
  const classes = document.querySelectorAll('.schedule-grid > div');
  
  classes.forEach(c => {
    let hasTeacher = false;
    const cells = c.querySelectorAll('span');
    cells.forEach(cell => {
      // Reset semua style ke kondisi awal
      cell.style.background = '';
      cell.style.color = '';
      cell.style.borderRadius = '';
      cell.style.boxShadow = 'none';
      cell.style.transform = 'none';
      cell.style.zIndex = 'auto';
      cell.style.position = '';
      
      if (keyword && cell.innerText.toLowerCase().includes(keyword)) {
        hasTeacher = true;
        // Background biru, teks putih
        cell.style.background = '#1D4ED8';
        cell.style.color = '#FFFFFF';
        cell.style.borderRadius = '4px';
        cell.style.boxShadow = '0 2px 8px rgba(29,78,216,0.4)';
        cell.style.zIndex = '10';
        cell.style.position = 'relative';
      }
    });
    
    if (keyword) {
      if (hasTeacher) {
        c.style.opacity = '1';
      } else {
        c.style.opacity = '0.2';
      }
    } else {
      c.style.opacity = '1';
    }
  });
}

// === EXPORT TO EXCEL ===
window.exportToExcel = function() {
  if (typeof XLSX === 'undefined') {
    alert('Library Excel sedang dimuat, coba beberapa saat lagi.');
    return;
  }
  
  const wb = XLSX.utils.book_new();
  
  for (const c of allClasses) {
    const wsData = [];
    wsData.push(['Hari', 'Jam Ke', 'Waktu', 'Mata Pelajaran', 'Kode Guru']);
    
    for (const d of DAYS) {
      for (let p = 1; p <= PERIODS_PER_DAY[d]; p++) {
        const cell = globalSchedule[c][d][p-1];
        if (cell) {
          wsData.push([d, p, TIME_SLOTS[d][p], cell.subject, cell.teacher]);
        } else {
          wsData.push([d, p, TIME_SLOTS[d][p], 'Kosong', '-']);
        }
      }
      wsData.push(['', '', '', '', '']); // Pemisah hari
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Kelas ' + c);
  }
  
  XLSX.writeFile(wb, 'Jadwal_AI_SMANSA.xlsx');
}
// === EXPORT TO PDF (html2pdf) ===
window.downloadPDF = function() {
  const element = document.querySelector('.schedule-grid').parentElement;
  
  // Clone element untuk memodifikasi styling tanpa merusak tampilan asli
  const clone = element.cloneNode(true);
  clone.style.width = '1200px'; 
  const grid = clone.querySelector('.schedule-grid');
  grid.style.flexWrap = 'wrap'; // Paksa turun ke bawah
  grid.style.justifyContent = 'center';
  
  // Simpan di div sementara tersembunyi
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(clone);
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);
  
  const opt = {
      margin:       0.5,
      filename:     'Jadwal_SMANSA_AI.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'legal', orientation: 'landscape' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };
  
  html2pdf().set(opt).from(clone).save().then(() => {
    document.body.removeChild(tempDiv);
  });
}
// === FITUR DRAG AND DROP ===
let dragSource = null;

window.dragSlot = function(ev) {
  dragSource = ev.target;
  ev.dataTransfer.effectAllowed = 'move';
  ev.dataTransfer.setData('text/html', ev.target.innerHTML);
}

window.allowDrop = function(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'move';
}

window.dropSlot = function(ev) {
  ev.preventDefault();
  let dropZone = ev.currentTarget;
  let dropTarget = dropZone.querySelector('.drag-item');
  
  if (dragSource && dropTarget && dragSource !== dropTarget) {
    // Tukar data di globalSchedule
    let srcClass = dragSource.getAttribute('data-class');
    let srcDay = dragSource.getAttribute('data-day');
    let srcPeriod = parseInt(dragSource.getAttribute('data-period'));
    
    let dstClass = dropTarget.getAttribute('data-class');
    let dstDay = dropTarget.getAttribute('data-day');
    let dstPeriod = parseInt(dropTarget.getAttribute('data-period'));
    
    // Jangan izinkan swap antar kelas untuk mencegah kekacauan jadwal antar kelas
    if (srcClass !== dstClass) {
      alert("Hanya bisa menggeser pelajaran di dalam kelas yang sama!");
      return;
    }
    
    let temp = globalSchedule[srcClass][srcDay][srcPeriod - 1];
    globalSchedule[srcClass][srcDay][srcPeriod - 1] = globalSchedule[dstClass][dstDay][dstPeriod - 1];
    globalSchedule[dstClass][dstDay][dstPeriod - 1] = temp;
    
    // Render ulang seluruh grid
    renderScheduleResult();
  }
}
// === RENDER DASHBOARD ===
window.renderDashboard = function() {
  if (!globalSchedule) return "";
  
  let teacherCount = {};
  let teacherDaily = {}; // { teacherCode: { Senin: 4, Selasa: 2 ... } }
  let subjectCount = {};
  let totalKosong = 0;
  
  for(const c of allClasses) {
    if (!globalSchedule[c]) continue;
    for(const d of DAYS) {
      if (!globalSchedule[c][d]) continue;
      for(let p = 0; p < PERIODS_PER_DAY[d]; p++) {
        let cell = globalSchedule[c][d][p];
        if (cell && cell.teacher && cell.teacher !== '-') {
          // Hitung beban mingguan guru
          teacherCount[cell.teacher] = (teacherCount[cell.teacher] || 0) + 1;
          
          // Hitung beban harian guru
          if (!teacherDaily[cell.teacher]) teacherDaily[cell.teacher] = {};
          teacherDaily[cell.teacher][d] = (teacherDaily[cell.teacher][d] || 0) + 1;
          
          // Hitung mapel
          subjectCount[cell.subject] = (subjectCount[cell.subject] || 0) + 1;
        } else {
          totalKosong++;
        }
      }
    }
  }
  
  // Guru Sibuk & Santai
  let sortedTeachers = Object.entries(teacherCount).sort((a,b) => b[1] - a[1]);
  let topTeacher = sortedTeachers[0] || ['-', 0];
  let topTeacherName = globalTeacherMap[topTeacher[0]] || topTeacher[0];
  
  let bottomTeacher = sortedTeachers[sortedTeachers.length - 1] || ['-', 0];
  let bottomTeacherName = globalTeacherMap[bottomTeacher[0]] || bottomTeacher[0];
  
  // Mapel Terbanyak
  let sortedSubjects = Object.entries(subjectCount).sort((a,b) => b[1] - a[1]);
  let topSubject = sortedSubjects[0] || ['-', 0];
  
  // Peringatan Kesehatan (Overload > 6 JP per hari)
  let warnings = [];
  for (const [tCode, days] of Object.entries(teacherDaily)) {
    for (const [day, jp] of Object.entries(days)) {
      if (jp > 6) {
        let name = globalTeacherMap[tCode] || tCode;
        warnings.push(`${name} (${jp} Jam di hari ${day})`);
      }
    }
  }
  
  let warningHtml = "";
  if (warnings.length > 0) {
    warningHtml = `<div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 12px; margin-top: 15px;">
      <div style="color: #DC2626; font-weight: 700; font-size: 0.9rem; margin-bottom: 5px;">🚨 Peringatan Kesehatan Guru (Overload > 6 Jam/Hari):</div>
      <div style="font-size: 0.8rem; color: #991B1B;">${warnings.slice(0, 5).join(' &bull; ')}${warnings.length > 5 ? ` <i>...dan ${warnings.length - 5} lainnya</i>` : ''}</div>
    </div>`;
  }
  
  return `<div style="background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
    <h3 style="margin-top:0; color: var(--navy); display: flex; justify-content: space-between;">
      <span>📊 Dashboard Analitik SMANSA</span>
      <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted); padding: 4px 8px; background: #FEF3C7; color: #D97706; border-radius: 4px;">🖐️ Tips: Anda bisa men-Drag & Drop kotak pelajaran untuk memindahkannya!</span>
    </h3>
    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
      <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border); flex: 1; min-width: 150px;">
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 5px;">Guru Paling Sibuk</div>
        <div style="font-size: 1rem; font-weight: 700; color: var(--primary);">${topTeacherName}</div>
        <div style="font-size: 0.85rem; color: #EF4444; font-weight: 600; margin-top: 5px;">${topTeacher[1]} JP</div>
      </div>
      <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border); flex: 1; min-width: 150px;">
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 5px;">Guru Paling Santai</div>
        <div style="font-size: 1rem; font-weight: 700; color: #10B981;">${bottomTeacherName}</div>
        <div style="font-size: 0.85rem; color: #10B981; font-weight: 600; margin-top: 5px;">${bottomTeacher[1]} JP</div>
      </div>
      <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border); flex: 1; min-width: 150px;">
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 5px;">Pelajaran Terbanyak</div>
        <div style="font-size: 1rem; font-weight: 700; color: var(--navy);">${topSubject[0]}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-top: 5px;">${topSubject[1]} Blok</div>
      </div>
      <div style="background: white; padding: 12px; border-radius: 8px; border: 1px solid var(--border); flex: 1; min-width: 150px;">
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 5px;">Sisa Jam Kosong</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #F59E0B;">${totalKosong}</div>
      </div>
    </div>
    ${warningHtml}
  </div>`;
}

// ================================================================
// === TAB NAVIGATION ===
// ================================================================

function switchTab(n) {
  for (let i = 1; i <= 3; i++) {
    const btn = document.getElementById(`tab-btn-${i}`);
    const panel = document.getElementById(`tab-panel-${i}`);
    if (btn) btn.classList.remove('active');
    if (panel) panel.classList.remove('active');
  }
  const ab = document.getElementById(`tab-btn-${n}`);
  const ap = document.getElementById(`tab-panel-${n}`);
  if (ab) ab.classList.add('active');
  if (ap) ap.classList.add('active');
  if (n === 1) loadCurriculumTab();
  if (n === 2) loadTeacherPrefsTab();
}
window.switchTab = switchTab;

// ================================================================
// === TAB 1: DATA MAPEL & KELAS ===
// ================================================================

let _schoolDataCache = null;
async function _fetchSchoolData() {
  if (_schoolDataCache) return _schoolDataCache;
  const res = await fetch('data/school_data.json');
  _schoolDataCache = await res.json();
  return _schoolDataCache;
}

async function loadCurriculumTab() {
  const sel = document.getElementById('curr-class-select');
  const container = document.getElementById('curriculum-table-container');
  if (!sel || !container) return;

  const selectedKey = sel.value; // "X", "XI-1", "XII-3", dll
  container.innerHTML = '<p style="font-size:0.8rem;color:var(--text-muted)">Memuat...</p>';

  const data = await _fetchSchoolData();
  if (!data) { container.innerHTML = '<p style="color:red">Gagal memuat data.</p>'; return; }

  // Tentukan kelas referensi
  const refClass = (selectedKey === 'X') ? 'X-1' : selectedKey;

  // Hitung total JP per mapel dari data asli
  const subjMap = {};
  const schedule = data.schedules[refClass];
  if (schedule) {
    for (const [d, items] of Object.entries(schedule)) {
      for (const item of items) {
        const s = item.subject;
        if (!s || ['UPACARA','Ko(10)','Ko(11)','Ko(12)','-','GW','KOKURIKULER'].includes(s)) continue;
        subjMap[s] = (subjMap[s] || 0) + 1;
      }
    }
  }

  // Baca saved custom curriculum dari localStorage
  let saved = {};
  try { const r = localStorage.getItem('customCurriculum'); if (r) saved = JSON.parse(r); } catch(e) {}
  const savedForKey = saved[selectedKey] || {};

  // Render tabel
  let rows = Object.entries(subjMap).map(([subj, defaultJP]) => {
    const customJP = savedForKey[subj] !== undefined ? savedForKey[subj] : defaultJP;
    return `<tr>
      <td style="padding:6px 4px;border-bottom:1px solid var(--border);font-size:0.8rem;">${subj}</td>
      <td style="padding:6px 4px;border-bottom:1px solid var(--border);text-align:center;font-size:0.75rem;color:var(--text-muted);">${defaultJP}</td>
      <td style="padding:6px 4px;border-bottom:1px solid var(--border);text-align:center;">
        <input type="number" min="0" max="20" value="${customJP}" data-subj="${subj}" style="width:52px;padding:3px 5px;border:1px solid var(--border);border-radius:5px;font-size:0.8rem;text-align:center;outline:none;font-family:inherit;">
      </td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:0.8rem;margin-bottom:10px;">
      <thead>
        <tr style="background:var(--navy);color:white;">
          <th style="padding:7px 5px;text-align:left;font-size:0.75rem;">Mapel</th>
          <th style="padding:7px 5px;font-size:0.75rem;">Asli</th>
          <th style="padding:7px 5px;font-size:0.75rem;">Custom</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
window.loadCurriculumTab = loadCurriculumTab;

function saveCurriculum() {
  const sel = document.getElementById('curr-class-select');
  if (!sel) return;
  const selectedKey = sel.value;

  const inputs = document.querySelectorAll('#curriculum-table-container input[data-subj]');
  const keyData = {};
  inputs.forEach(inp => { keyData[inp.dataset.subj] = parseInt(inp.value) || 0; });

  let saved = {};
  try { const r = localStorage.getItem('customCurriculum'); if (r) saved = JSON.parse(r); } catch(e) {}
  saved[selectedKey] = keyData;
  localStorage.setItem('customCurriculum', JSON.stringify(saved));

  const toast = document.getElementById('curriculum-toast');
  if (toast) { toast.style.display = 'block'; setTimeout(() => toast.style.display = 'none', 2000); }
}
window.saveCurriculum = saveCurriculum;

// ================================================================
// === TAB 2: DATA GURU ===
// ================================================================

let _allTeacherCards = []; // simpan semua kartu untuk filter

async function loadTeacherPrefsTab() {
  const container = document.getElementById('teacher-prefs-container');
  if (!container) return;
  container.innerHTML = '<p style="font-size:0.8rem;color:var(--text-muted)">Memuat...</p>';

  const data = await _fetchSchoolData();
  if (!data || !data.teachers) { container.innerHTML = '<p style="color:red">Gagal memuat data guru.</p>'; return; }

  let savedPrefs = {};
  try { const r = localStorage.getItem('teacherPrefs'); if (r) savedPrefs = JSON.parse(r); } catch(e) {}

  const DAYS_SHORT = ['Sen','Sel','Rab','Kam','Jum'];
  const DAYS_FULL  = ['Senin','Selasa','Rabu','Kamis','Jumat'];

  _allTeacherCards = [];

  const cards = data.teachers.map(t => {
    const code = t.subject; // kode guru
    const name = t.name || code;
    const prefs = savedPrefs[code] || { daysOff: [] };

    const dayBoxes = DAYS_SHORT.map((short, idx) => {
      const full = DAYS_FULL[idx];
      const checked = prefs.daysOff && prefs.daysOff.includes(full) ? 'checked' : '';
      return `<label style="display:flex;flex-direction:column;align-items:center;gap:2px;font-size:0.68rem;color:var(--text-muted);cursor:pointer;">
        <input type="checkbox" ${checked} data-teacher="${code}" data-day="${full}" style="accent-color:#EF4444;width:14px;height:14px;">
        ${short}
      </label>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'teacher-card';
    card.dataset.name = name.toLowerCase();
    card.dataset.code = code.toLowerCase();
    card.innerHTML = `
      <div style="font-size:0.83rem;font-weight:700;color:var(--navy);margin-bottom:2px;">${name}</div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">Kode: ${code}</div>
      <div style="font-size:0.73rem;font-weight:600;color:var(--navy-light);margin-bottom:5px;">Hari Sibuk (beri tanda ✗):</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">${dayBoxes}</div>`;

    _allTeacherCards.push(card);
    return card;
  });

  container.innerHTML = '';
  cards.forEach(c => container.appendChild(c));
}
window.loadTeacherPrefsTab = loadTeacherPrefsTab;

function filterTeacherSidebar() {
  const q = (document.getElementById('teacher-search-sidebar')?.value || '').toLowerCase();
  _allTeacherCards.forEach(card => {
    const match = card.dataset.name.includes(q) || card.dataset.code.includes(q);
    card.style.display = match ? '' : 'none';
  });
}
window.filterTeacherSidebar = filterTeacherSidebar;

function saveTeacherPrefs() {
  const checkboxes = document.querySelectorAll('#teacher-prefs-container input[data-teacher]');
  const prefs = {};
  checkboxes.forEach(cb => {
    const code = cb.dataset.teacher;
    const day  = cb.dataset.day;
    if (!prefs[code]) prefs[code] = { daysOff: [] };
    if (cb.checked) prefs[code].daysOff.push(day);
  });
  localStorage.setItem('teacherPrefs', JSON.stringify(prefs));

  const toast = document.getElementById('teacher-toast');
  if (toast) { toast.style.display = 'block'; setTimeout(() => toast.style.display = 'none', 2000); }
}
window.saveTeacherPrefs = saveTeacherPrefs;

// Auto-load Tab 1 saat halaman pertama kali dibuka
document.addEventListener('DOMContentLoaded', () => {
  // pre-load data untuk responsivitas tab
  _fetchSchoolData().then(() => {
    // tidak perlu render dulu, tunggu user klik tab
  });
});


