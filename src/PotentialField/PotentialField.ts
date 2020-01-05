import * as p5 from 'p5';
import BezierEasing from '../../node_modules/bezier-easing/src/index';
import { Point } from '../Common/Point';

export class Potential {
    radius: number
    charge: number
    position: p5.Vector

    constructor(position: p5.Vector, radius: number, a: number) {
        this.position = position;
        this.radius = radius;
        this.charge = a;
    }

    update() {

    }
}

export class PotentialField {

    p: p5
    bezier: any

    potentials: Potential[]


    constructor(p: p5, pArray: Potential[]) {
        this.p = p;

        this.potentials = pArray;

        // this.bezier = BezierEasing(.26, .96, .83, .98)
        this.bezier = BezierEasing(.72, .01, .87, .62)

    }

    public debugDraw(): void {


        // this.potentials[0].position.add(this.p.createVector(.1, 0))

        // const c: p5.Color = this.p.color('#ff0000')
        // this.p.noStroke()
        // c.setAlpha(.5 * 255)
        // this.p.stroke(200).strokeWeight(1)

        this.p.noFill()
        const strokeColor = this.p.color(50, 10)

        for (let index = 0; index < this.potentials.length; index++) {
            const p = this.potentials[index];

            // this.p.fill(this.p.color(p.charge > 0 ? 'rgba(0,0,255,.15)' : 'rgba(255,0,0,.15)'))
            this.p.stroke(strokeColor).strokeWeight(1)
            this.p.ellipse(p.position.x, p.position.y, p.radius * 2, p.radius * 2)
        }
    }

    getPotential(position: p5.Vector) {
        const location = this.p.createVector(position.x, position.y);
        const vResult: p5.Vector = this.p.createVector();

        for (let index = 0; index < this.potentials.length; index++) {
            const p = this.potentials[index];
            const p_position = p.position.copy()
            const p_radius = p.radius;
            const dist = p_position.dist(location.copy())
            const distNorm = (p_radius - dist) / p_radius;
            const dir = p.position.copy().sub(location.copy()).normalize()
            const bezier = this.bezier(distNorm)

            // console.log(p.charge)
            const rota = p.charge > 0 ? bezier : 1 - bezier;
            const result = dist < p_radius ? dir.copy().mult(rota) : dir.copy().mult(.02)

            vResult.add(result)
        }

        return vResult

    }
} 