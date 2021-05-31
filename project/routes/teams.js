var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const team_utils = require("./utils/teams_utils");
const coaches_utils = require("./utils/coaches_utils")

router.get("/search", async(req, res, next) => {
    let data = []
    let keyword = req.query.keyword;
    try {
        const all_teams = await team_utils.search_team_by_name(keyword);
        // res.send(all_teams);
        all_teams.map((team) => data.push({
            team_id: team.id,
            team_name: team.name
        }));
        res.send(data);
    } catch (error) {
        next(error);
    }

});

router.get("/:team_id", async(req, res, next) => {
    let team_details = [];
    try {
        const team_details = await players_utils.getPlayersByTeam(
            req.params.team_id
        );
        //we should keep implementing team page.....
        res.send(team_details);
    } catch (error) {
        next(error);
    }
});


module.exports = router;