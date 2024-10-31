const express = require('express');
const app = express();
const cors = require('cors');
// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());
app.use(cors());


// Importar las funciones
const { crearUsuario,loginUsuario, obtenerUsuarios, crearAccion, obtenerAcciones } = require('./app');

// Ruta para crear un usuario
app.post('/crearUsuario', async (req, res) => {
    const { fullname, password } = req.body;
    console.log(req.body)
    if (!fullname) {
        return res.status(400).send({ error: 'Debe incluir el parametro fullname!' });
    }
    try {
        await crearUsuario(fullname, password);
        return res.status(201).send({ mensaje: 'Usuario creado exitosamente!' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Error al crear el usuario' });
    }
    
});
app.post('/loginUsuario',async (req, res) =>{
    const { fullname, password } = req.body;
    if (!fullname || !password) {
        return res.status(400).send({ error: 'Debe incluir el parametro fullname y/o password!' });
    }
    try {
        const result = await loginUsuario(fullname, password); 
        if (result.status) {
            return res.status(201).send({ mensaje: 'Usuario logeado!' });
        }    
        return res.status(401).send ({mensaje :'Usario y/o contraseña incorrectos'});
        }
         catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Error al logearse '});
    }
    
})
app.post('/crearAccion', async(req, res)=>{
    const { descripcion }= req.body;
    if(!descripcion){
        return res.status(400).send({ error: 'Debe incluir el parametro descripcion!' });
    }
    try {
        await crearAccion(descripcion);
        return res.status(201).send({ mensaje: 'Accion creado exitosamente!' });
    } catch (error) {
        return res.status(500).send({ error: 'Error al crear la Accion' });  
    }
    }

);
// Ruta para obtener usuarios
app.get('/obtenerUsuarios', async (req, res) => {
    try {
        const usuarios = await obtenerUsuarios();
        console.log('Usuarios en el servidor:', usuarios); // Agregar esta línea para depuración
        return res.status(200).send({ usuarios });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Error al obtener los usuarios' });
    }
});
app.get('/obtenerAccion', async (req, res) => {
    try {
        const acciones = await obtenerAcciones();
        return res.status(200).send({acciones});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Error al obtener los Acciones' });
    }
});


// Definir otras rutas para las demás funciones según sea necesario

const PORT = 3000;
app.listen(PORT, (error) => {
    if (error) {
        console.log('Error en la configuración');
    }
    console.log(`Servidor ejecutándose en: http://127.0.0.1:${PORT}`);
});
