const DButils = require("./DButils");
const teams_utils = require("./teams_utils");
const player_utils = require("./players_utils");
const coaches_utils = require("./coaches_utils");

/**
 * Generic function to mark an object as favorite.
 * There are 3 options to mark as favorite: Player, Team, Match.
 * @param {number} user_id 
 * @param {number} favorite_id 
 * @param {string} table_name 
 * @param {string} attribute_ID 
 * @returns returns an indication if marking a favorite was successful or not.
 */
async function markAsFavorite(user_id, favorite_id, table_name, attribute_ID) {
    let exist;
    let result = 0;
    // Check if the favorite_id exists.
    if (table_name === "Players")
        exist = await player_utils.get_player_preview(favorite_id);
    else if (table_name === "Teams")
        exist = await teams_utils.get_team_data(favorite_id, null);
    else if (table_name === "Coaches")
        exist = await coaches_utils.get_coach_preview(favorite_id);
    else {
        exist = (await DButils.execQuery(`SELECT ${attribute_ID} FROM dbo.${table_name} WHERE ${attribute_ID} = '${favorite_id}'`)).recordset[0];
        exist = (exist) ? exist.Match_ID : 0;
    }
    // If exists, update it on favorites DB.
    if (exist) {
        result = -1;
        const check = (await DButils.execQuery(`SELECT ${attribute_ID} FROM Favorite_${table_name} 
        WHERE ${attribute_ID} = '${favorite_id}' AND Username = '${user_id}'`)).recordset[0];
        if (!check) {
            await DButils.execQuery(
                `INSERT INTO Favorite_${table_name} VALUES ('${user_id}','${favorite_id}')`
            )
            result = 1;
        }
    }
    return result;
}

/**
 * Function gets all favorites of a user.
 * There are 3 optional favorites: Players, Teams, Matches.
 * @param {number} user_id 
 * @param {string} attribute_ID 
 * @param {string} table_name 
 * @returns array of all favorites IDs.
 */
async function getAllFavorites(user_id, attribute_ID, table_name) {
    const favorites_ids = (await DButils.execQuery(
        `SELECT ${attribute_ID} FROM Favorite_${table_name} WHERE Username = '${user_id}'`
    )).recordset
    clean_ids = []
    favorites_ids.map((favorite) => clean_ids.push(favorite[attribute_ID]));
    return clean_ids

}

/**
 * Function deletes a favorite from user's favorites.
 * There are 3 options for a favorite to delete: Player, Team, Match.
 * @param {number} user_id 
 * @param {number} not_favorite_id 
 * @param {string} table_name 
 * @param {string} attribute_ID 
 * @returns an indication if delete was successful or not.
 */
async function deleteFromFavorite(user_id, not_favorite_id, table_name, attribute_ID) {
    const result = (await DButils.execQuery(
        `DELETE FROM Favorite_${table_name} WHERE Username = '${user_id}' AND ${attribute_ID} = '${not_favorite_id}' `
    )).rowsAffected[0];
    return result
}

exports.markAsFavorite = markAsFavorite;
exports.getAllFavorites = getAllFavorites;
exports.deleteFromFavorite = deleteFromFavorite;