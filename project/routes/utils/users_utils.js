const DButils = require("./DButils");

async function markAsFavorite(user_id, favorite_id, table_name) {
    const result = (await DButils.execQuery(
        `INSERT INTO Favorite_${table_name} VALUES ('${user_id}','${favorite_id}')`
    )).rowsAffected[0];
    console.log(result);
}


async function getAllFavorites(user_id, attribute_ID, table_name) {
    const favorites_ids = (await DButils.execQuery(
        `SELECT ${attribute_ID} FROM Favorite_${table_name} WHERE Username = '${user_id}'`
    )).recordset
    const promises = []
    for (let i = 0; i < favorites_ids.length; i++) {
        favorites_ids.map((player) => {
            promises.push(DButils.execQuery(
                `SELECT * FROM Favorite_${table_name} WHERE ${attribute_ID}='${player.Player_ID}'`
            ))
        })
    }
    let favorites_data = await Promise.all(promises);
    favorites_data = favorites_data.map((favorite) => favorite.recordset)
    return favorites_data
}



exports.markAsFavorite = markAsFavorite;
exports.getAllFavorites = getAllFavorites;