import * as Level from './level.js'
import { Character } from './character.js';

const width = 7;
const height = 7;

const cells = [];

let player;

const items = {};
const hud = {};

const getCell = (x, y) => cells && cells[x] && cells[x][y];
const setCell = (x, y, cell) => {
    if (!cells[x]) {
        cells[x] = []
    }
    cells[x][y] = cell;
}

const setData = (x, y, data) => {
    const cell = getCell(x, y);
    if(cell){
        cell.data = data;
        const cl = cell.dom.classList;
        data.connections.east ? cl.add('e') : cl.remove('e');
        data.connections.west ? cl.add('w') : cl.remove('w');
        data.connections.north ? cl.add('n') : cl.remove('n');
        data.connections.south ? cl.add('s') : cl.remove('s');
    }
}

const playerStates = [
    'default',
    'left',
    'right',
    'up',
    'down'
]

const directionKeys = {
    up: ['w', 'arrowup'],
    left: ['a', 'arrowleft'],
    down: ['s', 'arrowdown'],
    right: ['d', 'arrowright'],
}

const setPlayerState = (state) => {    
    if(!state){
        if(directionKeys[player.state] && directionKeys[player.state].find(key => isDown[key])){
            return;
        }
        state = playerStates.find(candidate => directionKeys[candidate] && directionKeys[candidate].find(key => isDown[key]));
    }
    player.setState(state);
}

const playerAnimations = {
    headShake: [
        {state: 'left', duration: 100},
        {state: 'standing', duration: 100},
        {state: 'right', duration: 100},
        {state: 'standing', duration: 100},
        {state: 'left', duration: 100},
        {state: 'standing', duration: 100}
    ],
    nod: [
        {state: 'up', duration: 100},
        {state: 'standing', duration: 100},
        {state: 'down', duration: 100},
        {state: 'standing', duration: 100},
        {state: 'up', duration: 100},
        {state: 'standing', duration: 100},
        {state: 'down', duration: 100},
        {state: 'standing', duration: 100}
    ]
}

const movePlayer = () => {
    if(player.animating){
        return;
    }

    switch (player.state) {
        case 'up':
            if(getCell(player.x, player.y).data.connections.north){
                player.set(player.x, player.y - 1, 'up');
            } else {
                player.startAnimation('headShake');
            }
            break;
        case 'down':
            if(getCell(player.x, player.y).data.connections.south){
                player.set(player.x, player.y + 1, 'down');
            } else {
                player.startAnimation('headShake');
            }
            break;
        case 'left':
            if(getCell(player.x, player.y).data.connections.west){
                player.set(player.x - 1, player.y, 'left');
            } else {
                player.startAnimation('headShake');
            }
            break;
        case 'right':
            if(getCell(player.x, player.y).data.connections.east){
                player.set(player.x + 1, player.y, 'right');
            } else {
                player.startAnimation('headShake');
            }
            break;
        default:
    }
}

const afterPlayerMove = () => {    
    const cellData = getCell(player.x, player.y).data;
    if(items.coins < 7 && cellData.item && cellData.item.state === 'coin'){
        cellData.item.destroy();
        delete cellData.item;
        hud.coins[items.coins].dom.classList.remove('empty');
        items.coins++;
    }
}

const buyItem = () => {
    const cellData = getCell(player.x, player.y).data;
    if(cellData.item && cellData.item.state !== 'coin' && items.coins > 0){
        const type = cellData.item.state;
        const plural = type + 's';
        if(items[plural] < 7){
            items.coins--;
            hud.coins[items.coins].dom.classList.add('empty');
            hud[plural][items[plural]].dom.classList.remove('empty');
            items[plural]++;
        }
    }
}

const bindings = {
    down: {
        'w' : () => setPlayerState('up'),
        'arrowup' : () => setPlayerState('up'),
        'a' : () => setPlayerState('left'),
        'arrowleft' : () => setPlayerState('left'),
        's' : () => setPlayerState('down'),
        'arrowdown' : () => setPlayerState('down'),
        'd' : () => setPlayerState('right'),
        'arrowright' : () => setPlayerState('right'),
        ' ' : movePlayer,
        'b': buyItem
    },
    up: {
        'w' : setPlayerState,
        'arrowup' : setPlayerState,
        'a' : setPlayerState,
        'arrowleft' : setPlayerState,
        's' : setPlayerState,
        'arrowdown' : setPlayerState,
        'd' : setPlayerState,
        'arrowright' : setPlayerState
    }
}

const isDown = {};
const onkeydown = (ev) => {
    const key = ev.key.toLowerCase();
    if(isDown[key]){
        return;
    }

    isDown[key] = true;
    if(bindings.down[key]){
        bindings.down[key]();
    }
}

const onkeyup = (ev) => {
    const key = ev.key.toLowerCase();
    if(!isDown[key]){
        return;
    }

    isDown[key] = false;
    if(bindings.up[key]){
        bindings.up[key]();
    }
}

const init = () => {
    const table = document.getElementById('table');    
    for(let y = 0; y < height; y++){    
        const tr = document.createElement('tr');
        table.appendChild(tr);
        for(let x = 0; x < width; x++){
            const td = document.createElement('td');
            tr.appendChild(td);
            const cell = {
                x, y,
                dom: td,
                data: {x, y, connections: {}}
            }
            setCell(x, y, cell);
        }
    }

    const charactersDiv = document.getElementById('characters');
    player = new Character(3, 3, playerAnimations, charactersDiv, 'player');
    player.addAnimCompleteHandler(setPlayerState);
    player.dom.addEventListener('transitionend', afterPlayerMove);

    const itemTypes = ['heart', 'coin', 'sword', 'shield'];
    itemTypes.forEach(type => {
        const plural = type + 's';
        items[plural] = 0;
        const container = document.getElementById(plural);
        hud[plural] = [];        
        for(let i = 0; i < 7; i ++){
            const dom = document.createElement('div');
            dom.classList.add('hudItem');
            dom.classList.add(type);
            dom.classList.add('empty');
            container.appendChild(dom);
            hud[plural].push({
                dom,
                empty: true,
            });
        }
    })

    document.addEventListener('keydown', onkeydown);
    document.addEventListener('keyup', onkeyup);
}

const makeLevel = () => {
    const charactersDiv = document.getElementById('characters');

    const level = Level.generate(width, height);
    for(let x = 0; x < level.length; x++){
        for(let y = 0; y < level[x].length; y++){
            const data = level[x][y];
            if(data.special){
                const special = data.special;
                delete data.special;
                if(special.item){
                    data.item = new Character(x, y, [], charactersDiv, 'item', special.item);
                }
            }
            setData(x, y, data);
        }
    }

    player.set(level.startRoom.x, level.startRoom.y);
}

const onload = () => {
    init();    
    makeLevel();
}

if (document.readyState === 'complete') {
    onload();
} else {
    window.addEventListener('load', onload);
}
