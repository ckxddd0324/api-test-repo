// API functions for Items

/**
 * Get Items
 * @returns {Promise<object>} Successful Response (HTTP 200)
 */
export const getItems = async (request, {} = {}) => {
  let url = `/items/`;

  const res = await request.get(url);

  return res;
};

/**
 * Create Item
 * @requestBody {object} body - The body of the request
 * @property {integer} body.id -
 * @property {string} body.name -
 * @property {string} body.description -
 * @property {number} body.price -
 * @property {number} body.tax -
 * @returns {Promise<object>} Successful Response (HTTP 201)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const createItem = async (request, { body } = {}) => {
  let url = `/items/`;

  const res = await request.post(url, body || {});

  return res;
};

/**
 * Get Item By Id
 * @param {string} item_id - Path parameter
 * @returns {Promise<object>} Successful Response (HTTP 200)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const getItemById = async (request, { item_id } = {}) => {
  let url = `/items/{item_id}`;

  // Replace path parameters
  url = url.replace('{item_id}', item_id);

  const res = await request.get(url);

  // Validate response against Item schema
  const schema = require('../schemas/Item.json');
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(res.body);
  if (!valid) {
    console.error('Schema validation failed:', validate.errors);
  }

  return res;
};

/**
 * Update Item
 * @param {string} item_id - Path parameter
 * @requestBody {object} body - The body of the request
 * @property {integer} body.id -
 * @property {string} body.name -
 * @property {string} body.description -
 * @property {number} body.price -
 * @property {number} body.tax -
 * @returns {Promise<object>} Successful Response (HTTP 200)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const updateItem = async (request, { item_id, body } = {}) => {
  let url = `/items/{item_id}`;

  // Replace path parameters
  url = url.replace('{item_id}', item_id);

  const res = await request.put(url, body || {});

  // Validate response against Item schema
  const schema = require('../schemas/Item.json');
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(res.body);
  if (!valid) {
    console.error('Schema validation failed:', validate.errors);
  }

  return res;
};

/**
 * Delete Item
 * @param {string} item_id - Path parameter
 * @returns {Promise<object>} Successful Response (HTTP 200)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const deleteItem = async (request, { item_id } = {}) => {
  let url = `/items/{item_id}`;

  // Replace path parameters
  url = url.replace('{item_id}', item_id);

  const res = await request.delete(url);

  return res;
};
