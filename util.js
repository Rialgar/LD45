export const randomIndex = arr => Math.floor(Math.random() * arr.length)
export const randomElement = arr => arr[randomIndex(arr)];

export const shuffle = arr => {
    const input = [...arr];
    const out = [];
    while (input.length){
        const index = randomIndex(input);
        out.push(...input.splice(index, 1));
    }
    return out;
}

export const leftPad = (string, length, char = '0') => {
    let out = '' + string;
    while(out.length < length){
        out = char + out;
    }
    return out;
}