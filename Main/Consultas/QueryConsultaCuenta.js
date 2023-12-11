const sql= require('mssql');
const cnxlocal=require('../Conexiones/cnx.js');

async function consultarCuenta(idUsuario) {
    try {
        let pool = await sql.connect(cnxlocal);

        // Modificación para buscar por IdUsuario
        let consultaPorIdd=await pool.request()
        .input('idUsuario', sql.Int, idUsuario)
        .query('SELECT * FROM  CuentasBancarias WHERE idUsuario=@idUsuario')
        return consultaPorIdd.recordset;
    } catch (e) {
        throw new Error(`Se presentó un error en ${e.procName}.....${e.message}`);
    }
}
async function actualizarCuenta(idUsuario, nuevaCuenta, nuevoBanco) {
    try {
        let pool = await sql.connect(cnxlocal);

        // Modificación para actualizar por IdUsuario
        let consultaUpdate = await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .input('nuevaCuenta', sql.VarChar(255), nuevaCuenta)
            .input('nuevoBanco', sql.VarChar(255), nuevoBanco)
            .query('UPDATE CuentasBancarias SET Cuenta = @nuevaCuenta, Banco = @nuevoBanco WHERE idUsuario = @idUsuario');

        return consultaUpdate.rowsAffected; // Devuelve la cantidad de filas afectadas por la actualización
    } catch (e) {
        throw new Error(`Se presentó un error en ${e.procName}.....${e.message}`);
    }
}
module.exports = {
    consultarCuenta,
    actualizarCuenta,
    // Otros métodos o variables que necesites exportar
};