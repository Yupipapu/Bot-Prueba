const pokedex = [];

function formatName(name) {
    return name
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
}

async function load() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000");
    if (!response.ok) {
        throw new Error("No se pudo cargar la Pokédex.");
    }

    const data = await response.json();
    pokedex.length = 0;

    for (const pokemon of data.results) {
        const id = Number(
            pokemon.url.split("/").filter(Boolean).pop()
        );

        pokedex.push({
            id,
            name: formatName(pokemon.name)
        });
    }
    console.log(`✅ Pokédex cargada (${pokedex.length} Pokémon).`);
}

function search(query) {
    query = query.toLowerCase();
    return pokedex
        .filter(p => p.name.toLowerCase().includes(query))
        .slice(0, 25);
}

function getById(id) {
    return pokedex.find(p => p.id === Number(id));
}

module.exports = {
    load,
    search,
    getById
};