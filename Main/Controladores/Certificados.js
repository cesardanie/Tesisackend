const express = require('express');
const PDFDocument = require('pdfkit');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const QueryAdministrador=require('../Consultas/QueryConsultaUsuarios')

const router = express.Router();

const client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: 'AKIAZQ3DOV3DG4XZCFFJ',
        secretAccessKey: '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',
    }
})
router.post('/ObtenerCertificadolaboral', async (req, res) => {
    console.log(req.body);
    const name = "pdfcertificadolaboral"
    // Crear un nuevo documento PDF
    const doc = new PDFDocument();
    const Datos=await QueryAdministrador.BuscarUsuarios(req.body.id)
    console.log(Datos);
    // Agregar contenido al PDF
    doc.fontSize(20).text('Certificado Laboral', { align: 'center' });
    doc.moveDown(); // Moverse hacia abajo para separar el título del contenido
    doc.fontSize(16).text('Por medio del presente certificado, hacemos constar que el señor, se encuentra afiliado(a) al fondo de cesantías Porvenir, en calidad de trabajador(a) de la empresa Plásticos La Pradera. Durante su tiempo de servicio, el(a) empleado(a) ha demostrado compromiso, dedicación y responsabilidad en sus labores, contribuyendo de manera significativa al desarrollo y crecimiento de nuestra empresa. Actualmente, se encuentra activo(a) y desempeñando sus funciones de manera eficiente y proactiva.  Este certificado se expide a petición del(a) interesado(a) para los fines que considere pertinentes. Quedamos a disposición para cualquier consulta adicional.', { underline: false });
    doc.moveDown(); // Moverse hacia abajo antes de agregar el contenido

    // Agregar las partes del documento, por ejemplo:
    doc.fontSize(12).text(`Nombre: ${Datos[0].Nombre}`);
    doc.fontSize(12).text(`Cargo: ${Datos[0].Puesto}`);
    doc.fontSize(12).text(`Sueldo: ${Datos[0].Sueldo}`);
    // Finalizar y cerrar el documento PDF
    doc.end();

    // Convertir el PDF a un buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
    });

    // Subir el PDF a Amazon S3
    const uploadParams = {
        Bucket: 'fastpayobjetos',
        Key: name,
        Body: pdfBuffer, // Utiliza el buffer del archivo
        ACL: 'public-read',
        ContentType:'application/pdf',
    }

    try {
        // Subir el archivo a AWS S3
        const command = new PutObjectCommand(uploadParams);
        const result = await client.send(command);
        // Obtener la URL del objeto subido en S3 directamente de parametrosenviarbucket
        const bucketUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/`;
        const objectUrl = `${bucketUrl}${name}`;
        res.status(200).json({ objectUrl });
    } catch (error) {
        console.error('Error al subir el archivo a S3:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;