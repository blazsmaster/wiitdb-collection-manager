/**
 * @typedef {Object} ImportXmlResponse
 * @property {boolean} success - Whether the import was successful
 * @property {string} message - Response message
 * @property {Game[]} games - Array of Game objects
 * @property {Filter} filters - Filter options
 */

/**
 * @typedef {Object} Filter
 * @property {string[]} region
 * @property {string[]} language
 * @property {string[]} developer
 * @property {string[]} publisher
 * @property {string[]} type
 */

/**
 * @typedef {Object} ActiveFilter
 * @property {string} region - Selected region
 * @property {string} language - Selected language
 * @property {string} developer - Selected developer
 * @property {string} publisher - Selected publisher
 * @property {string} regionCode - Selected region code
 * @property {string} type - Selected system type
 */

/**
 * @typedef {Object} Game
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} region
 * @property {string} language
 * @property {string} developer
 * @property {string} publisher
 * @property {string} type
 */

/**
 * @typedef {Object} LanguageSrc
 * @property {string} name
 * @property {string} code
 * @property {string} url
 */