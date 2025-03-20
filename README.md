# Decisions taken

- Docker should be installed to run the complete service, it runs MongoDB and RabbitMQ services, fundamental to the application's functionality

# Installation

```bash
git clone https://github.com/ColoBonoris/excel-api
cd excel-api
yarn install
cp .env.example .env # Here you'll also find the api keys for both endpoints
```
Note: first run (and not further ones) could fail connecing the worker or the app with any of the services, I ran into this problem and the sollution was only running the worker or app once again

# Run app

```bash
yarn services:start # Runs RabbitMQ and MongoDB containers
yarn worker # Starts the worker process
yarn dev # Starts the server, should be done in other terminal since the previous one will be busy with the worker
```

# Useful commands

```bash
yarn test # Runs all tests
yarn services:stop # Stops both containers
```
For testing the app, you can use the swagger docs and the files `large_test.xlsx` and `test_data` with the mapping inside of `test_mapping.json` as good examples.

# Potential changes

- Interrupted jobs are not being take in consideration, for it we should simply use RabbitMQ's ACK functionality, but avoiding filling up the queue
- Testing could be way more extensive
- Primitives permitted are a considerably short subset of TypeScript primitive datatypes
- We could implement more workers for improving performance

# Admitted types for each mapping field

- Primitives: `String`, `Number`, `Array <Number>`
- For this first version, these are the only types accepted, fon enhancing, you should modify only `/src/utils/parseMapping.ts` or replace it with another mapping function
- Mapping function can be way more modular and efficient
- For adapting to the specifications, `Array <Number>` fields are ordered ascendent when mapping

# Interacting with the API

## **Uploading an Excel File**

### **Endpoint**

`POST /api/upload`

### **Headers**

| Header      | Description                           | Required |
| ----------- | ------------------------------------- | -------- |
| `x-api-key` | API Key for authentication            | ✅ Yes   |
| `mapping`   | JSON object defining the data mapping | ✅ Yes   |

### **Body (multipart/form-data)**

| Field  | Type         | Description              | Required |
| ------ | ------------ | ------------------------ | -------- |
| `file` | File (.xlsx) | The Excel file to upload | ✅ Yes   |

---

## **Mapping Specification**

The `mapping` header must be a **valid JSON object** where each key represents a column, and the value specifies the expected type.

### **Allowed Data Types**

| Type              | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `"String"`        | Converts the value to a trimmed string.                            |
| `"Number"`        | Converts the value to a number (errors if conversion fails).       |
| `"Array<Number>"` | Parses an array of numbers (errors if any element is not numeric). |

### **Normalization Rules**

- **Case insensitive** (`"string"` is the same as `"String"`).
- **Whitespace is ignored** (`" Array < Number > "` is valid).
- **Invalid types cause an error**.

---

## **Example Requests**

### **✅ Valid Mapping**

```json
{
  "name": "String",
  "age": "Number",
  "scores": "Array<Number>"
}
```

**Request Example (`multipart/form-data`):**

```bash
curl -X POST "http://localhost:3000/api/upload" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "mapping: {\"name\":\"String\", \"age\":\"Number\", \"scores\":\"Array<Number>\"}" \
  -F "file=@test_data.xlsx;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
```

---

## **Expected Behavior**

### ✅ **Valid Input**

**Excel Content:**

| name  | age | scores  |
| ----- | --: | ------- |
| John  |  25 | [1,2,3] |
| Alice |  30 | [4,5,6] |

**Processed Output:**

```json
{
  "name": "John",
  "age": 25,
  "scores": [1, 2, 3]
}
```

---

### ❌ **Invalid Mapping Example**

```json
{
  "isActive": "Boolean"
}
```

**Response:**

```json
{
  "error": "Unknown mapping type for key 'isActive': Boolean"
}
```

---

## **Checking Job Status**

### **Endpoint**

`GET /api/status/{jobId}`

You can optionally include two query parameters for pagination:

- **`resultPage`** (number, optional): The 1-based page to retrieve for the result data. Default is `1`.
- **`errorPage`** (number, optional): The 1-based page to retrieve for the error data. Default is `1`.

### **Response**

| Field    | Type                                  | Description                                              |
| -------- | ------------------------------------- | -------------------------------------------------------- |
| `status` | `"pending" \| "processing" \| "done"` | The current job state                                    |
| `result` | `Object`                              | The processed data (only if `status="done"`)             |
| `errors` | `Array`                               | Errors found during processing (only if `status="done"`) |

**Example Response (Job Done)**

```json
{
  "status": "done",
  "result": [{ "name": "John", "age": 25, "scores": [1, 2, 3] }],
  "errors": []
}
```

**Example Response (With Errors)**

```json
{
  "status": "done",
  "result": [{ "name": "Alice", "age": 30, "scores": [4, 5, 6] }],
  "errors": [{ "col": 2, "row": 3 }],
  "resultPage": 0,
  "errorPage": 0
}
```

---
