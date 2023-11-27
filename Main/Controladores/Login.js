const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const CryptoJS = require('crypto-js');
const Admnistradorquerys= require('../Consultas/QueryLogin.js')




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
                  guardar_id=element.idCliente
                  var Rol=element.Rol
                  const user={
                      Usuario:element.Usuario,
                      Contrasena:element.contrasena,
                  }
                  const tokencheck= jwt.sign(user,llave,{
                      expiresIn:'20m'//expricacion del token
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
  
  module.exports = router;