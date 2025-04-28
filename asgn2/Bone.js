let boneColor = [164/255, 90/255, 82/255, 1.0];
let topBoneColor = [0.988, 0.882, 0.69, 1.0];

let g_boneX = -8;
let g_boneY = -2;
let g_boneZ = 0;
let g_boneAngleX = 180;
let g_boneAngleY = 0;
let g_boneAngleZ = 0;

let g_boneStartPose;
let g_currentBoneAnim = null;

let g_boneAnimStartTime;

let g_boneMoving = false;

function getTransform() {
    return {
        posX: g_boneX,
        posY: g_boneY,
        posZ: g_boneZ,

        angleX: g_boneAngleX,
        angleY: g_boneAngleY,
        angleZ: g_boneAngleZ,
    }
}

// mini version of vulture animation system
function updateBoneAnimation(bone) {
    if (!g_currentBoneAnim && bone.queuedAnims && bone.queuedAnims.length > 0) {
        g_currentBoneAnim = bone.queuedAnims.pop();
        g_boneAnimStartTime = g_currentTime;
        g_boneStartPose = getTransform();
        g_boneMoving = true;
    }

    if(g_currentBoneAnim) {
        let elapsed = g_currentTime - g_boneAnimStartTime;
        let duration = g_currentBoneAnim.time;
        let a = Math.min(1, elapsed / duration);

        let from = g_boneStartPose;
        let to = g_currentBoneAnim;

        g_currentBoneAnim.posX? g_boneX = lerpVal(from.posX, to.posX, a): null;
        g_currentBoneAnim.posY? g_boneY = lerpVal(from.posY, to.posY, a): null;
        g_currentBoneAnim.posZ? g_boneZ = lerpVal(from.posZ, to.posZ, a): null;

        g_currentBoneAnim.angleX? g_boneAngleX = lerpVal(from.angleX, to.angleX, a): null;
        g_currentBoneAnim.angleY? g_boneAngleY = lerpVal(from.angleY, to.angleY, a): null;
        g_currentBoneAnim.angleZ? g_boneAngleZ = lerpVal(from.angleZ, to.angleZ, a): null;
        

        if(a >= 1) {
            g_currentBoneAnim = null;
            if(g_boneMoving === true && bone.queuedAnims.length === 0) {
                g_boneMoving = false;
            }
        }
    }
}

class Bone {
    constructor() {
        this.matrix = new Matrix4()
        this.newM = new Matrix4();
        this.queuedAnims = [];
    }
  
    render() {
        updateBoneAnimation(this);
        this.renderBone();
    }

    renderBone() {
        applyColor(chinColor);
    
        this.newM.set(this.matrix).translate(g_boneX, g_boneY, g_boneZ).rotate(g_boneAngleX, 1, 0, 0).rotate(g_boneAngleY, 0, 1, 0).rotate(g_boneAngleZ, 0, 0, 1).scale(0.22, 0.22, 0.22);
        drawIcoSphere(this.newM);
    
        applyColor(topBoneColor);
        this.newM.scale(0.75, 5, 0.75);
        drawCylinder(this.newM);
    
        applyColor(boneColor);
        this.newM.scale(4/3, 1/5, 4/3);
        this.newM.translate(-0.6, 5, 0).scale(0.45, 0.45, 0.45);
        drawIcoSphere(this.newM);
        this.newM.translate(2, 0, 0).scale(1.5, 1.5, 1.5);
        drawIcoSphere(this.newM);
    }
}