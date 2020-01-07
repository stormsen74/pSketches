import p5 from 'p5';
import { ParticleSetup } from './DemoScene/ParticleSetup';
import { FlowStream } from './FlowStream/FlowStream';
import { FieldSketch } from './ElectricField/FieldSketch';
import { PotentialFieldSketch } from './PotentialField/PotentialFieldSketch';
import { sketches, sketchData } from './sketches';
import { CurlNoiseFieldSketch } from './CurlNoiseField/CurlNoiseFieldSketch';

interface SketchType {
    [key: string]: Array<any>;
}

enum types {
    'ParticleSetup' = 'ParticleSetup',
    'FlowStream' = 'FlowStream',
    'FieldSketch' = 'FieldSketch',
    'PotentialFieldSketch' = 'PotentialFieldSketch',
    'CurlNoiseFieldSketch' = 'CurlNoiseFieldSketch'
}

const sketchTypes: SketchType = {
    'ParticleSetup': [
        (p: p5): ParticleSetup => { return new ParticleSetup(p) }
    ],
    'FlowStream': [
        (p: p5): FlowStream => { return new FlowStream(p) }
    ],
    'FieldSketch': [
        (p: p5): FieldSketch => { return new FieldSketch(p) }
    ],
    'PotentialFieldSketch': [
        (p: p5): PotentialFieldSketch => { return new PotentialFieldSketch(p) }
    ],
    'CurlNoiseFieldSketch': [
        (p: p5): CurlNoiseFieldSketch => { return new CurlNoiseFieldSketch(p) }
    ]
}


const iconContainer = document.createElement("SECTION");
const ui = document.createElement('div')
const close = document.createElement('div')
const togglePlay = document.createElement('div')
const screenshot = document.createElement('div')
const fullscreen = document.createElement('div')
const showUI: boolean = true;


let sketchPlaying: boolean = true
let sk: p5
let sketchType: string
let sketchRef: any

const getSketch = (p: p5) => {
    return sketchTypes[sketchType][0](p);
};

const sketch = (p: p5): void => {
    let sketch: any;

    p.preload = (): void => { };

    p.setup = (): void => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.frameRate(60)

        sketch = getSketch(p);
        sketchRef = sketch;
    };

    // @todo
    p.windowResized = (): void => {
        // p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = (): void => { sketch.tick() };
};

const toggleRun = (running: boolean) => {
    if (running) {
        iconContainer.style.display = 'none'
        ui.style.top = '0px'
    } else {
        iconContainer.style.display = 'flex'
        ui.style.top = '-30px'
        togglePlay.setAttribute('class', 'icon-pause')
        sketchPlaying = true
    }
}

const createSketch = (type: string) => {
    toggleRun(true)
    sketchType = type
    sk = new p5(sketch)
}

const clearSketch = () => {
    sketchRef.destroy();
    sk.remove();
    toggleRun(false)
}


const initUI = () => {


    iconContainer.setAttribute('class', 'sketchContainer');
    document.body.appendChild(iconContainer);

    // => init ui

    ui.setAttribute('class', 'ui')
    ui.style.top = '-30px'

    close.setAttribute('class', 'icon-close');
    close.addEventListener('click', clearSketch)

    togglePlay.setAttribute('class', 'icon-pause');
    togglePlay.addEventListener('click', () => {
        sketchPlaying = !sketchPlaying;
        if (sketchPlaying) {
            togglePlay.setAttribute('class', 'icon-pause')
            sk.loop()
        } else {
            togglePlay.setAttribute('class', 'icon-play')
            sk.noLoop()
        }
    })

    screenshot.setAttribute('class', 'icon-camera');
    screenshot.addEventListener('click', () => {
        sk.saveCanvas('sketch', 'png')
    })

    fullscreen.setAttribute('class', 'icon-fullscreen');
    fullscreen.addEventListener('click', () => {
        if (sk === undefined) return
        const fs = sk.fullscreen();
        sk.fullscreen(!fs);
    })


    ui.appendChild(close)
    ui.appendChild(togglePlay)
    ui.appendChild(screenshot)
    ui.appendChild(fullscreen)
    document.body.appendChild(ui);


    sketches.forEach((s: sketchData) => {
        const icon = document.createElement('div')
        icon.innerHTML = s.name
        icon.addEventListener('click', () => {
            createSketch(s.key);
        })

        iconContainer.appendChild(icon)
    })

}

showUI ? initUI() : createSketch(types.CurlNoiseFieldSketch);