window.testOne = function() {
    var testingFollower = new Follower({
        user: {
            display_name: "Wolfie",
            logo: "http://static-cdn.jtvnw.net/jtv_user_pictures/gowolfie-profile_image-552fee08030a7106-300x300.jpeg",
        },
        notifications: true,
    });

    window.announceNewFollowers([testingFollower]);
};

window.testTwo = function() {
    var followers = [
        new Follower({
            user: {
                display_name: "Wolfie Wolfie Wolfie Wolfie",
                logo: "http://static-cdn.jtvnw.net/jtv_user_pictures/gowolfie-profile_image-552fee08030a7106-300x300.jpeg",
            },
            notifications: true,
        }),
        new Follower({
            user: {
                display_name: "WolfieWolfieWolfieWolfie",
                logo: "http://static-cdn.jtvnw.net/jtv_user_pictures/gowolfie-profile_image-552fee08030a7106-300x300.jpeg",
            },
            notifications: false,
        }),
    ];

    window.announceNewFollowers(followers);
};

setTimeout(function() {
    if (!config.testmode.enabled) {
        return;
    }

    stop();

    window.testOne();
    setInterval(function() {
        window.testOne();
    }, config.testmode.intervalMillis);
}, 500); // 500 is totally arbitrary
