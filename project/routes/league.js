var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");


router.get("/getDetails", async(req, res, next) => {
    try {
        const league_details = await league_utils.getLeagueDetails();
        res.send(league_details);
    } catch (error) {
        next(error);
    }
});

router.get('/get_upcoming_game', async(req, res, next) => {
    try {
        const current_stage_id = await league_utils.getLeagueDetails().current_stage_id;
        const upcoming_game = await league_utils.getUpcomingGame(current_stage_id);
        res.send(upcoming_game);
    } catch (error) {
        next(error);
    }

});

module.exports = router;