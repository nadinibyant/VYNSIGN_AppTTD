// const fs = require('fs');
const path = require('path');
const {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts
} = require('pdf-lib');
const fs = require('fs/promises');
var user = require('../models/users');
const {
  response
} = require('express');
const jwt = require('jsonwebtoken');
var document = require('../models/documents');
var signature = require('../models/signature');
const controllers = {}

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  //   console.log(token)

  if (!token) {
    // Token tidak ada, redirect ke halaman login
    return res.redirect('/signin');
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    // Token tidak valid atau kedaluwarsa, redirect ke halaman login
    return res.redirect('/signin');
  }
};

const getViewReqPending = async (req, res) => {
  try {
    const foundUser = await user.findOne({
      where: {
        id: req.session.userId
      }
    });

    if (!foundUser) {
      return res.redirect('/signin');
    }

    const username = foundUser.username;
    const id = foundUser.id

    const findSignature = await signature.findAll({
      where: {
        id_penerima: id,
        status: 'Waiting'
      }
    })

    if (findSignature.length > 0) {
      const result = []

      for (let index = 0; index < findSignature.length; index++) {
        const document_id = findSignature[index].document_id
        const user_id = findSignature[index].user_id

        const findNameDoc = await document.findByPk(document_id)

        if (findNameDoc) {
          const name = findNameDoc.name
          const idDoc = findNameDoc.document_id

          const findPengirim = await user.findByPk(user_id)

          if (findPengirim) {
            const email = findPengirim.email

            const findCreated = await signature.findOne({
              where: {
                user_id: user_id,
                id_penerima: id,
                document_id: document_id
              }
            })

            if (findCreated) {
              const created_at = findCreated.created_at

              result.push({
                name,
                email,
                created_at,
                document_id,
                id,
                user_id
              })

            } else {
              res.status(400).json({
                success: false,
                message: 'Data Time Dokumen Tidak Ditemukan'
              })
            }
          } else {
            res.status(400).json({
              success: false,
              message: 'Data Pengirim Tidak Ditemukan'
            })
          }
        } else {
          res.status(400).json({
            success: false,
            message: 'Dokumen Tidak Ditemukan'
          })
        }
      }
      res.render('request/pendingReq', {
        username,
        result
      })
    } else {
      const result = []

      res.render('request/pendingReq', {
        username,
        result
      })
    }
  } catch (error) {
    return res.redirect('/signin');
  }
}

controllers.getViewReqPending = [verifyToken, getViewReqPending]



const getViewsReqComp = async (req, res) => {
  try {
    const foundUser = await user.findOne({
      where: {
        id: req.session.userId
      }
    });

    if (!foundUser) {
      return res.redirect('/signin');
    }

    const username = foundUser.username;
    const id = foundUser.id

    const findSignature = await signature.findAll({
      where: {
        id_penerima: id,
        status: 'Completed'
      }
    })

    if (findSignature.length > 0) {
      const result = []

      for (let index = 0; index < findSignature.length; index++) {
        const document_id = findSignature[index].document_id
        const user_id = findSignature[index].user_id

        const findNameDoc = await document.findByPk(document_id)

        if (findNameDoc) {
          const name = findNameDoc.name
          const idDoc = findNameDoc.document_id

          const findPengirim = await user.findByPk(user_id)

          if (findPengirim) {
            const email = findPengirim.email

            const findCreated = await signature.findOne({
              where: {
                user_id: user_id,
                id_penerima: id,
                document_id: document_id
              }
            })

            if (findCreated) {
              const created_at = findCreated.created_at

              result.push({
                name,
                email,
                created_at,
                document_id,
                id,
                user_id
              })

            } else {
              res.status(400).json({
                success: false,
                message: 'Data Time Dokumen Tidak Ditemukan'
              })
            }
          } else {
            res.status(400).json({
              success: false,
              message: 'Data Pengirim Tidak Ditemukan'
            })
          }
        } else {
          res.status(400).json({
            success: false,
            message: 'Dokumen Tidak Ditemukan'
          })
        }
      }
      res.render('request/compReq', {
        username,
        result
      })
    } else {
      const result = []

      res.render('request/compReq', {
        username,
        result
      })
    }
  } catch (error) {
    return res.redirect('/signin');
  }
}

controllers.getViewsReqComp = [verifyToken, getViewsReqComp]

const accPending = async (req, res) => {
  try {
    const document_id = req.params.document_id
    const id_penerima = req.params.id_penerima
    const user_id = req.params.user_id

    const findDoc = await document.findByPk(document_id)
    if (!findDoc) {
      return res.status(400).json({
        success: false,
        message: 'Dokumen Tidak Ditemukan'
      });
    }

    const filename = findDoc.filename
    const pathDoc = 'assets/doc'
    const documentPath = path.join(pathDoc, filename)
    const documentBytes = await fs.readFile(documentPath);

    const findImg = await user.findByPk(id_penerima)
    if (!findImg) {
      return res.status(400).json({
        success: false,
        message: 'Gambar Tanda Tangan Tidak Ditemukan'
      });
    }

    const sign_img = findImg.sign_img
    const pathImg = 'assets/sign_img'
    const imagePath = path.join(pathImg, sign_img)
    const imageBytes = await fs.readFile(imagePath)

    const pdfDoc = await PDFDocument.load(documentBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const {
      width,
      height
    } = firstPage.getSize();

    const signatureImage = await pdfDoc.embedPng(imageBytes);

    firstPage.drawImage(signatureImage, {
      x: 50,
      y: 50,
      width: 100,
      height: 50,
    });

    const outputDir = '../assets/saveSign';
    const outputFilename = `modified_document_${Date.now()}.pdf`; // Nama file output
    const outputPath = path.join(__dirname, outputDir, outputFilename);

    const modifiedDocumentBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, modifiedDocumentBytes);

    const addPDFNew = await signature.update({
      pdfNew: outputFilename,
      status: 'Completed'
    }, {
      where: {
        user_id: user_id,
        id_penerima: id_penerima,
        document_id: document_id
      }
    })

    if (addPDFNew) {
      // Mengatur header Content-Type
      res.setHeader('Content-Type', 'application/pdf');
      res.status(200).json({
        success: true,
        message: 'Dokumen Berhasil Di Tandatangan'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Dokumen Tidak Berhasil Di Tandatangan'
      })
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses dokumen.'
    });
  }
}
controllers.accPending = [verifyToken, accPending]

const declinePending = async (req, res) => {
  try{
    const user_id = req.params.user_id
    const id_penerima = req.params.id_penerima
    const document_id = req.params.document_id

    const decSign = await signature.update({
      status: 'Declined'
    }, {
      where:{
        user_id: user_id,
        id_penerima: id_penerima,
        document_id: document_id
      }
    })

    if (decSign) {
      res.status(200).json({
        success: true,
        message: 'Dokumen Berhasil Ditolak'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Dokumen Tidak Berhasil Ditolak'
      })
    }
  } catch (error) {

  }
}

controllers.declinePending = [verifyToken, declinePending]

const getViewsDetailReq= async (req, res) => {
  const document_id = req.params.document_id
  const id_penerima = req.params.id_penerima
  const user_id = req.params.user_id

  const foundUser = await user.findOne({
      where: {
          id: req.session.userId
      }
  });

  const username = foundUser.username;
  
  const findDoc = await document.findByPk(document_id)
  const filename = findDoc.filename

  if (!foundUser) {
      res.render('/signin')
  } else {
      res.render('request/detailReq', {
          username,
          filename
      })
  }
}

controllers.getViewsDetailReq = [verifyToken, getViewsDetailReq]


module.exports = controllers