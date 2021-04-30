const express = require("express");
const path = require("path");
const {v4: uuid} = require("uuid");
const method_override = require("method-override");

const mongoose = require("mongoose");
const multer = require('multer');
const GridFsStorage = require("multer-gridfs-storage");


const mongoUri = 'mongodb://localhost:27017/mindChess';
const connection = mongoose.createConnection(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


let gridFS = null;
connection.once("open", () => {
    gridFS = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "spokenmoves"
    });
});

const storage = new GridFsStorage({
    url: mongoUri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {

            console.log("req.body: ", req.body);
            console.log("file: ", file);

            const fileInfo = {
                filename: file.originalname + "-" + uuid(),
                bucketName: "spokenmoves"
            };

            resolve(fileInfo);
        });
    }
});

const upload = multer({ storage });


const app = express();

app.use(method_override("_method"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


app.get("/", (req, res) =>
    res.render("home", {num: Math.floor(Math.random() * 10)})

)

app.get("/collect-data", (req, res) => {
    res.render("collect-data");
})

app.post("/collect-data", upload.single('audio_blob'), (req, res) => {

    res.redirect("/collect-data");
})


app.get("/show-data", (req, res) => {

    let stored_spokenmoves = {};

    if (gridFS) {
        gridFS.find().toArray((err, files) => {

            for (let i = 0; i < files.length; i++) {
                let move_gt = files[i].filename.split('-')[0];
                if (stored_spokenmoves[move_gt]) {
                    stored_spokenmoves[move_gt] += 1;
                } else {
                    stored_spokenmoves[move_gt.toString()] = 1;
                }
            }
            res.render('show-data', { stored_spokenmoves: stored_spokenmoves});
        });
    } else {
        res.render('show-data', { stored_spokenmoves: {}});

    }




})


app.get("*", (req, res) =>
    res.send("Invalid address.")
)

app.listen(3000, () =>
    console.log("LISTENING ON PORT 3000!")
)



