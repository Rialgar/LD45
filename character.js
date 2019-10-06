export class Character {

    constructor(x, y, animations, domParent, classes, state = 'default'){
        this.animations = animations;
        this.animating = false;
        this.animQueue = [];

        this.classes = classes;
        this.dom = document.createElement('div');
        domParent.appendChild(this.dom);

        this.set(x, y, state);
    }

    destroy(){
        if(this.animating){
            this.stopAnimation();
        }
        this.dom.parentElement.removeChild(this.dom);
    }

    set(x, y, state = 'default'){
        this.x = x;
        this.y = y;
        this.state = state;

        this.dom.style.setProperty('--pos-x', x);
        this.dom.style.setProperty('--pos-y', y); 

        this.dom.className = '';
        this.dom.classList.add('character');
        this.dom.classList.add(... this.classes);
        this.dom.classList.add(state);

        if(state === 'default' && this.animations.idle){
            this.startAnimation('idle');
        };
    }

    setState(state, fromAnim = false){
        if(this.animating && this.currentAnimation !== 'idle' && !fromAnim){
            return;
        }
        this.set(this.x, this.y, state);
    }    

    nextFrame(){
        const frame = this.animQueue.shift();        
        if(frame){
            this.setState(frame.state, true);
            this.animTimeout = window.setTimeout(() => this.nextFrame(), frame.duration);
        } else if(this.currentAnimation === 'idle') {
            this.currentAnimation = '';
            this.startAnimation('idle');
        } else {
            this.stopAnimation();
            this.animCompleteHandler && this.animCompleteHandler(this.currentAnimation);
        }
    }

    startAnimation(name){
        if(this.currentAnimation === name){
            return;
        }
        this.animating = true;
        this.currentAnimation = name;
        this.animQueue = [...this.animations[name] || []];
        this.nextFrame();
    }

    stopAnimation(){
        if(this.animTimeout){
            window.clearTimeout(this.animTimeout);
            this.animTimeout = false;
        }
        delete this.currentAnimation;
        this.animating = false;
        this.animQueue = [];        
    }

    addAnimCompleteHandler(func){
        this.animCompleteHandler = func;
    }
}