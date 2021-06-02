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
    try {
        let result = {team:[],coach:[],matches:[]};
        const team_details = await players_utils.getPlayersByTeam(
            req.params.team_id
        );
        if (req.query.include == "matches"){
            const matches = (await DButils.execQuery(
                `SELECT * FROM dbo.Matches
                 WHERE Home_Team_ID = '${req.params.team_id}'
                 OR Away_Team_ID = '${req.params.team_id}'`
            )).recordsets[0]
            result.matches = matches;
        }
        result.team = team_details[0];
        result.coach = team_details[1];
        res.send(result);
    } catch (error) {
        next(error);
    }
});


module.exports = router;