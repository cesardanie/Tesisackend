const sql= require('mssql');
const cnxlocal=require('../Conexiones/cnx.js');

async function consultarUsuarios()
{
    try{
        let pool = await sql.connect(cnxlocal);
        let consultaradministradores= await pool.query(`SELECT * FROM Usuarios`);
        return consultaradministradores.recordset;

    }
    catch(e)
    {
        throw new Error(`Se presento un Error en ${e.procName}.....${e.message}`)
    }

}
async function EliminarUsuario(id)
{
    try{
        let pool = await sql.connect(cnxlocal);
          await pool.request()
          .input('idUsuario', sql.Int, id)
          .query('DELETE FROM Calendario WHERE idUsuario = @idUsuario');
        let consultarAdministradores = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Usuarios WHERE id = @id');

        return consultarAdministradores.recordset;

    }
    catch(e)
    {
        throw new Error(`Se presento un Error en ${e.procName}.....${e.message}`)
    }
}
async function AgregarUsuario(Correo, Contrasena, Rol) {
    try {
      let pool = await sql.connect(cnxlocal);
      var Respuesta={
        Estado:"",
    }
      // Verificar si ya existe un usuario con el mismo correo
      let verificarUsuario = await pool
        .request()
        .input('Correo', sql.VarChar(255), Correo)
        .query('SELECT * FROM Usuarios WHERE Correo = @Correo');
      if (verificarUsuario.recordset.length > 0) {
        // Si ya existe un usuario con el mismo correo, puedes manejar el error o devolver algún indicativo
        return Respuesta.Estado=false
      }
      else{
        Respuesta.Estado=true;
        // Si no existe, procede con la inserción
        let insertarUsuario = await pool
        .request()
        .input('Correo', sql.VarChar(255), Correo)
        .input('Contrasena', sql.VarChar(255), Contrasena)
        .input('Rol', sql.VarChar(50), Rol)
        .query('INSERT INTO Usuarios (Correo, Contrasena, Rol) VALUES (@Correo, @Contrasena, @Rol)');
      }
      

  
      return Respuesta;
  
    } catch (e) {
      throw new Error(`Se presentó un error en ${e.procName}.....${e.message}`);
    }
  }
  
module.exports = {
    consultarUsuarios,
    EliminarUsuario,
    AgregarUsuario
    // Otros métodos o variables que necesites exportar
};