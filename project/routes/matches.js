var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
// const matches_utils = require("./utils/matches_utils");

router.get('/:match_id', async(req, res, next) => {

    try {
        const data = (await DButils.execQuery(
            `SELECT * FROM dbo.Matches WHERE Match_ID = '${req.params.match_id}'`
        )).recordset;
        res.send(data);

    } catch (error) {
        next(error);
    }
});


router.use(async(req, res, next) => {
    let user_name = await req.session.user_id
    if (req.session && req.session.user_id) {
        const role = (await DButils.execQuery(
                `SELECT User_Role FROM dbo.Users WHERE Username = '${user_name}'`)).recordset
            .then(() => {
                console.log(role);
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

router.get('/all_matches', async(req, res, next) => {
    try {
        const all_matches = (await DButils.execQuery(
            `SELECT * FROM dbo.Matches`
        )).recordset;
        console.log(all_matches);
        res.status(200).send(all_matches)
    } catch (error) {
        next(error);
    }
})

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
    console.log(req.session);
    try {
        DButils.execQuery(
                "SELECT TOP 1 Match_ID FROM dbo.Matches ORDER BY Match_ID DESC"
            )
            .then((match) => {
                match = match.recordset[0] || 0
                const match_id = (match) ? match.Match_ID + 1 : match;
                DButils.execQuery(
                        `INSERT INTO dbo.Matches (Match_ID, Home_Team_ID, Away_Team_ID, Referee_ID, Match_Date, Stadium, Stage)
                VALUES ('${match_id}',
                '${req.body.home_team_id}',
                '${req.body.away_team_id}',
                '${req.body.referee_id}',
                '${req.body.date}',
                '${req.body.stadium}',
                '${req.body.stage}')`)
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
        ).then((result) => {
            if (result.rowsAffected[0] == 0)
                res.status(404).send('match not found')
            else
                res.status(200).send("match deleted!")
        })
        .catch((err) => next(err))
});


module.exports = router;