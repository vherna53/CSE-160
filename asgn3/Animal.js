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

        // --- Common white color ---
        //const white = [1.0, 1.0, 1.0, 1.0];
        //const white = [0.98, 0.98, 0.95, 1.0];
        const white = [1.0, 0.99, 0.94, 1.0];
        //const white = [0.99, 0.97, 0.88, 1.0];



        // --- Back ---
        let backMat = new Matrix4(globalMatrix);
        backMat.translate(-0.2, -0.6, 0);
        backMat.scale(0.4, 0.4, 0.4);
        drawCube(backMat, white);
        let backCoordinatesMat = new Matrix4(backMat);

        // --- Body ---
        let bodyMat = new Matrix4(backMat);
        bodyMat.translate(1, 0, 0);
        bodyMat.scale(0.55, 0.75, 1);
        drawCube(bodyMat, white);
        let bodyCoordinatesMat = new Matrix4(bodyMat);

        // --- Head ---
        let headMat = new Matrix4(bodyCoordinatesMat);
        headMat.translate(1, 0, 0.2);
        headMat.scale(0.9, 0.7, 0.6);
        drawCube(headMat, white);
        let headCoordinatesMat = new Matrix4(headMat);

        // --- Snout ---
        let snoutMat = new Matrix4(headCoordinatesMat);
        snoutMat.translate(1, 0, 0.4);
        snoutMat.scale(0.3, 0.3, 0.3);
        drawCube(snoutMat, white); // nose base white

        // --- Nose (sphere) ---
        let noseMat = new Matrix4(snoutMat);
        noseMat.translate(0.9, 1, 0.4);
        noseMat.scale(0.25, 0.25, 0.25);
        let noseSphere = new Sphere();
        noseSphere.color = white; // now white
        noseSphere.matrix = noseMat;
        noseSphere.render();

        // --- Ears (keep original pink) ---
        let leftEarMat = new Matrix4(headCoordinatesMat);
        leftEarMat.translate(0.7, 1, 0.8);
        leftEarMat.scale(0.3, 0.25, 0.2);
        drawCube(leftEarMat, [1, 0.7, 0.7, 1.0]);

        let rightEarMat = new Matrix4(headCoordinatesMat);
        rightEarMat.translate(0.7, 1, 0);
        rightEarMat.scale(0.3, 0.25, 0.2);
        drawCube(rightEarMat, [1, 0.7, 0.7, 1.0]);

        // --- Back left leg ---
        let thighMat = new Matrix4(backCoordinatesMat);
        thighMat.translate(0.07, -0.07, -0.1);
        thighMat.scale(0.67, 0.6, 0.1);
        drawCube(thighMat, white); // back thigh white

        let calfMat = new Matrix4(thighMat);
        calfMat.translate(1, 0, 0);
        calfMat.scale(0.4, 0.7, 1);
        drawCube(calfMat, white); // back calf white

        let footMat = new Matrix4(calfMat);
        footMat.translate(1, 0, 0);
        footMat.scale(0.9, 0.28, 1);
        drawCube(footMat,  [1, 0.7, 0.7, 1.0]); // back foot white

        // --- Back right leg ---
        let thigh2Mat = new Matrix4(backCoordinatesMat);
        thigh2Mat.translate(0.07, -0.07, 1);
        thigh2Mat.scale(0.67, 0.6, 0.1);
        drawCube(thigh2Mat, white);

        let calf2Mat = new Matrix4(thigh2Mat);
        calf2Mat.translate(1, 0, 0);
        calf2Mat.scale(0.4, 0.7, 1);
        drawCube(calf2Mat, white);

        let foot2Mat = new Matrix4(calf2Mat);
        foot2Mat.translate(1, 0, 0);
        foot2Mat.scale(0.9, 0.28, 1);
        drawCube(foot2Mat, [1, 0.7, 0.7, 1.0]);

        // --- Front legs (keep pink) ---
        let frontFootLMat = new Matrix4(bodyCoordinatesMat);
        frontFootLMat.translate(0.8, -0.1, 0.08);
        frontFootLMat.scale(0.4, 0.1, 0.1);
        drawCube(frontFootLMat, [1, 0.7, 0.7, 1.0]);

        let frontFootRMat = new Matrix4(bodyCoordinatesMat);
        frontFootRMat.translate(0.8, -0.1, 0.82);
        frontFootRMat.scale(0.4, 0.1, 0.1);
        drawCube(frontFootRMat, [1, 0.7, 0.7, 1.0]);

        // --- Tail (keep original color) ---
        let tailBaseJointMat = new Matrix4(bodyCoordinatesMat);
        tailBaseJointMat.translate(-1.8, 0.3, 0.48);
        tailBaseJointMat.rotate(160, 0, 0, 1);
        tailBaseJointMat.rotate(this.tailAngle, 0, 0, 1);

        let tailBaseDrawMat = new Matrix4(tailBaseJointMat);
        tailBaseDrawMat.scale(1.4, 0.06, 0.06);
        drawCube(tailBaseDrawMat, [0.85, 0.55, 0.55, 1.0]);

        let tailMidJointMat = new Matrix4(tailBaseJointMat);
        tailMidJointMat.translate(1.4, 0, 0);
        tailMidJointMat.rotate(290, 0, 0, 1);
        tailMidJointMat.rotate(this.tailMidAngle, 0, 0, 1);

        let tailMidDrawMat = new Matrix4(tailMidJointMat);
        tailMidDrawMat.scale(1, 0.05, 0.05);
        drawCube(tailMidDrawMat, [0.85, 0.55, 0.55, 1.0]);

        let tailTipJointMat = new Matrix4(tailMidJointMat);
        tailTipJointMat.translate(1, 0, 0);
        tailTipJointMat.rotate(65, 0, 0, 1);
        tailTipJointMat.rotate(this.tailTipAngle, 0, 0, 1);

        let tailTipDrawMat = new Matrix4(tailTipJointMat);
        tailTipDrawMat.scale(0.8, 0.04, 0.04);
        drawCube(tailTipDrawMat, [0.85, 0.55, 0.55, 1.0]);
    }
}
