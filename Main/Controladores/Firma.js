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
  
      if (!firma) {
        return response.status(400).json({ error: 'No se proporcionó la firma adjunta' });
      }
  
      // Ahora `firma.buffer` contiene los datos del archivo adjunto en formato de búfer
  
      // Aquí puedes usar QueryFirma.InsertarFirma(request.body, firma.buffer) para insertar la firma junto con otros datos
      const resultadodos = await QueryFirma.InsertarFirma(request.body, firma.buffer);
  
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

const convertirYGuardarImagen = (firmaBuffer, rutaDeGuardado) => {
    return new Promise((resolve, reject) => {
        // Verifica el formato de la imagen antes de usar sharp
        const imageType = require('image-type');
        const formato = imageType(firmaBuffer);
        console.log('Formato de imagen:', formato);

        // Intenta crear una imagen directamente sin cambiar el formato
        sharp(firmaBuffer, { input: formato })
            .toFile(rutaDeGuardado, (err, info) => {
                if (err) {
                    console.error('Error al convertir y guardar la imagen:', err);
                    reject(err);
                } else {
                    console.log('Imagen decodificada y guardada:', rutaDeGuardado);
                    resolve(info);
                }
            });
    });
};



module.exports = router;
