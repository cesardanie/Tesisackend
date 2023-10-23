const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();

router.post('/Login',async(req,response)=>{
  try{

      var status;



  }
  catch(e)
  {
      throw new Error(`se presento un error ${e.procName}.....${e.message} `)
  }
  response.json({       
      status:status})  

})
  
  module.exports = router;