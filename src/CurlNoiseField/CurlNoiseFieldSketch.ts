import p5, { Vector } from 'p5';
import * as dat from 'dat.gui';
import { Point } from '../Common/Point';
import { BlobParticle } from '../Common/Blob';
import { SketchTemplate } from '../Common/SketchTemplate';
import SimplexNoise from 'simplex-noise';


export class CurlNoiseFieldSketch extends SketchTemplate {
    p: p5
    screenSize: Point
    blobs: BlobParticle[]
    colors: p5.Color[]
    gui: dat.GUI
    simplex: SimplexNoise
    millis: number
    graphics: p5.Graphics
    sampleRate: number
    t: number

    settings: {
        trace: boolean
        plotField: boolean
        drawNoise: boolean
        sw: boolean
        nBlobs: number
        useCurl: boolean
        noiseScale: number
        animateNoise: boolean
        noiseZ: number
        useSimplex: boolean
        epsilon: number
        strength: number
    }

    constructor(p: p5) {
        super(p)

        this.settings = {
            trace: true,
            plotField: false,
            drawNoise: false,
            sw: true,
            nBlobs: 100,
            useCurl: false,
            noiseScale: 0.0015,
            animateNoise: false,
            noiseZ: 0.1,
            useSimplex: false,
            epsilon: .0001,
            strength: 1,
        }


        this.colors = [this.p.color("#315F6B"), this.p.color("#347181"), this.p.color("#96A337"), this.p.color("#68A737"), this.p.color("#37AC39")]

        this.screenSize = new Point(this.p.windowWidth, this.p.windowHeight)

        this.simplex = new SimplexNoise(Math.random)

        this.millis = this.p.millis();
        this.graphics = this.p.createGraphics(0, 0);


        this.t = 0
        this.sampleRate = 2;

        this.blobs = new Array<BlobParticle>();
        for (let index = 0; index < this.settings.nBlobs; index++) {
            this.addBlob();
        }

        this.initGUI();

    }

    initGUI(): void {
        this.gui = new dat.GUI({ width: 350, closed: true });
        this.gui.add(this.settings, 'nBlobs', 1, 500, 1).listen()
        this.gui.add(this.settings, 'strength', 0, 5, .1).onChange(() => { this.sampleRate = .1 }).onFinishChange(() => { this.sampleRate = 2 })
        this.gui.add(this.settings, 'noiseScale', 0, .005, .0001).onChange(() => { this.sampleRate = .1 }).onFinishChange(() => { this.sampleRate = 2 })
        this.gui.add(this.settings, 'animateNoise').listen()
        this.gui.add(this.settings, 'useCurl').listen()
        this.gui.add(this.settings, 'noiseZ', 0, 1, .01).listen().onChange(() => { this.sampleRate = .1 }).onFinishChange(() => { this.sampleRate = 2 })
        this.gui.add(this.settings, 'useSimplex').listen()
        this.gui.add(this.settings, 'plotField').listen()
        this.gui.add(this.settings, 'drawNoise').listen()
        this.gui.add(this.settings, 'sw').listen().onChange(() => { this.graphics = this.p.createGraphics(0, 0) })
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


    private getNoise(x: number, y: number) {
        const t = this.settings.animateNoise ? this.t : this.settings.noiseZ
        // simplex: -1 | 1 p5: 0 | 1
        return this.settings.useSimplex ? this.simplex.noise3D(x, y, t) : this.p.noise(x, y, t);
    }


    private curlField(position: p5.Vector) {
        const dx =
            this.getNoise(position.x + this.settings.epsilon, position.y) -
            this.getNoise(position.x - this.settings.epsilon, position.y);
        const dy =
            this.getNoise(position.x, position.y + this.settings.epsilon) -
            this.getNoise(position.x, position.y - this.settings.epsilon)

        const vCurl: p5.Vector = this.p.createVector(dy, -dx);

        vCurl.mult(this.settings.strength / this.settings.epsilon)

        if (this.settings.useSimplex) vCurl.mult(.25)

        return vCurl;
    };

    private getVel(position: p5.Vector) {
        const noise = this.getNoise(position.x, position.y)
        const angle = noise * this.p.TWO_PI
        let vResult = this.p.createVector()
        const m = this.settings.useSimplex ? 4 : 2
        vResult = Vector.fromAngle(angle, noise * m);
        return vResult
    }

    draw() {

        this.t += .003;

        this.p.noStroke();
        this.p.fill(10, this.settings.trace ? 10 : 255);
        this.p.rect(0, 0, this.screenSize.x, this.screenSize.y);

        for (let i = 0; i < this.blobs.length; ++i) {
            const blob = this.blobs[i];

            const position = blob.position.copy().mult(this.settings.noiseScale);
            const vResult = this.settings.useCurl ? this.curlField(position) : this.getVel(position);

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


            if (this.blobs.length > this.settings.nBlobs) {
                this.blobs.splice(i, 1)
            }
            // if (blob.isDead()) this.respawn(blob);
        }

        if (this.blobs.length < this.settings.nBlobs) this.addBlob()

        if (this.settings.plotField) this.plotField()

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

    private plotField(): void {
        const res = 75;
        for (let k = 0; k <= this.screenSize.x; k += res) {
            for (let j = 0; j <= this.screenSize.y; j += res) {
                const position = this.p.createVector(k, j)
                const pScaled = position.copy().mult(this.settings.noiseScale);
                const vResult = this.curlField ? this.curlField(pScaled) : this.getVel(pScaled);

                let angle = vResult.heading();
                let mag = vResult.mag();
                this.p.fill(255, mag * 255);
                this.p.push();
                this.p.translate(position.x, position.y);
                this.p.rotate(angle);
                this.p.scale(.9);
                this.p.stroke(mag * 255);
                this.p.strokeWeight(1)

                this.p.line(-5, 0, 5, 0)
                this.p.pop();
            }
        }
    }

    private drawNoise(sampleSize: number, dotSize: number, size: p5.Vector): void {

        this.graphics = this.p.createGraphics(size.x + 3, size.y + 3);

        for (let k = 0; k <= this.screenSize.x; k += sampleSize) {
            for (let j = 0; j <= this.screenSize.y; j += sampleSize) {
                const position = this.p.createVector(k, j)
                const pScaled = position.copy().mult(this.settings.noiseScale);
                const noise = !this.settings.useSimplex ? this.getNoise(pScaled.x, pScaled.y) : this.p.map(this.getNoise(pScaled.x, pScaled.y), -1, 1, 0, 1)

                let usedColor: p5.Color
                if (this.settings.sw) {
                    this.p.colorMode(this.p.RGB, 1)
                    // noise
                    usedColor = this.p.color(noise, noise, noise, .8)
                } else {
                    const vResult = this.curlField ? this.curlField(pScaled) : this.getVel(pScaled)
                    const mag = vResult.copy().mag() * .2
                    // const rad = (Math.abs(vResult.copy().heading()) / Math.PI) 
                    const mappedNoise = this.p.map(noise, 0, 1, 0, 1)

                    this.p.colorMode(this.p.HSL, 1)
                    usedColor = this.p.color(mappedNoise, .6, .5)
                }

                // const colorVelocity = this.p.color(mappedHue, .5, lum, 1)

                //draw
                this.graphics.noStroke()
                this.graphics.fill(usedColor)
                this.graphics.rect(k / sampleSize * dotSize, j / sampleSize * dotSize, dotSize, dotSize)

                this.p.colorMode(this.p.RGB, 255)

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