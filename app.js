const express = require('express');
const app = express();
const port = 3000;
const rutas= require('./Main/Routes/Rutas.js');
app.use('/api',rutas)


app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
