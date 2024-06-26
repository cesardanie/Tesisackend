const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const GestionarDias=require('../Consultas/QueryCalendario');


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

router.post('/AgregarDias',verify,async(request,response)=>{
    const id=request.body.id;
    const DiaInicial=request.body.startDate;
    const DiaFinal=request.body.endDate;
    const Observacion= request.body.observaciones;
    const Estado=request.body.Estado;
    var Respuesta={
        Estado:"",
    }
    console.log(request.body.id);
    await GestionarDias.AgregarCalendario(id,DiaInicial,DiaFinal,Observacion,Estado).then(result=>{

    })
    Respuesta.Estado=true;
    response.send(Respuesta);

})
router.post('/ObtenerDias',verify,async(request,response)=>{
    try{
        var Respuesta={
            Estado:"",
            data:"",
        }
        var Datos=[];
        await GestionarDias.ObtenerCalendario(request.body.id).then(result=>{
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
module.exports = router;