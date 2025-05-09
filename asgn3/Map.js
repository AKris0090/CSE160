let mat = new Matrix4();

class Map {
    constructor() {
        this.g_Map = [];
    }

    getTile(i, j) {
        return this.g_Map[(i + 16) * 32 + (j + 16)];
    }

    generateMap() {
        for(let i = 0; i < 32; i++) {
            for(let j = 0; j < 32; j++) {
                var randInt = Math.random();
                if(randInt < 0.6) {
                    this.g_Map.push(0);
                } else if (randInt >= 0.6 && randInt < 0.85) {
                    this.g_Map.push(1);
                } else if (randInt >= 0.85 && randInt < 0.95) {
                    this.g_Map.push(2);
                } else if (randInt >= 0.95 && randInt < 1.0) {
                    this.g_Map.push(3);
                }
            }
        }
    }

    render() {
        for(let i = -16; i < 16; i++) {
            for(let j = -16; j < 16; j++) {
                let height = this.getTile(i, j);
                for(let h = 0; h < height; h++) {
                    mat.setIdentity().translate(i * 2, h * 2, j * 2);
                    drawCube(mat, 1);
                }
            }
        }
    }
}