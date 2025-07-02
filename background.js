let ws;
const connect = () => {
  ws = new WebSocket("wss://YOUR_SERVER/ws");
  ws.onopen = () => { console.log("WS open"); keepAlive(); };
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    chrome.storage.local.set({ downloads: msg.list });
    chrome.runtime.sendMessage({ type: 'update' });
  };
  ws.onclose = () => setTimeout(connect, 2000);
};
const keepAlive = () =>
  setInterval(() => ws?.send(JSON.stringify({ type: "ping" })), 20_000);

chrome.downloads.onCreated.addListener(item => {
  if (item.url && item.mime) {
    chrome.downloads.cancel(item.id);
    ws.send(JSON.stringify({ type: "download", url: item.url }));
  }
});

connect();
