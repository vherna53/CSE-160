class Sphere {
    constructor() {

      this.type='sphere';
        //this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      this.matrix = new Matrix4();
      this.textureNum = 2;
      this.cubeVerts32= new Float32Array([]);

    }
  
    render() {
      var rgba = this.color;
      gl.uniform1i(u_whichTexture, this.textureNum);

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      //here
      let normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.matrix);
      normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

      var d=Math.PI/10;
      //var dd=Math.PI/100;
      var dd=Math.PI/10;

      //var uv=[0,0, 0,0, 0,0, 0,0, 0,0, 0,01;
      for (var t=0; t<Math.PI; t+=d) {
        for (var r=0; r< (2*Math.PI); r +=d) {
          var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];

          var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
          var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
          var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

          var uv1 = [t/Math.PI, r/(2*Math.PI)];
          var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
          var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
          var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

          
          var v = [];
          var uv= [];
          v=v.concat(p1); uv=uv.concat(uv1);
          v=v.concat(p2); uv=uv.concat(uv2);
          v=v.concat(p4); uv=uv.concat(uv4);
          
          gl.uniform4f(u_FragColor, 1,1,1,1);
          drawTriangle3DUVNormal (v,uv, v);
          
          v=[]; uv=[];
          v=v.concat(p1); uv=uv.concat(uv1);
          v=v.concat(p4); uv=uv.concat(uv4);
          v=v.concat(p3); uv=uv.concat(uv3);
          gl.uniform4f(u_FragColor, 1,1,1,1);
          drawTriangle3DUVNormal(v,uv, v);
        }
      }
      /*

      for (var t = 0; t < Math.PI; t += d) {
        for (var r = 0; r < 2 * Math.PI; r += d) {
          var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
          var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
          var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
          var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];
      
          // normals are normalized positions
          function normalize(v) {
            let len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
            return [v[0]/len, v[1]/len, v[2]/len];
          }
      
          var n1 = normalize(p1);
          var n2 = normalize(p2);
          var n3 = normalize(p3);
          var n4 = normalize(p4);
      
          var uv1 = [t/Math.PI, r/(2*Math.PI)];
          var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
          var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
          var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];
      
          var v = [], uvArr = [], n = [];
          // first triangle
          v = v.concat(p1,p2,p4);
          uvArr = uvArr.concat(uv1,uv2,uv4);
          n = n.concat(n1,n2,n4);
          drawTriangle3DUVNormal(v, uvArr, n);
      
          // second triangle
          v = []; uvArr = []; n = [];
          v = v.concat(p1,p4,p3);
          uvArr = uvArr.concat(uv1,uv4,uv3);
          n = n.concat(n1,n4,n3);
          drawTriangle3DUVNormal(v, uvArr, n);
        }
      }
      
    }
    */
  }
}