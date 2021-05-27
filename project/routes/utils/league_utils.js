const axios = require("axios");
const LEAGUE_ID = 271;
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const DButils = require('./DButils')

async function getUpcomingGame(stage_id) {
    const stage_order = (await axios.get(
        `${api_domain}/stages/${stage_id}`, {
            params: {
                api_token: process.env.api_token,
            },
        }
    )).data.sort_order;
    upcoming_game = DButils.execQuery(
        `SELECT TOP 1 FROM dbo.Matches WHERE Stage = '${stage_order}' 
        ORDER BY Match_Date`
    );
}

async function getLeagueDetails() {
    const league = await axios.get(
        `${api_domain}/leagues/${LEAGUE_ID}`, {
            params: {
                include: "season",
                api_token: process.env.api_token,
            },
        }
    );
    const stage = await axios.get(
        `${api_domain}/stages/${league.data.data.current_stage_id}`, {
            params: {
                api_token: process.env.api_token,
            },
        }
    );
    return {
        league_name: league.data.data.name,
        current_season_name: league.data.data.season.data.name,
        current_season_id: league.data.data.season.data.id,
        current_stage_name: stage.data.data.name,
        current_stage_id: stage.data.data.id

        // next game details should come from DB
    };
}
exports.getLeagueDetails = getLeagueDetails;
exports.getUpcomingGame = getUpcomingGame;