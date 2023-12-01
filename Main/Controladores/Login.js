const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const CryptoJS = require('crypto-js');
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

router.post('/IniciarSesion',async (request,response)=>{
  try{
        console.log(request.body)
      var bytes=CryptoJS.AES.decrypt(request.body.Contrasena,'DANIELRODRIGUEZGARNICA');
      var bytesCorreo=CryptoJS.AES.decrypt(request.body.Correo,'DANIELRODRIGUEZGARNICA');
      var textocifrcCorre=bytesCorreo.toString(CryptoJS.enc.Utf8)
      var textocifr=bytes.toString(CryptoJS.enc.Utf8)
      request.body.Correo=textocifrcCorre;
      request.body.Contrasena=textocifr;
      var guardar_id;
      var guardardos= request.body
      let respuestaboll={
          estado:"false",
          token: null,
      }; 
    await  Admnistradorquerys.consultaradministradores(guardardos).then(result=>{
          console.log(result);
          result.forEach(element => {
              console.log(element);
              if((guardardos.Correo.toString().toLowerCase()==element.Correo)&&(guardardos.Contrasena==element.Contrasena))
              {
                  guardar_id=element.id
                  var Rol=element.Rol
                  const user={
                      Usuario:element.Correo,
                      Contrasena:element.Contrasena,
                  }
                  const tokencheck= jwt.sign(user,llave,{
                      expiresIn:'10m'//expricacion del token
                  });
                  response.set("authorization",tokencheck);
                  respuestaboll={
  
                      estado:"true",
                      token:tokencheck,
                      id:guardar_id,
                      Rol:Rol
                      
                  }
              }
              });
          response.send(respuestaboll);
      })        
}catch(e)
{
  throw new Error(`Se presento un Error en ${e.procName}.....${e.message}`)
}   

});

router.get('/ObtenerUsuarios',verify,async(request,response)=>{
    try{
        var Respuesta={
            Estado:"",
            data:"",
        }
        var Datos=[];
        await UsuariosQuery.consultarUsuarios().then(result=>{
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