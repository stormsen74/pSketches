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
    graphics: p5.Graphics
    millis: number
    sampleRate: number

    settings: {
        trace: boolean,
        plotField: boolean
        nBlobs: number
        curl: boolean
        epsilon: number
        strength: number
        drawNoise: boolean
    }

    constructor(p: p5) {
        super(p)

        this.settings = {
            trace: true,
            plotField: false,
            drawNoise: true,
            nBlobs: 100,
            curl: true,
            epsilon: .0001,
            strength: 50,
        }


        this.colors = [this.p.color("#315F6B"), this.p.color("#347181"), this.p.color("#96A337"), this.p.color("#68A737"), this.p.color("#37AC39")]

        this.screenSize = new Point(this.p.windowWidth, this.p.windowHeight)

        this.field = new Field(this.p);

        this.millis = this.p.millis();
        this.graphics = this.p.createGraphics(0, 0);
        this.sampleRate = 2;

        this.blobs = new Array<BlobParticle>();
        for (let index = 0; index < this.settings.nBlobs; index++) {
            this.addBlob();
        }

        this.initGUI();



    }

    mousePressed(): void {
        this.field.pressed()
        this.sampleRate = .1
    }

    mouseReleased(): void {
        this.field.released()
        this.sampleRate = 2
    }


    initGUI(): void {
        this.gui = new dat.GUI({ width: 350, closed: true });

        this.gui.add(this.settings, 'nBlobs', 1, 500, 1).listen()
        this.gui.add(this.settings, 'curl').listen()
        this.gui.add(this.settings, 'plotField').listen()
        this.gui.add(this.settings, 'drawNoise').listen()
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

        if (this.settings.drawNoise) {

            const rt = this.p.millis() / 1000
            const sampleSize = 20
            const dotSize = ~~this.screenSize.x / 250

            const w = (this.screenSize.x / sampleSize * dotSize) + dotSize
            const h = (this.screenSize.y / sampleSize * dotSize) + dotSize
            const offsetX = this.screenSize.x - w - 10
            const offsetY = this.screenSize.y - h - 10

            if (rt % this.sampleRate > this.sampleRate - .01) {
                this.drawNoise(sampleSize, dotSize, this.p.createVector(w, h))
            }

            if (this.graphics.width === 0 && this.graphics.height === 0) this.drawNoise(sampleSize, dotSize, this.p.createVector(w, h))
            this.p.image(this.graphics, offsetX, offsetY);

        }
    }

    private drawNoise(sampleSize: number, dotSize: number, size: p5.Vector): void {

        this.graphics = this.p.createGraphics(size.x + 3, size.y + 3);

        for (let k = 0; k <= this.screenSize.x; k += sampleSize) {
            for (let j = 0; j <= this.screenSize.y; j += sampleSize) {
                const position = this.p.createVector(k, j)
                const result = this.field.getResult(position).mag()
                const angle = this.field.getResult(position).copy().heading()
                const mappedAngle = this.p.map(angle, -Math.PI, Math.PI, 0, 1)

                // console.log(angle)
                console.log(mappedAngle)

                // this.p.colorMode(this.p.RGB, 1)
                this.p.colorMode(this.p.HSL, 1)
                let mapColor: p5.Color
                mapColor = this.p.color(mappedAngle, result, result, .8)

                //draw
                this.graphics.noStroke()
                this.graphics.fill(mapColor)
                this.graphics.rect(k / sampleSize * dotSize, j / sampleSize * dotSize, dotSize, dotSize)

                this.p.colorMode(this.p.RGB, 255)

            }
        }

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