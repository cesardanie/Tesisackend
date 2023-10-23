const usuarios = [
    { username: 'usuario1', password: 'contraseña1' },
    { username: 'usuario2', password: 'contraseña2' },
  ];
  
  function login(req, res) {
    const { username, password } = req.body;
  
    // Verifica si las credenciales coinciden con un usuario en la matriz
    const usuario = usuarios.find(user => user.username === username && user.password === password);
  
    if (usuario) {
      // Las credenciales son válidas, el usuario está autenticado
      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } else {
      // Las credenciales no son válidas, el usuario no está autenticado
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  }
  
  module.exports = { login };