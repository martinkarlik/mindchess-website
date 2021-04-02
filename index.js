const express = require("express")
const path = require("path")

const app = express()

app.use(express.static(path.join(__dirname, "public")))
app.set('view engine', 'ejs')
app.set("views", path.join(__dirname, "/views"))





app.get("/", (req, res) =>
    res.render("home", {num: Math.floor(Math.random() * 10)})

)


app.get("/collect-data", (req, res) =>
    res.render("collect-data")
)



app.get("/:subpage", (req, res) => {
    const {subpage} = req.params;
    // req.query to get stuff after ? (like ?color=red&age=21
    res.send(`<h1>This is a ${subpage} subpage!<\h1>`);
})


app.get("*", (req, res) =>
    res.send("<h1>Unknown path, sorry!</h1>")
)

app.listen(3000, () =>
    console.log("LISTENING ON PORT 3000!")
)