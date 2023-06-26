var user = require('../models/users');
const {
    response
} = require('express');
const controllers = {}
const bcrypt = require('bcryptjs');


const getViewForgetPass = async (req, res) => {
    res.render('password/forgetPass')
}
controllers.getViewForgetPass = getViewForgetPass

const ForgetPass = async (req, res) => {
    const email = req.body.email
    const findUser = await user.findOne({
        where: {
            email: email
        }
    })

    if (findUser) {
        res.status(200).json({
            success: true,
            message: 'Email Ditemukan'
        })
    } else {
        res.status(400).json({
            success: false,
            message: 'Email Tidak Ditemukan'
        })
    }
}
controllers.ForgetPass = ForgetPass

const tampilReset = async (req, res) => {
    const email = req.params.email;
    res.render('password/resetPass', {
        email
    })
}
controllers.tampilReset = tampilReset


const resetPass = async (req, res) => {
    const email = req.params.email
    const username = req.body.username
    const nik = req.body.nik
    const institute_name = req.body.institute_name
    const city = req.body.city

    if (!username || !nik || !institute_name || !city) {
        res.status(400).json({
            success: false,
            message: 'Data Belum Lengkap, Silahkan Isi Kembali Untuk Reset Password!!'
        })
    } else {
        const findUser = await user.findOne({
            where: {
                email: email
            }
        })

        if (findUser) {
            const usernameMatch = findUser.username
            const nikMatch = findUser.nik
            const instituteMatch = findUser.institute_name
            const cityMatch = findUser.city

            if (username == usernameMatch && nik == nikMatch && institute_name == instituteMatch && city == cityMatch) {
                res.status(200).json({
                    success: true,
                    message: 'Silahkan Lakukan Pengubahan Password'
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Data yang Kamu Isikan Tidak Cocok dengan Data yang Ada'
                })
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Data Tidak Ditemukan'
            })
        }
    }
}

controllers.resetPass = resetPass

const getResetPass2 = async (req, res) => {
    const email = req.params.email
    res.render('password/resetPass2', {
        email
    })
}
controllers.getResetPass2 = getResetPass2

const finalReset = async (req, res) => {
    const email = req.params.email
    const password = req.body.password
    const confirm = req.body.confirm

    if (!password || !confirm) {
        res.status(400).json({
            success: false,
            message: 'Data Belum Lengkap, Silahkan Isi Kembali'
        })
    } else {
        if (password == confirm) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            const updateUser = await user.update({
                password: hashedPassword
            }, {
                where: {
                    email: email
                }
            })
            if (updateUser) {
                res.status(200).json({
                    success: true,
                    message: 'Password Berhasil Diubah'
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Password Tidak Berhasil Diubah'
                })
            }

        } else {
            res.status(400).json({
                success: false,
                message: 'Password Tidak Sama dengan Data Konfirmasi, Isi Kembali'
            })
        }
    }
}
controllers.finalReset = finalReset
module.exports = controllers