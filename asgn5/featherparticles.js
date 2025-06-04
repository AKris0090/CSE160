class FeatherParticleSystem {
    constructor(THREE, scene, loader) {
        this.THREE = THREE;
        this.scene = scene;
        this.count = 150;
        this.spawnPoint = [0, 80, 40];
        this.spawnArea = 100;

        // Lots of memory. Idk, try phasing this out and maybe setting individual particles instead.
        this.featherParticlePositions = [];
        this.featherParticleMatrices = [];
        this.featherParticleAngles = [];
        this.featherScales = [];
        this.featherSpeeds = [];
        this.instancedFeatherMesh = null;

        loader.load(
            "models/featherparticle.glb",
            (gltf) => {
                let mesh;
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        mesh = child;
                    }
                });
            
                if (mesh) {
                    mesh.material.side = this.THREE.DoubleSide;
                    mesh.material.needsUpdate = true;
                
                    this.instancedFeatherMesh = new this.THREE.InstancedMesh(mesh.geometry, mesh.material, this.count); // create instanced mesh for feather particles
                
                    this.scene.add(this.instancedFeatherMesh);
                }
            }
        );

        // Initialize random particle positions, angles, speeds, and scales within the spawn area/point
        for(let i = 0; i < this.count; i++) {
            const x = this.spawnPoint[0] + (Math.random() * this.spawnArea - this.spawnArea / 2);
            const y = this.spawnPoint[1] + (Math.random() * this.spawnArea - this.spawnArea / 2);
            const z = this.spawnPoint[2] + (Math.random() * this.spawnArea - this.spawnArea / 2);
            this.featherParticlePositions.push(new this.THREE.Vector3(x, y, z));
            this.featherParticleMatrices.push(new this.THREE.Matrix4());
            this.featherParticleAngles.push(Math.random() * Math.PI * 2);
            this.featherSpeeds.push(Math.random() * 0.2 + 0.05);
            this.featherScales.push(new this.THREE.Vector3(1, 1, 1).multiplyScalar(Math.random() * 1.75 + 0.5));
        }
    }

    render(delta) {
        if (this.instancedFeatherMesh) {
            for(let i = 0; i < this.count; i++) {
                // Update particle positions, angles, and scales
                this.featherParticlePositions[i].y -= this.featherSpeeds[i] * delta; // Move particles downwards
                this.featherParticleAngles[i] += 0.01 * delta; // Rotate particles
                this.featherParticlePositions[i].x += (Math.sin(this.featherParticleAngles[i]) * 0.1) * delta; // Sway particles back and forth horizontally

                // Reset particle position if it goes below a certain threshold
                if (this.featherParticlePositions[i].y < -50) {
                    this.featherParticlePositions[i].y = this.spawnPoint[1] + (Math.random() * this.spawnArea - this.spawnArea / 2);
                    this.featherParticlePositions[i].x = this.spawnPoint[0] + (Math.random() * this.spawnArea - this.spawnArea / 2);
                    this.featherParticlePositions[i].z = this.spawnPoint[2] + (Math.random() * this.spawnArea - this.spawnArea / 2);
                }

                // Update the instanced mesh matrix for each particle
                this.featherParticleMatrices[i].compose(
                    this.featherParticlePositions[i],
                    new this.THREE.Quaternion().setFromEuler(new this.THREE.Euler(this.featherParticleAngles[i], this.featherParticleAngles[i], this.featherParticleAngles[i])),
                    this.featherScales[i]
                );
                
                this.instancedFeatherMesh.setMatrixAt(i, this.featherParticleMatrices[i]);
            }
            this.instancedFeatherMesh.instanceMatrix.needsUpdate = true;
        }
    }
}