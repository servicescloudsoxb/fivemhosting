const express = require('express');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

let serverProcess = null;  // Variable para almacenar el proceso del servidor

// Ruta para servir los archivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// Ruta para iniciar el servidor
app.get('/start-server', (req, res) => {
    const batFilePath = path.join(__dirname, 'start-server.bat');  // Ruta del archivo .bat

    // Usamos spawn para ejecutar el archivo .bat
    serverProcess = spawn('cmd.exe', ['/c', batFilePath]);

    // Enviar datos del proceso a la consola en tiempo real
    serverProcess.stdout.on('data', (data) => {
        io.emit('console-output', data.toString());  // Emitir los datos al cliente
    });

    serverProcess.stderr.on('data', (data) => {
        io.emit('console-output', `Error: ${data.toString()}`);
    });

    serverProcess.on('close', (code) => {
        if (code === 0) {
            io.emit('console-output', 'Servidor iniciado correctamente');
        } else {
            io.emit('console-output', `Hubo un error al iniciar el servidor. Código: ${code}`);
        }
    });

    res.send('Servidor iniciado');
});

// Ruta para detener el servidor
app.get('/stop-server', (req, res) => {
    if (serverProcess) {
        // Terminamos el proceso directamente si está en ejecución
        serverProcess.kill();
        io.emit('console-output', 'Servidor detenido correctamente');
        res.send('Servidor detenido');
    } else {
        // Si no hay un proceso en ejecución, intentamos matar el proceso por el nombre
        const stopCommand = 'taskkill /f /im FXServer.exe';  // Reemplaza con el nombre de tu proceso si es diferente
        exec(stopCommand, (error, stdout, stderr) => {
            if (error) {
                io.emit('console-output', `Error al detener el servidor: ${error.message}`);
                return;
            }
            if (stderr) {
                io.emit('console-output', `Error: ${stderr}`);
                return;
            }
            io.emit('console-output', `Servidor detenido: ${stdout}`);
        });
        res.send('Intentando detener el servidor...');
    }
});

// Ruta para reiniciar el servidor
app.get('/restart-server', (req, res) => {
    if (serverProcess) {
        // Terminamos el proceso directamente si está en ejecución
        serverProcess.kill();
        io.emit('console-output', 'Servidor detenido correctamente');

        // Esperamos un poco antes de reiniciar el servidor para asegurarnos de que el proceso haya finalizado
        setTimeout(() => {
            // Reiniciar el servidor
            const batFilePath = path.join(__dirname, 'start-server.bat');  // Ruta del archivo .bat

            serverProcess = spawn('cmd.exe', ['/c', batFilePath]);

            // Enviar datos del proceso a la consola en tiempo real
            serverProcess.stdout.on('data', (data) => {
                io.emit('console-output', data.toString());  // Emitir los datos al cliente
            });

            serverProcess.stderr.on('data', (data) => {
                io.emit('console-output', `Error: ${data.toString()}`);
            });

            serverProcess.on('close', (code) => {
                if (code === 0) {
                    io.emit('console-output', 'Servidor reiniciado correctamente');
                } else {
                    io.emit('console-output', `Hubo un error al reiniciar el servidor. Código: ${code}`);
                }
            });

            res.send('Servidor reiniciado');
        }, 2000);  // Esperar 2 segundos antes de reiniciar el servidor
    } else {
        res.send('No hay un servidor en ejecución para reiniciar');
    }
});


server.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
