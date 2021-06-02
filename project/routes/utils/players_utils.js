const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const league_utils = require("./league_utils")
const coach_utils = require("./coaches_utils")
    // const TEAM_ID = "85";

async function getPlayerIdsByTeam(team_id) {
    let player_ids_list = [];
    const team = await axios.get(`${api_domain}/teams/${team_id}`, {
        params: {
            include: "squad,coach",
            // include: "coach",
            api_token: process.env.api_token
        }
    });
    // console.log(team.data.data.squad)
    team.data.data.squad.data.map((player) =>
        player_ids_list.push(player.player_id)
    );
    console.log(team.data.data.coach.data.coach_id);
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
    // console.log(players_ids_list);
    const players_info = await Promise.all(promises);
    // console.log(players_info);
    return extractRelevantPlayerData(players_info);
}

function extractRelevantPlayerData(players_info) {
    // console.log(players_info);
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

async function getPlayersByTeam(team_id) {
    let team_ids_list = await getPlayerIdsByTeam(team_id);
    let team_info = await getPlayersInfo(team_ids_list[0]);
    let coach_info = await coach_utils.get_coach_preview(team_ids_list[1]);
    return [team_info,coach_info];
}

async function search_players_by_name(keyword) {
    const all_teams_in_league = await league_utils.get_all_teams_in_league();
    console.log(all_teams_in_league)
    const all_players = (await axios.get(
        `${api_domain}/players/search/${keyword}`, {
            params: {
                include: "PLAYER_NAME",
                api_token: process.env.api_token,
            },
        }
    )).data.data;
    console.log(all_players)
    const filtered = all_players.filter(player => all_teams_in_league.includes(player.team_id))
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
        birth_country: player_info.birth_country,
        nationality: player_info.nationality,
        height: player_info.height,
        weight: player_info.weight
    };
}

async function get_player_preview(player_id) {
    console.log('in func')
    let full_data = await get_player_full_data(player_id);
    return {
        name: full_data.name,
        photo_path: full_data.photo_path,
        position: full_data.position,
        team_name: full_data.team_name
    }
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.search_players_by_name = search_players_by_name;
exports.get_player_full_data = get_player_full_data;
exports.get_player_preview = get_player_preview;