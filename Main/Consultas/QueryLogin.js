const sql= require('mssql');
const cnxlocal=require('../Conexiones/cnx.js');

async function consultaradministradores(clientes)
{
    try{
        console.log(clientes);
        let pool = await sql.connect(cnxlocal);
        let consultaradministradores= await pool.query(`SELECT * FROM Usuarios WHERE Correo='${clientes.Correo}' and Contrasena='${clientes.Contrasena}'`);
        return consultaradministradores.recordset;

    }
    catch(e)
    {
        throw new Error(`Se presento un Error en ${e.procName}.....${e.message}`)
    }

}
module.exports = {
    consultaradministradores,
    // Otros métodos o variables que necesites exportar
};