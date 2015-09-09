var resultTopOffset = 0;
var resultTargetOffset = 0;

// TODO: move these configurations to config.js
var toastHeight = 100;
var toastWidth = 400;

var style = document.createElement('style');
style.appendChild(document.createTextNode('')); // webkit needs this?
document.head.appendChild(style);
var sheet = style.sheet;
sheet.insertRule('.toast {' +
    'height: '+toastHeight+'px;'+
    'width: '+toastWidth+'px;'+
    'overflow: hidden;'+
    'display: flex;'+
    'align-items: center;' +
    'box-sizing: border-box;' +
    'padding: 5px;' +
    'background-color: #6441a5;' +
    'border: 2px solid white;' +
    'border-radius: 5px;' +
    'color: white;'+
'}', 0);
sheet.insertRule('.logo {' +
    'height: 86px;' +
    'width: 86px;' +
    'flex: 0 0 86px;' +
    'background-color: #301C54;' +
'}', 1);
sheet.insertRule('.name {' +
    'font-family: "Roboto", sans-serif;' +
    'margin: 5px;' +
    'overflow: hidden;' +
    'font-size: 24pt;' +
    'white-space: nowrap;' +
    'text-overflow: ellipsis;'+
'}', 2);
sheet.insertRule('#result {' +
    'position: absolute;' +
'}', 3);

WebFontConfig = {
    google: { families: [ 'Roboto::latin' ] }
};
(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

function Toast() {
    this.element = document.createElement('div');
}
Toast.toasts = [];

Toast.factory = function(follower) {
    var toast = new Toast();
    var logo = document.createElement('img');
    logo.src = follower.logo;
    logo.classList.add('logo');

    var name = document.createElement('div');
    name.textContent = follower.name;
    name.classList.add('name');

    var div = toast.element;
    div.classList.add('toast');
    div.appendChild(logo);
    div.appendChild(name);
    result.appendChild(div);

    setTimeout(function() {
        Toast.toasts = Toast.toasts.slice(Toast.toasts.indexOf(toast)-1, 1);
        result.removeChild(toast.element);
        resultTopOffset += toastHeight;
        resultTargetOffset += toastHeight;
        result.style.transform = 'translateY('+resultTopOffset+'px)';
    }, 5000);

    Toast.toasts.push(toast);
    resultTargetOffset -= toastHeight;
    animator.start();
};

function Animator() {
    this.lastTime = -1;
    this.running = false;
}
Animator.pxPerSec = 100;
Animator.prototype.start = function() {
    if (!this.running) {
        this.running = true;
        window.requestAnimationFrame(function (timestamp) {
            animator.tick(timestamp);
        });
    }
};
Animator.prototype.tick = function(timestamp) {
    if (this.lastTime < 0) {
        this.lastTime = timestamp;
    } else {
        var dTime = timestamp - this.lastTime;
        resultTopOffset -= Animator.pxPerSec * (dTime/1000);
        resultTopOffset = Math.max(resultTargetOffset, resultTopOffset);
        result.style.transform = 'translateY('+resultTopOffset+'px)';
        this.lastTime = timestamp;
    }

    if (resultTopOffset > resultTargetOffset) {
        window.requestAnimationFrame(function (timestamp) {
            animator.tick(timestamp);
        });
    } else {
        this.running = false;
        this.lastTime = -1;
    }
};
var animator = new Animator();

window.announceNewFollower = function(follower, done) {
    Toast.factory(follower);
    setTimeout(done, 1200);
};

function updateResultPosition() {
    result.style.top = window.innerHeight+'px';
    result.style.left = ((window.innerWidth-toastWidth)/2)+'px';
}

window.addEventListener('resize', updateResultPosition);

(function() {
    updateResultPosition();
})();
