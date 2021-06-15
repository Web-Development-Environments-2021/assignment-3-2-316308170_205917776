const axios = require("axios");
const LEAGUE_ID = 271;
const SEASON_ID = 18334
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const DButils = require('./DButils')
const teams_utils = require('./teams_utils');

var all_players = [];
var all_coaches = [];
var all_teams = [];

async function get_all_league_entities() {
    // if (all_teams)
    //     return [all_teams, all_players, all_coaches]
    const all_teams_data = (await axios.get(`${api_domain}/teams/season/${SEASON_ID}`, {
        params: {
            include: "squad.player,coach",
            api_token: process.env.api_token,
        },
    })).data.data
    all_teams_data.map(
        async(team_data) => {
            const stadium = await teams_utils.get_stadium_by_team_id(team_data.id);
            all_teams.push({
                id: team_data.id,
                name: team_data.name,
                short_code: team_data.short_code,
                founded: team_data.founded,
                logo_path: team_data.logo_path,
                stadium: stadium
            })
            all_coaches.push({
                id: team_data.coach.data.coach_id,
                team_id: team_data.coach.data.team_id,
                name: team_data.coach.data.fullname,
                common_name: team_data.coach.data.common_name,
                nationality: team_data.coach.data.nationality,
                birthdate: team_data.coach.data.birthdate,
                birth_country: team_data.coach.data.birthcountry,
                photo: team_data.coach.data.image_path
            })
            team_data.squad.data.map(
                (player) => {
                    player_info = player.player.data;
                    all_players.push({
                        id: player_info.player_id,
                        team_id: player_info.team_id,
                        position: player_info.position_id,
                        common_name: player_info.common_name,
                        name: player_info.fullname,
                        nationality: player_info.nationality,
                        birth_country: player_info.birthcountry,
                        birthdate: player_info.birthdate,
                        height: player_info.height,
                        weight: player_info.weight,
                        image_path: player_info.image_path
                    })
                }
            )
        }
    )
    return [all_teams, all_players, all_coaches]
}


/**
 * Private function (not exported). Gets all fixtures from sportmonks API.
 * @returns array of all fixtures from current season retrieved from sportmonks API.
 */
async function get_all_fixtures() {
    const all_fixtures = (await axios.get(
        `${api_domain}/seasons/${SEASON_ID}`, {
            params: {
                include: "SEASON_ID",
                include: "fixtures",
                api_token: process.env.api_token,
            }
        }
    )).data.data.fixtures.data
    return all_fixtures;
}

/**
 * Private function (not exported). Gets all teams playing in Superliga this season, by
 * the fixtures data retrieved from sportmonks API.
 * @param {array} all_fixtures 
 * @returns array of all teams ids.
 */
async function get_all_teams_from_fixtures(all_fixtures) {
    let all_teams = []
    all_fixtures.map((fixture) => {
        if (!(all_teams.includes(fixture.localteam_id)))
            all_teams.push(fixture.localteam_id)
        if (!(all_teams.includes(fixture.visitorteam_id)))
            all_teams.push(fixture.visitorteam_id)
    })
    return all_teams
}

/**
 * Fucntion gets all teams playing this season in Superliga.
 * @returns array of all teams. 
 */
async function get_all_teams_in_league() {
    const all_fixtures = await get_all_fixtures()
    const all_teams_in_league = get_all_teams_from_fixtures(all_fixtures)
    return all_teams_in_league;
}


/**
 * Function gets the closest match from the DB, given the current stage.
 * @param {number} stage_id 
 * @returns Object of upcoming game.
 */
async function getUpcomingGame(stage_id) {
    upcoming_game = (await DButils.execQuery(
        `SELECT TOP 1 * FROM dbo.Matches WHERE Stage = '${stage_id}' 
        ORDER BY Match_Date`
    )).recordset;
    return upcoming_game;
}

/**
 * Function retrieves from sportmonks API details about the league.
 * @returns Object with details on league.
 */
async function getLeagueDetails() {
    const league = (await axios.get(
        `${api_domain}/leagues/${LEAGUE_ID}`, {
            params: {
                include: "season",
                api_token: process.env.api_token,
            },
        }
    )).data.data;
    // In case current stage doesn't exist (summer break), pick the most early stage in Superliga.
    const current_stage = league.current_stage_id || 77453568
    const stage = (await axios.get(
        `${api_domain}/stages/${current_stage}`, {
            params: {
                api_token: process.env.api_token,
            },
        }
    )).data.data;
    return {
        league_name: league.name,
        current_season_name: league.season.data.name,
        current_season_id: league.season.data.id,
        current_stage_name: stage.name,
        current_stage_id: stage.id
    };
}

async function get_all_stadiums(all_teams) {
    all_stadiums = {}
    for (let i = 0; i < all_teams.length; i++) {
        const stadium = (await axios.get(
            `${api_domain}/teams/${all_teams[i]}`, {
                params: {
                    include: "TEAM_NAME",
                    include: "venue",
                    api_token: process.env.api_token,
                },
            }
        )).data.data.venue.data.name;
        all_stadiums[all_teams[i]] = stadium;
    }
    return all_stadiums;
}

async function get_all_stages() {
    const stages = (await axios.get(
        `${api_domain}/seasons/${SEASON_ID}`, {
            params: {
                include: "stages",
                api_token: process.env.api_token,
            },
        }
    )).data.data.stages.data;
    return stages;
}

exports.all_teams = all_teams;
exports.all_players = all_players;
exports.all_coaches = all_coaches;
exports.get_all_league_entities = get_all_league_entities;
exports.get_all_stages = get_all_stages;
exports.get_all_stadiums = get_all_stadiums;
exports.getLeagueDetails = getLeagueDetails;
exports.getUpcomingGame = getUpcomingGame;
exports.get_all_teams_in_league = get_all_teams_in_league;