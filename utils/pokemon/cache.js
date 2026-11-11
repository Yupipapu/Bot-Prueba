class PokemonCache {
    constructor() {
        this.byId = new Map();
        this.byName = new Map();
    }

    add(pokemon) {
        this.byId.set(pokemon.id, pokemon);
        this.byName.set(pokemon.name.toLowerCase(), pokemon);
    }

    getById(id) {
        return this.byId.get(id);
    }

    getByName(name) {
        return this.byName.get(name.toLowerCase());
    }

    search(query) {
        query = query.toLowerCase();
        return [...this.byName.values()]
            .filter(pokemon => pokemon.name.startsWith(query))
            .slice(0, 25);
    }

    clear() {
        this.byId.clear();
        this.byName.clear();
    }

    size() {
        return this.byId.size;
    }
}

module.exports = new PokemonCache();