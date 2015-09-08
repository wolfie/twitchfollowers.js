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
