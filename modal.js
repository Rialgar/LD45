let container, span, button, callback;
let showing = false;

const init = () => {
    container = document.getElementById('modal');
    span = document.getElementById('modalText');
    button = document.getElementById('modalButton');
    button.addEventListener('click', dismiss);
}

const show = (text, buttonText) => {
    span.textContent = text;
    button.textContent = buttonText;
    container.style.display = 'block';
    showing = true;
    return new Promise((resolve, reject) => callback = resolve);
}

const dismiss = () => {
    if(showing){
        container.style.display = 'none';
        callback && callback();
        showing = false;
    }
}

const modal = {
    init, show, dismiss
};

export default modal;