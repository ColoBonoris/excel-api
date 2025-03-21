# Decisions taken, but pending of review

- Docker should be installed to run the complete service, I have to include a quick disclaimer and justify it

<br/>
<br/>
<br/>

# Installation

```
git clone <repo>
cd <repo>
yarn install
cp .env.example .env
yarn db:start
yarn dev
```

<br/>
<br/>
<br/>

# Run app

```
yarn db:start
yarn redis:start
yarn dev
```

<br/>
<br/>
<br/>

# Admitted types for each mapping field

- Primitives: String, Number, Boolean
- Arrays: Array<String>, Array<Number>, Array<Boolean>
- Complex types: Object, Date
- JSON parsing: JSON (para cualquier objeto JSON)
- For this first version, these are the only types accepted, fon enhancing, you should modify only `/src/utils/parseMapping.ts` or replace it with another mapping function
- Mapping function can be way more modular and efficient

<br/>
<br/>
<br/>

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
| name | age | scores |
|--------|----:|----------|
| John | 25 | [1,2,3] |
| Alice | 30 | [4,5,6] |

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
  "errors": [{ "col": "age", "row": 3 }]
}
```

---

## **Common Errors**

| Error Message                   | Reason                                         |
| ------------------------------- | ---------------------------------------------- |
| `File and mapping are required` | Missing file or mapping header.                |
| `Invalid mapping`               | Mapping is not a valid JSON object.            |
| `Unknown mapping type`          | The mapping contains an unsupported type.      |
| `Invalid value for Number`      | A value could not be converted to a number.    |
| `Invalid item in Array<Number>` | A non-numeric value was found inside an array. |
