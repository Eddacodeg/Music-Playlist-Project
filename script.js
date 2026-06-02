class Song {
  constructor(title, artist) {
    this.title = title;
    this.artist = artist;
    this.nextSong = null; 
  }
}

class Playlist {
  constructor() {
    this.head = null;
  }

  addSong(title, artist) {
    const newSong = new Song(title, artist);
    if (this.head === null) {
      this.head = newSong;
      return;
    }
    let current = this.head;
    while (current.nextSong !== null) {
      current = current.nextSong;
    }
    current.nextSong = newSong;
  }

  removeSong(title, artist) {
    if (this.head === null) return;

    if (this.head.title === title && this.head.artist === artist) {
      this.head = this.head.nextSong;
      return;
    }

    let current = this.head;
    while (current.nextSong !== null) {
      if (current.nextSong.title === title && current.nextSong.artist === artist) {
        current.nextSong = current.nextSong.nextSong; // bypass the node
        return;
      }
      current = current.nextSong;
    }
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current !== null) {
      result.push({ title: current.title, artist: current.artist });
      current = current.nextSong;
    }
    return result;
  }

  size() {
    let count = 0;
    let current = this.head;
    while (current !== null) {
      count++;
      current = current.nextSong;
    }
    return count;
  }
}


const myPlaylist = new Playlist();

// Seed with the original Java example songs
myPlaylist.addSong("Espresso", "Sabrina Carpenter");
myPlaylist.addSong("Birds of a Feather", "Billie Eilish");
myPlaylist.addSong("Good Luck, Babe!", "Chappell Roan");

let currentPlaying = null; 

function addSong() {
  const titleInput = document.getElementById('input-title');
  const artistInput = document.getElementById('input-artist');
  const errorMsg = document.getElementById('error-msg');

  const title = titleInput.value.trim();
  const artist = artistInput.value.trim();

  if (!title || !artist) {
    errorMsg.textContent = 'Please enter both a title and an artist.';
    return;
  }

  errorMsg.textContent = '';
  myPlaylist.addSong(title, artist);
  titleInput.value = '';
  artistInput.value = '';
  titleInput.focus();
  renderPlaylist();
}

function removeSong(title, artist) {
  if (currentPlaying && currentPlaying.title === title && currentPlaying.artist === artist) {
    stopPlayback();
  }
  myPlaylist.removeSong(title, artist);
  renderPlaylist();
}

function startPlayback() {
  if (myPlaylist.head === null) return;
  document.getElementById('finished-msg').style.display = 'none';
  currentPlaying = myPlaylist.head;
  showNowPlaying();
  renderPlaylist();
}

function nextSong() {
  if (currentPlaying === null) return;

  // Find the current node in the live list (it may have been removed)
  let node = myPlaylist.head;
  while (node !== null) {
    if (node.title === currentPlaying.title && node.artist === currentPlaying.artist) {
      break;
    }
    node = node.nextSong;
  }

  if (node === null || node.nextSong === null) {
    // Reached the end
    stopPlayback();
    document.getElementById('finished-msg').style.display = 'block';
  } else {
    currentPlaying = node.nextSong;
    showNowPlaying();
    renderPlaylist();
  }
}

function stopPlayback() {
  currentPlaying = null;
  document.getElementById('now-playing-banner').classList.remove('visible');
  renderPlaylist();
}

function showNowPlaying() {
  document.getElementById('np-title').textContent = currentPlaying.title;
  document.getElementById('np-artist').textContent = currentPlaying.artist;
  document.getElementById('now-playing-banner').classList.add('visible');
}

function renderPlaylist() {
  const list = document.getElementById('playlist-list');
  const countEl = document.getElementById('song-count');
  const playBtn = document.getElementById('btn-play');
  const songs = myPlaylist.toArray();

  countEl.textContent = `${songs.length} song${songs.length !== 1 ? 's' : ''}`;
  playBtn.disabled = songs.length === 0;

  if (songs.length === 0) {
    list.innerHTML = '<div class="empty-state">No songs yet. Add one above!</div>';
    stopPlayback();
    return;
  }

  list.innerHTML = songs.map((song, i) => {
    const isPlaying = currentPlaying &&
      currentPlaying.title === song.title &&
      currentPlaying.artist === song.artist;
    return `
      <div class="song-item ${isPlaying ? 'playing' : ''}">
        <span class="song-index">${isPlaying ? '♫' : i + 1}</span>
        <div class="song-info">
          <div class="song-title">${escapeHtml(song.title)}</div>
          <div class="song-artist">${escapeHtml(song.artist)}</div>
        </div>
        ${isPlaying ? '<span class="now-playing-badge">NOW PLAYING</span>' : ''}
        <button class="btn-remove" onclick="removeSong('${escapeAttr(song.title)}', '${escapeAttr(song.artist)}')">Remove</button>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Allow pressing Enter to add a song
document.getElementById('input-title').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('input-artist').focus();
});
document.getElementById('input-artist').addEventListener('keydown', e => {
  if (e.key === 'Enter') addSong();
});

renderPlaylist();