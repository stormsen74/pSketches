import p5 from 'p5';
import dat from 'dat.gui';
import { BlobParticle } from '../Common/Blob';
import { Point } from '../Common/Point';
import { Equations } from './Equations';
import { SketchTemplate } from '../Common/SketchTemplate';

// @TODOS
// white / dark -mode
// add colorShemes

export class FlowStream extends SketchTemplate {
    settings: {
        maxBlobs: number,
        trace: boolean,
        plotField: boolean,
        plotRes: number,
        speedMultiplier: number,
        fScale: number,
        useRK4: boolean,
        blobCount: number,
        frameRate: number,
        n: string,
        ode: string,
        fillColor: string,
        fillOpacity: number
        toggle: Function
    }

    gui: dat.GUI

    blobs: BlobParticle[]
    screenSize: Point
    scale: Point
    center: Point
    colors: p5.Color[]
    equations: Equations
    fill: p5.Color
    updateDraw: boolean

    constructor(p: p5) {
        super(p)

        this.settings = {
            maxBlobs: 150,
            fScale: 20,
            speedMultiplier: .0002,
            useRK4: true,
            blobCount: 0,
            frameRate: 0,
            trace: true,
            plotField: false,
            plotRes: 75,
            n: 'positive',
            ode: "y'=cos(xy)",
            fillColor: "#232323",
            fillOpacity: .03,
            toggle: () => { }
        }

        // this.colors = [this.p.color("#7beddc"), this.p.color("#78d9fa"), this.p.color("#91a7ff"), this.p.color("#28fcd2"), this.p.color("#456ff7")]
        this.colors = [this.p.color("#315F6B"), this.p.color("#347181"), this.p.color("#96A337"), this.p.color("#68A737"), this.p.color("#37AC39")]
        // this.colors = [this.p.color("#090a0b"), this.p.color("#171718"), this.p.color("#232022"), this.p.color("#2f2b2a"), this.p.color("#393633")]


        this.equations = new Equations();
        this.equations.setType(this.settings.ode)

        this.blobs = new Array<BlobParticle>();

        this.fill = this.p.color(this.settings.fillColor)

        this.onChangeScale();
        this.updateDraw = true;
        this.fill.setAlpha(this.settings.fillOpacity * 255)

        this.initGUI();

    }


    removeParticles(): void {
        for (var i = this.blobs.length - 1; i >= 0; --i) {
            this.blobs.splice(i, 1);
        }
    }

    getSimPosition(position: p5.Vector) {
        return this.p.createVector((position.x - this.center.x) / this.scale.x, -(position.y - this.center.y) / this.scale.y)
    }

    getScreenPosition(position: p5.Vector) {
        return this.p.createVector(this.scale.x * position.x + this.center.x, -this.scale.y * position.y + this.center.y)
    }

    getDir(): number {
        let dir = 0;
        switch (this.settings.n) {
            case 'positive':
                dir = this.p.random(.1, 1);
                break;
            case 'negative':
                dir = this.p.random(-.1, -1);
                break;
            case 'pos/neg':
                dir = this.p.random(0.1, 1) * (this.p.random() > 0.5 ? 1 : -1);
                break;
        }
        return dir;
    }

    addBlob() {
        const x = this.p.random(0, this.p.windowWidth)
        const y = this.p.random(0, this.p.windowHeight)
        const position = this.p.createVector(x, y);

        const blob = new BlobParticle(
            this.p,
            this.getSimPosition(position),
            this.p.createVector(0, 0),
            position,
            this.p.random(1, 5),
            this.colors[this.p.floor(this.p.random(this.colors.length))],
            this.getDir(),
            this.p.random(300, 600)
        )

        this.blobs.push(blob);
    }

    onChangeFill = () => {
        this.fill = this.p.color(this.settings.fillColor)
        this.fill.setAlpha(this.settings.fillOpacity * 255)
    }

    onChangeScale = () => {
        this.fill.setAlpha(255)
        this.updateDraw = false;
        this.screenSize = new Point(this.p.windowWidth, this.p.windowHeight)
        const xscale = this.screenSize.x / this.settings.fScale;
        const yscale = this.screenSize.y / this.settings.fScale * (this.screenSize.x / this.screenSize.y)
        this.scale = new Point(xscale, yscale)
        this.center = new Point(this.screenSize.x / 2, this.screenSize.y / 2);
    }


    initGUI(): void {

        this.gui = new dat.GUI({ width: 350, closed: true });

        this.gui.add(this.settings, 'trace').onChange((trace: boolean) => {
            this.settings.fillOpacity = trace ? .03 : .5;
            this.onChangeFill()
        })

        const simulation = this.gui.addFolder('simulation');
        simulation.open();
        simulation.add(this.settings, 'plotField').onChange((show: boolean) => {
            if (!show) this.fill.setAlpha(255)
            setTimeout(() => {
                this.fill.setAlpha(this.settings.fillOpacity * 255)
            }, 100)
        });
        simulation.add(this.settings, 'plotRes', 1, 100, 1).listen().onChange(() => {
            this.fill.setAlpha(255)
            setTimeout(() => {
                this.fill.setAlpha(this.settings.fillOpacity * 255)
            }, 25)
        })
        simulation.add(this.settings, 'fScale', 1, 30, 1).onChange(this.onChangeScale).onFinishChange(() => {
            this.updateDraw = true;
            this.fill.setAlpha(this.settings.fillOpacity * 255)
        })
        simulation.add(this.settings, 'speedMultiplier', .0, .005, .00001)
        simulation.add(this.settings, 'maxBlobs', 0, 750, 1).listen();
        simulation.add(this.settings, 'useRK4')
        simulation.add(this.settings, 'blobCount').listen();
        simulation.add(this.settings, 'frameRate', 0, 1, 0.01).listen().name('60fps');

        this.gui.add(this.settings, 'n', ["positive", "negative", "pos/neg"]).name("direction")
        this.gui.add(this.settings, 'ode', this.equations.getTypes()).name("Select:")
            .onChange((ode: string) => {
                this.equations.setType(ode)
                this.fill.setAlpha(255)
            })
            .onFinishChange(() => {
                setTimeout(() => {
                    this.fill.setAlpha(this.settings.fillOpacity * 255)
                }, 25)
            })

        const fillColor = this.gui.addFolder('fillColor');
        fillColor.addColor(this.settings, 'fillColor').onChange(this.onChangeFill)
        fillColor.add(this.settings, 'fillOpacity', 0, .5, .01).listen().onChange(this.onChangeFill)
    }

    keyPressed(...args: any) {
        const k: KeyboardEvent = args[0][0];
        if (k.code === 'ArrowRight') this.settings.maxBlobs += 10;
        if (k.code === 'ArrowLeft') this.settings.maxBlobs -= 10;
    }

    rk4(stepsize: number, position: p5.Vector, dir: number) {
        const x = position.x;
        const y = position.y;

        const k1x = this.equations.getSlopeX(x, y);
        const k1y = this.equations.getSlopeY(x, y);

        const k2x = this.equations.getSlopeX(x + .5 * dir * stepsize * k1x, y + .5 * dir * stepsize * k1y);
        const k2y = this.equations.getSlopeY(x + .5 * dir * stepsize * k1x, y + .5 * dir * stepsize * k1y);

        const k3x = this.equations.getSlopeX(x + .5 * dir * stepsize * k2x, y + .5 * dir * stepsize * k2y);
        const k3y = this.equations.getSlopeY(x + .5 * dir * stepsize * k2x, y + .5 * dir * stepsize * k2y);

        const k4x = this.equations.getSlopeX(x + dir * 2 * stepsize * k3x, y + dir * stepsize * k3y);
        const k4y = this.equations.getSlopeY(x + dir * 2 * stepsize * k3x, y + dir * stepsize * k3y);

        return new Point(
            stepsize * 1 / 6 * (k1x + 2 * k2x + 2 * k3x + k4x),
            stepsize * 1 / 6 * (k1y + 2 * k2y + 2 * k3y + k4y)
        )
    }

    rk2(stepsize: number, position: p5.Vector, dir: number) {
        const x = position.x;
        const y = position.y;

        const k1x = this.equations.getSlopeX(x, y);
        const k1y = this.equations.getSlopeY(x, y);

        const k2x = this.equations.getSlopeX(x + .5 * dir * stepsize * k1x, y + .5 * dir * stepsize * k1y);
        const k2y = this.equations.getSlopeY(x + .5 * dir * stepsize * k1x, y + .5 * dir * stepsize * k1y);

        return new Point(
            stepsize * (k1x + k2x) * .5,
            stepsize * (k1y + k2y) * .5,
        )
    }

    draw() {

        this.p.noStroke();
        this.p.fill(this.fill);
        this.p.rect(0, 0, this.screenSize.x, this.screenSize.y);

        const stepsize = this.p.frameRate() * this.settings.speedMultiplier;

        if (this.settings.plotField) this.plotField(stepsize);

        for (var i = this.blobs.length - 1; i >= 0; i--) {
            const blob = this.blobs[i];

            const solver = this.settings.useRK4 ? this.rk4(stepsize, blob.position, blob.dir) : this.rk2(stepsize, blob.position, blob.dir);
            blob.velocity.set(blob.dir * solver.x, blob.dir * solver.y)
            blob.position.add(blob.velocity)
            const screenPosition = this.getScreenPosition(blob.position)

            this.p.stroke(blob.color);
            this.p.strokeWeight(blob.lifetime > 0 && this.updateDraw ? blob.size : 0)
            this.p.line(screenPosition.x, screenPosition.y, blob.lastPosition.x, blob.lastPosition.y);

            blob.lastPosition = screenPosition;

            // const border = 200;
            // if (x < -border || y < -border || x > this.pSize.x + border || y > this.pSize.y + border || length > this.settings.maxParticles) {
            //     this.blobs.splice(i, 1);
            // }

            blob.update();
            if (blob.isDead()) {
                this.blobs.splice(i, 1);
                this.addBlob();
            }
            // if (blob.isDead()) this.respawn(blob);

        }


        this.blobs.length > this.settings.maxBlobs ? this.blobs.splice(i, 1) : this.addBlob();
        this.settings.blobCount = this.blobs.length;
        this.settings.frameRate = this.p.frameRate() / 60;

    }

    plotField(stepsize: number) {
        const res = this.settings.plotRes;
        for (let k = 0; k <= this.screenSize.x; k += res) {
            for (let j = 0; j <= this.screenSize.y; j += res) {
                const position = new Point(k, j)
                const sim_position = this.getSimPosition(this.p.createVector(k, j))
                const solver = this.rk4(stepsize, sim_position, 1);
                const vVel = this.p.createVector(solver.x, -solver.y)
                let angle = vVel.heading();
                let mag = vVel.mag();
                this.p.fill(255, mag * 150);
                this.p.noStroke();
                this.p.push();
                this.p.translate(position.x, position.y);
                this.p.rotate(angle);
                this.p.scale(.9);
                this.p.triangle(-10, -3, 10, 0, -10, 3);
                this.p.pop();
            }
        }
    }

    destroy() {
        this.gui.destroy()
    }


}