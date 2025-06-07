const socket = io();

const tabs = document.querySelectorAll(".tab-btn");
const messagesEl = document.getElementById("messages");
const inputArea = document.getElementById("input-area");
const msgInput = document.getElementById("msg-input");
const sendBtn = document.getElementById("send-btn");

let currentChat = "dk"; // default aba
let username = "I.P";   // usuário do tablet
let activeChats = ["pk"]; // só "pk" pode enviar mensagens no tablet

function formatMessage(msg) {
  return `
    <li>
      <span class="sender">${msg.sender}:</span> ${msg.message}
    </li>
  `;
}

function loadHistory(chat) {
  fetch(`/history/${chat}`)
    .then(res => res.json())
    .then(data => {
      messagesEl.innerHTML = data.map(formatMessage).join("");
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
}

function setActiveTab(chat) {
  currentChat = chat;
  tabs.forEach(t => t.classList.toggle("active", t.dataset.chat === chat));
  loadHistory(chat);

  // Mostrar input só para chat ativo
  if (activeChats.includes(chat)) {
    inputArea.classList.remove("hidden");
    socket.emit("join", { user: username, chat });
  } else {
    inputArea.classList.add("hidden");
  }
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.chat));
});

sendBtn.addEventListener("click", () => {
  const message = msgInput.value.trim();
  if (!message) return;
  socket.emit("message", { chat: currentChat, sender: username, message });
  msgInput.value = "";
});

msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Receber mensagem em tempo real se estiver no chat P.K
socket.on("message", (msg) => {
  if (msg.chat === currentChat) {
    messagesEl.innerHTML += formatMessage(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
});

// Inicializa na aba D.K
setActiveTab(currentChat);
