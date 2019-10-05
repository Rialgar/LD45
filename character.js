export class Character {

    constructor(x, y, animations, domParent, clazz, state = 'default'){
        this.animations = animations;
        this.animating = false;
        this.animQueue = [];

        this.clazz = clazz;
        this.dom = document.createElement('div');
        domParent.appendChild(this.dom);

        this.set(x, y, state);
    }

    set(x, y, state = 'default'){
        this.x = x;
        this.y = y;
        this.state = state;

        this.dom.style.setProperty('--pos-x', x);
        this.dom.style.setProperty('--pos-y', y); 

        this.dom.className = '';
        this.dom.classList.add('character');
        this.dom.classList.add(this.clazz);
        this.dom.classList.add(state);
    }

    setState(state, fromAnim = false){
        if(this.animating && !fromAnim){
            return;
        }
        this.set(this.x, this.y, state);
    }    

    nextFrame(){
        const frame = this.animQueue.shift();
        if(frame){
            this.setState(frame.state, true);
            window.setTimeout(() => this.nextFrame(), frame.duration);
        } else {
            this.stopAnimation();
        }
    }

    startAnimation(name){
        this.animating = true;
        this.animQueue = [...this.animations[name] || []];
        this.nextFrame();
    }

    stopAnimation(){
        this.animating = false;
        this.setState('default');
        this.animCompleteHandler && this.animCompleteHandler();
        this.animQueue = [];
    }

    addAnimCompleteHandler(func){
        this.animCompleteHandler = func;
    }
}