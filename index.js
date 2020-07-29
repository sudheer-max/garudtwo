const express = require("express");
const path = require("path");
const http = require("http");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { readlinkSync } = require("fs");
const sqlite3 = require("sqlite3").verbose();

const db_new = path.join(__dirname, "data", "garud.db");
const db = new sqlite3.Database(db_new, err => {
    if(err){
        return console.error(err.message);
    }
    console.log("The server is connected to the database...")
});


const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname + "/public/")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    const sql = "SELECT * FROM hotels ORDER BY id";
    db.all(sql, [], (err, rows) => {
        if(err) {
            return console.error(err.message)
        }
        res.render("index", {model : rows});
    });
});

app.get("/", (req, res) => {
    const sql = "SELECT * FROM hotels WHERE package='hotel'";
    db.all(sql, [], (err, rows) => {
        if(err) {
            return console.error(err.message)
        }
        res.render("index", {model : rows});
    });
});

app.get("/", (req, res) => {
    const sql = "SELECT * FROM bus ORDER BY id";
    db.all(sql, [], (err, rows) => {
        if(err) {
            return console.error(err.message)
        }
        res.render("index", {model : rows});
    });
});

app.get("/editor", (req, res) => {
    const sql = "SELECT * FROM hotels ORDER BY id";
    db.all(sql, [], (err, rows) => {
        if(err){
            return console.error(err.message)
        }
        res.render("editor", {model : rows});
    });
}); 

app.get("/domestic", (req, res) => {
    const sql = "SELECT * FROM hotels WHERE package='domestic'";
    db.all(sql, [], (err, rows) => {
        if(err) {
            return console.error(err.message)
        }
        res.render("domestic", {model : rows});
    });
});

app.get("/international", (req, res) => {
    const sql = "SELECT * FROM hotels WHERE package='international'";
    db.all(sql, [], (err, rows) => {
        if(err){
            return console.error(err.message)
        }
        res.render("international", {model : rows});
    });
});

app.get("/hotel", (req, res) => {
    const sql = "SELECT * FROM hotels WHERE package='hotel'";
    db.all(sql, [], (err, rows) => {
        if(err){
            return console.error(err.message)
        }
        res.render("hotel", {model : rows});
    });
});

app.get("/domestic/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM hotels WHERE id = ?";
    db.get(sql, id, (err, row) => {
        if(err){
            return console.error(err.message)
        }
        res.render("details", {model : row});
    });
});

app.get("/international/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM hotels WHERE id = ?";
    db.get(sql, id, (err, row) => {
        if(err){
            return console.error(err.message)
        }
        res.render("inter", {model : row});
    });
});

app.get("/hotel/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM hotels WHERE id = ?";
    db.get(sql, id, (err, row) => {
        if(err) {
            return console.error(err.message)
        }
        res.render("hotel_detail", {model : row});
    });
});

app.get("/contact", (req, res) => {
    const sql = "SELECT * FROM infos ORDER BY id";
    const page_name = 'contact';
    db.get(sql, (err, row) => {
        if(err) {
            return console.error(err.message)
        }
        res.render("contact", {model : row})
    });
});


app.post("/send", (req, res) => {
    const sql = "INSERT INTO infos (name, email, phone, city, message) VALUES (?, ?, ?, ?, ?)";
    const detail = [req.body.name, req.body.email, req.body.phone, req.body.city, req.body.message];
    db.run(sql, detail, err => {
        if(err) {
            return console.error(err.message);
        }
        res.redirect("confirm");
    });
});


app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM hotels WHERE id = ?";
    db.get(sql, id, (err, row) => {
        if(err) {
            return console.error(err.message)
        }
        res.render("editor", {model : row });
    });
});

app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const packages = [req.body.title, req.body.package, req.body.place, req.body.image_one, 
        req.body.image_two, req.body.image_three, req.body.trip_period, req.body.trip_validity, 
        req.body.trip_pass, req.body.inclusion, req.body.exclusion, req.body.details, req.body.gallery_one, 
        req.body.gallery_two, req.body.gallery_three, req.body.gallery_four, req.body.gallery_five,
        req.body.gallery_six, req.body.note, req.body.hotel_package, id];
    const sql = "UPDATE hotels SET title = ?, package = ? , place = ?, image_one = ?, image_two = ?, image_three = ?, trip_period = ?, trip_validity = ?, trip_pass = ?, inclusion = ?, exclusion = ?, details = ?, gallery_one = ?, gallery_two = ?, gallery_three = ?, gallery_four = ?, gallery_five = ?, gallery_six = ?, note = ?, hotel_package = ? WHERE (id = ?) ";
    db.run(sql, packages, err => {
        if(err){
            return console.error(err.message)
        }
        res.redirect("domestic");
    });
});


app.get("/create", (req, res) => {
    res.render("create", { model : {} })
});


app.post("/create", (req, res)=> {
    const sql = "INSERT INTO hotels (title, package, place, image_one, image_two, image_three, trip_period, trip_validity, trip_pass, inclusion, exclusion, details, gallery_one, gallery_two, gallery_three, gallery_four, gallery_five, gallery_six, note, hotel_package) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const packages = [req.body.title, req.body.package, req.body.place, req.body.image_one, 
        req.body.image_two, req.body.image_three, req.body.trip_period, req.body.trip_validity, 
        req.body.trip_pass, req.body.inclusion, req.body.exclusion, req.body.details, req.body.gallery_one, 
        req.body.gallery_two, req.body.gallery_three, req.body.gallery_four, req.body.gallery_five,
        req.body.gallery_six, req.body.note, req.body.hotel_package];
    console.log(req.body);
    db.run(sql, packages, err => {
        if(err) {
            return console.error(err.message)
        }
        res.redirect("/")
    });
});


app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM hotels WHERE id = ?";
    db.get(sql, id, (err, row) => {
        if(err) {
            return console.error(err.message)
        }
        res.render("delete", {model : row});
    });
});


app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM hotels WHERE id = ?";
    db.run(sql, id, err => {
        if(err) {
            return console.error(err.message);
        }
        res.redirect("/");
    });
});


app.listen(PORT, () => {
    console.log(`The server is running on ${PORT}`);
});