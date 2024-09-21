import json
import yaml

# Load the JSON OpenAPI schema
with open("openapi.json", "r") as json_file:
    openapi_data = json.load(json_file)

# Convert to YAML and save to file
with open("openapi.yml", "w") as yaml_file:
    yaml.dump(openapi_data, yaml_file, default_flow_style=False)