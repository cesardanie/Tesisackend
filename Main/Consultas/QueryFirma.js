const sql= require('mssql');
const cnxlocal=require('../Conexiones/cnx.js');

async function InsertarFirma(clientes)
{
    try{
        console.log(clientes);
        let pool = await sql.connect(cnxlocal);
        let insertQuery = `
        INSERT INTO Firmas (idUsuario, firma_base64)
        VALUES (@idUsuario, @firma_base64)
      `;
      
      let insertData = await pool.request()
        .input('idUsuario', sql.Int, clientes.id)
        .input('firma_base64', sql.Text, clientes.firmaBase64)
        .query(insertQuery);

    }
    catch(e)
    {
        throw new Error(`Se presento un Error en ${e.procName}.....${e.message}`)
    }

}
module.exports = {
    InsertarFirma,
    // Otros métodos o variables que necesites exportar
};