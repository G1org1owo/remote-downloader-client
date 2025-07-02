const settingsBtn = document.getElementById('settingsBtn');
const tbody = document.querySelector('#downloads tbody');

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

chrome.storage.local.get(['wsUrl', 'downloads'], res => {
  if (res.downloads) render(res.downloads);
  initPort();
});