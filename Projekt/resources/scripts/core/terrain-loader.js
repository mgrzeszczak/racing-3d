app.terrainLoader = (function(){


    function generateTerrainFromImage(gl,image,scaleX,scaleY,scaleZ,textureId){
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

        var terrainData = {};

        for (i=0;i<data.length;i+=4) {
            var y = Math.floor((i / 4) / w);
            var x = (i / 4) % w;

            var color = data[i] / 255;

            var position = vec3.fromValues((x - center[0]) * scaleX,color*scaleZ,(y - center[1]) * scaleY);
            vertexData.push((x - center[0]) * scaleX);
            vertexData.push(color * scaleZ);
            vertexData.push((y - center[1]) * scaleY);

            terrainData[x*h+y] = position;

            //vertexData.push(color);
            //vertexData.push(color);
            //vertexData.push(color);
            var sx = data[4 * (x < w - 1 ? x + 1 : x) + 4 * y * w] - data[(x == 0 ? x : x - 1) * 4 + 4 * y * w];
            if (x == 0 || x == w - 1)
                sx *= 2;

            var sy = data[4 * x + 4 * w * (y < h - 1 ? y + 1 : y)] - data[4 * x + 4 * w * (y == 0 ? y : y - 1)];
            if (y == 0 || y == h - 1)
                sy *= 2;

            var normal = vec3.fromValues(-sx / 255, 1, -sy / 255);
            vec3.normalize(normal, normal);

            normalData.push(normal[0]);
            normalData.push(normal[1]);
            normalData.push(normal[2]);

            textureData.push(x / canvas.width);
            textureData.push(y / canvas.height);
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


        function render(gl,shader){
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

            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        function interpolateSlope(fl,fr,rl,rr){

            function findTerrainHeight(x,y){
                var xOffset = w/2 * scaleX;
                var yOffset = h/2 * scaleY;

                x+=xOffset;
                y+=yOffset;

                var xi = Math.floor(x/scaleX);
                var yi = Math.floor(y/scaleY);

                var topLeft = terrainData[xi*h+yi];

                var topRight = terrainData[(xi+1)*h+yi];
                var bottomLeft = terrainData[(xi)*h+yi+1];
                var bottomRight = terrainData[(xi+1)*h+yi+1];

                var triangle = [bottomLeft,topRight];

                var topLeftDistance = mathUtils.distance2d(topLeft[0],topLeft[2],x,y);
                var bottomRightDistance = mathUtils.distance2d(bottomRight[0],bottomRight[2],x,y);

                triangle.push(topLeftDistance<bottomRightDistance ? topLeft : bottomRight);



                var a = mathUtils.distance2d(x,y,triangle[0][0],triangle[0][2]);


                var b = mathUtils.distance2d(x,y,triangle[1][0],triangle[1][2]);
                var c = mathUtils.distance2d(x,y,triangle[2][0],triangle[2][2]);

                var sum = a+b+c;

                var pA = (b+c)/sum;
                var pB = (a+c)/sum;
                var pC = (a+b)/sum;

                return pA*triangle[0][1] + pB*triangle[1][1] + pC*triangle[2][1];
            }

            fl[1] = findTerrainHeight(fl[0],fl[2]);
            fr[1] = findTerrainHeight(fr[0],fr[2]);
            rl[1] = findTerrainHeight(rl[0],rl[2]);
            rr[1] = findTerrainHeight(rr[0],rr[2]);


            var front = (fl[1]+fr[1])/2;
            var rear = (rl[1]+rr[1])/2;

            var left = (fl[1]+rl[1])/2;
            var right = (fr[1]+rr[1])/2;

            var xAngle = Math.atan2(front-rear,fl[2]-rl[2]);
            var zAngle = Math.atan2(left-right,fl[0]-rl[0]);

            return [xAngle,zAngle];
        }

        return {
            render : render,
            interpolateSlope : interpolateSlope
        };
    }

    return {
        generateTerrainFromImage : generateTerrainFromImage,

    };

})();