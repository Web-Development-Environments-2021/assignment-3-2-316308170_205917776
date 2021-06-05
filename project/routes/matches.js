var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const teams_utils = require("./utils/teams_utils")
const league_utils = require("./utils/league_utils")

router.get('/:match_id', async(req, res, next) => {

    try {
        const data = (await DButils.execQuery(
            `SELECT * FROM dbo.Matches WHERE Match_ID = '${req.params.match_id}'`
        )).recordset
        delete data[0].Match_ID;
        res.send(data);
    } catch (error) {
        next(error);
    }
});


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
                        `INSERT INTO dbo.Matches (Match_ID, Home_Team_ID, Away_Team_ID, Referee_ID, Match_Date, Stadium, Stage)
                VALUES ('${match_id}',
                '${req.body.home_team_id}',
                '${req.body.away_team_id}',
                '${req.body.referee_id}',
                '${req.body.date}',
                '${stadium}',
                '${stage}')`)
                    .then(() => { res.status(201).send("match created") })
                    .catch((error) => { next(error) })
            })
    } catch (error) {
        next(error);
    }
});

// router.post('/set_all_matches', async(req, res, next) => {
//     let all_teams = await league_utils.get_all_teams_in_league();
//     // console.log(all_teams);
//     const all_pairs = []
//     for (let i = 0; i < all_teams.length - 1; i++) {
//         for (let j = i + 1; j < all_teams.length; j++) {
//             all_pairs.push([all_teams[i], all_teams[j]])
//             all_pairs.push([all_teams[j], all_teams[i]])
//         }
//     }
//     for (let i = 0; i < all_pairs.length; i++) {
//         // console.log(all_pairs[i]);
//         const stadium = await teams_utils.get_stadium_by_team_id(all_pairs[i][0]);
//         const stage = parseInt((await league_utils.getLeagueDetails()).current_stage_id)
//         let referee_id = 1 + Math.round(Math.random() * 4)
//         let today = new Date().toISOString().slice(0, 10)
//             // console.log(stadium, stage, referee_id, today);
//         try {
//             await DButils.execQuery(
//                     "SELECT TOP 1 Match_ID FROM dbo.Matches ORDER BY Match_ID DESC"
//                 )
//                 .then((match) => {
//                     match = match.recordset[0] || 0
//                     const match_id = (match) ? match.Match_ID + 1 : match + 1;
//                     console.log(match);
//                     DButils.execQuery(
//                         `INSERT INTO dbo.Matches (Match_ID, Home_Team_ID, Away_Team_ID, Referee_ID, Match_Date, Stadium, Stage)
//                             VALUES ('${match_id}',
//                             '${all_pairs[i][0]}',
//                             '${all_pairs[i][1]}',
//                             '${referee_id}',
//                             '${today}',
//                             '${stadium}',
//                             '${stage}')`)
//                 })
//         } catch (error) {
//             next(error);
//         }
//     }
// });


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