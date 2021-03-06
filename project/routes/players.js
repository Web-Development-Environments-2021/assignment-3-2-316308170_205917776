var express = require("express");
var router = express.Router();
const players_utils = require("./utils/players_utils");
const league_utils = require("./utils/league_utils");


router.get("/search", async(req, res, next) => {
    let keyword = req.query.keyword;
    try {
        const relevant_players = await players_utils.search_players_by_name(keyword, league_utils.all_players);
        res.status(200).send(relevant_players);
    } catch (error) {
        next(error);
    }
});

router.get('/:player_id/preview', async(req, res, next) => {
    try {
        const player_info = await players_utils.get_player_preview(req.params.player_id);
        res.status(200).send(player_info);
    } catch (error) {
        next(error);
    }
});

router.get('/:player_id/full_data', async(req, res, next) => {
    try {
        const player_info = await players_utils.get_player_full_data(req.params.player_id);
        res.status(200).send(player_info);
    } catch (error) {
        next(error);
    }
});



module.exports = router;