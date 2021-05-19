var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const team_utils = require("./utils/teams_utils");

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

router.get("/search", async(req, res, next) => {
    console.log('here!!!')
        // let data = []
        // let keyword = "mi";
        // try {
        //     const all_teams = await team_utils.getAllTeams(keyword);
        //     all_teams.map((team) => data.push(team.id, team.name));
        //     res.send(data);
        // } catch (error) {
        //     next(error);
        // }

});

module.exports = router;