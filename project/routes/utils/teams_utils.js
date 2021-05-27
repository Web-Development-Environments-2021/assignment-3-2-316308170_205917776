const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const league_utils = require("./league_utils")

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

exports.search_team_by_name = search_team_by_name;