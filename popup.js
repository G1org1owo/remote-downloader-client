function render(list) {
  const ul = document.getElementById("list");
  ul.innerHTML = "";
  list.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.url} → ${d.status} (${d.progress || 0}%)`;
    ul.appendChild(li);
  });
}

chrome.storage.local.get("downloads", res => res.downloads && render(res.downloads));

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'update') {
    chrome.storage.local.get("downloads", res => render(res.downloads));
  }
});
