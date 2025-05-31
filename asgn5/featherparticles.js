class FeatherParticleSystem {
    constructor(THREE, scene, loader) {
        this.THREE = THREE;
        this.scene = scene;
        this.count = 150;
        this.spawnPoint = [0, 200, 0];
        this.spawnArea = 250;

        this.featherParticlePositions = [];
        this.featherParticleMatrices = [];
        this.featherParticleAngles = [];
        this.featherSpeeds = [];
        this.instancedFeatherMesh = null;

        loader.load(
            "models/featherparticle.glb",
            (gltf) => { // <-- use arrow function here!
                let mesh;
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        mesh = child;
                    }
                });
            
                if (mesh) {
                    mesh.material.side = this.THREE.DoubleSide;
                    mesh.material.needsUpdate = true;
                
                    this.instancedFeatherMesh = new this.THREE.InstancedMesh(mesh.geometry, mesh.material, this.count);
                
                    this.scene.add(this.instancedFeatherMesh);
                }
            }
        );

        for(let i = 0; i < this.count; i++) {
            const x = this.spawnPoint[0] + (Math.random() * this.spawnArea - this.spawnArea / 2);
            const y = this.spawnPoint[1] + (Math.random() * this.spawnArea - this.spawnArea / 2);
            const z = this.spawnPoint[2] + (Math.random() * this.spawnArea - this.spawnArea / 2);
            this.featherParticlePositions.push(new this.THREE.Vector3(x, y, z));
            this.featherParticleMatrices.push(new this.THREE.Matrix4());
            this.featherParticleAngles.push(Math.random() * Math.PI * 2);
            this.featherSpeeds.push(Math.random() * 0.2 + 0.05);
        }
    }

    render(THREE) {
        if (this.instancedFeatherMesh) {
            for(let i = 0; i < this.count; i++) {
                this.featherParticlePositions[i].y -= this.featherSpeeds[i];
                this.featherParticleAngles[i] += 0.01;
                this.featherParticlePositions[i].x += Math.sin(this.featherParticleAngles[i]) * 0.1;

                if (this.featherParticlePositions[i].y < -30) {
                    this.featherParticlePositions[i].y = this.spawnPoint[1];
                    this.featherParticlePositions[i].x = this.spawnPoint[0] + (Math.random() * this.spawnArea - this.spawnArea / 2);
                    this.featherParticlePositions[i].z = this.spawnPoint[2] + (Math.random() * this.spawnArea - this.spawnArea / 2);
                    this.featherParticleAngles[i] = Math.random() * Math.PI * 2;
                }
    
                this.featherParticleMatrices[i].makeRotationY(this.featherParticleAngles[i]).makeRotationZ(this.featherParticleAngles[i]);
                this.featherParticleMatrices[i].setPosition(
                    this.featherParticlePositions[i].x,
                    this.featherParticlePositions[i].y,
                    this.featherParticlePositions[i].z
                );
                this.featherParticleMatrices[i].scale(new THREE.Vector3(3, 3, 3));
                this.instancedFeatherMesh.setMatrixAt(i, this.featherParticleMatrices[i]);
            }
            this.instancedFeatherMesh.instanceMatrix.needsUpdate = true;

        }
    }
}