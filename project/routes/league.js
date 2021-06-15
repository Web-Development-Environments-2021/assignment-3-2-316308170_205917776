var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils")
var all_stages;

const get = async() =>{
    console.log("create ")
    await league_utils.get_all_league_entities();
}

router.get("/getAll", async(req,res,next) => {
    try {
        res.status(200).send([league_utils.all_teams,league_utils.all_players,league_utils.all_coaches])
    } catch (error) {
        next(error);
    }
})

router.get("/stages/:stage_id", async(req, res, next) => {
    try {
        if (!all_stages) {
            const stages = await league_utils.get_all_stages();
            all_stages = stages;
        }
        let stage;
        for (let i = 0; i < all_stages.length; i++) {
            if (all_stages[i].id == req.params.stage_id)
                stage = all_stages[i];
        }
        if (stage)
            res.status(200).send(stage)
        else
            res.status(404).send('no such stage');
    } catch (error) {
        next(error);
    }
});

module.exports = router;