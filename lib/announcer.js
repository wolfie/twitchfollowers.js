/**
 * @param {Follower} follower
 * @param done
 */
window.announceNewFollower = function(follower, done) {
    var div = document.createElement('div');
    div.textContent = follower.name;
    result.appendChild(div);
    setTimeout(function() {
        done();
    }, 500);
    setTimeout(function() {
        div.parentNode.removeChild(div);
    }, 2000);
};
