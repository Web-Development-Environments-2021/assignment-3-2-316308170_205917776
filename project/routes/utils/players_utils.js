const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const league_utils = require("./league_utils")
const coach_utils = require("./coaches_utils")
const SEASON_ID = 18334



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
    return [player_ids_list, team.data.data.coach.data.coach_id];
}

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

function extractRelevantPlayerData(players_info) {
    return players_info.map((player_info) => {
        const { fullname, image_path, position_id } = player_info.data.data;
        const { name } = player_info.data.data.team.data;
        return {
            name: fullname,
            image: image_path,
            position: position_id,
            team_name: name,
        };
    });
}

async function getSquadByTeam(team_id) {
    let team_ids_list = await getSquadIdsByTeam(team_id);
    let team_info = await getPlayersInfo(team_ids_list[0]);
    let coach_info = await coach_utils.get_coach_preview(team_ids_list[1]);
    return [team_info, coach_info];
}

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
        team_name: team_name,
        common_name: player_info.common_name,
        birthdate: player_info.birthdate,
        birth_country: player_info.birthcountry,
        nationality: player_info.nationality,
        height: player_info.height,
        weight: player_info.weight
    };
}

async function get_player_preview(player_id) {
    let full_data = await get_player_full_data(player_id);
    return {
        name: full_data.name,
        team_name: full_data.team_name,
        photo_path: full_data.photo_path,
        position: full_data.position
    }
}

async function get_all_players_in_season() {
    const all_teams = (await axios.get(`${api_domain}/teams/season/${SEASON_ID}`, {
        params: {
            include: "squad.player.team",
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
                        name: player.player.data.fullname
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