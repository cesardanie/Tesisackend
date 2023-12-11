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
                .query('SELECT Cuenta, Banco FROM CuentasBancarias WHERE idUsuario = @idUsuario');

            // Verificar si se encontró información en CuentasBancarias
            if (consultaCuentasBancarias.recordset.length > 0) {
                // Agregar la información de CuentasBancarias al objeto de usuario
                usuarios[i].Cuenta = consultaCuentasBancarias.recordset[0].Cuenta;
                usuarios[i].Banco = consultaCuentasBancarias.recordset[0].Banco;
            } else {
                // Manejar el caso donde no se encuentra información en CuentasBancarias
                usuarios[i].Cuenta = null;
                usuarios[i].Banco = null;
            }
        }

        return usuarios; // Devuelve la información de usuarios con datos de CuentasBancarias
    } catch (e) {
        throw new Error(`Se presentó un error en ${e.procName}.....${e.message}`);
    }
}


module.exports = {
    consultarCuenta,
    actualizarCuenta,
    ObtenerDatos,
    // Otros métodos o variables que necesites exportar
};