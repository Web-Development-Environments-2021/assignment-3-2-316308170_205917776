var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const DButils = require("./utils/DButils");

router.get("/getDetails", async(req, res, next) => {
    try {
        const league_details = await league_utils.getLeagueDetails();
        res.send(league_details);
    } catch (error) {
        next(error);
    }
});

router.use(async(req, res, next) => {
    try {
        let role = (await DButils.execQuery(
            `SELECT User_Role FROM dbo.Users WHERE Username = '${req.body.username}'`
        ))[0].User_Role;
        if (role != 'Representative') {
            console.log(role)
            throw 'Invalid access!'
        }
        next();
    } catch {
        console.log('in error')
        res.status(403).send('forbidden!')
    }
});

router.post('/add_match', async(req, res, next) => {
    try {
        console.log('in post')
        const match_id = (await DButils.execQuery(
            "SELECT COUNT(*) FROM dbo.Matches"
        ))[0][""];
        console.log(match_id)
        const query = await DButils.execQuery(
            `INSERT INTO dbo.Matches (Match_ID, Home_Team_ID, Away_Team_ID, Match_Date, Stadium)
         VALUES ('${match_id}','${req.body.home_team_id}',
         '${req.body.away_team_id}',
         '${req.body.date}',
         '${req.body.stadium}')`
        )
        console.log('query executed')
        res.status(201).send("match created");

    } catch {
        console.log('error')
        next();
    }
});
module.exports = router;