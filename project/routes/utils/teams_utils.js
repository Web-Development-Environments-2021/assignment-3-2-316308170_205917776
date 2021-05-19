const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

async function search_team_by_name(keyword) {
    const all_teams = await axios.get(
        `${api_domain}/teams/search/${keyword}`, {
            params: {
                include: "TEAM_NAME",
                api_token: process.env.api_token,
            },
        }
    );
    return all_teams.data.data;
    // next game details should come from DB
}

exports.search_team_by_name = search_team_by_name;