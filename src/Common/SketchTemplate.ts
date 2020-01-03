import p5 from 'p5';

export class SketchTemplate {
    p: p5;

    constructor(p: p5) {
        this.p = p;


        // initEvents => https://p5js.org/reference/#group-Events

        this.p.mousePressed = (e: Event) => { this.mousePressed(e) }
        this.p.keyPressed = (...args) => { this.keyPressed(args) }

    }

    mousePressed(e: Event): void { }
    keyPressed(args: any): void { }

    tick(): void {
        this.update()
        this.draw()
    }

    update(): void { }
    draw(): void { }
}