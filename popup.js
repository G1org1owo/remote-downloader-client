const settingsBtn = document.getElementById('settingsBtn');
const tbody = document.querySelector('#downloads tbody');
const enableToggle = document.getElementById('enableToggle');

settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

// Render list items
function render(list = []) {
  tbody.innerHTML = '';
  list.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.url.split('/').pop()}</td>
      <td>${d.status}</td>
      <td>
        <div class="progress-container">
          <div class="progress-bar" style="width:${d.progress || 0}%;"></div>
        </div>
      </td>`;
    tbody.appendChild(tr);
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

// Load stored toggle state and update UI
chrome.storage.local.get(['downloads', 'enabled'], res => {
  if (res.downloads) render(res.downloads);
  enableToggle.checked = res.enabled ?? true;  // default to true
  initPort();
});

// When toggle changes, update storage and notify background
enableToggle.addEventListener('change', () => {
  const enabled = enableToggle.checked;
  chrome.storage.local.set({ enabled });
  // Notify background script if needed, e.g. via runtime.sendMessage
  chrome.runtime.sendMessage({ type: 'toggleEnabled', enabled });
});
