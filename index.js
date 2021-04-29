const express = require("express");
const path = require("path");
const {v4: uuid} = require("uuid");
const method_override = require("method-override");

const mongoose = require("mongoose");

const multer = require('multer');

const GridFsStorage = require("multer-gridfs-storage");
// var Grid = require("gridfs-stream");


const mongoUri = 'mongodb://localhost:27017/mindChess';
const connection = mongoose.createConnection(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


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

    console.log("Handling post request: ", req.body);

    // const spokenMove = SpokenMove({gt: req.body.gt, signal: req.body.signal});
    // spokenMove.save().then(() => console.log("Should be saved."));

    res.redirect("/collect-data");
})

app.get("/show-data", (req, res) => {

    gridFS.find().toArray((err, files) => {

        if (!files || files.length === 0) {

            res.render('show-data', { files: null });
        } else {

            res.render('show-data', { files: files});
        }
    });


})

// app.get("/show-data/:filename", (req, res) => {
//
//     gridFS.find().toArray((err, files) => {
//
//         if (!files || files.length === 0) {
//
//             res.render('show-data', { files: null });
//         } else {
//
//             gridFS.openDownloadStreamByName(req.params.filename).pipe(res);
//
//             res.render('show-data', { files: files});
//         }
//     });
//
// })




app.get("*", (req, res) =>
    res.send("Invalid address.")
)



app.listen(3000, () =>
    console.log("LISTENING ON PORT 3000!")
)



