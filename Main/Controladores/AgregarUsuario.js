const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const Admnistradorquerys= require('../Consultas/QueryLogin.js')
const UsuariosQuery=require('../Consultas/QueryConsultaUsuarios.js')

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

router.post('/AgregarUsuarios',verify,async(request,response)=>{
    const Correo=request.body.Correo;
    const Contrasena=request.body.Contrasena;
    const Rol=request.body.Rol;
    var Respuesta={
        Estado:"",
    }
    await UsuariosQuery.AgregarUsuario(Correo,Contrasena,Rol).then(result=>{
        Respuesta.Estado=result;
    })
    response.send(Respuesta);

})

module.exports = router;