const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
router.post('/Soporte',async(req,response)=>{
  try{

      var status;
      await Consulta.SoporteInsert(req.body).then(result=>{
          result;
          if(result[0]==1)
          {
              status="200";
          }
          else{
              status="602"
          }

      })


  }
  catch(e)
  {
      throw new Error(`se presento un error ${e.procName}.....${e.message} `)
  }
  response.json({       
      status:status})  

})
  
  module.exports = router;