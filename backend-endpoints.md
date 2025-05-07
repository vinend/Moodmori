# **Deskripsi Singkat Proyek**

**Mood Logger** adalah aplikasi berbasis web yang memungkinkan pengguna untuk mencatat, membagikan, dan menganalisis suasana hati (mood) mereka secara harian. Aplikasi ini menggabungkan fitur personal diary, social media, dan self-reflection tools dalam satu platform. Selain mencatat mood, pengguna juga bisa berinteraksi secara sosial melalui feed publik, sistem reaksi, favorit, pesan langsung, dan grup diskusi. Proyek ini dibangun dengan arsitektur **REST API** di backend (Menggunakan PostgreSQL dan Express.js) dan frontend modern (Menggunakan Vite + React).

---

### **1. Registrasi dan Autentikasi Pengguna**

Pengguna dapat:

* Mendaftar akun baru
* Login dan logout secara aman
* Melihat dan memperbarui informasi profil
* Mengganti password mereka

---

### **2. Manajemen Kategori Mood**

Tersedia kumpulan **kategori mood** (contoh: senang, sedih, marah, tenang) yang bisa dikustomisasi. Mood ini ditampilkan dengan ikon dan warna. Also, nanti ada implementasi *Custom Mood*, dimana kita bsia menciptakan mood custom dengan emoji custom juga. 

---

### **3. Pencatatan Mood Harian (Mood Logging)**

Pengguna dapat:

* Membuat log mood harian dengan deskripsi dan kategori mood tertentu
* Menandai log sebagai *publik* atau *privat*
* Mengedit atau menghapus log yang telah dibuat

Fitur ini berfungsi sebagai jurnal digital untuk self-tracking.

---

### **4. Statistik Mood**

Sistem menghitung dan menyajikan:

* Tren mood mingguan/bulanan
* Distribusi kategori mood
* Frekuensi penggunaan tertentu

Fitur ini membantu pengguna menganalisis kondisi emosional mereka dari waktu ke waktu.

---

### **5. Feed Sosial Mood Publik**

Semua log yang diset sebagai **publik** akan tampil di feed utama, seperti timeline sosial media. Pengguna lain bisa:

* Melihat postingan orang lain
* Memberikan reaksi berupa *like* dan *dislike*
* Melihat detail dari setiap log publik


---

### **6. Sistem Favorit (Bookmark)**

Pengguna bisa menyimpan log mood (baik milik sendiri maupun milik orang lain) ke dalam daftar **favorit**, untuk dibaca kembali atau digunakan sebagai referensi emosional yang penting.

---

### **7. Pesan Langsung (Direct Messages)**

Fitur DM memungkinkan dua pengguna untuk saling berkirim pesan secara pribadi, termasuk:

* Melihat daftar percakapan yang pernah dilakukan
* Mengirim pesan baru
* Menandai pesan sebagai sudah dibaca

---

### **8. Grup Diskusi (Group Chat)**

Pengguna bisa membuat grup chat untuk diskusi atau dukungan emosional kelompok. Dalam grup, pengguna dapat:

* Membuat dan mengatur grup
* Mengundang dan menghapus anggota
* Mengirim dan menerima pesan grup

Ini bisa digunakan untuk membentuk komunitas support berdasarkan pengalaman serupa atau bahkan bisa membentuk friend group biasa, sekedar social media. 

---

### **9. Privasi dan Keamanan**

* Setiap log mood bisa diatur sebagai publik atau privat
* Pengguna memiliki kontrol penuh atas data pribadi mereka
* Sistem logout dan password update memperkuat keamanan akun

---

### **10. Ekspansi Fitur (Opsional/Future)**

* **Highlight mood calendar**: Visualisasi kalender dengan warna berdasarkan mood harian
* **Geo-tagging**: Lampirkan lokasi saat membuat log
* **Mood analytics per waktu/hari/hari khusus**
---

# ROUTES-ROUTES BACKEND (FOR FRONTENDS)
---

### **Auth Routes** (`/api/auth`)

* `POST /register` — Mendaftarkan pengguna baru
* `POST /login` — Login pengguna
* `POST /logout` — Logout pengguna
* `GET /profile` — Mendapatkan profil pengguna saat ini
* `PUT /profile` — Memperbarui profil pengguna
* `PUT /password` — Memperbarui password pengguna

---

### **Mood Routes** (`/api/moods`)

* `GET /` — Mendapatkan semua kategori mood yang tersedia
* `GET /:id` — Mendapatkan detail mood berdasarkan ID

---

### **Mood Log Routes** (`/api/mood-logs`)

#### Akses dan Statistik

* `GET /` — Mendapatkan semua log mood pengguna
* `GET /stats` — Mendapatkan statistik mood pengguna
* `GET /public` — Mendapatkan semua log mood publik (untuk feed sosial)
* `GET /public/:id` — Mendapatkan detail log mood publik

#### Manipulasi Log Mood

* `POST /` — Membuat log mood baru
* `GET /:id` — Mendapatkan detail log mood berdasarkan ID
* `PUT /:id` — Memperbarui log mood
* `PUT /:id/visibility` — Mengubah visibilitas log mood (publik/privat)
* `DELETE /:id` — Menghapus log mood

#### Reaksi Mood

* `POST /:id/like` — Menyukai log mood
* `POST /:id/dislike` — Tidak menyukai log mood
* `DELETE /:id/reaction` — Menghapus reaksi dari log mood

---

### **Favorite Routes** (`/api/favorites`)

* `GET /` — Mendapatkan semua log mood favorit pengguna
* `POST /` — Menambahkan log mood ke favorit
* `GET /:moodLogId` — Memeriksa apakah log mood ada di favorit
* `DELETE /:moodLogId` — Menghapus log mood dari favorit

---

### **Message Routes** (`/api/messages`)

* `GET /conversations` — Mendapatkan semua percakapan pengguna
* `GET /conversations/:userId` — Mendapatkan pesan dalam percakapan
* `POST /send` — Mengirim pesan langsung ke pengguna lain
* `PUT /read/:messageId` — Menandai pesan sebagai sudah dibaca

---

### **Group Chat Routes** (`/api/group-chats`)

#### Grup

* `POST /` — Membuat grup chat baru
* `GET /` — Mendapatkan semua grup chat pengguna
* `GET /:groupId` — Mendapatkan detail grup chat
* `PUT /:groupId` — Memperbarui detail grup chat
* `DELETE /:groupId` — Menghapus grup chat

#### Anggota Grup

* `POST /:groupId/members` — Menambahkan anggota ke grup
* `DELETE /:groupId/members/:userId` — Menghapus anggota dari grup

#### Pesan Grup

* `POST /:groupId/messages` — Mengirim pesan ke grup
* `GET /:groupId/messages` — Mendapatkan pesan dari grup

---
