var user = require('../models/users');
const {
    response
} = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

const getViewProfile = async (req, res) => {
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
        const institute_name = foundUser.institute_name
        const email = foundUser.email
        const nik = foundUser.nik
        const city = foundUser.city

        res.render('profile/profile', {
            username,
            institute_name,
            email,
            nik,
            city
        });
    } catch (error) {
        return res.redirect('/signin');
    }
}

controllers.getViewProfile = [verifyToken, getViewProfile]

const getViewEdit = async (req, res) => {
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
        const institute_name = foundUser.institute_name
        const email = foundUser.email
        const nik = foundUser.nik
        const city = foundUser.city
        const password = foundUser.password


        res.render('profile/editProfile', {
            username,
            institute_name,
            email,
            nik,
            city,
            password
        });
    } catch (error) {
        return res.redirect('/signin');
    }
}

controllers.getViewEdit = [verifyToken, getViewEdit]

const editProfile = async (req, res) => {
    try {
        const foundUser = await user.findOne({
            where: {
                id: req.session.userId
            }
        });

        const id = foundUser.id
        const usernameAsli = foundUser.username
        const nikAsli = foundUser.nik
        const instituteAsli = foundUser.institute_name
        const cityAsli = foundUser.city
        const emailAsli = foundUser.email

        const username = req.body.username || usernameAsli
        const nik = req.body.nik || nikAsli
        const institute_name = req.body.institute_name || instituteAsli
        const city = req.body.city || cityAsli
        const email = req.body.email || emailAsli

        const passwordBaru = req.body.passwordBaru
        const passwordLama = req.body.passwordLama

        if (passwordBaru == '' && passwordLama == '') {

            if (!username || !nik || !institute_name || !city || !email) {
                res.status(400).json({
                    success: false,
                    message: 'Data Tidak Lengkap, Silahkan Isi Kembali'
                })
            } else {
                if (username.length < 15) {
                    res.status(400).json({
                        success: false,
                        message: 'Username harus terdiri dari minimal 15 karakter'
                    })
                } else {
                    const dataBaru = await user.update({
                        username: username,
                        nik: nik,
                        institute_name: institute_name,
                        city: city,
                        email: email
                    }, {
                        where: {
                            id: id
                        }
                    })

                    if (dataBaru) {
                        const findUserBaru = await user.findByPk(id)
                        const usernameBaru = findUserBaru.username
                        const nikBaru = findUserBaru.nik
                        const institute_baru = findUserBaru.institute_name
                        const cityBaru = findUserBaru.city
                        const emailBaru = findUserBaru.email

                        res.status(200).json({
                            success: true,
                            username: usernameBaru,
                            nik: nikBaru,
                            institute_name: institute_baru,
                            city: cityBaru,
                            emailBaru:emailBaru,
                            message: 'Data Berhasil Di Ubah'
                        })
                    } else {
                        res.status(400).json({
                            success: false,
                            message: 'Data Tidak Berhasil Di Ubah'
                        })
                    }
                }

            }
        } else if (passwordBaru != '' && passwordLama == '') {
            res.status(400).json({
                success: false,
                message: 'Data Tidak Lengkap, Isi Password Lama'
            })
        } else if (passwordBaru == '' && passwordLama != '') {
            res.status(400).json({
                success: false,
                message: 'Data Tidak Lengkap, Isi Password Baru'
            })
        } else {
            const passwordAsli = foundUser.password

            const salt = bcrypt.genSaltSync(10);
            const passwordMatch = bcrypt.compareSync(passwordLama, passwordAsli);



            if (!username || !nik || !institute_name || !city || !passwordBaru || !passwordLama) {
                res.status(400).json({
                    success: false,
                    message: 'Data Tidak Lengkap, Silahkan Isi Kembali'
                })
            } else {
                if (username.length < 15) {
                    res.status(400).json({
                        success: false,
                        message: 'Username harus terdiri dari minimal 15 karakter'
                    })
                } else {
                    if (passwordMatch) {
                        const hashedPasswordBaru = bcrypt.hashSync(passwordBaru, salt)
                        const dataBaru = await user.update({
                            username: username,
                            password: hashedPasswordBaru,
                            nik: nik,
                            institute_name: institute_name,
                            city: city
                        }, {
                            where: {
                                id: id
                            }
                        })

                        if (dataBaru) {
                            const findUserBaru = await user.findByPk(id)
                            const usernameBaru = findUserBaru.username
                            const nikBaru = findUserBaru.nik
                            const institute_baru = findUserBaru.institute_name
                            const cityBaru = findUserBaru.city

                            res.status(200).json({
                                success: true,
                                username: usernameBaru,
                                nik: nikBaru,
                                institute_name: institute_baru,
                                city: cityBaru,
                                message: 'Data Berhasil Di Ubah'
                            })
                        } else {
                            res.status(400).json({
                                success: false,
                                message: 'Data Tidak Berhasil Di Ubah'
                            })
                        }
                    } else {
                        res.status(400).json({
                            success: false,
                            message: 'Password Lama Salah'
                        })
                    }
                }

            }

        }

    } catch (error) {
        return res.redirect('/signin');
    }

}

controllers.editProfile = [verifyToken, editProfile]


const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Gagal logout',
            });
        }

        res.clearCookie('sessionID'); // Hapus cookie sesi jika menggunakan cookie-based session
        return res.status(200).json({
            success: true,
            message: 'Logout berhasil',
        });
    });
}

controllers.logout = [verifyToken, logout]

module.exports = controllers