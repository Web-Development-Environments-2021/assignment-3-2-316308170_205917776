const DButils = require("./DButils");

async function markAsFavorite(user_id, favorite_id, table_name) {
    const result = (await DButils.execQuery(
        `INSERT INTO Favorite_${table_name} VALUES ('${user_id}','${favorite_id}')`
    )).rowsAffected[0];
    console.log(result);
}


async function getAllFavorites(user_id, attribute_ID, table_name) {
    console.log(user_id, attribute_ID, table_name);
    const favorites_ids = (await DButils.execQuery(
        `SELECT ${attribute_ID} FROM Favorite_${table_name} WHERE Username = '${user_id}'`
    )).recordset
    console.log(favorites_ids);
    clean_ids = []
    favorites_ids.map((favorite) => clean_ids.push(favorite[attribute_ID]));
    console.log(clean_ids);
    return clean_ids
        // console.log(favorites_ids);
        // const promises = []
        // for (let i = 0; i < favorites_ids.length; i++) {
        //     favorites_ids.map((favorite) => {
        //         console.log(favorite[attribute_ID]);
        //         promises.push(DButils.execQuery(
        //             `SELECT * FROM ${table_name} WHERE ${attribute_ID}='${favorite[attribute_ID]}'`
        //         ))
        //     })
        // }
        // let favorites_data = await Promise.all(promises);
        // favorites_data = favorites_data.map((favorite) => favorite.recordset)
        // return favorites_data
}



exports.markAsFavorite = markAsFavorite;
exports.getAllFavorites = getAllFavorites;