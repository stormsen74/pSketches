import  p5 from 'p5';

class Charge {
    charge: number
    position: p5.Vector

    constructor(position: p5.Vector, a: number) {
        this.position = position;
        this.charge = a;
    }
}

export class Field {

    p: p5

    charges: Charge[]


    constructor(p: p5) {
        this.p = p;

        const q1 = new Charge(this.p.createVector(100, 300), 1);
        const q2 = new Charge(this.p.createVector(1000, 300), -1);

        this.charges = new Array<Charge>()
        this.charges.push(q1, q2)



    }

    public debugDraw(): void {

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