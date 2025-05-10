const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Client } = require('pg');

const app = express();
const port = 3000;

app.use(express.static(__dirname));

// Middleware para procesar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de sesiones
app.use(session({
    secret: 'tu_secreto_unico',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configuración de PostgreSQL
const client = new Client({
    host: 'localhost',
    database: 'pepito',
    user: 'postgres',
    password: '5789',
    port: 5432,
});

// Conectar a la base de datos
client.connect()
    .then(() => console.log('¡Conexión exitosa a PostgreSQL!'))
    .catch(err => console.error('Error al conectar a PostgreSQL:', err));

// Registro de usuarios
app.post('/registrar', async (req, res) => {
    const { nombres, apellidos, telefono, correo, contrasena } = req.body;

    try {
        const checkQuery = 'SELECT * FROM usuarios WHERE correo = $1';
        const checkResult = await client.query(checkQuery, [correo]);

        if (checkResult.rows.length > 0) {
            console.log('El correo ya está registrado:', correo);
            return res.status(400).json({ message: 'El correo ya está registrado' });
        } else {
            const query = `INSERT INTO usuarios (nombres, apellidos, telefono, correo, contraseña) VALUES ($1, $2, $3, $4, $5)`;
            await client.query(query, [nombres, apellidos, telefono, correo, contrasena]);
            console.log(`¡Registro exitoso para el usuario: ${nombres}!`);
            res.status(200).json({ message: '¡Registro exitoso!' });
        }
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        const query = 'SELECT * FROM usuarios WHERE nombre_usuario = $1';
        const result = await client.query(query, [usuario]);

        if (result.rows.length > 0) {
            const isPasswordCorrect = contrasena === result.rows[0].contraseña;

            if (isPasswordCorrect) {
                req.session.usuario = result.rows[0];
                console.log('Información de sesión:', req.session.usuario);
                res.status(200).json({ message: 'Inicio de sesión exitoso', usuario: result.rows[0].nombre_usuario });
            } else {
                console.log('Contraseña incorrecta');
                res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }
        } else {
            console.log('Usuario no encontrado');
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});


// Ruta del perfil
app.get('/perfil', (req, res) => {
    if (req.session.usuario) {
        res.send(`Bienvenido, ${req.session.usuario.nombre_usuario}`);
    } else {
        res.status(401).send('No has iniciado sesión');
    }
});

// estado de sesión y nombre del usuario
app.get('/checkSession', (req, res) => {
    if (req.session.usuario) {
        res.json({ isLoggedIn: true, nombreUsuario: req.session.usuario.nombre_usuario });
    } else {
        res.json({ isLoggedIn: false });
    }
});

// cerrar sesion
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar la sesión:', err);
            return res.status(500).json({ error: 'Error al cerrar la sesión' });
        }
        res.json({ message: 'Sesión cerrada exitosamente' });
    });
});


// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
