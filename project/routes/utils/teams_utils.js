const axios = require("axios");

async function getAllTeams(keyword) {
    const all_teams = await axios.get(
        `https://soccer.sportmonks.com/api/v2.0/teams/search/${keyword}`, {
            params: {
                api_token: process.env.api_token,
            },
        }
    ).data;
    return all_teams;
    // next game details should come from DB
}

exports.getAllTeams = getAllTeams;