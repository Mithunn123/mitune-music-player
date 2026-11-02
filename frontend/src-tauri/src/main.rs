#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn playlist_load(id: String) {
    println!("Loading playlist: {}", id);
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
fn file_import(path: String) {
    println!("Importing file: {}", path);
}

#[tauri::command]
fn resolver_set_instance(url: String) {
    println!("Setting resolver instance: {}", url);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            playlist_load,
            player_play,
            player_pause,
            player_seek,
            file_import,
            resolver_set_instance
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
