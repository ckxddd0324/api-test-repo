import fs from "fs";
import { join, resolve } from "path"; // Import 'join' and 'resolve' from 'path' core module
import yaml from "yaml";
import prettier from "prettier";

// Read OpenAPI YAML file
const openapiFile = fs.readFileSync("openapi.yaml", "utf8");
const openapiSpec = yaml.parse(openapiFile);

// Create API folder if it doesn't exist
const apiFolder = join(resolve(), "api");
if (!fs.existsSync(apiFolder)) {
  fs.mkdirSync(apiFolder);
}

// Helper function to convert summary to camelCase function name
const summaryToFunctionName = (summary) => {
  if (!summary) return "";
  return summary
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
};

// Function to generate JSDoc for parameters
const generateJSDoc = (
  operation,
  path,
  params,
  queryParams,
  requestBody,
  responses
) => {
  const docLines = [];
  docLines.push("/**");
  docLines.push(
    ` * ${operation.summary || `${operation.method.toUpperCase()} ${path}`}`
  );

  // Add path parameters to JSDoc
  params.forEach((param) => {
    docLines.push(
      ` * @param {string} ${param.name} - ${
        param.description || "Path parameter"
      }`
    );
  });

  // Add query parameters to JSDoc
  if (queryParams.length > 0) {
    docLines.push(" * @param {object} query - Query parameters");
    queryParams.forEach((param) => {
      docLines.push(
        ` * @param {string} query.${param.name} - ${
          param.description || "Query parameter"
        }`
      );
    });
  }

  // Add body parameter to JSDoc if there's a request body
  if (requestBody) {
    docLines.push(" * @param {object} body - Request body");
    docLines.push(" * @param {object} body - Request body properties");
  }

  // Add expected response information
  if (responses) {
    Object.keys(responses).forEach((responseCode) => {
      const response = responses[responseCode];
      docLines.push(
        ` * @returns {Promise<object>} ${
          response.description || "API Response"
        } (HTTP ${responseCode})`
      );
    });
  }

  docLines.push(" */");
  return docLines.join("\n");
};

// Modify the function generation part
const generateFunction = (
  jsdoc,
  functionName,
  method,
  path,
  paramNames,
  queryParamPresent,
  requestBody
) => `
    ${jsdoc}
    export const ${functionName} = async (request, { ${
      paramNames ? `${paramNames}, ` : ""
    }${queryParamPresent ? `query = {}, ` : ""}${requestBody} } = {}) => {
      let url = \`${path}\`;
      ${
        paramNames
          ? `
      // Replace path parameters
      ${paramNames
        .split(", ")
        .map((param) => `url = url.replace('{${param}}', ${param});`)
        .join("\n      ")}
      `
          : ""
      }
      ${
        queryParamPresent
          ? `
      // Add query parameters
      const queryString = new URLSearchParams(query).toString();
      if (queryString) {
        url += \`?\${queryString}\`;
      }
      `
          : ""
      }
      ${
        method === "get" || method === "delete"
          ? `const res = await request.${method}(url);`
          : `const res = await request.${method}(url, ${requestBody} || {});`
      }
      return res;
    };
`;

// Loop through paths in the OpenAPI spec and generate functions
const generatedFunctions = new Set(); // To prevent duplicate functions
const tagFunctions = {}; // Object to store functions for each tag

Object.keys(openapiSpec.paths).forEach((path) => {
  const methods = openapiSpec.paths[path];

  Object.keys(methods).forEach((method) => {
    const operation = methods[method];
    const tags = operation.tags || ["default"]; // Use default tag if none exists

    // Generate function name from summary
    const functionName =
      summaryToFunctionName(operation.summary) ||
      `${method}${path
        .replace(/\//g, "_")
        .replace(/{/g, "")
        .replace(/}/g, "")}`;

    // Skip if function already generated
    if (generatedFunctions.has(functionName)) return;
    generatedFunctions.add(functionName);

    // Parameters (path, query, body)
    const params = (operation.parameters || []).filter((p) => p.in === "path");
    const queryParams = (operation.parameters || []).filter(
      (p) => p.in === "query"
    );
    const requestBody = operation.requestBody ? "body" : "";
    const responses = operation.responses;

    // Generate JSDoc for the function
    const jsdoc = generateJSDoc(
      operation,
      path,
      params,
      queryParams,
      requestBody,
      responses
    );

    // Generate function signature with parameters
    const paramNames = params.map((p) => p.name).join(", ");
    const queryParamPresent = queryParams.length > 0;

    // Determine if .send() should be called based on the HTTP method and the presence of a request body
    let requestSend = "";
    if (method === "post" || method === "put" || method === "patch") {
      requestSend = `.send(${requestBody} || {})`;
    }

    // Add query parameters for all methods
    let requestQuery = queryParamPresent ? `.query(query)` : "";

    // Generate the function for the method (GET, POST, etc.)
    const func = generateFunction(
      jsdoc,
      functionName,
      method,
      path,
      paramNames,
      queryParamPresent,
      requestBody
    );

    // Add the function to the appropriate tag(s)
    tags.forEach((tag) => {
      if (!tagFunctions[tag]) {
        tagFunctions[tag] = [];
      }
      tagFunctions[tag].push(func);
    });
  });
});

// Write functions to files, replacing existing content and formatting
Object.keys(tagFunctions).forEach(async (tag) => {
  const tagFilePath = join(apiFolder, `${tag}.js`);
  let fileContent = `// API functions for ${tag}
${tagFunctions[tag].join("\n")}
`;

  try {
    // Format the content using Prettier
    fileContent = await prettier.format(fileContent, {
      parser: "babel",
      semi: true,
      singleQuote: true,
      trailingComma: "es5",
    });

    fs.writeFileSync(tagFilePath, fileContent);
    console.log(`Updated and formatted file: ${tagFilePath}`);
  } catch (error) {
    console.error(`Error formatting file ${tagFilePath}:`, error);
    // Write unformatted content if formatting fails
    fs.writeFileSync(tagFilePath, fileContent);
    console.log(`Updated file (unformatted): ${tagFilePath}`);
  }
});

console.log(
  `API methods have been generated, formatted, and saved to the api folder`
);
