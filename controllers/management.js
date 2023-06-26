var user = require('../models/users');
const {
  response
} = require('express');
const jwt = require('jsonwebtoken');
var document = require('../models/documents');
const multer = require('multer');
var mime = require('mime-types');
const path = require('path');
// const {
//   name
// } = require('ejs');
// const {
//   verify
// } = require('crypto');
// const {
//   Op
// } = require("sequelize");
// const {
//   create
// } = require('domain');
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

const tampilManagement = async (req, res) => {
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
    res.render('management/management', {
      username
    });
  } catch (error) {
    return res.redirect('/signin');
  }
};

controllers.managamentTampil = [verifyToken, tampilManagement];

const tampilAddDoc = async (req, res) => {
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
    res.render('management/createDoc', {
      username
    });
  } catch (error) {
    return res.redirect('/signin');
  }
}
controllers.tampilAddDoc = [verifyToken, tampilAddDoc];



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../', 'assets', 'doc'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = 'application/pdf';
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Jenis File Tidak di Izinkan');
    error.status = 405;
    return cb(error, false);
  }
  cb(null, true);
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});
const uploadd = upload.single('file')

const addDoc = async (req, res) => {

  const file = req.file;
  let name = req.body.name;
  let description = req.body.description;
  if (!file || !name || !description) {
    res.status(400).json({
      message: 'Data Tidak Lengkap',
      success: 'gagal'
    })
  } else {
    const foundUser = await user.findOne({
      where: {
        id: req.session.userId
      }
    });


    let id_user = foundUser.id

    const findDoc = await document.findOne({
      where: {
        filename: file.originalname,
        id_user: id_user
      }
    });

    const findDoc2 = await document.findOne({
      where:{
        name: name,
        id_user: id_user
      }
    })

    if (findDoc && findDoc2) {
      res.status(400).json({
        message: 'Dokumen Sudah Pernah Ditambahkan dan Nama Sudah Dipakai',
        success: 'gagal'
      })
    } else if(findDoc){
      res.status(400).json({
        message: 'Dokumen Sudah Pernah Ditambahkan',
        success: 'gagal'
      })
    } else if(findDoc2){
      res.status(400).json({
        message: 'Nama Sudah Dipakai',
        success: 'gagal'
      })
    } else {
      const newFile = await document.create({
        name: name,
        filename: file.originalname,
        description: description,
        id_user: id_user
      });

      if (newFile) {
        res.status(200).json({
          message: 'Dokumen Berhasil di Tambahkan',
          data: {
            name: name,
            filename: file.originalname,
            description: description,
            id_user: id_user
          },
          success: true
        });
      } else {
        res.status(400).json({
          message: 'Dokumen Gagal di Tambahkan',
          success: false
        })
      }
    }
  }
}
controllers.addDoc = [verifyToken, uploadd, addDoc]

const tampilAllDoc = async (req, res) => {
  try {
    const allDocuments = await document.findAll({
      where: {
        id_user: req.session.userId
      }
    });

    if (allDocuments.length > 0) {
      const documents = allDocuments.map((doc) => ({
        id: doc.id,
        name: doc.name,
        filename: doc.filename,
        desc: doc.description,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        id_user: doc.id_user
      }));

      res.status(200).json({
        success: true,
        documents: documents
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Belum Ada Dokumen yang Ditambahkan'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

controllers.allDoc = [verifyToken, tampilAllDoc];

const tampilDetailDoc = async (req, res) => {
  const docId = req.params.docId;

  const foundUser = await user.findOne({
    where: {
      id: req.session.userId
    }
  });
  const username = foundUser.username
  const documents = await document.findByPk(docId);
  const filename = documents.filename

  if (!foundUser) {
    res.render('/signin')
  } else {
    res.render('management/detailDoc', {
      username,
      filename
    })
  }
}

controllers.tampilDetailDoc = [verifyToken, tampilDetailDoc]

const tampilEditDoc = async (req, res) => {
  const docId = req.params.docId

  const foundUser = await user.findOne({
    where: {
      id: req.session.userId
    }
  });
  const username = foundUser.username
  const documents = await document.findByPk(docId);
  const name = documents.name
  const description = documents.description
  const filename = documents.filename


  if (!foundUser) {
    res.render('/signin')
  } else {
    res.render('management/editDoc', {
      username,
      name,
      description,
      filename,
      docId
    })
  }
}

controllers.tampilEditDoc = [verifyToken, tampilEditDoc]

const editDoc = async (req, res) => {
  const docId = req.params.docId
  console.log(docId)

  const file = req.file;
  if (!file) {
    res.status(400).json({
      message: 'Silahkan Tambahkan Dokumen',
      success: 'gagal'
    })
  } else {
    const name = req.body.name
    const description = req.body.description

    const findDoc = await document.findByPk(docId)

    if (!findDoc) {
      res.status(400).json({
        message: 'Dokumen Tidak Ditemukan',
        success: 'gagal'
      })
    } else {
      const docBaru = await document.update({
        name: name,
        description: description,
        filename: file.originalname
      }, {
        where: {
          id: docId
        },
      });

      if (docBaru) {
        res.status(200).json({
          message: 'Dokumen Berhasil di Ubah',
          data: {
            name: name,
            filename: file.originalname,
            description: description
          },
          success: true
        });
      } else {
        res.status(400).json({
          message: 'Dokumen Gagal di Ubah',
          success: false
        })
      }
    }
  }

}

controllers.editDoc = [verifyToken, uploadd, editDoc]

const delDoc = async (req, res) => {
  const docId = req.params.docId
  const id_user = req.params.id_user

  const deleted = await document.destroy({
    where: {
      id: docId,
      id_user: id_user
    }
  });
  if (deleted) {
    res.status(200).json({
      success: true,
      message: 'Data Berhasil Dihapus'
    })
  } else {
    res.status(400).json({
      success: false,
      message: 'Data Tidak Berhasil Dihapus'
    })
  }
}

controllers.delDoc = [verifyToken, delDoc]
module.exports = controllers