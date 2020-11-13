import p5 from 'p5';
import {Particle} from './Particle'
import {SketchTemplate} from '../Common/SketchTemplate'

export class ParticleSetup extends SketchTemplate {
    particles: Particle[];

    constructor(p: p5) {
        super(p);

        this.particles = [];
    }


    setup(): void {
    }

    mousePressed(): void {
        this.addParticle(this.p.createVector(this.p.mouseX, this.p.mouseY))
    }

    private addParticle(position: p5.Vector) {
        const p = new Particle(this.p, position);
        this.particles.push(p)
    }

    onResize(): void {
        this.p.clear()
        this.p.resizeCanvas(this.p.windowWidth, this.p.windowHeight);
    }

    draw() {

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.run();
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }


}
