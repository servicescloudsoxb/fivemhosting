const socket = io();

// Elementos de la consola
const consoleOutput = document.getElementById('consoleOutput');
const consoleInput = document.getElementById('consoleInput');
const sendCommandButton = document.getElementById('sendCommandButton');
const startServerButton = document.getElementById('startServer');
const stopServerButton = document.getElementById('stopServer');

// Recibir salida de la consola en tiempo real
socket.on('consoleOutput', (data) => {
    const line = document.createElement('div');
    line.textContent = data;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight; // Auto-scroll
});

// Enviar comandos a través de WebSocket
sendCommandButton.addEventListener('click', () => {
    const command = consoleInput.value;
    if (command) {
        socket.emit('sendCommand', command);
        consoleInput.value = '';
    }
});

// Iniciar servidor al hacer clic en el "Iniciar Servidor"
startServerButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/start');
        const message = await response.text();
        consoleOutput.appendChild(createConsoleLine(message));
    } catch (error) {
        consoleOutput.appendChild(createConsoleLine('Error al iniciar el servidor.'));
    }
});

// Detener servidor al hacer clic en el botón
stopServerButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/stop');
        const message = await response.text();
        consoleOutput.appendChild(createConsoleLine(message));
    } catch (error) {
        consoleOutput.appendChild(createConsoleLine('Error al detener el servidor.'));
    }
});

// Crear una línea para mostrar en la consola
function createConsoleLine(text) {
    const line = document.createElement('div');
    line.textContent = text;
    return line;
}
