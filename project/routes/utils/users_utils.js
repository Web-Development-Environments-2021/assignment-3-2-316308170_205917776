const DButils = require("./DButils");
const teams_utils = require("./teams_utils");
const player_utils = require("./players_utils");
const e = require("express");

async function markAsFavorite(user_id, favorite_id, table_name,attribute_ID) {
    let exist;
    let result = 0;
    if(table_name === "Teams")
        exist = await player_utils.get_player_preview(favorite_id);
    else if (table_name === "Players")
        exist = await teams_utils.get_team_data(favorite_id,null);
    else 
        exist = (await DButils.execQuery(`SELECT ${attribute_ID} FROM dbo.${table_name} WHERE ${attribute_ID} = '${favorite_id}'`)).recordset[0].Match_ID;
    if(exist){
        result = -1;
        const check = (await DButils.execQuery(`SELECT ${attribute_ID} FROM Favorite_${table_name} 
        WHERE ${attribute_ID} = '${favorite_id}'`)).recordset[0];
        if(!check){
            await DButils.execQuery(
                `INSERT INTO Favorite_${table_name} VALUES ('${user_id}','${favorite_id}')`
            )
            result = 1;
    }}
    return result;
}


async function getAllFavorites(user_id, attribute_ID, table_name) {
    console.log(user_id, attribute_ID, table_name);
    const favorites_ids = (await DButils.execQuery(
        `SELECT ${attribute_ID} FROM Favorite_${table_name} WHERE Username = '${user_id}'`
    )).recordset
    clean_ids = []
    favorites_ids.map((favorite) => clean_ids.push(favorite[attribute_ID]));
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