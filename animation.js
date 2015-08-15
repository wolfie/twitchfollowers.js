/*
 TODO:
 - [ ] don't call requestAnimationFrame if nothing
       needs to be animated.
 - [ ] how to display multiple followers at once?
 - [ ] cannon distribution on top of nameplate?
 - [ ] convert to <canvas> to avoid frame tick?
 - audio
 - [ ] <audio>
 - [ ] nameplate thunk
 - [ ] nameplate open thunk (same?)
 - [ ] cannon shoot
 - [ ] cannon drop?
 - graphics
 - [ ] cannon
 - [ ] muzzle flare / explosion
 - [ ] nameplate backplate
 - [ ] nameplate cover
 - [ ] particles
 - [ ] font for follower name
 - actions (~5secs)
 - [ ] add nameplate
   - [ ] ...with a bang
 - [ ] open nameplate (3d rotations)
 - [x] drop cannons
   - [ ] ...on top of nameplate
   - [ ] ...and then fire them
 - [ ] bounce cannons on impact
   - [ ] ...with rotation
 - [ ] drop everything willy nilly
 */

var width = window.innerWidth;
var height = window.innerHeight;
var gravity = 0.001;
var entities = [];
var nameplate = null;

window.addEventListener('resize', function () {
    width = window.innerWidth;
    height = window.innerHeight;
});


// TODO: remove example code:
var intervalId = setInterval(function() {
    var cannons = 1;
    var spread = width / cannons;
    for (var i=0; i<cannons; i++) {
        entities.push(new Cannon(spread/2 + spread*i, 0));
    }
}, 3000);

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
};

function VisualEntity(x, y, classname) {
    Entity.call(this);
    this.halfWidth = 0;
    this.halfHeight = 0;
    this.x = 0;
    this.y = 0;

    this.element = document.createElement('div');
    this.element.classList.add('visualEntity');
    this.element.classList.add(classname);

    // todo: remove and require explicit attachment?
    result.appendChild(this.element);
    this.halfWidth = this.element.offsetWidth/2;
    this.halfHeight = this.element.offsetHeight/2;
    this.setPosition(x, y);
}

VisualEntity.prototype = Object.create(Entity.prototype);
VisualEntity.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
    this.element.style.top = (y-this.halfHeight)+'px';
    this.element.style.left = (x-this.halfWidth)+'px';
};

VisualEntity.prototype.tick = function() {
    if (!this.isAlive) {
        return;
    }

    Entity.prototype.tick.call(this);

    // kill the entity if it's outside of the screen.
    if (this.getRight() < 0 ||
        this.getLeft() > width ||
        this.getTop() > height) {
        this.kill();
    }
};
VisualEntity.prototype.kill = function() {
    var parent = this.element.parentNode;
    if (parent) {
        parent.removeChild(this.element);
    }
    Entity.prototype.kill.call(this);
};
VisualEntity.prototype.getTop = function() {
    return this.y-this.halfHeight;
};
VisualEntity.prototype.getLeft = function() {
    return this.x-this.halfWidth;
};
VisualEntity.prototype.getRight = function() {
    return this.x+this.halfWidth;
};
VisualEntity.prototype.getBottom = function() {
    return this.y+this.halfHeight;
};

function GravityEntity(x, y, classname) {
    VisualEntity.call(this, x, y, classname);
    this.dX = 0;
    this.dY = 0;
    this.boundByGravity = true;
}
GravityEntity.prototype = Object.create(VisualEntity.prototype);
GravityEntity.prototype.setDirection = function(deg, vel) {
    var rad = deg * Math.PI / 180;
    this.dY = -Math.sin(rad) * vel;
    this.dX = Math.cos(rad) * vel;
};
GravityEntity.prototype.tick = function(dTime) {
    VisualEntity.prototype.tick.call(this);
    if (this.boundByGravity) {
        this.dY += gravity * dTime;
    }

    this.setPosition(this.x + this.dX*dTime, this.y + this.dY*dTime);
};

function Cannon(x, y) {
    GravityEntity.call(this, x, y, 'cannon');
    this.hasFired = false;
    this.lifetime = 0;
}
Cannon.floor = height-200;
Cannon.prototype = Object.create(GravityEntity.prototype);
Cannon.prototype.tick = function(dTime) {
    GravityEntity.prototype.tick.call(this, dTime);
    this.lifetime += dTime;

    if (!this.hasFired && this.lifetime > 500) {
        this.fire();
        this.hasFired = true;
    }

    if (this.y > Cannon.floor) {
        this.setPosition(this.x, Cannon.floor);
    }

    if (this.lifetime > 2000) {
        this.kill();
    }
};
Cannon.prototype.fire = function() {
    var deg = 90 - (this.x / width - .5) * 90;
    var varDeg = 20;

    for (var i = 0; i < 50; i++) {
        var confetto = new Confetto(this.x, this.y);
        var r = (Math.random() * varDeg) - varDeg / 2;
        confetto.setDirection(deg + r, .6 + Math.random() * .1);
        entities.push(confetto);
    }
};

function Confetto(x, y) {
    GravityEntity.call(this, x, y, 'confetto');
}
Confetto.prototype = Object.create(GravityEntity.prototype);

function Nameplate(follower) {
    GravityEntity.call(this, width/2, height/2, 'nameplate');

    this.follower = follower;
    if (nameplate != null) {
        throw "Nameplate already exists!";
    }
    nameplate = this;
    this.boundByGravity = false;
}
Nameplate.prototype = Object.create(GravityEntity.prototype);
Nameplate.prototype.kill = function() {
    if (nameplate !== this) {
        throw "Trying to kill nameplate, but the global one wasn't " +
            "what was expected";
    }
    nameplate = null;
    GravityEntity.prototype.kill.call(this);
};

var lastTime = -1;
function frame(timestamp) {
    if (lastTime > 0) {
        var dTime = timestamp - lastTime;

        for (var i=entities.length-1; i>=0; i--) {
            entities[i].tick(dTime);
        }
    }
    lastTime = timestamp;
    window.requestAnimationFrame(frame);
}
window.requestAnimationFrame(frame);

window.announceNewFollowers = function(followers) {
    for (var i = 0; i<5; i++) {
        var x = Math.random() * (width-20);
        entities.push(new Cannon(x, 0));
    }

    var testingFollower = {
        name: "Wolfie"
    };
    entities.push(new Nameplate(testingFollower));

    followers.forEach(function(follower) {
        var div = document.createElement('div');
        div.textContent = follower.name;
        result.appendChild(div);
    });
};
