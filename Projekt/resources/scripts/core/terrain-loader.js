app.terrainLoader = (function(){


    function generateTerrainFromImage(gl,image,scaleX,scaleY,textureId){
        var canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        var ctx = canvas.getContext('2d');

        ctx.drawImage(image,0,0);

        var data = ctx.getImageData(0,0,canvas.width,canvas.height).data;

        var textureData = [];
        var normalData = [];
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

            //vertexData.push(color);
            //vertexData.push(color);
            //vertexData.push(color);

            normalData.push(0);
            normalData.push(1);
            normalData.push(0);

            textureData.push(x/canvas.width);
            textureData.push(y/canvas.height);
        }

        console.log(textureData);
        console.log(normalData);



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

        var textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureData), gl.STATIC_DRAW);

        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

        var worldMatrix = mat4.create();

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE,
            document.getElementById(textureId)
            //document.getElementById('formula-body')
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        return {
            render : function(gl, shader){

                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.activeTexture(gl.TEXTURE0);

                var positionAttributeLocation = gl.getAttribLocation(shader, app.names.SHADER_POSITION);
                var normalAttributeLocation = gl.getAttribLocation(shader, app.names.SHADER_NORMAL);
                var textureCoordsAttributeLocation = gl.getAttribLocation(shader, app.names.SHADER_TEXTURE_COORDS);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

                gl.vertexAttribPointer(
                    positionAttributeLocation, // attrib location
                    3, // number of elements per attrib
                    gl.FLOAT, // type
                    false, // normalized ?
                    3 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
                    0  // offset from the beginning
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                gl.vertexAttribPointer(
                    normalAttributeLocation, // attrib location
                    3, // number of elements per attrib
                    gl.FLOAT, // type
                    false, // normalized ?
                    3 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
                    0  // offset from the beginning
                );


                gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
                gl.vertexAttribPointer(
                    textureCoordsAttributeLocation, // attrib location
                    2, // number of elements per attrib
                    gl.FLOAT, // type
                    false, // normalized ?
                    2 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
                    0  // offset from the beginning
                );
                // enable attribute
                gl.enableVertexAttribArray(positionAttributeLocation);
                gl.enableVertexAttribArray(normalAttributeLocation);
                gl.enableVertexAttribArray(textureCoordsAttributeLocation);

                gl.clearColor(0,0,0, 1.0);
                gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        };
    }

    return {
        generateTerrainFromImage : generateTerrainFromImage
    };

})();