# MItone Architecture Blueprint

## Overview
**MItone** is a serverless desktop music player built with **Tauri (Rust backend)** and **React + TypeScript (frontend)**. The defining characteristic is that it operates without a central server — all ingestion, resolution, and state management happen locally on the user's machine.

---

## 1. Client-Side Ingestion

### URL Parsing & Normalization
- **Spotify URLs**: Parse `spotify:playlist:...`, `open.spotify.com/playlist/...`, and `spotify:user:...:playlist:...` formats.
- **YT Music URLs**: Parse `music.youtube.com/playlist?list=...` and `ytmusic.com/playlist?list=...`.
- **Normalization layer** converts all inputs to a canonical internal format: `{ type: 'spotify' | 'ytmusic'; id: string; uri: string }`.

### JSON Export Ingestion
- Users can drag-and-drop **Spotify playlist JSON exports** (exported from Spotify desktop/app).
- Users can drag-and-drop **YT Music playlist exports** (taken from Library > Liked Songs > Export).
- The ingestion parser validates the JSON structure and extracts track metadata (title, artist, duration, track number, album art URL).
- No network required for JSON-based imports — purely local file reading.

### Fallback Handling
- If a URL cannot be parsed, the UI displays a descriptive error.
- Users can manually paste track listings as plain text (one per line) as a last-resort ingestion method.

---

## 2. Stream Resolver Engine

### Public API Integration
- **Piped Instances**: The resolver queries public Piped instances (`/api/v1/search`, `/api/v1/playlist`) for YouTube/YT Music content.
- **Invidious Instances**: Fallback resolver using public Invidious APIs for audio-only streams.
- **No API keys required** — all requests use public instances with circuit-breaking fallback.

### On-Demand Resolution Flow
1. User selects a playlist or track from the UI.
2. The resolver sends a request to the nearest available Piped/Invidious instance.
3. The API returns **audio stream URLs** (typically WebM/Opus or MP4/AAC formats).
4. The resolver extracts the **direct audio URL** and **format metadata** (bitrate, codec, duration).
5. If one instance fails, the engine automatically retries with the next available instance.

### Cache Layer
- Resolver results are cached in **IndexedDB** with a TTL (Time-To-Live) of 24 hours.
- Cache keys are derived from `(source, playlist_id, track_index)` to avoid redundant API calls.
- Cache misses trigger a fresh resolver request.

### Rate Limiting & Safety
- Per-instance rate limit: max 1 request per 2 seconds per playlist.
- Global fallback after 3 consecutive failures from one instance.
- User-configurable list of preferred Piped/Invidious instances.

---

## 3. Audio Playback Pipeline

### WebAudio API Integration
- **Backend**: Tauri/Rust side initializes the `WebAudioContext` via the frontend JS bridge.
- **Audio Element**: Streams are played via an `<audio>` HTML element whose `src` is set to the resolver's direct stream URL.
- **WebAudio Effects**: Optional direct WebAudio API processing for visualizers, EQ, or effects (enabled via feature flag).

### Buffering & Playback Control
- **Pre-buffering**: On track start, the audio element preloads the first 30 seconds.
- **Buffering indicator**: Visual progress bar fills as data arrives; "Buffering..." state shown when `audio.readyState < 2`.
- **Autoplay policy**: Respects browser/OS autoplay settings; user must click "Play" first.
- **Seek support**: Seeking is supported seek to any position in the loaded buffer; seeking beyond loaded data triggers re-buffering.

### Volume & Pan Controls
- **Volume control**: Master volume via `audio.volume` (0.0 to 1.0), with hardware volume integration.
- **Independent track volume**: Each track in the queue can have a volume override (0.5x to 2.0x) for normalization.
- **Stereo panning**: Optional panning control for spatial audio effect (WebAudio `PannerNode`).

### Playback States
- `PLAYING`, `PAUSED`, `STOPPED`, `ENDED`.
- Events forwarded to React state via Tauri IPC (see Section 5).
- `onmetadata`, `oncanplaythrough`, `onerror` handlers for robust error recovery.

---

## 4. Local State & Cache

### IndexedDB Schema (`mitone-db`)
- **Object Store: `playlists`**
  - `id` (string, primary key) — e.g., `spotify:37i9dQZF1DXcBWIGoYBM5M` or `ytmusic:PL...`
  - `name` (string)
  - `type` (`'spotify'` | `'ytmusic'`)
  - `track_count` (number)
  - `last_modified` (date)
  - `cover_art` (string — URL or base64)
  - `tracks` (array of track objects, see below)

- **Object Store: `tracks`**
  - `id` (string, primary key) — unique track identifier
  - `title` (string)
  - `artists` (string — comma-separated)
  - `duration` (number — seconds)
  - `album` (string)
  - `album_art` (string — URL)
  - `source` (`'spotify'` | `'ytmusic'`)
  - `uri` (string — original source URI)
  - `added_at` (date)

- **Object Store: `history`**
  - `id` (auto-increment)
  - `track_id` (string, FK to tracks)
  - `played_at` (date)
  - `position` (number — seconds played)

- **Object Store: `resolver_cache`**
  - `key` (string — resolver cache key)
  - `value` (JSON — stream URLs + metadata)
  - `expires` (date)

### SQLite (Optional/Bridge)
- Tauri's `sqlite` package can be used for **persistent metadata storage** if IndexedDB is unavailable (e.g., older browsers).
- Schema mirrors the IndexedDB structure but lives in `~/.local/share/mitone/` on desktop.
- IndexedDB is preferred; SQLite is the fallback.

### Migration & Versioning
- DB version stored in `localStorage` as `mitone_db_version`.
- On app start, compare version and run migration scripts if schema changed.
- Current schema version: `1.0`.

---

## 5. IPC Communication: Tauri Rust ↔ React

### Command Flow (UI → Rust)
| UI Action | Tauri Command | Rust Handler | Result |
|---|---|---|---|
| `load-playlist` | `playlist:load` | `commands::playlist::load` | Returns playlist track metadata |
| `play-track` | `player:play` | `commands::player::play` | Starts/resumes playback |
| `pause-track` | `player:pause` | `commands::player::pause` | Pauses playback |
| `seek-track` | `player:seek` | `commands::player::seek` | Seeks to seconds |
| `set-volume` | `player:set_volume` | `commands::player::set_volume` | Sets volume 0.0–1.0 |
| `next-track` | `player:next` | `commands::player::next` | Plays next in queue |
| `prev-track` | `player:prev` | `commands::player::prev` | Plays previous in queue |
| `import-json` | `file:import` | `commands::file::import` | Loads JSON export |
| `set-resolver-instance` | `resolver:set_instance` | `commands::resolver::set_instance` | Changes Piped/Invidious instance |

### Event Flow (Rust → UI)
| Rust Event | Tauri Event | Payload | UI Listener |
|---|---|---|---|
| Playback changed | `player:state-changed` | `{ state: 'PLAYING'|'PAUSED'|'STOPPED'|'ENDED' }` | Update play/pause button |
| Track change | `player:track-changed` | `{ track: TrackMeta }` | Update now-playing UI |
| Duration update | `player:duration-updated` | `{ duration: number }` | Update progress bar max |
| Position update | `player:position-updated` | `{ position: number }` | Update progress bar value |
| Volume change | `player:volume-changed` | `{ volume: number }` | Update volume control |
| Error occurred | `player:error` | `{ message: string }` | Show error toast |
| Playlist loaded | `playlist:loaded` | `{ playlist: PlaylistMeta }` | Render playlist sidebar |
| Resolver result | `resolver:result` | `{ tracks: TrackResolverResult }` | Populate track list |
| Cache updated | `resolver:cache-updated` | — | Refresh resolver cache display |

### Tauri Command Signature Pattern
All Rust commands follow this pattern:

```rust
#[tauri::command]
async fn command_name(payload: CommandPayload) -> Result<ResponsePayload, String> {
    // validation
    // business logic
    // return Ok(response)
}
```

### Preload Script
- The `preload.ts` bridge exposes `window.__TAURI__.invoke()` and `window.__TAURI__.event`.
- UI never accesses `tauri::api` directly — all calls go through typed commands.
- Events are listened to via `window.addEventListener('tauri:event', ...)`.

### Example IPC Roundtrip: Load Playlist
1. User clicks "Load Spotify Playlist" in React UI.
2. React calls `window.__TAURI__.invoke('playlist:load', { uri: 'spotify:37i9dQZF1DXcBWIGoYBM5M' })`.
3. Tauri Rust handler fetches playlist data client-side (no server).
4. Rust returns `Ok({ tracks: [...] })` to React.
5. React updates the playlist view with the returned tracks.
6. If tracks need streaming, resolver engine is invoked (also via IPC or internal call).

### Example IPC Roundtrip: Play/Pause
1. User clicks play button.
2. React calls `window.__TAURI__.invoke('player:play', {})`.
3. Rust sets `webview_window->global_state().playback_state() = Playing`.
4. Rust sends `tauri::api::emit::emit` event `player:state-changed` with `{ state: 'PLAYING' }`.
5. React listener updates the button icon and shows "Now playing".

---

## 6. Diagrams

### Ingestion Flow
```
User URL/JSON
     ↓
Parser (JS) ──► Canonical Format
     │              |
     └─► Error → UI Message
     ↓
Store in IndexedDB (playlists objectStore)
     ↓
Render UI Track List
```

### Resolver Flow
```
Playlist/Track Request
     ↓
Resolver Engine (Piped/Invidious API)
     │              On Success: ──► Cache (IndexedDB, TTL 24h)
     │              On Failure: ──► Retry Next Instance
     ↓
Stream URLs + Metadata
     ↓
Forward to Playback Pipeline
```

### Playback Pipeline
```
Resolver → Audio Element src
     ↓
WebAudio API (optional effects)
     ↓
Buffered → Play/Seek/Volume
     ↓
Events → Tauri IPC → React State
```

### IPC Architecture
```
React UI          Tauri Preload         Rust Core
   │                   │                    │
   ├─ invoke(cmd) ───►│ invoke handler     │
   │                   │                    │
   │    ◄─── event ───│ emit event         │
   │                   │                    │
   └─ listen(event)  │ listen handler ◄──┘
```

---

## 7. Implementation Priorities (MVP)

| Feature | Tech | Priority |
|---|---|---|
| URL parsing (Spotify/YT Music) | JS regexp/spotify-url-parser | P0 |
| JSON export ingestion | JS FileReader + schema validation | P0 |
| Piped resolver (basic search/playlist) | fetch() to public instances | P0 |
| Audio playback (WebAudio + `<audio>`) | Tauri + React WebAudioContext | P0 |
| IndexedDB schema & CRUD | `idb` library or `localforage` | P0 |
| IPC command layer | Tauri `invoke` + `event` | P0 |
| Volume control | `audio.volume` + Tauri command | P1 |
| Seek support | `audio.currentTime` + command | P1 |
| History tracking | IndexedDB `history` objectStore | P2 |
| Resolver cache with TTL | IndexedDB `resolver_cache` | P2 |
| Multiple playlist instances | Instance selector UI | P2 |
| Dark/light theme | TailwindCSS + `prefers-color-scheme` | P1 |

---

## 8. Technical Notes

### Why Serverless?
- All data is local — no user accounts, no cloud sync (unless user opts in via manual export/import).
- Privacy: listening history, playlists, and search data never leave the machine.
- Offline-first: cached playlists and resolver results work without internet (except initial stream fetch).

### Piped/Invidious Selection
- The app bundles a **default list of public instances** but lets users add/remove instances.
- On resolver failure, the engine cycles through the list.
- If all instances fail, the user is notified and can retry or switch instances.

### IndexedDB vs SQLite Choice
- **IndexedDB** is the primary store because it's native to browsers, supports key-value and object store patterns, and doesn't require a backend.
- **SQLite** via Tauri is used as a fallback for environments with restricted IndexedDB (e.g., some enterprise browsers) or for very large datasets (>10,000 tracks) where SQLite performance is superior.
- The app detects IndexedDB availability on startup and chooses the appropriate backend.

### Error Boundaries
- All IPC commands wrap their logic in `try/catch` and return `Err(string)` on failure.
- UI displays friendly error messages based on the error type (parse error, resolver timeout, playback error, etc.).
- Unhandled errors are sent to `player:error` event for UI display.

### Future Extensions
- **Last.fm scrobbling** (optional, user-opt-in, sent directly to Last.fm API).
- **Custom audio effects** (EQ, bass boost) via WebAudio `BiquadFilterNode`.
- **Smart shuffle** using track metadata and user history.
- **Plugin system** for additional source parsers (Bandcamp, SoundCloud, etc.).