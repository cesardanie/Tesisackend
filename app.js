const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors'); // Asegúrate de agregar esta línea
const router = express.Router();
const Login = require('./Main/Controladores/Login.js');
// No necesitas una segunda declaración de cors aquí

app.use(cors());

var whitelist = process.env.PORT || ['http://localhost:3000']; // Permito que solo esta URL se conecte

app.use('/api', Login);
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
