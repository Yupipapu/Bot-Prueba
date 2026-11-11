const Database = require("better-sqlite3");
const path = require("path");
const pokedex = require("./pokedex");
const pokemonEmojis = require("./pokemonEmojis");
const db = new Database(path.join(__dirname, "../../database/database.db"));

db.prepare(
    `
CREATE TABLE IF NOT EXISTS pokemon_teams (
    user_id TEXT PRIMARY KEY,
    pokemon1 INTEGER, pokemon2 INTEGER, pokemon3 INTEGER,
    pokemon4 INTEGER, pokemon5 INTEGER, pokemon6 INTEGER
)
`,
).run();

function get(userId) {
    return db
        .prepare(
            `
        SELECT *
        FROM pokemon_teams
        WHERE user_id = ?
    `,
        )
        .get(userId);
}

function save(userId, team) {
    db.prepare(
        `
        INSERT INTO pokemon_teams
        (
            user_id,
            pokemon1, pokemon2, pokemon3,
            pokemon4, pokemon5, pokemon6
        )
        VALUES
        (
            @user_id,
            @pokemon1, @pokemon2, @pokemon3,
            @pokemon4, @pokemon5, @pokemon6
        )
        ON CONFLICT(user_id) DO UPDATE SET
            pokemon1 = excluded.pokemon1,
            pokemon2 = excluded.pokemon2,
            pokemon3 = excluded.pokemon3,
            pokemon4 = excluded.pokemon4,
            pokemon5 = excluded.pokemon5,
            pokemon6 = excluded.pokemon6
    `,
    ).run({
        user_id: userId,
        pokemon1: team.pokemon1,
        pokemon2: team.pokemon2,
        pokemon3: team.pokemon3,
        pokemon4: team.pokemon4,
        pokemon5: team.pokemon5,
        pokemon6: team.pokemon6,
    });
}

function deleteTeam(userId) {
    db.prepare(
        `
        DELETE FROM pokemon_teams
        WHERE user_id = ?
    `,
    ).run(userId);
}

function format(team) {
    const lines = [];

    for (let i = 1; i <= 6; i++) {
        const id = team[`pokemon${i}`];

        if (!id) {
            lines.push("*(Vacío)*");
            continue;
        }

        const pokemon = pokedex.getById(id);

        if (!pokemon) {
            lines.push(`❔ #${id}`);
            continue;
        }

        const emoji = pokemonEmojis[id] ?? "";
        lines.push(`${emoji} ${pokemon.name}`);
    }

    return lines.join("\n");
}

module.exports = {
    get,
    save,
    delete: deleteTeam,
    format,
};