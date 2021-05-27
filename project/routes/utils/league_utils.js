const axios = require("axios");
const LEAGUE_ID = 271;
const SEASON_ID = 17328
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const DButils = require('./DButils')


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

async function get_all_teams_in_league() {
    const all_fixtures = await get_all_fixtures()
    const all_teams_in_league = get_all_teams_from_fixtures(all_fixtures)
    return all_teams_in_league;
}


async function getUpcomingGame(stage_id) {
    const stage_order = (await axios.get(
        `${api_domain}/stages/${stage_id}`, {
            params: {
                api_token: process.env.api_token,
            },
        }
    )).data.data.sort_order;
    upcoming_game = (await DButils.execQuery(
        `SELECT TOP 1 * FROM dbo.Matches WHERE Stage = '${stage_order}' 
        ORDER BY Match_Date`
    )).recordset;
    return upcoming_game;
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
exports.get_all_teams_in_league = get_all_teams_in_league;