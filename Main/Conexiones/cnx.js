try{
    const cnx={
        ///datos de conexion 
        user:'sa',
        password:'123456789',
        server:'GWNR71517\\SQLEXPRESS',
        requestTimeout: 80000,
        database:'Gestionadministrativa',
        options:{
            trustedconnection: true,
            enableArithAbort:true,
            encrypt:false,
        },
    
        port:1433
    }
    module.exports=cnx;
    }catch(error)
    {
         console.log(error.message);
    }