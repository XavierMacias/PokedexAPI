const pokedex$$ = document.body.querySelector('#pokedex');
const search$$ = document.body.querySelector('.search');
const types$$ = document.body.querySelector('.types');
const input$$ = document.createElement('input');
input$$.placeholder = 'Search Pokémon...'
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

const movesNames = (array) => {
    let movesNames = [];
    for(move of array) {
        let method = move.version_group_details[move.version_group_details.length-1].move_learn_method.name;
        if(method == 'level-up') {
            movesNames.push(move.move.name);
        }
    }
    return movesNames;
}

const movesLevels = (array) => {
    let levels = [];
    for(move of array) {
        let method = move.version_group_details[move.version_group_details.length-1];
        if(method.move_learn_method.name == 'level-up') {
            levels.push(method.level_learned_at);
        }
    }
    return levels;
}

const getDetailPokemon = async(pokemonlist) => {
    const pokemonPromises = pokemonlist.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    const detailsPokemon = await Promise.all(pokemonPromises);
    for(details of detailsPokemon) {
        const pokemonSpecie = {
            name: details.name,
            sprite: details.sprites.other.dream_world.front_default,
            types: details.types.map((type) => type.type.name),//.join(', '),
            stats: details.stats.map((stat) => stat.base_stat), // hp, attack, defense, sp-attack, sp-defense, speed
            abilities: details.abilities.map((ability) => { 
                if(ability.is_hidden) {
                    return ability.ability.name.replace('-', ' ') + ' (H)';
                } else {
                    return ability.ability.name.replace('-', ' ');
                }
             } ),
            moves: details.moves,
            weight: details.weight/10,
            height: details.height/10,
            id: details.id
        }
        //console.log(pokemonSpecie);
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

function sortTable(table) {
    switching = true;
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
      //start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /*Loop through all table rows (except the
      first, which contains table headers):*/
      for (i = 1; i < (rows.length - 1); i++) {
        //start by saying there should be no switching:
        shouldSwitch = false;
        /*Get the two elements you want to compare,
        one from current row and one from the next:*/
        x = rows[i].getElementsByTagName("td")[0];
        y = rows[i + 1].getElementsByTagName("td")[0];
        //check if the two rows should switch place:
        if (Number(x.innerHTML) > Number(y.innerHTML)) {
            //if so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
        }
        
      }
      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

const printPokedex = (pokedex) => {
    for(pokemon of pokedex) {
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
        const ability$$ = document.createElement('p');
        ability$$.textContent = 'Abilities: ';
        for(let j=0;j<pokemon.abilities.length;j++) {
            const hiddenAb$$ = document.createElement('span');
            ability$$.className = 'card-subtitle card-subtitle--ab';
            let ab = pokemon.abilities[j].toUpperCase();
            if(ab.endsWith('(H)')) {
                hiddenAb$$.className += ' hidden';
                hiddenAb$$.textContent += ab;
            } else {
                ability$$.textContent += ab;
                if(j<pokemon.abilities.length-1) {
                    ability$$.textContent += ", ";
                }
            }
            
            cardBack$$.appendChild(ability$$);
            cardBack$$.append(hiddenAb$$);
        }

        const stats$$ = document.createElement('div');
        stats$$.className = 'card-stat';

        // stats
        for(let j=0;j<pokemon.stats.length;j++) {
            const individualStat$$ = document.createElement('div');
            const statName$$ = document.createElement('div');

            const bar$$ = document.createElement('div');
            bar$$.style.width = pokemon.stats[j].toString()+'px';
            if(pokemon.stats[j] < 50) {
                bar$$.style.backgroundColor = 'red';
            } else if(pokemon.stats[j] < 90) {
                bar$$.style.backgroundColor = 'yellow';
            }
            bar$$.className = 'statBar';

            if(j===0) statName$$.textContent = 'HP: ';
            if(j===1) statName$$.textContent = 'Attack: ';
            if(j===2) statName$$.textContent = 'Defense: ';
            if(j===3) statName$$.textContent = 'Sp. Attack: ';
            if(j===4) statName$$.textContent = 'Sp. Defense: ';
            if(j===5) statName$$.textContent = 'Speed: ';
            
            individualStat$$.appendChild(statName$$);
            individualStat$$.appendChild(bar$$);
            individualStat$$.className = 'stats';

            stats$$.appendChild(individualStat$$);

        }

        cardBack$$.appendChild(stats$$);

        //moves
        const moveTable$$ = document.createElement('table');
        moveTable$$.className = 'move-table';
        const tableInitialRow$$ = document.createElement('tr');
        const tableHead$$ = document.createElement('thead');
        const tableBody$$ = document.createElement('tbody');

        const tableTitleMove$$ = document.createElement('th');
        tableTitleMove$$.textContent = 'Move';
        tableTitleMove$$.className = 'cellTable';
        const tableTitleLevel$$ = document.createElement('th');
        tableTitleLevel$$.textContent = 'Level';
        tableTitleLevel$$.className = 'cellTable';

        tableInitialRow$$.appendChild(tableTitleLevel$$);
        tableInitialRow$$.appendChild(tableTitleMove$$);

        tableHead$$.appendChild(tableInitialRow$$);
        moveTable$$.appendChild(tableHead$$);

        const nameMoves = movesNames(pokemon.moves);
        const levelMoves = movesLevels(pokemon.moves);
        
        moveTable$$.appendChild(tableBody$$);
        for(let j=0;j<nameMoves.length;j++) {
            const tableRow$$ = document.createElement('tr');
            const nameMove = nameMoves[j];
            let levelMove = levelMoves[j];
            if(levelMoves[j] === 0) {
                levelMove = 'Evo';
            }

            const cellMove$$ = document.createElement('td');
            cellMove$$.textContent = nameMove;
            cellMove$$.className = 'cellTable';
            const cellLevel$$ = document.createElement('td');
            cellLevel$$.textContent = levelMove;
            cellLevel$$.className = 'cellTable';

            tableBody$$.appendChild(tableRow$$);
            tableRow$$.appendChild(cellLevel$$);
            tableRow$$.appendChild(cellMove$$);
        }
        sortTable(moveTable$$);

        // height, weight
        const data$$ = document.createElement('div');
        const height$$ = document.createElement('h4');
        const weight$$ = document.createElement('h4');
        height$$.className = 'card-subtitle';
        weight$$.className = 'card-subtitle';
        height$$.textContent = 'height: ' + pokemon.height + ' m';
        weight$$.textContent = 'weight: ' + pokemon.weight + ' kg';

        data$$.appendChild(height$$);
        data$$.appendChild(weight$$);
        cardFront$$.appendChild(data$$);

        cardBack$$.appendChild(moveTable$$);

        pokedex$$.appendChild(card$$);
        card$$.addEventListener('click', function() {
            card$$.classList.toggle('is-clicked');
        });
    }
}

input$$.addEventListener('input',searchNamePokemon);

getPokemon(151);