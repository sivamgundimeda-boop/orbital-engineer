# Orbital Engineer
## Run
    npm install
    npm start
Open http://localhost:3000. A QR code prints in the terminal for phones on the same Wi-Fi.

## Structure
    server.js            static server + terminal QR
    public/index.html    home screen
    public/css/style.css styles and palette (CSS variables at the top)
    public/js/main.js    home screen logic
    public/assets/       images
    public/assets/audio/ sound effects + background music (original, generated - see tools/)
    public/js/audio.js   audio engine + Audio Settings dialog (loaded by every page)
    public/css/audio.css styles for the Audio Settings dialog
    tools/generate-audio.py  recreates every file in public/assets/audio (optional, not needed to play)
New pages go in public/ (e.g. public/mission.html). "Start Mission" already links to mission.html.

## Audio
Sound effects and music are all original (synthesised by `tools/generate-audio.py`), so there are no licences or attribution to worry about.

| File (`public/assets/audio/`) | Plays when |
|---|---|
| `attach.mp3` | a component is successfully installed / a structural link is made |
| `detach.mp3` | a component or a connection is successfully removed |
| `power.mp3` | a power connection is successfully made (once per connection; auto-connect plays it once) |
| `data.mp3` | a data link is successfully made |
| `click.mp3` | any button, tab, card or menu link is clicked (not on actions that already have their own sound) |
| `background_music.mp3` | continuous 96-second loop |

* **Audio Settings**: the *Settings* tab (header) or the *Settings* button (main menu). Music and sound effects each have an ON/OFF switch and a 0-100% volume slider. Choices are saved in `localStorage` (`oe_audio`) and apply on every page.
* **Autoplay**: browsers only allow sound after a click/tap, so the music starts on the first click or tap (immediately if the browser allows autoplay).
* **Page changes**: every page is a separate HTML file, so the music position is remembered and resumed on the next page (a very short fade, no restart).
* To swap a sound, replace the file in `public/assets/audio/` keeping the same name. If you replace `background_music.mp3` with a track of a different length, change `LOOP_SEC` at the top of `public/js/audio.js`.
* Debugging: `localStorage.setItem('oe_audio_debug','1')` then `OEAudio.debug()` / `OEAudio.history` in the browser console.
