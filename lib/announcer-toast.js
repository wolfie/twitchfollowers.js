var resultTopOffset = 0;
var resultTargetOffset = 0;

var toastHeight = 100;
var toastWidth = 400;

/** @type AudioEntity */
var toastAppearSound = new AudioEntity('./sfx/toast_appear.mp3');
/** @type AudioEntity */
var toastDisappearSound = new AudioEntity('./sfx/toast_disappear.mp3');

addRules([
    '.toast {' +
        'position: relative;' +
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
    '}',
    '.logo {' +
        'height: 86px;' +
        'width: 86px;' +
        'flex: 0 0 86px;' +
        'background-color: #301C54;' +
    '}',
    '.name {' +
        'font-family: "Roboto", sans-serif;' +
        'margin: 5px;' +
        'overflow: hidden;' +
        'font-size: 24pt;' +
        'white-space: nowrap;' +
        'text-overflow: ellipsis;'+
    '}',
    '#result {' +
        'position: absolute;' +
    '}',
    '.ribbon {' +
        'position: absolute;' +
        'background-color: #301C54;' +
        'top: 18px;' +
        'right: -26px;' +
        'transform: rotate(45deg);' +
        'font-family: "Roboto", sans-serif;' +
        'padding: 2px 20px;' +
        'font-size: 8pt;' +
    '}'
]);

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

    var ribbon = document.createElement('div');
    ribbon.classList.add('ribbon');
    ribbon.textContent = 'new follower!';

    var logo = document.createElement('img');
    logo.src = follower.logo;
    logo.classList.add('logo');

    var name = document.createElement('div');
    name.textContent = follower.name;
    name.classList.add('name');

    var div = toast.element;
    div.classList.add('toast');
    div.appendChild(ribbon);
    div.appendChild(logo);
    div.appendChild(name);
    result.appendChild(div);

    setTimeout(function() {
        Toast.toasts = Toast.toasts.slice(Toast.toasts.indexOf(toast)-1, 1);
        result.removeChild(toast.element);
        resultTopOffset += toastHeight;
        resultTargetOffset += toastHeight;
        result.style.transform = 'translateY('+resultTopOffset+'px)';
        toastDisappearSound.play();
    }, 8000);

    Toast.toasts.push(toast);
    resultTargetOffset -= toastHeight;
    animator.start();
    toastAppearSound.play();
};

function Animator() {
    this.lastTime = -1;
    this.running = false;
}
Animator.pxPerSec = 300;
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

    toastDisappearSound.volume = 0.5;
})();
