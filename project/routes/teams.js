var express = require("express");
var router = express.Router();
const team_utils = require("./utils/teams_utils");
const DButils = require("./utils/DButils");


router.get("/search", async(req, res, next) => {
    let data = []
    let keyword = req.query.keyword;
    try {
        const all_teams = await team_utils.search_team_by_name(keyword);
        all_teams.map((team) => data.push({
            id: team.id,
            name: team.name
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
        result.logo = team_details[2];
        if (team_details.length > 3)
            result.matches = team_details[3];
        res.send(result);
    } catch (error) {
        next(error);
    }
});


router.get("/:team_id/matches", async(req, res, next) => {
    try {
        // console.log("in path")
        // console.log(team_id);
        // console.log(req.params.team_id);
        const team_matches = (await DButils.execQuery(
            `SELECT * FROM dbo.Matches
             WHERE Home_Team_ID = '${req.params.team_id}'
             OR Away_Team_ID = '${req.params.team_id}'`
        )).recordsets[0]
        res.status(200).send(team_matches);
    } catch (error) {
        next(error);
    }
});

router.get("/:team_id/preview", async(req, res, next) => {
    try {
        const team_preview = await team_utils.get_team_preview(req.params.team_id);
        res.status(200).send(team_preview);
    } catch (error) {
        next(error);
    }
});



module.exports = router;