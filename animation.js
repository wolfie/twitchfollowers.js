/*
 TODO:
 - [ ] don't call requestAnimationFrame if nothing
       needs to be animated.
 - [ ] how to display multiple followers at once?
 - [x] cannon distribution on top of nameplate?
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
 - [x] add nameplate
   - [ ] ...with a bang
 - [ ] open nameplate (3d rotations)
 - [x] drop cannons
   - [x] ...on top of nameplate
   - [x] ...and then fire them
 - [ ] bounce cannons on impact
   - [ ] ...with rotation
 - [ ] drop everything willy nilly
 */

var style = document.createElement('style');
style.appendChild(document.createTextNode('')); // webkit needs this?
document.head.appendChild(style);
var sheet = style.sheet;
sheet.insertRule('.visualEntity {position: absolute}', 0);
sheet.insertRule('.confetto {' +
    'width: 5px;' +
    'height: 5px;' +
    'background-color: red;' +
    'border-radius: 3px' +
    '}', 1);
sheet.insertRule('.cannon {' +
    'width: 20px;' +
    'height: 20px;' +
    'background-color: black;' +
    '}', 2);
sheet.insertRule('.nameplate {' +
    'width: 400px;' +
    'height: 150px;' +
    'background-color: grey;' +
    'display: flex;' +
    'flex-direction: row;' +
    'align-items: center;' +
    '}', 3);
sheet.insertRule('.nameplate.notified {' +
    'background-color: gold;' +
    '}', 4);
sheet.insertRule('.nameplate .logo {' +
    'max-height: 64px;' +
    'max-width: 64px;' +
    'padding: 20px;' +
    '}', 5);
sheet.insertRule('.nameplate .name {' +
    'flex-grow: 1;' +
    'flex-shrink: 0;' +
    '}', 6);

var width = window.innerWidth;
var height = window.innerHeight;
var gravity = 0.001;
var entities = [];

window.addEventListener('resize', function () {
    width = window.innerWidth;
    height = window.innerHeight;
});

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
    this.restTime = 0;
}
Cannon.idleShootDelay = 500;
Cannon.prototype = Object.create(GravityEntity.prototype);
Cannon.prototype.tick = function(dTime) {
    GravityEntity.prototype.tick.call(this, dTime);

    if (!this.hasFired && this.lifetime > 500) {
        this.fire();
        this.hasFired = true;
    }

    var plate = Nameplate.instance;
    if (plate != null && this.getBottom() > plate.getTop()) {
        var newY = plate.getTop() - this.halfHeight;
        this.setPosition(this.x, newY);
        this.restTime += dTime;

        if (!this.hasFired && this.restTime > Cannon.idleShootDelay) {
            this.fire();
            this.hasFired = true;
        }
    } else {
        this.restTime = 0;
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

/**
 * @param {Follower} follower
 * @constructor
 */
function Nameplate(follower) {
    GravityEntity.call(this, 0, 0, 'nameplate');
    this.lifetime = 0;
    this.boundByGravity = false;

    if (Nameplate.instance != null) {
        throw "Nameplate already exists!";
    }
    Nameplate.instance = this;

    this.setPosition(width/2, height+this.halfHeight);

    if (follower.notified) {
        this.element.classList.add('notified');
    }

    if (follower.logo) {
        var logoImg = document.createElement('img');
        logoImg.classList.add('logo');
        logoImg.src = follower.logo;
        this.element.appendChild(logoImg);
    }

    var name = document.createElement('div');
    name.classList.add('name');
    name.textContent = follower.name;
    this.element.appendChild(name);
}

Nameplate.instance = null;
Nameplate.buildDuration = 500;
Nameplate.droptime = 5000;
Nameplate.prototype = Object.create(GravityEntity.prototype);
Nameplate.prototype.tick = function(dTime) {
    GravityEntity.prototype.tick.call(this, dTime);

    this.lifetime += dTime;
    if (!this.boundByGravity && this.lifetime < Nameplate.buildDuration) {
        var progress = (this.lifetime / Nameplate.buildDuration);
        var easeOutQuad = progress*(2-progress);
        var newY = height + this.halfHeight - (300 * easeOutQuad);
        this.setPosition(this.x, newY);
    }

    if (this.lifetime > Nameplate.droptime) {
        this.drop();
    }
};
Nameplate.prototype.kill = function() {
    if (Nameplate.instance !== this) {
        throw "Trying to kill nameplate, but the global one wasn't " +
            "what was expected";
    }
    Nameplate.instance = null;
    GravityEntity.prototype.kill.call(this);
};
Nameplate.prototype.drop = function() {
    this.boundByGravity = true;
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
    var testingFollower = new Follower({
        user: {
            display_name: "Wolfie",
            logo: "http://static-cdn.jtvnw.net/jtv_user_pictures/gowolfie-profile_image-552fee08030a7106-300x300.jpeg",
        },
        notifications: true,
    });

    entities.push(new Nameplate(testingFollower));
    var minX = Nameplate.instance.x - Nameplate.instance.halfWidth;
    var maxX = Nameplate.instance.x + Nameplate.instance.halfWidth;

    var cannons = 5;
    var part = (maxX-minX) / (cannons-1);
    for (var i = 0; i<cannons; i++) {
        var x = part * i;
        entities.push(new Cannon(minX+x, 0));
    }

    followers.forEach(function(follower) {
        var div = document.createElement('div');
        div.textContent = follower.name;
        result.appendChild(div);
    });
};
