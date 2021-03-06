# twitchfollowers.js

A self-contained JavaScript [Twitch.tv](http://twitch.tv) follower tracker that can be used in
e.g. OBS (and also probably in XSplit, but I haven't tested it).

Access the file with a browser (or the [CLR browser plugin][clr]) and add the channel name after 
a pound sign (e.g. `index.html#gowolfie`).

[clr]: https://obsproject.com/forum/resources/clr-browser-source-plugin.22/

The check is done periodically every so-many minutes, and therefore there might be several followers per
cycle.

## How Does it Work?

Technically, roughly speaking:

1. `channel` := configured in config.js
1. `followers` := current count of followers for `channel`
1. sleep
1. `newFollowers` := all followers for `channel` after `followers` offset
1. if `newFollowers` is empty goto Step 3
1. display each name in `newFollowers`
1. goto Step 3

## Hooks

**`<div id='result'></div>`** is the element that is reserved for displaying whatever 
needs to be displayed.

**`window.announceNewFollowersRaw`** is called whenever a new follower (or _followers_) is found. The result
is an object formatted according to [the Twitch API documentation][doc] containing the new follower(s).

[doc]: https://github.com/justintv/Twitch-API/blob/master/v3_resources/follows.md#get-channelschannelfollows

**`window.announceNewFollowers`** is called, by the function above, with the difference that the
argument is just an array of the new follower(s), represented by objects with three properties: 
`name`, `logo`, and `notifications`.

# Attributions

Sound effects: 

 * [Cannon fire](http://soundbible.com/909-Cannon.html)
 * [Cannon impact](http://soundbible.com/1742-Anvil-Impact-1x.html)
 * [Toast appear](http://soundbible.com/2017-End-Fx.html)
 * [Toast disappear](http://soundbible.com/2067-Blop.html)
