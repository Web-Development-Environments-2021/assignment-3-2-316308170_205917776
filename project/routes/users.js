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
    try {
        const user_id = req.session.user_id || 'Gal'
        const favorites_ids = await users_utils.getAllFavorites(user_id, "Match_ID", "Matches");
        const promises = []
        favorites_ids.map((favorite) => {
            promises.push(DButils.execQuery(
                `SELECT * FROM dbo.Matches WHERE Match_ID='${favorite}'`
            ))
        })
        let favorites_data = await Promise.all(promises);
        final_data = []
        favorites_data.map((match) => final_data.push(match.recordset[0]))
        if (final_data.length == 0)
            res.status(404).send('no favorite matches')
        else
            res.status(200).send(final_data)
    } catch (error) {
        next(error);
    }
})

router.post("/favoriteMatches", async(req, res, next) => {
    try {
        const user_id = req.session.user_id || 'Ariel'
        const match_id = req.body.match_id;
        const table_name = "Matches"
        const attribute_ID = "Match_ID"
        const status = await users_utils.markAsFavorite(user_id, match_id, table_name,attribute_ID)
        if (status == 0)
            res.status(404).send('no favorite matches')
        else
            res.status(201).send('successfully added match to favorites!')
    } catch (error) {
        next(error);
    }
})

router.delete("/favoriteMatches/:match_id", async(req, res, next) => {
    try {
        const user_id = req.session.user_id || 'Ariel'
        const match_id = req.params.match_id
        const table_name = "Matches"
        const attribute_ID = "Match_ID"
        const status = await users_utils.deleteFromFavorite(user_id, match_id, table_name, attribute_ID)
        if (status == 0)
            res.status(404).send('no favorite match')
        else
            res.status(200).send('successfully deleted match from favorites!')
    } catch (error) {
        next(error);
    }
})


router.get("/favoritePlayers", async(req, res, next) => {
    try {
        const user_id = req.session.user_id || 'Ariel'
        const favorites = await users_utils.getAllFavorites(user_id, "Player_ID", "Players");
        const promises = []
        favorites.map((player) => promises.push(players_utils.get_player_preview(player)));
        let final_data = await Promise.all(promises);
        if (final_data.length == 0)
            res.status(404).send('no favorite players')
        else
            res.status(200).send(final_data)
    } catch (error) {
        next(error);
    }
})

router.post("/favoritePlayers", async(req, res, next) => {
    try {
        const user_id = req.session.user_id || 'Ariel'
        const player_id = req.body.player_id;
        const table_name = "Players"
        const attribute_ID = "Player_ID"
        const status = await users_utils.markAsFavorite(user_id, player_id, table_name,attribute_ID)
        if (status == 0)
            res.status(404).send('no favorite players')
        else
            res.status(201).send('successfully added player to favorites!')
    } catch (error) {
        next(error);
    }
})

router.delete("/favoritePlayer/:player_id", async(req, res, next) => {
    try {
        const user_id = req.session.user_id || 'Ariel'
        const player_id = req.params.player_id
        const table_name = "Players"
        const attribute_ID = "Player_ID"
        const status = await users_utils.deleteFromFavorite(user_id, player_id, table_name, attribute_ID)
        if (status == 0)
            res.status(404).send('no favorite players')
        else
            res.status(200).send('successfully deleted player from favorites!')
    } catch (error) {
        next(error);
    }
})

router.get("/favoriteTeams", async(req, res, next) => {
    try {
        const user_id = req.session.user_id || 'Ariel'
        const favorites = await users_utils.getAllFavorites(user_id, "Team_ID", "Teams");
        const promises = []
        favorites.map((player) => promises.push(players_utils.get_player_preview(player)));
        let final_data = await Promise.all(promises);
        if (final_data.length == 0)
            res.status(404).send('no favorite teams')
        else
            res.status(200).send(final_data)
    } catch (error) {
        next(error);
    }
})

router.post("/favoriteTeams", async(req, res, next) => {
    try {
        const user_id = req.session.user_id || 'Ariel'
        const team_id = req.body.team_id;
        const table_name = "Teams"
        const attribute_ID = "Team_ID"
        const status = await users_utils.markAsFavorite(user_id, team_id, table_name,attribute_ID)
        if (status == 0)
            res.status(404).send('no favorite teams')
        else
            res.status(201).send('successfully added team to favorites!')
    } catch (error) {
        next(error);
    }
})

router.delete("/favoriteTeams/:team_id", async(req, res, next) => {
    try {
        const user_id = req.session.user_id || 'Ariel'
        const team_id = req.params.team_id
        const table_name = "Teams"
        const attribute_ID = "Team_ID"
        const status = await users_utils.deleteFromFavorite(user_id, team_id, table_name, attribute_ID)
        if (status == 0)
            res.status(404).send('no favorite team')
        else
            res.status(200).send('successfully deleted team from favorites!')
    } catch (error) {
        next(error);
    }
})

module.exports = router;