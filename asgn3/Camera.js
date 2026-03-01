class Camera {
    constructor() {
        this.fov = 60;

        // Camera position
        this.eye = new Vector3([0, 2, 5]);
        this.at  = new Vector3([0, 2, 0]);
        this.up  = new Vector3([0, 1, 0]);

        // Default movement speed
        this.speed = 0.2;
        this.turnSpeed = 5; // degrees
    }

    // helper: normalize vector and scale
    normalizeAndScale(v, scale) {
        let len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
        return [v[0]/len*scale, v[1]/len*scale, v[2]/len*scale];
    }

    // Move forward along viewing direction
    forward(speed = this.speed) {
        let dir = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];
        dir = this.normalizeAndScale(dir, speed);

        this.eye.elements[0] += dir[0];
        this.eye.elements[1] += dir[1];
        this.eye.elements[2] += dir[2];

        this.at.elements[0] += dir[0];
        this.at.elements[1] += dir[1];
        this.at.elements[2] += dir[2];
    }

    backward(speed = this.speed) {
        let dir = [
            this.eye.elements[0] - this.at.elements[0],
            this.eye.elements[1] - this.at.elements[1],
            this.eye.elements[2] - this.at.elements[2]
        ];
        dir = this.normalizeAndScale(dir, speed);

        this.eye.elements[0] += dir[0];
        this.eye.elements[1] += dir[1];
        this.eye.elements[2] += dir[2];

        this.at.elements[0] += dir[0];
        this.at.elements[1] += dir[1];
        this.at.elements[2] += dir[2];
    }

    left(speed = this.speed) {
        // forward vector
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];
        // left vector = up × forward
        let s = [
            this.up.elements[1]*f[2] - this.up.elements[2]*f[1],
            this.up.elements[2]*f[0] - this.up.elements[0]*f[2],
            this.up.elements[0]*f[1] - this.up.elements[1]*f[0]
        ];
        s = this.normalizeAndScale(s, speed);

        this.eye.elements[0] += s[0];
        this.eye.elements[1] += s[1];
        this.eye.elements[2] += s[2];

        this.at.elements[0] += s[0];
        this.at.elements[1] += s[1];
        this.at.elements[2] += s[2];
    }

    right(speed = this.speed) {
        this.left(-speed);
    }

    upMove(speed = this.speed) {
        let v = this.normalizeAndScale(this.up.elements, speed);

        this.eye.elements[0] += v[0];
        this.eye.elements[1] += v[1];
        this.eye.elements[2] += v[2];

        this.at.elements[0] += v[0];
        this.at.elements[1] += v[1];
        this.at.elements[2] += v[2];
    }

    downMove(speed = this.speed) {
        let v = this.normalizeAndScale(this.up.elements, speed);

        this.eye.elements[0] -= v[0];
        this.eye.elements[1] -= v[1];
        this.eye.elements[2] -= v[2];

        this.at.elements[0] -= v[0];
        this.at.elements[1] -= v[1];
        this.at.elements[2] -= v[2];
    }

    panLeft(alpha = this.turnSpeed) {
        // convert alpha to radians
        let rad = alpha * Math.PI / 180;

        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];

        // rotation around up axis (y)
        let cosA = Math.cos(rad), sinA = Math.sin(rad);
        let up = this.up.elements;
        let fx = f[0], fz = f[2];
        f[0] = fx*cosA - fz*sinA;
        f[2] = fx*sinA + fz*cosA;

        this.at.elements[0] = this.eye.elements[0] + f[0];
        this.at.elements[1] = this.eye.elements[1] + f[1];
        this.at.elements[2] = this.eye.elements[2] + f[2];
    }

    panRight(alpha = this.turnSpeed) {
        this.panLeft(-alpha);
    }

    getViewMatrix() {
        let view = new Matrix4();
        view.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        return view;
    }
}
