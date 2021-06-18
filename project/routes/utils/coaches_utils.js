const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const league_utils = require("./league_utils");


/**
 * Function search all coaches that their names matches the keyword, using sportmonks API.
 * @param {string} keyword 
 * @returns filtered array of all coaches which their name includes keyword.
 */
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
        id: team.coach.data.coach_id,
        name: team.coach.data.fullname,
        team: team.name
    }))
    const filtered = coaches.filter(coach => coach.name != null && coach.name.includes(keyword))
    return filtered;
}


/**
 * Get full data on coach given it's ID, using sportmonks API.
 * @param {number} coach_id 
 * @returns Object with coach's full data.
 */
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
        id: coach_id,
        name: coach_info.fullname,
        photo_path: coach_info.image_path,
        team_id: coach_info.team_id,
        team_name: team_name,
        common_name: coach_info.common_name,
        birthdate: coach_info.birthdate,
        birth_country: coach_info.birthcountry,
        nationality: coach_info.nationality
    };
}

/**
 * Get coach preview data, using the get_full_data function.
 * @param {number} coach_id 
 * @returns Object with coach's preview data.
 */
async function get_coach_preview(coach_id) {
    let full_data = await get_coach_full_data(coach_id);
    return {
        name: full_data.name,
        photo_path: full_data.photo_path,
        position: full_data.position,
        team_name: full_data.team_name,
        team_id: full_data.team_id
    }
}


exports.search_coaches_by_name = search_coaches_by_name;
exports.get_coach_full_data = get_coach_full_data;
exports.get_coach_preview = get_coach_preview;