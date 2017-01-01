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

    function loadModel(path,gl){
        var model = null;
        loadJSONModel(path,function(data){
            model = data;
        });
        transformFaces(model);

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
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
            gl.vertexAttribPointer(
                normalAttributeLocation, // attrib location
                3, // number of elements per attrib
                gl.FLOAT, // type
                false, // normalized ?
                3 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
                0  // offset from the beginning
            );
            // enable attribute
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.enableVertexAttribArray(normalAttributeLocation);
        }

        function drawMesh(gl,mesh){
            gl.drawElements(gl.TRIANGLES,mesh.faces.length,gl.UNSIGNED_SHORT,0);
        }

        function render(gl,shader){
            model.meshes.forEach(function(mesh){
               loadMesh(mesh,shader);
               drawMesh(gl,mesh);
            });
        }

        model.meshes.forEach(function(mesh){
            mesh.vertexBuffer = initBuffer(gl.ARRAY_BUFFER,new Float32Array(mesh.vertices));
            mesh.indexBuffer = initBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.faces);
            mesh.normalBuffer = initBuffer(gl.ARRAY_BUFFER,new Float32Array(mesh.normals));
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