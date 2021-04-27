const express = require("express");
const path = require("path");
const {v4: uuid} = require("uuid");
const method_override = require("method-override");
const mongoose = require("mongoose");

const SpokenMove = require("./public/js/spoken-move");



mongoose.connect('mongodb://localhost:27017/mindChess', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connection open!")
    })
    .catch(() => {
        console.log("Connection rejected!")
    })


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

app.post("/collect-data", (req, res) => {


    console.log(req.body.signal);

    const spokenMove = SpokenMove({gt: req.body.gt, signal: req.body.signal});
    spokenMove.save().then(() => console.log("Should be saved."))

    res.redirect("/collect-data");
})

app.get("/show-data", (req, res) => {

    const audio_data = [
        {gt: "BF1", signal: "bishop f one"}
    ]
    res.render("show-data", {audio_data});
})



app.get("*", (req, res) =>
    res.send("Invalid address.")
)



app.listen(3000, () =>
    console.log("LISTENING ON PORT 3000!")
)



