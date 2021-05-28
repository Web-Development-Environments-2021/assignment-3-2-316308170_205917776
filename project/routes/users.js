var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function(req, res, next) {
    if (req.session && req.session.user_id) {
        DButils.execQuery("SELECT Username FROM dbo.Users")
            .then((users) => {
                if (users.find((x) => x.user_id === req.session.user_id)) {
                    req.user_id = req.session.user_id;
                    next();
                }
            })
            .catch((err) => next(err));
    } else {
        next(); //*****************  remember to change it back ******************
        // res.sendStatus(401);
    }
});


router.get("/favoriteMatches", async(req, res, next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const favorites = await users_utils.getAllFavorites(user_id, "Match_ID", "Matches");
    if (favorites.length == 0)
        res.status(404).send('no favorite matches')
    else
        res.status(200).send(favorites)
})

router.post("/favoriteMatches", async(req, res, next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const match_id = req.body.match_id;
    const table_name = "Matches"
    const status = await users_utils.markAsFavorite(user_id, match_id, table_name)
    if (status == 0)
        res.status(404).send('no favorite matches')
    else
        res.status(200).send('successfully added match to favorites!')
})

router.delete("/favoriteMatches/:match_id", async(req, res ,next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const match_id = req.params.match_id
    const table_name = "Matches"
    const attribute_ID = "Match_ID"
    const status = await users_utils.deleteFromFavorite(user_id, match_id, table_name,attribute_ID)
    if (status == 0)
        res.status(404).send('no favorite match')
    else
        res.status(200).send('successfully deleted match from favorites!')
})


router.get("/favoritePlayers", async(req, res, next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const favorites = await users_utils.getAllFavorites(user_id, "Player_ID", "Players");
    if (favorites.length == 0)
        res.status(404).send('no favorite players')
    else
        res.status(200).send(favorites)
})

router.post("/favoritePlayers", async(req, res, next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const player_id = req.body.player_id;
    const table_name = "Players"
    const status = await users_utils.markAsFavorite(user_id, player_id, table_name)
    if (status == 0)
        res.status(404).send('no favorite players')
    else
        res.status(200).send('successfully added player to favorites!')
})

router.delete("/favoritePlayer/:player_id", async(req, res ,next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const player_id = req.params.player_id
    const table_name = "Players"
    const attribute_ID = "Player_ID"
    const status = await users_utils.deleteFromFavorite(user_id, player_id, table_name,attribute_ID)
    if (status == 0)
        res.status(404).send('no favorite players')
    else
        res.status(200).send('successfully deleted player from favorites!')
})

router.get("/favoriteTeams", async(req, res, next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const favorites = await users_utils.getAllFavorites(user_id, "Team_ID", "Teams");
    if (favorites.length == 0)
        res.status(404).send('no favorite teams')
    else
        res.status(200).send(favorites)
})

router.post("/favoriteTeams", async(req, res, next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const team_id = req.body.team_id;
    const table_name = "Teams"
    const status = await users_utils.markAsFavorite(user_id, team_id, table_name)
    if (status == 0)
        res.status(404).send('no favorite teams')
    else
        res.status(200).send('successfully added team to favorites!')
})

router.delete("/favoriteTeams/:team_id", async(req, res ,next) => {
    const user_id = req.session.user_id || 'Ariel' 
    const team_id = req.params.team_id
    const table_name = "Teams"
    const attribute_ID = "Team_ID"
    const status = await users_utils.deleteFromFavorite(user_id, team_id, table_name,attribute_ID)
    if (status == 0)
        res.status(404).send('no favorite team')
    else
        res.status(200).send('successfully deleted team from favorites!')
})

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
// router.post("/favoritePlayers", async(req, res, next) => {
//     try {
//         const user_id = req.session.user_id;
//         const player_id = req.body.playerId;
//         await users_utils.markPlayerAsFavorite(user_id, player_id);
//         res.status(201).send("The player successfully saved as favorite");
//     } catch (error) {
//         next(error);
//     }
// });

// /**
//  * This path returns the favorites players that were saved by the logged-in user
//  */
// router.get("/favoritePlayers", async(req, res, next) => {
//     try {
//         const user_id = req.session.user_id;
//         let favorite_players = {};
//         const player_ids = await users_utils.getFavoritePlayers(user_id);
//         let player_ids_array = [];
//         player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
//         const results = await players_utils.getPlayersInfo(player_ids_array);
//         res.status(200).send(results);
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = router;