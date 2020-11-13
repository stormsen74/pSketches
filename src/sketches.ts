
export interface sketchData {
    key: string
    name: string
    description: string
    // img: ImageBitmap
}

export const sketches: Array<sketchData> = [
    {
        key: 'ParticleSetup',
        name: 'Particle Setup*',
        description: ' ...'
    },
    {
        key: 'FlowStream',
        name: 'Flow-Stream',
        description: ' ...'
    },
    {
        key: 'FieldSketch',
        name: 'Field',
        description: ' ...'
    },
    {
        key: 'PotentialFieldSketch',
        name: 'Potential Field',
        description: ' ...'
    },
    {
        key: 'CurlNoiseFieldSketch',
        name: 'Curl-Noise Field',
        description: ' ...'
    },
    {
        key: 'ImageBasedFieldSketch',
        name: 'image based Field ...',
        description: '/'
    },
    {
        key: 'ParamFieldSketch',
        name: 'Param-Field',
        description: ' ...'
    }
]
