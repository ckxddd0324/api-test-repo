// API functions for Users

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
 * @param {object} body - Request body
 * @param {object} body - Request body properties
 * @returns {Promise<object>} Successful Response (HTTP 200)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const createUser = async (request, { body } = {}) => {
  let url = `/users/`;

  const res = await request.post(url, body || {});
  return res;
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
  return res;
};

/**
 * Update User
 * @param {string} user_id - Path parameter
 * @param {object} body - Request body
 * @param {object} body - Request body properties
 * @returns {Promise<object>} Successful Response (HTTP 200)
 * @returns {Promise<object>} Validation Error (HTTP 422)
 */
export const updateUser = async (request, { user_id, body } = {}) => {
  let url = `/users/{user_id}`;

  // Replace path parameters
  url = url.replace('{user_id}', user_id);

  const res = await request.put(url, body || {});
  return res;
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
  return res;
};
