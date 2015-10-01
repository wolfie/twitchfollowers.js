/*
 TODO: don't call requestAnimationFrame if nothing needs to be animated.
 DONE: how to display multiple followers at once?
 DONE: cannon distribution on top of nameplate?
 TODO: convert to <canvas> to avoid frame tick?
 TODO: Split tick into graphics and physics
 # AUDIO
     DONE: <audio>
     TODO: nameplate thunk
     TODO: nameplate open thunk (same?)
     DONE: cannon shoot
     DONE: cannon drop
 # GRAPHICS
     TODO: cannon
     TODO: muzzle flare / explosion
     TODO: nameplate backplate
     TODO: nameplate cover
     TODO: particles
     TODO: font for follower name
 # ACTIONS
     DONE: add nameplate
       TODO: ...with a bang
       DONE: ...with the real follower info
     DONE: open nameplate (3d rotations)
     DONE: drop cannons
       DONE: ...on top of nameplate
       DONE: ...and then fire them
       TODO: ...but in a synchronized manner
     DONE: bounce cannons on impact
       DONE: ...with rotation
     TODO: drop everything willy nilly
       TODO: ...cannons
       TODO: ...nameplate
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
    'border-radius: 3px;' +
    'z-index: 2;' + // needed so that they show on top of the nameplate
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
    'z-index: 1;' + // needed so that the cover would obscure the cannons
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
sheet.insertRule('.nameplate .cover {' +
    'position: absolute;' +
    'background-color: grey;' +
    'top: 0;' +
    'left: 0;' +
    'width: 100%;' +
    'height: 100%;' +
    'content: "";' +
    'transform-origin: center bottom;' +
    '}', 7);

var width = window.innerWidth;
var height = window.innerHeight;
var gravity = 0.001;
var doneCallback = null;

window.addEventListener('resize', function () {
    width = window.innerWidth;
    height = window.innerHeight;
});


function VisualEntity(x, y, classname) {
    Entity.call(this, document.createElement('div'));
    this.halfWidth = 0;
    this.halfHeight = 0;
    this.x = x;
    this.y = y;

    this.element.classList.add('visualEntity');
    this.element.classList.add(classname);

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
VisualEntity.prototype.attach = function() {
    Entity.prototype.attach.call(this);
    this.halfWidth = this.element.offsetWidth/2;
    this.halfHeight = this.element.offsetHeight/2;
    this.setPosition(this.x, this.y);
};
VisualEntity.prototype.kill = function() {
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
    this.rotationRate = 0;
    this.rotation = 0;

    this.sound_fire = new AudioEntity('sfx/cannon_fire.mp3');
    this.sound_impact = new AudioEntity('sfx/cannon_impact.wav');
}
Cannon.idleShootDelay = 500;
Cannon.restThreshold = 0.1;
Cannon.prototype = Object.create(GravityEntity.prototype);
Cannon.prototype.attach = function() {
    GravityEntity.prototype.attach.call(this);
    this.sound_fire.attach();
    this.sound_impact.attach();
};
Cannon.prototype.tick = function(dTime) {
    GravityEntity.prototype.tick.call(this, dTime);

    var plate = Nameplate.instance;
    if (plate != null && this.getBottom() > plate.getTop()) {

        if (Math.abs(this.dY) < Cannon.restThreshold) {
            this.restTime += dTime;
            this.rotationRate = 0;
            this.rotation = 0;
        } else {
            this.restTime = 0;
        }

        // check if the cannon bounces
        if (this.dY > Cannon.restThreshold ) {
            this.dY *= -0.7 + Math.random()/5;

            if (this.rotationRate === 0) {
                this.rotationRate = Math.random()*120-60;
            } else {
                this.rotationRate *= -1;
            }
            this.rotation = 0;
            this.sound_impact.play();

            // bonk the nameplate open
            plate.open();
        } else {
            this.dY = 0;
        }

        var newY = plate.getTop() - this.halfHeight;
        this.setPosition(this.x, newY);

        if (!this.hasFired && this.restTime > Cannon.idleShootDelay) {
            this.fire();
            this.hasFired = true;
        }
    } else {
        this.restTime = 0;
    }

    this.rotation += this.rotationRate * dTime/1000;
    this.element.style.transform = 'rotate('+this.rotation+'deg)';
};
Cannon.prototype.fire = function() {
    var deg = 90 - (this.x / width - .5) * 90;
    var varDeg = 20;

    var confetti = [];
    for (var i = 0; i < 50; i++) {
        var confetto = new Confetto(this.x, this.y);
        var r = (Math.random() * varDeg) - varDeg / 2;
        confetto.setDirection(deg + r, .6 + Math.random() * .1);
        confetti.push(confetto);
    }

    confetti.forEach(function (confetto) {
        confetto.attach();
    });
    
    this.sound_fire.play();
};
Cannon.prototype.kill = function() {
    this.sound_fire.kill();
    this.sound_impact.kill();
    VisualEntity.prototype.kill.call(this);
};

function Confetto(x, y) {
    GravityEntity.call(this, x, y, 'confetto');
}
Confetto.prototype = Object.create(GravityEntity.prototype);

/**
 * @constructor
 */
function Nameplate() {
    GravityEntity.call(this, 0, 0, 'nameplate');
    this.lifetime = 0;
    this.boundByGravity = false;
    this.closed = true;
    this.openVelocity = 0;
    this.openDegrees = 0;

    var logo = document.createElement('img');
    logo.classList.add('logo');
    this.logoImg = logo;

    var name = document.createElement('div');
    name.classList.add('name');
    this.nameDiv = name;

    var cover = document.createElement('div');
    cover.classList.add('cover');
    this.coverDiv = cover;
}

/**
 * @param {Follower} follower
 */
Nameplate.factory = function(follower) {
    if (Nameplate.instance != null) {
        throw "Nameplate already exists!";
    }

    var plate = new Nameplate();
    Nameplate.instance = plate;

    plate.setNotified(follower.notified);
    plate.setFollowerInfo(follower.logo, follower.name);
    plate.attach();

    plate.setPosition(width/2, height-(plate.halfHeight*3));

    setTimeout(function() {
        plate.drop();
    }, Nameplate.droptime);

    return plate;
};

Nameplate.instance = null;
Nameplate.buildDuration = 500;
Nameplate.droptime = 5000;
Nameplate.buildtime = 200;
Nameplate.prototype = Object.create(GravityEntity.prototype);

/**
 * @param {boolean} isNotified
 */
Nameplate.prototype.setNotified = function(isNotified) {
    this.element.classList.toggle('notified', isNotified);
};

/**
 * @param {string} logo
 * @param {string} name
 */
Nameplate.prototype.setFollowerInfo = function(logo, name) {
    this.logoImg.src = logo;
    this.nameDiv.textContent = name;
};

Nameplate.prototype.tick = function(dTime) {
    GravityEntity.prototype.tick.call(this, dTime);

    this.lifetime += dTime;
    var progress = Math.min(1, this.lifetime / Nameplate.buildtime);
    this.element.style.opacity = progress;
    this.element.style.transform = 'scale('+(1.5-(progress*0.5))+')';

    if (!this.closed) {
        if (this.openDegrees === 0) {
            this.openDegrees = -1;
        }

        var velocityMultiplier = Math.sin(this.openDegrees/-180*Math.PI);
        this.openVelocity += 0.1*velocityMultiplier;
        this.openDegrees -= this.openVelocity;

        if (this.openDegrees < -180) {
            this.openDegrees = -180;
            this.openVelocity *= -.1;
        }

        this.coverDiv.style.transform = 'perspective(600px) rotateX(' + this.openDegrees + 'deg)';
    }
};
Nameplate.prototype.kill = function() {
    if (Nameplate.instance !== this) {
        throw "Trying to kill nameplate, but the global one wasn't " +
            "what was expected";
    }
    Nameplate.instance = null;
    GravityEntity.prototype.kill.call(this);

    if (!doneCallback) {
        throw "No valid done callback registered";
    }

    setTimeout(function() {
        var done = doneCallback;
        doneCallback = null;
        done();
    }, 500);
};
Nameplate.prototype.attach = function() {
    this.element.appendChild(this.logoImg);
    this.element.appendChild(this.nameDiv);
    this.element.appendChild(this.coverDiv);
    GravityEntity.prototype.attach.call(this);
};
Nameplate.prototype.drop = function() {
    this.boundByGravity = true;
};
Nameplate.prototype.open = function() {
    this.closed = false;
};

var lastTime = -1;
function frame(timestamp) {
    if (lastTime > 0) {
        var dTime = timestamp - lastTime;

        /*
        Without a defensive copy, we would have
        concurrent modifications. And we'd have a
        bad time.
         */
        var entitiesCopy = entities.slice();
        for (var i=entities.length-1; i>=0; i--) {
            entitiesCopy[i].tick(dTime);
        }
    }
    lastTime = timestamp;
    window.requestAnimationFrame(frame);
}
window.requestAnimationFrame(frame);

window.announceNewFollower = function(follower, done) {
    doneCallback = done;
    var plate = Nameplate.factory(follower);
    var minX = plate.x - plate.halfWidth + 10;
    var maxX = plate.x + plate.halfWidth - 10;

    var cannons = 5;
    var part = (maxX-minX) / (cannons-1);
    for (var i = 0; i<cannons; i++) {
        var x = part * i;
        var cannon = new Cannon(minX+x, 0);
        cannon.dY = Math.random() / 10;
        cannon.attach()
    }
};

