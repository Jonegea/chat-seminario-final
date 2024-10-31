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

// Código del lado del cliente
const socket = new WebSocket('ws://localhost:3000');

// Obtener elementos del DOM
const chatWindow = document.getElementById('chat');
const messageForm = document.getElementById('form');
const messageInput = document.getElementById('message');

// Agregar un listener al formulario para manejar el envío de mensajes
messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Obtener el mensaje del campo de entrada
    const message = messageInput.value;
    console.log("Mensaje original: ", message);
    // Verificar si el mensaje no está vacío antes de enviarlo
    if (message.trim() !== '') {
        // Encrypt the message
        const encryptedMessage = encryptMessage(message);
        console.log("Mensaje cifrado: ", encryptedMessage);

        // Enviar el mensaje cifrado al servidor a través del socket WebSocket
        socket.send(encryptedMessage);
        // Mostrar el mensaje enviado por el propio cliente en la ventana del chat
        displayMessage(`Tú: ${message}`); // Display original message for sender
        // Limpiar el campo de entrada
        messageInput.value = '';
    }
});

// Agregar un listener para manejar los mensajes entrantes desde el servidor
socket.addEventListener('message', (event) => {
    // Obtener el mensaje cifrado del evento
    const encryptedMessage = event.data;
    console.log("Mensaje cifrado recibido: ", encryptedMessage);

    // Decrypt the message
    const decryptedMessage = decryptMessage(encryptedMessage);
    console.log("Mensaje descifrado: ", decryptedMessage);

    // Mostrar el mensaje descifrado en la ventana del chat
    displayMessage(decryptedMessage);
});

// Función para mostrar mensajes en la ventana del chat
function displayMessage(message) {
    // Crear un nuevo elemento <div> para el mensaje
    const messageElement = document.createElement('div');
    // Establecer el texto del elemento como el mensaje recibido
    messageElement.textContent = message;
    // Añadir el elemento al chatWindow
    chatWindow.appendChild(messageElement);
    // Asegurar que el chat se desplace hacia abajo para mostrar el mensaje más reciente
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
