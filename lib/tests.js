/**
 * @returns {Follower}
 */
window.getTestFollower = function() {
    var follower = new Follower();
    follower.name = "Wolfie";
    follower.logo = "http://static-cdn.jtvnw.net/jtv_user_pictures/gowolfie-profile_image-552fee08030a7106-300x300.jpeg";
    follower.notified = false;
    return follower;
};

window.testOne = function() {
    var testFollower = window.getTestFollower();
    testFollower.notifications = true;
    window.announceNewFollowers([testFollower]);
};

window.testTwo = function() {
    var whitespaceUser = window.getTestFollower();
    whitespaceUser.name = "Wolfie Wolfie Wolfie Wolfie";
    whitespaceUser.notified = true;

    var writtenTogetherUser = window.getTestFollower();
    writtenTogetherUser.name = "WolfieWolfieWolfieWolfie";

    window.announceNewFollowers([whitespaceUser, writtenTogetherUser]);
};

setTimeout(function() {
    if (!config.testmode.enabled) {
        return;
    }

    stop();

    var i = 0;
    setInterval(function() {
        var follower = window.getTestFollower();
        follower.name = "Wolfie #"+(i++);
        window.announceNewFollowers([follower]);
    }, config.testmode.intervalMillis);
}, 500); // 500 is totally arbitrary
