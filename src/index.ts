import p5 from 'p5';
import { ParticleSetup } from './DemoScene/ParticleSetup';
import { FlowStream } from './FlowStream/FlowStream';

interface SketchType {
    [key: string]: Array<any>;
}

enum types {
    'ParticleSetup' = 'ParticleSetup',
    'FlowStream' = 'FlowStream'
}

const sketchTypes: SketchType = {
    'ParticleSetup': [
        (p: p5): ParticleSetup => { return new ParticleSetup(p) }
    ],
    'FlowStream': [
        (p: p5): FlowStream => { return new FlowStream(p) }
    ]
}


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



const createSketch = (type: string) => {
    sketchType = type
    sk = new p5(sketch)
}

const clearSketch = () => {
    sketchRef.destroy();
    sk.remove();

}

createSketch(types.FlowStream);

// setTimeout(() => { clearSketch() }, 5000)

