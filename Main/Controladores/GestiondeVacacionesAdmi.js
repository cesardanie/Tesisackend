const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const jwt = require('jsonwebtoken');
const llave="ro8BS6Hiivgzy8Xuu09JDjlNLnSLldY5p";
const ObtenerVacacionesGerente=require('../Consultas/QueryVacacionesAdmi');


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

router.get('/ObtenerDiasAdmi',verify,async(request,response)=>{
    try{
        var Respuesta={
            Estado:"",
            data:"",
        }
        var Datos=[];
        await ObtenerVacacionesGerente.ObtenerVacacionesAdmi().then(result=>{
            for(var i=0;i<result.length;i++)
            {
                Datos.push(result[i]);
            }
            Respuesta.Estado=true
        })
        Respuesta.data=Datos;
        response.send(Respuesta);
    }catch(e)
    {
        throw new Error(`Se presento un Error en ${e.procName}.....${e.message}`)
    }
})
router.post('/updateAdmiDias',verify,async(request,response)=>{
    try{
        const id=request.body.id;
        const Estado=request.body.Estado;

        var Respuesta={
            Estado:"",
            data:"",
        }
        var Datos=[];
        await ObtenerVacacionesGerente.CambioEstadoAdmi(Estado,id).then(result=>{
            console.log(result);
        })
        Respuesta.data=Datos;
        response.send(Respuesta);
    }catch(e)
    {
        throw new Error(`Se presento un Error en ${e.procName}.....${e.message}`)
    }
})


module.exports = router;