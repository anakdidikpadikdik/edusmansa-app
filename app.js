const TEACHER_MAP = {
  "kepsek": "Titin Suryati Sukmadewi, S. Si., M. Pd.",
  "eko03": "Feti Faridayanti, S.Pd.",
  "pp01": "Titing Kurniati, S.Pd., M.Pd.",
  "pkn01": "Titing Kurniati, S.Pd., M.Pd.",
  "eko01": "Dra. Ade Mimi Harliah, M.Si.",
  "bio01": "Hj. Lin Gustini, S.Pd.",
  "fis02": "Mia Titin Marlia, S.Pd., M.T.",
  "jer01": "Dewi Nuraeni, S.S",
  "sen01": "Hj. Engkay Sukaesih, S.Pd., M.M.Pd",
  "bio02": "Rita Sutaryo, M.Pd.",
  "kim01": "Hj. Rina Marliana, S.Pd., M.M.Pd",
  "mat01": "Hj. Dedeh Hodiyah, M.Pd.",
  "fis01": "Cece Wawan, S.Pd., Fis.",
  "ind01": "Dra. Hj. Elikah Setiasih, M.Si.",
  "pai_01": "Dra. Alis Nursofa, M.Ag.",
  "sen02": "Hj. Pipih Latipah, M.Pd.",
  "kim02": "Hj. Yeni Yuniarti, S.Pd., M.P.Kim",
  "pp04": "Rahmawati Yesi Zunita, S.Pd.",
  "pkn04": "Rahmawati Yesi Zunita, S.Pd.",
  "ind03": "Hj. Kurnia Agustini, S.Pd.",
  "pai_02": "H. Sohibin, S.Ag., M.Si., M.Ag.",
  "bio04": "Syifaa Husniyah, S.Pd.",
  "pjok01": "Tian Ramadhan Nugraha, S.Pd., Gr.",
  "mat10": "Shofia Annisa Ratnasari, M.Pd.",
  "sej02": "Alvina Ramadhina, S.Pd.",
  "pai_03": "Ema Fauziah, S.Pd.I",
  "pjok02": "Fenti Herawati, S.Pd., Gr.",
  "pkwu01": "Yoga Pranamulya, S.Pd.",
  "jep01": "Tifa Latifa, S.Pd.",
  "sos01": "Hilman Nugraha, M.Pd.",
  "sos02": "Anisya Agus Mustari, S.Pd.",
  "fis04": "Pebi Muhamad Fikri, M.Pd.",
  "jep02": "Ami Nurul Hidayah, M.Pd.",
  "geo03": "Frida Hutami Drajat, S.Pd.",
  "pkwu02": "Heru Haerudin Aprianto, S.T.",
  "mat05": "Herra Pusfita Dinawasasri, S.T.",
  "ind06": "Ani Rachmawati, S.Pd.",
  "ind05": "Taryat Sudrajat, S.Pd.",
  "sun02": "Mina Aminah, S.Pd.",
  "mat06": "Aminah, S.Pd.",
  "pai_05": "Lilis Solihat, S.Pd.",
  "tik_01": "Kusmana Sidik Permana, S.Kom.",
  "ing02": "Ati Sumiati, S.Pd.",
  "pp02": "Jeni Anggia Zebbriyanti, S.Pd.",
  "pkn02": "Jeni Anggia Zebbriyanti, S.Pd.",
  "sun03": "Cici Puspitasari, S.S, M.Pd.Gr.",
  "geo02": "Atet Sumarna, S.Pd.",
  "ing04": "Erna Sri Meilani Mansyur, S.S",
  "ing03": "Ricki Cahyana Yuswa, S.Sos",
  "pp03": "Eli Nuryani, S.Pd.",
  "pkn03": "Eli Nuryani, S.Pd.",
  "fis03": "Sera Graha Tresna, S.Si.",
  "mat08": "Rini Riyanti, S.Pd.",
  "sos03": "Fradanti Riezky Nurgunarni, S.Pd.",
  "sej04": "Rurry Rafa'nilla, S.Pd.",
  "sej03": "Malik Ahmad, S.Pd.",
  "mat07": "Nina Marlina, S.Pd.",
  "bk02": "Selly Puspita Azzahra, M.Pd., Psi.",
  "bk01": "Hj. Dian Hikmayani, S.Pd., M.M.Pd.",
  "bk03": "Farhan Faturachman, S.Pd.",
  "bk04": "Bisyarah Fauni, S.Pd.",
  "geo04": "D. Intan Juwita M.Pd.",
  "jep": "Annisa Annur, S.Pd.",
  "bio": "Hanifarahmawati Rachman, S.Pd.",
};

// Fungsi global untuk meresolve nama guru (Cari dari Firestore dulu, lalu fallback ke TEACHER_MAP)
function resolveTeacherName(tCode) {
  if (!tCode || tCode === '-') return tCode;
  
  if (typeof schoolData !== 'undefined' && schoolData.teachers) {
    const dynMatch = schoolData.teachers.find(t => String(t.subject).toLowerCase() === String(tCode).toLowerCase());
    if (dynMatch) return `${dynMatch.name} (${tCode})`;
  }
  
  const norm = String(tCode).toLowerCase().replace(/_/g, '');
  if (typeof TEACHER_MAP !== 'undefined' && TEACHER_MAP[norm]) {
    return `${TEACHER_MAP[norm]} (${tCode})`;
  }
  
  return tCode;
}

// ============================================
// EDUSMANSA — LOGIC & CHAT MATCHING ENGINE
// ============================================

const ANALYTICS_KEY = 'schoolhub_analytics';
const CLASS_KEY = 'edusmansa_selected_class';
const SCHEDULE_MODE_KEY = 'edusmansa_schedule_mode';


// Pola Pendek (07-30 Sep 2026): durasi 35 menit per jam, berakhir 14:10
// Key = nomor jam (period), Value = "HH:MM - HH:MM"
const TIME_SLOTS_SHORT = {
  0:  "06:30 - 06:50",
  1:  "06:50 - 07:25",
  2:  "07:25 - 08:00",
  3:  "08:00 - 08:35",
  4:  "08:35 - 09:10",
  5:  "09:10 - 09:45",
  6:  "10:15 - 10:50",
  7:  "10:50 - 11:25",
  8:  "11:25 - 12:00",
  9:  "13:00 - 13:35",
  10: "13:35 - 14:10"
};

const BREAK_SHORT_1 = "09:45 - 10:15"; // Istirahat
const BREAK_SHORT_2 = "12:00 - 13:00"; // Istirahat / Sholat Dzuhur

let schoolData = null;
let currentClass = '10 IPA 1';
let currentDayTab = 'Senin';
let currentScheduleMode = localStorage.getItem(SCHEDULE_MODE_KEY) || 'normal';
let analyticsData = { "Jadwal Pelajaran": 0, "Guru & Ruangan": 0, "Ujian & Libur": 0, "Tata Tertib": 0, "Pengumuman": 0, "Profil & Ekskul": 0, "Lain-lain": 0 };

document.addEventListener('DOMContentLoaded', () => {
  loadSchoolData();
});

// ── 1. Load Data ───────────────────────────────
function updateProgress(percentage, text) {
  const bar = document.getElementById('top-progress-bar');
  const statusText = document.getElementById('status-text');
  if (bar) {
    bar.style.width = percentage + '%';
    if (percentage >= 100) {
      setTimeout(() => bar.style.opacity = '0', 500);
    } else {
      bar.style.opacity = '1';
    }
  }
  if (statusText && text) {
    statusText.textContent = text;
  }
}

// Flag to track if the UI has been initialized at least once
let _appInitialized = false;

function applySchoolData(newData) {
  try {
    localStorage.setItem('edusmansa_offline_data', JSON.stringify(newData));
  } catch(e) {}
  // Ensure classes are sorted
  if (newData && newData.classes) {
    newData.classes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }
  schoolData = newData;

  if (!_appInitialized) {
    // First load: full UI initialization
    updateProgress(100, 'Selesai');
    const savedAnalytics = localStorage.getItem(ANALYTICS_KEY);
    if (savedAnalytics) {
      try { analyticsData = JSON.parse(savedAnalytics); } catch(e) {}
    }
    initApp();
    _appInitialized = true;
  } else {
    // Subsequent updates from onSnapshot: refresh only dynamic widgets
    showLiveUpdateToast();
    renderSchedule();
    renderAnnouncements();
    renderTeachers();
  }
}

function showLiveUpdateToast() {
  let toast = document.getElementById('live-update-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'live-update-toast';
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.5);
      color: #34d399; padding: 8px 20px; border-radius: 20px; font-size: 0.82rem;
      font-weight: 600; z-index: 9999; pointer-events: none;
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = '🔄 Data diperbarui oleh Admin';
  toast.style.opacity = '1';
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

async function loadSchoolData() {
  updateProgress(10, 'Menghubungkan ke server...');

  if (typeof db !== 'undefined') {
    updateProgress(30, 'Memuat data Cloud...');
    // Use onSnapshot for real-time sync — fires immediately with cached data when offline
    db.collection('edusmansa').doc('schoolData').onSnapshot(
      (docSnap) => {
        if (docSnap.exists) {
          console.log('✅ Data diterima via onSnapshot (real-time / cache).');
          applySchoolData(docSnap.data());
        }
      },
      (error) => {
        console.warn('onSnapshot error:', error);
        // If listener fails entirely (no cache), fall back to local JSON
        if (!_appInitialized) loadLocalFallback();
      }
    );
  } else {
    // Firebase SDK not available – use local JSON
    await loadLocalFallback();
  }
}

async function loadLocalFallback() {
  try {
    const offlineData = localStorage.getItem('edusmansa_offline_data');
    if (offlineData) {
      updateProgress(50, 'Memuat data offline terbaru...');
      console.log('📦 Menggunakan data offline terbaru dari localStorage.');
      applySchoolData(JSON.parse(offlineData));
      return;
    }
    
    updateProgress(50, 'Memuat data lokal...');
    const res = await fetch('data/school_data.json');
    const data = await res.json();
    console.log('⚠️ Menggunakan data lokal JSON (fallback).');
    applySchoolData(data);
  } catch (err) {
    console.error('Gagal memuat data lokal:', err);
    updateProgress(100, 'Gagal memuat data');
  }
}


function saveAnalytics() {
  // Legacy: still save locally as backup
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analyticsData));
}

// Increment a category counter in Firestore (cross-device analytics)
function incrementAnalytics(category) {
  analyticsData[category] = (analyticsData[category] || 0) + 1;
  saveAnalytics(); // local backup

  // Firestore increment — atomic, works even with many concurrent users
  if (typeof db !== 'undefined' && typeof firebase !== 'undefined') {
    try {
      const increment = firebase.firestore.FieldValue.increment(1);
      db.collection('edusmansa').doc('analytics').update({ [category]: increment })
        .catch(() => {
          // Document might not exist yet — create it with set (merge)
          db.collection('edusmansa').doc('analytics').set(
            { [category]: analyticsData[category] },
            { merge: true }
          );
        });
    } catch(e) { /* silent: analytics is non-critical */ }
  }
}


// ── 2. Init App UI ─────────────────────────────
function initApp() {
  if (!schoolData) return;

  // Header info
  document.getElementById('school-name-text').textContent = schoolData.schoolInfo.name;
  
  // Status check (Real-time time check)
  updateSchoolStatus();
  setInterval(updateSchoolStatus, 60000); // Update every minute

  // Class Select dropdown
  const select = document.getElementById('class-select');
  select.innerHTML = '';
  schoolData.classes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });

  // Restore previously selected class from localStorage
  const savedClass = localStorage.getItem(CLASS_KEY);
  if (savedClass && schoolData.classes.includes(savedClass)) {
    currentClass = savedClass;
  } else if (schoolData.classes.length > 0) {
    currentClass = schoolData.classes[0];
  }
  select.value = currentClass;

  // Restore schedule mode dropdown
  const modeSelect = document.getElementById('schedule-mode-select');
  if (modeSelect) {
    modeSelect.value = currentScheduleMode;
  }

  // Set today's day active in tabs if weekday
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = days[new Date().getDay()];
  if (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(todayName)) {
    selectDayTab(todayName);
  } else {
    selectDayTab('Senin');
  }

  renderSchedule();
  renderAnnouncements();
  renderTeachers();

  // Dynamic Placeholder
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    const placeholders = [
      "Ketik pertanyaan di sini...",
      "Tanyakan: 'Sekarang jam pelajaran apa?'",
      "Tanyakan: 'Siapa pembina OSIS SMANSA?'",
      "Tanyakan: 'Aturan rambut cowok gimana?'",
      "Tanyakan: 'Lusa belajar apa?'"
    ];
    let pIdx = 0;
    setInterval(() => {
      chatInput.style.opacity = '0';
      setTimeout(() => {
        pIdx = (pIdx + 1) % placeholders.length;
        chatInput.setAttribute('placeholder', placeholders[pIdx]);
        chatInput.style.opacity = '1';
      }, 300);
    }, 4000);
  }

  renderQuickChips();
}

// ── Mobile Navigation Logic ──
let _mobileTabSwitching = false; // debounce guard

function showTabProgress() {
  const bar = document.getElementById('top-progress-bar');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.opacity = '1';
  bar.style.width = '40%';
  // Force reflow so the next frame sees the state change
  bar.offsetHeight; // eslint-disable-line no-unused-expressions
  bar.style.transition = 'width 0.25s ease-out';
  bar.style.width = '80%';
}

function hideTabProgress() {
  const bar = document.getElementById('top-progress-bar');
  if (!bar) return;
  bar.style.transition = 'width 0.15s ease-out, opacity 0.3s ease-out 0.1s';
  bar.style.width = '100%';
  setTimeout(() => {
    bar.style.opacity = '0';
    setTimeout(() => { bar.style.width = '0%'; bar.style.transition = 'none'; }, 350);
  }, 150);
}

function switchMobileTab(tabName) {
  // Only applies on mobile
  if (window.innerWidth > 768) return;
  // Debounce rapid taps
  if (_mobileTabSwitching) return;
  _mobileTabSwitching = true;

  const chatSection       = document.getElementById('chat-section');
  const widgetsSection    = document.getElementById('widgets-section');
  const scheduleWidget    = document.getElementById('schedule-widget');
  const announcementWidget= document.getElementById('announcement-widget');
  const directoryWidget   = document.getElementById('directory-widget');
  const navItems          = document.querySelectorAll('.mobile-bottom-nav .nav-item');

  // ── PHASE 1: Instant visual feedback (runs synchronously before paint) ──
  navItems.forEach(item => item.classList.remove('active'));
  if      (tabName === 'chat')      navItems[0].classList.add('active');
  else if (tabName === 'schedule')  navItems[1].classList.add('active');
  else if (tabName === 'directory') navItems[2].classList.add('active');

  // Start progress bar animation so user sees movement immediately
  showTabProgress();

  // ── PHASE 2: Heavy DOM work deferred to next animation frame ──
  // This lets the browser paint Phase 1 first, preventing the frozen feeling.
  requestAnimationFrame(() => {
    setTimeout(() => {               // one extra tick to ensure paint flushed
      // Hide all widgets first
      [scheduleWidget, announcementWidget, directoryWidget].forEach(w => {
        if (w) w.classList.add('mobile-hidden');
      });

      if (tabName === 'chat') {
        chatSection.classList.remove('hidden-mobile');
        widgetsSection.classList.remove('active-mobile');
      } else if (tabName === 'schedule') {
        chatSection.classList.add('hidden-mobile');
        widgetsSection.classList.add('active-mobile');
        scheduleWidget.classList.remove('mobile-hidden');
      } else if (tabName === 'directory') {
        chatSection.classList.add('hidden-mobile');
        widgetsSection.classList.add('active-mobile');
        announcementWidget.classList.remove('mobile-hidden');
        directoryWidget.classList.remove('mobile-hidden');
      }

      // Instant scroll (smooth scroll adds jank on low-end devices)
      window.scrollTo({ top: 0, behavior: 'auto' });

      // Finish progress bar & release debounce
      hideTabProgress();
      _mobileTabSwitching = false;
    }, 0);
  });
}

function updateSchoolStatus() {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  const day = now.getDay(); // 0 is Sun, 6 is Sat
  const currentMins = hours * 60 + mins;

  const statusText = document.getElementById('status-text');
  const dot = document.querySelector('.dot-pulse');
  
  const setStatus = (text, color, pulse) => {
    if (statusText) statusText.textContent = text;
    if (dot) {
      dot.style.backgroundColor = color;
      dot.style.animation = pulse ? 'pulse-green 1.5s infinite' : 'none';
      if (!pulse) dot.style.boxShadow = 'none';
    }
  };

  if (day === 0 || day === 6) {
    setStatus("Sekolah Libur (Akhir Pekan)", "var(--text-muted)", false);
    return;
  }

  // Cek mode jadwal aktif
  const modeSelect = document.getElementById('schedule-mode-select');
  const isShortMode = modeSelect && modeSelect.value === 'short';
  
  // Normal: 15:00. Short: 14:10
  const endTotalMins = isShortMode ? (14 * 60 + 10) : (15 * 60 + 0);

  if (currentMins < 7 * 60) {
    setStatus("Sekolah Belum Masuk (Buka 07:00)", "var(--text-muted)", false);
  } else if (currentMins >= endTotalMins) {
    setStatus("Jam Sekolah Selesai", "var(--maroon)", false);
  } else {
    setStatus(`Sekolah Aktif • ${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')} WIB`, "#34D399", true);
  }
}

// ── 3. Schedule Viewer Widget ──────────────────
function changeClassSchedule(className) {
  currentClass = className;
  localStorage.setItem(CLASS_KEY, className);
  renderSchedule();
}

function changeScheduleMode(mode) {
  currentScheduleMode = mode;
  localStorage.setItem(SCHEDULE_MODE_KEY, mode);
  renderSchedule();
}

function selectDayTab(dayName) {
  currentDayTab = dayName;
  const buttons = document.querySelectorAll('.day-tab');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.textContent === dayName);
  });
  renderSchedule();
}

const SUBJECT_MAP = {
  "bind": "Bahasa Indonesia", "ind": "Bahasa Indonesia",
  "ipa(kim)": "Kimia", "kim": "Kimia",
  "ips(sej)": "Sejarah", "sej": "Sejarah",
  "ips(eko)": "Ekonomi", "eko": "Ekonomi",
  "pjok": "Olahraga",
  "sbud": "Seni Budaya", "sen": "Seni Budaya",
  "ips(sos)": "Sosiologi", "sos": "Sosiologi",
  "pai": "Pendidikan Agama Islam",
  "gw": "Guru Wali",
  "ips(geo)": "Geografi", "geo": "Geografi",
  "bing": "Bahasa Inggris", "ing": "Bahasa Inggris",
  "mat(u)": "Matematika Umum", "mat": "Matematika", "mat(tl)": "Matematika Tingkat Lanjut",
  "sun": "Bahasa Sunda",
  "tik": "Informatika",
  "bk": "Bimbingan Konseling",
  "pp": "Pendidikan Pancasila", "pkn": "Pendidikan Pancasila",
  "ipa(bio)": "Biologi", "bio": "Biologi",
  "ipa(fis)": "Fisika", "fis": "Fisika",
  "pkwu": "Kewirausahaan",
  "jep": "Bahasa Jepang",
  "bind(tl)": "Bahasa Indonesia Tingkat Lanjut", "ind(tl)": "Bahasa Indonesia Tingkat Lanjut",
  "jer": "Bahasa Jerman",
  "ing(tl)": "Bahasa Inggris Tingkat Lanjut",
  "ko(10)": "Kokurikuler", "ko(11)": "Kokurikuler", "ko(12)": "Kokurikuler"
};

function isTimeActive(timeStr, targetDay) {
  if (!timeStr) return false;
  const now = new Date();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayStr = dayNames[now.getDay()];
  if (targetDay !== todayStr) return false;

  const parts = timeStr.split('-');
  if (parts.length < 2) return false;
  const startParts = parts[0].trim().split(':');
  const endParts = parts[1].trim().split(':');
  const startMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  return nowMins >= startMins && nowMins < endMins;
}

function renderSchedule() {
  const container = document.getElementById('schedule-list');
  container.innerHTML = '';

  const isShort = currentScheduleMode === 'short';

  const classSchedules = schoolData.schedules[currentClass];
  if (!classSchedules || !classSchedules[currentDayTab]) {
    container.innerHTML = `<div class="schedule-item"><span class="subject-name">Tidak ada jadwal tercatat untuk hari ${currentDayTab}</span></div>`;
    return;
  }

  const list = classSchedules[currentDayTab];
  let sortedList = list.map(item => ({...item})); // Deep copy

  if (currentDayTab === 'Senin') {
    // Hapus jam ke-1 jika sudah ada (karena datanya "-" di beberapa kelas)
    sortedList = sortedList.filter(item => parseInt(item.period) !== 1);
    
    // Suntikkan Upacara Bendera
    sortedList.push({
      period: 1,
      subject: 'UPACARA BENDERA',
      teacher: '-',
      room: 'Lapangan',
      time: '06:50 - 07:30'
    });
  }

  if (isShort && currentDayTab === 'Jumat') {
    // Note: Jam mengajar Ke-8 hari jumat berpindah menjadi jam Ke-7
    sortedList.forEach(item => {
      if (parseInt(item.period) === 8) {
        item.period = 7;
      }
    });

    // Add SHOLAT JUMAT at period 8
    sortedList.push({
      period: 8,
      subject: 'SHOLAT JUMAT',
      teacher: '-',
      room: '-',
      time: '11:25 - 12:00'
    });
  } else if (!isShort && currentDayTab === 'Jumat') {
    // Normal mode jumat: rapatkan jam setelah istirahat (8 -> 7, 9 -> 8)
    sortedList.forEach(item => {
      let p = parseInt(item.period);
      if (p >= 8) {
        item.period = p - 1;
      }
    });
  }

  sortedList = sortedList.sort((a,b) => parseInt(a.period) - parseInt(b.period));

  // Break times depend on schedule mode
  const break1Time = isShort ? BREAK_SHORT_1 : "09:30 - 10:00";
  const break2Time = isShort ? BREAK_SHORT_2 : (currentDayTab === 'Jumat' ? "11:20 - 13:00" : "11:45 - 12:30");
  
  // Break 1 appears before period 6 (after period 5) in both modes
  const break1Threshold = isShort ? 6 : 5;
  
  // Break 2 normally appears before period 8. 
  // In short mode, period 8 ends at 12:00, so Break 2 (12:00-13:00) is BEFORE period 9.
  const break2Threshold = isShort ? 9 : (currentDayTab === 'Jumat' ? 7 : 8);

  let break1Inserted = false;
  let break2Inserted = false;

  const insertBreak1 = () => {
    break1Inserted = true;
    const isActive = isTimeActive(break1Time, currentDayTab);
    const break1 = document.createElement('div');
    break1.className = `schedule-item break ${isActive ? 'active' : ''}`;
    break1.innerHTML = `
      <div style="text-align: center; width: 100%; font-weight: bold;">
        <div class="subject-name" style="font-size: 1.1rem; justify-content: center; display: flex; gap: 6px;">☕ Istirahat</div>
        <div class="period-time" style="font-size: 0.9rem; margin-top: 4px;">${break1Time}</div>
        <div class="live-badge" style="justify-content: center; margin-top: 6px;"><span class="live-dot"></span> Sedang Berlangsung</div>
      </div>
    `;
    container.appendChild(break1);
  };

  const insertBreak2 = () => {
    break2Inserted = true;
    const isActive = isTimeActive(break2Time, currentDayTab);
    const break2 = document.createElement('div');
    break2.className = `schedule-item break ${isActive ? 'active' : ''}`;
    break2.innerHTML = `
      <div style="text-align: center; width: 100%; font-weight: bold;">
        <div class="subject-name" style="font-size: 1.1rem; justify-content: center; display: flex; gap: 6px;">🍱 Istirahat</div>
        <div class="period-time" style="font-size: 0.9rem; margin-top: 4px;">${break2Time}</div>
        <div class="live-badge" style="justify-content: center; margin-top: 6px;"><span class="live-dot"></span> Sedang Berlangsung</div>
      </div>
    `;
    container.appendChild(break2);
  };

  sortedList.forEach(item => {
    const periodNum = parseInt(item.period);

    if (!break1Inserted && periodNum >= break1Threshold) {
      insertBreak1();
    }
    
    if (!break2Inserted && periodNum >= break2Threshold) {
      insertBreak2();
    }

    // Override time display if short mode
    const displayTime = isShort && TIME_SLOTS_SHORT[periodNum] ? TIME_SLOTS_SHORT[periodNum] : item.time;

    const div = document.createElement('div');
    const isBreak = typeof item.period === 'string';
    const fullSubject = SUBJECT_MAP[String(item.subject).toLowerCase()] || item.subject;
    const isActive = isTimeActive(displayTime, currentDayTab);

    div.className = `schedule-item ${isBreak ? 'break' : ''} ${isActive ? 'active' : ''}`;
      if (!isBreak && item.subject !== 'PULANG') {
        div.style.cursor = 'pointer';
        div.title = 'Klik untuk mengelola PR dan Tautan';
        div.setAttribute('onclick', `openPrivateSubjectModal('${item.subject.replace(/'/g, "\'")}', '${(item.teacher||'-').replace(/'/g, "\'")}')`);
      }
    div.innerHTML = `
      <div>
        <div class="period-time">Jam ${item.period} • ${displayTime}</div>
        <div class="subject-name">${fullSubject}</div>
        ${!isBreak && fullSubject !== '-' && item.teacher !== '-' ? `<div class="teacher-info">👨‍🏫 ${resolveTeacherName(item.teacher)}</div>` : ''}
        <div class="live-badge"><span class="live-dot"></span> Sedang Berlangsung</div>
      </div>
      <div class="room-badge">📍 ${item.room}</div>
    `;
    container.appendChild(div);
  });

  // Jika sampai akhir loop masih belum ter-insert (karena kelas pulang sebelum jam tersebut)
  // maka insert di ujung agar tetap terlihat
  if (!break1Inserted) insertBreak1();
  if (!break2Inserted) insertBreak2();

  // Auto-scroll to the active period
  const activeEl = container.querySelector('.schedule-item.active');
  if (activeEl) {
    setTimeout(() => activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }
}

// Auto-refresh schedule every 60s to keep the live highlight moving
setInterval(() => { if (typeof renderSchedule === 'function') renderSchedule(); }, 60000);

  // 📚 4. Announcements & Teacher Directory 📚
  function renderAnnouncements() {
    const container = document.getElementById('announcement-list');
    container.innerHTML = '';
  
    schoolData.announcements.forEach((ann) => {
      const div = document.createElement('div');
      div.className = 'announcement-item';
      
      let descHTML = ann.content;
      const limit = 120;
      if (ann.content && ann.content.length > limit) {
        // Cari spasi terdekat agar tidak memotong kata di tengah
        let cutIndex = ann.content.lastIndexOf(' ', limit);
        if (cutIndex === -1) cutIndex = limit;
        const shortText = ann.content.substring(0, cutIndex) + '...';
        
        descHTML = `
          <span class="ann-text-short">${shortText} <a href="#" style="color: var(--navy); font-weight: 600; text-decoration: none; cursor: pointer; display: inline-block; margin-top: 4px;" onclick="event.preventDefault(); this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='inline';">Baca selengkapnya</a></span>
          <span class="ann-text-full" style="display: none;">${ann.content} <a href="#" style="color: var(--navy); font-weight: 600; text-decoration: none; cursor: pointer; display: inline-block; margin-top: 4px;" onclick="event.preventDefault(); this.parentElement.style.display='none'; this.parentElement.previousElementSibling.style.display='inline';">Tutup</a></span>
        `;
      }
      
      div.innerHTML = `
        <span class="ann-tag">${ann.category} &bull; ${ann.date}</span>
        <div class="ann-title">${ann.title}</div>
        <div class="ann-desc">${descHTML}</div>
      `;
      container.appendChild(div);
    });
  }
  
  function toTitleCaseTeacherName(str) {
  if (!str) return '';
  const special = {
    's.pd.': 'S.Pd.', 's.pd': 'S.Pd.', 'm.pd.': 'M.Pd.', 'm.pd': 'M.Pd.',
    's.si.': 'S.Si.', 's.si': 'S.Si.', 'm.si.': 'M.Si.', 'm.si': 'M.Si.',
    's.t.': 'S.T.', 's.t': 'S.T.', 'm.t.': 'M.T.', 'm.t': 'M.T.',
    's.e.': 'S.E.', 's.e': 'S.E.', 'm.e.': 'M.E.', 'm.e': 'M.E.',
    's.kom.': 'S.Kom.', 's.kom': 'S.Kom.', 's.sos.': 'S.Sos.', 's.sos': 'S.Sos',
    's.s.': 'S.S.', 's.s': 'S.S', 's.ag.': 'S.Ag.', 's.ag': 'S.Ag.',
    'm.ag.': 'M.Ag.', 'm.ag': 'M.Ag.', 's.pd.i': 'S.Pd.I', 's.pd.i.': 'S.Pd.I',
    'm.m.pd': 'M.M.Pd', 'm.m.pd.': 'M.M.Pd.', 'm.p.kim': 'M.P.Kim',
    'gr.': 'Gr.', 'gr': 'Gr.', 'psi.': 'Psi.', 'psi': 'Psi.',
    'dra.': 'Dra.', 'drs.': 'Drs.', 'hj.': 'Hj.', 'h.': 'H.'
  };

  const parts = str.split(',');
  const namePart = parts[0].trim();
  const formattedName = namePart.split(/\s+/).map(w => {
    const low = w.toLowerCase();
    if (special[low]) return special[low];
    if (w.includes("'")) {
      const sub = w.split("'");
      return sub[0].charAt(0).toUpperCase() + sub[0].slice(1).toLowerCase() + "'" + (sub[1] ? sub[1].toLowerCase() : '');
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');

  if (parts.length === 1) return formattedName;

  const degParts = parts.slice(1).map(part => {
    return part.trim().split(/\s+/).map(tok => {
      const low = tok.toLowerCase().replace(/,+$/, '');
      return special[low] || (tok.charAt(0).toUpperCase() + tok.slice(1));
    }).join(' ');
  });

  return formattedName + ', ' + degParts.join(', ');
}

function renderTeachers(filter = '') {
  const container = document.getElementById('teacher-list');
  container.innerHTML = '';

  const query = filter.toLowerCase().trim();
  const filtered = schoolData.teachers.filter(t => 
    t.name.toLowerCase().includes(query) || 
    t.subject.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="teacher-card-item"><div class="ann-desc">Tidak ditemukan guru dengan kata kunci "${filter}"</div></div>`;
    return;
  }

  filtered.forEach(t => {
    const div = document.createElement('div');
    div.className = 'teacher-card-item';
    div.style.cursor = 'pointer';
    div.title = 'Lihat jadwal mengajar';
    div.setAttribute('onclick', `openPublicTeacherSchedule('${t.subject}')`);
    div.innerHTML = `
      <div class="ann-title">${toTitleCaseTeacherName(t.name)}</div>
      <div class="ann-desc">📚 <b>${t.subject}</b></div>
      ${t.contact && t.contact !== '-' ? `<div class="period-time" style="font-size:0.7rem;margin-top:2px;">✉️ ${t.contact}</div>` : ''}
    `;
    container.appendChild(div);
  });
}

function filterTeachers(val) {
  renderTeachers(val);
}

// ── 5. AI Chat Engine & NLP Matching ──────────
const QUICK_CHIPS_POOL = [
  { label: "📅 Jadwal Hari Ini", prompt: "Jadwal pelajaran hari ini apa saja?" },
  { label: "🎯 Visi & Misi", prompt: "Apa visi dan misi SMAN 1 Sumedang?" },
  { label: "📜 Janji Siswa", prompt: "Apa isi janji siswa SMAN 1 Sumedang?" },
  { label: '<img src="logo_smansa_clean.png" class="chip-mini-logo" alt="Logo"> Arti Lambang', prompt: "Apa arti lambang SMAN 1 Sumedang?" },
  { label: "🌟 Arti Motto", prompt: "Apa arti motto Acasana Dilah Ning Rahayu?" },
  { label: "🏫 Kepala Sekolah", prompt: "Siapa kepala sekolah SMAN 1 Sumedang?" },
  { label: "👥 Wakil Kepala Sekolah", prompt: "Siapa saja wakil kepala sekolah SMAN 1 Sumedang?" },
  { label: "👔 Pembina OSIS", prompt: "Siapa pembina OSIS SMAN 1 Sumedang?" },
  { label: "👨‍🏫 Siapa Guru Fisika?", prompt: "Siapa guru Fisika?" },
  { label: "📏 Aturan Seragam", prompt: "Aturan seragam sekolah seperti apa?" },
  { label: "✂️ Rambut Cowok", prompt: "Aturan rambut buat cowok gimana?" },
  { label: "⏰ Sekarang Belajar Apa?", prompt: "Sekarang jam pelajaran apa?" },
  { label: "🏖️ Jadwal Lusa", prompt: "Lusa belajar apa?" },
  { label: "👟 Aturan Sepatu & Kaki", prompt: "Aturan sepatu dan kaos kaki gimana?" },
  { label: "📱 Aturan Bawa HP", prompt: "Boleh bawa HP ke sekolah gak?" },
  { label: "👨‍🏫 Pak Heru Ngajar Mana", prompt: "Pak Heru mengajar kelas mana saja?" },
  { label: "☕ Habis Istirahat 1", prompt: "Habis istirahat pertama belajar apa?" },
  { label: "🧕 Ketentuan Jilbab", prompt: "Ketentuan jilbab bagi siswi gimana?" },
  { label: "🚪 Aturan Izin Keluar Sekolah", prompt: "Bagaimana aturan izin keluar sekolah?" },
  { label: "🧥 Aturan Jaket/Hoodie", prompt: "Boleh pakai jaket atau hoodie di sekolah?" },
  { label: "⚖️ Sanksi Pelanggaran", prompt: "Sanksi kalau melanggar tata tertib apa saja?" },
  { label: "📅 Besok Belajar Apa?", prompt: "Besok belajar apa?" },
  { label: "🍱 Habis Istirahat 2", prompt: "Setelah istirahat kedua belajar apa?" },
  { label: "📍 Alamat Sekolah", prompt: "Di mana alamat SMAN 1 Sumedang?" },
  { label: "⚽ Daftar Ekskul", prompt: "Ada ekstrakurikuler apa saja di SMANSA?" },
  { label: "🏛️ Sejarah Sekolah", prompt: "Bagaimana sejarah SMAN 1 Sumedang?" },
  { label: "🏛️ Sejarah Singkat", prompt: "Apa sejarah singkat SMAN 1 Sumedang?" },
  { label: "💄 Make-up & Lipstik", prompt: "Boleh pakai make up atau lipstik gak?" },
  { label: "🏅 Aturan Ekskul", prompt: "Aturan ikut ekskul di sekolah gimana?" },
  { label: "✂️ Rambut Cewek", prompt: "Aturan rambut buat cewek gimana?" },
  { label: "📅 Jadwal Kemarin", prompt: "Kemarin belajar apa?" }
];

function renderQuickChips() {
  const container = document.getElementById('quick-chips');
  if (!container) return;

  // Hapus class animasi untuk me-reset state
  container.classList.remove('chip-animate');
  void container.offsetWidth;

  // Fisher-Yates Shuffle
  const shuffled = [...QUICK_CHIPS_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Select top 4 questions
  const selected = shuffled.slice(0, 4);

  let html = selected.map(item => {
    // Extract emoji from the start if exists, or default to 💡
    const match = item.label.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/);
    let icon = match ? match[0] : '💡';
    let text = match ? item.label.replace(match[0], '').trim() : item.label;
    
    // special handling for the mini logo
    if (item.label.includes('<img')) {
      icon = '<img src="logo_smansa_clean.png" style="width:28px;height:28px;object-fit:contain;">';
      text = 'Arti Lambang SMANSA';
    }

    return `
      <div class="bento-card" onclick="sendQuickPrompt('${item.prompt.replace(/'/g, "\\'")}')">
        <div class="bento-icon">${icon}</div>
        <div class="bento-label">${text}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
  
  // Tambahkan kembali class animasi
  container.classList.add('chip-animate');
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('chat-input');
  input.value = promptText;
  handleChatSubmit(new Event('submit'));
}

async function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chat-input');
  const query = input.value.trim();
  if (!query) return;

  if (query.toLowerCase() === 'atmin datang') {
    input.value = '';
    showAdminModal();
    return;
  }

  appendMessage(query, 'user');
  input.value = '';

  const typingEl = showTypingIndicator();

  // 1. Coba kecerdasan lokal (Jalur Darat)
  const localResponse = matchAIResponse(query);
  const isFallback = localResponse.includes("Maaf, saya belum menemukan informasi spesifik mengenai");
  
  // Jika lokal BISA jawab (misal: "Jadwal", "Janji Siswa"), langsung pakai lokal (0ms!)
  if (!isFallback) {
      setTimeout(() => {
        removeTypingIndicator(typingEl);
        appendMessage(localResponse, 'bot');
      }, 300);
      return;
  }
  
  // 2. Jika lokal GAGAL dan OFFLINE
  if (!navigator.onLine) {
      setTimeout(() => {
        removeTypingIndicator(typingEl);
        appendMessage("📡 **Mode Offline Aktif**<br>Hai! Untuk menjawab pertanyaan rumit/bebas, kamu perlu tersambung ke internet.<br><br>Namun kamu tetap bisa tanya info jadwal resmi dan guru tanpa kuota!", 'bot');
      }, 300);
      return;
  }
  
  // 3. Jika lokal GAGAL dan ONLINE ➔ Lempar ke LLM Gemini (Jalur Udara)
  try {
      let context = "";
      if (typeof schoolData !== 'undefined' && schoolData) {
         context += `Pilihan Kelas Siswa di web saat ini: ${currentClass}
`;
         context += `Hari Ini: ${new Date().toLocaleDateString('id-ID', {weekday: 'long'})}
`;
         
         // Omniscient Mode: Kirim seluruh jadwal ke LLM
         context += `Seluruh Jadwal Pelajaran SMANSA (36 Kelas): ${JSON.stringify(schoolData.schedules || {})}\n`;
         context += `Data Guru SMANSA: ${JSON.stringify(schoolData.teachers || [])}
`;
      }
      
      const res = await fetch('https://Eadinira.pythonanywhere.com/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: query, context: context })
      });
      
      const data = await res.json();
      removeTypingIndicator(typingEl);
      
      if (data.status === 'success') {
          appendMessage(data.answer, 'bot');
      } else {
          appendMessage(localResponse + "<br><br><small style='color:var(--text-muted);'><i>(Koneksi ke AI sedang padat, beralih otomatis ke pencarian standar sekolah).</i></small>", 'bot');
      }
  } catch (err) {
      removeTypingIndicator(typingEl);
      appendMessage(localResponse, 'bot');
  }
}


function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'message bot-message typing-indicator-wrapper';
  div.innerHTML = `<div class="message-content bot-card-modern typing-shimmer">EduSmansa AI sedang memikirkan...</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function appendMessage(text, sender) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${sender}-message`;
  
  // Format line breaks, bold, and italic
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/\n/g, '<br>');

  if (sender === 'bot') {
    div.innerHTML = `
      <div class="message-content bot-card-modern">
        ${formatted}
      </div>
    `;
  } else {
    div.innerHTML = `<div class="message-content">${formatted}</div>`;
    // Hide empty state bento if user sends message
    const bento = document.getElementById('quick-chips-wrapper');
    if (bento) bento.style.display = 'none';
  }

  container.appendChild(div);

  // Soft limit: Keep only the last 50 messages
  while (container.children.length > 50) {
    container.removeChild(container.firstChild);
  }

  // Smooth scroll
  setTimeout(() => {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, 50);
  setTimeout(() => {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, 200);
}

function clearChat() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  // Fade out effect
  container.style.opacity = '0.5';
  setTimeout(() => {
    container.innerHTML = `
      <div class="message bot-message">
        <div class="message-content bot-card-modern">
          🧹 <i>Riwayat obrolan telah dibersihkan.</i><br><br>
          Ada lagi yang ingin kamu tanyakan seputar sekolah?
        </div>
      </div>
    `;
    container.style.opacity = '1';
  }, 150);
}

// ── Admin Modal Functions ─────────────────────────
function showAdminModal() {
  const modal = document.getElementById('admin-modal');
  const errorMsg = document.getElementById('admin-error-msg');
  const emailInput = document.getElementById('admin-email-input');
  const pwdInput = document.getElementById('admin-pwd-input');
  if (modal) {
    modal.style.display = 'flex';
    if (errorMsg) errorMsg.style.display = 'none';
    if (pwdInput) pwdInput.value = '';
    setTimeout(() => {
      if (emailInput && !emailInput.value) emailInput.focus();
      else if (pwdInput) pwdInput.focus();
    }, 100);
  }
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.style.display = 'none';
}

async function verifyAdminLogin() {
  const emailInput = document.getElementById('admin-email-input');
  const pwdInput = document.getElementById('admin-pwd-input');
  const errorMsg = document.getElementById('admin-error-msg');
  const btnLogin = document.getElementById('btn-admin-login');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = pwdInput ? pwdInput.value : '';

  if (!email || !password) {
    if (errorMsg) {
      errorMsg.textContent = 'Harap isi email dan kata sandi!';
      errorMsg.style.display = 'block';
    }
    return;
  }

  // Tampilkan state loading
  if (btnLogin) {
    btnLogin.disabled = true;
    btnLogin.textContent = 'Memeriksa...';
  }
  if (errorMsg) errorMsg.style.display = 'none';

  try {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      throw new Error('Sistem autentikasi belum terhubung.');
    }

    // Ubah mode keamanan menjadi sesi (login hangus saat browser ditutup)
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
    await firebase.auth().signInWithEmailAndPassword(email, password);
    // Berhasil login -> Arahkan ke panel admin
    window.location.href = 'admin.html';
  } catch (err) {
    console.error('Login gagal:', err);
    if (errorMsg) {
      let pesan = 'Email atau kata sandi salah!';
      if (err.code === 'auth/user-not-found') pesan = 'Akun admin tidak ditemukan di Firebase.';
      else if (err.code === 'auth/wrong-password') pesan = 'Kata sandi salah!';
      else if (err.code === 'auth/invalid-email') pesan = 'Format email tidak valid.';
      else if (err.code === 'auth/too-many-requests') pesan = 'Terlalu banyak percobaan gagal. Tunggu beberapa saat.';
      errorMsg.textContent = pesan;
      errorMsg.style.display = 'block';
    }
  } finally {
    if (btnLogin) {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Masuk';
    }
  }
}

function renderSmartScheduleCards(items, isShort, dayName) {
  const sorted = [...items].sort((a, b) => parseInt(a.period) - parseInt(b.period));
  const grouped = [];
  let currentGroup = null;
  
  for (const item of sorted) {
    const pNum = parseInt(item.period);
    const effPNum = (isShort && dayName === 'Jumat' && pNum === 8) ? 7 : pNum;
    let dTime = (isShort && typeof TIME_SLOTS_SHORT !== 'undefined' && TIME_SLOTS_SHORT[effPNum]) ? TIME_SLOTS_SHORT[effPNum] : item.time;
    if (!dTime) dTime = '';
    
    let tParts = dTime.split('-');
    let tStart = tParts[0] ? tParts[0].trim() : '';
    let tEnd = tParts[1] ? tParts[1].trim() : '';
    
    if (!currentGroup) {
      currentGroup = { ...item, startPeriod: effPNum, endPeriod: effPNum, span: 1, startTime: tStart, endTime: tEnd };
    } else {
      if (currentGroup.subject === item.subject && currentGroup.teacher === item.teacher) {
        currentGroup.endPeriod = effPNum;
        currentGroup.span += 1;
        if (tEnd) currentGroup.endTime = tEnd;
      } else {
        grouped.push(currentGroup);
        currentGroup = { ...item, startPeriod: effPNum, endPeriod: effPNum, span: 1, startTime: tStart, endTime: tEnd };
      }
    }
  }
  if (currentGroup) grouped.push(currentGroup);

  const break1Threshold = isShort ? 6 : 5;
  const break2Threshold = isShort ? 9 : (dayName === 'Jumat' ? 7 : 8);
  const break1Time = isShort ? "09:45 - 10:15" : "09:30 - 10:00";
  const break2Time = isShort ? "12:00 - 13:00" : (dayName === 'Jumat' ? "11:20 - 13:00" : "11:45 - 12:30");
  const break1Label = isShort ? "ISTIRAHAT" : "ISTIRAHAT PERTAMA";
  const break2Label = isShort ? "ISTIRAHAT" : "ISTIRAHAT KEDUA";

  let break1Rendered = false;
  let break2Rendered = false;
  let html = '<div class="ai-schedule-wrapper">';
  
  for (const g of grouped) {
    if (!break1Rendered && g.startPeriod >= break1Threshold) {
      break1Rendered = true;
      html += '<div class="ai-break-divider">☕ <strong>' + break1Label + '</strong> • ' + break1Time + '</div>';
    }
    if (!break2Rendered && g.startPeriod >= break2Threshold) {
      break2Rendered = true;
      html += '<div class="ai-break-divider">🍱 <strong>' + break2Label + '</strong> • ' + break2Time + '</div>';
    }
    
    let fullSubj = SUBJECT_MAP[String(g.subject).toLowerCase()] || g.subject;
    let tStr = (!g.teacher || g.teacher === '-') ? '' : resolveTeacherName(g.teacher);
    let pLabel = g.span > 1 ? 'Jam ' + g.startPeriod + '–' + g.endPeriod : 'Jam ' + g.startPeriod;
    let jpLabel = g.span > 1 ? ' (' + g.span + ' JP)' : '';
    
    let timeDisp = g.endTime ? `🕒 ${g.startTime} – ${g.endTime}` : `🕒 ${g.startTime}`;
    
    html += `<div class="ai-schedule-card" style="cursor:pointer;" onclick="openPrivateSubjectModal('${String(g.subject).replace(/'/g, "\\'")}', '${String(g.teacher||'-').replace(/'/g, "\\'")}')">`;
    html += '<div class="ai-schedule-time">' + timeDisp + ' <span class="ai-schedule-period">• ' + pLabel + jpLabel + '</span></div>';
    html += '<div class="ai-schedule-subject">' + fullSubj + '</div>';
    if (tStr) html += '<div class="ai-schedule-teacher">👤 ' + tStr + '</div>';
    html += '</div>';
  }
  
  html += '</div>';
  return html.replace(/\n/g, '');
}

function matchAIResponse(rawQuery) {
  // Normalize Arabic class numbers to Roman before normal parsing (e.g. 10 IPA 1 -> X IPA 1)
  rawQuery = rawQuery.replace(/12-/g, 'XII-').replace(/11-/g, 'XI-').replace(/10-/g, 'X-');
  const q = rawQuery.toLowerCase();
  const cleanQ = q.replace(/[^\w\s]/gi, ' ');

  // 0. GREETING INTENT
  const greetingRegex = /^(halo|hai|hei|helo|hello|assalamualaikum|assalamu'alaikum|p|ping|bot)( ya| bang| min| kak|)?$/i;
  const timeGreetingRegex = /^(selamat )?(pagi|siang|sore|malam)( ya| bang| min| kak|)?$/i;
  if (greetingRegex.test(cleanQ.trim()) || timeGreetingRegex.test(cleanQ.trim())) {
    return "Halo! 👋 Saya adalah Asisten Digital EduSmansa. Ada yang bisa saya bantu terkait **jadwal pelajaran**, **informasi guru**, atau **tata tertib** sekolah?";
  }


  // 0.5 EASTER EGGS 🥚
  if (q.includes('siapa yang buat') || q.includes('siapa yang bikin') || q.includes('siapa pencipta') || q.includes('dibuat oleh') || q.includes('siapa developer')) {
    const creatorResponses = [
      "Aplikasi canggih ini adalah mahakarya dari **Duo Maut Haikal dan Bintang** dari kelas **XII-2**! 😎🚀",
      "Sstt... rahasia ya! Asisten cerdas ini dirakit oleh dua legenda hidup dari kelas XII-2, yaitu **Haikal & Bintang**. Keren kan? ✨",
      "Kamu nanya siapa yang buat? Tentu saja **Duo Maut Haikal dan Bintang (XII-2)**! Proyek kebanggaan SMANSA nih! 💻🔥"
    ];
    return creatorResponses[Math.floor(Math.random() * creatorResponses.length)];
  }

  if (q.includes('cara dapat pacar') || q.includes('siapa yang suka aku') || q.includes('bucin') || (q.includes('cari') && q.includes('pacar')) || q.includes('tips pdkt')) {
    return "Maaf ya, tugasku itu mengatur jadwal pelajaran, bukan jadwal kencanmu. Ingat pesan Guru BK: Fokus ujian dan kejar cita-cita dulu, jodoh mah udah ada yang ngatur! 😎💔";
  }

  // Helper: Get subject codes from query with exact subject intent matching
  function getSubjectCodesForQuery(text) {
    let matchedCodes = new Set();
    const cleanText = " " + text.toLowerCase().replace(/[^\w\s]/gi, ' ') + " ";

    const SUBJECT_KEYWORDS = {
      "fis": ["fisika", " fis "],
      "kim": ["kimia", " kim "],
      "bio": ["biologi", " bio "],
      "mat(u)": ["matematika umum", "matematika wajib", "matematika", " mat "],
      "mat(tl)": ["matematika peminatan", "matematika lanjut", "matematika tingkat lanjut", "mat tl"],
      "sej": ["sejarah", " sej "],
      "eko": ["ekonomi", " eko "],
      "sos": ["sosiologi", " sos "],
      "geo": ["geografi", " geo "],
      "bind": ["bahasa indonesia", "b ind", "indonesia", " bind ", " bindo "],
      "ind(tl)": ["bahasa indonesia lanjut", "indonesia lanjut", "ind tl"],
      "bing": ["bahasa inggris", "b ing", "inggris", " bing ", " bingo ", " b inggris "],
      "ing(tl)": ["bahasa inggris lanjut", "inggris lanjut", "ing tl"],
      "sun": ["bahasa sunda", "sunda", " sun ", " b sunda "],
      "jep": ["bahasa jepang", "jepang", " jep "],
      "jer": ["bahasa jerman", "jerman", " jer "],
      "pai": ["pendidikan agama islam", "agama islam", "agama", " pai "],
      "pp": ["pendidikan pancasila", "pancasila", "pkn", " pp "],
      "pjok": ["penjas", "penjaskes", "olahraga", "pjok"],
      "sbud": ["seni budaya", "seni", "sbud", "senbud", "kesenian"],
      "pkwu": ["pkwu", "prakarya", "kewirausahaan"],
      "tik": ["informatika", "komputer", " tik "],
      "bk": ["bimbingan konseling", "konseling", " bk "],
      "gw": ["guru wali", "wali kelas"],
      "ko(10)": ["kokurikuler", "projek p5", "p5"],
      "ko(11)": ["kokurikuler", "projek p5", "p5"],
      "ko(12)": ["kokurikuler", "projek p5", "p5"]
    };

    for (const [primaryCode, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
      if (keywords.some(kw => cleanText.includes(kw))) {
        matchedCodes.add(primaryCode);
        const targetFullName = SUBJECT_MAP[primaryCode];
        if (targetFullName) {
          for (const [code, fullName] of Object.entries(SUBJECT_MAP)) {
            if (fullName.toLowerCase() === targetFullName.toLowerCase()) {
              matchedCodes.add(code);
            }
          }
        }
      }
    }

    return Array.from(matchedCodes);
  }

  // Helper: Format Teacher Name
  function getTeacherName(tCode) {
    if (!tCode || tCode === '-') return '';
    return resolveTeacherName(tCode);
  }

  // Helper: Find target class in query or fallback to active dropdown class
  const norm = str => str.toLowerCase().replace(/[-_]/g, '').replace(/\s+/g, '');
  const normQ = norm(rawQuery);
  const explicitClass = [...schoolData.classes]
    .sort((a, b) => b.length - a.length)
    .find(c => normQ.includes(norm(c)));
  let targetClass = explicitClass || currentClass;

  // Helper: Get Target Day Schedule with Relative Day & Weekend Support
  function getTargetDaySchedule(classSched, text) {
    if (!classSched) return null;
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
    let targetDay = days.find(d => text.includes(d));
    let relativeTerm = null;
    let offset = null;

    if (targetDay) {
      const capDay = targetDay.charAt(0).toUpperCase() + targetDay.slice(1);
      const isWeekend = targetDay === 'sabtu' || targetDay === 'minggu';
      return { 
        dayName: capDay, 
        isWeekend: isWeekend, 
        relativeTerm: null, 
        items: isWeekend ? [] : (classSched[capDay] || []) 
      };
    } else {
      let today = new Date();
      offset = 0;
      if (text.includes('kemarin lusa')) {
        offset = -2;
        relativeTerm = 'kemarin lusa';
      } else if (text.includes('kemarin')) {
        offset = -1;
        relativeTerm = 'kemarin';
      } else if (text.includes('lusa')) {
        offset = 2;
        relativeTerm = 'lusa';
      } else if (text.includes('besok')) {
        offset = 1;
        relativeTerm = 'besok';
      } else if (text.includes('hari ini')) {
        offset = 0;
        relativeTerm = 'hari ini';
      } else {
        offset = 0;
        relativeTerm = 'hari ini';
      }

      let targetDate = new Date(today);
      targetDate.setDate(today.getDate() + offset);
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const capDay = dayNames[targetDate.getDay()];
      const isWeekend = capDay === 'Minggu' || capDay === 'Sabtu';

      return { 
        dayName: capDay, 
        isWeekend: isWeekend, 
        relativeTerm: relativeTerm, 
        offset: offset, 
        items: isWeekend ? [] : (classSched[capDay] || []) 
      };
    }
  }

  // -------------------------------------------------------------
  // COURTESY: UCAPAN TERIMA KASIH ("makasih", "terima kasih", "nuhun", dll)
  // -------------------------------------------------------------
  const thanksKeywords = ['terima kasih', 'terimakasih', 'makasih', 'makasii', 'makasihh', 'thanks', 'thank you', 'thx', 'nuhun', 'hatur nuhun', 'tengkyu'];
  if (thanksKeywords.some(kw => q.includes(kw))) {
    const thanksResponses = [
      "Sama-sama! Senang bisa membantu kamu. 😊 Ada yang ingin kamu tanyakan lagi seputar jadwal, guru, atau tata tertib sekolah?",
      "Sama-sama! Tetap semangat belajarnya ya di SMAN 1 Sumedang! 🏫✨ Silakan tanyakan lagi jika butuh info lain.",
      "Sami-sami! Senang bisa membantu. Jangan ragu bertanya lagi kalau ada yang membingungkan ya! 👍"
    ];
    return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
  }

  // -------------------------------------------------------------
  // 0. STRUKTUR PIMPINAN, KEPSEK, WAKASEK, & PEMBINA OSIS (Bisa Terpisah & Terpadu)
  // -------------------------------------------------------------
  const askKepsek = q.includes('kepala sekolah') || q.includes('kepsek');
  const askWakasek = q.includes('wakil kepala sekolah') || 
                     q.includes('wakil kepsek') || 
                     q.includes('wakasek') || 
                     q.includes('wakil bidang') || 
                     q.includes('waka ') || 
                     q.endsWith('waka') || 
                     q === 'waka';
  const askPembinaOsis = q.includes('pembina osis') || ((q.includes('pembina') || q.includes('pembimbing')) && q.includes('osis'));
  const askPimpinanAll = q.includes('pimpinan') || 
                         q.includes('struktur pimpinan') || 
                         q.includes('struktur sekolah') || 
                         q.includes('struktur kepemimpinan') || 
                         q.includes('pejabat sekolah') || 
                         (askKepsek && askWakasek && askPembinaOsis);

  const getKepsekNameStr = () => {
    const kepsekObj = (schoolData.teachers && schoolData.teachers.find(t => String(t.subject).toLowerCase() === 'kepsek')) || null;
    return (kepsekObj && kepsekObj.name) 
      ? kepsekObj.name 
      : (TEACHER_MAP['kepsek'] || (schoolData.schoolInfo && schoolData.schoolInfo.principal) || 'Titin Suryati Sukmadewi, S. Si., M. Pd.');
  };

  const getWakasekText = (specificField = null) => {
    if (specificField === 'kesiswaan') {
      return `👨‍🏫 Wakil Kepala Sekolah Bidang **Kesiswaan** di SMAN 1 Sumedang adalah **Tian Ramdhan Nugraha, S. Pd.**`;
    } else if (specificField === 'sarpras') {
      return `👨‍🏫 Wakil Kepala Sekolah Bidang **Sarana dan Pra-sarana** di SMAN 1 Sumedang adalah **Mohamad Gofur Rohim, S.Pd.**`;
    } else if (specificField === 'kurikulum') {
      return `👨‍🏫 Wakil Kepala Sekolah Bidang **Kurikulum** di SMAN 1 Sumedang adalah **Iwan Ginanjar, S.Pd.**`;
    } else if (specificField === 'humas') {
      return `👩‍🏫 Wakil Kepala Sekolah Bidang **Hubungan Masyarakat** di SMAN 1 Sumedang adalah **Titing Kurniati, S.Pd., M.Pd.**`;
    }
    return `👥 **Wakil Kepala Sekolah SMAN 1 Sumedang:**\n` +
      `1. **Tian Ramdhan Nugraha, S. Pd.** (Kesiswaan)\n` +
      `2. **Mohamad Gofur Rohim, S.Pd.** (Sarana dan Pra-sarana)\n` +
      `3. **Iwan Ginanjar, S.Pd.** (Kurikulum)\n` +
      `4. **Titing Kurniati, S.Pd., M.Pd.** (Hubungan Masyarakat)`;
  };

  const getPembinaOsisText = () => {
    return `👔 **Pembina OSIS SMAN 1 Sumedang:**\n• **Ricki Cahyana Yuswa, S.Sos.**`;
  };

  // 1. Unified / All Leadership query (Kepsek + Wakasek + Pembina OSIS)
  if (askPimpinanAll) {
    incrementAnalytics("Profil & Ekskul");
    return `🏛️ **Struktur Pimpinan & Pembina SMAN 1 Sumedang:**\n\n` +
      `👩‍🏫 **Kepala Sekolah:**\n• **${getKepsekNameStr()}**\n\n` +
      `${getWakasekText()}\n\n` +
      `${getPembinaOsisText()}`;
  }

  // 2. Dual Combined Queries:
  // - Kepsek + Pembina OSIS
  if (askKepsek && askPembinaOsis && !askWakasek) {
    incrementAnalytics("Profil & Ekskul");
    return `🏛️ **Informasi Kepala Sekolah & Pembina OSIS:**\n\n` +
      `👩‍🏫 **Kepala Sekolah:** **${getKepsekNameStr()}**\n\n` +
      `${getPembinaOsisText()}`;
  }

  // - Wakasek + Pembina OSIS
  if (askWakasek && askPembinaOsis && !askKepsek) {
    incrementAnalytics("Profil & Ekskul");
    return `🏛️ **Informasi Wakil Kepala Sekolah & Pembina OSIS:**\n\n` +
      `${getWakasekText()}\n\n` +
      `${getPembinaOsisText()}`;
  }

  // - Kepsek + Wakasek
  if (askKepsek && askWakasek) {
    incrementAnalytics("Profil & Ekskul");
    return `👩‍🏫 **Kepala Sekolah:** **${getKepsekNameStr()}**\n\n${getWakasekText()}`;
  }

  // 3. Single / Specific Wakasek Field Queries ("Siapa kesiswaan?", "Siapa humas?", "Siapa waka kurikulum?")
  if (q.includes('siapa') && (q.includes('kesiswaan') || q.includes('sarpras') || q.includes('pra-sarana') || (q.includes('sarana') && q.includes('prasarana')) || (q.includes('hubungan') && q.includes('masyarakat')) || q.includes('humas'))) {
    incrementAnalytics("Profil & Ekskul");
    if (q.includes('kesiswaan')) return getWakasekText('kesiswaan');
    if (q.includes('sarana') || q.includes('sarpras') || q.includes('prasarana') || q.includes('pra-sarana')) return getWakasekText('sarpras');
    if (q.includes('humas') || (q.includes('hubungan') && q.includes('masyarakat'))) return getWakasekText('humas');
    if (q.includes('kurikulum')) return getWakasekText('kurikulum');
  }

  // 4. Individual Wakasek Query
  if (askWakasek) {
    incrementAnalytics("Profil & Ekskul");
    if (q.includes('kesiswaan')) return getWakasekText('kesiswaan');
    if (q.includes('sarana') || q.includes('sarpras') || q.includes('prasarana') || q.includes('pra-sarana')) return getWakasekText('sarpras');
    if (q.includes('kurikulum')) return getWakasekText('kurikulum');
    if (q.includes('humas') || q.includes('hubungan masyarakat')) return getWakasekText('humas');
    return getWakasekText();
  }

  // 5. Individual Kepala Sekolah Query
  if (askKepsek) {
    incrementAnalytics("Profil & Ekskul");
    const kName = getKepsekNameStr();
    return `🏫 Kepala Sekolah **SMAN 1 Sumedang** saat ini adalah **${kName}**.`;
  }

  // 6. Individual Pembina OSIS Query
  if (askPembinaOsis) {
    incrementAnalytics("Profil & Ekskul");
    return `👨‍🏫 Pembina **OSIS SMAN 1 Sumedang** adalah **Ricki Cahyana Yuswa, S.Sos.**`;
  }

  // -------------------------------------------------------------
  // Helper text generators for School Identity
  // -------------------------------------------------------------
  const getLambangText = () => {
    return `**Arti & Makna Lambang SMAN 1 Sumedang:**\n` +
      `• **Lingkaran bergerigi:** Bekerja terus menerus untuk mencapai cita-cita.\n` +
      `• **Empat buah kapas:** Melambangkan jurusan yang terdapat di SMAN 1 Sumedang pada awal didirikan yaitu budaya, ilmu pasti, ilmu sosial dan IPA.\n` +
      `• **22 buah biji padi:** Melambangkan jumlah kelas mula-mula.\n` +
      `• **Lingga:** Melambangkan Kabupaten Sumedang.\n` +
      `• **Obor:** Semangat membara.`;
  };

  const getMottoText = () => {
    return `🌟 **Motto SMAN 1 Sumedang:**\n` +
      `*"Acasana Dilah Ning Rahayu"*\n\n` +
      `📖 **Arti Kata:**\n` +
      `• **Acasana**: Pengetahuan\n` +
      `• **Dilah**: Pelita atau Lampu\n` +
      `• **Ning**: Imbuhan "ke"\n` +
      `• **Rahayu**: Bahagia\n\n` +
      `✨ **Arti Satu Kalimat Utuh:**\n` +
      `> **"Pengetahuan laksana pelita menuju kebahagiaan."**`;
  };

  const isLambangQuery = q.includes('lambang') || q.includes('logo');
  const isMottoQuery = q.includes('motto') || q.includes('semboyan') || q.includes('slogan') || q.includes('acasana') || q.includes('dilah') || q.includes('rahayu');
  const isJanjiQuery = q.includes('janji') || q.includes('ikrar') || q.includes('sumpah siswa');
  const isVisiQuery = q.includes('visi');
  const isMisiQuery = q.includes('misi');

  // -------------------------------------------------------------
  // 0.1. ARTI LAMBANG & ARTI MOTTO QUERY ("Arti lambang", "Makna logo", "Motto smansa")
  // -------------------------------------------------------------
  if (isLambangQuery || isMottoQuery) {
    if (!isVisiQuery && !isMisiQuery && !isJanjiQuery) {
      incrementAnalytics("Profil & Ekskul");
      if (isLambangQuery && isMottoQuery) {
        return `${getLambangText()}\n\n${getMottoText()}`;
      } else if (isLambangQuery) {
        return getLambangText();
      } else if (isMottoQuery) {
        return getMottoText();
      }
    }
  }

  // -------------------------------------------------------------
  // 0.2. JANJI SISWA QUERY ("Apa janji siswa?" / "Ikrar siswa" / "Janji smansa")
  // -------------------------------------------------------------
  if (isJanjiQuery && !isVisiQuery && !isMisiQuery && !isLambangQuery && !isMottoQuery) {
    incrementAnalytics("Profil & Ekskul");
    const pledgeArr = (schoolData.schoolInfo && Array.isArray(schoolData.schoolInfo.studentPledge))
      ? schoolData.schoolInfo.studentPledge
      : [
          "Takwa terhadap tuhan yang maha Esa, Abdi terhadap tanah air dan bangsa, setia pada pancasila dan Undang-Undang Dasar 1945.",
          "Adab terhadap orang tua, hormat terhadap guru, serta menjunjung tinggi derajat dan martabat sekolah.",
          "Belajar dengan sungguh-sungguh sebagai bekal masa depan bangsa.",
          "Berprestasi dalam rangka mengisi kemerdekaan.",
          "Menjadi warga masyarakat Jawa Barat yang baik, dan pemuda Indonesia yang bertanggungjawab."
        ];

    return `📜 **Janji Siswa SMAN 1 Sumedang:**\n\n` + pledgeArr.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
  }

  // -------------------------------------------------------------
  // 0.3. VISI & MISI QUERY ("Apa visi dan misi sekolah?" / "Visi smansa apa?")
  // -------------------------------------------------------------
  if (isVisiQuery || isMisiQuery) {
    const visionStr = (schoolData.schoolInfo && schoolData.schoolInfo.vision) 
      ? schoolData.schoolInfo.vision 
      : "Mewujudkan insan sehat, taat bereligi, unggul dalam prestasi, mampu mengembangkan dan menerapkan IPTEK, mandiri dan berbudaya serta berwawasan lingkungan";

    const missionArr = (schoolData.schoolInfo && Array.isArray(schoolData.schoolInfo.mission))
      ? schoolData.schoolInfo.mission
      : [
          "Meningkatkan keimanan dan ketakwaan terhadap Tuhan Yang Maha Esa.",
          "Meningkatkan kepribadian dan keterampilan yang didukung dengan kesehatan jasmani dan rohani.",
          "Mempersiapkan siswa untuk memperoleh pendidikan lebih lanjut yang mampu bekerja keras tangguh, bertanggung jawab dan mandiri.",
          "Mempersiapkan siswa menguasai ilmu pengetahuan dan teknologi secara inovatif dan kreatif dengan memiliki rasa percaya diri yang tinggi.",
          "Mempersiapkan siswa untuk mampu bersaing di era globalisasi dengan semangat kebangsaan dengan kesetiakawanan sosial yang tinggi",
          "Menumbuhkembangkan nilai-nilai kearifan lokal dan berwawasan lingkungan"
        ];

    const visiText = `🎯 **Visi SMAN 1 Sumedang:**\n"${visionStr}"`;
    const misiText = `🚀 **Misi SMAN 1 Sumedang:**\n` + missionArr.map((m, idx) => `${idx + 1}. ${m}`).join('\n');

    let result = '';
    if (isVisiQuery && isMisiQuery) {
      result = `${visiText}\n\n${misiText}`;
    } else if (isVisiQuery) {
      result = visiText;
    } else if (isMisiQuery) {
      result = misiText;
    }

    // If user asked about Visi/Misi AND Janji Siswa together
    if (isJanjiQuery) {
      const pledgeArr = (schoolData.schoolInfo && Array.isArray(schoolData.schoolInfo.studentPledge))
        ? schoolData.schoolInfo.studentPledge
        : [
            "Takwa terhadap tuhan yang maha Esa, Abdi terhadap tanah air dan bangsa, setia pada pancasila dan Undang-Undang Dasar 1945.",
            "Adab terhadap orang tua, hormat terhadap guru, serta menjunjung tinggi derajat dan martabat sekolah.",
            "Belajar dengan sungguh-sungguh sebagai bekal masa depan bangsa.",
            "Berprestasi dalam rangka mengisi kemerdekaan.",
            "Menjadi warga masyarakat Jawa Barat yang baik, dan pemuda Indonesia yang bertanggungjawab."
          ];
      const janjiText = `📜 **Janji Siswa SMAN 1 Sumedang:**\n\n` + pledgeArr.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
      result += `\n\n${janjiText}`;
    }

    if (isLambangQuery) {
      result += `\n\n${getLambangText()}`;
    }
    if (isMottoQuery) {
      result += `\n\n${getMottoText()}`;
    }

    incrementAnalytics("Profil & Ekskul");
    return result;
  }

  // -------------------------------------------------------------
  // 3. REVERSE TEACHER LOOKUP ("Pak Heru ngajar kelas mana aja?")
  // -------------------------------------------------------------
  if (q.includes('ngajar') || q.includes('mengajar')) {
    incrementAnalytics("Guru & Ruangan");
    const cleanTeacherQuery = q.replace(/(pak |ibu |bu |bapak )/gi, '');
    const queryWords = cleanTeacherQuery.split(/[^\w]+/);
    
    let bestTeacher = null;
    let maxScore = 0;
    
    schoolData.teachers.forEach(t => {
      const nameStr = " " + t.name.toLowerCase().replace(/[^a-z0-9 ]/g, '') + " ";
      let score = 0;
      queryWords.forEach(w => {
        if (w.length >= 3 && nameStr.includes(" " + w + " ")) score += 2;
      });
      if (cleanTeacherQuery.includes(t.subject.toLowerCase())) score += 2;
      
      if (score > maxScore) {
        maxScore = score;
        bestTeacher = t;
      }
    });
    
    if (bestTeacher) {
      let tCode = bestTeacher.subject;
      
      // 1. Check if asking about a SPECIFIC DAY ("hari ini", "besok", "senin")
      const daysList = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
      const currentJSDate = new Date();
      const currentDayIndex = currentJSDate.getDay() === 0 ? 6 : currentJSDate.getDay() - 1; 
      let targetDayForTeacher = null;
      let relativeDayStr = "";
      
      if (q.includes('hari ini')) { targetDayForTeacher = daysList[currentDayIndex]; relativeDayStr = "hari ini "; }
      else if (q.includes('besok lusa')) { targetDayForTeacher = daysList[(currentDayIndex + 2) % 7]; relativeDayStr = "besok lusa "; }
      else if (q.includes('besok')) { targetDayForTeacher = daysList[(currentDayIndex + 1) % 7]; relativeDayStr = "besok "; }
      else if (q.includes('kemarin lusa')) { targetDayForTeacher = daysList[(currentDayIndex - 2 + 7) % 7]; relativeDayStr = "kemarin lusa "; }
      else if (q.includes('kemarin')) { targetDayForTeacher = daysList[(currentDayIndex - 1 + 7) % 7]; relativeDayStr = "kemarin "; }
      else {
         let foundDay = daysList.find(d => q.includes(d));
         if (foundDay) targetDayForTeacher = foundDay;
      }

      if (targetDayForTeacher) {
        let capTargetDay = targetDayForTeacher.charAt(0).toUpperCase() + targetDayForTeacher.slice(1);
        let scheduleForDay = [];
        for (const [cls, classSched] of Object.entries(schoolData.schedules)) {
          if (classSched[capTargetDay]) {
            classSched[capTargetDay].forEach(item => {
              if (item.teacher && item.teacher.toLowerCase() === tCode.toLowerCase()) {
                scheduleForDay.push({ cls, period: item.period, time: item.time });
              }
            });
          }
        }
        
        if (scheduleForDay.length > 0) {
          scheduleForDay.sort((a, b) => parseInt(a.period) - parseInt(b.period));
          let resMsg = `👨‍🏫 **${bestTeacher.name}** mengajar ${relativeDayStr}(**Hari ${capTargetDay}**) di kelas:\n`;
          scheduleForDay.forEach(i => {
            resMsg += `• Jam ke-${i.period} (${i.time}) : **${i.cls}**\n`;
          });
          return resMsg;
        } else {
          return `ℹ️ **${bestTeacher.name}** tidak memiliki jadwal mengajar ${relativeDayStr}(**Hari ${capTargetDay}**).`;
        }
      }

      // 2. Check if asking about a SPECIFIC class mentioned explicitly in the query
      // e.g. "Bu Rina mengajar di kelas XII-2 hari apa?" or "Apakah Pak Heru mengajar di kelas X-1?"
      const isAskingSpecificClass = Boolean(explicitClass) && 
                                    !q.includes('kelas mana') && 
                                    !q.includes('mana saja') && 
                                    !q.includes('mana aja') && 
                                    !q.includes('kelas apa saja') && 
                                    !q.includes('kelas apa aja');
      
      if (isAskingSpecificClass) {
        let classSched = schoolData.schedules[explicitClass];
        if (classSched) {
          let foundDays = [];
          for (const [day, items] of Object.entries(classSched)) {
            let periods = items.filter(i => i.teacher && i.teacher.toLowerCase() === tCode.toLowerCase()).map(i => i.period);
            if (periods.length > 0) {
              foundDays.push(`**${day}** (Jam ke-${periods.join(', ')})`);
            }
          }
          if (foundDays.length > 0) {
            return `👨‍🏫 **${bestTeacher.name}** (${bestTeacher.subject}) mengajar di kelas **${explicitClass}** pada hari:\n• ${foundDays.join('\n• ')}`;
          } else {
            return `ℹ️ **${bestTeacher.name}** tidak memiliki jadwal mengajar di kelas **${explicitClass}**.`;
          }
        }
      }

      // 3. Default: List all classes they teach (General inquiry like "Pak Heru mengajar kelas mana saja?")
      let classesTaught = [];
      for (const [cls, days] of Object.entries(schoolData.schedules)) {
        for (const [day, items] of Object.entries(days)) {
          if (items.some(i => i.teacher && i.teacher.toLowerCase() === tCode.toLowerCase())) {
            if (!classesTaught.includes(cls)) classesTaught.push(cls);
          }
        }
      }
      const fullSubj = SUBJECT_MAP[tCode.toLowerCase()] || bestTeacher.subject;
      if (classesTaught.length > 0) {
        return `👨‍🏫 **${bestTeacher.name}** mengajar mata pelajaran **${fullSubj}** (${bestTeacher.subject}) di kelas:\n• ${classesTaught.join(', ')}`;
      } else {
        return `👨‍🏫 **${bestTeacher.name}** saat ini tidak memiliki jadwal mengajar di database.`;
      }
    }
  }

  // -------------------------------------------------------------
  // 4. SUBJECT / TEACHER LOOKUP ("Siapa guru matematika X-1?", "Siapa aja guru fisika?")
  // -------------------------------------------------------------
  if (q.includes('siapa guru') || q.includes('siapa saja') || q.includes('siapa aja') || (q.includes('siapa') && (q.includes('guru') || q.includes('ngajar') || q.includes('mengajar')))) {
    incrementAnalytics("Guru & Ruangan");
    const matchedCodes = getSubjectCodesForQuery(q);
    if (matchedCodes.length > 0) {
      const displaySubj = SUBJECT_MAP[matchedCodes[0]] || "mata pelajaran tersebut";
      
      const SUBJECT_TO_TEACHER_PREFIX = {
        "sbud": ["sen", "sbud"],
        "sen": ["sen", "sbud"],
        "bind": ["ind", "bind"],
        "ind": ["ind", "bind"],
        "bind(tl)": ["ind", "bind"],
        "ind(tl)": ["ind", "bind"],
        "bing": ["ing", "bing"],
        "ing": ["ing", "bing"],
        "bing(tl)": ["ing", "bing"],
        "ing(tl)": ["ing", "bing"],
        "pp": ["pp", "pkn"],
        "pkn": ["pp", "pkn"],
        "pai": ["pai"],
        "mat(u)": ["mat"],
        "mat(tl)": ["mat"],
        "mat": ["mat"],
        "fis": ["fis"],
        "ipa(fis)": ["fis"],
        "kim": ["kim"],
        "ipa(kim)": ["kim"],
        "bio": ["bio"],
        "ipa(bio)": ["bio"],
        "eko": ["eko"],
        "ips(eko)": ["eko"],
        "geo": ["geo"],
        "ips(geo)": ["geo"],
        "sos": ["sos"],
        "ips(sos)": ["sos"],
        "sej": ["sej"],
        "ips(sej)": ["sej"],
        "pjok": ["pjok"],
        "pkwu": ["pkwu"],
        "tik": ["tik"],
        "sun": ["sun"],
        "jep": ["jep"],
        "jer": ["jer"],
        "bk": ["bk"]
      };

      const isAskingAll = q.includes('siapa saja') || q.includes('siapa aja') || q.includes('siapa-siapa') || 
                          q.includes('ada siapa') || q.includes('semua guru') || q.includes('daftar guru') || 
                          !explicitClass;

      // CASE 2A: List ALL teachers for a specific subject
      if (isAskingAll) {
        let targetPrefixes = new Set();
        matchedCodes.forEach(code => {
          const clean = code.toLowerCase().replace(/[^a-z]/g, '');
          if (clean) targetPrefixes.add(clean);
          if (SUBJECT_TO_TEACHER_PREFIX[code]) {
            SUBJECT_TO_TEACHER_PREFIX[code].forEach(p => targetPrefixes.add(p));
          }
        });

        let teachersFound = [];
        schoolData.teachers.forEach(t => {
          // clean teacher subject code: e.g. "Sen01" -> "sen", "Ind04" -> "ind", "Ing02" -> "ing", "Pai_01" -> "pai", "Tik_01" -> "tik"
          const tSubjBase = String(t.subject).toLowerCase().replace(/[^a-z]/g, '');
          if (Array.from(targetPrefixes).some(p => p === tSubjBase || tSubjBase.startsWith(p) || p.startsWith(tSubjBase))) {
            if (!teachersFound.find(existing => existing.name === t.name)) {
              teachersFound.push(t);
            }
          }
        });

        if (teachersFound.length > 0) {
          let listStr = teachersFound.map(t => `• **${t.name}**`).join('\n');
          return `👨‍🏫 Berikut adalah daftar guru yang mengajar mata pelajaran **${displaySubj}**:\n${listStr}`;
        } else {
          return `ℹ️ Tidak ditemukan daftar guru yang mengajar mata pelajaran **${displaySubj}** di database.`;
        }
      }

      // CASE 2B: Find specific teacher for the targetClass
      if (targetClass) {
        const classSched = schoolData.schedules[targetClass];
        let subjectExistsInClass = false;
        let foundTeacherCode = null;
        let matchedSubjName = "";

        if (classSched) {
          for (const day in classSched) {
            const item = classSched[day].find(i => {
              const s = String(i.subject).toLowerCase();
              return matchedCodes.some(code => s === code || s.startsWith(code) || code.startsWith(s));
            });
            if (item) {
              subjectExistsInClass = true;
              if (!matchedSubjName) matchedSubjName = SUBJECT_MAP[String(item.subject).toLowerCase()] || item.subject;
              if (item.teacher && item.teacher !== '-') {
                foundTeacherCode = item.teacher;
                break;
              }
            }
          }
        }

        const displaySubjTarget = matchedSubjName || displaySubj;

        if (!subjectExistsInClass) {
          return `ℹ️ Di kelas **${targetClass}** memang **tidak ada** mata pelajaran **${displaySubjTarget}** dalam jadwal pelajarannya.`;
        }

        if (foundTeacherCode) {
          const tName = getTeacherName(foundTeacherCode);
          return `👨‍🏫 Guru mata pelajaran **${displaySubjTarget}** di kelas **${targetClass}** adalah **${tName}**.`;
        } else {
          return `Mata pelajaran **${displaySubjTarget}** ada di kelas **${targetClass}**, namun nama guru pengajarnya belum tercantum di jadwal.`;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 3. DAY/TIME SPECIFIC SUBJECT SEARCH ("Kapan pelajaran Olahraga?")
  // -------------------------------------------------------------
  if (q.includes('kapan') || q.includes('hari apa')) {
    const matchedCodes = getSubjectCodesForQuery(q);
    if (matchedCodes.length > 0 && targetClass) {
      const classSched = schoolData.schedules[targetClass];
      if (classSched) {
        let foundDays = [];
        let matchedSubjName = "";
        for (const [day, items] of Object.entries(classSched)) {
          let periods = items.filter(i => matchedCodes.includes(String(i.subject).toLowerCase())).map(i => i.period);
          if (periods.length > 0) {
            foundDays.push(`**${day}** (Jam ke-${periods.join(', ')})`);
            if (!matchedSubjName) matchedSubjName = SUBJECT_MAP[String(items[0].subject).toLowerCase()] || items[0].subject;
          }
        }
        const displaySubj = matchedSubjName || SUBJECT_MAP[matchedCodes[0]] || "mata pelajaran tersebut";
        if (foundDays.length > 0) {
          return `📅 Pelajaran **${displaySubj}** untuk kelas **${targetClass}** ada di hari:\n• ${foundDays.join('\n• ')}`;
        } else {
          return `ℹ️ Di kelas **${targetClass}** memang **tidak ada** jadwal pelajaran **${displaySubj}**.`;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 4. PERIOD SPECIFIC QUERY ("Jam 3 kelas XII-1 belajar apa?")
  // -------------------------------------------------------------
  const periodMatch = q.match(/jam (?:ke-?|ke )?(\d+)/i);
  if (periodMatch) {
    const p = parseInt(periodMatch[1]);
    const classSched = schoolData.schedules[targetClass];
    const dayInfo = getTargetDaySchedule(classSched, q);
    if (dayInfo) {
      if (dayInfo.isWeekend) {
        let label = dayInfo.relativeTerm ? `hari ${dayInfo.relativeTerm} (${dayInfo.dayName})` : `hari ${dayInfo.dayName}`;
        return `🏖️ Pada **${label}** sekolah libur (akhir pekan), sehingga tidak ada jam pelajaran ke-${p}.`;
      }
      if (dayInfo.items.length > 0) {
        let item = dayInfo.items.find(i => parseInt(i.period) === p);
        if (item) {
          let fullSubj = SUBJECT_MAP[String(item.subject).toLowerCase()] || item.subject;
          let teacherStr = getTeacherName(item.teacher);
          let label = dayInfo.relativeTerm ? `${dayInfo.relativeTerm} (Hari ${dayInfo.dayName})` : `Hari ${dayInfo.dayName}`;
          return `📖 Pada **${label}** jam ke-${p} (${item.time}) kelas **${targetClass}** ada pelajaran **${fullSubj}** ${teacherStr ? `bersama *${teacherStr}*` : ''}.`;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 5. BREAK SPECIFIC QUERY ("Habis istirahat pertama belajar apa?")
  // -------------------------------------------------------------
  if (q.includes('habis istirahat pertama') || q.includes('setelah istirahat pertama')) {
    const classSched = schoolData.schedules[targetClass];
    const dayInfo = getTargetDaySchedule(classSched, q);
    if (dayInfo) {
      if (dayInfo.isWeekend) {
        let label = dayInfo.relativeTerm ? `hari ${dayInfo.relativeTerm} (${dayInfo.dayName})` : `hari ${dayInfo.dayName}`;
        return `🏖️ Pada **${label}** sekolah libur (akhir pekan), tidak ada jam pelajaran maupun jam istirahat.`;
      }
      if (dayInfo.items.length > 0) {
        let item = dayInfo.items.find(i => parseInt(i.period) === 5);
        if (item) {
          let fullSubj = SUBJECT_MAP[String(item.subject).toLowerCase()] || item.subject;
          let teacherStr = getTeacherName(item.teacher);
          return `☕ Setelah istirahat pertama (10:00), kelas **${targetClass}** belajar **${fullSubj}** ${teacherStr ? `bersama *${teacherStr}*` : ''}.`;
        }
      }
    }
  }

  if (q.includes('habis istirahat kedua') || q.includes('setelah istirahat kedua')) {
    const classSched = schoolData.schedules[targetClass];
    const dayInfo = getTargetDaySchedule(classSched, q);
    if (dayInfo) {
      if (dayInfo.isWeekend) {
        let label = dayInfo.relativeTerm ? `hari ${dayInfo.relativeTerm} (${dayInfo.dayName})` : `hari ${dayInfo.dayName}`;
        return `🏖️ Pada **${label}** sekolah libur (akhir pekan), tidak ada jam pelajaran maupun jam istirahat.`;
      }
      if (dayInfo.items.length > 0) {
        let item = dayInfo.items.find(i => parseInt(i.period) === 8);
        if (item) {
          let fullSubj = SUBJECT_MAP[String(item.subject).toLowerCase()] || item.subject;
          let teacherStr = getTeacherName(item.teacher);
          return `🍱 Setelah istirahat kedua (13:00), kelas **${targetClass}** belajar **${fullSubj}** ${teacherStr ? `bersama *${teacherStr}*` : ''}.`;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 6. SCHOOL RULES & TATA TERTIB
  // NOTE: Rule check moved BEFORE General Schedule to prevent "Kalau saya telat masuk gerbang aturannya gimana?" triggering Schedule logic!
  // -------------------------------------------------------------
  const ruleKeywords = [
    'seragam', 'lambat', 'telat', 'hp', 'handphone', 'gawai', 'aturan', 'tata tertib', 
    'sepatu', 'rambut', 'gondrong', 'larangan', 'sanksi', 'wajib', 'baju', 'jaket', 'hoodie', 
    'kuku', 'aksesoris', 'makeup', 'make up', 'kerudung', 'jilbab', 'gerbang', 'hukuman', 
    'konsekuensi', 'sampah', 'kantin', 'sandal', 'softlens', 'lipstik',
    'izin', 'pulang', 'tumbler', 'pelanggaran', 'kaos kaki', 'tato', 'rokok', 'vape', 'pod',
    'mencontek', 'tindik', 'celana', 'rok', 'bawahan', 'pakaian dalam'
  ];
  
  if (ruleKeywords.some(kw => q.includes(kw))) {
    incrementAnalytics("Tata Tertib");

    if (!schoolData.rules || schoolData.rules.length === 0) {
      return `📜 Data tata tertib belum tersedia.`;
    }

    // ── Granular Specific Rule Matches ──────────────────────────────
    
    let matchedTopics = [];

    // 0. Aturan Pakaian Dalam / Celana Dalam
    if (q.includes('celana dalam') || q.includes('pakaian dalam') || q.includes('sempak') || q.includes('kancut')) {
      matchedTopics.push(`🩲 **Ketentuan Pakaian Dalam:**\n• Setiap siswa dan siswi **wajib mengenakan pakaian dalam (termasuk celana dalam)** secara lengkap, sopan, dan bersih demi menjaga etika kesusilaan, kebersihan, serta kenyamanan selama beraktivitas di sekolah.`);
    }

    // 0.1 Aturan Celana & Rok (Bawahan Seragam)
    if (q.includes('rok') || (q.includes('celana') && !q.includes('celana dalam')) || q.includes('bawahan')) {
      if (q.includes('rok')) {
        matchedTopics.push(`👗 **Ketentuan Bawahan Rok:**\n• **Siswi Perempuan (Putri)**: **Wajib** mengenakan rok panjang (rok abu-abu untuk Senin, Selasa, Kamis, Jumat, dan rok cokelat untuk Pramuka pada hari Rabu).\n• **Siswa Laki-laki**: Tidak diperbolehkan mengenakan rok, melainkan wajib mengenakan celana panjang.`);
      }
      if (q.includes('celana') && !q.includes('celana dalam')) {
        matchedTopics.push(`👖 **Ketentuan Bawahan Celana:**\n• **Siswa Laki-laki (Putra)**: **Wajib** mengenakan celana panjang reguler sesuai ketentuan hari (abu-abu atau pramuka), tidak boleh bermodel pensil/ketat, cutbray, atau sobek.\n• **Siswi Perempuan (Putri)**: Wajib mengenakan rok panjang untuk seragam harian sekolah. Penggunaan celana panjang hanya diperbolehkan saat jam pelajaran Olahraga (celana training/PJOK).`);
      }
    }

    // 1. Aturan Rambut
    if (q.includes('rambut') || q.includes('gondrong')) {
      if (q.includes('cowok') || q.includes('laki') || q.includes('pria') || q.includes('putra')) {
        matchedTopics.push(`✂️ **Aturan Rambut Siswa (Laki-laki / Cowok):**\n• Siswa laki-laki dilarang berambut gondrong (wajib dipotong rapi dengan model pola 3-2-1).\n• Dilarang mewarnai rambut selain warna hitam alami.\n• Dilarang menggunakan aksesoris rambut.`);
      } else if (q.includes('cewek') || q.includes('perempuan') || q.includes('wanita') || q.includes('putri')) {
        matchedTopics.push(`✂️ **Aturan Rambut Siswi (Perempuan / Cewek):**\n• Bagi siswi yang tidak berkerudung/berjilbab, rambut wajib dirapikan dengan cara dikepang 2 atau dikuncir ekor kuda.\n• Dilarang mewarnai rambut selain warna hitam alami.`);
      } else {
        matchedTopics.push(`✂️ **Aturan Rambut Siswa SMAN 1 Sumedang:**\n• **Laki-laki (Putra)**: Dilarang gondrong (harus potong rapi ukuran 3-2-1) & dilarang memakai aksesoris.\n• **Perempuan (Putri)**: Bagi yang tidak berjilbab, rambut wajib dikepang 2 atau dikuncir ekor kuda.\n• **Umum**: Dilarang mewarnai rambut selain warna hitam.`);
      }
    }

    // 2. Aturan Sepatu, Kaos Kaki, & Sandal
    if (q.includes('sepatu') || q.includes('kaos kaki') || q.includes('kaoskaki') || q.includes('sandal')) {
      matchedTopics.push(`👟 **Aturan Sepatu & Kaos Kaki:**\n• **Sepatu**: Wajib menggunakan sepatu berwarna hitam polos.\n• **Kaos Kaki**: Wajib panjang setengah betis (warna hitam untuk putra, warna putih untuk putri).\n• **Sandal**: Dilarang menggunakan sandal selama jam pembelajaran berlangsung di sekolah.`);
    }

    // 3. Aturan Seragam & Jilbab
    if (q.includes('seragam') || q.includes('baju') || q.includes('jilbab') || q.includes('kerudung')) {
      if (q.includes('jilbab') || q.includes('kerudung')) {
        matchedTopics.push(`🧕 **Ketentuan Kerudung / Jilbab:**\n• Siswi muslim yang memakai jilbab wajib menggunakan kerudung kain model persegi/segi empat yang rapi sesuai ketentuan seragam hari tersebut (bukan model pashmina atau instan tanpa bentuk).`);
      } else if (q.includes('senin') || q.includes('selasa')) {
        matchedTopics.push(`👔 **Seragam Hari Senin & Selasa:**\n• PSAS Putih-Abu model reguler lengkap dengan atribut seragam nasional (badge, dasi, ikat pinggang).\n• Sepatu hitam dan kaos kaki setengah betis (hitam untuk putra, putih untuk putri).`);
      } else if (q.includes('rabu')) {
        matchedTopics.push(`👔 **Seragam Hari Rabu:**\n• Seragam Pramuka lengkap sesuai ketentuan seragam kepramukaan sekolah.`);
      } else if (q.includes('kamis')) {
        matchedTopics.push(`👔 **Seragam Hari Kamis:**\n• Atasan kemeja Batik SMANSA dan bawahan celana panjang (putra) atau rok panjang abu-abu (putri).`);
      } else if (q.includes('jumat')) {
        matchedTopics.push(`👔 **Seragam Hari Jumat:**\n• Atasan kemeja Tunik SMANSA dan bawahan celana panjang (putra) atau rok panjang abu-abu (putri).`);
      } else {
        matchedTopics.push(`👔 **Jadwal & Aturan Seragam Sekolah SMAN 1 Sumedang:**\n• **Senin & Selasa**: PSAS Putih-Abu reguler + atribut nasional lengkap.\n• **Rabu**: Seragam Pramuka lengkap.\n• **Kamis**: Kemeja Batik SMANSA + bawahan celana/rok panjang abu.\n• **Jumat**: Kemeja Tunik SMANSA + bawahan celana/rok panjang abu.\n• **Kerudung**: Siswi muslim wajib menggunakan model kain segi empat persegi.\n• **Sepatu & Kaos Kaki**: Sepatu hitam polos, kaos kaki setengah betis (hitam putra, putih putri).`);
      }
    }

    // 4. Keterlambatan, Gerbang, Jam Masuk
    if (q.includes('telat') || q.includes('lambat') || q.includes('gerbang') || q.includes('jam masuk')) {
      matchedTopics.push(`⏰ **Aturan Kehadiran & Keterlambatan:**\n• Siswa wajib hadir di sekolah paling lambat 15 menit sebelum bel berbunyi (bel dibunyikan & pintu gerbang ditutup pukul **06.30 WIB**).\n• Siswa yang terlambat akan diberikan pembinaan di tempat khusus terlebih dahulu sebelum diperbolehkan mengikuti kegiatan pembelajaran.`);
    }

    // 5. Izin Pulang / Meninggalkan Sekolah
    if (q.includes('pulang') || q.includes('izin') || q.includes('keluar')) {
      matchedTopics.push(`🚪 **Tata Cara Izin Keluar Lingkungan Sekolah:**
Terdapat dua jenis izin keluar sekolah, silakan ikuti prosedur berikut sesuai keperluanmu:

**1. Izin Keluar & Kembali Lagi ke Sekolah (Sebelum jam pelajaran berakhir)**
• **Lapor Piket:** Pergi ke meja resepsionis/piket untuk meminta 1 lembar kertas keterangan izin keluar.
• **Isi Data:** Tulis nama dan tanda tanganmu di buku piket. Setelah itu, isi alasan, jam keluar, dan tanda tangan pada kertas izin tersebut.
• **Minta Tanda Tangan Persetujuan:** Secara berurutan mintalah tanda tangan kepada: Guru yang sedang mengajar (atau Wali Kelas), lalu ke Wakasek Kesiswaan, dan terakhir ke Guru Piket.
• **Lapor Satpam:** Serahkan surat izin yang sudah lengkap tanda tangannya kepada Satpam di gerbang depan, dan kamu diizinkan untuk pergi.

**2. Izin Keluar Tanpa Kembali Lagi (Pulang lebih awal)**
Prosedurnya sama persis dengan cara di atas, dengan sedikit perbedaan:
• Kamu diwajibkan meminta dan mengisi **2 rangkap** kertas keterangan izin keluar.
• Satu surat diserahkan kepada Satpam, dan **satu surat lagi harus diletakkan di meja guru** di dalam kelasmu.`);
    }

    // 6. Make-up, Lipstik, Kuku, Softlens, Perhiasan, & Tindik
    if (q.includes('makeup') || q.includes('make up') || q.includes('lipstik') || q.includes('kuku') || q.includes('softlens') || q.includes('perhiasan') || q.includes('tindik') || q.includes('aksesoris')) {
      matchedTopics.push(`💄 **Aturan Penampilan & Aksesoris:**\n• **Make-up & Wajah**: Dilarang menggunakan make up, lipstik, dan acne patch warna-warni.\n• **Kuku**: Dilarang memanjangkan kuku dan dilarang mencat/mewarnai kuku.\n• **Softlens**: Dilarang memakai softlens berwarna.\n• **Perhiasan/Tindik**: Dilarang memakai perhiasan berlebihan. Siswi putri hanya diperbolehkan menindik telinga maksimal 1 tindikan di tiap daun telinga. Siswa putra dilarang bertindik & dilarang memakai aksesoris.`);
    }

    // 7. Jaket & Hoodie
    if (q.includes('jaket') || q.includes('hoodie')) {
      matchedTopics.push(`🧥 **Aturan Pemakaian Jaket / Hoodie:**\n• Siswa dilarang memakai jaket atau hoodie di lingkungan sekolah, kecuali dalam kondisi sakit atau telah mendapatkan izin khusus dari guru piket/kelas.`);
    }

    // 8. Handphone / Gawai
    if (q.includes('hp') || q.includes('handphone') || q.includes('gawai')) {
      matchedTopics.push(`📱 **Aturan Penggunaan HP / Handphone:**\n• Siswa wajib bijak bermedia sosial dan mematuhi Prosedur Operasional Standar (POS) Gawai sekolah.\n• Penggunaan HP selama jam KBM hanya diperbolehkan apabila diinstruksikan atau atas izin guru pengajar untuk keperluan belajar.`);
    }

    // 9. Kantin, Sampah, & Tumbler
    if (q.includes('kantin') || q.includes('sampah') || q.includes('tumbler') || q.includes('makan')) {
      matchedTopics.push(`🍱 **Aturan Kantin & Lingkungan Sekolah:**\n• Siswa dilarang berada di kantin saat jam pelajaran atau saat pergantian jam pelajaran berlangsung.\n• Setiap siswa diwajibkan membawa tempat makan dan botol minum (**tumbler**) sendiri untuk mengurangi sampah plastik.\n• Wajib membuang sampah pada tempat yang sesuai dengan pemilahannya (organik, anorganik, dan B3).`);
    }

    // 10. Sanksi / Konsekuensi Pelanggaran
    if (q.includes('sanksi') || q.includes('hukuman') || q.includes('konsekuensi') || q.includes('pelanggaran')) {
      matchedTopics.push(`⚖️ **Konsekuensi / Sanksi Pelanggaran:**\nApabila siswa melanggar tata tertib sekolah, akan dikenakan tahapan sanksi berikut:\n1. Peringatan Lisan\n2. Peringatan Tertulis\n3. Pemanggilan Orang Tua / Wali Siswa\n4. Dikembalikan kepada Orang Tua (Dikeluarkan dari sekolah).`);
    }

    // 11. Larangan Keras (Rokok, Vape, Narkoba, Tawuran, Bullying, Tato)
    if (q.includes('rokok') || q.includes('vape') || q.includes('pod') || q.includes('narkoba') || q.includes('tawuran') || q.includes('berkelahi') || q.includes('bullying') || q.includes('tato')) {
      matchedTopics.push(`🚫 **Larangan Keras SMAN 1 Sumedang:**\n• Dilarang berkelahi, menghasut, mengintimidasi, atau melakukan tindakan BULLYING.\n• Dilarang membawa, memakai, atau mengedarkan narkoba, zat adiktif, miras, dan rokok/vape/pod.\n• Dilarang bertato, membawa senjata tajam/senjata api, merusak fasilitas sekolah, serta tindakan pornografi/pornoaksi.`);
    }



    if (matchedTopics.length > 0) {
      return matchedTopics.join('\n\n---\n\n');
    }

    // Fallback if generic: Show full rules
    let res = `📜 **Informasi Tata Tertib SMAN 1 Sumedang:**\n\n`;
    schoolData.rules.forEach(r => {
      res += `🔹 **${r.category}**:\n${r.details}\n\n`;
    });
    return res;
  }

  // -------------------------------------------------------------
  // 7. INFORMASI UMUM SMAN 1 SUMEDANG
  // -------------------------------------------------------------
  const infoKeywords = ['alamat', 'lokasi', 'di mana', 'dimana', 'telepon', 'kontak', 'email', 'website', 'instagram', 'ig', 'akreditasi', 'sejarah', 'berdiri', 'tertua', 'ekskul', 'ekstrakurikuler', 'organisasi', 'mars', 'hymne', 'osis'];
  if (infoKeywords.some(kw => q.includes(kw))) {
    let infoTopics = [];

    if (q.includes('mars') || q.includes('hymne')) {
      infoTopics.push(`🎵 **Mars SMAN 1 Sumedang:**\n*(Belum ada lirik resmi di database, silakan tanyakan ke guru Seni Budaya atau anggota Paduan Suara).*`);
    }
    
    if (q.includes('alamat') || q.includes('lokasi') || q.includes('di mana') || q.includes('dimana')) {
      infoTopics.push(`📍 **Alamat SMAN 1 Sumedang:**\nJl. Prabu Geusan Ulun No. 39, Kota Kulon, Kec. Sumedang Selatan, Kab. Sumedang, Jawa Barat (Kode Pos 45312).`);
    }
    if (q.includes('telepon') || q.includes('kontak') || q.includes('email') || q.includes('website') || q.includes('instagram') || q.includes('ig')) {
      infoTopics.push(`📞 **Kontak & Media Sosial:**\n• **Telepon**: (0261) 201850\n• **Email**: sman1sumedang@gmail.com\n• **Website**: https://www.smanegeri1sumedang.sch.id`);
    }
    if (q.includes('akreditasi')) {
      infoTopics.push(`🏆 **Akreditasi:**\nSMAN 1 Sumedang saat ini menyandang akreditasi **A**.`);
    }
    if (q.includes('sejarah') || q.includes('berdiri') || q.includes('tertua')) {
      const sejarahSingkat = `🏛️ **Sejarah Singkat SMAN 1 Sumedang:**\nSMAN 1 Sumedang berdiri sejak **1 Oktober 1958**, menjadikannya sebagai Sekolah Menengah Atas Negeri tertua di Kabupaten Sumedang.`;
      const sejarah = `🏛️ **Sejarah SMAN 1 Sumedang:**\nSMAN 1 Sumedang merupakan salah satu sekolah tertua dan favorit di pusat Kabupaten Sumedang yang berlokasi di Jalan Pangeran Geusan Ulun No. 39. Melalui musyawarah pada 9 Oktober 2014, hari jadinya resmi ditetapkan jatuh pada 1 Oktober 1958, merujuk pada serah terima operasional sekolah yang kala itu bernama SMA Negeri ABC Sumedang di bawah kepemimpinan Kosam Erawan. Mulai menempati lokasinya saat ini sejak tahun ajaran 1960/1961, sekolah ini terus berkembang seiring penyesuaian kurikulum nasional serta mengalami beberapa kali perubahan nama dari SMAN Sumedang, SMUN Sumedang, hingga akhirnya menjadi SMAN 1 Sumedang yang namanya tetap dipertahankan saat penataan nomenklatur sekolah di Jawa Barat pada 2018.`;

      if (q.includes('singkat') || q.includes('ringkas') || q.includes('kapan berdiri')) {
        infoTopics.push(sejarahSingkat);
      } else {
        infoTopics.push(sejarah);
      }
    }
    if (q.includes('ekskul') || q.includes('ekstrakurikuler') || q.includes('organisasi') || q.includes('osis')) {
      let eksMsg = `⚽ **Ekstrakurikuler & Organisasi (Ekskul):**\n• **Kepemimpinan/Organisasi**: OSIS SMANSA (Pembina: **Ricki Cahyana Yuswa, S.Sos.**), MPK ADINIRA, Paskibra (Passmansa), Pramuka (ASDS).\n• **Keagamaan**: DKM Nurul Ilmi, Keputrian.\n• **Olahraga**: Futsal, Sepak Bola, Basket, Voli, Bulu Tangkis, Atletik, Karate, Silat, Taekwondo, Boxer.\n• **Seni & Budaya**: Lises Adinira, JIDAT (Teater), Gita Suara Adinira (Padus).\n• **Akademik & Minat**: KIR, PMR, Repala, Adiwiyata, KWU, Media Smansa, Japanese Club, English Club.`;
      if (q.includes('aturan') || q.includes('wajib') || q.includes('tata tertib')) {
        eksMsg += `\n\n🏅 **Aturan OSIS & Ekstrakurikuler:**\n• Siswa wajib berperan aktif dalam kegiatan OSIS.\n• Siswa wajib mengikuti kegiatan ekstrakurikuler pada semester 1 sampai dengan semester 5.\n• Dilarang membentuk organisasi/komunitas yang membawa nama SMAN 1 Sumedang tanpa izin resmi pihak sekolah.`;
      }
      infoTopics.push(eksMsg);
    }

    if (infoTopics.length > 0) {
      incrementAnalytics("Profil & Ekskul");
      return infoTopics.join('\n\n');
    }
  }

  // -------------------------------------------------------------
  // 8. REALTIME "SEKARANG" QUERY ("Sekarang jam pelajaran apa di kelas X-1?")
  // -------------------------------------------------------------
  if (q.includes('sekarang') || q.includes('saat ini') || q.includes('lagi belajar apa') || q.includes('sedang belajar apa')) {
    incrementAnalytics("Jadwal Pelajaran");

    const classSched = schoolData.schedules[targetClass];
    if (!classSched) {
      return `Jadwal untuk kelas **${targetClass}** belum tersedia di database.`;
    }

    const now = new Date();
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = dayNames[now.getDay()];

    // Weekend check
    if (currentDayName === 'Minggu' || currentDayName === 'Sabtu') {
      return `📅 Hari ini adalah hari **${currentDayName}** (Akhir Pekan/Libur). Sekolah sedang tidak ada kegiatan belajar mengajar.`;
    }

    const todayItems = classSched[currentDayName] || [];
    if (todayItems.length === 0) {
      return `📅 Tidak ada jadwal pelajaran yang tercatat untuk kelas **${targetClass}** pada hari **${currentDayName}**.`;
    }

    function parseTimeToMinutes(timeStr) {
      if (!timeStr) return 0;
      const parts = timeStr.trim().split(':');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentTimeFormatted = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ' WIB';

    // Resolve schedule mode
    const isShortMode = currentScheduleMode === 'short';
    const break1TimeStr = isShortMode ? BREAK_SHORT_1 : "09:30 - 10:00";
    const break2TimeStr = isShortMode ? BREAK_SHORT_2 : "12:00 - 13:00";
    const break1LabelStr = isShortMode ? "ISTIRAHAT" : "ISTIRAHAT PERTAMA";
    const break2LabelStr = isShortMode ? "ISTIRAHAT" : "ISTIRAHAT KEDUA";
    const break1Threshold = isShortMode ? 6 : 5;
    const break2Threshold = (isShortMode && currentDayName === 'Jumat') ? 9 : 8;

    const b1Start = parseTimeToMinutes(break1TimeStr.split('-')[0]);
    const b1End = parseTimeToMinutes(break1TimeStr.split('-')[1]);
    const b2Start = parseTimeToMinutes(break2TimeStr.split('-')[0]);
    const b2End = parseTimeToMinutes(break2TimeStr.split('-')[1]);

    // Build time-overridden item list
    let activeItemsWithTime = todayItems.map(item => {
      let pNum = parseInt(item.period);
      if (isShortMode && currentDayName === 'Jumat' && pNum === 8) {
        pNum = 7;
      }
      const activeTime = (isShortMode && TIME_SLOTS_SHORT[pNum]) ? TIME_SLOTS_SHORT[pNum] : item.time;
      return { ...item, period: pNum, activeTime };
    });

    if (isShortMode && currentDayName === 'Jumat') {
      activeItemsWithTime.push({
        period: 8,
        subject: 'SHOLAT JUMAT',
        teacher: '-',
        room: '-',
        activeTime: '11:25 - 12:00'
      });
      activeItemsWithTime.sort((a,b) => parseInt(a.period) - parseInt(b.period));
    }

    // Before school starts
    const firstItem = activeItemsWithTime[0];
    if (firstItem && firstItem.activeTime) {
      const schoolStartMin = parseTimeToMinutes(firstItem.activeTime.split('-')[0]);
      if (currentMinutes < schoolStartMin) {
        let subj = SUBJECT_MAP[String(firstItem.subject).toLowerCase()] || firstItem.subject;
        let tStr = getTeacherName(firstItem.teacher);
        return `⏰ Saat ini pukul **${currentTimeFormatted}**. Sekolah belum dimulai.\n\nJam pertama kelas **${targetClass}** dimulai pukul **${firstItem.activeTime.split('-')[0].trim()}** dengan pelajaran **${subj}** ${tStr ? `bersama *${tStr}*` : ''}.`;
      }
    }

    // After school ends
    const lastItem = activeItemsWithTime[activeItemsWithTime.length - 1];
    const schoolEndMin = lastItem && lastItem.activeTime ? parseTimeToMinutes(lastItem.activeTime.split('-')[1]) : 900;
    if (currentMinutes >= schoolEndMin) {
      return `🎒 Saat ini pukul **${currentTimeFormatted}**. Seluruh kegiatan belajar mengajar untuk kelas **${targetClass}** hari ini sudah selesai. Waktunya pulang dan istirahat!`;
    }

    // Break 1
    if (currentMinutes >= b1Start && currentMinutes < b1End) {
      const pNext = activeItemsWithTime.find(i => parseInt(i.period) === break1Threshold);
      let nextSubj = pNext ? (SUBJECT_MAP[String(pNext.subject).toLowerCase()] || pNext.subject) : '';
      let nextT = pNext ? getTeacherName(pNext.teacher) : '';
      return `☕ Saat ini pukul **${currentTimeFormatted}**, sedang waktu **${break1LabelStr}** (${break1TimeStr} WIB).\n\nSetelah istirahat, kelas **${targetClass}** akan belajar **${nextSubj}** ${nextT ? `bersama *${nextT}*` : ''} (Jam ke-${break1Threshold}).`;
    }

    // Break 2
    if (currentMinutes >= b2Start && currentMinutes < b2End) {
      const pNext = activeItemsWithTime.find(i => parseInt(i.period) === break2Threshold);
      let nextSubj = pNext ? (SUBJECT_MAP[String(pNext.subject).toLowerCase()] || pNext.subject) : '';
      let nextT = pNext ? getTeacherName(pNext.teacher) : '';
      return `🍱 Saat ini pukul **${currentTimeFormatted}**, sedang waktu **${break2LabelStr}** (${break2TimeStr} WIB).\n\nSetelah istirahat, kelas **${targetClass}** akan belajar **${nextSubj}** ${nextT ? `bersama *${nextT}*` : ''} (Jam ke-${break2Threshold}).`;
    }

    // Check active period
    let activeItem = null;
    for (const item of activeItemsWithTime) {
      if (!item.activeTime || !item.activeTime.includes('-')) continue;
      const [startStr, endStr] = item.activeTime.split('-');
      const startMin = parseTimeToMinutes(startStr);
      const endMin = parseTimeToMinutes(endStr);
      if (currentMinutes >= startMin && currentMinutes < endMin) {
        activeItem = item;
        break;
      }
    }

    if (activeItem) {
      let fullSubj = SUBJECT_MAP[String(activeItem.subject).toLowerCase()] || activeItem.subject;
      let tStr = getTeacherName(activeItem.teacher);
      return `📖 Saat ini (**${currentTimeFormatted}**), kelas **${targetClass}** sedang pelajaran:\n\n🔹 **${fullSubj}** ${tStr ? `\n👨‍🏫 Guru: *${tStr}*` : ''}\n⏰ Jam ke-${activeItem.period} (${activeItem.activeTime})`;
    }

    // Between periods (jeda/pergantian jam)
    let nextItem = activeItemsWithTime.find(item => {
      if (!item.activeTime || !item.activeTime.includes('-')) return false;
      const startMin = parseTimeToMinutes(item.activeTime.split('-')[0]);
      return startMin > currentMinutes;
    });

    if (nextItem) {
      let fullSubj = SUBJECT_MAP[String(nextItem.subject).toLowerCase()] || nextItem.subject;
      let tStr = getTeacherName(nextItem.teacher);
      return `⏳ Saat ini (**${currentTimeFormatted}**) sedang waktu jeda / pergantian jam pelajaran.\n\nPelajaran berikutnya untuk kelas **${targetClass}** adalah **${fullSubj}** ${tStr ? `bersama *${tStr}*` : ''} (Jam ke-${nextItem.period}, dimulai pukul ${nextItem.activeTime.split('-')[0].trim()}).`;
    }

    return `Saat ini pukul **${currentTimeFormatted}**, tidak ada jam pelajaran aktif untuk kelas **${targetClass}**.`;
  }

  // -------------------------------------------------------------
  // 7. GENERAL SCHEDULE FOR A DAY ("Jadwal besok kelas XII-1 apa?", "Lusa kelas X-1 belajar apa?", "Kemarin belajar apa?")
  // -------------------------------------------------------------
  if (q.includes('jadwal') || q.includes('pelajaran') || q.includes('besok') || q.includes('kemarin') || q.includes('lusa') || q.includes('hari ini') || q.includes('belajar')) {
    incrementAnalytics("Jadwal Pelajaran");
    const classSched = schoolData.schedules[targetClass];
    if (!classSched) {
      return `Jadwal untuk kelas **${targetClass}** belum tersedia di database.`;
    }
    const dayInfo = getTargetDaySchedule(classSched, q);
    
    if (dayInfo) {
      // ── Handle Weekend (Sabtu & Minggu) ──
      if (dayInfo.isWeekend) {
        let label = dayInfo.relativeTerm 
          ? `${dayInfo.relativeTerm.charAt(0).toUpperCase() + dayInfo.relativeTerm.slice(1)} (Hari ${dayInfo.dayName})`
          : `Hari ${dayInfo.dayName}`;
          
        let msg = `🏖️ **${label} adalah hari libur akhir pekan!**\nTidak ada kegiatan belajar mengajar (KBM) di sekolah pada hari ${dayInfo.dayName}.\n\n`;

        let isShort = currentScheduleMode === 'short';
        if (q.includes('normal')) isShort = false;
        else if (q.includes('pendek')) isShort = true;

        const break1Time = isShort ? BREAK_SHORT_1 : "09:30 - 10:00";
        const break2Time = isShort ? BREAK_SHORT_2 : "12:00 - 13:00";
        const break1Label = isShort ? "ISTIRAHAT" : "ISTIRAHAT PERTAMA";
        const break2Label = isShort ? "ISTIRAHAT" : "ISTIRAHAT KEDUA";
        const break1Threshold = isShort ? 6 : 5;
        const break2Threshold = 8;

        // Redirect to Monday's schedule
        const mondayItems = classSched['Senin'] || [];
        if (mondayItems.length > 0) {
          msg += `📅 Sebagai panduan, berikut adalah jadwal masuk sekolah berikutnya untuk kelas **${targetClass}** pada hari **Senin**:<br><br>`;
          msg += renderSmartScheduleCards(mondayItems, isShort, 'Senin');
        }
        return msg;
      }

      // ── Handle Weekday (Senin - Jumat) ──
      if (dayInfo.items.length > 0) {
        let isShort = currentScheduleMode === 'short';
        if (q.includes('normal')) isShort = false;
        else if (q.includes('pendek')) isShort = true;
        
        let modifiedItems = dayInfo.items.map(item => ({...item}));
        
        if (dayInfo.dayName === 'Senin') {
          modifiedItems = modifiedItems.filter(item => parseInt(item.period) !== 1);
          modifiedItems.push({
            period: 1,
            subject: 'UPACARA BENDERA',
            teacher: '-',
            room: 'Lapangan',
            time: '06:50 - 07:30'
          });
        }

        if (isShort && dayInfo.dayName === 'Jumat') {
          modifiedItems.forEach(item => {
            if (parseInt(item.period) === 8) item.period = 7;
          });
          modifiedItems.push({
            period: 8,
            subject: 'SHOLAT JUMAT',
            teacher: '-',
            room: '-',
            time: '11:25 - 12:00'
          });
        } else if (!isShort && dayInfo.dayName === 'Jumat') {
          modifiedItems.forEach(item => {
            let p = parseInt(item.period);
            if (p >= 8) item.period = p - 1;
          });
        }

        const break1Time = isShort ? BREAK_SHORT_1 : "09:30 - 10:00";
        const break2Time = isShort ? BREAK_SHORT_2 : (dayInfo.dayName === 'Jumat' ? "11:20 - 13:00" : "11:45 - 12:30");
        const break1Label = isShort ? "ISTIRAHAT" : "ISTIRAHAT PERTAMA";
        const break2Label = isShort ? "ISTIRAHAT" : "ISTIRAHAT KEDUA";
        const break1Threshold = isShort ? 6 : 5;
        const break2Threshold = isShort ? 9 : (dayInfo.dayName === 'Jumat' ? 7 : 8);

        let headerLabel = dayInfo.relativeTerm 
          ? `${dayInfo.relativeTerm.charAt(0).toUpperCase() + dayInfo.relativeTerm.slice(1)} (Hari ${dayInfo.dayName})`
          : `Hari ${dayInfo.dayName}`;
        
        let titleSuffix = '';
        if (q.includes('normal') || q.includes('pendek')) {
          titleSuffix = isShort ? ' (Mode Pendek)' : ' (Mode Normal)';
        }

        let res = `📅 **Jadwal Pelajaran ${targetClass} — ${headerLabel}${titleSuffix}:**<br><br>`;
        res += renderSmartScheduleCards(modifiedItems, isShort, dayInfo.dayName);
        return res;
      } else {
        return `📅 Tidak ada jadwal pelajaran yang tercatat untuk kelas **${targetClass}** pada hari **${dayInfo.dayName}**.`;
      }
    }
  }

  // -------------------------------------------------------------
  // 8. PENGUMUMAN & UJIAN/LIBUR (Basic Tracking & Response)
  // -------------------------------------------------------------
  if (q.includes('pengumuman') || q.includes('info') || q.includes('berita')) {
    incrementAnalytics("Pengumuman");
    return `📢 **Pengumuman Terbaru:**\nSilakan cek kolom "Pengumuman" di bawah kotak obrolan ini untuk melihat informasi atau kegiatan terbaru dari sekolah.`;
  }

  if (q.includes('ujian') || q.includes('libur') || /\bpts\b/.test(q) || /\bpas\b/.test(q) || q.includes('semester')) {
    incrementAnalytics("Ujian & Libur");
    return `🗓️ **Info Ujian & Libur:**\nSaat ini jadwal pasti mengenai ujian atau hari libur (selain akhir pekan) belum tersedia di jadwal rutin. Silakan periksa kolom Pengumuman untuk info lebih lanjut.`;
  }

  // -------------------------------------------------------------
  // FALLBACK RESPONSE
  // -------------------------------------------------------------
  incrementAnalytics("Lain-lain");
  return `Maaf, saya belum menemukan informasi spesifik mengenai "*${rawQuery}*".<br><br>
Kamu bisa mencoba mencari informasi lain:<br>
<div class="ai-suggestion-chips" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
  <button onclick="sendQuickPrompt('Besok jadwal kelas X-1 apa?')" class="chip-btn">📅 Jadwal Besok</button>
  <button onclick="sendQuickPrompt('Siapa guru Fisika kelas XII-2?')" class="chip-btn">👥 Cek Guru</button>
  <button onclick="sendQuickPrompt('Aturan rambut')" class="chip-btn">✂️ Tata Tertib</button>
  <button onclick="sendQuickPrompt('Wakil Kepala Sekolah')" class="chip-btn">🎓 Pimpinan Sekolah</button>
</div>`;
}


// ── Migration Script (Admin Use Only) ───────────
window.migrateDataToFirestore = async function() {
  if (typeof db === 'undefined' || !schoolData) {
    console.error("Firebase db or schoolData not loaded.");
    return;
  }
  console.log("Memulai migrasi data ke Firestore...");
  try {
    await db.collection('edusmansa').doc('schoolData').set(schoolData);
    console.log("✅ Migrasi berhasil! Data sekolah sekarang ada di Firestore.");
    alert("Migrasi berhasil! Cek Firebase Console kamu.");
  } catch (error) {
    console.error("❌ Gagal migrasi:", error);
    alert("Gagal migrasi. Cek console log. (Mungkin aturan keamanan belum diganti ke mode uji coba/test mode)");
  }
};

// ── PWA Install Prompt ────────────────────────
let _pwaInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Don't show default browser mini-infobar
  _pwaInstallPrompt = e;
  // Show our custom install button
  const btn = document.getElementById('btn-install-pwa');
  if (btn) btn.style.display = 'flex';
});

function installPWA() {
  if (!_pwaInstallPrompt) return;
  _pwaInstallPrompt.prompt();
  _pwaInstallPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('✅ Pengguna menerima instalasi PWA');
    }
    _pwaInstallPrompt = null;
    const btn = document.getElementById('btn-install-pwa');
    if (btn) btn.style.display = 'none';
  });
}

// Hide install button if app is already running as installed PWA
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('btn-install-pwa');
  if (btn) btn.style.display = 'none';
  _pwaInstallPrompt = null;
});



// === JADWAL TIMELINE GURU (PUBLIC) ===
window.openPublicTeacherSchedule = function(teacherCode) {
  const modal = document.getElementById('public-teacher-modal');
  if (modal) modal.style.display = 'flex';
  
  const container = document.getElementById('public-teacher-schedule-container');
  if (!container || !schoolData || !schoolData.schedules) return;
  
  const tObj = schoolData.teachers.find(t => t.subject === teacherCode);
  const teacherName = tObj ? toTitleCaseTeacherName(tObj.name) : teacherCode;
  
  const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const PERIODS_PER_DAY = { "Senin":10, "Selasa":10, "Rabu":10, "Kamis":10, "Jumat":7 };
  const allClasses = Object.keys(schoolData.schedules);
  
  let totalHours = 0;
  let classesTaught = new Set();
  
  let dayData = {};
  DAYS.forEach(d => dayData[d] = []);
  
  for (const c of allClasses) {
    for (const d of DAYS) {
      if (schoolData.schedules[c] && schoolData.schedules[c][d]) {
        for (let p=1; p<=PERIODS_PER_DAY[d]; p++) {
          const cell = schoolData.schedules[c][d][p-1];
          if (cell && cell.teacher === teacherCode) {
            dayData[d].push({ period: p, className: c });
            totalHours++;
            classesTaught.add(c);
          }
        }
      }
    }
  }
  
  let dayGroups = {};
  DAYS.forEach(d => {
    dayGroups[d] = [];
    dayData[d].sort((a,b) => a.period - b.period);
    
    let currentGroup = null;
    for (const item of dayData[d]) {
      if (!currentGroup) {
        currentGroup = { start: item.period, end: item.period, className: item.className };
      } else {
        if (item.period === currentGroup.end + 1 && item.className === currentGroup.className) {
          currentGroup.end = item.period;
        } else {
          dayGroups[d].push(currentGroup);
          currentGroup = { start: item.period, end: item.period, className: item.className };
        }
      }
    }
    if (currentGroup) dayGroups[d].push(currentGroup);
  });
  
  const classBadges = Array.from(classesTaught).sort().map(c => `<span style="background: var(--navy-light); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-right: 4px; font-weight: 600;">${c}</span>`).join('');
  
  let html = `
    <div style="background: var(--navy); color: white; padding: 20px; text-align: center;">
      <h2 style="margin: 0 0 5px 0; font-size: 1.2rem;">${teacherName}</h2>
      <div style="font-size: 0.85rem; opacity: 0.9;">📚 Mapel: <b>${teacherCode}</b> | ⏱️ Total: <b>${totalHours} JP</b></div>
      <div style="margin-top: 10px; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px;">
        ${classBadges || '<span style="font-size: 0.8rem;">Belum ada jadwal mengajar</span>'}
      </div>
    </div>
    <div style="padding: 15px;">
  `;
  
  DAYS.forEach(d => {
    html += `
      <div style="margin-bottom: 12px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="background: var(--bg-subtle); padding: 8px 12px; font-weight: 700; color: var(--navy); display: flex; gap: 8px; align-items: center; border-bottom: 1px solid var(--border);">
          📅 ${d}
        </div>
        <div style="padding: 10px 12px; font-size: 0.85rem; color: var(--text-primary); background: var(--bg-card);">
    `;
    
    if (dayGroups[d].length === 0) {
      html += `<div style="color: var(--text-muted); font-style: italic;">Tidak ada jadwal mengajar (Kosong)</div>`;
    } else {
      dayGroups[d].forEach(g => {
        const pStr = g.start === g.end ? `Jam ${g.start}` : `Jam ${g.start} - ${g.end}`;
        const navyLightColor = getComputedStyle(document.documentElement).getPropertyValue('--navy-light').trim() || '#3B82F6';
        html += `<div style="margin-bottom: 4px; display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border); padding-bottom: 4px;">
                    <span>• <b>${pStr}</b></span>
                    <span>Kelas <b style="color: ${navyLightColor};">${g.className}</b></span>
                 </div>`;
      });
    }
    
    html += `</div></div>`;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

window.closePublicTeacherModal = function() {
  const modal = document.getElementById('public-teacher-modal');
  if (modal) modal.style.display = 'none';
}


// === LIVE COUNTDOWN WIDGET ===
let liveWidgetInterval = null;

function updateLiveWidget() {
  const widget = document.getElementById('live-status-widget');
  if (!widget) return;
  
  if (!schoolData || !schoolData.schedules || !currentClass) {
    widget.style.display = 'none';
    return;
  }
  
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const todayName = days[now.getDay()];
  
  if (todayName === 'Minggu' || todayName === 'Sabtu') {
    widget.style.display = 'block';
    document.getElementById('live-title').innerText = "AKHIR PEKAN";
    document.getElementById('live-subject').innerText = "Sekolah Libur";
    document.getElementById('live-countdown').innerHTML = "Selamat beristirahat!";
    document.getElementById('live-progress-ring').setAttribute('stroke-dasharray', '100, 100');
    return;
  }
  
  const classSched = schoolData.schedules[currentClass][todayName];
  if (!classSched || classSched.length === 0) {
    widget.style.display = 'none';
    return;
  }
  
  const isShortMode = (currentScheduleMode === 'short');
  let activeItems = [];
  
  classSched.forEach(item => {
    let pNum = parseInt(item.period);
    if (isNaN(pNum)) return;
    let aTime = item.time;
    if (isShortMode && typeof TIME_SLOTS_SHORT !== 'undefined' && TIME_SLOTS_SHORT[pNum]) {
      aTime = TIME_SLOTS_SHORT[pNum];
    }
    activeItems.push({ ...item, period: pNum, activeTime: aTime });
  });
  
  // Insert Breaks
  if (isShortMode) {
     activeItems.push({ period: 5.5, subject: 'ISTIRAHAT PERTAMA', teacher: '-', room: '-', activeTime: '09:45 - 10:15', isBreak: true });
     activeItems.push({ period: 8.5, subject: 'ISTIRAHAT KEDUA', teacher: '-', room: '-', activeTime: '12:00 - 13:00', isBreak: true });
  } else {
     activeItems.push({ period: 4.5, subject: 'ISTIRAHAT PERTAMA', teacher: '-', room: '-', activeTime: '10:15 - 10:45', isBreak: true });
     if (todayName === 'Jumat') {
         activeItems.push({ period: 6.5, subject: 'ISTIRAHAT / SHOLAT JUMAT', teacher: '-', room: '-', activeTime: '11:45 - 13:00', isBreak: true });
     } else {
         activeItems.push({ period: 7.5, subject: 'ISTIRAHAT KEDUA', teacher: '-', room: '-', activeTime: '12:15 - 13:00', isBreak: true });
     }
  }
  
  activeItems.sort((a,b) => a.period - b.period);
  
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const currentSec = currentMin * 60 + now.getSeconds();
  
  let currentBlock = null;
  let nextBlock = null;
  
  for (let i = 0; i < activeItems.length; i++) {
    const item = activeItems[i];
    if (!item.activeTime) continue;
    const parts = item.activeTime.split('-');
    if (parts.length < 2) continue;
    
    const startParts = parts[0].trim().split(':');
    const endParts = parts[1].trim().split(':');
    const sMin = parseInt(startParts[0])*60 + parseInt(startParts[1]);
    const eMin = parseInt(endParts[0])*60 + parseInt(endParts[1]);
    
    const sSec = sMin * 60;
    const eSec = eMin * 60;
    
    if (currentSec >= sSec && currentSec < eSec) {
      currentBlock = { ...item, sSec, eSec };
      if (i + 1 < activeItems.length) {
         nextBlock = activeItems[i+1];
      }
      break;
    } else if (currentSec < sSec && !currentBlock) {
      nextBlock = { ...item, sSec, eSec };
      currentBlock = { subject: 'MENUNGGU KELAS MULAI', sSec: sSec - 1800, eSec: sSec, isWaiting: true }; // Assume 30 min before
      break;
    }
  }
  
  widget.style.display = 'block';
  
  if (currentBlock) {
    if (currentBlock.subject === 'PULANG' || (activeItems.length > 0 && currentSec >= parseTimeToMinutes(activeItems[activeItems.length-1].activeTime.split('-')[1])*60)) {
       document.getElementById('live-title').innerText = "HARI INI SELESAI";
       document.getElementById('live-subject').innerText = "Sekolah Telah Usai";
       document.getElementById('live-countdown').innerHTML = "Selamat beristirahat di rumah!";
       document.getElementById('live-progress-ring').setAttribute('stroke-dasharray', '100, 100');
       return;
    }
  
    const totalDuration = currentBlock.eSec - currentBlock.sSec;
    const elapsed = currentSec - currentBlock.sSec;
    let percentage = (elapsed / totalDuration) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    document.getElementById('live-progress-ring').setAttribute('stroke-dasharray', `${percentage}, 100`);
    
    let subjName = currentBlock.subject;
    if (SUBJECT_MAP && SUBJECT_MAP[subjName.toLowerCase()]) subjName = SUBJECT_MAP[subjName.toLowerCase()];
    
    if (currentBlock.isWaiting) {
      document.getElementById('live-title').innerText = "BERSIAP-SIAP";
      document.getElementById('live-subject').innerText = subjName;
    } else if (currentBlock.isBreak) {
      document.getElementById('live-title').innerText = "WAKTU ISTIRAHAT";
      document.getElementById('live-subject').innerText = "Sedang Istirahat ☕";
    } else {
      document.getElementById('live-title').innerText = `SEDANG BERLANGSUNG (JAM ${Math.floor(currentBlock.period)})`;
      document.getElementById('live-subject').innerText = subjName;
    }
    
    const remaining = currentBlock.eSec - currentSec;
    const rMin = Math.floor(remaining / 60);
    const rSec = remaining % 60;
    
    let nextTxt = nextBlock ? ` | Berikutnya: ${nextBlock.subject}` : '';
    document.getElementById('live-countdown').innerHTML = `<span style="display:inline-block; width:8px; height:8px; background:#4ade80; border-radius:50%; box-shadow: 0 0 8px #4ade80; animation: pulse 2s infinite;"></span> Sisa: <b>${rMin}m ${rSec}s</b> ${nextTxt}`;
  } else {
    document.getElementById('live-title').innerText = "HARI INI SELESAI";
    document.getElementById('live-subject').innerText = "Sekolah Telah Usai";
    document.getElementById('live-countdown').innerHTML = "Waktu belajar untuk hari ini sudah habis.";
    document.getElementById('live-progress-ring').setAttribute('stroke-dasharray', '100, 100');
  }
}

// Ensure parseTimeToMinutes is available or create a local one if it fails
if (typeof parseTimeToMinutes === 'undefined') {
  window.parseTimeToMinutes = function(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
}

if (!liveWidgetInterval) {
  liveWidgetInterval = setInterval(updateLiveWidget, 1000);
}


// === MODAL CATATAN & LINK PRIBADI (LOKAL) ===
let currentPrivateSubject = null;

window.openPrivateSubjectModal = function(subjectCode, teacherCode) {
  if (!subjectCode || subjectCode === '-' || subjectCode === 'PULANG') return;
  currentPrivateSubject = subjectCode;
  
  const modal = document.getElementById('private-subject-modal');
  if (!modal) return;
  
  const fullSubject = SUBJECT_MAP[String(subjectCode).toLowerCase()] || subjectCode;
  const tStr = (!teacherCode || teacherCode === '-') ? 'Tanpa Guru' : resolveTeacherName(teacherCode);
  
  document.getElementById('psm-subject').innerText = fullSubject;
  document.getElementById('psm-teacher').innerText = 'Pengajar: ' + tStr;
  
  // Load dari LocalStorage HP
  const storageKey = 'edusmansa_priv_' + currentClass + '_' + subjectCode;
  const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}');
  
  document.getElementById('psm-link-gmeet').value = savedData.gmeet || '';
  document.getElementById('psm-link-classroom').value = savedData.classroom || '';
  document.getElementById('psm-notes').value = savedData.notes || '';
  
  modal.style.display = 'flex';
}

window.closePrivateSubjectModal = function() {
  const modal = document.getElementById('private-subject-modal');
  if (modal) modal.style.display = 'none';
}

window.savePrivateSubjectData = function() {
  if (!currentPrivateSubject) return;
  const storageKey = 'edusmansa_priv_' + currentClass + '_' + currentPrivateSubject;
  
  const data = {
    gmeet: document.getElementById('psm-link-gmeet').value.trim(),
    classroom: document.getElementById('psm-link-classroom').value.trim(),
    notes: document.getElementById('psm-notes').value.trim()
  };
  
  localStorage.setItem(storageKey, JSON.stringify(data));
  
  const alertText = document.getElementById('psm-alert');
  alertText.style.opacity = '1';
  setTimeout(() => alertText.style.opacity = '0', 2500);
}

window.openPrivateLinkHub = function() {
  const gmeet = document.getElementById('psm-link-gmeet').value.trim();
  const classroom = document.getElementById('psm-link-classroom').value.trim();
  
  let opened = false;
  if (gmeet && gmeet.startsWith('http')) { window.open(gmeet, '_blank'); opened = true; }
  if (classroom && classroom.startsWith('http')) { window.open(classroom, '_blank'); opened = true; }
  
  if (!opened) {
    alert("Maaf, tidak ada link valid yang tersimpan. Pastikan link diawali dengan http:// atau https://");
  }
}
