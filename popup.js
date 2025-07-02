const urlInput = document.getElementById('wsUrl');
const saveBtn = document.getElementById('saveBtn');
const listEl = document.getElementById('list');

// Load existing URL and download list
chrome.storage.local.get(['wsUrl', 'downloads'], res => {
  if (res.wsUrl) urlInput.value = res.wsUrl;
  if (res.downloads) render(res.downloads);
});

saveBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  chrome.storage.local.set({ wsUrl: url }, () => {
    alert('Saved!');
    chrome.runtime.sendMessage({ type: 'reconnect' });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'update') {
    chrome.storage.local.get('downloads', res => render(res.downloads));
  }
});

function render(list = []) {
  listEl.innerHTML = '';
  list.forEach(d => {
    const li = document.createElement('li');
    li.textContent = `${d.url} → ${d.status} (${d.progress || 0}%)`;
    listEl.appendChild(li);
  });
}
