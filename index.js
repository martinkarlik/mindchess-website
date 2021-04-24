const express = require("express");
const path = require("path");
const {v4: uuid} = require("uuid");
const method_override = require("method-override");
const mongoose = require("mongoose");

const { Chess } = require('chess.js');
const chess = new Chess();
chess.load_pgn("d4 d5");
console.log(chess.ascii());
const SpokenMove = require("./public/js/spoken-move.js");


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
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


app.get("/", (req, res) =>
    res.render("home", {num: Math.floor(Math.random() * 10)})

)

app.get("/data", (req, res) =>
    res.render("data", {audio_data})
)

app.post("/data", (req, res) => {
    const {spoken_move} = req.body;
    audio_data.push({id: uuid(), move_gt: "XXX", move_spoken:spoken_move});
    res.redirect("/data");
})


app.get("/data/new", (req, res) =>
    res.render("new-data-form")
)

app.get("/data/:id", (req, res) => {
    const {id} = req.params;
    const data_details = audio_data.find(it => it.id === id);
    res.render("data-details", {data_details});
})

app.get("/data/:id/edit", (req, res) => {
    const {id} = req.params;
    const data_details = audio_data.find(it => it.id === id);
    res.render("edit-form", {data_details});
})



app.patch("/data/:id", (req, res) => {
    const {id} = req.params;
    const {new_move_spoken} = req.body;
    const data_details = audio_data.find(it => it.id === id);
    data_details.move_spoken = new_move_spoken;
    res.redirect("/data/");
})

app.delete("/data/:id", (req, res) => {
    const {id} = req.params;
    const data_details = audio_data.find(it => it.id === id);
    audio_data.pop(data_details);
    res.redirect("/data/");
})


app.get("/collect-data", (req, res) => {
    res.render("collect-data");
})

app.get("*", (req, res) =>
    res.send("Damn.")
)

app.listen(3000, () =>
    console.log("LISTENING ON PORT 3000!")
)



