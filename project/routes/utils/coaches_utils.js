const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const league_utils = require("./league_utils");

async function search_coaches_by_name(keyword) {
    let season_id = (await league_utils.getLeagueDetails()).current_season_id;
    const all_teams = (await axios.get(
        `${api_domain}/teams/season/${season_id}`, {
            params: {
                include: "coach",
                api_token: process.env.api_token,
            },
        })).data.data;
    console.log(all_teams);
    let coaches = []
    all_teams.map((team) => coaches.push({
        coach_id: team.coach.data.coach_id,
        coach_name: team.coach.data.fullname
    }))
    const filtered = coaches.filter(coach => coach.coach_name.includes(keyword))
    return filtered;
    // next game details should come from DB
}

exports.search_coaches_by_name = search_coaches_by_name;