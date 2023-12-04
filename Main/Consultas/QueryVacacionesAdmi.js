const sql= require('mssql');
const cnxlocal=require('../Conexiones/cnx.js');

async function ObtenerVacacionesAdmi() {
    try {
        let pool = await sql.connect(cnxlocal);
        const resultCalendario = await pool.request().query('SELECT * FROM Calendario');
        
        // Obtener los idUsuario únicos de los resultados de Calendario
        const uniqueUserIds = [...new Set(resultCalendario.recordset.map(item => item.idUsuario))];
        
        // Consultar Usuarios por idUsuario
        const resultUsuarios = await Promise.all(uniqueUserIds.map(async (idUsuario) => {
          const usuarioResult = await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .query('SELECT Correo FROM Usuarios WHERE id = @idUsuario');
          return { idUsuario, correo: usuarioResult.recordset[0]?.Correo || null };
        }));
    
        // Combinar los resultados de Calendario con los correos de Usuarios
        const calendarioConUsuarios = resultCalendario.recordset.map(calendarioItem => {
          const usuarioData = resultUsuarios.find(usuario => usuario.idUsuario === calendarioItem.idUsuario);
          return { ...calendarioItem, correo: usuarioData?.correo || null };
        });
    
        return calendarioConUsuarios;
      } catch (e) {
        throw new Error(`Se presentó un error: ${e.message}`);
      }
  }
  module.exports = {
    ObtenerVacacionesAdmi,
    // Otros métodos o variables que necesites exportar
};