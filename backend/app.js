const express = require('express');
const path =require('path');    
const body = require('body-parser');
const mongoose = require('mongoose');

const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb://localhost:27017/mean-app')
    .then(() => {
        console.log('connection established');
    })
    .catch(() => {
        console.log('connection failed');
    })

app.use(body.json());
app.use(body.urlencoded({extended: false}));

app.use("/images", express.static(path.join("backend/images")))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, DELETE, PUT, OPTIONS")
    next();
})

app.use("/api/posts",postRoutes)
app.use("/api/user", userRoutes)

module.exports = app;