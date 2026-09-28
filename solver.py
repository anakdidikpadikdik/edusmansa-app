from flask import Flask, request, jsonify
from flask_cors import CORS
from ortools.sat.python import cp_model

app = Flask(__name__)
CORS(app)  # Mengizinkan web HTML (port 5551) berkomunikasi dengan Python (port 5000)

@app.route('/solve', methods=['POST'])
def solve_schedule():
    data = request.json
    classes = data.get('classes', [])
    jobs_data = data.get('jobs', [])
    rules = data.get('rules', {})
    
    print(f"\n[INFO] Menerima tugas penjadwalan untuk {len(classes)} kelas dan {len(jobs_data)} blok pelajaran...")
    
    # 1. Memetakan 5 Hari ke dalam 1 Garis Waktu Linier (0 sampai 49)
    DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
    PERIODS = [10, 10, 10, 10, 10] # Semua hari 10 JP
    TOTAL_SLOTS = sum(PERIODS)
    
    def get_slot(day_idx, period_1_based):
        return sum(PERIODS[:day_idx]) + (period_1_based - 1)
        
    model = cp_model.CpModel()
    
    class_intervals = {c: [] for c in classes}
    teacher_intervals = {}
    
    # 2. Menyegel Jam Terkunci Otomatis
    def add_fixed_block(c, slot, duration, name):
        start_var = model.NewConstant(slot)
        end_var = model.NewConstant(slot + duration)
        interval = model.NewIntervalVar(start_var, duration, end_var, f'{c}_fixed_{name}_{slot}')
        class_intervals[c].append(interval)

    for c in classes:
        # Upacara (Selalu Aktif)
        add_fixed_block(c, get_slot(0, 1), 1, 'Upacara')       # Senin Jam 1
        
        # Kosongkan Jam ke-7 Hari Jumat
        if rules.get('jumat_7', True):
            add_fixed_block(c, get_slot(4, 7), 1, 'JumatKosong7')
        
        # Khusus Kelas 11 & 12
        if rules.get('ko_xi', True):
            if c.startswith('XI-') or c.startswith('XII-'):
                add_fixed_block(c, get_slot(0, 2), 2, 'Koku_Senin') # Senin Jam 2-3
                add_fixed_block(c, get_slot(4, 1), 2, 'Koku_Jumat') # Jumat Jam 1-2
    
    allowed_ko_x_slots = [
        get_slot(0, 2), get_slot(0, 3), # Senin P2, P3
        get_slot(1, 1), get_slot(1, 2), # Selasa P1, P2
        get_slot(2, 1), get_slot(2, 2), get_slot(2, 9), # Rabu P1, P2, P9
        get_slot(3, 1), get_slot(3, 2), # Kamis P1, P2
        get_slot(4, 1), get_slot(4, 2)  # Jumat P1, P2
    ]


    # 3. Membuat Variabel Matematika untuk Setiap Blok Pelajaran
    job_vars = []
    
    for i, job in enumerate(jobs_data):
        c = job['class_name']
        dur = job['jp']
        t = job['teacher']
        
        # Mencari batas slot yang valid (Pelajaran tidak boleh menyeberang/terpotong beda hari)
        valid_starts = []
        for d_idx, p_count in enumerate(PERIODS):
            start_slot_for_day = sum(PERIODS[:d_idx])
            # Slot maksimal agar durasi pelajaran tidak melebihi bel pulang
            for p in range(p_count - dur + 1):
                valid_starts.append(start_slot_for_day + p)
                
        # Terapkan Logika Spesifik SMANSA
        if rules.get('ko_x', True) and job['subject'].startswith('Ko(10)'):
            valid_starts = [s for s in valid_starts if s in allowed_ko_x_slots]
        if rules.get('gw_rabu', True) and job['subject'] == 'GW':
            valid_starts = [get_slot(2, 10)] # Hanya bisa di Rabu Jam 10
        
        # Terapkan Hari Libur/Sibuk Guru (dari Tab Guru di UI)
        teacher_day_off = rules.get('teacher_day_off', {})
        if t != '-' and t in teacher_day_off:
            day_names = ['Senin','Selasa','Rabu','Kamis','Jumat']
            blocked_day_indices = [day_names.index(d) for d in teacher_day_off[t] if d in day_names]
            if blocked_day_indices:
                def slot_is_blocked(s):
                    day_idx = 0
                    rem = s
                    for pidx, p in enumerate(PERIODS):
                        if rem < p:
                            day_idx = pidx
                            break
                        rem -= p
                    return day_idx in blocked_day_indices
                valid_starts = [s for s in valid_starts if not slot_is_blocked(s)]
            
        domain = cp_model.Domain.FromValues(valid_starts)
        start_var = model.NewIntVarFromDomain(domain, f'start_{i}')
        end_var = model.NewIntVar(0, TOTAL_SLOTS, f'end_{i}')
        interval_var = model.NewIntervalVar(start_var, dur, end_var, f'interval_{i}')
        
        # Masukkan ke daftar pengawasan bentrok
        class_intervals[c].append(interval_var)
        
        day_var = model.NewIntVar(0, 4, f'day_{i}')
        model.AddDivisionEquality(day_var, start_var, 10)
        
        # We need to add day_var to job_vars. Wait, job_vars.append is below!
        if t != '-':
            if t not in teacher_intervals:
                teacher_intervals[t] = []
            teacher_intervals[t].append(interval_var)
            
        job_vars.append({'index': i, 'job': job, 'start_var': start_var, 'day_var': day_var})
        
    # 4. Aturan Wajib (Hard Constraint): TIDAK BOLEH OVERLAP (BENTROK)
    for c, inters in class_intervals.items():
        model.AddNoOverlap(inters)
        
        # Mencegah mapel yang sama muncul 2 kali di hari yang sama (Max 1 blok per hari)
        # Sehingga otomatis membatasi max 3 JP per hari (karena blok terbesar adalah 3 JP)
        c_job_vars = [jv for jv in job_vars if jv['job']['class_name'] == c]
        subjects = list(set([jv['job']['subject'] for jv in c_job_vars]))
        for subj in subjects:
            if subj.startswith('Ko('): continue # Ko(10) boleh 2 blok sehari (Rabu)
            subj_day_vars = [jv['day_var'] for jv in c_job_vars if jv['job']['subject'] == subj]
            if len(subj_day_vars) > 1:
                model.AddAllDifferent(subj_day_vars) # 1 Kelas hanya 1 pelajaran di satu waktu
        
    for t, inters in teacher_intervals.items():
        model.AddNoOverlap(inters) # 1 Guru hanya di 1 kelas di satu waktu
        
    # 5. Eksekusi Pencarian AI Google (Solver)
    print(f"[PROCESS] Memulai komputasi matematika untuk menyusun ribuan kombinasi...")
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 900.0 # Maksimal mikir 3 Menit
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print(f"[SUCCESS] Jadwal sempurna ditemukan! Mengirim balik ke web...")
        # Menyusun Format JSON Balasan
        schedule = {c: {d: [None]*PERIODS[d_idx] for d_idx, d in enumerate(DAYS)} for c in classes}
        
        def slot_to_day_period(slot):
            for d_idx, p_count in enumerate(PERIODS):
                if slot < p_count: return DAYS[d_idx], slot + 1
                slot -= p_count
            return None, None
            
        # [FIX] Masukkan jam terkunci (Upacara, Koku) ke JSON Output
        for c in classes:
            # Upacara (Senin Jam 1)
            d_str, p_val = slot_to_day_period(get_slot(0, 1))
            schedule[c][d_str][p_val - 1] = {'subject': 'UPACARA', 'teacher': '-'}
            
            # Kokurikuler Khusus Kelas 11 & 12
            if c.startswith('XI-') or c.startswith('XII-'):
                d_str, p_val = slot_to_day_period(get_slot(0, 2))
                schedule[c][d_str][p_val - 1] = {'subject': 'KOKURIKULER', 'teacher': '-'}
                d_str, p_val = slot_to_day_period(get_slot(0, 3))
                schedule[c][d_str][p_val - 1] = {'subject': 'KOKURIKULER', 'teacher': '-'}
                d_str, p_val = slot_to_day_period(get_slot(4, 1))
                schedule[c][d_str][p_val - 1] = {'subject': 'KOKURIKULER', 'teacher': '-'}
                d_str, p_val = slot_to_day_period(get_slot(4, 2))
                schedule[c][d_str][p_val - 1] = {'subject': 'KOKURIKULER', 'teacher': '-'}
                
        for jv in job_vars:
            start_val = solver.Value(jv['start_var'])
            dur = jv['job']['jp']
            
            for offset in range(dur):
                d_str, p_val = slot_to_day_period(start_val + offset)
                schedule[jv['job']['class_name']][d_str][p_val - 1] = {
                    'subject': jv['job']['subject'],
                    'teacher': jv['job']['teacher']
                }
                
        return jsonify({'status': 'success', 'schedule': schedule})
    else:
        print(f"[ERROR] Gagal menemukan jadwal tanpa bentrok.")
        return jsonify({'status': 'failed', 'message': 'Jadwal buntu. Beban guru terlalu padat.'})


@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat_llm():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        import urllib.request
        import urllib.error
        import json
        
        req_data = request.json
        prompt = req_data.get('prompt', '')
        context = req_data.get('context', '')
        
        system_instruction = (
            "Kamu adalah Asisten Digital EduSmansa (SMAN 1 Sumedang). Gaya bahasamu ramah, gaul, dan asyik layaknya anak SMA yang pintar. "
            "ATURAN 1 (INFO SEKOLAH): Jika bertanya soal jadwal, guru, kelas, atau tata tertib sekolah, kamu WAJIB menjawab HANYA berdasarkan DATA SEKOLAH terlampir. "
            "Jika pengguna meminta jadwal kelas penuh, JABARKAN LENGKAP Senin - Jumat secara urut. "
            "Untuk jadwal, JANGAN pakai tabel markdown. Tulis berderet ke bawah seperti ini: \n**Hari Senin:**\n- Jam 1 (07:00-07:45): Matematika\n- Jam 2 (07:45-08:30): Fisika. "
            "Jika info sekolah tidak ada di data, barulah katakan 'maaf data belum tercatat di sistem'. "
            "ATURAN 2 (OBROLAN SANTAI/CHIT-CHAT): Jika pengguna mengajak bercanda, curhat, memuji (misal: 'aku sayang kamu', 'p', 'bot', dll), atau bertanya hal di luar sekolah, "
            "JANGAN PERNAH bilang 'data tidak tercatat'! Balaslah dengan luwes, lucu, dan seru layaknya teman sungguhan. Kamu bebas berekspresi, gunakan emoji yang pas!"
        )
        
        full_text = f"{system_instruction}\n\nDATA SEKOLAH/JADWAL (KONTEKS):\n{context}\n\nPERTANYAAN SISWA:\n{prompt}"
        
        API_KEY = "AQ.Ab8RN6JMTiksMapnOZGwpsKj1He8QHvshs7QcCZFiWpl5Lk0Ng"
        # Gunakan Gemini 3.7 Flash yang sudah kita verifikasi jalurnya
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": full_text}]}]
        }
        
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        
        import time
        MAX_RETRIES = 3
        
        for attempt in range(MAX_RETRIES):
            try:
                with urllib.request.urlopen(req) as response:
                    res_data = json.loads(response.read().decode())
                    try:
                        answer = res_data['candidates'][0]['content']['parts'][0]['text']
                        return jsonify({"status": "success", "answer": answer})
                    except Exception as e:
                        return jsonify({"status": "error", "message": "Gagal membaca struktur respons dari Gemini."})
            except urllib.error.HTTPError as e:
                err_msg = e.read().decode()
                if e.code in [503, 429] and attempt < MAX_RETRIES - 1:
                    time.sleep(2 * (attempt + 1)) # Tunggu 2 detik, lalu 4 detik
                    continue
                else:
                    if e.code == 503:
                        return jsonify({"status": "error", "message": "Server AI sedang sangat sibuk (High Demand). Silakan coba 10 detik lagi ya!"})
                    elif e.code == 429:
                        return jsonify({"status": "error", "message": "Kuota AI sedang habis atau terlalu cepat bertanya. Tunggu sebentar."})
                    else:
                        return jsonify({"status": "error", "message": f"Terjadi gangguan pada koneksi AI (Code {e.code})."})
            except Exception as e:
                return jsonify({"status": "error", "message": str(e)})
                
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


if __name__ == '__main__':
    print("==================================================")
    print("API AI SCHEDULE STUDIO MENYALA DI PORT 7860")
    print("==================================================")
    app.run(host='0.0.0.0', port=7860, debug=False)
