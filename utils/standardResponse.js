/**
 * @typedef {import('express').Response} Response
 */
/**
 *
 * @param {Response} response
 * @param {object} data
 * @param {string|undefined} message
 */
const ok = (response, data, message = 'successfull operation') => {
  response.status(200).json({
    status: 1,
    message,
    data,
  });
};

const created = (response, data, message = 'deleted successfully') => {
  response.status(200).json({
    status: 1,
    message,
    data,
  });
};

const deleted = (response, data, message = 'deleted successfully') => {
  response.status(204);
};
module.exports = { ok, created, deleted };
