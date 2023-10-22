# VYNSIGN_PWEBB_TUGAS_BESAR

# Instalasi

1. Pastikan Anda memiliki Node.js terinstal di sistem Anda. Unduh dari https://nodejs.org  dan ikuti petunjuk instalasinya.
2. Salin repositori ini ke dalam folder lokal Anda.
3. Buka terminal dan arahkan ke direktori proyek.
4. Jalankan perintah berikut untuk menginstal depedensi :
   <h4>npm install</h4>
5. Penginstalan berhasil ketika folder node_modules sudah muncul pada direktori Anda.

# Konfigurasi
1. Buat file `.env` di direktori utama proyek Anda. Isi file tersebut dengan konfigurasi lingkungan yang diperlukan dalam format
  <h6>ACCESS_TOKEN_SECRET = </h6>
  
2. Isi entri `ACCESS_TOKEN_SECRET` dengan nilai kunci rahasia JWT yang Anda inginkan
3. 
CONTOH:
<p>ACCESS_TOKEN_SECRET = hadgfafbsdjfeyg</p>

(Catatan : Untuk data dan table yang ada pada database, bisa diimport menggunakan file sql yang tersedia)

# Penggunaan
1. Jalankan perintah berikut untuk menjalankan proyek pada terminal direktori:
   <h4>npm run start</h4>
   Proyek akan dijalankan dan dapat diakses melalui `http://localhost:3000`
