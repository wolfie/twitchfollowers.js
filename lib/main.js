function QueueManager() {
    this.isRunning = false;
    this.followerQueue = new FollowerQueue();
}

/**
 * @param {Follower[]} followers
 */
QueueManager.prototype.add = function(followers) {
    var success = this.followerQueue.addAll(followers);
    if (success) {

        this.log("Added "+followers.length+" followers to queue. Queue " +
            "is now "+this.followerQueue.length+" follower(s) long.");

        if (!this.isRunning) {
            this.log("Starting animation.");
            this.done();
        } else {
            this.log("Animation already running. Waiting for it to end...");
        }
    }
};

QueueManager.prototype.done = function() {
    this.isRunning = false;
    if (this.followerQueue.isEmpty()) {
        this.log("No more followers in queue. Stop.");
        return;
    }

    var follower = this.followerQueue.remove();

    this.log("Initializing new animation. "+this.followerQueue.length+
        " Follower(s) in queue");

    this.isRunning = true;
    var qm = this;
    window.announceNewFollower(follower, function() {
        qm.log("Done callback called. Checking the queue again.");
        qm.done();
    });
};

QueueManager.prototype.log = function(string) {
    window.log("::["+this.constructor.name+"] "+string);
};

function FollowerQueue() {
    /** @type {Array.<Follower>} */
    this.array = [];
}

Object.defineProperty(FollowerQueue.prototype, 'length', {
    get: function length() {
        return this.array.length;
    }
});

/**
 * @param {Follower} follower
 * @returns boolean true iff succeeded
 */
FollowerQueue.prototype.add = function(follower) {
    this.array.push(follower);
    return true;
};

/**
 * @param {Follower[]} followers
 * @returns boolean true iff succeeded
 */
FollowerQueue.prototype.addAll = function(followers) {
    if (!followers || !Array.isArray(followers)) {
        return false;
    }

    var fq = this;
    followers.forEach(function (follower) {
        fq.add(follower);
    });
    return true;
};

/**
 * @returns {Follower}
 */
FollowerQueue.prototype.remove = function() {
    return this.array.shift();
};

/**
 * @returns boolean true if queue is empty
 */
FollowerQueue.prototype.isEmpty = function() {
    return this.array.length===0;
};

/**
 * @param {TwitchChannelFollowInfo?} twitchData
 * @constructor
 */
function Follower(twitchData) {
    this.name = "";
    this.logo = null;
    this.notified = false;

    if (twitchData) {
        this.name = twitchData.user.display_name;
        this.logo = twitchData.user.logo;
        this.notified = twitchData.notifications;
    }
}

window.queueManager = new QueueManager();

/**
 * @param {Follower[]} followers
 */
window.announceNewFollowers = function(followers) {
    queueManager.add(followers);
};

var API = 'https://api.twitch.tv/kraken/channels';
//var ticklength = 10000; // 10sec in millis
var ticklength = 300000; // 5min in millis
var channel = config.channel;
var timeoutId = 0;

/** @type TwitchChannelFollowInfo[] */
var lastKnownFollowers = [];

/**
 * @param {TwitchChannelFollowersResponse} data
 */
window.followersCallback = function(data) {
    error('receiving jsonp data without a properly configured callback')
};

function resultClear() {
    while (result.firstChild) {
        result.removeChild(result.firstChild);
    }
}

function error(string) {
    console.error(string);

    var errorSpan = document.createElement('span');
    errorSpan.className = 'error';
    errorSpan.textContent = string;

    resultClear();
    result.appendChild(errorSpan);
}

function log(string) {
    console.log(string);

    if (config.testmode.enabled) {
        var div = document.createElement('div');
        div.classList.add('log');
        div.textContent = string;
        document.body.insertBefore(div, document.body.firstChild);
    }
}

/**
 * @param {number} offset
 * @param {number} limit
 * @param {TwitchCallback} callback
 */
function followers(offset, limit, callback) {
    offset = offset || 0;
    limit = limit || 0;

    var URI = API +
        "/" + channel +
        "/follows" +
        "?offset=" + offset +
        "&limit=" + limit +
        "&direction=asc" +
        "&callback=followersCallback" +
        "&api_version=3" +
        "&time="+(new Date().getTime());
    window.followersCallback = callback;

    // fetch data over JSONP
    var dataScript = document.createElement('script');
    dataScript.src = URI;

    data.innerHTML = '';
    data.appendChild(dataScript);
    log('Fetching new followers with '+URI);
}

function tick(previousFollowersCount) {
    window.clearTimeout(timeoutId);

    /**
     * @param {TwitchChannelFollowersResponse} data
     */
    var callback = function(data) {

        /** @type TwitchChannelFollowInfo[] */
        var knownFollowers = data.follows;
        var newFollowersCount = data._total;
        var followersDiff = newFollowersCount - previousFollowersCount;

        /**
         * If we have more followers than before, the lastKnownFollowers will have older
         * data than shown in knownFollowers. So we need to skip them and assume irrelevant
         */
        var iterationOffset = Math.max(0, followersDiff);
        lastKnownFollowers.splice(0, iterationOffset);

        /** @type TwitchChannelFollowInfo[] */
        var newFollowers = [];
        for (var i=0; i<knownFollowers.length; i++) {
            var follower = knownFollowers[i];
            var newFollowerId = follower.user._id;

            var alreadyFollows = false;
            for (var j=0; j<lastKnownFollowers.length; j++) {
                if (lastKnownFollowers[j].user._id === newFollowerId) {
                    alreadyFollows = true;
                    break;
                }
            }

            if (!alreadyFollows) {
                newFollowers.push(follower);
            }
        }

        if (newFollowers.length > 0) {

            /** @type Follower[] */
            var followersToAnnounce = [];
            newFollowers.forEach(function(followerData) {
                followersToAnnounce.push(new Follower(followerData));
            });

            resultClear();
            window.announceNewFollowers(followersToAnnounce);
        } else {
            log('No new followers found ('+newFollowersCount+')');
        }
        tick(newFollowersCount);

        lastKnownFollowers = knownFollowers;
    };

    timeoutId = setTimeout(function() {
        followers(previousFollowersCount, 25, callback);
    }, ticklength);

    var nextTick = new Date();
    nextTick.setMilliseconds(nextTick.getMilliseconds()+ticklength);
    log('Scheduled next tick for '+nextTick);
}

function start() {
    log('Searching initial follower count for "'+channel+'"');
    followers(0, 1, function(followers){
        var initCount = followers._total;
        log('Initial follower count: '+initCount);
        tick(initCount);
    });
}

/**
 * Stops querying the Twitch API for new announcements.
 */
function stop() {
    if (timeoutId !== 0) {
        window.clearInterval(timeoutId);
        log('stopped');
    } else {
        log("Can't stop querying. It didn't even start yet");
    }
}
