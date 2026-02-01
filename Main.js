// JAMENDO API CONFIG
const CLIENT_ID = "5ffbf3dc";
const API_URL = "https://api.jamendo.com/v3.0/tracks";

// PODCAST (LISTEN NOTES API)
const PODCAST_API = "https://listen-api.listennotes.com/api/v2/search";
const PODCAST_KEY = "5767c088b7b841c080e9f5f2251ad843"; 

// LOCAL STORAGE
let playlists = JSON.parse(localStorage.getItem("playlists")) || {
  "My Playlist": []
};
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let isShuffle = JSON.parse(localStorage.getItem("shuffle")) || false;
let repeatMode = JSON.parse(localStorage.getItem("repeat")) || 0; 
let playingList = [];
let currentIndex = 0;
let shuffleQueue = [];
document.addEventListener("DOMContentLoaded", () => {

// DOM
  const podcastBtn = document.getElementById("podcast-btn");
  const list = document.getElementById("music-list");
  const audio = document.getElementById("player");
  const playerBar = document.getElementById("playerBar");
  const searchInput = document.getElementById("search");
  const allBtn = document.getElementById("all-btn");
  const favBtn = document.getElementById("fav-btn");
  const playlistSelect = document.getElementById("playlist-select");
  const createBtn = document.getElementById("create-playlist");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const repeatBtn = document.getElementById("repeat-btn");
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const progressBar = document.getElementById("progress-bar");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const volumeSlider = document.getElementById("volume");
  const playerTitle = document.getElementById("player-title");
  const playerArtist = document.getElementById("player-artist");
  const playerThumb = document.getElementById("player-thumb");
  const playerLike = document.getElementById("player-like");

  let currentTracks = [];
  async function loadPodcasts(keyword = "music") {
  try {
    const res = await fetch(
      `${PODCAST_API}?q=${encodeURIComponent(keyword)}&type=episode&len_min=5`,
      {
        headers: {
          "X-ListenAPI-Key": PODCAST_KEY
        }
      }
    );

    const data = await res.json();

    if (!data.results || !data.results.length) {
      list.innerHTML = "<p>🎙 Không tìm thấy podcast</p>";
      return;
    }

    const podcasts = data.results.map(ep => ({
  title: ep.title_original || "Untitled Episode",
  artist:
    ep.podcast?.publisher_original ||
    ep.podcast?.title_original ||
    "Unknown Author",
  image: ep.thumbnail || ep.podcast?.thumbnail || "",
  preview: ep.audio,
  type: "podcast"
}));


    playingList = podcasts;
    currentIndex = 0;
    shuffleQueue = [];

    renderTracks(podcasts, "podcast");
  } catch (err) {
    console.error("Podcast API error:", err);
    list.innerHTML = "<p>⚠️ Lỗi tải podcast</p>";
  }
}


const userBtn = document.getElementById("Userbutton");
const usernameSpan = document.getElementById("username");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (currentUser && currentUser.username) {
  usernameSpan.textContent = currentUser.username;
} else {
  usernameSpan.textContent = "Guest";
}
userBtn.addEventListener("click", () => {
  alert("Xin chào " + usernameSpan.textContent + "!");
});
userBtn.addEventListener("click", () => {
  const confirmLogout = confirm("Bạn có chắc muốn đăng xuất không?");
  if (confirmLogout) {
    localStorage.removeItem("currentUser"); 
    window.location.href = "./login.html"; 
  }
});
  audio.onplay = () => {
    playerBar.classList.add("show");
    playBtn.textContent = "⏸";
  };

  audio.onpause = () => {
    playBtn.textContent = "▶";
  };

// PLAYLIST SELECT UI
  function renderPlaylistOptions() {
    playlistSelect.innerHTML = `<option value="">🎵 Chọn playlist</option>`;
    Object.keys(playlists).forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      playlistSelect.appendChild(opt);
    });
  }
  renderPlaylistOptions();

const createPopup = document.getElementById("create-playlist-popup");
const createInput = document.getElementById("new-playlist-name");
const confirmCreate = document.getElementById("confirm-create-playlist");
const closeCreate = document.getElementById("close-create-playlist");
createBtn.onclick = () => {
  createInput.value = "";
  createPopup.classList.remove("hidden");
  createInput.focus();
};
confirmCreate.onclick = () => {
  const name = createInput.value.trim();

  if (!name) {
    alert("❌ Vui lòng nhập tên playlist");
    return;
  }

  if (playlists[name]) {
    alert("❌ Playlist đã tồn tại");
    return;
  }

  playlists[name] = [];
  localStorage.setItem("playlists", JSON.stringify(playlists));
  renderPlaylistOptions();

  createPopup.classList.add("hidden");
};
  closeCreate.onclick = () => {
  createPopup.classList.add("hidden");
};
  playlistSelect.onchange = () => {
    if (!playlistSelect.value) return;
    openPlaylist(playlistSelect.value);
  };

  function openPlaylist(name) {
    playingList = playlists[name];
    currentIndex = 0;
    shuffleQueue = [];
    renderTracks(playingList, "playlist");
  }
  const popup = document.getElementById("playlist-popup");
  const listPopup = document.getElementById("playlist-list");
  const closePopup = document.getElementById("close-playlist-popup");
  
  let trackToAdd = null;
  function openPlaylistPopup(track) {
    trackToAdd = track;
    listPopup.innerHTML = "";

    const names = Object.keys(playlists);
    if (!names.length) return alert("Bạn chưa có playlist nào");

    names.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;

      li.onclick = () => {
        if (playlists[name].some(t => t.preview === trackToAdd.preview)) {
          alert("⚠️ Bài này đã có trong playlist");
          return;
        }
        playlists[name].push(trackToAdd);
        localStorage.setItem("playlists", JSON.stringify(playlists));
        popup.classList.add("hidden");
        alert(`✅ Đã thêm vào "${name}"`);
      };

      listPopup.appendChild(li);
    });

    popup.classList.remove("hidden");
  }

  closePopup.onclick = () => popup.classList.add("hidden");

  function createShuffleQueue() {
    shuffleQueue = [...Array(playingList.length).keys()]
      .sort(() => Math.random() - 0.5);
  }

  shuffleBtn.classList.toggle("active", isShuffle);
  repeatBtn.textContent = repeatMode === 2 ? "🔂" : "🔁";

  shuffleBtn.onclick = () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    shuffleQueue = [];
    localStorage.setItem("shuffle", JSON.stringify(isShuffle));
  };

  repeatBtn.onclick = () => {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.textContent = repeatMode === 2 ? "🔂" : "🔁";
    localStorage.setItem("repeat", JSON.stringify(repeatMode));
  };

  audio.onended = () => {
    if (repeatMode === 2) {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    nextSong();
  };
  playBtn.onclick = () => {
    if (!audio.src) return;
    audio.paused ? audio.play() : audio.pause();
  };

  nextBtn.onclick = nextSong;
  prevBtn.onclick = () => {
    if (!playingList.length) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    currentIndex =
      currentIndex === 0 ? playingList.length - 1 : currentIndex - 1;

    playSong(playingList[currentIndex]);
  };

  function nextSong() {
    if (!playingList.length) return;

    if (isShuffle) {
      if (!shuffleQueue.length) createShuffleQueue();
      currentIndex = shuffleQueue.shift();
    } else {
      currentIndex = (currentIndex + 1) % playingList.length;
    }
    playSong(playingList[currentIndex]);
  }

  function playSong(track) {
    if (!track) return;

    audio.src = track.preview;
    audio.play();

    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerThumb.src = track.image || "";

    playerLike.classList.toggle(
      "active",
      favorites.some(f => f.preview === track.preview)
    );
  }

  // PROGRESS & TIME
  audio.ontimeupdate = () => {
    if (!audio.duration) return;

    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  };

  progressBar.oninput = () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  };

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // VOLUME
  audio.volume = 0.7;
  volumeSlider.value = 0.7;

  volumeSlider.oninput = () => {
    audio.volume = volumeSlider.value;
  };

  // FAVORITES
  function toggleFavorite(track) {
    const idx = favorites.findIndex(f => f.preview === track.preview);
    idx === -1 ? favorites.push(track) : favorites.splice(idx, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  playerLike.onclick = () => {
    const track = playingList[currentIndex];
    if (!track) return;
    toggleFavorite(track);
    playerLike.classList.toggle("active");
  };

  function renderTracks(tracks, mode = "all") {
    list.innerHTML = "";

    if (!tracks.length) {
      list.innerHTML = "<p>❌ Không có bài hát</p>";
      return;
    }

    tracks.forEach(track => {
      const isFav = favorites.some(f => f.preview === track.preview);
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="fav-icon ${isFav ? "active" : ""}">❤️</div>
        <img src="${track.image || ""}">
        <h4>${track.title}</h4>
        <p>${track.artist}</p>
        <button class="play-btn">▶ Phát</button>
        ${
          mode === "playlist"
            ? `<button class="remove-btn">❌ Xóa</button>`
            : `<button class="add-btn">➕ Playlist</button>`
        }
      `;

      card.querySelector(".play-btn").onclick = () => {
        playingList = tracks;
        currentIndex = tracks.indexOf(track);
        shuffleQueue = [];
        playSong(track);
      };

      card.querySelector(".fav-icon").onclick = () => {
        toggleFavorite(track);
        renderTracks(tracks, mode);
      };

      if (mode !== "playlist") {
        card.querySelector(".add-btn").onclick = () =>
          openPlaylistPopup(track);
      }

      if (mode === "playlist") {
        card.querySelector(".remove-btn").onclick = () => {
          playlists[playlistSelect.value] =
            playlists[playlistSelect.value].filter(
              t => t.preview !== track.preview
            );
          localStorage.setItem("playlists", JSON.stringify(playlists));
          openPlaylist(playlistSelect.value);
        };
      }

      list.appendChild(card);
    });
  }

  // JAMENDO API
  async function loadTracks(params) {
    const res = await fetch(
      `${API_URL}?client_id=${CLIENT_ID}&format=json&limit=198&${params}`
    );
    const data = await res.json();

    currentTracks = data.results.map(t => ({
      title: t.name,
      artist: t.artist_name,
      image: t.album_image,
      preview: t.audio
    }));

    renderTracks(currentTracks);
  }

  allBtn.onclick = () => renderTracks(currentTracks);
  favBtn.onclick = () => renderTracks(favorites, "favorites");

  searchInput.oninput = () => {
    const key = searchInput.value.trim();
    key ? loadTracks(`namesearch=${key}`) : renderTracks(currentTracks);
  };

  window.searchMusic = tag => loadTracks(`tags=${tag}`);

  if (podcastBtn) {
  podcastBtn.onclick = () => {
    loadPodcasts("chill");
  };
}

if (podcastBtn) {
  podcastBtn.onclick = () => {

    playingList = [];
    currentIndex = 0;
    shuffleQueue = [];

    loadPodcasts("chill"); 
  };
}


  loadTracks("tags=pop");
});
const volumeBtn = document.getElementById("volume-btn");
const volumeWrapper = document.getElementById("volume-wrapper");

volumeBtn.onclick = (e) => {
  e.stopPropagation(); 
  volumeWrapper.classList.toggle("show");
};


document.addEventListener("click", () => {
  volumeWrapper.classList.remove("show");
});

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});


backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

