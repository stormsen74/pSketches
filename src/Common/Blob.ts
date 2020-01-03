import p5 from 'p5';

export class BlobParticle {
    p: p5
    position: p5.Vector
    velocity: p5.Vector
    lastPosition: p5.Vector
    size: number
    color: p5.Color
    dir: number
    lifespan: number;
    lifetime: number

    constructor(
        p: p5,
        position: p5.Vector,
        velocity: p5.Vector,
        lastPosition: p5.Vector,
        size: number,
        color: p5.Color,
        dir: number,
        lifespan: number
    ) {
        this.p = p;
        this.position = position;
        this.velocity = velocity;
        this.lastPosition = lastPosition;
        this.size = size;
        this.color = color;
        this.dir = dir;
        this.lifespan = lifespan;
        this.lifetime = 0;
    }

    public update(): void {
        this.lifetime += 1;

        const a = this.p.map(this.velocity.mag(), 0.001, 0.8, 0, 1)
        // console.log(this.velocity.mag(), a)

        let from = this.p.color(218, 165, 32);
        let to = this.p.color(72, 61, 139);
        this.p.colorMode(this.p.RGB); // Try changing to HSB.
        let resColor = this.p.lerpColor(from, to, a);

        this.color = resColor;

        this.position.add(this.velocity)
    }

    public isDead(): boolean {
        return this.lifetime > this.lifespan
    }


}