import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0x000000, 20, 100 );
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( -18.335, 8.110, -8.524 );
camera.setRotationFromEuler( new THREE.Euler( degToRad(-162.79), degToRad(-33.54), degToRad(-170.29), 'XYZ' ) );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();
// const controls = new OrbitControls(camera, renderer.domElement);

const light1 = new THREE.AmbientLight(0xffffff, 0.15);
light1.position.set(0, 1, 1);
scene.add(light1);

const light2 = new THREE.DirectionalLight(0xffffff, 0.75);
light2.position.set(0, -1, -1);
scene.add(light2);

const featherParticleSystem = new FeatherParticleSystem(THREE, scene, loader);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    1,
    0
);
composer.addPass(bloomPass);

// loader.load(
//     "models/angel.glb",
//     (gltf) => {
//         gltf.scene.traverse ( function ( child ) {
//         });
//         scene.add( gltf.scene );
//     }
// );

loader.load(
    "models/fox.glb",
    (gltf) => {
        scene.add( gltf.scene );
    }
);

loader.load(
    "models/chain.glb",
    (gltf) => {
        gltf.scene.position.set(6.605, -20.183, 10.319);
        gltf.scene.rotation.set(0, 0, degToRad(5.99));
        gltf.scene.scale.set(1.846, 1.846, 1.846);
        scene.add( gltf.scene );
    }
);

const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load(
  'textures/hdri.png',
  () => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
});

const furTexture = textureLoader.load("models/Fox_BaseColor.png");
furTexture.encoding = THREE.sRGBEncoding;
furTexture.flipY = false;

renderer.outputEncoding = THREE.sRGBEncoding; 

const shellCount = 10;

const customUniforms = {
    shellCount: { value: shellCount },
    furLength: { value: 1.25 },
    furTexture: { value: furTexture },
    shrinkFactor: { value: 0.05 },
    time: { value: 0 },
};

const customMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge( [
				THREE.UniformsLib[ 'fog' ], customUniforms
      ] ),
    vertexShader: `
        precision mediump float;
        
        varying vec3 vWorldPos;
        varying vec3 vCenter;
        varying vec2 vUv;

        attribute vec3 triangleCenter;

        uniform float shellCount;
        uniform float furLength;
        uniform float time;
        varying float vShellIndex;

        #include <fog_pars_vertex>
        #define PI 3.141592653589

        float rand(vec2 c){
        	return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        float noise(vec2 p, float freq ){
        	float unit = 1920.0/freq;
        	vec2 ij = floor(p/unit);
        	vec2 xy = mod(p,unit)/unit;
        	//xy = 3.*xy*xy-2.*xy*xy*xy;
        	xy = .5*(1.-cos(PI*xy));
        	float a = rand((ij+vec2(0.,0.)));
        	float b = rand((ij+vec2(1.,0.)));
        	float c = rand((ij+vec2(0.,1.)));
        	float d = rand((ij+vec2(1.,1.)));
        	float x1 = mix(a, b, xy.x);
        	float x2 = mix(c, d, xy.x);
        	return mix(x1, x2, xy.y);
        }

        float pNoise(vec2 p, int res){
        	float persistance = .5;
        	float n = 0.;
        	float normK = 0.;
        	float f = 4.;
        	float amp = 1.;
        	int iCount = 0;
        	for (int i = 0; i<50; i++){
        		n+=amp*noise(p, f);
        		f*=2.;
        		normK+=amp;
        		amp*=persistance;
        		if (iCount == res) break;
        		iCount++;
        	}
        	float nf = n/normK;
        	return nf*nf*nf*nf;
        }

        varying float vNoise;

        void main() {
            #include <begin_vertex>
            #include <project_vertex>
            #include <fog_vertex>

            float shellIndex = float(gl_InstanceID);
            vShellIndex = shellIndex;

            // multiply time to speed
            float noise = pNoise((position.xz * 50.0) - vec2(time * 350.0), 350);
            float zScale = 0.1 + (pow(position.z, 2.75) * 0.000075);

            vec3 furOffset = (normal + (normal * vec3(0, noise * 2.0, noise * 2.5 + 2.0))) * zScale * furLength * (shellIndex / shellCount);

            vec3 displaced = position + furOffset;

            #ifdef USE_INSTANCING
                vec4 worldPos = instanceMatrix * vec4(displaced, 1.0);
                vec4 worldCenter = instanceMatrix * vec4(triangleCenter + furOffset, 1.0);
            #endif

            vWorldPos = worldPos.xyz;
            vCenter = worldCenter.xyz;

            gl_Position = projectionMatrix * viewMatrix * worldPos;
            vUv = uv;
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform sampler2D furTexture;
        uniform float shellCount;
        uniform float shrinkFactor;
        varying float vShellIndex;

        #include <fog_pars_fragment>

        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vCenter;

        void main() {
            float maxDist = shrinkFactor * (shellCount - 1.0 - vShellIndex);
            float dist = distance(vWorldPos, vCenter);

            if (dist > maxDist) {
                discard;
            }

            vec4 fur = texture2D(furTexture, vUv);
            gl_FragColor = vec4(vec3(fur.r + 0.145, fur.g + 0.1, fur.b) * 0.125, 1.0);
            #include <fog_fragment>
        }
    `,
    fog: true,
});

let furInstancedMesh;

function createTriangleCenters(originalGeometry) {
    const geometry = originalGeometry.toNonIndexed();

    const posAttr = geometry.getAttribute('position');
    const triangleCenters = [];

    for (let i = 0; i < posAttr.count; i += 3) {
        const v0 = new THREE.Vector3().fromBufferAttribute(posAttr, i);
        const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
        const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);

        const center = new THREE.Vector3()
            .add(v0).add(v1).add(v2)
            .multiplyScalar(1 / 3);

        for (let j = 0; j < 3; j++) {
            triangleCenters.push(center.x, center.y, center.z);
        }
    }

    geometry.setAttribute('triangleCenter', new THREE.Float32BufferAttribute(triangleCenters, 3));
    return geometry;
}

let meshMatrices = [];

loader.load(
    "models/foxfur.glb",
    (gltf) => {
        gltf.scene.traverse ( function ( child ) {
            let mesh;
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
                mesh = child;
            }

            if (mesh) {
                const geo = createTriangleCenters(mesh.geometry);
                furInstancedMesh = new THREE.InstancedMesh(geo, customMaterial, shellCount);

                for (let i = 0; i < shellCount; i++) {
                    let m = new THREE.Matrix4();
                    m.makeTranslation(0, 0.0, i * 0.05);
                    meshMatrices.push(mesh.matrixWorld.clone());
                    furInstancedMesh.setMatrixAt(i, m.clone().multiply(mesh.matrixWorld));
                }

                furInstancedMesh.instanceMatrix.needsUpdate = true;
                scene.add(furInstancedMesh);
            }
        });
    }
);

function animate() {
    //controls.update();
    featherParticleSystem.render();
    if(furInstancedMesh) furInstancedMesh.material.uniforms.time.value += 0.01;
    composer.render();
}

renderer.setAnimationLoop( animate );