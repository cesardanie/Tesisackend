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

router.post('/FirmaInsert', upload.single('firma'), verify, async (request, response) => {
    try {
        const firma = request.file;
        if (!firma) {
            return response.status(400).send('No se subió ningún archivo');
        }
        // Access user ID from the request body
        const userId = request.body.id;


        // se modifica la estructura del nomnre para que pueda ser leida por la api cloud de whatsapp
        var name = firma.fieldname;
        var Type_Content = Identificacion_tipocontent(firma.mimetype);
        const uploadPath = path.join(__dirname, '../Upload/' + name);
        await Agregar_imagenes(uploadPath, firma, name, Type_Content, userId);
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


async function Identificacion_tipocontent(name) {
    ///lee los ultimos 4 caracteres del nombre de la imagen
    const tipo = name.substring(name.length - 4);
    var tipostr = 'image/jpeg'
    if (tipo == "jpeg") {
        tipostr = 'image/jpeg'
        return tipostr
    } else if (tipo == "/png") {
        tipostr = 'image/png'
        return tipostr
    }

}
async function Agregar_imagenes(uploadPath, Image, name, Type_Content, userId) {
    var Nombreurlimagen = "", strConEspaciosReemplazados = "";
    Image.mv(uploadPath, async function (err) {
        if (err) {
            return respuestajson = {
                title: "agregado correctamente",
                msg: 'error Al cargar la imagen',
            };
        }
        //se tiene la imagen almacenada  
        const Lectura = await fs.createReadStream(uploadPath);
        //parametros necesarios para guardar en el bucket de s3
        const parametrosenviarbucket = {
            Bucket: 'fastpayobjetos',
            Key: name, // File name you want to save as in S3
            Body: Lectura,
            ACL: 'public-read',
            ContentType: Type_Content,
        }
        // la funcion upload sube una imagen el bucket 
        console.log(name);
        const command = new PutObjectCommand(parametrosenviarbucket)
        const result = await client.send(command);
        const params = {
            Bucket: "fastpayobjetos",
        };
        //tenemos el nombre del bucket en url
        const bucketUrl = `https://${params.Bucket}.s3.amazonaws.com/`;
        //unimos el bucket con el nombre de la imagen
        const lastObjectUrl = `${bucketUrl}${name}`;
        //la añadimos
        Nombreurlimagen = lastObjectUrl;
        ///Reemplaza los espacios con +
        strConEspaciosReemplazados = Nombreurlimagen.replace(/ /g, "+");
        /// se responde un json con los parametros correspondientes  
        jsonImagen.llave = strConEspaciosReemplazados;
        const resultadodos = await QueryFirma.InsertarFirma(userId, firma);
    });
}

module.exports = router;
