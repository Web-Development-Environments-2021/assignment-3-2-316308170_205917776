var express = require("express");
var router = express.Router();
const team_utils = require("./utils/teams_utils");

router.get("/search", async(req, res, next) => {
    let data = []
    let keyword = req.query.keyword;
    try {
        const all_teams = await team_utils.search_team_by_name(keyword);
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
    try {
        let result = { team: [], coach: [], matches: [] };
        const team_details = await team_utils.get_team_data(req.params.team_id, req.query.include)
        result.team = team_details[0];
        result.coach = team_details[1];
        if (team_details.length > 2)
            result.matches = team_details[2];
        res.send(result);
    } catch (error) {
        next(error);
    }
});


module.exports = router;