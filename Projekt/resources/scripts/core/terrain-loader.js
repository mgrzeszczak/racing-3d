app.terrainLoader = (function(){


    function generateTerrainFromImage(gl,image,scaleX,scaleY){
        var canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        var ctx = canvas.getContext('2d');

        ctx.drawImage(image,0,0);

        var data = ctx.getImageData(0,0,canvas.width,canvas.height).data;

        var vertexData = [];// x y z r g b
        var indices = [];// 1 2 3
        var center = [canvas.width/2,canvas.height/2];

        var w = canvas.width;
        var h = canvas.height;
        var i,j;

        for (i=0;i<data.length;i+=4){
            var y = Math.floor((i/4)/w);
            var x = (i/4)%w;

            var color = data[i]/255;

            vertexData.push((x-center[0])*scaleX);
            vertexData.push(0);
            vertexData.push((y-center[1])*scaleY);

            vertexData.push(color);
            vertexData.push(color);
            vertexData.push(color);
        }

        for (i=0;i<w-1;i++){
            for (j=0;j<h-1;j++){
                indices.push(i+j*w+1);
                indices.push(i+j*w);
                indices.push(i+(j+1)*w);

                indices.push(i+(j+1)*w);
                indices.push(i+(j+1)*w+1);
                indices.push(i+j*w+1);
            }
        }

        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        var worldMatrix = mat4.create();

        return {
            render : function(gl, shader){

                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

                var positionAttribLocation = gl.getAttribLocation(shader, 'position');
                var colorAttribLocation = gl.getAttribLocation(shader, 'color');
                gl.vertexAttribPointer(
                    positionAttribLocation, // Attribute location
                    3, // Number of elements per attribute
                    gl.FLOAT, // Type of elements
                    false,
                    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
                    0 // Offset from the beginning of a single vertex to this attribute
                );
                gl.vertexAttribPointer(
                    colorAttribLocation, // Attribute location
                    3, // Number of elements per attribute
                    gl.FLOAT, // Type of elements
                    false,
                    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
                    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
                );

                gl.enableVertexAttribArray(positionAttribLocation);
                gl.enableVertexAttribArray(colorAttribLocation);

                gl.clearColor(0,0,0, 1.0);
                gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
            }
        };
    }

    return {
        generateTerrainFromImage : generateTerrainFromImage
    };

})();