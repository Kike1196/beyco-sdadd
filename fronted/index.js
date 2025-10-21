const express = require('express');
const app = express();
const PORT = 3000; // Este es el puerto que expusimos en el Dockerfile

app.get('/', (req, res) => {
  res.send('¡Hola Mundo! Mi contenedor BEYCO-app está funcionando correctamente.');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
