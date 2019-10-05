import * as Level from './level.js'

const width = 7;
const height = 7;

const cells = [];

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

const init = (table) => {
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
}

const onload = () => {
    const table = document.getElementById('table');    
    
    init(table);
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
