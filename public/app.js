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

// 1. Fetch Songs (Search / Recommend)
async function fetchSongs(query = "") {
    songList.innerHTML = '';
    loader.style.display = 'block';
    
    try {
        const url = query ? `/api/search?q=${encodeURIComponent(query)}` : '/api/search';
        const res = await fetch(url);
        const data = await res.json();
        
        currentSongs = data;
        loader.style.display = 'none';
        
        if(data.length === 0) {
            songList.innerHTML = '<p style="text-align:center; width:100%">Lagu tidak ditemukan</p>';
            return;
        }

        data.forEach(song => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${song.image}" alt="${song.title}">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            `;
            card.onclick = () => playSong(song);
            songList.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        loader.style.display = 'none';
    }
}

// 2. Play Song Logic
function playSong(song) {
    pTitle.innerText = song.title;
    pArtist.innerText = song.artist;
    pImg.src = song.image;
    
    // Set Audio Source ke Backend Stream
    // Menggunakan encodeURIComponent untuk ID agar aman
    audio.src = `/api/stream?id=${song.id}`;
    
    audio.play()
        .then(() => {
            isPlaying = true;
            updatePlayBtn();
        })
        .catch(e => {
            console.error("Playback error:", e);
            alert("Gagal memutar. Coba lagu lain.");
        });
}

// 3. Controls
btnPlay.onclick = () => {
    if (audio.src) {
        if (isPlaying) audio.pause();
        else audio.play();
        isPlaying = !isPlaying;
        updatePlayBtn();
    }
};

function updatePlayBtn() {
    btnPlay.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// Search Listener (Enter key)
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchSongs(searchInput.value);
        document.getElementById('sectionTitle').innerText = `Hasil pencarian: ${searchInput.value}`;
        searchInput.blur();
    }
});

// Progress Bar
audio.addEventListener('timeupdate', (e) => {
    const { duration, currentTime } = e.target;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
});

progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
});

audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayBtn();
});

// Init Load
window.onload = () => {
    fetchSongs(); // Load rekomendasi awal
};

function loadHome() {
    document.getElementById('sectionTitle').innerText = "Rekomendasi Untukmu";
    searchInput.value = "";
    fetchSongs();
}
