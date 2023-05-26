const pokedex$$ = document.body.querySelector('#pokedex');
const search$$ = document.body.querySelector('.search');
const types$$ = document.body.querySelector('.types');
const input$$ = document.createElement('input');
const clearFilter$$ = document.createElement('button');
let pokedex = [];
let filteredName = [];
let filteredType = [];

const getTypes = async() => {
    const res = await fetch('https://pokeapi.co/api/v2/type/');
    const resTypes = await res.json();
    printTypes(resTypes.results);
}

const printTypes = (types) => {
    for(let i=0;i<18;i++) {
        const type$$ = document.createElement('img');
        let url = 'src/'+ types[i].name + '.png';
        type$$.setAttribute('src',url);
        type$$.setAttribute('status','deselected');
        type$$.setAttribute('name', types[i].name);
        type$$.className = 'type-img';
        types$$.appendChild(type$$);

        type$$.addEventListener('click',filterType);
    }
} 

const getPokemon = async(numPokemon) => {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon/?limit='+numPokemon);
    const resPokemon = await res.json();
    getDetailPokemon(resPokemon.results);
}

const getDetailPokemon = async(pokemonlist) => {
    const pokemonPromises = pokemonlist.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    const detailsPokemon = await Promise.all(pokemonPromises);
    for(details of detailsPokemon) {
        const pokemonSpecie = {
            name: details.name,
            sprite: details.sprites.front_default,
            types: details.types.map((type) => type.type.name),//.join(', '),
            stats: details.stats.map((stat) => stat.base_stat), // hp, attack, defense, sp-attack, sp-defense, speed
            abilities: details.abilities.map((ability) => ability.ability.name),
            weight: details.weight,
            height: details.height,
            id: details.id
        }
        pokedex.push(pokemonSpecie);
    }
    filteredName = pokedex;
    filteredType = pokedex;
    printPokedex(pokedex);
    getTypes();
    input$$.className = 'search__input';
    search$$.appendChild(input$$);
}

const filterType = (event) => {
    if(event.target.className !== 'type-img type-img--disabled') {
        pokedex$$.innerHTML= '';
        if(event.target.getAttribute('status') === 'deselected') {
            for (const child of event.target.parentElement.children) {
                if(child != event.target) {
                    child.className = 'type-img type-img--disabled';
                }
            }

            let type = event.target.getAttribute('name');
            event.target.setAttribute('status','selected');
            filteredType = filteredName.filter((pokemon) => pokemon.types.includes(type));
            if(filteredType.length === 0) {
                pokedex$$.innerHTML = 'Not even a nibble...';
            } else {
                printPokedex(filteredType);
            }
        } else {
            filteredType = pokedex;
            printPokedex(pokedex);
            event.target.setAttribute('status','deselected');
            for (const child of event.target.parentElement.children) {
                child.className = 'type-img';
            }
        }
    }
}

const searchNamePokemon = (event) => {
    pokedex$$.innerHTML= '';
    const value = event.target.value.toLowerCase();
    filteredName = filteredType.filter((pokemon) => pokemon.name.toLowerCase().includes(value));
    if(value === "") {
        filteredName = filteredType;
    }
    if(filteredName.length === 0) {
        pokedex$$.innerHTML = 'Not even a nibble...';
    } else {
        printPokedex(filteredName);
    }
}

const printPokedex = (pokedex) => {
    for(pokemon of pokedex) {
        //console.log(pokemon);
        //console.log(pokedex);
        const card$$ = document.createElement('li');
        card$$.className = 'card';

        const cardFront$$ = document.createElement('div');
        cardFront$$.className = 'card-face card-front';
        const cardBack$$ = document.createElement('div');
        cardBack$$.className = 'card-face card-back';

        card$$.appendChild(cardFront$$);
        card$$.appendChild(cardBack$$);
        // name
        const name$$ = document.createElement('h3');
        name$$.textContent = '#' + pokemon.id + ' ' + pokemon.name;
        name$$.className = 'card-title';
        cardFront$$.appendChild(name$$);

        // image
        const img$$ = document.createElement('img');
        img$$.setAttribute('src',pokemon.sprite);
        img$$.className = 'card-image';
        cardFront$$.appendChild(img$$);

        // types
        for(let j=0;j<pokemon.types.length;j++) {
            const type$$ = document.createElement('p');
            type$$.textContent = pokemon.types[j].toUpperCase();
            type$$.className = 'card-subtitle card-subtitle--' + pokemon.types[j];
            card$$.className += ' card--' + pokemon.types[0];
            cardFront$$.appendChild(type$$);
        }

        // abilities
        for(let j=0;j<pokemon.abilities.length;j++) {
            const ability$$ = document.createElement('p');
            ability$$.textContent = pokemon.abilities[j].toUpperCase();
            ability$$.className = 'card-ability';
            cardBack$$.appendChild(ability$$);
        }

        pokedex$$.appendChild(card$$);

        card$$.addEventListener('click', function() {
            card$$.classList.toggle('is-clicked');
        });
    }
}

input$$.addEventListener('input',searchNamePokemon);

getPokemon(151);