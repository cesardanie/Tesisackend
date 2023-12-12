const sql= require('mssql');
const cnxlocal=require('../Conexiones/cnx.js');


async function InsertarPago(idUsuario, Mes, Estado) {
    try {
      let pool = await sql.connect(cnxlocal);
  
      // Realizar la inserción en la tabla Nomina
      let resultado = await pool
        .request()
        .input('idUsuario', sql.Int, idUsuario)
        .input('Mes', sql.VarChar(255), Mes)
        .input('Estado', sql.VarChar(255), Estado)
        .query('INSERT INTO Nomina (idUsuario, Mes, Estado) VALUES (@idUsuario, @Mes, @Estado)');
  
      // Si necesitas obtener información sobre la inserción, puedes acceder a resultado.recordset
  
      return resultado.recordset;
    } catch (e) {
      throw new Error(`Se presentó un error: ${e.message}`);
    }
  }
async function ObtenerDatos() {
    try {
        let pool = await sql.connect(cnxlocal);

        // Paso 1: Obtener todos los usuarios
        let consultaUsuarios = await pool.request().query('SELECT * FROM Usuarios');
        let usuarios = consultaUsuarios.recordset;

        // Paso 2: Para cada usuario, obtener la información de CuentasBancarias si está disponible
        for (let i = 0; i < usuarios.length; i++) {
            let idUsuario = usuarios[i].id;

            // Consulta para obtener información de CuentasBancarias por idUsuario
            let consultaCuentasBancarias = await pool.request()
                .input('idUsuario', sql.Int, idUsuario)
                .query('SELECT Mes, Estado  FROM Nomina WHERE idUsuario = @idUsuario');

            // Verificar si se encontró información en CuentasBancarias
            if (consultaCuentasBancarias.recordset.length > 0) {
                // Agregar la información de CuentasBancarias al objeto de usuario
              
                    usuarios[i].Nomina= consultaCuentasBancarias.recordset;

                
            } else {
                // Manejar el caso donde no se encuentra información en CuentasBancarias
                usuarios[i].Mes = null;
                usuarios[i].Estado = null;
            }
        }

        return usuarios; // Devuelve la información de usuarios con datos de CuentasBancarias
    } catch (e) {
        throw new Error(`Se presentó un error en ${e.procName}.....${e.message}`);
    }
}
async function ObtenerDatosCliente(id) {
    try {
            let pool = await sql.connect(cnxlocal);
            let idUsuario = id;
            // Consulta para obtener información de CuentasBancarias por idUsuario
            let consultaCuentasBancarias = await pool.request()
                .input('idUsuario', sql.Int, idUsuario)
                .query('SELECT Mes, Estado  FROM Nomina WHERE idUsuario = @idUsuario');
               return consultaCuentasBancarias.recordset; // Devuelve la información de usuarios con datos de CuentasBancarias
    } catch (e) {
        throw new Error(`Se presentó un error en ${e.procName}.....${e.message}`);
    }
}
module.exports = {
    InsertarPago,
    ObtenerDatos,
    ObtenerDatosCliente
    // Otros métodos o variables que necesites exportar
};