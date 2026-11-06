#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamStreamInfo {
    pub url: String,
    pub format: String,
    pub quality: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResolverResult {
    pub track_id: String,
    pub stream_url: String,
    pub streams: Vec<StreamStreamInfo>,
}

#[tauri::command]
fn playlist_load(id: String) -> Result<String, String> {
    println!("Loading playlist: {}", id);
    Ok(format!("Playlist {} loaded", id))
}

#[tauri::command]
fn player_play() {
    println!("Player play");
}

#[tauri::command]
fn player_pause() {
    println!("Player pause");
}

#[tauri::command]
fn player_seek(time: f64) {
    println!("Player seek to: {}", time);
}

#[tauri::command]
fn player_set_volume(volume: f64) {
    println!("Player set volume to: {}", volume);
}

#[tauri::command]
fn player_next() {
    println!("Player next track");
}

#[tauri::command]
fn player_prev() {
    println!("Player previous track");
}

#[tauri::command]
fn file_import(path: String) -> Result<String, String> {
    println!("Importing file: {}", path);
    Ok(format!("Imported {}", path))
}

#[tauri::command]
fn resolver_set_instance(url: String) {
    println!("Setting resolver instance: {}", url);
}

#[tauri::command]
fn resolver_resolve(track_id: String, source: String, uri: String) -> Result<ResolverResult, String> {
    println!("Resolving track {} from source {} with URI {}", track_id, source, uri);
    Ok(ResolverResult {
        track_id: track_id.clone(),
        stream_url: format!("https://pipedapi.kavin.rocks/stream/{}", track_id),
        streams: vec![StreamStreamInfo {
            url: format!("https://pipedapi.kavin.rocks/stream/{}", track_id),
            format: "audio/webm".to_string(),
            quality: "high".to_string(),
        }],
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            playlist_load,
            player_play,
            player_pause,
            player_seek,
            player_set_volume,
            player_next,
            player_prev,
            file_import,
            resolver_set_instance,
            resolver_resolve
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
