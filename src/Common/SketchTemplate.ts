import p5 from 'p5';

export class SketchTemplate {
    p: p5;

    constructor(p: p5) {
        this.p = p;

        // initEvents => https://p5js.org/reference/#group-Events
        this.p.mousePressed = (e: Event) => { this.mousePressed(e) }
        this.p.mouseReleased = (e: Event) => { this.mouseReleased(e) }
        this.p.mouseMoved = (e: Event) => { this.mouseMoved(e) }
        this.p.keyPressed = (...args) => { this.keyPressed(args) }
        this.p.windowResized = () => { this.onResize() }
        this.p.deviceTurned = () => { this.onResize() }
    }

    mousePressed(e: Event): void { }
    mouseReleased(e: Event): void { }
    mouseMoved(e: Event): void { }
    keyPressed(args: any): void { }

    destroy(): void { }

    tick(): void {
        this.update()
        this.draw()
    }

    onResize(): void {}
    update(): void { }
    draw(): void { }
    preload(): void { }
    setup(): void { }
}
