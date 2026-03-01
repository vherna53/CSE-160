class Animal {
    constructor(glContext) {
        this.gl = glContext;
        this.tailAngle = 0;
        this.tailMidAngle = 0;
        this.tailTipAngle = 0;
        this.headBob = 0;
    }

    render(globalMatrix) {
        const gl = this.gl;

        // Back
        let backMat = new Matrix4(globalMatrix);
        backMat.translate(-0.2, -0.6, 0);
        backMat.scale(0.4, 0.4, 0.4);
        drawCube(backMat, [0.6, 0.6, 0.6, 1.0]);
        let backCoordinatesMat = new Matrix4(backMat);

        // Body
        let bodyMat = new Matrix4(backMat);
        bodyMat.translate(1, 0, 0);
        bodyMat.scale(0.55, 0.75, 1);
        drawCube(bodyMat, [0.6, 0.6, 0.6, 1.0]);
        let bodyCoordinatesMat = new Matrix4(bodyMat);

        // Head
        let headMat = new Matrix4(bodyCoordinatesMat);
        headMat.translate(1, 0, 0.2);
        headMat.scale(0.9, 0.7, 0.6);
        drawCube(headMat, [0.7, 0.7, 0.7, 1.0]);
        let headCoordinatesMat = new Matrix4(headMat);

        // Snout
        let snoutMat = new Matrix4(headCoordinatesMat);
        snoutMat.translate(1, 0, 0.4);
        snoutMat.scale(0.3, 0.3, 0.3);
        drawCube(snoutMat, [0.7, 0.7, 0.7, 1.0]);

        // Nose (sphere)
        let noseMat = new Matrix4(snoutMat);
        noseMat.translate(0.9, 1, 0.4);
        noseMat.scale(0.25, 0.25, 0.25);
        let noseSphere = new Sphere();
        noseSphere.color = [0, 0, 0, 1];
        noseSphere.matrix = noseMat;
        noseSphere.render();

        // Ears
        let leftEarMat = new Matrix4(headCoordinatesMat);
        leftEarMat.translate(0.7, 1, 0.8);
        leftEarMat.scale(0.3, 0.25, 0.2);
        drawCube(leftEarMat, [1, 0.7, 0.7, 1.0]);

        let rightEarMat = new Matrix4(headCoordinatesMat);
        rightEarMat.translate(0.7, 1, 0);
        rightEarMat.scale(0.3, 0.25, 0.2);
        drawCube(rightEarMat, [1, 0.7, 0.7, 1.0]);

        // Legs (simplified, just one front and one back leg example)
        let thighMat = new Matrix4(backCoordinatesMat);
        thighMat.translate(0.07, -0.07, -0.1);
        thighMat.scale(0.67, 0.6, 0.1);
        drawCube(thighMat, [0.52, 0.52, 0.52, 1.0]);

        // Front leg
        let frontFootLMat = new Matrix4(bodyCoordinatesMat);
        frontFootLMat.translate(0.8, -0.1, 0.08);
        frontFootLMat.scale(0.4, 0.1, 0.1);
        drawCube(frontFootLMat, [1, 0.7, 0.7, 1.0]);

        // Tail (static for now)
        let tailBaseJointMat = new Matrix4(bodyCoordinatesMat);
        tailBaseJointMat.translate(-1.8, 0.3, 0.48);
        tailBaseJointMat.rotate(160, 0, 0, 1);
        tailBaseJointMat.rotate(this.tailAngle, 0, 0, 1);

        let tailBaseDrawMat = new Matrix4(tailBaseJointMat);
        tailBaseDrawMat.scale(1.4, 0.06, 0.06);
        drawCube(tailBaseDrawMat, [0.85, 0.55, 0.55, 1.0]);
    }
}