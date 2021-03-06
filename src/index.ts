import p5 from 'p5';
import {ParticleSetup} from './DemoScene/ParticleSetup';
import {FlowStream} from './FlowStream/FlowStream';
import {FieldSketch} from './ElectricField/FieldSketch';
import {PotentialFieldSketch} from './PotentialField/PotentialFieldSketch';
import {sketches, sketchData} from './sketches';
import {CurlNoiseFieldSketch} from './CurlNoiseField/CurlNoiseFieldSketch';
import {ParamFieldSketch} from './ParamField/ParamFieldSketch';
import {isMobileDevice} from './Common/DeviceHelper';
import {ImageBasedFieldSketch} from "./ImageBasedField/ImageBasedFieldSketch";

// import Route from 'route-parser';

interface SketchType {
    [key: string]: Array<any>;
}

enum types {
    'ParticleSetup' = 'ParticleSetup',
    'FlowStream' = 'FlowStream',
    'FieldSketch' = 'FieldSketch',
    'PotentialFieldSketch' = 'PotentialFieldSketch',
    'CurlNoiseFieldSketch' = 'CurlNoiseFieldSketch',
    'ImageBasedFieldSketch' = 'ImageBasedFieldSketch',
    'ParamFieldSketch' = 'ParamFieldSketch'
}

const sketchTypes: SketchType = {
    'ParticleSetup': [
        (p: p5): ParticleSetup => {
            return new ParticleSetup(p)
        }
    ],
    'FlowStream': [
        (p: p5): FlowStream => {
            return new FlowStream(p)
        }
    ],
    'FieldSketch': [
        (p: p5): FieldSketch => {
            return new FieldSketch(p)
        }
    ],
    'PotentialFieldSketch': [
        (p: p5): PotentialFieldSketch => {
            return new PotentialFieldSketch(p)
        }
    ],
    'CurlNoiseFieldSketch': [
        (p: p5): CurlNoiseFieldSketch => {
            return new CurlNoiseFieldSketch(p)
        }
    ],
    'ImageBasedFieldSketch': [
        (p: p5): ImageBasedFieldSketch => {
            return new ImageBasedFieldSketch(p)
        }
    ],
    'ParamFieldSketch': [
        (p: p5): ParamFieldSketch => {
            return new ParamFieldSketch(p)
        }
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

    sketch = getSketch(p);
    sketchRef = sketch;

    p.preload = (): void => {
        sketch.preload()
    };

    p.setup = (): void => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.frameRate(60)
        sketch.setup()
    };


    p.draw = (): void => {
        sketch.tick()
        const yPosBar = isMobileDevice() ? p.windowHeight - 32 : 10;
        const xPosBar = isMobileDevice() ? 220 : 130;
        const ts = p.frameRate() / 60;
        p.noStroke()
        p.colorMode(p.HSL, 1)
        const bgColor = p.color(.0, .0, .4, .9)
        p.fill(bgColor)
        p.rect(xPosBar, yPosBar, 100, 10)
        const barColor = p.color(ts / 2, .5, .5, .9)
        p.fill(barColor)
        p.rect(xPosBar, yPosBar, 80 * ts, 10)
        p.colorMode(p.RGB, 255)
    };
};

const toggleRun = (running: boolean) => {
    if (running) {
        iconContainer.style.display = 'none'
        isMobileDevice() ? ui.style.display = 'block' : ui.style.top = '0px'
        console.log('toggleRun', running, isMobileDevice())
    } else {
        iconContainer.style.display = 'flex'
        isMobileDevice() ? ui.style.display = 'none' : ui.style.top = '-30px'
        togglePlay.classList.remove('play-icon')
        togglePlay.classList.add('pause-icon')
        sketchPlaying = true
    }
}

const createSketch = (type: string) => {
    sketchType = type
    // const route: string = '/' + sketchType;
    // window.history.pushState("", "pSketches", route);
    toggleRun(true)
    sk = new p5(sketch)
}

const clearSketch = () => {
    // window.history.pushState("", "pSketches", '/');
    sketchRef.destroy();
    sk.remove();
    toggleRun(false)
}

// https://gist.github.com/cobyism/4730490

// TOOD add hisory change event / set ui visibility on match ...
// https://developer.mozilla.org/de/docs/Web/API/WindowEventHandlers/onpopstate
// const route = new Route('http://localhost:1234/:sketchType')
// console.log(window.location.href)
// const match = route.match(window.location.href)
// if (match) {
//     console.log(match.sketchType)
//     createSketch(match.sketchType)
// } else {
//     console.log('nope')
// }


const initUI = () => {

    iconContainer.setAttribute('class', 'sketchContainer');
    document.body.appendChild(iconContainer);

    ui.setAttribute('class', 'ui')
    if (isMobileDevice()) {
        ui.style.display = 'none'
        ui.style.bottom = '0'
    } else {
        ui.style.top = '-30px'
    }

    isMobileDevice() ? close.setAttribute('class', 'icon-close-mobile') : close.setAttribute('class', 'icon-close');
    close.addEventListener('click', clearSketch)

    isMobileDevice() ? togglePlay.setAttribute('class', 'icon-toggle-mobile') : togglePlay.setAttribute('class', 'icon-toggle');
    togglePlay.classList.add('pause-icon')
    togglePlay.addEventListener('click', () => {
        sketchPlaying = !sketchPlaying;
        if (sketchPlaying) {
            togglePlay.classList.remove('play-icon')
            togglePlay.classList.add('pause-icon')
            sk.loop()
        } else {
            togglePlay.classList.remove('pause-icon')
            togglePlay.classList.add('play-icon')
            sk.noLoop()
        }
    })

    isMobileDevice() ? screenshot.setAttribute('class', 'icon-camera-mobile') : screenshot.setAttribute('class', 'icon-camera');
    screenshot.addEventListener('click', () => {
        sk.saveCanvas('sketch', 'png')
    })

    isMobileDevice() ? fullscreen.setAttribute('class', 'icon-fullscreen-mobile') : fullscreen.setAttribute('class', 'icon-fullscreen');
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

showUI ? initUI() : createSketch(types.ParamFieldSketch);
