var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");

router.get("/", async(req, res, next) => {
    try {
        const result = (await DButils.execQuery(
            `SELECT * FROM dbo.Referees`
        )).recordset;
        res.status(200).send(result)
    } catch (error) {
        next(error);
    }
});


router.post("/", async(req, res, next) => {
    try {
        const result = await DButils.execQuery(
            `INSERT INTO dbo.Referees VALUES ('${req.body.ref_id}', '${req.body.ref_name}')`
        );
        res.status(200).send('successfully added referee!')
    } catch (error) {
        next(error);
    }
});

module.exports = router;