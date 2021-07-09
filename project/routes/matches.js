var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const teams_utils = require("./utils/teams_utils")
const league_utils = require("./utils/league_utils")

router.get('/', async(req, res, next) => {
    try {
        const all_matches = (await DButils.execQuery(
            `SELECT Match_ID FROM dbo.Matches`
        )).recordset;
        matches_ids = []
        all_matches.map((match) => matches_ids.push(match.Match_ID))
        res.status(200).send(matches_ids)
    } catch (error) {
        next(error);
    }
})

router.get('/:match_id', async(req, res, next) => {
    try {
        const data = (await DButils.execQuery(
            `SELECT * FROM dbo.Matches WHERE Match_ID = '${req.params.match_id}'`
        )).recordset
        res.status(200).send(data);
    } catch (error) {
        next(error);
    }
});

// Middleware, from here only Representative users can reach the endpoints.
router.use(async(req, res, next) => {
    let user_name = await req.session.user_id
    if (req.session && req.session.user_id) {
        await DButils.execQuery(
                `SELECT User_Role FROM dbo.Users WHERE Username = '${user_name}'`)
            .then((result) => {
                const role = result.recordset[0].User_Role;
                if (role != 'Representative') {
                    throw 'Invalid access!'
                }
                next();
            })
            .catch((error) => res.status(403).send(error))
    } else {
        res.sendStatus(401);
    }
});


router.put('/', async(req, res, next) => {
    try {
        if (req.body.finished) {
            const deleted = await DButils.execQuery(
                `DELETE FROM dbo.Favorite_Matches 
                WHERE Match_ID = '${req.body.match_id}'`
            )
        }
        const query = await DButils.execQuery(
            `UPDATE dbo.Matches SET 
            Score = '${req.body.score}',
            EventBook = '${req.body.event_book}' 
            WHERE Match_ID = '${req.body.match_id}'`
        )
        res.status(200).send("match updated");

    } catch (error) {
        next(error);
    }
});

router.post('/', async(req, res, next) => {
    // Optional, if no stadium or stage was sent by client, 
    // choose the home team's stadium and the current stage of league.
    const stadium = req.body.stadium || await (teams_utils.get_stadium_by_team_id(req.body.home_team_id));
    const stage = req.body.stage || (await league_utils.getLeagueDetails()).current_stage_id
    try {
        await DButils.execQuery(
                "SELECT TOP 1 Match_ID FROM dbo.Matches ORDER BY Match_ID DESC"
            )
            .then((match) => {
                match = match.recordset[0] || 0
                const match_id = (match) ? match.Match_ID + 1 : match + 1;
                DButils.execQuery(
                        `INSERT INTO dbo.Matches (Match_ID, Home_Team_ID, Away_Team_ID, Referee_ID, Match_Date, Hour, Stadium, Stage)
                VALUES ('${match_id}',
                '${req.body.home_team_id}',
                '${req.body.away_team_id}',
                '${req.body.referee_id}',
                '${req.body.date}',
                '${req.body.hour}',
                '${stadium}',
                '${stage}')`)
                    .then(() => { res.status(201).send("match created") })
                    .catch((error) => { next(error) })
            })
    } catch (error) {
        next(error);
    }
});


router.delete('/:match_id', async(req, res, next) => {
    DButils.execQuery(
            `DELETE FROM dbo.Matches WHERE Match_ID = '${req.params.match_id}'`
        ).then(async(result) => {
            if (result.rowsAffected[0] == 0)
                res.status(404).send('match not found')
            else {
                const deleted = await DButils.execQuery(
                    `DELETE FROM dbo.Favorite_Matches 
                    WHERE Match_ID = '${req.params.match_id}'`
                )
                res.status(200).send("match deleted!")
            }
        })
        .catch((err) => next(err))
});





module.exports = router;