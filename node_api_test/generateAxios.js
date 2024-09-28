import fs from "fs";
import { join, resolve } from "path";
import yaml from "yaml";
import prettier from "prettier";
import Ajv from "ajv";
import jsf from "json-schema-faker";

// Read OpenAPI YAML file
const openapiFile = fs.readFileSync("openapi.yaml", "utf8");
const openapiSpec = yaml.parse(openapiFile);

// Create folders if they don't exist
const apiFolder = join(resolve(), "api");
const schemasFolder = join(resolve(), "schemas");
if (!fs.existsSync(apiFolder)) fs.mkdirSync(apiFolder);
if (!fs.existsSync(schemasFolder)) fs.mkdirSync(schemasFolder);

// Helper function to convert summary to camelCase function name
const summaryToFunctionName = (summary) => {
  if (!summary) return "";
  return summary
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
};

// Helper function to resolve schema reference and return schema object
const resolveSchemaRef = (ref) => {
  const refPath = ref.replace("#/components/schemas/", "");
  return openapiSpec.components.schemas[refPath];
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
      ` * @param {string} ${param.name} - ${param.description || "Path parameter"}`
    );
  });

  // Add query parameters to JSDoc
  if (queryParams.length > 0) {
    docLines.push(" * @param {object} query - Query parameters");
    queryParams.forEach((param) => {
      docLines.push(
        ` * @param {string} query.${param.name} - ${param.description || "Query parameter"}`
      );
    });
  }

  // Add request body description using @requestBody with a breakdown of its properties
  if (requestBody) {
    const bodySchema = resolveSchemaRef(
      requestBody.content["application/json"].schema.$ref
    );
    docLines.push(" * @requestBody {object} body - The body of the request");

    Object.keys(bodySchema.properties).forEach((prop) => {
      const propDetails = bodySchema.properties[prop];
      const propType = propDetails.type || "unknown";
      const propDescription = propDetails.description || "";
      docLines.push(
        ` * @property {${propType}} body.${prop} - ${propDescription}`
      );
    });
  }

  // Add expected response information
  if (responses) {
    Object.keys(responses).forEach((responseCode) => {
      const response = responses[responseCode];
      docLines.push(
        ` * @returns {Promise<object>} ${response.description || "API Response"} (HTTP ${responseCode})`
      );
    });
  }

  docLines.push(" */");
  return docLines.join("\n");
};

// Function to generate function code
const generateFunction = (
  jsdoc,
  functionName,
  method,
  path,
  paramNames,
  queryParamPresent,
  requestBody,
  responseSchemaName
) => `
    ${jsdoc}
    export const ${functionName} = async (request, { ${paramNames ? `${paramNames}, ` : ""}${
      queryParamPresent ? `query = {}, ` : ""
    }${requestBody ? "body" : ""} } = {}) => {
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
          : `const res = await request.${method}(url, ${requestBody ? "body" : "{}"} || {});`
      }

      ${
        responseSchemaName
          ? `
      // Validate response against ${responseSchemaName} schema
      const schema = require('../schemas/${responseSchemaName}.json');
      const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const valid = validate(res.body);
      if (!valid) {
        console.error('Schema validation failed:', validate.errors);
      }
      `
          : ""
      }

      return res;
    };
`;

// Function to generate payload generator function code
const generatePayloadFunction = (functionName, schemaName) => `
    /**
     * Generate a sample payload for ${functionName}
     * @param {object} [overrides] - Optional overrides for the generated payload
     * @returns {object} Sample payload
     */
    export const generate${functionName.charAt(0).toUpperCase() + functionName.slice(1)}Payload = (overrides = {}) => {
      const schema = require('../schemas/${schemaName}.json');
      const payload = jsf.generate(schema);
      return { ...payload, ...overrides };
    };
`;

// Function to generate schemas and save them as JSON files
const generateSchemas = () => {
  const schemas = openapiSpec.components?.schemas || {};

  Object.keys(schemas).forEach((schemaName) => {
    const schemaContent = JSON.stringify(schemas[schemaName], null, 2);
    const schemaFilePath = join(schemasFolder, `${schemaName}.json`);

    fs.writeFileSync(schemaFilePath, schemaContent);
    console.log(`Schema generated for ${schemaName}: ${schemaFilePath}`);
  });
};

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
      `${method}${path.replace(/\//g, "_").replace(/{/g, "").replace(/}/g, "")}`;

    // Skip if function already generated
    if (generatedFunctions.has(functionName)) return;
    generatedFunctions.add(functionName);

    // Parameters (path, query, body)
    const params = (operation.parameters || []).filter((p) => p.in === "path");
    const queryParams = (operation.parameters || []).filter(
      (p) => p.in === "query"
    );
    const requestBody = operation.requestBody ? operation.requestBody : null;
    const responses = operation.responses;

    // Extract response schema reference (if exists)
    const responseSchema =
      responses?.["200"]?.content?.["application/json"]?.schema;
    const responseSchemaName = responseSchema
      ? responseSchema.$ref?.split("/").pop()
      : null;

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

    // Generate the function for the method (GET, POST, etc.)
    const func = generateFunction(
      jsdoc,
      functionName,
      method,
      path,
      paramNames,
      queryParamPresent,
      requestBody ? "body" : null,
      responseSchemaName
    );

    // Add the function to the appropriate tag(s)
    tags.forEach((tag) => {
      if (!tagFunctions[tag]) {
        tagFunctions[tag] = [];
      }
      tagFunctions[tag].push(func);
    });

    // Generate payload function if requestBody exists
    if (requestBody) {
      const bodySchemaName = requestBody.content["application/json"].schema.$ref
        .split("/")
        .pop();
      const payloadFunc = generatePayloadFunction(functionName, bodySchemaName);
      tags.forEach((tag) => {
        tagFunctions[tag].push(payloadFunc);
      });
    }
  });
});

// Write functions to files, replacing existing content and formatting
Object.keys(tagFunctions).forEach(async (tag) => {
  const tagFilePath = join(apiFolder, `${tag}.js`);
  let fileContent = `// API functions for ${tag}
import jsf from 'json-schema-faker';
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

// Generate schemas
generateSchemas();

// Generate API methods
console.log(
  `API methods and schemas have been generated and saved to the api folder`
);
