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
    let coaches = []
    all_teams.map((team) => coaches.push({
        coach_id: team.coach.data.coach_id,
        coach_name: team.coach.data.fullname
    }))
    const filtered = coaches.filter(coach => coach.coach_name.includes(keyword))
    return filtered;
    // next game details should come from DB
}

async function get_coach_full_data(coach_id) {
    const coach_info = (await axios.get(
        `${api_domain}/coaches/${coach_id}`, {
            params: {
                api_token: process.env.api_token
            }
        }
    )).data.data;
    const team_name = (await axios.get(
        `${api_domain}/teams/${coach_info.team_id}`, {
            params: {
                api_token: process.env.api_token
            }
        }
    )).data.data.name;
    return {
        name: coach_info.fullname,
        photo_path: coach_info.image_path,
        team_name: team_name,
        common_name: coach_info.common_name,
        birthdate: coach_info.birthdate,
        birth_country: coach_info.birth_country,
        nationality: coach_info.nationality
    };
}

async function get_coach_preview(coach_id) {
    let full_data = await get_coach_full_data(coach_id);
    return {
        name: full_data.name,
        photo_path: full_data.photo_path,
        position: full_data.position,
        team_name: full_data.team_name
    }
}


exports.search_coaches_by_name = search_coaches_by_name;
exports.get_coach_full_data = get_coach_full_data;
exports.get_coach_preview = get_coach_preview;