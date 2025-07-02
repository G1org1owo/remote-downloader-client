const uriInput = document.getElementById('wsUrl');
const saveBtn = document.getElementById('saveBtn');

chrome.storage.local.get('wsUrl', r => uriInput.value = r.wsUrl || '');

saveBtn.addEventListener('click', () => {
  chrome.storage.local.set({ wsUrl: uriInput.value.trim() }, () => {
    chrome.runtime.sendMessage({ type: 'reconnect' });
    alert('Saved!');
  });
});
