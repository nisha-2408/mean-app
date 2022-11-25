const express = require('express');
const User = require('../models/users');
const crypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post("/signup", (req, res, next) => {
    crypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(result => {
                    res.status(200).json({
                        message: "user created",
                        results: result
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Invalid authentication credentials"
                    })
                })
        })

});

router.post("/login", (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: "Authentication denied"
                })
            }
            fetchedUser = user;
            return crypt.compare(req.body.password, user.password)
        })  
        .then(result => {
            if (!result) {
                return res.status(401).json({
                    message: "Authentication denied"
                })
            }
            const token = jwt.sign({
                email: fetchedUser.email,
                userId: fetchedUser._id
            }, 'secret_this_should_be_longer', {expiresIn: '1h'});
            res.status(200).json({
                token: token,
                expiresIn: "3600",
                userId: fetchedUser._id
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(401).json({
                message: "Authentication denied"
            })
        })
})

module.exports = router;