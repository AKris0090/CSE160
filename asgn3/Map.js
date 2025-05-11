let mat = new Matrix4();

class Map {
    constructor() {
        this.g_Map = [];
        this.space = 5;
    }

    getTile(i, j) {
        return this.g_Map[(i + 16) * 32 + (j + 16)];
    }

    setTile(i, j, value) {
        this.g_Map[(i + 16) * 32 + (j + 16)] = value;
    }

    generateMap() {
        for(let i = 0; i < 32; i++) {
            for(let j = 0; j < 32; j++) {
                var randInt = Math.random();
                if(randInt < 0.85) {
                    this.g_Map.push(0);
                } else if (randInt >= 0.85 && randInt < 0.9) {
                    this.g_Map.push(1);
                } else if (randInt >= 0.9 && randInt < 0.95) {
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
                let side = 1;
                for(let h = 0; h < height; h++) {
                    mat.setIdentity().translate(i * this.space, (2.6 * (h)), j * this.space).rotate(height == 2? rotationAngle : -rotationAngle, 0, 1, 0).scale(side, 1, 1);
                    g_wire.render(mat, 0.0);
                    side *= -1;
                }
                if (height > 0) {
                    mat.setIdentity().translate(i * this.space, ((2.55) * (height)) - 1.3, j * this.space).rotate(height == 2? rotationAngle : -rotationAngle, 0, 1, 0).scale(height%2==0? -1:1, 1, height%2==0? -1:1);
                    g_obj.render(mat, 1.0);
                }
            }
        }
    }

    addBlockInFront(cam) {
        const pos = cam.eye;
        const f = new Vector3().set(cam.at).sub(cam.eye).normalize();
        const frontPos = new Vector3().set(pos).add(f.mul(2.5));

        let i = Math.round(frontPos.elements[0] / this.space);
        let j = Math.round(frontPos.elements[2] / this.space);
        i = Math.max(-16, Math.min(15, i));
        j = Math.max(-16, Math.min(15, j));

        if (this.getTile(i, j) < 10) {
            this.setTile(i, j, this.getTile(i, j) + 1);
        }
    }

    removeBlockInFront(cam) {
        const pos = cam.eye;
        const f = new Vector3().set(cam.at).sub(cam.eye).normalize();

        const frontPos = new Vector3().set(pos).add(f.mul(2.5));
        let i = Math.round(frontPos.elements[0] / this.space);
        let j = Math.round(frontPos.elements[2] / this.space);
        i = Math.max(-16, Math.min(15, i));
        j = Math.max(-16, Math.min(15, j));

        if (this.getTile(i, j) > 0) {
            this.setTile(i, j, this.getTile(i, j) - 1);
        }
    }
}