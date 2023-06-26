var user = require('../models/users');
const {
  response
} = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
var mime = require('mime-types');
const path = require('path');
const {
  sign
} = require('crypto');
const jwt = require('jsonwebtoken');

const controllers = {}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../', 'assets', 'sign_img'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = ['image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Jenis File Tidak di Izinkan');
    error.status = 400;
    return cb(error, false);
  }
  cb(null, true);
}
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

var type = upload.single('file')

const signup = async (req, res) => {
  const file = req.file;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let nik = req.body.nik;
  let institute_name = req.body.institute_name;
  let city = req.body.city;

  if (!file || !username || !email || !password || !nik || !institute_name || !city) {
    res.status(400).json({
      success: 'gagal',
      message: 'Data Tidak Lengkap, Silahkan Isi Kembali'
    })
  } else {
    if (username.length < 15) {
      res.status(400).json({
        message: 'Username harus terdiri dari minimal 15 karakter',
        statuss: 'usernameKurang'
      });
      return;
    }


    const cari = await user.findOne({
      where: {
        email: email
      }
    })

    if (!cari) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const users = await user.create({
        username: username,
        email: email,
        password: hashedPassword,
        nik: nik,
        institute_name: institute_name,
        city: city,
        sign_img: file.originalname
      })

      if (users) {
        res.status(200).json({
          message: 'Pendaftaran Akun Berhasil',
          statuss: true
        })
      } else {
        res.status(400).json({
          message: 'Pendaftaran Akun Tidak Berhasil',
          statuss: false
        })
      }
    } else if (cari) {
      res.status(400).json({
        message: 'Email Sudah Terdaftar',
        statuss: 'emailSalah'
      })
    }

  }


}

controllers.signup = [type, signup]

controllers.signin = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    res.status(400).json({
      success: 'gagal',
      message: 'Data Tidak Lengkap, Silahkan Isi Kembali'
    })
  } else {
    try {
      const users = await user.findOne({
        where: {
          email: email
        }
      });

      if (!users) {
        // Jika user tidak ditemukan
        return res.status(401).json({
          message: 'Email Salah'
        });
      }

      // Cek password
      bcrypt.compare(password, users.password, async (err, result) => {
        if (err || !result) {
          // Password tidak valid
          return res.status(401).json({
            message: 'Password Salah'
          });
        }

        // Jika email dan password benar
        const token = jwt.sign({
            userId: user.id,
            email
          },
          process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '2h'
          }
        );

        req.session.userId = users.id;

        res.cookie('token', token, {
          httpOnly: true, // Hanya dapat diakses oleh server
          maxAge: 2 * 60 * 60 * 1000, // Waktu kedaluwarsa cookie dalam milidetik 
        });

        res.status(200).json({
          message: 'Login Berhasil',
          token: token,
          success: true,
          userId: req.session.userId
        });
      });
    } catch (error) {
      res.status(400).json({
        message: 'Login Tidak Berhasil',
        success: false
      });
    }
  }

};

module.exports = controllers