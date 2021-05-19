var express = require("express");
var router = express.Router();
const coaches_utils = require("./utils/coaches_utils");

router.get("/search", async(req, res, next) => {
    console.log('here')
    let keyword = req.query.keyword;
    try {
        const all_coaches = await coaches_utils.search_coaches_by_name(keyword);
        // res.send(all_teams);
        res.send(all_coaches);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;