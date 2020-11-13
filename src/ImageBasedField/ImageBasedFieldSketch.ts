import p5, {Vector} from 'p5';
import * as dat from 'dat.gui';
import {Point} from '../Common/Point';
import {BlobParticle} from '../Common/Blob';
import {SketchTemplate} from '../Common/SketchTemplate';
// @ts-ignore
import sw from "../assets/invert.png";
// @ts-ignore
import perlin from "../assets/perlin.png";
// @ts-ignore
import radial from "../assets/m.png";


export class ImageBasedFieldSketch extends SketchTemplate {
    p: p5
    screenSize: Point
    blobs: BlobParticle[]
    colors: p5.Color[]
    gui: dat.GUI
    millis: number
    graphics: p5.Graphics
    sampleRate: number
    t: number
    image: string
    currentImage: p5.Image
    images: p5.Image[]

    settings: {
        trace: boolean
        plotField: boolean
        drawNoise: boolean
        sw: boolean
        nBlobs: number
        useCurl: boolean
        epsilon: number
        strength: number
        image: string
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
            epsilon: .0001,
            strength: 1,
            image: 'test',
        }


        this.colors = [this.p.color("#315F6B"), this.p.color("#347181"), this.p.color("#96A337"), this.p.color("#68A737"), this.p.color("#37AC39")]

        this.screenSize = new Point(this.p.windowWidth, this.p.windowHeight)

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


    preload(): void {
        this.images = new Array<p5.Image>();
        const image_01 = this.p.loadImage(sw);
        const image_02 = this.p.loadImage(perlin);
        const image_03 = this.p.loadImage(radial);
        this.images = [image_01, image_02, image_03]
        this.currentImage = this.images[0];
    }

    setup() {
        this.currentImage.loadPixels();
        console.log('setup', this.currentImage, this.currentImage.get(0, 0))
    }

    initGUI() {
        this.gui = new dat.GUI({width: 350, closed: true});
        this.gui.add(this.settings, 'image', {a: 0, b: 1, c: 2}).listen().onChange(() => {
            console.log(this.settings.image)
            this.currentImage = this.images[parseInt(this.settings.image)]
        })
        this.gui.add(this.settings, 'nBlobs', 1, 500, 1).listen()
        this.gui.add(this.settings, 'strength', 0, 10, .1).onChange(() => {
            this.sampleRate = .1
        }).onFinishChange(() => {
            this.sampleRate = 2
        })
        this.gui.add(this.settings, 'useCurl').listen()
        this.gui.add(this.settings, 'plotField').listen()
        this.gui.add(this.settings, 'drawNoise').listen()
        this.gui.add(this.settings, 'sw').listen().onChange(() => {
            this.graphics = this.p.createGraphics(0, 0)
        })
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


    private getNoiseFromPixel(x: number, y: number) {
        const _x = this.p.map(x, 0, this.screenSize.x, 0, this.currentImage.width)
        const _y = this.p.map(y, 0, this.screenSize.y, 0, this.currentImage.height)
        const value = this.currentImage.get(_x, _y)
        return this.p.map(value[0], 0, 255, 0, 1)
    }


    private curlFieldFromPixel(position: p5.Vector) {

        const dx =
            this.getNoiseFromPixel(position.x + 20, position.y) -
            this.getNoiseFromPixel(position.x - 20, position.y);
        const dy =
            this.getNoiseFromPixel(position.x, position.y + 20) -
            this.getNoiseFromPixel(position.x, position.y - 20)

        const vCurl: p5.Vector = this.p.createVector(dy, -dx);
        vCurl.mult(this.settings.strength)

        return vCurl;
    }


    private getVelFromPixel(position: p5.Vector) {
        const noise = this.getNoiseFromPixel(position.x, position.y)
        const angle = noise * this.p.TWO_PI
        let vResult = Vector.fromAngle(angle, noise);
        vResult.mult(this.settings.strength)
        return vResult
    }

    draw() {

        this.t += .003;

        this.p.noStroke();
        this.p.fill(10, this.settings.trace ? 10 : 255);
        this.p.rect(0, 0, this.screenSize.x, this.screenSize.y);

        for (let i = 0; i < this.blobs.length; ++i) {
            const blob = this.blobs[i];

            const vResult = this.settings.useCurl ? this.curlFieldFromPixel(blob.position) : this.getVelFromPixel(blob.position);

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
        }

        if (this.blobs.length < this.settings.nBlobs) this.addBlob()

        if (this.settings.plotField) this.plotField()

        if (this.settings.drawNoise) {

            const rt = this.p.millis() / 50
            const sampleSize = 20
            // const dotSize = ~~this.screenSize.x / 250
            const dotSize = 3

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
        for (let k = 0; k <= this.screenSize.x;
             k += res
        ) {
            for (let j = 0; j <= this.screenSize.y; j += res) {
                const position = this.p.createVector(k, j)
                const vResult = this.settings.useCurl ? this.curlFieldFromPixel(position) : this.getVelFromPixel(position);

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

        for (let k = 0; k <= this.screenSize.x;
             k += sampleSize
        ) {
            for (let j = 0; j <= this.screenSize.y; j += sampleSize) {
                const position = this.p.createVector(k, j)
                const noise = this.getNoiseFromPixel(position.x, position.y)

                let usedColor: p5.Color
                if (this.settings.sw) {
                    this.p.colorMode(this.p.RGB, 1)
                    usedColor = this.p.color(noise, noise, noise, .8)
                } else {
                    const vResult = this.settings.useCurl ? this.curlFieldFromPixel(position) : this.getVelFromPixel(position);
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
