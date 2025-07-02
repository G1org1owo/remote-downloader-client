const urlInput = document.getElementById('wsUrl');
const saveBtn = document.getElementById('saveBtn');
const listEl = document.getElementById('list');

// Render list items
function render(list = []) {
  listEl.innerHTML = '';
  list.forEach(d => {
    const li = document.createElement('li');
    li.textContent = `${d.url} → ${d.status} (${d.progress || 0}%)`;
    listEl.appendChild(li);
  });
}

// Setup port connection for live updates
function initPort() {
  const port = chrome.runtime.connect({ name: 'popup' });
  port.onMessage.addListener(msg => {
    if (msg.type === 'update') {
      render(msg.list);
    }
  });
}

// Initial load of saved values
chrome.storage.local.get(['wsUrl', 'downloads'], res => {
  if (res.wsUrl) urlInput.value = res.wsUrl;
  if (res.downloads) render(res.downloads);
  initPort();
});

// Save button behavior
saveBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  chrome.storage.local.set({ wsUrl: url }, () => {
    chrome.runtime.sendMessage({ type: 'reconnect' });
    alert('Server address saved!');
  });
});
