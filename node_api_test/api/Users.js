// API functions for Users
import jsf from 'json-schema-faker';

/**
 * Read Users
 * @returns {Promise<object>} Successful Response (HTTP 200)
 */
export const readUsers = async (request, {} = {}) => {
  let url = `/users/`;

  const res = await request.get(url);

  return res;
};

/**
 * Create User
 * @requestBody {object} body - The body of the request
 * @property {integer} body.id -
 * @property {string} body.username -
 * @property {string} body.email -
 * @property {unknown} body.full_name -
 * @returns {Promise<object>} Successful Response (HTTP 201)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const createUser = async (request, { body } = {}) => {
  let url = `/users/`;

  const res = await request.post(url, body || {});

  return res;
};

/**
 * Generate a sample payload for createUser
 * @param {object} [overrides] - Optional overrides for the generated payload
 * @returns {object} Sample payload
 */
export const generateCreateUserPayload = (overrides = {}) => {
  const schema = require('../schemas/User.json');
  const payload = jsf.generate(schema);
  return { ...payload, ...overrides };
};

/**
 * Read User
 * @param {string} user_id - Path parameter
 * @returns {Promise<object>} Successful Response (HTTP 200)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const readUser = async (request, { user_id } = {}) => {
  let url = `/users/{user_id}`;

  // Replace path parameters
  url = url.replace('{user_id}', user_id);

  const res = await request.get(url);

  // Validate response against User schema
  const schema = require('../schemas/User.json');
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(res.body);
  if (!valid) {
    console.error('Schema validation failed:', validate.errors);
  }

  return res;
};

/**
 * Update User
 * @param {string} user_id - Path parameter
 * @requestBody {object} body - The body of the request
 * @property {integer} body.id -
 * @property {string} body.username -
 * @property {string} body.email -
 * @property {unknown} body.full_name -
 * @returns {Promise<object>} Successful Response (HTTP 200)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const updateUser = async (request, { user_id, body } = {}) => {
  let url = `/users/{user_id}`;

  // Replace path parameters
  url = url.replace('{user_id}', user_id);

  const res = await request.put(url, body || {});

  // Validate response against User schema
  const schema = require('../schemas/User.json');
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(res.body);
  if (!valid) {
    console.error('Schema validation failed:', validate.errors);
  }

  return res;
};

/**
 * Generate a sample payload for updateUser
 * @param {object} [overrides] - Optional overrides for the generated payload
 * @returns {object} Sample payload
 */
export const generateUpdateUserPayload = (overrides = {}) => {
  const schema = require('../schemas/User.json');
  const payload = jsf.generate(schema);
  return { ...payload, ...overrides };
};

/**
 * Delete User
 * @param {string} user_id - Path parameter
 * @returns {Promise<object>} Successful Response (HTTP 200)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const deleteUser = async (request, { user_id } = {}) => {
  let url = `/users/{user_id}`;

  // Replace path parameters
  url = url.replace('{user_id}', user_id);

  const res = await request.delete(url);

  // Validate response against User schema
  const schema = require('../schemas/User.json');
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(res.body);
  if (!valid) {
    console.error('Schema validation failed:', validate.errors);
  }

  return res;
};
