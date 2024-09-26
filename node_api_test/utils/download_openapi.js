import axios from "axios";
import fs from "fs/promises";
import yaml from "js-yaml";

// URL to the OpenAPI JSON endpoint
const url = "http://127.0.0.1:8000/openapi.json";

// Path to save the converted YAML file
const outputPath = "./openapi.yaml";

// Function to download OpenAPI JSON and convert it to YAML
const downloadOpenAPI = async () => {
  try {
    // Download the OpenAPI JSON from FastAPI
    const response = await axios.get(url);
    const openapiJson = response.data;

    // Convert the JSON to YAML
    const openapiYaml = yaml.dump(openapiJson);

    // Save the YAML to a file
    await fs.writeFile(outputPath, openapiYaml, "utf8");

    console.log("OpenAPI YAML file downloaded and saved as openapi.yaml");
  } catch (error) {
    console.error("Error downloading OpenAPI JSON:", error.message);
  }
};

// Execute the function
downloadOpenAPI();
