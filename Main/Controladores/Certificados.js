const express = require('express');
const PDFDocument = require('pdfkit');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const QueryAdministrador = require('../Consultas/QueryConsultaUsuarios')
const path = require('path');
const fs = require('fs');  // Importar el módulo fs
const sharp = require('sharp');

const router = express.Router();

const client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: 'AKIAZQ3DOV3DG4XZCFFJ',
        secretAccessKey: '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',
    }
})
router.post('/ObtenerCertificadolaboral', async (req, res) => {
    try {
        const name = "pdfcertificadolaboral";
        const doc = new PDFDocument();
        const Datos = await QueryAdministrador.BuscarUsuarios(req.body.id);

        // Agregar contenido al PDF
        doc.fillColor('red');
        doc.fontSize(20).text('Certificado de Cesantias', { align: 'center' });
        doc.fillColor('black');
        doc.moveDown();
        doc.fontSize(16).text(`Por medio del presente certificado, hacemos constar que ${Datos[0].Nombre}, afiliado al fondo de cesantías Porvenir, ha sido un trabajador dedicado y comprometido durante su tiempo de servicio en nuestra empresa. El señor ${Datos[0].Nombre} se desempeñó como ${Datos[0].Puesto}  demostrando responsabilidad, eficiencia y compromiso en todas sus labores.`, { underline: false });
        doc.moveDown();

        // Agregar las partes del documento
        doc.fontSize(12).text(`Nombre: ${Datos[0].Nombre}`);
        doc.fontSize(12).text(`Cargo: ${Datos[0].Puesto}`);
        doc.fontSize(12).text(`Sueldo: ${Datos[0].Sueldo}`);

        const s3Params = {
            Bucket: 'fastpayobjetos',
            Key: 'firma',
        };
        const { Body } = await client.send(new GetObjectCommand(s3Params));

        const folderPath = path.join(__dirname, 'carpeta');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Guardar el flujo de datos en un archivo temporal
        const imagePath = path.join(folderPath, 'tempImagen.png');
        const fileStream = fs.createWriteStream(imagePath);
        Body.pipe(fileStream);

        fileStream.on('finish', async () => {
            console.log('Imagen guardada correctamente');
            // Redimensionar la imagen con sharp (opcional)
            const resizedImagePath = path.join(folderPath, 'resizedImagen.png');
            const imagePath = path.join(folderPath, 'tempImagen.png');
            const imageOptions = { fit: [doc.page.width - 50, doc.page.height - 50], align: 'center', valign: 'center' };
            doc.moveDown(); // Moverse hacia abajo para agregar espacio
            doc.moveDown(); // Moverse hacia abajo para agregar espacio
            doc.image(imagePath, 0, 0, imageOptions);
            doc.moveDown(); // Moverse hacia abajo para agregar espacio
            doc.moveDown(); // Moverse hacia abajo para agregar espacio
            doc.moveDown(); // Moverse hacia abajo para agregar espacio
            doc.text('\n\n')
            doc.fillColor('red');
            doc.fontSize(12).text('\nFirma del Gerente', { align: 'center' });
            doc.fillColor('black');
            // Finalizar y cerrar el documento PDF
            doc.end();

            const pdfBuffer = await new Promise((resolve, reject) => {
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', reject);
            });
            // Subir el PDF a Amazon S3 y enviar la URL al cliente
            const uploadParams = {
                Bucket: 'fastpayobjetos',
                Key: name,
                Body: pdfBuffer,
                ACL: 'public-read',
                ContentType: 'application/pdf',
            };
            const result = await client.send(new PutObjectCommand(uploadParams));
            const bucketUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/`;
            const objectUrl = `${bucketUrl}${name}`;
            res.status(200).json({ objectUrl });
        });

        fileStream.on('error', err => {
            console.error('Error al guardar el archivo:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        });
    } catch (error) {
        console.error('Error en la generación del PDF:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;