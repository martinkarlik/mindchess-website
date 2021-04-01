const express = require("express")

const app = express()

app.set("view engine", "ejs")

app.get("/", (req, res) =>
    res.send("<h1>Home page</h1>")
)


app.get("/collect_data", (req, res) =>
    res.send("<h1>Here I will collect the audio data<\h1>")
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