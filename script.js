/* CEK STATUS — dibuat berdiri sendiri (data + logika di sini) supaya tetap
   berfungsi walaupun ada bagian lain di script utama yang bermasalah. */
(function(){
  var DATA = {
    "DP1234AB": {motor:"Honda Beat 2020", layanan:"Servis CVT",       tahap:2, estimasi:"Hari ini, 15.00"},
    "DP5678CD": {motor:"Yamaha NMAX",     layanan:"Ganti kampas rem", tahap:3, estimasi:"Siap diambil"},
    "DD9012EF": {motor:"Suzuki Satria",   layanan:"Tune up",          tahap:1, estimasi:"Besok, 10.00"}
  };
  var TAHAP = ["Diterima","Dicek montir","Sedang dikerjakan","Selesai / siap diambil"];
  var form = document.getElementById("formStatus");
  var input = document.getElementById("platCek");
  var box = document.getElementById("hasilStatus");
  var err = document.getElementById("errPlat");
  function esc(t){ return String(t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function tampil(kelas, html){
    box.className = "result " + kelas;
    box.innerHTML = html;
    box.hidden = false;
    // gulir otomatis agar hasil pasti terlihat di layar
    setTimeout(function(){ box.scrollIntoView({behavior:"smooth", block:"nearest"}); }, 60);
  }

  form.addEventListener("submit", function(e){
    e.preventDefault();               // cegah halaman dimuat ulang / kembali ke atas
    var kunci = input.value.replace(/[^a-z0-9]/gi, "").toUpperCase();
    if(!kunci){
      err.style.display = "block"; input.style.borderColor = "#c53030"; input.focus();
      box.hidden = true; return;
    }
    err.style.display = "none"; input.style.borderColor = "";
    var s = DATA[kunci];
    var dariBooking = false;
    if(!s){
      // cari di booking yang tadi dikirim dari perangkat ini
      var daftar = [];
      try { daftar = JSON.parse(localStorage.getItem("booking") || "[]"); } catch(x){}
      for(var k = daftar.length - 1; k >= 0; k--){
        if(String(daftar[k].plat).replace(/[^a-z0-9]/gi, "").toUpperCase() === kunci){
          var bk = daftar[k];
          var th = Number(bk.tahap) || 0;   // status diubah oleh admin
          s = {motor: bk.motor, layanan: bk.layanan, tahap: th,
               estimasi: th >= 3 ? "Siap diambil" : "jadwal " + bk.tgl + ", pukul " + bk.jam + (th === 0 ? " (menunggu konfirmasi bengkel)" : "")};
          dariBooking = true;
          break;
        }
      }
    }
    if(!s){
      tampil("err", "Plat nomor <b>" + esc(input.value.trim().toUpperCase()) + "</b> tidak ditemukan. Pastikan penulisan sama dengan saat booking, atau hubungi bengkel.");
      return;
    }
    var langkah = TAHAP.map(function(t, i){
      var kls = i < s.tahap ? "done" : (i === s.tahap ? "now" : "");
      var ikon = i < s.tahap ? "✔" : (i === s.tahap ? "▶" : "○");
      return '<li class="' + kls + '">' + ikon + " " + t + "</li>";
    }).join("");
    tampil(s.tahap === 3 ? "ok" : "warn",
      "<b>" + esc(s.motor) + "</b> — " + esc(s.layanan) + "<br>Estimasi: " + esc(s.estimasi) +
      '<ul class="steps">' + langkah + "</ul>" +
      (dariBooking ? '<p class="note">Booking ini tercatat di perangkat Anda. Status diperbarui oleh admin bengkel.</p>' : ""));
  });
})();

/* ============ KONFIGURASI (ubah sesuai bengkel Anda) ============ */
const NOMOR_WA = "6281244781318";   // format internasional, tanpa + dan tanpa 0 di depan
const NAMA_BENGKEL = "Bengkel Harapan Motor";
/* Login admin (GANTI password ini!). Catatan: karena website ini statis (tanpa server),
   login ini hanya pembatas tampilan untuk demo, BUKAN keamanan sungguhan. */
const ADMIN_USER = "admin", ADMIN_PASS = "harapan123";
const JAM_BUKA = 8, JAM_TUTUP = 17; // buka setiap hari
const LAYANAN = [
  {nama:"Servis ringan",            kat:"Servis Rutin", harga:50000,  durasi:"45 menit"},
  {nama:"Ganti oli mesin",          kat:"Servis Rutin", harga:15000,  durasi:"15 menit"},
  {nama:"Servis CVT (matic)",       kat:"Servis Rutin", harga:100000, durasi:"1,5 jam"},
  {nama:"Tune up injeksi/karburator",kat:"Mesin",       harga:120000, durasi:"1,5 jam"},
  {nama:"Overhaul mesin",           kat:"Mesin",        harga:900000, durasi:"2–4 hari"},
  {nama:"Ganti kampas rem",         kat:"Rem & Roda",   harga:30000,  durasi:"30 menit"},
  {nama:"Ganti ban",                kat:"Rem & Roda",   harga:25000,  durasi:"30 menit"},
  {nama:"Tambal ban",               kat:"Rem & Roda",   harga:15000,  durasi:"20 menit"},
  {nama:"Ganti rantai & gir set",   kat:"Rem & Roda",   harga:60000,  durasi:"1 jam"},
  {nama:"Cek & ganti aki",          kat:"Kelistrikan",  harga:20000,  durasi:"20 menit"},
  

];
/* Salinan data bawaan + daftar layanan hasil edit admin (jika ada, tersimpan di browser) */
const LAYANAN_DEFAULT = LAYANAN.map(l => ({...l}));
try {
  const tersimpan = JSON.parse(localStorage.getItem("layanan") || "null");
  if(Array.isArray(tersimpan) && tersimpan.length){ LAYANAN.length = 0; tersimpan.forEach(l => LAYANAN.push(l)); }
} catch(e){}
/* Data demo Cek Status ada di script khusus pada bagian "Cek status" (lihat formStatus) */
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

/* ============ UTILITAS ============ */
const $ = s => document.querySelector(s);
const rupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
const waLink = txt => `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(txt)}`;

/* ============ NAV ============ */
$("#burger").addEventListener("click", () => $("#menu").classList.toggle("show"));
document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", () => $("#menu").classList.remove("show")));
$("#tahun").textContent = new Date().getFullYear();
$("#waKontak").href = waLink(`Halo ${NAMA_BENGKEL}, saya ingin bertanya tentang servis motor.`);
$("#waFloat").href  = waLink(`Halo ${NAMA_BENGKEL}, saya ingin bertanya.`);

/* ============ STATUS BUKA/TUTUP ============ */
function renderJam(){
  const now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes()/60;
  const buka = h >= JAM_BUKA && h < JAM_TUTUP;
  const badge = $("#openBadge");
  badge.textContent = buka ? "Buka sekarang" : "Tutup";
  badge.className = "badge " + (buka ? "open" : "closed");
  $("#hours").innerHTML = HARI.slice(1).concat(HARI[0]).map(n => {
    const jam = `${String(JAM_BUKA).padStart(2,"0")}.00 – ${String(JAM_TUTUP).padStart(2,"0")}.00`;
    const today = HARI[d] === n ? " style='color:#fff;font-weight:700'" : "";
    return `<div${today}><span>${n}</span><span>${jam}</span></div>`;
  }).join("");
}
renderJam(); setInterval(renderJam, 60000);

/* ============ DAFTAR LAYANAN (cari + filter) ============ */
const kategoriList = [...new Set(LAYANAN.map(l => l.kat))];
kategoriList.forEach(k => $("#kategori").insertAdjacentHTML("beforeend", `<option>${k}</option>`));
function renderLayanan(){
  const q = $("#cari").value.trim().toLowerCase(), k = $("#kategori").value;
  const hasil = LAYANAN.filter(l => (k === "semua" || l.kat === k) && l.nama.toLowerCase().includes(q));
  $("#tbodyLayanan").innerHTML = hasil.map(l =>
    `<tr><td><b>${l.nama}</b></td><td><span class="tag">${l.kat}</span></td><td>${rupiah(l.harga)}</td><td>${l.durasi}</td></tr>`
  ).join("");
  $("#emptyNote").hidden = hasil.length > 0;
}
$("#cari").addEventListener("input", renderLayanan);
$("#kategori").addEventListener("change", renderLayanan);
renderLayanan();

/* ============ ISI DROPDOWN BOOKING ============ */
$("#layananPilih").innerHTML = LAYANAN.map(l => `<option>${l.nama}</option>`).join("") + "<option>Lainnya / belum tahu (cek dulu)</option>";
for(let h = JAM_BUKA; h < JAM_TUTUP; h++){
  $("#jam").insertAdjacentHTML("beforeend", `<option>${String(h).padStart(2,"0")}.00</option>`);
}
const hariIni = new Date().toISOString().split("T")[0];
$("#tgl").min = hariIni;

/* ============ KALKULATOR ESTIMASI ============ */
$("#checks").innerHTML = LAYANAN.map((l,i) =>
  `<label><input type="checkbox" value="${i}"> ${l.nama}<span>${rupiah(l.harga)}</span></label>`
).join("");
function hitungTotal(){
  let total = 0;
  document.querySelectorAll("#checks input:checked").forEach(c => total += LAYANAN[c.value].harga);
  $("#totalBiaya").textContent = rupiah(total);
}
$("#checks").addEventListener("change", hitungTotal);
/* Tombol "Lanjut ke Form Booking" bersifat opsional: kalau dihapus dari HTML, script tetap jalan */
const btnKeBooking = $("#btnKeBooking");
if(btnKeBooking){
  btnKeBooking.addEventListener("click", () => {
    const pilih = [...document.querySelectorAll("#checks input:checked")];
    if(pilih.length){ $("#layananPilih").value = LAYANAN[pilih[0].value].nama; }
    $("#formBooking").scrollIntoView({behavior:"smooth", block:"center"});
  });
}

/* ============ BOOKING → WHATSAPP ============ */
function tampilError(el, salah){
  const msg = el.parentElement.querySelector(".err-msg");
  el.style.borderColor = salah ? "#c53030" : "";
  if(msg) msg.style.display = salah ? "block" : "none";
  return !salah;
}
function renderRiwayat(){
  let data = [];
  try { data = JSON.parse(localStorage.getItem("booking") || "[]"); } catch(e){}
  const ul = $("#riwayat"); ul.innerHTML = "";
  if(!data.length) return;
  const h = document.createElement("li");
  h.style.border = "0"; h.style.background = "none"; h.style.padding = "0";
  h.innerHTML = "<b>Riwayat booking di perangkat ini</b>";
  ul.appendChild(h);
  data.slice(-3).reverse().forEach(b => {
    const li = document.createElement("li");
    li.textContent = `${b.tgl} ${b.jam} · ${b.plat} · ${b.layanan}`;
    ul.appendChild(li);
  });
}
$("#formBooking").addEventListener("submit", e => {
  e.preventDefault();
  const f = id => $("#"+id);
  let ok = true;
  ok = tampilError(f("nama"),  f("nama").value.trim().length < 2) && ok;
  ok = tampilError(f("hp"),    !/^\d{9,14}$/.test(f("hp").value.replace(/\D/g,"")) ) && ok;
  ok = tampilError(f("plat"),  f("plat").value.trim().length < 3) && ok;
  ok = tampilError(f("motor"), f("motor").value.trim().length < 2) && ok;
  const tglOk = f("tgl").value && !isNaN(new Date(f("tgl").value + "T00:00"));
  ok = tampilError(f("tgl"), !tglOk) && ok;
  if(!ok) return;

  const b = {
    id: Date.now(), tahap: 0, dibuat: new Date().toISOString(),
    nama: f("nama").value.trim(), hp: f("hp").value.trim(), plat: f("plat").value.trim().toUpperCase(),
    motor: f("motor").value.trim(), layanan: f("layananPilih").value, tgl: f("tgl").value,
    jam: f("jam").value, keluhan: f("keluhan").value.trim() || "-"
  };
  try {
    const data = JSON.parse(localStorage.getItem("booking") || "[]");
    data.push(b); localStorage.setItem("booking", JSON.stringify(data));
  } catch(err){}
  renderRiwayat();

  const teks = `Halo ${NAMA_BENGKEL}, saya ingin booking servis:\n` +
    `Nama: ${b.nama}\nWA: ${b.hp}\nMotor: ${b.motor}\nPlat: ${b.plat}\n` +
    `Layanan: ${b.layanan}\nTanggal: ${b.tgl}\nJam: ${b.jam}\nKeluhan: ${b.keluhan}`;
  window.open(waLink(teks), "_blank");
  e.target.reset();
});
renderRiwayat();

/* (Cek Status ada di script khusus pada bagian "Cek status") */

/* ============ PENGINGAT OLI ============ */
$("#formOli").addEventListener("submit", e => {
  e.preventDefault();
  const interval = +$("#tipe").value, last = +$("#kmTerakhir").value, now = +$("#kmSekarang").value;
  const box = $("#hasilOli"); box.hidden = false;
  setTimeout(() => box.scrollIntoView({behavior:"smooth", block:"nearest"}), 60);
  if(now < last){ box.className = "result err"; box.textContent = "KM saat ini tidak boleh lebih kecil dari KM ganti oli terakhir."; return; }
  const jalan = now - last, sisa = interval - jalan, next = last + interval;
  if(sisa <= 0){
    box.className = "result err";
    box.innerHTML = `⚠️ <b>Sudah waktunya ganti oli!</b> Terlewat ${Math.abs(sisa).toLocaleString("id-ID")} km.<br><a href="#booking" style="color:var(--brand-dark);font-weight:700">Booking servis sekarang →</a>`;
  } else if(sisa <= 300){
    box.className = "result warn";
    box.innerHTML = `Hampir waktunya! Sisa <b>${sisa.toLocaleString("id-ID")} km</b>. Ganti oli di ${next.toLocaleString("id-ID")} km.`;
  } else {
    box.className = "result ok";
    box.innerHTML = `Oli masih aman. Sisa <b>${sisa.toLocaleString("id-ID")} km</b> lagi. Ganti oli berikutnya di <b>${next.toLocaleString("id-ID")} km</b>.`;
  }
});

/* ============ ADMIN: login + dashboard ============ */
(function(){
  var KEY_B = "booking", KEY_L = "layanan", KEY_S = "adminLogin", KEY_LOCK = "adminLock";
  var TAHAP = ["Diterima","Dicek montir","Sedang dikerjakan","Selesai / siap diambil"];
  var MAX_GAGAL = 5, KUNCI_DETIK = 30, gagal = 0, kerja = [];
  var masuk = false;
  try { masuk = sessionStorage.getItem(KEY_S) === "1"; } catch(e){}

  /* ---- utilitas ---- */
  function el(id){ return document.getElementById(id); }
  function esc(t){ return String(t == null ? "" : t).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function baca(k){ try { var v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; } catch(e){ return []; } }
  function tulis(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e){ alert("Data tidak bisa disimpan di browser ini."); return false; } }
  function pesan(id, kelas, teks){ var b = el(id); b.className = "result " + kelas; b.textContent = teks; b.hidden = false; }
  function hariIni(){ var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
  function fmtTgl(t){ var p = String(t || "").split("-"); return esc(p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : t); }
  function segarkanRiwayat(){ if(typeof renderRiwayat === "function") renderRiwayat(); }

  /* ---- buka / tutup area admin ---- */
  function tampilView(){
    el("adminLogin").hidden = masuk;
    el("adminPanel").hidden = !masuk;
    if(masuk){ el("admNama").textContent = ADMIN_USER; isiFormManual(); renderSemua(); }
  }
  function bukaAdmin(){
    el("admin").style.display = "block";
    tampilView();
    el("admin").scrollIntoView({behavior:"smooth", block:"start"});
    if(!masuk) setTimeout(function(){ el("admUser").focus({preventScroll:true}); }, 400);
  }
  function tutupAdmin(){
    el("admin").style.display = "none";
    try { if(location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search); } catch(e){}
    window.scrollTo({top:0, behavior:"smooth"});
  }
  el("linkAdmin").addEventListener("click", function(e){ e.preventDefault(); bukaAdmin(); });
  el("admBatal").addEventListener("click", function(e){ e.preventDefault(); tutupAdmin(); });
  el("admShow").addEventListener("change", function(){ el("admPass").type = this.checked ? "text" : "password"; });
  window.addEventListener("hashchange", function(){ if(location.hash === "#admin") bukaAdmin(); });
  if(location.hash === "#admin") bukaAdmin();

  /* ---- login / logout ---- */
  function sisaKunci(){ var t = 0; try { t = Number(localStorage.getItem(KEY_LOCK) || 0); } catch(e){} return Math.max(0, Math.ceil((t - Date.now())/1000)); }
  el("formAdmin").addEventListener("submit", function(e){
    e.preventDefault();
    var s = sisaKunci();
    if(s > 0){ pesan("admErr", "err", "Terlalu banyak percobaan. Coba lagi dalam " + s + " detik."); return; }
    var u = el("admUser").value.trim(), p = el("admPass").value;
    if(u === ADMIN_USER && p === ADMIN_PASS){
      gagal = 0; masuk = true;
      try { sessionStorage.setItem(KEY_S, "1"); } catch(x){}
      el("admErr").hidden = true; el("admPass").value = "";
      tampilView();
    } else {
      gagal++;
      if(gagal >= MAX_GAGAL){
        gagal = 0;
        try { localStorage.setItem(KEY_LOCK, String(Date.now() + KUNCI_DETIK*1000)); } catch(x){}
        pesan("admErr", "err", "Terlalu banyak percobaan. Login dikunci " + KUNCI_DETIK + " detik.");
      } else {
        pesan("admErr", "err", "Username atau password salah. (" + (MAX_GAGAL - gagal) + " percobaan tersisa)");
      }
      el("admPass").value = ""; el("admPass").focus();
    }
  });
  el("admKeluar").addEventListener("click", function(){
    masuk = false;
    try { sessionStorage.removeItem(KEY_S); } catch(e){}
    tampilView(); tutupAdmin();
  });

  /* ---- data booking ---- */
  function ambilBooking(){
    var d = baca(KEY_B), ubah = false;
    d.forEach(function(b, i){
      if(!b.id){ b.id = Date.now() + i; ubah = true; }
      if(b.tahap === undefined || b.tahap === null || isNaN(Number(b.tahap))){ b.tahap = 0; ubah = true; }
      else b.tahap = Number(b.tahap);
    });
    if(ubah) tulis(KEY_B, d);
    return d;
  }
  function nomorWA(hp){
    var n = String(hp || "").replace(/\D/g, "");
    if(!n) return "";
    if(n.charAt(0) === "0") n = "62" + n.slice(1); else if(n.charAt(0) === "8") n = "62" + n;
    return n;
  }
  function linkWA(b){
    var n = nomorWA(b.hp); if(!n) return "";
    var teks = "Halo " + b.nama + ", kami dari " + NAMA_BENGKEL + ". Status motor " + b.plat + " (" + b.motor + "): " +
               TAHAP[b.tahap] + ". Jadwal: " + b.tgl + " pukul " + b.jam + ".";
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(teks);
  }

  function renderStats(d){
    var hi = hariIni();
    var n = [
      d.length,
      d.filter(function(b){ return b.tgl === hi; }).length,
      d.filter(function(b){ return b.tahap === 0; }).length,
      d.filter(function(b){ return b.tahap === 1 || b.tahap === 2; }).length,
      d.filter(function(b){ return b.tahap === 3; }).length
    ];
    var label = ["Total booking","Jadwal hari ini","Menunggu","Sedang diproses","Selesai"];
    el("admStats").innerHTML = n.map(function(x, i){ return '<div class="adm-stat"><b>' + x + '</b><span>' + label[i] + '</span></div>'; }).join("");
  }

  function terfilter(d){
    var q = (el("admCari").value || "").trim().toLowerCase(), f = el("admFilter").value;
    return d.filter(function(b){
      if(f !== "semua" && String(b.tahap) !== f) return false;
      if(!q) return true;
      var gab = (b.nama + " " + b.plat + " " + String(b.plat).replace(/\s/g, "") + " " + b.motor + " " + b.layanan).toLowerCase();
      return gab.indexOf(q) > -1 || gab.indexOf(q.replace(/\s/g, "")) > -1;
    });
  }

  function renderBooking(d){
    var tampil = terfilter(d).sort(function(a, b){
      var sa = a.tahap === 3 ? 1 : 0, sb = b.tahap === 3 ? 1 : 0;
      if(sa !== sb) return sa - sb;
      return (String(a.tgl) + String(a.jam)).localeCompare(String(b.tgl) + String(b.jam));
    });
    el("admBody").innerHTML = tampil.map(function(b){
      var opsi = TAHAP.map(function(t, i){ return '<option value="' + i + '"' + (i === b.tahap ? " selected" : "") + '>' + t + '</option>'; }).join("");
      var wa = linkWA(b);
      var tombolWA = wa ? '<a class="btn sm wa" href="' + wa + '" target="_blank" rel="noopener">WA</a>' : '<span class="btn sm off" title="Tidak ada nomor WhatsApp">WA</span>';
      var keluhan = (b.keluhan && b.keluhan !== "-") ? '<br><small>Keluhan: ' + esc(b.keluhan) + '</small>' : "";
      return '<tr data-id="' + esc(b.id) + '">' +
        '<td><b>' + fmtTgl(b.tgl) + '</b><br><small>' + esc(b.jam) + '</small></td>' +
        '<td>' + esc(b.nama) + '<br><small>' + esc(b.hp) + '</small></td>' +
        '<td><b>' + esc(b.plat) + '</b><br><small>' + esc(b.motor) + '</small></td>' +
        '<td>' + esc(b.layanan) + keluhan + '</td>' +
        '<td><select class="stt stt' + b.tahap + '" data-act="status" aria-label="Status ' + esc(b.plat) + '">' + opsi + '</select></td>' +
        '<td class="aksi">' + tombolWA + ' <button class="btn sm danger" data-act="hapus" type="button">Hapus</button></td></tr>';
    }).join("");
    el("admKosong").hidden = tampil.length > 0;
  }
  function renderSemua(){ var d = ambilBooking(); renderStats(d); renderBooking(d); }

  el("admCari").addEventListener("input", renderSemua);
  el("admFilter").addEventListener("change", renderSemua);

  el("admBody").addEventListener("change", function(e){
    var sel = e.target;
    if(!sel.matches || !sel.matches('select[data-act="status"]')) return;
    var id = sel.closest("tr").getAttribute("data-id"), d = ambilBooking();
    for(var i = 0; i < d.length; i++){
      if(String(d[i].id) === id){ d[i].tahap = Number(sel.value); d[i].diperbarui = new Date().toISOString(); break; }
    }
    tulis(KEY_B, d); renderSemua();
  });
  el("admBody").addEventListener("click", function(e){
    var btn = e.target.closest ? e.target.closest('button[data-act="hapus"]') : null;
    if(!btn) return;
    var id = btn.closest("tr").getAttribute("data-id");
    if(!confirm("Hapus booking ini?")) return;
    tulis(KEY_B, ambilBooking().filter(function(b){ return String(b.id) !== id; }));
    renderSemua(); segarkanRiwayat();
  });
  el("admHapusSemua").addEventListener("click", function(){
    if(!baca(KEY_B).length) return;
    if(!confirm("Hapus SEMUA data booking di browser ini? Tindakan ini tidak bisa dibatalkan.")) return;
    tulis(KEY_B, []); renderSemua(); segarkanRiwayat();
  });

  /* ---- tambah booking manual ---- */
  function isiFormManual(){
    var s = el("mLayanan"), cur = s.value;
    s.innerHTML = LAYANAN.map(function(l){ return "<option>" + esc(l.nama) + "</option>"; }).join("") + "<option>Lainnya / belum tahu (cek dulu)</option>";
    if(cur) s.value = cur;
    var j = el("mJam");
    if(!j.options.length){ for(var h = JAM_BUKA; h < JAM_TUTUP; h++) j.insertAdjacentHTML("beforeend", "<option>" + ("0" + h).slice(-2) + ".00</option>"); }
    if(!el("mTgl").value) el("mTgl").value = hariIni();
  }
  el("formManual").addEventListener("submit", function(e){
    e.preventDefault();
    var nama = el("mNama").value.trim(), hp = el("mHp").value.trim(), plat = el("mPlat").value.trim().toUpperCase(),
        motor = el("mMotor").value.trim(), tgl = el("mTgl").value;
    if(nama.length < 2 || plat.length < 3 || motor.length < 2 || !tgl){ pesan("mMsg", "err", "Lengkapi nama, plat nomor, jenis motor, dan tanggal."); return; }
    if(hp && !/^\d{9,14}$/.test(hp.replace(/\D/g, ""))){ pesan("mMsg", "err", "Nomor WhatsApp harus 9–14 digit (atau kosongkan)."); return; }
    var d = ambilBooking();
    d.push({id: Date.now(), tahap: 0, dibuat: new Date().toISOString(), nama: nama, hp: hp, plat: plat, motor: motor,
            layanan: el("mLayanan").value, tgl: tgl, jam: el("mJam").value, keluhan: el("mKeluhan").value.trim() || "-"});
    if(!tulis(KEY_B, d)) return;
    el("formManual").reset(); el("mTgl").value = hariIni();
    pesan("mMsg", "ok", "Booking " + plat + " berhasil ditambahkan.");
    renderSemua(); segarkanRiwayat();
  });

  /* ---- ekspor CSV ---- */
  function csvSel(v){
    v = String(v == null ? "" : v);
    if(/^[=+\-@\t\r]/.test(v)) v = "'" + v;            // cegah formula injection di Excel
    return '"' + v.replace(/"/g, '""') + '"';
  }
  el("admCsv").addEventListener("click", function(){
    var d = ambilBooking();
    var baris = [["Tanggal","Jam","Nama","WhatsApp","Plat","Motor","Layanan","Keluhan","Status"]].concat(d.map(function(b){
      return [b.tgl, b.jam, b.nama, b.hp, b.plat, b.motor, b.layanan, b.keluhan, TAHAP[b.tahap]];
    }));
    var csv = "﻿" + baris.map(function(r){ return r.map(csvSel).join(","); }).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
    a.download = "booking-" + hariIni() + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---- tab ---- */
  document.querySelectorAll(".adm-tabs button").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelectorAll(".adm-tabs button").forEach(function(x){ x.classList.toggle("on", x === b); });
      var t = b.getAttribute("data-tab");
      el("tabBooking").hidden = t !== "booking"; el("tabLayanan").hidden = t !== "layanan";
      if(t === "layanan"){ muatKerja(); renderLy(); el("lyMsg").hidden = true; }
    });
  });

  /* ---- kelola layanan & harga ---- */
  function muatKerja(){ kerja = LAYANAN.map(function(l){ return {nama: l.nama, kat: l.kat, harga: l.harga, durasi: l.durasi}; }); }
  function renderLy(){
    el("lyBody").innerHTML = kerja.map(function(l, i){
      return '<tr>' +
        '<td><input data-i="' + i + '" data-f="nama" value="' + esc(l.nama) + '" aria-label="Nama layanan"></td>' +
        '<td><input data-i="' + i + '" data-f="kat" value="' + esc(l.kat) + '" aria-label="Kategori"></td>' +
        '<td><input data-i="' + i + '" data-f="harga" type="number" min="0" step="1000" value="' + esc(l.harga) + '" aria-label="Harga"></td>' +
        '<td><input data-i="' + i + '" data-f="durasi" value="' + esc(l.durasi) + '" aria-label="Durasi"></td>' +
        '<td class="aksi"><button class="btn sm danger" data-i="' + i + '" data-act="hapusLy" type="button">Hapus</button></td></tr>';
    }).join("");
  }
  el("lyBody").addEventListener("input", function(e){
    var t = e.target, i = t.getAttribute("data-i"), f = t.getAttribute("data-f");
    if(i === null || !f) return;
    kerja[i][f] = f === "harga" ? (t.value === "" ? NaN : Number(t.value)) : t.value;
  });
  el("lyBody").addEventListener("click", function(e){
    var b = e.target.closest ? e.target.closest('button[data-act="hapusLy"]') : null;
    if(!b) return;
    kerja.splice(Number(b.getAttribute("data-i")), 1); renderLy();
  });
  el("lyTambah").addEventListener("click", function(){
    kerja.push({nama: "", kat: "Lainnya", harga: 0, durasi: "-"}); renderLy();
    var ins = el("lyBody").querySelectorAll('input[data-f="nama"]'); if(ins.length) ins[ins.length - 1].focus();
  });

  /* sinkronkan tampilan halaman utama setelah layanan berubah */
  function segarkanPublik(){
    try {
      var kat = el("kategori"), cur = kat.value;
      kat.innerHTML = '<option value="semua">Semua kategori</option>' +
        Array.from(new Set(LAYANAN.map(function(l){ return l.kat; }))).map(function(k){ return "<option>" + esc(k) + "</option>"; }).join("");
      kat.value = Array.from(kat.options).some(function(o){ return o.value === cur; }) ? cur : "semua";
      renderLayanan();
      el("checks").innerHTML = LAYANAN.map(function(l, i){ return '<label><input type="checkbox" value="' + i + '"> ' + esc(l.nama) + '<span>' + rupiah(l.harga) + '</span></label>'; }).join("");
      hitungTotal();
      var lp = el("layananPilih"), curL = lp.value;
      lp.innerHTML = LAYANAN.map(function(l){ return "<option>" + esc(l.nama) + "</option>"; }).join("") + "<option>Lainnya / belum tahu (cek dulu)</option>";
      if(curL) lp.value = curL;
      isiFormManual();
    } catch(e){}
  }
  el("lySimpan").addEventListener("click", function(){
    var bersih = [];
    for(var i = 0; i < kerja.length; i++){
      var l = kerja[i], nama = String(l.nama || "").trim();
      if(!nama){ pesan("lyMsg", "err", "Baris " + (i + 1) + ": nama layanan tidak boleh kosong."); return; }
      if(!isFinite(l.harga) || l.harga < 0){ pesan("lyMsg", "err", "Baris " + (i + 1) + " (" + nama + "): harga harus berupa angka 0 atau lebih."); return; }
      bersih.push({nama: nama, kat: String(l.kat || "").trim() || "Lainnya", harga: Math.round(l.harga), durasi: String(l.durasi || "").trim() || "-"});
    }
    if(!bersih.length){ pesan("lyMsg", "err", "Minimal harus ada satu layanan."); return; }
    if(!tulis(KEY_L, bersih)) return;
    LAYANAN.length = 0; bersih.forEach(function(l){ LAYANAN.push(l); });
    segarkanPublik(); muatKerja(); renderLy();
    pesan("lyMsg", "ok", "Tersimpan. Daftar layanan di halaman utama sudah diperbarui.");
  });
  el("lyReset").addEventListener("click", function(){
    if(!confirm("Kembalikan daftar layanan & harga ke data bawaan?")) return;
    try { localStorage.removeItem(KEY_L); } catch(e){}
    LAYANAN.length = 0; LAYANAN_DEFAULT.forEach(function(l){ LAYANAN.push({nama: l.nama, kat: l.kat, harga: l.harga, durasi: l.durasi}); });
    segarkanPublik(); muatKerja(); renderLy();
    pesan("lyMsg", "ok", "Daftar layanan dikembalikan ke data bawaan.");
  });
})();
/* ============ DAFTAR BOOKING PUBLIK ============ */
function renderAntrean(){
  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const tglLokal = (plus = 0) => {
    const d = new Date(); d.setDate(d.getDate() + plus);
    return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  };
  const STATUS = ["Diterima","Dicek montir","Sedang dikerjakan","Selesai / siap diambil"];

  const samarNama = n => {
    const p = String(n || "").trim().split(/\s+/);
    return p.length > 1 ? `${p[0]} ${p[1][0].toUpperCase()}.` : (p[0] || "-");
  };
  const samarPlat = pl => {
    const m = String(pl || "").replace(/\s/g, "").toUpperCase().match(/^([A-Z]{1,2})(\d+)([A-Z]*)$/);
    if(!m) return "••••";
    const d = m[2];
    const tengah = d.length > 2 ? d[0] + "•".repeat(d.length - 2) + d.slice(-1) : d;
    return `${m[1]} ${tengah} ${m[3]}`.trim();
  };

  
  let lokal = [];
  try { lokal = JSON.parse(localStorage.getItem("booking") || "[]"); if(!Array.isArray(lokal)) lokal = []; } catch(e){}

  const tglPilih = $("#antreanTgl").value, st = $("#antreanStatus").value, hi = tglLokal(0);
    const data = lokal.filter(b => {
    if(tglPilih ? b.tgl !== tglPilih : String(b.tgl) < hi) return false;
    if(st !== "semua" && String(Number(b.tahap) || 0) !== st) return false;
    return true;
  }).sort((a, b) => (String(a.tgl) + String(a.jam)).localeCompare(String(b.tgl) + String(b.jam)));

  $("#antreanBody").innerHTML = data.map(b => {
    const t = Number(b.tahap) || 0;
    const p = String(b.tgl).split("-");
    const tgl = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : b.tgl;
    return `<tr><td><b>${esc(tgl)}</b><br><small>${esc(b.jam)}</small></td>` +
      `<td>${esc(samarNama(b.nama))}</td><td>${esc(samarPlat(b.plat))}</td>` +
      `<td>${esc(b.layanan)}</td><td><span class="stt-badge stt${t}">${STATUS[t]}</span></td></tr>`;
  }).join("");
  $("#antreanKosong").hidden = data.length > 0;
}
$("#antreanTgl").addEventListener("change", renderAntrean);
$("#antreanStatus").addEventListener("change", renderAntrean);
renderAntrean();
/* ============ ULASAN PELANGGAN ============ */
/* Ulasan awal: GANTI dengan ulasan asli pelanggan bengkel (dari wawancara/WhatsApp) */
const ULASAN_AWAL = [

];
function renderUlasan(){
  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let lokal = [];
  try { lokal = JSON.parse(localStorage.getItem("ulasan") || "[]"); if(!Array.isArray(lokal)) lokal = []; } catch(e){}
  const semua = lokal.slice().reverse().concat(ULASAN_AWAL);
  $("#ulasanList").innerHTML = semua.map(u => {
    const n = Math.min(5, Math.max(1, Number(u.bintang) || 5));
    return `<div class="card"><div class="bintang">${"★".repeat(n)}${"☆".repeat(5 - n)}</div>` +
      `<p class="quote">“${esc(u.isi)}”</p><p class="who">${esc(u.nama)}</p></div>`;
  }).join("");
  const rata = semua.reduce((a, u) => a + (Number(u.bintang) || 5), 0) / semua.length;
  $("#ulasanRata").textContent = `Rating rata-rata ${rata.toFixed(1)} dari 5 (${semua.length} ulasan).`;
}
$("#formUlasan").addEventListener("submit", e => {
  e.preventDefault();
  const nama = $("#ulNama").value.trim(), isi = $("#ulIsi").value.trim(), bintang = Number($("#ulBintang").value);
  const msg = $("#ulMsg");
  if(nama.length < 2 || isi.length < 5){
    msg.textContent = "Isi nama dan ulasan (minimal 5 huruf).";
    msg.hidden = false; return;
  }
  msg.hidden = true;
  try {
    const data = JSON.parse(localStorage.getItem("ulasan") || "[]");
    data.push({nama, bintang, isi});
    localStorage.setItem("ulasan", JSON.stringify(data));
  } catch(err){}
  e.target.reset();
  renderUlasan();
});
renderUlasan();