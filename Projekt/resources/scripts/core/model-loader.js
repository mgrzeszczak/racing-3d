app.modelLoader = (function(){

    function transformFaces(model){
        for (var i=0;i<model.meshes.length;i++){
            var faces = new Uint16Array(model.meshes[i].faces.length*3);
            for (var j =0;j<model.meshes[i].faces.length;j++){
                faces[3*j] = model.meshes[i].faces[j][0];
                faces[3*j+1] = model.meshes[i].faces[j][1];
                faces[3*j+2] = model.meshes[i].faces[j][2];
            }
            model.meshes[i].faces = faces;
        }
    }

    function calculateFlatNormals(model){
        model.meshes.forEach(function(mesh){
            var normals = [];
            for (var j=0;j<mesh.normals.length;j++){
                normals[j] = mesh.normals[j];
            }
            var faces = mesh.faces;
            for (var i=0;i<faces.length;i+=3){
                var v1,v2,v3;
                v1 = 3*faces[i];
                v2 = 3*faces[i+1];
                v3 = 3*faces[i+2];
                var normal = [0,0,0];

                normal[0] += normals[v1];
                normal[1] += normals[v1+1];
                normal[2] += normals[v1+2];
                normal[0] += normals[v2];
                normal[1] += normals[v2+1];
                normal[2] += normals[v2+2];
                normal[0] += normals[v3];
                normal[1] += normals[v3+1];
                normal[2] += normals[v3+2];

                normal = [normal[0]/3,normal[1]/3,normal[2]/3];

                normals[v1] = normal[0];
                normals[v1+1] = normal[1];
                normals[v1+2] = normal[2];
                normals[v2] = normal[0];
                normals[v2+1] = normal[1];
                normals[v2+2] = normal[2];
                normals[v3] = normal[0];
                normals[v3+1] = normal[1];
                normals[v3+2] = normal[2];
            }
         mesh.flatNormals = normals;
        });
    }

    function loadModel(path,gl){

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
            document.getElementById('formula-body')
        );
        gl.bindTexture(gl.TEXTURE_2D, null);

        var model = null;
        loadJSONModel(path,function(data){
            model = data;
        });
        console.log(model);
        transformFaces(model);
        calculateFlatNormals(model);

        function initBuffer(type,data){
            var buffer = gl.createBuffer();
            gl.bindBuffer(type, buffer);
            gl.bufferData(type, data, gl.STATIC_DRAW);
            gl.bindBuffer(type, null); // unbind
            return buffer;
        }

        function loadMesh(mesh,shaderProgram){
            var positionAttributeLocation = gl.getAttribLocation(shaderProgram, app.names.SHADER_POSITION);
            var normalAttributeLocation = gl.getAttribLocation(shaderProgram, app.names.SHADER_NORMAL);
            var textureCoordsAttributeLocation = gl.getAttribLocation(shaderProgram, app.names.SHADER_TEXTURE_COORDS);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);

            gl.vertexAttribPointer(
                positionAttributeLocation, // attrib location
                3, // number of elements per attrib
                gl.FLOAT, // type
                false, // normalized ?
                3 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
                0  // offset from the beginning
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, app.settings.FLAT_SHADING? mesh.flatNormalBuffer : mesh.normalBuffer);
            gl.vertexAttribPointer(
                normalAttributeLocation, // attrib location
                3, // number of elements per attrib
                gl.FLOAT, // type
                false, // normalized ?
                3 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
                0  // offset from the beginning
            );


            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
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
        }

        function drawMesh(gl,mesh){
            gl.drawElements(gl.TRIANGLES,mesh.faces.length,gl.UNSIGNED_SHORT,0);
        }

        function render(gl,shader){
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.activeTexture(gl.TEXTURE0);
            model.meshes.forEach(function(mesh){
               loadMesh(mesh,shader);
               drawMesh(gl,mesh);
            });
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        model.meshes.forEach(function(mesh){
            mesh.vertexBuffer = initBuffer(gl.ARRAY_BUFFER,new Float32Array(mesh.vertices));
            mesh.indexBuffer = initBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.faces);
            mesh.normalBuffer = initBuffer(gl.ARRAY_BUFFER,new Float32Array(mesh.normals));
            mesh.flatNormalBuffer = initBuffer(gl.ARRAY_BUFFER,new Float32Array(mesh.flatNormals));
            mesh.textureBuffer = initBuffer(gl.ARRAY_BUFFER,new Float32Array(mesh.texturecoords[0]));
        });

        return {
            model : model,
            render : render
        };
    }

    return {
        loadModel : loadModel
    }
})();