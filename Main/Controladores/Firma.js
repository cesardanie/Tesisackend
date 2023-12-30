const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const jwt = require('jsonwebtoken');
const llave="ro8BS6Hiivgzy8Xuu09JDjlNLnSLldY5p";
const QueryFirma= require('../Consultas/QueryFirma');

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

router.post('/FirmaInsert',verify,async(request,response)=>{
    var Respuesta={
        Estado:"",
    }
    console.log(request);
    const resultadodos=await QueryFirma.InsertarFirma(request.body);
    console.log(request.body);
    Respuesta.Estado=true;
    response.send(Respuesta);

})

module.exports = router;