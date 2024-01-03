const { json, response } = require('express');
const expres =require('express');
const axios= require('axios');
const router=expres.Router();
const jwt = require('jsonwebtoken');
const llave="ro8BS6Hiivgzy8Xuu09JDjlNLnSLldY5p";
const QueryFirma= require('../Consultas/QueryFirma');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const verify=(req,res,next)=>{
    ////leo la cabezera
        const authHeader=req.headers.authorization;
       ///verifico que no sea null
        if(authHeader){
            ///verifico el token 
            jwt.verify(authHeader,llave,(err,authHeader)=>{
                if(err)
                {
                   ///me retorna un error si esta mal
                    return res.status(200).json({Validador:false});
                }
               ///avanza a la siguiente parte del codigo
                req.authHeader=authHeader;
                next();
            });
        }else{
            res.status(401).json("no se ha podido autenticar");
    
        }
    
};

router.post('/FirmaInsert',verify,async(request,response)=>{
    var Respuesta={
        Estado:"",
    }
    console.log(request);
    const resultadodos=await QueryFirma.InsertarFirma(request.body);
    console.log(request.body);
    Respuesta.Estado=true;
    response.send(Respuesta);

})
router.post('/certificadoempresa',async(request,response)=>{
    var Respuesta={
        Estado:"",
    }
    console.log(request);
    // Simulación de la firma almacenada en la base de datos (reemplaza con tu lógica de obtención de la firma)
    const firmaBase64 = '...'; // Tu firma almacenada en base64

    // Ruta donde se guardará el PDF
    const outputPath = 'output.pdf';

    // Crear un nuevo documento PDF
    const doc = new PDFDocument();

    // Crear un flujo de escritura para guardar el PDF en el sistema de archivos
    const stream = fs.createWriteStream(outputPath);

    // Pipe el flujo de escritura al documento PDF
    doc.pipe(stream);

    // Agregar contenido al PDF
    doc.fontSize(14).text('Este es un documento PDF con la firma:', 50, 50);
    doc.moveDown(); // Mover hacia abajo para separar el texto y la firma

    // Decodificar la firma base64 y agregarla al PDF como una imagen
    const firmaBuffer = Buffer.from(firmaBase64, 'base64');
    doc.image(firmaBuffer, { width: 200, height: 100, align: 'center' });

    // Finalizar y cerrar el documento PDF
    doc.end();

    // Escuchar el evento 'finish' del flujo de escritura para saber cuándo se ha completado la escritura del PDF
    stream.on('finish', () => {
    console.log(`PDF creado exitosamente en: ${outputPath}`);
    });

    // Manejar errores
    stream.on('error', (err) => {
    console.error('Error al escribir el PDF:', err);
    });
    Respuesta.Estado=true;
    response.send(Respuesta);

})

module.exports = router;