const pokedex$$ = document.body.querySelector('#pokedex');
const search$$ = document.body.querySelector('.search');
const types$$ = document.body.querySelector('.types');
const input$$ = document.createElement('input');
input$$.placeholder = 'Search Pokémon...'

const arena$$ = document.body.querySelector('.arena');
const userBar$$ = document.createElement('div');
const rivalBar$$ = document.createElement('div');
const battleText$$ = document.createElement('div');
battleText$$.className = 'textBattle';

let battlers = [];
let fighting = false;
const defaultLevel = 30;

const clearFilter$$ = document.createElement('button');
let pokedex = [];
let filteredName = [];
let filteredType = [];
let types = [];
let movements = [];

let firstAttacker, secondAttacker;
let user,rival;

const getTypeInfo = (url) => {
    fetch(url)
        .then(res2 => res2.json())
        .then((myJson2) => {
            const type = {
                name: myJson2.name,
                debilities: myJson2.damage_relations.double_damage_from.map(type => type.name),
                resistances: myJson2.damage_relations.half_damage_from.map(type => type.name),
                inmunities: myJson2.damage_relations.no_damage_from.map(type => type.name)
            }
            types.push(type);
    });
}

const getTypes = async() => {
    const res = await fetch('https://pokeapi.co/api/v2/type/');
    const resTypes = await res.json();
    for(let i=0;i<resTypes.results.length;i++) {
        getTypeInfo(resTypes.results[i].url);
    }
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
            sprite_front: details.sprites.front_default,
            sprite_back: details.sprites.back_default,
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

const getBattler = (specie) => {
    let moves = function() {
        let i=0;
        let nameMoves = movesNames(specie.moves);
        let array = [];
        //console.log(nameMoves);
        do {
            array.push(nameMoves[i]);
            i++;
        } while(i < nameMoves.length && i<4);
        return array;
    }

    const battler = {
        name: specie.name,
        types: specie.types,
        stats: specie.stats.map((stat) => Math.round(((2*stat*defaultLevel)/100) + 5)),
        moveset: moves(),
        moves: specie.moves
    };
    battler.currentPS = battler.stats[0];

    return battler;
}

const getPriority = (user,rival) => {
    firstAttacker = user;
    secondAttacker = rival;
    if((rival.stats[5] > user.stats[5]) || ((rival.stats[5] == user.stats[5]) && Math.random() > 0.5)) {
        firstAttacker = rival;
        secondAttacker = user;
    }
}

const hasStab = (attacker, move) => {
    if (attacker.types.includes(move.type)) {
        return 1.5;
    }
    return 1.0;
}

const getEffectiveness = (defender, move) => {
    let eff = 1.0;
    const moveType = move.type;

     for(let i=0;i<defender.types.length;i++) {
        let currentType = types.find((type) => type.name == defender.types[i]);
        if(currentType.debilities.includes(moveType)) {
            eff *= 2.0;
        } 
        if(currentType.resistances.includes(moveType)) {
            eff *= 0.5;
        } 
        if(currentType.inmunities.includes(moveType)) {
            eff *= 0.0;
        }
     }

     return eff;
} 

const addText = (text) => {
    const dialogue$$ = document.createElement('p');
    dialogue$$.textContent = text;
                
    if(battleText$$.childElementCount === 4) {
        battleText$$.firstChild.remove();
    }
    battleText$$.appendChild(dialogue$$);
}

const finishFight = () => {
    console.log('finish');
    battlers = [];
    fighting = false;
}

const randomNumberBetween = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const useMove = (attacker, defender, attackerMove) => {
    const link = attacker.moves.find((move) => move.move.name === attackerMove)//.move.url;
    fetch(link.move.url)
        .then(res => res.json())
        .then((myJson) => {
            const move = {
                name: myJson.name,
                accuracy: myJson.accuracy,
                type: myJson.type.name,
                power: myJson.power,
                category: myJson.damage_class.name
            }
            let damage = 0;
            let hit = Math.random() <= move.accuracy/100 && move.power > 0 && move.category != "status";

            let attack, defense;
            if(move.category == 'physical') {
                attack = attacker.stats[1];
                defense = defender.stats[2];
            } else if(move.category == 'special') {
                attack = attacker.stats[3];
                defense = defender.stats[4];
            }

            if(hit) {
                let eff = getEffectiveness(defender,move);
                damage = Math.floor((0.01*hasStab(attacker,move)*randomNumberBetween(85,101)*eff)*((((defaultLevel*0.2+1)*attack*move.power)/(25*defense))+2));
                if(damage == 0) damage = 1;
                addText(attacker.name + " used " + attackerMove + "! " + defender.name + " loses " + damage + " PS!");
                console.log(attacker.name + " used " + attackerMove + "! " + defender.name + " loses " + damage + " PS!")
            } else {
                addText(attacker.name + " used " + attackerMove + "! But if failed!");
            }
            defender.currentPS -= damage;
            if(defender.currentPS < 0) {
                defender.currentPS = 0;
            }
            if(defender.name == user.name) {
                userBar$$.style.width = (user.currentPS/user.stats[0])*100+'%';
            }
            if(defender.name == rival.name) {
                rivalBar$$.style.width = (rival.currentPS/rival.stats[0])*100+'%';
            }
            if(defender.currentPS <= 0) {
                addText(defender.name + " fainted! " + attacker.name + " is the winner!");
                setTimeout(finishFight, 2000);
            }
     });
} 

const turn = (user,rival,event) => {
    if(fighting) {
        getPriority(user,rival);
        let rivalMove = rival.moveset[Math.floor(Math.random()*rival.moveset.length)];
    
        let firstMove = event.target.textContent;
        let secondMove = rivalMove;

        if(firstAttacker == rival) {
            firstMove = rivalMove;
            secondMove = event.target.textContent;
        }
        useMove(firstAttacker, secondAttacker, firstMove);
        if(fighting) {
            useMove(secondAttacker, firstAttacker, secondMove);
        }
    }
}

const closeCombat = () => {
    arena$$.innerHTML = '';
    arena$$.style.display = 'none';
    for(const child of pokedex$$.children) {
        console.log(child);
        child.setAttribute('fighting','no');
        if(child.classList.contains('selected')) {
            child.classList.toggle('selected');
        }
    } 
}

const initFight = (battlers) => {
    fighting = true;
    user = getBattler(battlers[0]);
    rival = getBattler(battlers[1]);
    
    const userSide$$ = document.createElement('div');
    userSide$$.className = 'side';
    const rivalSide$$ = document.createElement('div');
    rivalSide$$.className = 'side';

    const userMoves$$ = document.createElement('div');
    const user$$ = document.createElement('img');
    user$$.setAttribute('src',battlers[0].sprite_back);
    
    userBar$$.className = 'userBar';
    userBar$$.style.width = (user.currentPS/user.stats[0])*100+'%';

    const rival$$ = document.createElement('img');
    rival$$.setAttribute('src',battlers[1].sprite_front);
    rivalBar$$.className = 'userBar';
    rivalBar$$.style.width = (rival.currentPS/rival.stats[0])*100+'%';

    userSide$$.appendChild(user$$);
    userSide$$.appendChild(userBar$$);
    userSide$$.appendChild(userMoves$$);
    rivalSide$$.appendChild(rivalBar$$);
    rivalSide$$.appendChild(rival$$);

    arena$$.style.display = 'inline-block';
    arena$$.appendChild(rivalSide$$);
    arena$$.appendChild(userSide$$);
    arena$$.appendChild(battleText$$);
    
    for(move of user.moveset) {
        const move$$ = document.createElement('button');
        move$$.textContent = move;
        move$$.className = 'moveButton';

        userMoves$$.appendChild(move$$);
        const moveButtons$$ = document.body.querySelectorAll('.moveButton');
        console.log(moveButtons$$);

        userMoves$$.addEventListener('click', (event) => {
            turn(user,rival,event);
        });
    }
    
    finishBtn$$ = document.createElement('button');
    finishBtn$$.textContent = 'Finish battle';
    arena$$.appendChild(finishBtn$$);

    finishBtn$$.addEventListener('click',closeCombat); 
}

const setFight = (event) => {
    let card = event.target.parentElement.parentElement;
    card.classList.toggle('selected');
    if(card.getAttribute('fighting') == 'no') {
        card.setAttribute('fighting','yes');
        let battler = pokedex.find((poke) => poke.name == card.getAttribute('pokemon'));
        battlers.push(battler);
        if(battlers.length >= 2) {
            initFight(battlers);
        }
    } else {
        card.setAttribute('fighting','no');
        let index = battlers.indexOf(battlers.find((bat) => bat.name == card.getAttribute('pokemon')));
        if (index !== -1) {
            battlers.splice(index, 1);
        }
    }

}

function sortTable(table) {
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[0];
        y = rows[i + 1].getElementsByTagName("td")[0];
        if (Number(x.innerHTML) > Number(y.innerHTML)) {
            shouldSwitch = true;
            break;
        }     
      }
      if (shouldSwitch) {
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

        const fightButton$$ = document.createElement('button');
        fightButton$$.textContent = 'FIGHT!';

        fightButton$$.className = 'fight_button';
        cardFront$$.appendChild(fightButton$$);

        cardBack$$.appendChild(moveTable$$);

        pokedex$$.appendChild(card$$);

        fightButton$$.addEventListener('click',setFight);

        card$$.setAttribute('pokemon',pokemon.name);
        card$$.setAttribute('fighting','no');
        card$$.addEventListener('click', function() {
            if(card$$.getAttribute('fighting') == 'no') card$$.classList.toggle('is-clicked');
        });
    }
}


input$$.addEventListener('input',searchNamePokemon);

getPokemon(151);