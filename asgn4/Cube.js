
let g_vertexBuffer = null;
let g_uvBuffer = null;
let g_normalBuffer = null;

class Cube{
    constructor(){
        this.type='cube';
        //this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts32= new Float32Array([
            0,0,0, 1,1,0, 1,0,0
            ,
            0,0,0, 0,1,0, 1,1,0
            ,
            0,1,0, 0,1,1, 1,1,1
            ,
            0,1,0, 1,1,1, 1,1,0
            ,
            1,1,0, 1,1,1, 1,0,0
            ,
            1,0,0, 1,1,1, 1,0,1
            ,
            0,1,0, 0,1,1, 0,0,0
            ,
            0,0,0, 0,1,1, 0,0,1
            ,
            0,0,0, 0,0,1, 1,0,1
            ,
            0,0,0, 1,0,1, 1,0,0
            ,
            0,0,1, 1,1,1, 1,0,1
            ,
            0,0,1, 0,1,1, 1,1,1
        ]);
        this.cubeVerts= [
            0,0,0, 1,1,0, 1,0,0
            ,
            0,0,0, 0,1,0, 1,1,0
            ,
            0,1,0, 0,1,1, 1,1,1
            ,
            0,1,0, 1,1,1, 1,1,0
            ,
            1,1,0, 1,1,1, 1,0,0
            ,
            1,0,0, 1,1,1, 1,0,1
            ,
            0,1,0, 0,1,1, 0,0,0
            ,
            0,0,0, 0,1,1, 0,0,1
            ,
            0,0,0, 0,0,1, 1,0,1
            ,
            0,0,0, 1,0,1, 1,0,0
            ,
            0,0,1, 1,1,1, 1,0,1
            ,
            0,0,1, 0,1,1, 1,1,1
        ]
        this.cubeUVs32 = new Float32Array([
            // front face
            0,0,  1,0,  1,1,
            0,0,  1,1,  0,1,
            // back face
            0,0,  1,0,  1,1,
            0,0,  1,1,  0,1,
            // top face
            0,0,  1,0,  1,1,
            0,0,  1,1,  0,1,
            // bottom face
            0,0,  1,0,  1,1,
            0,0,  1,1,  0,1,
            // left face
            0,0,  1,0,  1,1,
            0,0,  1,1,  0,1,
            // right face
            0,0,  1,0,  1,1,
            0,0,  1,1,  0,1
        ]);

        this.cubeNormals32 = new Float32Array([
            // front face
            0,0,-1, 0,0,-1, 0,0,-1,
            0,0,-1, 0,0,-1, 0,0,-1,
            // top face
            0,1,0, 0,1,0, 0,1,0,
            0,1,0, 0,1,0, 0,1,0,
            // right face
            1,0,0, 1,0,0, 1,0,0,
            1,0,0, 1,0,0, 1,0,0,
            // left face
            -1,0,0, -1,0,0, -1,0,0,
            -1,0,0, -1,0,0, -1,0,0,
            // bottom face
            0,-1,0, 0,-1,0, 0,-1,0,
            0,-1,0, 0,-1,0, 0,-1,0,
            // back face
            0,0,1, 0,0,1, 0,0,1,
            0,0,1, 0,0,1, 0,0,1
        ]);

        

    }
    render(){

        //this.segments = g_circleSegments;

        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);



        /*let normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
*/


        drawTriangle3DUVNormal([0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0], [0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
        drawTriangle3DUVNormal([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0],  [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

        //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        
        drawTriangle3DUVNormal([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);

        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        drawTriangle3DUVNormal([0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0],  [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);
        drawTriangle3DUVNormal([0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);

       // gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        
        drawTriangle3DUVNormal([0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   0.0, 0.0, 1.0], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal([0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 1.0], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);

        //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        drawTriangle3DUVNormal([0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
        drawTriangle3DUVNormal([0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);

        //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

        drawTriangle3DUVNormal([1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);
        drawTriangle3DUVNormal([1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0],  [0,0, 0,1, 1,1],  [0,0,1, 0,0,1, 0,0,1]);
    } 
    renderfast(){

        //this.segments = g_circleSegments;
    
        var rgba = this.color;
    
        gl.uniform1i(u_whichTexture, this.textureNum);
    
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        var allverts=[];
    
        allverts=allverts.concat( [0,0,0, 1,1,0, 1,0,0]);
        allverts=allverts.concat( [0,0,0, 0,1,0, 1,1,0]);
        //drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        //drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0],  [0,0, 0,1, 1,1]);
        //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
        allverts=allverts.concat( [0,1,0, 0,1,1, 1,1,1]);
        allverts=allverts.concat( [0,1,0, 1,1,1, 1,1,0]);
        //drawTriangle3DUV([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [0,0, 1,1, 1,0]);
        //drawTriangle3D([0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0]);
        //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    
        allverts=allverts.concat( [1,1,0, 1,1,1, 1,0,0]);
        allverts=allverts.concat( [1,0,0, 1,1,1, 1,0,1]);
        //drawTriangle3DUV([0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0], V);
        //drawTriangle3D([0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0]);
        //gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        
        allverts=allverts.concat( [0,1,0, 0,1,1, 0,0,0]);
        allverts=allverts.concat( [0,0,0, 0,1,1, 0,0,1]);
        //drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   0.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        //drawTriangle3D([0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 1.0]);
        //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
    
        allverts=allverts.concat( [0,0,0, 0,0,1, 1,0,1]);
        allverts=allverts.concat( [0,0,0, 1,0,1, 1,0,0]);
        //drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0], [0,0, 1,1, 1,0]);
        //drawTriangle3D([0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0]);
        //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
    
        allverts=allverts.concat( [0,0,1, 1,1,1, 1,0,1]);
        allverts=allverts.concat( [0,0,1, 0,1,1, 1,1,1]);
        //drawTriangle3DUV([1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        //drawTriangle3D([1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0]);
    
        drawTriangle3D(allverts);
    } 
 

    renderfaster() {
        var rgba = this.color;
    
        gl.uniform1i(u_whichTexture, this.textureNum);
    
        if (this.textureNum === 0) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, g_skyTexture);
        } else if (this.textureNum === 1) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, g_wallTexture);
        } else if (this.textureNum === 2) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, g_cheeseTexture);
        }
    
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //here

        
    
        if (!g_vertexBuffer) g_vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
    
        if (!g_uvBuffer) g_uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
    
        if (!g_normalBuffer) g_normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeNormals32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
    
        gl.uniform1f(u_texColorWeight, 1.0);
    
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    
      
}

function drawCube(M, color=[1,1,1,1]) {
    let c = new Cube();
    c.color = color;
    c.matrix = M;
    //c.render();
    c.renderfaster();

  }
  


  