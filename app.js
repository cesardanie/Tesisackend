const express = require('express');
const app = express();
const port = 3023;
const cors = require('cors'); // Asegúrate de agregar esta línea
const router = express.Router();
const Login = require('./Main/Controladores/Login.js');
const delet=require('./Main/Controladores/EliminarUsuarios.js');
const addUsuario=require('./Main/Controladores/AgregarUsuario.js')
// No necesitas una segunda declaración de cors aquí

app.use(cors());

var whitelist = process.env.PORT || ['http://localhost:3023']; // Permito que solo esta URL se conecte
app.use(express.json());
app.use('/add', addUsuario);
app.use('/api', Login);
app.use('/delete',delet);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
