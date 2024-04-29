try{
    const cnx={
        ///datos de conexion 
        user:'admin',
        password:'nicolas2096',
        server:'pruebacorazon.c9aku0gc6h25.us-east-1.rds.amazonaws.com,1433',
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
    ///Local
    ///user:sa
    ///server:'GWNR71517\\SQLEXPRESS',
    ///