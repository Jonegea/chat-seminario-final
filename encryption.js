// Clave secreta para cifrado/desencriptado
const secretKey = "mySecretKey";

// Encrypt the message before sending
function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
}

// Decrypt the message when received
function decryptMessage(cipherText) {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Conexión al WebSocket
let socket;

function connectWebSocket() {
    socket = new WebSocket('ws://localhost:3000'); // Cambia 8080 a 3000

    socket.addEventListener('open', () => {
        console.log("Conexión establecida con el servidor WebSocket.");
    });

    socket.addEventListener('message', (event) => {
        const encryptedMessage = event.data;
        const decryptedMessage = decryptMessage(encryptedMessage);
        displayMessage(decryptedMessage);
    });

    socket.addEventListener('close', () => {
        console.log("Conexión cerrada, intentando reconectar...");
        setTimeout(connectWebSocket, 3000); // Intenta reconectar después de 3 segundos
    });

    socket.addEventListener('error', (error) => {
        console.error("Error en WebSocket:", error);
    });
}

connectWebSocket();

// Obtener elementos del DOM
const chatWindow = document.getElementById('chat');
const messageForm = document.getElementById('form');
const messageInput = document.getElementById('message');

// Agregar un listener al formulario para manejar el envío de mensajes
messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = messageInput.value;

    if (message.trim() !== '') {
        if (socket.readyState === WebSocket.OPEN) {
            const encryptedMessage = encryptMessage(message);
            socket.send(encryptedMessage);
            displayMessage(`Tú: ${message}`);
            messageInput.value = '';
        } else {
            console.error('El WebSocket no está abierto. Estado:', socket.readyState);
        }
    }
});

// Función para mostrar mensajes en la ventana del chat
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
