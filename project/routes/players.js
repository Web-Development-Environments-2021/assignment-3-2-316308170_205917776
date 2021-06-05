var express = require("express");
var router = express.Router();
const players_utils = require("./utils/players_utils");
var all_players = null

router.use(async(req, res, next) => {
    if (all_players == null)
        all_players = await players_utils.get_all_players_in_season();
    next();
})


router.get("/search", async(req, res, next) => {
    let keyword = req.query.keyword;
    try {
        const relevant_players = await players_utils.search_players_by_name(keyword, all_players);
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