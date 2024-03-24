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
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

// Configuración de multer para manejar archivos adjuntos
const storage = multer.memoryStorage(); // Almacenar el archivo en memoria
const upload = multer({ storage: storage });
const client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: 'AKIAZQ3DOV3DG4XZCFFJ',
        secretAccessKey: '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',
    }
})
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
async function Agregar_imagenes(uploadPath, file, name, Type_Content, userId) {
    try {
        // Verificar que el archivo esté presente
        if (!file) {
            throw new Error('No se subió ningún archivo');
        }

        // No es necesario mover el archivo manualmente, ya está en memoryStorage de multer

        // Parámetros para subir a AWS S3
        const parametrosenviarbucket = {
            Bucket: 'fastpayobjetos',
            Key: name,
            Body: file.buffer, // Utiliza el buffer del archivo
            ACL: 'public-read',
            ContentType: file.mimetype,
        }

        // Subir el archivo a AWS S3
        const command = new PutObjectCommand(parametrosenviarbucket);
        const result = await client.send(command);

        // Obtener la URL del objeto subido en S3 directamente de parametrosenviarbucket
        const bucketUrl = `https://${parametrosenviarbucket.Bucket}.s3.amazonaws.com/`;
        const objectUrl = `${bucketUrl}${name}`;
        const parametrosQuery={
            id:userId,
            llave:objectUrl,
            bucket:'fastpayobjetos',
        }
        const firma=await QueryFirma.InsertarFirma(parametrosQuery);
        // Reemplazar espacios con +
        const urlConEspaciosReemplazados = objectUrl.replace(/ /g, "+");

        // Devolver la URL generada
        return urlConEspaciosReemplazados;
    } catch (error) {
        console.error('Error al agregar la imagen:', error);
        throw error; // Propagar el error para manejarlo en la capa superior
    }
}


module.exports = router;
