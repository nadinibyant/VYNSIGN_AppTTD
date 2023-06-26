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

const getViewSent = async (req, res) => {
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
        const id_user = foundUser.id;

        const findSign = await signature.findAll({
            where: {
                user_id: id_user
            }
        });

        if (findSign.length > 0) {
            const result = [];

            for (let index = 0; index < findSign.length; index++) {
                const id_penerima = findSign[index].id_penerima;
                const created_at = findSign[index].created_at
                const status = findSign[index].status

                const findEmail = await user.findByPk(id_penerima);

                if (findEmail) {
                    const email = findEmail.email;

                    const document_id = findSign[index].document_id;

                    const findDoc = await document.findByPk(document_id);

                    if (findDoc) {
                        const name = findDoc.name;

                        result.push({
                            user_id: findSign[index].user_id,
                            email,
                            name,
                            created_at,
                            status,
                            document_id,
                            id_user,
                            id_penerima
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            message: 'Dokumen Tidak Ditemukan'
                        })
                    }
                } else {
                    res.status(400).json({
                        success: false,
                        message: 'Email Tidak Ditemukan'
                    })
                }
            }
            res.render('sent/sent', {
                username,
                result
            });
        } else {
            const result = [];

            res.render('sent/sent', {
                username,
                result
            })
        }
    } catch (error) {
        return res.redirect('/signin');
    }
}



controllers.getViewSent = [verifyToken, getViewSent]

const getViewSign = async (req, res) => {
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
        const id_user = foundUser.id

        const findDoc = await document.findAll({
            where: {
                id_user: id_user
            }
        })

        if (findDoc) {
            const result = findDoc.map((doc) => {
                return {
                    name: doc.name,
                    id: doc.id
                };
            });

            res.render('sent/createSignature', {
                username,
                result
            });
        }
    } catch (error) {
        return res.redirect('/signin');
    }
}

controllers.getViewSign = [verifyToken, getViewSign]

const addSign = async (req, res) => {
    const email = req.body.email
    const name = req.body.name
    const jabatan = req.body.jabatan

    if (!email || !name || !jabatan) {
        res.status(400).json({
            success: false,
            message: 'Data Belum Lengkap Diisi, Silahkan Isi Kembali'
        })
    } else {
        const foundUser = await user.findOne({
            where: {
                id: req.session.userId
            }
        });

        const id_user = foundUser.id

        const findPenerima = await user.findOne({
            where: {
                email: email
            }
        })
        if (findPenerima) {
            const id_penerima = findPenerima.id

            const findDoc = await document.findOne({
                where: {
                    name: name,
                    id_user: id_user
                }
            })
            if (findDoc) {
                const document_id = findDoc.id

                const findSign = await signature.findOne({
                    where: {
                        user_id: id_user,
                        id_penerima: id_penerima,
                        document_id: document_id
                    }
                })

                if (findSign) {
                    res.status(400).json({
                        success: false,
                        message: 'Dokumen Sudah Pernah Dikirim Kepada Penerima yang Sama'
                    })
                } else {

                    const findDuplikat = await signature.findOne({
                        where: {
                            user_id: id_user,
                            document_id: document_id
                        }
                    })

                    if (findDuplikat) {
                        res.status(400).json({
                            success: false,
                            message: 'Dokumen Sudah Pernah Di Gunakan'
                        })
                    } else {
                        var datetime = new Date().toISOString();
                        const newSign = await signature.create({
                            user_id: id_user,
                            document_id: document_id,
                            id_penerima: id_penerima,
                            jabatan: jabatan,
                            status: 'Waiting',
                            signed_at: datetime,
                            created_at: datetime,
                            updated_at: datetime

                        })

                        if (newSign) {
                            res.status(200).json({
                                success: true,
                                data: newSign,
                                message: 'Dokumen Berhasil Dikirim'
                            })
                        } else {
                            res.status(400).json({
                                success: false,
                                message: 'Dokumen Tidak Berhasil Dikirim'
                            })
                        }
                    }

                }
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Dokumen Tidak Ditemukan'
                })
            }

        } else {
            res.status(400).json({
                success: false,
                message: 'Email Pengguna Tidak Ditemukan'
            })
        }
    }
}

controllers.addSign = [verifyToken, addSign]

const tampilDetailSign = async (req, res) => {
    const document_id = req.params.document_id
    const id_penerima = req.params.id_penerima
    const user_id = req.params.user_id

    const foundUser = await user.findOne({
        where: {
            id: req.session.userId
        }
    });
    const username = foundUser.username
    const pdfSign = await signature.findOne({
        where:{
            document_id:document_id,
            id_penerima: id_penerima,
            user_id: user_id
        }
    })
    const filename = pdfSign.pdfNew
    const status = pdfSign.status

    if (!foundUser) {
        res.render('/signin')
    } else {
        res.render('sent/detailSignature', {
            username,
            filename,
            status
        })
    }
}
controllers.tampilDetailSign = [verifyToken, tampilDetailSign]

module.exports = controllers