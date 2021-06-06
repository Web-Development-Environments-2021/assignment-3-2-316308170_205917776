const axios = require("axios");
const LEAGUE_ID = 271;
const SEASON_ID = 18334
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const DButils = require('./DButils')

/**
 * Private function (not exported). Gets all fixtures from sportmonks API.
 * @returns array of all fixtures from current season retrieved from sportmonks API.
 */
async function get_all_fixtures() {
    const all_fixtures = (await axios.get(
        `${api_domain}/seasons/${SEASON_ID}`, {
            params: {
                include: "SEASON_ID",
                include: "fixtures",
                api_token: process.env.api_token,
            }
        }
    )).data.data.fixtures.data
    return all_fixtures;
}

/**
 * Private function (not exported). Gets all teams playing in Superliga this season, by
 * the fixtures data retrieved from sportmonks API.
 * @param {array} all_fixtures 
 * @returns array of all teams ids.
 */
async function get_all_teams_from_fixtures(all_fixtures) {
    all_teams = []
    all_fixtures.map((fixture) => {
        if (!(all_teams.includes(fixture.localteam_id)))
            all_teams.push(fixture.localteam_id)
        if (!(all_teams.includes(fixture.visitorteam_id)))
            all_teams.push(fixture.visitorteam_id)
    })
    return all_teams
}

/**
 * Fucntion gets all teams playing this season in Superliga.
 * @returns array of all teams. 
 */
async function get_all_teams_in_league() {
    const all_fixtures = await get_all_fixtures()
    const all_teams_in_league = get_all_teams_from_fixtures(all_fixtures)
    return all_teams_in_league;
}


/**
 * Function gets the closest match from the DB, given the current stage.
 * @param {number} stage_id 
 * @returns Object of upcoming game.
 */
async function getUpcomingGame(stage_id) {
    upcoming_game = (await DButils.execQuery(
        `SELECT TOP 1 * FROM dbo.Matches WHERE Stage = '${stage_id}' 
        ORDER BY Match_Date`
    )).recordset;
    return upcoming_game;
}

/**
 * Function retrieves from sportmonks API details about the league.
 * @returns Object with details on league.
 */
async function getLeagueDetails() {
    const league = (await axios.get(
        `${api_domain}/leagues/${LEAGUE_ID}`, {
            params: {
                include: "season",
                api_token: process.env.api_token,
            },
        }
    )).data.data;
    // In case current stage doesn't exist (summer break), pick the most early stage in Superliga.
    const current_stage = league.current_stage_id || 77453568
    const stage = (await axios.get(
        `${api_domain}/stages/${current_stage}`, {
            params: {
                api_token: process.env.api_token,
            },
        }
    )).data.data;
    return {
        league_name: league.name,
        current_season_name: league.season.data.name,
        current_season_id: league.season.data.id,
        current_stage_name: stage.name,
        current_stage_id: stage.id
    };
}
exports.getLeagueDetails = getLeagueDetails;
exports.getUpcomingGame = getUpcomingGame;
exports.get_all_teams_in_league = get_all_teams_in_league;