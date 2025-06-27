/**
 * Pokédex Application
 * ITI-523 – Tecnologías y Sistemas Web II
 * Universidad Técnica Nacional
 */

class Pokedex {
    constructor() {
        this.currentGeneration = 1;
        this.pokemonList = [];
        this.generations = {
            1: { offset: 0, limit: 151, name: "Primera" },
            2: { offset: 151, limit: 100, name: "Segunda" },
            3: { offset: 251, limit: 135, name: "Tercera" },
            4: { offset: 386, limit: 107, name: "Cuarta" },
            5: { offset: 493, limit: 156, name: "Quinta" }
        };
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.loadPokemonList(1);
    }

    /**
     * Setup event listeners for the application
     */
    setupEventListeners() {
        const generationSelect = document.getElementById('generationSelect');
        generationSelect.addEventListener('change', (e) => {
            this.currentGeneration = parseInt(e.target.value);
            this.loadPokemonList(this.currentGeneration);
        });
    }

    /**
     * Load Pokemon list from API for a specific generation
     * @param {number} generation - Generation number (1-5)
     */
    loadPokemonList(generation) {
        const gen = this.generations[generation];
        const url = `https://pokeapi.co/api/v2/pokemon?offset=${gen.offset}&limit=${gen.limit}`;
        
        this.showLoading(true);
        
        // Using XMLHttpRequest as required
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    this.pokemonList = data.results;
                    this.renderPokemonGrid();
                } else {
                    console.error('Error loading Pokemon list:', xhr.statusText);
                    this.showError('Error al cargar la lista de Pokémon');
                    this.showLoading(false);
                }
            }
        };
        
        xhr.onerror = () => {
            console.error('Network error while loading Pokemon list');
            this.showError('Error de conexión');
            this.showLoading(false);
        };
        
        xhr.send();
    }

    /**
     * Render the Pokemon grid in the DOM
     */
    renderPokemonGrid() {
        const grid = document.getElementById('pokemonGrid');
        grid.innerHTML = '';
        
        this.pokemonList.forEach((pokemon, index) => {
            const pokemonId = this.generations[this.currentGeneration].offset + index + 1;
            const card = this.createPokemonCard(pokemon, pokemonId);
            grid.appendChild(card);
        });
        
        this.showLoading(false);
    }

    /**
     * Create a Pokemon card element
     * @param {Object} pokemon - Pokemon data from API
     * @param {number} pokemonId - Pokemon ID number
     * @returns {HTMLElement} Pokemon card element
     */
    createPokemonCard(pokemon, pokemonId) {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.onclick = () => this.showPokemonDetails(pokemon.name);
        
        const paddedId = pokemonId.toString().padStart(3, '0');
        const primaryImageUrl = `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${paddedId}.png`;
        const fallbackImageUrl = `https://img.pokemondb.net/sprites/omega-ruby-alpha-sapphire/dex/normal/${pokemon.name}.png`;
        
        card.innerHTML = `
            <img src="${primaryImageUrl}" 
                 alt="${pokemon.name}" 
                 class="pokemon-image" 
                 onerror="this.src='${fallbackImageUrl}'">
            <div class="pokemon-id">#${paddedId}</div>
            <div class="pokemon-name">${this.capitalizeFirst(pokemon.name)}</div>
        `;
        
        return card;
    }

    /**
     * Show Pokemon details in modal
     * @param {string} pokemonName - Name of the Pokemon
     */
    showPokemonDetails(pokemonName) {
        const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const pokemon = JSON.parse(xhr.responseText);
                    this.renderPokemonModal(pokemon);
                } else {
                    console.error('Error loading Pokemon details:', xhr.statusText);
                    alert('Error al cargar los detalles del Pokémon');
                }
            }
        };
        
        xhr.onerror = () => {
            console.error('Network error while loading Pokemon details');
            alert('Error de conexión al cargar los detalles');
        };
        
        xhr.send();
    }

    /**
     * Render Pokemon details in modal
     * @param {Object} pokemon - Detailed Pokemon data from API
     */
    renderPokemonModal(pokemon) {
        const modalTitle = document.getElementById('pokemonModalTitle');
        const modalBody = document.getElementById('pokemonModalBody');
        
        modalTitle.textContent = this.capitalizeFirst(pokemon.name);
        
        const paddedId = pokemon.id.toString().padStart(3, '0');
        const primaryImageUrl = `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${paddedId}.png`;
        const fallbackImageUrl = `https://img.pokemondb.net/sprites/omega-ruby-alpha-sapphire/dex/normal/${pokemon.name}.png`;
        
        // Process types
        const types = pokemon.types.map(type => {
            const typeName = type.type.name;
            return `<span class="type-badge type-${typeName}">${this.capitalizeFirst(typeName)}</span>`;
        }).join('');
        
        // Process abilities
        const abilities = pokemon.abilities.map(ability => {
            const abilityName = ability.ability.name.replace('-', ' ');
            return `<span class="ability-badge">${this.capitalizeFirst(abilityName)}</span>`;
        }).join('');
        
        // Process moves (first 10)
        const moves = pokemon.moves.slice(0, 10).map(move => {
            const moveName = move.move.name.replace('-', ' ');
            return `<span class="move-item">${this.capitalizeFirst(moveName)}</span>`;
        }).join('');
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                    <img src="${primaryImageUrl}" 
                         alt="${pokemon.name}" 
                         class="pokemon-detail-image"
                         onerror="this.src='${fallbackImageUrl}'">
                    <div class="mt-2">
                        <strong>Generation: ${this.getGenerationNumber(pokemon.id)}</strong><br>
                        <strong>Pokémon ID #${paddedId}</strong>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="detail-section">
                        <div class="detail-label">Weight:</div>
                        <div>${(pokemon.weight / 10).toFixed(1)} kgs</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Height:</div>
                        <div>${(pokemon.height / 10).toFixed(1)} mts</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Types:</div>
                        <div>${types}</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Abilities:</div>
                        <div>${abilities}</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Moves:</div>
                        <div>${moves}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal using Bootstrap
        const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
        modal.show();
    }

    /**
     * Get generation number based on Pokemon ID
     * @param {number} pokemonId - Pokemon ID
     * @returns {string} Generation number formatted
     */
    getGenerationNumber(pokemonId) {
        if (pokemonId <= 151) return '01';
        if (pokemonId <= 251) return '02';
        if (pokemonId <= 386) return '03';
        if (pokemonId <= 493) return '04';
        if (pokemonId <= 649) return '05';
        return '01';
    }

    /**
     * Show/hide loading indicator
     * @param {boolean} show - Whether to show loading
     */
    showLoading(show) {
        const loading = document.getElementById('loading');
        const grid = document.getElementById('pokemonGrid');
        
        if (show) {
            loading.style.display = 'block';
            grid.style.display = 'none';
        } else {
            loading.style.display = 'none';
            grid.style.display = 'grid';
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const grid = document.getElementById('pokemonGrid');
        grid.innerHTML = `
            <div class="col-12 text-center text-white">
                <h3>⚠️ ${message}</h3>
                <p>Por favor, intenta nuevamente más tarde.</p>
            </div>
        `;
    }

    /**
     * Capitalize first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the Pokédex when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Pokedex();
});