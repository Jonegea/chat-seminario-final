const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch'); // Para la verificación de reCAPTCHA
const nodemailer = require('nodemailer'); // Para enviar correos

// Funciones de autenticación y acciones (asegúrate de que './app' tenga estas funciones)
const { crearUsuario, loginUsuario, obtenerUsuarios, crearAccion, obtenerAcciones } = require('./app');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware para analizar JSON y habilitar CORS
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del WebSocket
wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);
        // Reenviar el mensaje a todos los usuarios conectados, excepto el remitente
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Rutas HTTP para autenticación y acciones
app.post('/crearUsuario', async (req, res) => {
    const { fullname, email, username, password, recaptchaResponse } = req.body;

    // Verificar que se incluyan todos los campos
    if (!fullname || !email || !username || !password) {
        return res.status(400).send({ error: 'Debe incluir todos los parámetros: fullname, email, username y password!' });
    }

    // Verificar el CAPTCHA
    const secretKey = 'TU_CLAVE_SECRETA_RECAPTCHA';
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    const recaptchaVerificationResponse = await fetch(recaptchaUrl, { method: 'POST' });
    const recaptchaVerificationData = await recaptchaVerificationResponse.json();

    if (!recaptchaVerificationData.success) {
        return res.status(400).send({ error: 'Verificación de CAPTCHA fallida.' });
    }

    // Generar un código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos

    // Configurar nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail', // O cualquier otro servicio de correo
        auth: {
            user: 'tucorreo@gmail.com', // Tu correo
            pass: 'tu_contraseña' // Tu contraseña (considera usar OAuth2 en producción)
        }
    });

    const mailOptions = {
        from: 'tucorreo@gmail.com',
        to: email,
        subject: 'Código de Verificación',
        text: `Tu código de verificación es: ${verificationCode}`
    };

    // Enviar el correo de verificación
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send({ error: 'Error al enviar el correo de verificación.' });
        }

        // Aquí podrías guardar el usuario y el código en la base de datos, usando tu lógica de crearUsuario
        // Asegúrate de guardar también el código de verificación para futuras verificaciones
        console.log('Código de verificación enviado:', verificationCode);
        res.status(201).send({ success: true, mensaje: 'Usuario creado exitosamente y se ha enviado un código de verificación.' });
    });
});

// Ruta para verificar el código de verificación
app.post('/verificarCodigo', (req, res) => {
    const { verificationCode } = req.body;

    // Aquí deberías implementar la lógica para verificar si el código es correcto
    // Por ejemplo, compararlo con el que guardaste cuando se registró el usuario
    // Esto es solo un ejemplo, reemplaza con tu propia lógica
    if (verificationCode === 'codigo_almacenado_en_base_de_datos') {
        res.status(200).send({ success: true, mensaje: 'Código de verificación correcto.' });
    } else {
        res.status(400).send({ error: 'Código de verificación incorrecto.' });
    }
});

app.post('/loginUsuario', async (req, res) => {
    const { fullname, password } = req.body;
    if (!fullname || !password) {
        return res.status(400).send({ error: 'Debe incluir el parametro fullname y/o password!' });
    }
    try {
        const result = await loginUsuario(fullname, password);
        if (result.status) {
            return res.status(201).send({ mensaje: 'Usuario logeado!' });
        }
        return res.status(401).send({ mensaje: 'Usuario y/o contraseña incorrectos' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Error al logearse' });
    }
});

app.post('/crearAccion', async (req, res) => {
    const { descripcion } = req.body;
    if (!descripcion) {
        return res.status(400).send({ error: 'Debe incluir el parametro descripcion!' });
    }
    try {
        await crearAccion(descripcion);
        return res.status(201).send({ mensaje: 'Accion creada exitosamente!' });
    } catch (error) {
        return res.status(500).send({ error: 'Error al crear la acción' });
    }
});

app.get('/obtenerUsuarios', async (req, res) => {
    try {
        const usuarios = await obtenerUsuarios();
        return res.status(200).send({ usuarios });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Error al obtener los usuarios' });
    }
});

app.get('/obtenerAccion', async (req, res) => {
    try {
        const acciones = await obtenerAcciones();
        return res.status(200).send({ acciones });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Error al obtener las acciones' });
    }
});

// Iniciar el servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en: http://127.0.0.1:${PORT}`);
});
