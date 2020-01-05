import p5 from 'p5';
import * as dat from 'dat.gui';
import { Point } from '../Common/Point';
import { Field } from '../ElectricField/Field';
import { BlobParticle } from '../Common/Blob';
import { SketchTemplate } from '../Common/SketchTemplate';


export class FieldSketch extends SketchTemplate {
    p: p5
    field: Field
    screenSize: Point
    blobs: BlobParticle[]
    colors: p5.Color[]
    gui: dat.GUI

    settings: {
        trace: boolean,
        plotField: boolean
        nBlobs: number
        curl: boolean
        epsilon: number
        strength: number
    }

    constructor(p: p5) {
        super(p)

        this.settings = {
            trace: true,
            plotField: false,
            nBlobs: 100,
            curl: true,
            epsilon: .0001,
            strength: 50,
        }


        this.colors = [this.p.color("#315F6B"), this.p.color("#347181"), this.p.color("#96A337"), this.p.color("#68A737"), this.p.color("#37AC39")]

        this.screenSize = new Point(this.p.windowWidth, this.p.windowHeight)

        this.field = new Field(this.p);

        this.blobs = new Array<BlobParticle>();
        for (let index = 0; index < this.settings.nBlobs; index++) {
            this.addBlob();
        }

        this.initGUI();

    }

    initGUI(): void {
        this.gui = new dat.GUI({ width: 350, closed: true });

        this.gui.add(this.settings, 'nBlobs', 1, 500, 1).listen()
        this.gui.add(this.settings, 'curl').listen()
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
            this.field.getResult(this.p.createVector(position.x + this.settings.epsilon, position.y)).mag() -
            this.field.getResult(this.p.createVector(position.x - this.settings.epsilon, position.y)).mag();
        const dy =
            this.field.getResult(this.p.createVector(position.x, position.y + this.settings.epsilon)).mag() -
            this.field.getResult(this.p.createVector(position.x, position.y - this.settings.epsilon)).mag();

        const vCurl: p5.Vector = this.p.createVector(dy, -dx);

        vCurl.mult(this.settings.strength / this.settings.epsilon)

        return vCurl;
    };

    draw() {

        this.p.noStroke();
        this.p.fill(10, this.settings.trace ? 10 : 255);
        this.p.rect(0, 0, this.screenSize.x, this.screenSize.y);


        for (var i = this.blobs.length - 1; i >= 0; --i) {
            const blob = this.blobs[i];

            const vResult = this.settings.curl ? this.curlField(blob.position) : this.field.getResult(blob.position);

            blob.velocity.set(vResult.x, vResult.y)
            blob.position.add(blob.velocity)

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

        this.blobs.length > this.settings.nBlobs ? this.blobs.splice(i, 1) : this.addBlob();

        this.field.debugDraw();
        if (this.settings.plotField) this.plotField();
    }

    private plotField(): void {
        const res = 75;
        for (let k = 0; k <= this.screenSize.x; k += res) {
            for (let j = 0; j <= this.screenSize.y; j += res) {
                const position = this.p.createVector(k, j)
                const vResult = this.settings.curl ? this.curlField(position) : this.field.getResult(position);
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