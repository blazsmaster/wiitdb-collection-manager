/**
 * @typedef {Object} ImportXmlResponse
 * @property {boolean} success - Whether the import was successful
 * @property {string} message - Response message
 * @property {Game[]} games - Array of Game objects
 * @property {Filter} filters - Filter options
 */

/**
 * @typedef {Object} Filter
 * @property {string[]} region - Array of region strings
 */

/**
 * @typedef {Object} Game
 * @property {string} id
 * @property {string} name
 * @property {string} region
 * @property {string} language
 * @property {string} developer
 * @property {string} publisher
 * @property {string} type
 */
