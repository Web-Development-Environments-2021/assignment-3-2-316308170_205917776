var express = require("express");
var router = express.Router();
var display_details;
const DButils = require("../routes/utils/DButils");
const league_utils = require("../routes/utils/league_utils");
const bcrypt = require("bcryptjs");


router.post("/Register", async(req, res, next) => {
    try {
        // get all users from the DB.
        const users = (await DButils.execQuery(
            "SELECT Username FROM dbo.Users"
        )).recordset;
        // check for a match based on the username, if not found: return 409 status, else continue
        if (users.find((x) => x.Username === req.body.username))
            throw { status: 409, message: "Username taken" };
        //hash the password
        let hash_password = bcrypt.hashSync(
            req.body.password,
            parseInt(process.env.bcrypt_saltRounds)
        );
        req.body.password = hash_password;
        // add the new user to the DB, default role is User.
        await DButils.execQuery(
            `INSERT INTO dbo.Users (Username, First_name, Last_name, User_Password, Country,Email, Photo_URL, User_Role) VALUES
             ('${req.body.username}', 
             '${req.body.first_name}', 
             '${req.body.last_name}', 
             '${hash_password}', 
             '${req.body.country}',
             '${req.body.email}',
             '${req.body.photo_url}', 
             'User')`
        );
        res.status(201).send("user created");
    } catch (error) {
        next(error);
    }
});

router.post("/Login", async(req, res, next) => {
    try {
        // user already logged in.
        if (req.user_id) {
            return res.status(400).send("already logged in")
        }
        const user = (
            (await DButils.execQuery(
                `SELECT * FROM dbo.Users WHERE username = '${req.body.username}'`
            )).recordset
        )[0]; // user = user[0];
        // check that username exists & the password is correct
        if (!user || !bcrypt.compareSync(req.body.password, user.User_Password)) {
            throw { status: 401, message: "Username or Password incorrect" };
        }
        // Set cookie
        req.session.user_id = user.Username;
        // return cookie
        res.status(200).send(req.session.user_id);
    } catch (error) {
        next(error);
    }
});

router.post("/Logout", async(req, res, next) => {
    // check if user is loggen in.
    if (req.session.user_id) {
        req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
        res.status(200).send({ success: true, message: "logout succeeded" });
    } else {
        res.status(401).send({ success: false, message: "logout failed" });
    }
});


router.get("/", async function(req, res) {
    let league_details = await league_utils.getLeagueDetails();
    let upcoming_game_details = await league_utils.getUpcomingGame(league_details.current_stage_id);
    // get relevant details to display on main page.
    display_details = {
            league_name: league_details.league_name,
            season_name: league_details.current_season_name,
            stage_name: league_details.current_stage_name,
            upcoming_game: upcoming_game_details[0]
        }
        // send index.html to client.
    res.sendFile(`/index.html`, { root: './project' })
});
module.exports = router;