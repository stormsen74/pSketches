interface EquationType {
    [key: string]: Array<any>;
}


export class Equations {
    equations: EquationType
    type: string

    constructor() {
        this.equations = {
            "|sin(y),sin(x)|": [
                (x: number, y: number): number => { return Math.sin(x) },
                (x: number, y: number): number => { return Math.sin(y) }
            ],
            "|cos(x^2+y),x+y^2+1|": [
                (x: number, y: number): number => { return x + Math.pow(y, 2) + 1 },
                (x: number, y: number): number => { return Math.cos(Math.pow(x, 2) + y) }
            ],
            "|x^2,y^2|": [
                (x: number, y: number): number => { return Math.pow(y, 2) },
                (x: number, y: number): number => { return Math.pow(x, 2) }
            ],
            "|y^2,x^2|": [
                (x: number, y: number): number => { return Math.pow(x, 2) },
                (x: number, y: number): number => { return Math.pow(y, 2) }
            ],
            "|x^2-y^2,x+y|": [
                (x: number, y: number): number => { return x + y },
                (x: number, y: number): number => { return Math.pow(x, 2) - Math.pow(y, 2) }
            ],
            "|x,y|": [
                (x: number, y: number): number => { return x },
                (x: number, y: number): number => { return y }
            ],
            "|y,x|": [
                (x: number, y: number): number => { return y },
                (x: number, y: number): number => { return x }
            ],
            "|y,-x|": [
                (x: number, y: number): number => { return y },
                (x: number, y: number): number => { return -x }
            ],
            // type | slopeY(x,y) | slopeX(x,y)
            "y'=cos(xy)": [
                (x: number, y: number): number => { return Math.cos(x * y) },
                (x: number, y: number): number => { return 1 }
            ],
            "y'=x+y": [
                (x: number, y: number): number => { return x + y },
                (x: number, y: number): number => { return 1 }
            ],
            "y'=sin(x)cos(y)": [
                (x: number, y: number): number => { return Math.sin(x) * Math.cos(y) },
                (x: number, y: number): number => { return 1 }
            ],
            "y'=cos(x)*y^2": [
                (x: number, y: number): number => { return Math.cos(x) * y * y },
                (x: number, y: number): number => { return 1 }
            ],
            "y'=log(x)log(y)": [
                (x: number, y: number): number => { return Math.log(Math.abs(x)) * Math.log(Math.abs(y)) },
                (x: number, y: number): number => { return 1 }
            ],
            "y'=tan(x)cos(y)": [
                (x: number, y: number): number => { return Math.tan(x) * Math.cos(y) },
                (x: number, y: number): number => { return 1 }
            ],
            "y'=4cos(y)(1-y)": [
                (x: number, y: number): number => { return 4 * Math.cos(y) * (1 - y); },
                (x: number, y: number): number => { return 1 }
            ],
            "Pendulum": [
                (x: number, y: number): number => { return -Math.sin(x) },
                (x: number, y: number): number => { return y }
            ],
            "Oval": [
                (x: number, y: number): number => { return -2 * x },
                (x: number, y: number): number => { return y }
            ],
            "x''=-g*x'-sin(x)+F": [
                (x: number, y: number): number => { return -y - Math.sin(1.5 * x) + 0.7 },
                (x: number, y: number): number => { return 1.5 * y }
            ],
            "Lotka-Volterra": [
                (x: number, y: number): number => { return -y * (1 - x) },
                (x: number, y: number): number => { return x * (1 - y) }
            ],
            "Spiral": [
                (x: number, y: number): number => { return -x - y },
                (x: number, y: number): number => { return y }
            ],
            "Diamonds periodic": [
                (x: number, y: number): number => { return Math.sin(x) },
                (x: number, y: number): number => { return Math.cos(y) }
            ],
            "Diamonds sinks": [
                (x: number, y: number): number => { return Math.sin(x) * Math.cos(y) },
                (x: number, y: number): number => { return Math.sin(y) * Math.cos(x) }
            ],
            "Random linear": [
                (x: number, y: number): number => { return Math.random() },
                (x: number, y: number): number => { return Math.random() }
            ],
            "Double rotational": [
                (x: number, y: number): number => { x = x / 4; return x - x * x * x },
                (x: number, y: number): number => { return y / 4; }
            ],
            "Circle attractor": [
                (x: number, y: number): number => { x = x / 5; y = y / 5; return x + y - y * (x * x + y * y) },
                (x: number, y: number): number => { x = x / 5; y = y / 5; return x - y - x * (x * x + y * y) }
            ],
            "Non Linear 1": [
                (x: number, y: number): number => { return y * (-1 + x); },
                (x: number, y: number): number => { return x * (-x + 5) - y * x }
            ],
            "van der Pol": [
                (x: number, y: number): number => { return 0.6 * (-(0.7 * 0.7 * x * x - 1) * 0.7 * y - 0.7 * x) },
                (x: number, y: number): number => { return 0.6 * (0.7 * y) }
            ],
            "Non Linear 2": [
                (x: number, y: number): number => { return 4 - x * x - y * y },
                (x: number, y: number): number => { return x * (y - 1) }
            ],
            "Source & Sink": [
                (x: number, y: number): number => { return 2 * 0.5 * 0.5 * x * y },
                (x: number, y: number): number => { return (0.5 * 0.5 * x * x - 0.5 * 0.5 * y * y - 1) }
            ],
            "Doublet": [
                (x: number, y: number): number => { return -(2 * 0.5 * 0.5 * x * y) / Math.pow(0.5 * 0.5 * x * x + 0.5 * 0.5 * y * y, 2) },
                (x: number, y: number): number => {
                    return (
                        Math.pow(0.5 * x, 4) + 0.5 * 0.5 * x * x * (2 * 0.5 * 0.5 * y * y - 1) +
                        Math.pow(0.5 * y, 4) + 0.5 * 0.5 * y * y) / Math.pow(0.5 * 0.5 * x * x + 0.5 * 0.5 * y * y, 2
                        );
                }
            ]
        };

    }


    public getSlopeY(x: number, y: number) {
        return this.equations[this.type][0](x, y)
    }

    public getSlopeX(x: number, y: number) {
        return this.equations[this.type][1](x, y)
    }

    public getTypes(): string[] {
        return Object.keys(this.equations)
    }

    public setType(type: string) {
        this.type = type;
    }
}

