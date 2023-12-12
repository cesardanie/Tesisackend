const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const jwt = require('jsonwebtoken');
const Nomina=require('../Consultas/QueryNomina');
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

router.post('/AgregarPagos',verify,async(request,response)=>{
    console.log(request.body);
    const idUsuario=request.body.id;
    const Mes=request.body.mes;
    const Estado=request.body.estado;
    var Respuesta={
        Estado:"",
    }
    const resultadodos=await Nomina.InsertarPago(idUsuario,Mes,Estado);
    Respuesta.Estado=true;
    response.send(Respuesta);

})
router.get('/ExtraerDatosNomina',verify,async(request,response)=>{

    var Respuesta = {
        Estado: "",
        Datos: null, // Agregamos un campo para almacenar los datos de la cuenta
    };
    const resultadodos=await Nomina.ObtenerDatos();
    Respuesta.Estado=true;
    Respuesta.Datos=resultadodos;
    response.send(Respuesta);

})
router.post('/ExtraerDatosNominaCliente',verify,async(request,response)=>{

    var Respuesta = {
        Estado: "",
        Datos: null, // Agregamos un campo para almacenar los datos de la cuenta
    };
    const resultadodos=await Nomina.ObtenerDatosCliente(request.body.id);
    Respuesta.Estado=true;
    Respuesta.Datos=resultadodos;
    response.send(Respuesta);

})

module.exports = router;