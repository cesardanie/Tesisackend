const sql = require('mssql');
const cnxlocal = require('../Conexiones/cnx.js');

async function InsertarFirma(clientes) {
    try {
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
    } catch (e) {
        throw new Error(`Se presentó un error en ${e.procName}.....${e.message}`);
    }
}

async function ObtenerFirma(idUsuario) {
    try {
        let pool = await sql.connect(cnxlocal);
        let selectQuery = `
            SELECT firma_base64
            FROM Firmas
            WHERE idUsuario = @idUsuario
        `;
      
        let result = await pool.request()
            .input('idUsuario', sql.Int, idUsuario.id)
            .query(selectQuery);

        // Verificar si se obtuvo algún resultado
        if (result.recordset.length > 0) {
            return result.recordset[0].firma_base64;
        } else {
            throw new Error(`No se encontró ninguna firma para el usuario con ID ${idUsuario}`);
        }
    } catch (e) {
        throw new Error(`Se presentó un error al obtener la firma: ${e.message}`);
    }
}

module.exports = {
    InsertarFirma,
    ObtenerFirma,
    // Otros métodos o variables que necesites exportar
};
