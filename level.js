import { randomElement, shuffle, leftPad, flattenOnce } from './util.js';
import { monsterAnims } from './monsters.js';

export const generate = (width, height) => {

    const groups = [];
    const rooms = [];
    const flatRooms = [];

    const print = () => {
        let out = "";
        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                //out += leftPad(groups.indexOf(rooms[x][y].group), 2) + '|';
                out += leftPad(rooms[x][y].distance, 2) + '|';
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

    const getConnectedNeighbours = (room) => {
        const {x, y} = room;
        return [
            room.connections.west ? getRoom(x-1, y) : null,
            room.connections.east ? getRoom(x+1, y) : null,
            room.connections.north ? getRoom(x, y-1) : null,
            room.connections.south ? getRoom(x, y+1) : null
        ].filter(room => !!room)
    };

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

    const calculateDistances = () => {
        flattenOnce(rooms).forEach(room => {
            delete room.distance;
        });
        rooms.startRoom.distance = 0;
        let furthestRoom = rooms.startRoom;
        const roomsToProcess = [rooms.startRoom];
        while(roomsToProcess.length > 0){
            const room = roomsToProcess.pop();
            if(room.distance > furthestRoom.distance){
                furthestRoom = room;
            }
            const neighbours = getConnectedNeighbours(room).filter(n => typeof n.distance === 'undefined');
            neighbours.forEach(n => n.distance = room.distance + 1);
            roomsToProcess.push(...neighbours);
        }
        return furthestRoom;
    }

    const getCloserRooms = room => {
        const out = [];
        const roomsToProcess = getConnectedNeighbours(room).filter(n => n.distance < room.distance);
        while(roomsToProcess.length > 0){
            const next = roomsToProcess.pop();
            out.push(next);
            const neighbours = getConnectedNeighbours(next).filter(n => n !== room && out.indexOf(n) < 0);
            roomsToProcess.push(...neighbours);
        }
        return out;
    }

    const isFree = room => !room.special
    const freeRooms = (arr = flatRooms, condition = ()=>true ) => arr.filter(room => isFree(room) && condition(room));
    const getFreeRoom = (arr = flatRooms, condition = ()=>true ) => randomElement(freeRooms(arr, condition));

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

    flatRooms.push(...flattenOnce(rooms));
    
    const shops = ['heart', 'shield', 'sword'].map(item => ({item}));
    const coin = {item: 'coin'};
    const monsters = ['slime', 'knight', 'king'].map(monster => ({monster}));    

    let coinsLeft = 8;

    let furthestRoom = {distance:0};
    let attempt = -1;
    while(furthestRoom.distance < 20 - attempt){
        attempt++;
        const startRoom = randomElement(randomElement(rooms));
        rooms.startRoom = startRoom;

        furthestRoom = calculateDistances();
    }
    rooms.startRoom.special = 'start';
    furthestRoom.special = monsters.pop();    
    
    const knightRoom = getFreeRoom( undefined, room =>
        room.distance > Math.max(6, furthestRoom.distance / 3) &&
        room.distance < furthestRoom.distance - 3 &&
        getConnectedNeighbours(room).length > 1
    );
    knightRoom.special = monsters.pop();
    
    const beforeKnight = getCloserRooms(knightRoom);
    
    const slimeRoom = getFreeRoom(beforeKnight, room =>
        room.distance < knightRoom.distance - 2 &&
        room.distance > 2 &&
        getConnectedNeighbours(room).length > 1
    );
    slimeRoom.special = monsters.pop();

    const beforeSlime = getCloserRooms(slimeRoom);
    const behindKnight = flatRooms.filter(room => room != knightRoom && beforeKnight.indexOf(room) < 0);
    const behindSlime = flatRooms.filter(room => room != slimeRoom && beforeSlime.indexOf(room) < 0);
    const betweenSlimeAndKnight = behindSlime.filter(room => beforeKnight.indexOf(room) >= 0);
    const beforeAll = beforeSlime.filter(room => beforeKnight.indexOf(room) >= 0);
    
    getFreeRoom(beforeAll).special = shops.pop();    
    getFreeRoom(beforeAll).special = {...coin};
    coinsLeft--;

    const randomShops = shuffle(shops);

    getFreeRoom(betweenSlimeAndKnight).special = randomShops.pop();    
    if(freeRooms(betweenSlimeAndKnight).length > 0){
        getFreeRoom(betweenSlimeAndKnight).special = {...coin};
        coinsLeft--;
    }

    getFreeRoom(behindKnight).special = randomShops.pop();
    if(freeRooms(behindKnight).length > 0 ){
        getFreeRoom(behindKnight).special = {...coin};
        coinsLeft--;
    }
    
    while(coinsLeft > 0){
        getFreeRoom().special = {...coin};
        coinsLeft--;
    }

    return rooms;
}