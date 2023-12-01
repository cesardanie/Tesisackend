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
module.exports = {
    consultarUsuarios,
    // Otros métodos o variables que necesites exportar
};