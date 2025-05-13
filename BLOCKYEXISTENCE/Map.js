let mat = new Matrix4();
let g_targets = [];

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

    checkTiles(ob) {
        for(let i = 0; i < g_targets.length; i++) {
            if(ob.i == g_targets[i].i && ob.j == g_targets[i].j && ob.height == g_targets[i].height + 1) {
                g_targets.splice(i, 1);
                heightM++;
            }
        }
        if(g_targets.length === 0) {
            this.generateSockets();
            heightM = 2;
        }
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
        this.generateSockets();
    }

    generateSockets() {
        if(g_targets.length >= 5) {
            return;
        }
        for(let a = 0; a < 5; a++) {
            while(true) {
                let ob = {
                    i: Math.floor(Math.random() * 32) - 16,
                    j: Math.floor(Math.random() * 32) - 16,
                    height: 1 + Math.floor(Math.random() * 8),
                }
                let b = true;
                for(let b = 0; b < g_targets.length; b++) {
                    if(g_targets[b].i == ob.i && g_targets[b].j == ob.j) {
                        b = false;
                    }
                }
                if(b) {
                    g_targets.push(ob);
                    break;
                }
            }
        }
    }

    render(t) {
        for(let i = -16; i < 16; i++) {
            for(let j = -16; j < 16; j++) {
                let height = this.getTile(i, j);
                let side = 1;
                if(t === 1) {
                    for(let h = 0; h < height; h++) {
                        mat.setIdentity().translate(i * this.space, (2.6 * (h)), j * this.space).rotate(h % 2 == 0?  rotationAngle : rotationAngle + 180, 0, 1, 0).scale(1, 1, 1);
                        g_wire.render(mat, 0.0);
                        side *= -1;
                    }
                }
                if (height > 0) {
                    mat.setIdentity().translate(i * this.space, ((2.55) * (height)) - 1.3, j * this.space).rotate(height % 2 == 0? rotationAngle + 180: rotationAngle, 0, 1, 0);
                    g_obj.render(mat, 1.0);
                }
            }
        }

        for(let v = 0; v < g_targets.length; v++) {
            let o = g_targets[v];
            mat.setIdentity().translate(o.i * this.space, ((2.55) * (o.height)) - 2.7, o.j * this.space).rotate(o.height % 2 == 0? rotationAngle + 180 : rotationAngle, 0, 1, 0);
            g_socket.render(mat, 3.0);
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
        this.checkTiles({i: i, j: j, height: this.getTile(i, j) + 1});
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
        this.checkTiles({i: i, j: j, height: this.getTile(i, j) - 1});
    }
}