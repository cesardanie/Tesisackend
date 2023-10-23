const sql= require('mssql');
async function consultaradministradores(clientes)
{
    try{

        let pool = await sql.connect(cnxaws);
        let consultaradministradores= await pool.query(`SELECT * FROM Administradorespremiun WHERE Correo='${clientes.Correo}' and Contrasena='${clientes.Contrasena}'`);
        return consultaradministradores.recordset;

    }
    catch(e)
    {
        throw new Error(`Se presento un Error en ${e.procName}.....${e.message}`)
    }

}