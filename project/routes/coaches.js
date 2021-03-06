var express = require("express");
var router = express.Router();
const coaches_utils = require("./utils/coaches_utils");

router.get("/search", async(req, res, next) => {
    let keyword = req.query.keyword;
    try {
        const all_coaches = await coaches_utils.search_coaches_by_name(keyword);
        res.status(200).send(all_coaches);
    } catch (error) {
        next(error);
    }
});

router.get('/:coach_id/preview', async(req, res, next) => {
    try {
        const coach_info = await coaches_utils.get_coach_preview(req.params.coach_id);
        res.status(200).send(coach_info);
    } catch (error) {
        next(error);
    }
});

router.get('/:coach_id/full_data', async(req, res, next) => {
    try {
        const coach_info = await coaches_utils.get_coach_full_data(req.params.coach_id);
        res.status(200).send(coach_info);
    } catch (error) {
        next(error);
    }
});


module.exports = router;