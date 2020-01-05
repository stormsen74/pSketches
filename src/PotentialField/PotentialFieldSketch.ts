import p5 from 'p5';
import * as dat from 'dat.gui';
import { Point } from '../Common/Point';
import { BlobParticle } from '../Common/Blob';
import { Potential, PotentialField } from './PotentialField';
import { SketchTemplate } from '../Common/SketchTemplate';


export class PotentialFieldSketch extends SketchTemplate {
    p: p5
    field: PotentialField
    screenSize: Point
    blobs: BlobParticle[]
    colors: p5.Color[]
    gui: dat.GUI

    settings: {
        run: boolean
        trace: boolean
        plotField: boolean
        nBlobs: number
        curl: boolean
        epsilon: number
        strength: number
    }

    constructor(p: p5) {
        super(p)

        this.settings = {
            run: true,
            trace: true,
            plotField: false,
            nBlobs: 100,
            curl: true,
            epsilon: .0001,
            strength: 50,
        }


        this.colors = [this.p.color("#315F6B"), this.p.color("#347181"), this.p.color("#96A337"), this.p.color("#68A737"), this.p.color("#37AC39")]

        this.screenSize = new Point(this.p.windowWidth, this.p.windowHeight)

        const q1 = new Potential(this.p.createVector(this.screenSize.x * .5, this.screenSize.y * .5), this.screenSize.y * .5, 1);
        const q2 = new Potential(this.p.createVector(800, 300), 300, -1);
        const potentials = new Array<Potential>()
        potentials.push(q1, q2)

        this.field = new PotentialField(this.p, potentials);

        this.blobs = new Array<BlobParticle>();
        for (let index = 0; index < this.settings.nBlobs; index++) {
            this.addBlob();
        }

        this.initGUI();

    }

    initGUI(): void {
        this.gui = new dat.GUI({ width: 350, closed: true });
        this.gui.add(this.settings, 'run').onChange((run: boolean) => {
            run ? this.p.loop() : this.p.noLoop()
        })
        this.gui.add(this.settings, 'nBlobs', 1, 500, 1).listen()
        this.gui.add(this.settings, 'curl').listen()
        this.gui.add(this.settings, 'strength', 1, 1000, 1)
        this.gui.add(this.settings, 'plotField').listen()
        this.gui.add(this.settings, 'trace').listen()

    }


    addBlob() {
        const x = this.p.random(0, this.p.windowWidth)
        const y = this.p.random(0, this.p.windowHeight)
        const position = this.p.createVector(x, y);

        const blob = new BlobParticle(
            this.p,
            position,
            this.p.createVector(0, 0),
            position,
            this.p.random(1, 5),
            this.colors[this.p.floor(this.p.random(this.colors.length))],
            1,
            this.p.random(300, 600)
        )

        this.blobs.push(blob);
    }


    private curlField(position: p5.Vector) {
        const dx =
            this.field.getPotential(this.p.createVector(position.x + this.settings.epsilon, position.y)).mag() -
            this.field.getPotential(this.p.createVector(position.x - this.settings.epsilon, position.y)).mag();
        const dy =
            this.field.getPotential(this.p.createVector(position.x, position.y + this.settings.epsilon)).mag() -
            this.field.getPotential(this.p.createVector(position.x, position.y - this.settings.epsilon)).mag();

        const vCurl: p5.Vector = this.p.createVector(dy, -dx);

        // console.log(dx, dy)

        vCurl.mult(this.settings.strength / this.settings.epsilon)

        return vCurl;
    };

    draw() {

        this.p.noStroke();
        this.p.fill(10, this.settings.trace ? 10 : 255);
        this.p.rect(0, 0, this.screenSize.x, this.screenSize.y);

        for (var i = this.blobs.length - 1; i >= 0; i--) {
            const blob = this.blobs[i];

            const vResult = this.settings.curl ? this.curlField(blob.position) : this.field.getPotential(blob.position);

            blob.velocity.set(vResult.x, vResult.y)
            blob.update();


            this.p.stroke(blob.color);
            this.p.strokeWeight(blob.size)
            this.p.line(blob.position.x, blob.position.y, blob.lastPosition.x, blob.lastPosition.y);

            blob.lastPosition = blob.position;

            blob.update();
            if (blob.isDead()) {
                this.blobs.splice(i, 1);
                this.addBlob();
            }
            // if (blob.isDead()) this.respawn(blob);
        }

        if (this.blobs.length < this.settings.nBlobs) {
            this.addBlob()
        } else {
            // this.blobs.splice(0, 1)
        }

        this.field.debugDraw();
        if (this.settings.plotField) this.plotField();
    }

    private plotField(): void {
        const res = 75;
        for (let k = 0; k <= this.screenSize.x; k += res) {
            for (let j = 0; j <= this.screenSize.y; j += res) {
                const position = this.p.createVector(k, j)
                const vResult = this.settings.curl ? this.curlField(position) : this.field.getPotential(position);
                let angle = vResult.heading();
                let mag = vResult.mag();
                this.p.fill(255, mag * 255);
                // this.p.noStroke();
                this.p.push();
                this.p.translate(position.x, position.y);
                this.p.rotate(angle);
                this.p.scale(.9);
                this.p.stroke(mag * 255);
                this.p.strokeWeight(1)

                this.p.line(-5, 0, 5, 0)
                // this.p.triangle(-10, -3, 10, 0, -10, 3);
                this.p.pop();
            }
        }
    }

    destroy() {
        this.gui.destroy()
    }


    tick() {
        this.draw()
    }
}