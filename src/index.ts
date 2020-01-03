import p5 from 'p5'
import { ParticleSetup } from './DemoScene/ParticleSetup';
import { FlowStream } from './FlowStream/FlowStream';


let sketchRef: any;
const getSketch = (p: p5) => {
    return new ParticleSetup(p)
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

    p.windowResized = (): void => {
        // p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = (): void => { sketch.tick() };
};

const s = new p5(sketch);

  // setTimeout(() => {
  //   sketchRef.destroy();
  //   s.remove();
  // }, 5000)

