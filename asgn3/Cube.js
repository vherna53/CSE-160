
let g_vertexBuffer = null;
let g_uvBuffer = null;

class Cube{
    constructor(){
        this.type='cube';
        //this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
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
        

    }
    render(){

        //this.segments = g_circleSegments;

        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0],  [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        
        drawTriangle3DUV([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0], [0,0, 1,1, 1,0]);

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        drawTriangle3DUV([0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0],  [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        
        drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   0.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 1.0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

        drawTriangle3DUV([1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0],  [0,0, 0,1, 1,1]);
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
    /*
    
    renderfaster(){
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer==null) {
        initTriangle3D();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);  // ⭐ ADD THIS LINE

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);  // ⭐ ADD THIS LINE

        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
        
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);  // ⭐ ADD THIS
        gl.enableVertexAttribArray(a_Position);                        // ⭐ ADD THIS
        
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        
        
    }
    
    */
   /*
    renderfaster() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        // Vertex buffer
        if (!g_vertexBuffer) g_vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
    
        // UV buffer
        if (!g_uvBuffer) g_uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
    
        // Draw cube
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }  
    */
    renderfaster() {
        // set which texture
        gl.uniform1i(u_whichTexture, this.textureNum);
    
        // bind the texture
        if (this.textureNum === 0) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, g_skyTexture);
        } else if (this.textureNum === 1) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, g_wallTexture);
        }
    
        // set color and model matrix
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        // bind vertex buffer
        if (!g_vertexBuffer) g_vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
    
        // bind UV buffer
        if (!g_uvBuffer) g_uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
    
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
      
}

function drawCube(M, color=[1,1,1,1]) {
    let c = new Cube();
    c.color = color;
    c.matrix = M;
    c.render();
  }
  


  