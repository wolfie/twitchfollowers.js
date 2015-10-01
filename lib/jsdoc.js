/*
This file is not included from anywhere, thus not contributing to the script's
load time. This file is provided only to developers for the use with JSDoc
aware IDEs.
 */

/**
 * Twitch API response structure for channel followers
 * @typedef {object} TwitchChannelFollowersResponse
 * @property {number} _total total amount of followers on this channel
 * @property {object} _links
 * @property {TwitchChannelFollowInfo[]} follows
 */

/**
 * Twitch API response structure for a single user's follow action
 * @typedef {object} TwitchChannelFollowInfo
 * @property {string} created_at ISO 8601 formatted datetime of when a user started following
 * @property {object} _links
 * @property {boolean} notifications is the user receiving notifications of this channel getting online?
 * @property {TwitchUser} user user info of the follower
 */

/**
 * Twitch API response structure for a single user
 * @typedef {object} TwitchUser
 * @property {object} _links
 * @property {string} type
 * @property {string} bio user's bio
 * @property {string} logo URL to the user's logo
 * @property {string} display_name the user's display name
 * @property {string} created_at ISO 8601 formatted datetime of when user was created
 * @property {string} updated_at ISO 8601 formatted datetime of when user info was updated(?)
 * @property {number} _id user id
 * @property {name} name user name
 */

/**
 * @callback TwitchCallback
 * @param {TwitchChannelFollowersResponse} response
 */


/**
 * @name window.announceNewFollower
 * @function
 * @global
 * @param {Follower} follower
 * @param {DoneCallback} done
 */

/**
 * @name window.announceNewFollowersRaw
 * @function
 * @global
 * @param {TwitchChannelFollowersResponse} response
 */

/**
 * @name window.announceNewFollowers
 * @function
 * @global
 * @param {Follower[]}
 */

/**
 * Call this function once your announcer is ready to accept the next
 * announcement.
 * @callback DoneCallback
 */

/**
 * The element where all DOM elements should be attached to
 * @name result
 * @global
 * @type HTMLDivElement
 */

/**
 * The element where all JSONP data is added to
 * @name data
 * @global
 * @type HTMLDivElement
 */

/**
 * The global configuration object
 * @name config
 * @global
 * @type Config
 */

/**
 * The testmode configuration structure
 * @typedef {object} ConfigTestmode
 * @property {boolean} enabled whether testmode is enabled or not. Enabling
 *  the testmode will skip checking with Twitch and annouce in intervals.
 *  Logging will also be visible.
 * @property {number} intervalMillis the interval in milliseconds for the
 *  test announcements
 */

/**
 * The configuration object for this script
 * @typedef {object} Config
 * @property {string} announcer The announcer to use. Loaded in the format
 *  "lib/announcer-foo.js"
 * @property {ConfigTestmode} testmode configure the testmode
 */
