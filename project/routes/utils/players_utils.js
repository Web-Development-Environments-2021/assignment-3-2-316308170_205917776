const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const coach_utils = require("./coaches_utils")
const SEASON_ID = 18334

/**
 * Function get all ids of team's squad (players and coach) 
 * given the team id, using sportmonks API.
 * @param {number} team_id 
 * @returns array of all ids.
 */
async function getSquadIdsByTeam(team_id) {
    let player_ids_list = [];
    const team = await axios.get(`${api_domain}/teams/${team_id}`, {
        params: {
            include: "squad,coach",
            api_token: process.env.api_token
        }
    });
    team.data.data.squad.data.map((player) =>
        player_ids_list.push(player.player_id)
    );
    return [player_ids_list, team.data.data.coach.data.coach_id, team.data.data.logo_path];
}

/**
 * Function retrieves info about every player in the given ids list, 
 * using sportmonks API.
 * @param {array} players_ids_list 
 * @returns array of objects, each contains data about player.
 */
async function getPlayersInfo(players_ids_list) {
    let promises = [];
    players_ids_list.map((id) =>
        promises.push(
            axios.get(`${api_domain}/players/${id}`, {
                params: {
                    api_token: process.env.api_token,
                    include: "team",
                },
            })
        )
    );
    const players_info = await Promise.all(promises);
    return extractRelevantPlayerData(players_info);
}

/**
 * Private function (not exported). Given array of all players info, extract the relevant
 * information about each player.
 * @param {array} players_info 
 * @returns array of objects - each includes only relevant player info.
 */
function extractRelevantPlayerData(players_info) {
    return players_info.map((player_info) => {
        const { player_id, fullname, image_path, position_id } = player_info.data.data;
        const { name } = player_info.data.data.team.data;
        return {
            player_id: player_id,
            name: fullname,
            image: image_path,
            position: position_id,
            team_name: name,
        };
    });
}

/**
 * Function gets all squad (players and coach) information using another functions.
 * @param {number} team_id 
 * @returns array including team information and coach information.
 */
async function getSquadByTeam(team_id) {
    let team_ids_list = await getSquadIdsByTeam(team_id);
    let team_info = await getPlayersInfo(team_ids_list[0]);
    console.log(team_info);
    let coach_info = await coach_utils.get_coach_preview(team_ids_list[1]);
    let team_logo = team_ids_list[2]
    return [team_info, coach_info, team_logo];
}

/**
 * Function gets a keyword to search players by it.
 * The function searches trough all_players array, and return every 
 * player that his name matches the keyword.
 * @param {string} keyword 
 * @param {array} all_players 
 * @returns array of players who's names matches the keyword.
 */
async function search_players_by_name(keyword, all_players) {
    let filtered = []
    all_players.map(
        (player) => {
            if (player.name != null && player.name.includes(keyword))
                filtered.push(player)
        }
    )
    return filtered;
}

/**
 * Function gets full data on player given it's ID, using sportmonks API.
 * @param {number} player_id 
 * @returns Object with full data about the player
 */
async function get_player_full_data(player_id) {
    const player_info = (await axios.get(
        `${api_domain}/players/${player_id}`, {
            params: {
                api_token: process.env.api_token
            }
        }
    )).data.data;
    const team_name = (await axios.get(
        `${api_domain}/teams/${player_info.team_id}`, {
            params: {
                api_token: process.env.api_token
            }
        }
    )).data.data.name;
    return {
        name: player_info.fullname,
        photo_path: player_info.image_path,
        position: player_info.position_id,
        team_id: player_info.team_id,
        team_name: team_name,
        common_name: player_info.common_name,
        birthdate: player_info.birthdate,
        birth_country: player_info.birthcountry,
        nationality: player_info.nationality,
        height: player_info.height,
        weight: player_info.weight
    };
}

/**
 * Function gets preview data on player, using the get_full_data function.
 * @param {number} player_id 
 * @returns Object with player's preview data.
 */
async function get_player_preview(player_id) {
    let full_data = await get_player_full_data(player_id);
    return {
        id: player_id,
        name: full_data.name,
        team_id: full_data.team_id,
        team_name: full_data.team_name,
        photo_path: full_data.photo_path,
        position: full_data.position
    }
}

/**
 * Function gets all players that play this season in Superliga, using sportmonks API.
 * @returns array of objects, each object contains player's ID and name.
 */
async function get_all_players_in_season() {
    const all_teams = (await axios.get(`${api_domain}/teams/season/${SEASON_ID}`, {
        params: {
            include: "squad.player",
            api_token: process.env.api_token,
        },
    })).data.data
    const all_players = []
    all_teams.map(
        (team) => {
            team_squad = team.squad.data;
            team_squad.map(
                (player) => {
                    all_players.push({
                        id: player.player.data.player_id,
                        name: player.player.data.fullname,
                        team: team.name
                    })
                }
            )
        }
    )
    return all_players;
}

exports.getSquadByTeam = getSquadByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.search_players_by_name = search_players_by_name;
exports.get_player_full_data = get_player_full_data;
exports.get_player_preview = get_player_preview;
exports.get_all_players_in_season = get_all_players_in_season;