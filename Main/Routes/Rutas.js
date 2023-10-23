const express = require('express');
const router = express.Router();
const controladorLogin = require('../Controladores/Login'); // Importa la función del controlador de inicio de sesión

// Define una ruta que utiliza la función del controlador para manejar la solicitud
router.get('/Login', controladorLogin.handleLogin); // Utiliza "handleLogin" o el nombre correcto de la función

module.exports = router;
