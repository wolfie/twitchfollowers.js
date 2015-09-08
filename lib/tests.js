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
                display_name: "Wolfie 1",
                logo: "http://static-cdn.jtvnw.net/jtv_user_pictures/gowolfie-profile_image-552fee08030a7106-300x300.jpeg",
            },
            notifications: true,
        }),
        new Follower({
            user: {
                display_name: "Wolfie 2",
                logo: "http://static-cdn.jtvnw.net/jtv_user_pictures/gowolfie-profile_image-552fee08030a7106-300x300.jpeg",
            },
            notifications: false,
        }),
    ];

    window.announceNewFollowers(followers);
};
