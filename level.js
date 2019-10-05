import { randomElement, shuffle, leftPad } from './util.js';

export const generate = (width, height) => {

    const groups = [];
    const rooms = [];

    const print = () => {
        let out = "";
        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                out += leftPad(groups.indexOf(rooms[x][y].group), 2) + '|';
            }
            out += '\n';
        }
        console.log(out);
    }

    const getRoom = (x, y) => rooms && rooms[x] && rooms[x][y];
    const getNeighbours = ({x, y}) => [
        getRoom(x-1, y),
        getRoom(x+1, y),
        getRoom(x, y-1),
        getRoom(x, y+1)
    ].filter(room => !!room);

    const connectRooms = (roomA, roomB) => {
        if (roomA.x + 1 === roomB.x) { // B is east of A
            roomA.connections.east = true;
            roomB.connections.west = true;
        } else if(roomA.x - 1 === roomB.x) { // B is west of A
            roomA.connections.west = true;
            roomB.connections.east = true;
        } else if(roomA.y - 1 === roomB.y) { // B is north of A
            roomA.connections.north = true;
            roomB.connections.south = true;
        } else if(roomA.y + 1 === roomB.y) { // B is south of A
            roomA.connections.south = true;
            roomB.connections.north = true;
        }
    }

    const fuseGroups = (groupA, groupB) => {
        groupB.border.concat(groupB.inner).forEach( room => room.group = groupA );

        groupA.inner.push(...groupB.inner);
        const formerBorder = groupA.border.concat(groupB.border);
        groupA.border = [];
        formerBorder.forEach(room => {
            const isBorder = getNeighbours(room).find(other => other.group !== groupA);
            if(isBorder){
                groupA.border.push(room);
            } else {
                groupA.inner.push(room);
            }
        });

    }

    for(let x = 0; x < width; x++){
        rooms[x] = [];
        for(let y = 0; y < height; y++){
            rooms[x][y] = {
                x, y,
                connections: {
                    east: false,
                    west: false,
                    north: false,
                    south: false
                }
            };
            const group = {
                inner: [],
                border: [rooms[x][y]]                
            };
            rooms[x][y].group = group;
            groups.push(group);
        }
    }

    while(groups.length > 1){
        const A = randomElement(groups);
        const room = randomElement(A.border);        
        const group = room.group;

        const neighbour = shuffle(getNeighbours(room)).find(other => other.group !== group);
        const otherGroup = neighbour.group

        connectRooms(room, neighbour);
        fuseGroups(group, otherGroup);
        groups.splice(groups.indexOf(otherGroup), 1);
    }

    return rooms;
}