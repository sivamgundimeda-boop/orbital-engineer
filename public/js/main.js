// Quit: close the tab. Browsers only allow window.close() for tabs opened by a script,
// so if it is blocked we fall back to a blank page.
document.getElementById('quitBtn').addEventListener('click', () => {
  window.close();
  setTimeout(() => { window.location.replace('about:blank'); }, 150);
});
