const sql= require('mssql');
const cnxlocal=require('../Conexiones/cnx.js');

async function AgregarCalendario(id, DiaInicial, DiaFinal, Observacion, Estado) {
  try {
    let pool = await sql.connect(cnxlocal);
    var Respuesta = {
      Estado: false,
    }

    let insertarCalendario = await pool
      .request()
      .input('idUsuario', sql.Int, id)
      .input('DiaInicial', sql.Date, DiaInicial)
      .input('DiaFinal', sql.Date, DiaFinal)
      .input('Observacion', sql.VarChar(255), Observacion)
      .input('Estado', sql.VarChar(50), Estado)
      .query('INSERT INTO Calendario (idUsuario,DiaInicial, DiaFinal, Observacion, Estado) VALUES (@idUsuario, @DiaInicial, @DiaFinal, @Observacion, @Estado)');

    Respuesta.Estado = true;
    return Respuesta;

  } catch (e) {
    throw new Error(`Se presentó un error en ${e.procName}.....${e.message}`);
  }
}
async function ObtenerCalendario(idUsuario) {
  try {
    let pool = await sql.connect(cnxlocal);
    let consultarCalendario = await pool
      .request()
      .input('idUsuario', sql.Int, idUsuario)
      .query('SELECT * FROM Calendario WHERE idUsuario = @idUsuario');

    return consultarCalendario.recordset;
  } catch (e) {
    throw new Error(`Se presentó un error: ${e.message}`);
  }
}

  module.exports = {
    AgregarCalendario,
    ObtenerCalendario,
    // Otros métodos o variables que necesites exportar
};