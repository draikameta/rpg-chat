const socket = io();
const messagesEl = document.getElementById("messages");
const inputArea = document.getElementById("input-area");
const msgInput = document.getElementById("msg-input");
const sendBtn = document.getElementById("send-btn");

const username = "P.K";
const chat = "pk";

function formatMessage(msg) {
  return `
    <li>
      <span class="sender">${msg.sender}:</span> ${msg.message}
    </li>
  `;
}

function loadHistory() {
  fetch(`/history/${chat}`)
    .then(res => res.json())
    .then(data => {
      messagesEl.innerHTML = data.map(formatMessage).join("");
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
}

sendBtn.addEventListener("click", () => {
  const message = msgInput.value.trim();
  if (!message) return;
  socket.emit("message", { chat, sender: username, message });
  msgInput.value = "";
});

msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

socket.on("connect", () => {
  socket.emit("join", { user: username, chat });
});

socket.on("message", (msg) => {
  if (msg.chat === chat) {
    messagesEl.innerHTML += formatMessage(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
});

// Carregar histórico inicial
loadHistory();
