app.objects.light = function(position,color,ambient){

    this.position = new Float32Array(position);
    this.color = new Float32Array(color);
    this.ambient = new Float32Array(ambient);

};