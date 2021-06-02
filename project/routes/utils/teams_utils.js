const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const league_utils = require("./league_utils")
const players_utils = require("./players_utils")
const DButils = require("./DButils")

async function search_team_by_name(keyword) {
    const all_teams_in_league = await league_utils.get_all_teams_in_league();
    const all_teams_by_name = (await axios.get(
        `${api_domain}/teams/search/${keyword}`, {
            params: {
                include: "TEAM_NAME",
                api_token: process.env.api_token,
            },
        }
    )).data.data;
    const filtered = all_teams_by_name.filter(team => all_teams_in_league.includes(team.id))
    return filtered;
}

async function get_team_data(team_id, include) {
    const team_details = await players_utils.getPlayersByTeam(team_id);
    if (include == "matches") {
        console.log('hereeeeee');
        const matches = (await DButils.execQuery(
            `SELECT * FROM dbo.Matches
             WHERE Home_Team_ID = '${team_id}'
             OR Away_Team_ID = '${team_id}'`
        )).recordsets[0]
        team_details.push(matches);
    }
    return team_details
}

exports.search_team_by_name = search_team_by_name;
exports.get_team_data = get_team_data;