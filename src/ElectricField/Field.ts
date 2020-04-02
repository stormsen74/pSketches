import p5 from 'p5';
import { Point } from '../Common/Point';

class Charge {
    p: p5
    charge: number
    position: p5.Vector
    radius: number
    dragging: boolean
    offset: p5.Vector

    constructor(p: p5, position: p5.Vector, a: number) {
        this.p = p
        this.position = position
        this.charge = a
        this.radius = 100
        this.dragging = false
        this.offset = this.p.createVector()
    }

    pressed(): void {
        const mouse = this.p.createVector(this.p.mouseX, this.p.mouseY)
        if (mouse.x > this.position.x - this.radius && mouse.x < this.position.x + this.radius &&
            mouse.y > this.position.y - this.radius && mouse.y < this.position.y + this.radius) {

            this.dragging = true;

            this.offset.x = this.position.x - mouse.x;
            this.offset.y = this.position.y - mouse.y;
        }
    }

    release() {
        this.dragging = false;
        console.log('end drag', this.dragging)
    }

    update() {

        if (this.dragging) {
            const mouse = this.p.createVector(this.p.mouseX, this.p.mouseY)
            this.position.x = mouse.x + this.offset.x;
            this.position.y = mouse.y + this.offset.y;
        }

    }
}

export class Field {

    p: p5

    charges: Charge[]


    constructor(p: p5) {
        this.p = p;

        const getRandomX = () => {
            return this.p.random(0, this.p.windowWidth);
        }

        const getRandomY = () => {
            return this.p.random(0, this.p.windowHeight);
        }

        const q1 = new Charge(p, this.p.createVector(getRandomX(), getRandomY()), 1);
        const q2 = new Charge(p, this.p.createVector(getRandomX(), getRandomY()), -1);

        this.charges = new Array<Charge>()
        this.charges.push(q1, q2)

    }


    pressed() {
        this.charges.forEach((c: Charge) => {
            c.pressed()
        })
    }

    released() {
        this.charges.forEach((c: Charge) => {
            c.release()
        })
    }


    public debugDraw(): void {

        this.charges.forEach((c: Charge) => {
            c.update()
        })

        const c: p5.Color = this.p.color('#ff0000')
        this.p.noStroke()
        // c.setAlpha(.5 * 255)
        // this.p.stroke(200).strokeWeight(1)

        for (let index = 0; index < this.charges.length; index++) {
            const q = this.charges[index];

            this.p.fill(this.p.color(q.charge > 0 ? 'rgba(0,0,255,.5)' : 'rgba(255,0,0,.5)'))
            this.p.ellipse(q.position.x, q.position.y, 20, 20)
        }
    }

    getResult(position: p5.Vector) {
        const location = this.p.createVector(position.x, position.y);
        const vResult: p5.Vector = this.p.createVector();

        for (let index = 0; index < this.charges.length; index++) {
            const q = this.charges[index];
            const dir = location.copy().sub(q.position)
            const e = dir.copy().normalize()
            e.mult(q.charge / (4 * Math.PI))
            e.mult(1 / Math.pow(dir.mag(), 2));

            vResult.add(e)
        }

        vResult.mult(1000000)
        return vResult

        /*--------------------------------------------
        ~ component Vector 1
        --------------------------------------------*/
        // this.rVec1 = location.copy().sub(this.Q1.position);

        // this.eVec1 = this.rVec1.copy().normalize();
        // Q/4*PI*e0*eR -> Q = charge (-/+)
        // this.eVec1.mult(this.Q1.charge / (4 * Math.PI));
        // rVec/r^3 || rVec/r^2
        // this.eVec1.mult(1 / Math.pow(this.rVec1.mag(), 2));

    }
} 