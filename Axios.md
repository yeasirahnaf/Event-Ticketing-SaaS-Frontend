# Axios – Code & Implementation Guide

This document is a **practical Markdown guide** based on the provided lecture material. It is designed to be directly usable while developing your project. It includes **concepts, setup steps, implementation guidelines, and demo code snippets**.

---

## 1. What is Axios?

**Axios** is a promise-based HTTP client used for making API requests from:

* Browsers (via XMLHttpRequest)
* Node.js (via native HTTP module)

### Key Characteristics

* Isomorphic (works in browser and Node.js)
* Promise-based API (async/await support)
* Automatic JSON serialization
* Supports FormData, file uploads, and URL-encoded data
* Supports request/response interception

---

## 2. Installing Axios

Run inside your frontend project:

```bash
npm install axios
```

Import Axios where needed:

```js
import axios from 'axios';
```

---

## 3. Basic GET Request

### GET with Query Parameter in URL

```js
async function getUser() {
  try {
    const response = await axios.get('http://localhost:3000/user?ID=12345');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

### GET with Parameters Object

```js
async function getUser() {
  try {
    const response = await axios.get('http://localhost:3000/user', {
      params: { ID: 12345 }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

---

## 4. POST Request (JSON Data)

Used to send data to the server.

```js
async function createUser() {
  try {
    const userData = {
      firstName: 'Fred',
      lastName: 'Flintstone'
    };

    const response = await axios.post('http://localhost:3000/user', userData);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

---

## 5. POST HTML Form as JSON

Axios automatically converts form input to JSON if sent as an object.

```js
async function submitForm() {
  try {
    const formData = {
      firstName: 'Fred',
      lastName: 'Flintstone'
    };

    const response = await axios.post('http://localhost:3000/user', formData);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

---

## 6. POST Multipart Form (File Upload)

Used when uploading files or images.

```js
async function postData() {
  try {
    const formData = new FormData();
    formData.append('firstName', 'Fred');
    formData.append('lastName', 'Flintstone');
    formData.append('orders', [1, 2, 3]);
    formData.append('photo', document.querySelector('#fileInput').files[0]);

    const response = await axios.post('http://localhost:3000/post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

---

## 7. PUT Request (Update Data)

```js
async function updateData() {
  try {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30
    };

    const response = await axios.put(
      'http://localhost:3000/users/123',
      data,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

---

## 8. DELETE Request

```js
async function deleteData() {
  try {
    await axios.delete('http://localhost:3000/users/123');
    console.log('Data deleted successfully');
  } catch (error) {
    console.error(error);
  }
}
```

---

## 9. Environment Variables (Next.js)

### Step 1: Create `.env` file

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000
```

⚠️ **Important:**

* Must use `NEXT_PUBLIC_` prefix
* Restart dev server after changes

---

### Step 2: Use Environment Variable

```js
async function getData() {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_ENDPOINT
    );
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

---

## 10. Extracting Axios Response

Axios response structure:

```js
{
  data,
  status,
  statusText,
  headers,
  config
}
```

Most of the time you only need:

```js
const result = response.data;
```

---

## 11. Handling Array vs Object Response (React Example)

```js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AllAdmin() {
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_ENDPOINT + '/admin/index'
      );
      setJsonData(response.data);
    } catch (error) {
      console.error(error);
    }
  }
```

### Render Array Data

```js
const printArray = (jsonData) => (
  jsonData.map((item, index) => (
    <div key={index}>
      <img src={process.env.NEXT_PUBLIC_API_ENDPOINT + '/admin/getimage/' + item.filenames} />
      <h2>ID: {item.id}</h2>
      <h2>Name: {item.name}</h2>
      <h2>Email: {item.email}</h2>
      <hr />
    </div>
  ))
);
```

### Render Object Data

```js
const printObject = (jsonData) => (
  <div>
    <img src={process.env.NEXT_PUBLIC_API_ENDPOINT + '/admin/getimage/' + jsonData.filenames} />
    <h2>ID: {jsonData.id}</h2>
    <h2>Name: {jsonData.name}</h2>
    <h2>Email: {jsonData.email}</h2>
  </div>
);
```

### Conditional Rendering

```js
return (
  <>
    {jsonData !== null && (
      Array.isArray(jsonData)
        ? printArray(jsonData)
        : printObject(jsonData)
    )}
  </>
);
```

---

## 12. Best Practices

* Always use `try/catch` with Axios
* Store base URLs in environment variables
* Use `response.data` instead of full response
* Handle array vs object responses safely
* Keep Axios logic in separate service files for large projects

---

## 13. References

* Axios Documentation: [https://axios-http.com/docs/post_example](https://axios-http.com/docs/post_example)
* MDN Web Docs: [https://developer.mozilla.org/](https://developer.mozilla.org/)
* Next.js Documentation: [https://nextjs.org/](https://nextjs.org/)
* W3Schools: [https://www.w3schools.com](https://www.w3schools.com)

---

**This Markdown file is ready to be used directly in your project documentation or shared with Cursor for implementation.**
