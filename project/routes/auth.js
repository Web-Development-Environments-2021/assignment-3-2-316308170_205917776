var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcryptjs");
const axios = require("axios");


router.get("/Register", async(req, res, next) => {
    try {
        console.log('here1')
        const post = await axios.post("http://localhost:3000/Register", {
            username: 'Ariel',
            first_name: 'Ariel',
            last_name: 'Shilo',
            password: 1234,
            country: 'Israel'
        });
        res.send('success')
    } catch (error) {
        console.error(error);
        next();
    }
    next();
});

router.post("/Register", async(req, res, next) => {
    JSON.stringify(req.data);
    console.log('here2')
    try {
        // parameters exists
        // valid parameters
        // username exists
        const users = await DButils.execQuery(
            "SELECT Username FROM dbo.Users"
        );
        if (users.find((x) => x.username === req.body.username))
            throw { status: 409, message: "Username taken" };

        //hash the password
        let hash_password = bcrypt.hashSync(
            req.body.password,
            parseInt(process.env.bcrypt_saltRounds)
        );
        req.body.password = hash_password;

        // add the new username
        await DButils.execQuery(
            `INSERT INTO dbo.Users (Username, First_name, Last_name, User_Password, Country) VALUES
             ('${req.body.username}', '${req.body.first_name}', '${req.body.last_name}', '${hash_password}', '${req.body.country}')`
        );
        res.status(201).send("user created");
    } catch (error) {
        next(error);
    }
});

router.post("/Login", async(req, res, next) => {
    try {
        const user = (
            await DButils.execQuery(
                `SELECT * FROM dbo.users_tirgul WHERE username = '${req.body.username}'`
            )
        )[0];
        // user = user[0];
        console.log(user);

        // check that username exists & the password is correct
        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
            throw { status: 401, message: "Username or Password incorrect" };
        }

        // Set cookie
        req.session.user_id = user.user_id;

        // return cookie
        res.status(200).send("login succeeded");
    } catch (error) {
        next(error);
    }
});

router.post("/Logout", function(req, res) {
    req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
    res.send({ success: true, message: "logout succeeded" });
});


router.get("/", function(req, res) {
    res.sendFile(`/index.html`, { root: './project' })
});
module.exports = router;