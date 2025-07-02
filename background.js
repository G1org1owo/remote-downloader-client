let ws;
let aliveTimer;
let popupPort = null;
let downloads = {};

async function connect() {
  const { wsUrl } = await chrome.storage.local.get('wsUrl');
  if (!wsUrl) {
    console.warn('No WS URL set');
    return;
  }

  ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    console.log('WS connected');
    aliveTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.list) {
      downloads = {};
      msg.list.forEach(d => downloads[d.id || d.url] = d);
      broadcastUpdate(Object.values(downloads));
    }
  };

  ws.onclose = () => {
    clearInterval(aliveTimer);
    popupPort = null;
    setTimeout(connect, 2000);
  };
  ws.onerror = err => console.error('WS error', err);
}

chrome.downloads.onCreated.addListener(item => {
  chrome.storage.local.get('interceptionEnabled', res => {
    if (res.interceptionEnabled && item.url) {
      chrome.downloads.cancel(item.id);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'download', url: item.url }));
      } else {
        console.error('WS not ready');
      }
    }
  })
});

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'popup') {
    popupPort = port;
    chrome.storage.local.get('downloads', res => {
      const list = res.downloads || [];
      port.postMessage({ type: 'update', list });
    });
    port.onDisconnect.addListener(() => {
      popupPort = null;
    });
  }
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'reconnect') {
    ws?.close();
    connect();
  }
  else if (msg.type === 'toggleEnabled') {
    let interceptionEnabled = msg.enabled;
    chrome.storage.local.set({ interceptionEnabled })
    console.log(`Remote download interception is now ${interceptionEnabled ? 'enabled' : 'disabled'}`);
  }
});

function broadcastUpdate(list) {
  chrome.storage.local.set({ downloads: list });
  if (popupPort) {
    popupPort.postMessage({ type: 'update', list });
  }
}

connect();
