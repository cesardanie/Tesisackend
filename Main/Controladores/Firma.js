const { json, response } = require('express');
const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');
const llave = "ro8BS6Hiivgzy8Xuu09JDjlNLnSLldY5p";
const QueryFirma = require('../Consultas/QueryFirma');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const Jimp = require('jimp');

// Configuración de multer para manejar archivos adjuntos
const storage = multer.memoryStorage(); // Almacenar el archivo en memoria
const upload = multer({ storage: storage });

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        jwt.verify(authHeader, llave, (err, authHeader) => {
            if (err) {
                return res.status(200).json({ Validador: false });
            }
            req.authHeader = authHeader;
            next();
        });
    } else {
        res.status(401).json("no se ha podido autenticar");
    }
};

router.post('/FirmaInsert', verify, upload.single('firma'), async (request, response) => {
    try {
      const { file: firma } = request;
              // Access user ID from the request body
              const userId = request.body.id;
  
      if (!firma) {
        return response.status(400).json({ error: 'No se proporcionó la firma adjunta' });
      }
       // se modifica la estructura del nomnre para que pueda ser leida por la api cloud de whatsapp
        var name=firma.fieldname;
        var Type_Content=Identificacion_tipocontent(firma.mimetype);
        const uploadPath =path.join( __dirname, '../Upload/' +name);
      await Agregar_imagenes(uploadPath,firma,name,Type_Content,userId);
      console.log(request.body);
  
      const Respuesta = {
        Estado: true,
      };
  
      response.json(Respuesta);
    } catch (error) {
      console.error('Error al manejar la firma adjunta:', error.message);
      response.status(500).json({ error: 'Error interno del servidor' });
    }
  });

router.post('/certificadoempresa', async (request, response) => {
    var URL;
    var Datosdos=[];
    var validador=true,info,infodos;
    /*
    //Query de busqueda de los id de los productos con el id del cliente
    await GetImagenes.GetUsuario(req.body.Id).then(result=>{
        URL=result
    })
    //valida que venga algun dato en el retorno
    if(URL==0){
        validador=false;
        info={
            IdProducto: "",
            Llave: "",
            Estado: "",
        }
        infodos=null;   
    }
    if(validador===true){
        // recorrer los datos que trae para eso se accede al elemento y se le indica el dato que necesitamos
        for(var u=0;u<URL.length;u++)
        {
            await GetImagenes.GetProducto(URL[u].id).then(result=>{
                Datosdos.push(result);
            })
        }
    }*/
    try {
        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        // Nombre del archivo
        const nombreArchivo = 'firma.png';

        // Obtener la ruta del directorio actual del script
        const directorioActual = __dirname;

        // Construir la ruta completa al archivo
        const rutaCompleta = path.join(directorioActual, nombreArchivo);

        console.log('Ruta completa del archivo:', rutaCompleta);
        // Ruta de la imagen de la firma
        const firmaImagePath = directorioActual; // Ajusta la ruta según tu estructura de archivos
        const firmaImage = await Jimp.read(firmaImagePath);

        // Tamaño de la imagen de la firma
        const firmaWidth = 200;
        const firmaHeight = 100;

        // Página 1: Agregar texto y espacio para la firma
        doc.text('Este es un documento firmado', 50, 50);
        doc.addPage();

        // Página 2: Agregar la imagen de la firma
        doc.image(firmaImage.resize(firmaWidth, firmaHeight).bitmap, {
          align: 'center',
          valign: 'center',
        });

        // Finalizar el documento y enviarlo como respuesta
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', 'attachment; filename=documento-firmado.pdf');
        doc.pipe(response);
        doc.end();
    } catch (err) {
        console.error('Error al generar el PDF firmado:', err);
        response.status(500).send('Error interno del servidor');
    }

});

async function Identificacion_tipocontent(name)
{
    ///lee los ultimos 4 caracteres del nombre de la imagen
    const tipo = name.substring(name.length - 4);
    var tipostr='image/jpeg'
    if(tipo=="jpeg")
    {
        tipostr='image/jpeg'
        return tipostr
    }else if(tipo=="/png")
    {
        tipostr='image/png'
        return tipostr
    }

}
async function Agregar_imagenes(uploadPath,Image,name,Type_Content,userId)
{    
    var Nombreurlimagen="",strConEspaciosReemplazados="";
        Image.mv(uploadPath, async function(err) {
            if (err) {
                return respuestajson={
                    title: "agregado correctamente",
                    msg:'error Al cargar la imagen',
                };
            }
            //se tiene la imagen almacenada  
            const Lectura= await fs.createReadStream(uploadPath);
            //parametros necesarios para guardar en el bucket de s3
            const parametrosenviarbucket={
            Bucket: 'fastpayobjetos',
            Key: name, // File name you want to save as in S3
            Body: Lectura,
            ACL: 'public-read',
            ContentType: Type_Content,
        }  
        // la funcion upload sube una imagen el bucket 
        console.log(name);
        const command= new PutObjectCommand(parametrosenviarbucket)
        const result= await client.send(command);
        const params = {
            Bucket: "fastpayobjetos",
          };
          //tenemos el nombre del bucket en url
          const bucketUrl = `https://${params.Bucket}.s3.amazonaws.com/`;
          //unimos el bucket con el nombre de la imagen
          const lastObjectUrl = `${bucketUrl}${name}`;
          //la añadimos
          Nombreurlimagen=lastObjectUrl;
          ///Reemplaza los espacios con +
         strConEspaciosReemplazados = Nombreurlimagen.replace(/ /g, "+");
            /// se responde un json con los parametros correspondientes  
        jsonImagen.llave=strConEspaciosReemplazados;
        const resultadodos = await QueryFirma.InsertarFirma(userId, firma);
    });
}

module.exports = router;
