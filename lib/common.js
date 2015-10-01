var entities = [];

function Entity(element) {
    this.element = element;
    this.isAlive = true;
}

Entity.prototype.tick = function(dTime) {
};

Entity.prototype.kill = function() {
    var idx = entities.indexOf(this);
    if (idx > -1) {
        entities.splice(idx, 1);
    }
    this.isAlive = false;
    result.removeChild(this.element);
};
Entity.prototype.attach = function() {
    entities.push(this);
    result.appendChild(this.element);
};

function AudioEntity(soundfile) {
    Entity.call(this, document.createElement('audio'));
    this.element.src = soundfile;
    this.isBeingKilled = false;
}
AudioEntity.prototype = Object.create(Entity.prototype);
AudioEntity.prototype.volume = 1.0;
AudioEntity.prototype.play = function() {
    this.element = new Audio(this.element.src);
    this.element.volume = config.globalVolume * this.volume;
    this.element.play();
};
AudioEntity.prototype.attach = function() {
    Entity.prototype.attach.call(this);
    result.removeChild(this.element);
};
AudioEntity.prototype.kill = function() {
    if (this.isAlive && !this.isBeingKilled && !this.element.paused) {
        this.isBeingKilled = true;
        var t = this;
        this.element.addEventListener('ended', function () {
            Entity.prototype.kill.call(t);
        });
    }
};
