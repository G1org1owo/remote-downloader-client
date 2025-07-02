let ws;
let aliveTimer;

async function connect() {
  const { wsUrl } = await chrome.storage.local.get('wsUrl');
  if (!wsUrl) return console.warn('No WS URL set');
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WS connected');
    aliveTimer = setInterval(() => ws?.send(JSON.stringify({ type: 'ping' })), 20000);
  };

  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.list) {
      chrome.storage.local.set({ downloads: msg.list });
      chrome.runtime.sendMessage({ type: 'update' });
    }
  };

  ws.onclose = () => {
    clearInterval(aliveTimer);
    setTimeout(connect, 2000);
  };
}

chrome.downloads.onCreated.addListener(item => {
  if (item.url) {
    chrome.downloads.cancel(item.id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'download', url: item.url }));
    } else {
      console.error('WS not ready');
    }
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'reconnect') {
    ws?.close();
    connect();
  }
});

// Start on load
connect();
