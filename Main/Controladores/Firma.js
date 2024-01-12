const { json, response } = require('express');
const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');
const llave = "ro8BS6Hiivgzy8Xuu09JDjlNLnSLldY5p";
const QueryFirma = require('../Consultas/QueryFirma');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const path = require('path');
const multer = require('multer');

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
      await Agregar_imagenes(uploadPath,firma,guardarurl,name,Type_Content,userId);
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
    var Respuesta = {
        Estado: "",
    }

    try {
        const resultadodos = await QueryFirma.ObtenerFirma(request.body);
        console.log(resultadodos);
        const firmaBuffer = Buffer.from(resultadodos, 'base64');
        const rutaDeGuardado = path.join(__dirname, '../Upload/' + "firma.png");

        if (Buffer.isBuffer(firmaBuffer)) {
            if (firmaBuffer.length > 0) {
                console.log('firmaBuffer es un objeto Buffer válido con datos de imagen.');
            } else {
                console.error('Error: firmaBuffer está vacío. No hay datos para procesar.');
            }
        } else {
            console.error('Error: firmaBuffer no es un objeto Buffer válido.');
        }

        console.log(rutaDeGuardado);

        await convertirYGuardarImagen(firmaBuffer, rutaDeGuardado);

        const outputPath = 'output.pdf';
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        doc.fontSize(14).text('Este es un documento PDF con la firma:', 50, 50);
        doc.moveDown();
        doc.image(rutaDeGuardado, { width: 500, height: 500, align: 'center' });
        doc.end();

        stream.on('finish', () => {
            console.log(`PDF creado exitosamente en: ${outputPath}`);
        });

        stream.on('error', (err) => {
            console.error('Error al escribir el PDF:', err);
        });

        Respuesta.Estado = true;
        response.send(Respuesta);

    } catch (error) {
        console.error('Error general:', error);
        Respuesta.Estado = false;
        response.send(Respuesta);
    }

});
function Identificacion_tipocontent(name)
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
async function Agregar_imagenes(uploadPath,Image,guardarurl,name,Type_Content,userId)
{    
    var Nombreurlimagen="",strConEspaciosReemplazados="";
        Image.mv(uploadPath, async function(err) {
            if (err) {
                return respuestajson={
                    title: "agregado correctamente",
                    url:guardarurl,
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
