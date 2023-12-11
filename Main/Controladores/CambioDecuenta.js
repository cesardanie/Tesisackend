const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const QueryCuenta= require('../Consultas/QueryConsultaCuenta');

const jwt = require('jsonwebtoken');
const llave="ro8BS6Hiivgzy8Xuu09JDjlNLnSLldY5p";

const verify=(req,res,next)=>{
    ////leo la cabezera
        const authHeader=req.headers.authorization;
       ///verifico que no sea null
        if(authHeader){
            ///verifico el token 
            jwt.verify(authHeader,llave,(err,authHeader)=>{
                if(err)
                {
                   ///me retorna un error si esta mal
                    return res.status(200).json({Validador:false});
                }
               ///avanza a la siguiente parte del codigo
                req.authHeader=authHeader;
                next();
            });
        }else{
            res.status(401).json("no se ha podido autenticar");
    
        }
    
};
router.post('/OntenerCuenta', verify, async (request, response) => {
    var Respuesta = {
        Estado: "",
        Datos: null, // Agregamos un campo para almacenar los datos de la cuenta
    };
    try {
        // Utilizamos await directamente en lugar de then para esperar la respuesta de la función
        const resultados = await QueryCuenta.consultarCuenta(request.body.id);

        // Almacenamos los resultados en la respuesta
        Respuesta.Datos = resultados;

        // Modificamos el estado después de haber completado la operación correctamente
        Respuesta.Estado = true;
    } catch (error) {
        // Manejo de errores, aquí puedes personalizar cómo manejar los errores
        console.error(error);
        Respuesta.Estado = false;
        Respuesta.Error = error.message;
    }

    // Enviamos la respuesta
    response.send(Respuesta);
});
router.post('/cambiarcuenta',verify,async(request,response)=>{
    var Respuesta = {
        Estado: "",
        Datos: null, // Agregamos un campo para almacenar los datos de la cuenta
    };
    console.log(request.body.id);
    const resultadodos=await QueryCuenta.actualizarCuenta(request.body.id,request.body.Cuenta,request.body.Banco);
        // Almacenamos los resultados en la respuesta
        Respuesta.Datos = resultadodos;

        // Modificamos el estado después de haber completado la operación correctamente
        Respuesta.Estado = true;
    response.send(Respuesta);

})

module.exports = router;