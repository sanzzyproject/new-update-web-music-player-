const audio = document.getElementById('audioPlayer');
const songList = document.getElementById('songList');
const searchInput = document.getElementById('searchInput');
const loader = document.getElementById('loader');
const pTitle = document.getElementById('p-title');
const pArtist = document.getElementById('p-artist');
const pImg = document.getElementById('p-img');
const btnPlay = document.getElementById('btnPlay');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');

let isPlaying = false;
let currentSongs = [];

// --- 1. Fetch Songs (Updated) ---
async function fetchSongs(query = "") {
    // Bersihkan list dan tampilkan loading
    songList.innerHTML = '';
    loader.style.display = 'block';
    
    // Hapus pesan error lama jika ada
    const oldError = document.getElementById('error-msg');
    if (oldError) oldError.remove();

    try {
        const url = query ? `/api/search?q=${encodeURIComponent(query)}` : '/api/search';
        
        // Timeout 15 detik agar tidak loading selamanya
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await res.json();
        loader.style.display = 'none';

        // Cek jika server mengirim sinyal error
        if (data.error) {
            throw new Error(data.message || "Gagal mengambil data");
        }

        if (!Array.isArray(data) || data.length === 0) {
            songList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Lagu tidak ditemukan.</p>';
            return;
        }

        currentSongs = data;

        // Render Kartu Lagu
        data.forEach(song => {
            const card = document.createElement('div');
            card.className = 'card';
            // Tambahkan onerror pada img agar tidak rusak tampilannya
            card.innerHTML = `
                <img src="${song.image}" onerror="this.src='https://placehold.co/150x150/333/fff?text=No+Img'" alt="${song.title}">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            `;
            card.onclick = () => playSong(song);
            songList.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        loader.style.display = 'none';
        showError(err.message, query);
    }
}

// Fungsi menampilkan error di layar HP
function showError(msg, query) {
    const div = document.createElement('div');
    div.id = 'error-msg';
    div.style.textAlign = 'center';
    div.style.padding = '20px';
    div.style.color = '#ff6b6b';
    div.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom:10px;"></i>
        <p>Gagal memuat: ${msg}</p>
        <button onclick="fetchSongs('${query}')" style="margin-top:15px; padding:8px 20px; border-radius:20px; border:none; background:#fff; color:#000; font-weight:bold;">Coba Lagi</button>
    `;
    songList.appendChild(div);
}

// --- 2. Play Song Logic ---
function playSong(song) {
    pTitle.innerText = song.title;
    pArtist.innerText = song.artist;
    pImg.src = song.image;
    
    // Ganti source audio ke backend stream
    audio.src = `/api/stream?id=${song.id}`;
    
    // Update tombol jadi loading sebentar
    btnPlay.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    audio.play()
        .then(() => {
            isPlaying = true;
            updatePlayBtn();
        })
        .catch(e => {
            console.error("Playback error:", e);
            btnPlay.innerHTML = '<i class="fas fa-exclamation"></i>';
            alert("Gagal memutar audio. Format mungkin tidak didukung.");
        });
}

// --- 3. Player Controls ---
btnPlay.onclick = () => {
    if (!audio.src) return;
    
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
    isPlaying = !isPlaying;
    updatePlayBtn();
};

function updatePlayBtn() {
    btnPlay.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// Search Listener
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchSongs(searchInput.value);
        document.getElementById('sectionTitle').innerText = `Hasil: ${searchInput.value}`;
        searchInput.blur();
    }
});

// Progress Bar Logic
audio.addEventListener('timeupdate', (e) => {
    const { duration, currentTime } = e.target;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }
});

progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if(duration) {
        audio.currentTime = (clickX / width) * duration;
    }
});

audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayBtn();
});

// Init Load (Home Page)
window.onload = () => {
    loadHome();
};

function loadHome() {
    document.getElementById('sectionTitle').innerText = "Rekomendasi Untukmu";
    searchInput.value = "";
    fetchSongs(""); // Kosong = load rekomendasi default
}
