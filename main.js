import * as Level from './level.js'

const width = 7;
const height = 7;

const cells = [];

const player = {};

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
    'standing',
    'left',
    'right',
    'up',
    'down'
]

const setPlayer = (x, y, state = 'standing') => {
    player.x = x;
    player.y = y;
    player.state = state;
    player.dom.style.setProperty('--pos-x', x);
    player.dom.style.setProperty('--pos-y', y);    
    playerStates.forEach(st => player.dom.classList.remove(st));
    player.dom.classList.add(state);
}

const directionKeys = {
    up: ['w', 'arrowup'],
    left: ['a', 'arrowleft'],
    down: ['s', 'arrowdown'],
    right: ['d', 'arrowright'],
}

const setPlayerState = state => {
    if(!state){
        if(directionKeys[player.state] && directionKeys[player.state].find(key => isDown[key])){
            return;
        }
        state = playerStates.find(candidate => directionKeys[candidate] && directionKeys[candidate].find(key => isDown[key]));
    }
    setPlayer(player.x, player.y, state);
}

const movePlayer = () => {
    switch (player.state) {
        case 'up':
            if(getCell(player.x, player.y).data.connections.north){
                setPlayer(player.x, player.y - 1, 'up');
            }
            break;
        case 'down':
            if(getCell(player.x, player.y).data.connections.south){
                setPlayer(player.x, player.y + 1, 'down');
            }
            break;
        case 'left':
            if(getCell(player.x, player.y).data.connections.west){
                setPlayer(player.x - 1, player.y, 'left');
            }
            break;
        case 'right':
            if(getCell(player.x, player.y).data.connections.east){
                setPlayer(player.x + 1, player.y, 'right');
            }
            break;
        default:
    }
}

const bindings = {
    down: {
        'w' : setPlayerState.bind(window, 'up'),
        'arrowup' : setPlayerState.bind(window, 'up'),
        'a' : setPlayerState.bind(window, 'left'),
        'arrowleft' : setPlayerState.bind(window, 'left'),
        's' : setPlayerState.bind(window, 'down'),
        'arrowdown' : setPlayerState.bind(window, 'down'),
        'd' : setPlayerState.bind(window, 'right'),
        'arrowright' : setPlayerState.bind(window, 'right'),
        ' ' : movePlayer
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

    console.log('down', key);
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

    console.log('up', key);
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
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('character');
    playerDiv.id = 'player';
    charactersDiv.appendChild(playerDiv);
    player.dom = playerDiv;
    setPlayer(3, 3);

    document.addEventListener('keydown', onkeydown);
    document.addEventListener('keyup', onkeyup);
}

const onload = () => {
    init();

    const level = Level.generate(width, height);
    for(let x = 0; x < level.length; x++){
        for(let y = 0; y < level[x].length; y++){
            setData(x, y, level[x][y]);
        }
    }
}

if (document.readyState === 'complete') {
    onload();
} else {
    window.addEventListener('load', onload);
}
