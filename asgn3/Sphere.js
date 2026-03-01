class Sphere {
    constructor() {
      this.color = [1,1,1,1];
      this.matrix = new Matrix4();
    }
  
    render() {
      gl.uniform4f(u_FragColor, ...this.color);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      let slices = 12;
      let stacks = 12;
  
      for (let i = 0; i < stacks; i++) {
        let phi1 = i * Math.PI / stacks;
        let phi2 = (i+1) * Math.PI / stacks;
  
        for (let j = 0; j < slices; j++) {
          let theta1 = j * 2*Math.PI / slices;
          let theta2 = (j+1) * 2*Math.PI / slices;
  
          let v = [
            Math.sin(phi1)*Math.cos(theta1), Math.cos(phi1), Math.sin(phi1)*Math.sin(theta1),
            Math.sin(phi2)*Math.cos(theta1), Math.cos(phi2), Math.sin(phi2)*Math.sin(theta1),
            Math.sin(phi2)*Math.cos(theta2), Math.cos(phi2), Math.sin(phi2)*Math.sin(theta2),
          ];
          drawTriangle3D(v);
        }
      }
    }
  }
  