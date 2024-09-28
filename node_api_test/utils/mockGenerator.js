import jsf from "json-schema-faker"; // Import json-schema-faker for generating payloads

// Helper function to generate complex payload using json-schema-faker
export const generatePayload = (schema) => {
  jsf.option({
    alwaysFakeOptionals: true, // Ensure optional fields are also generated
  });
  return jsf.generate(schema); // Generate mock data using json-schema-faker
};
