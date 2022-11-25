const express = require('express');
const multer  = require('multer');
const bodyParser = require('body-parser');
const Post = require('../models/post');
const check = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpeg'
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid Mime Type');
        if(isValid) {
            error = null;
        }
        cb(error, "backend/images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('_');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name+'-'+Date.now()+'.'+ext);
    }
})

router.post('', check , multer({storage: storage}).single("image"), (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    const reqBody = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url+"/images/"+req.file.filename,
        creator: req.UserData.userId
    });
    reqBody.save().then(result => {
        console.log(result._id);
        res.status(201).json({
            message: "Posts added",
            post: {
                id: result._id,
                title: result.title,
                content: result.content,
                imagePath: result.imagePath,
                creator: req.UserData.userId
            }
        })

    }).catch(error => {
        res.status(500).json({
            message: "Creating a post failed"
        })
    })
})

router.get('', (req, res, next) => {
    console.log(req.query);
    let fetchedPosts;
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    if(pageSize && currentPage){
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize)
    }
    postQuery
        .then(docs => {
            fetchedPosts =docs;
            return Post.count();
        })
        .then(count => {
            res.status(200).json({
                message: "Posts fetched succsfully",
                posts: fetchedPosts,
                maxPosts: count
            })
        })
        .catch();
    ;
});

router.put("/:id", check, multer({storage: storage}).single("image"), (req, res, next) => {
    let imagePath = req.body.imagePath;
    if(req.file){
        const url = req.protocol + '://' + req.get("host");
        imagePath= url+"/images/"+req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.UserData.userId
    });
    console.log(post);
    Post.updateOne({_id: req.params.id, creator: req.UserData.userId}, post)
        .then(data => {
            if(data.nModified > 0){
                res.status(200).json({
                    message: "Update Successful"
                })
            } else {
                res.status(401).json({
                    message: "Update UnSuccessful"
                })
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Couldn't update post"
            })
        })
})

router.delete("/:id", check, (req, res, next) => {
    Post.deleteOne({_id: req.params.id, creator: req.UserData.userId}) .then(result=> {
        if(result.n > 0){
            res.status(200).json({
                message: "Delete Successful"
            })
        } else {
            res.status(401).json({
                message: "Delete UnSuccessful"
            })
        }
    });
});
router.get("/:id", (req, res, next)=> {
    Post.findById(req.params.id).then(post => {
        if(post){
            res.status(200).json(post);
        } else {
            res.status(404).json({
                message: 'Siglilla guru'
            })
        }
    })
})


module.exports = router;