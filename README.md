# API Development and Testing Guide

### Install Node Dependencies

```bash
npm install
```

#### Generate Axios Code

```bash
npm run generate:helper
```

#### Run Test Command

```bash
npm test -- tests/users.test.js
```

#### Download OpenAPI YAML

```bash
node utils/download_openapi.js
```

### Python

#### Install Python Dependencies

```bash
pip install -r fast-api/requirements.txt
```

#### Start Fast API Server

```bash
cd fast-api
uvicorn main:app --reload
```
