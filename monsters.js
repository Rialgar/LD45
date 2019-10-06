const idle = [
    {state: 'default', duration: 500},
    {state: 'bounce', duration: 500}
];

const deathAnim = length => {
    const out = [{state: 'bounce', duration: 200}];
    for(let i = 1; i < length; i++){
        out.push({state: `death${i}`, duration: 200});
    }
    return out;
}

export const monsterAnims = {
    slime: {idle, death: deathAnim(5)},
    knight: {idle, death: deathAnim(5)},
    king: {idle, death: deathAnim(12)}
}

export const monsterStats = {
    slime: {
        hp: 1,
        att: 1,
        def: 0
    },
    knight: {
        hp: 4,
        att: 1,
        def: 0
    },
    king: {
        hp: 4,
        att: 4,
        def: 1
    }
}