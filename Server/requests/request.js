// Define constants for the API endpoint and request parameters
// Must set the endpoint where the server is deployed, I used ngrok to connect with localhost
const API_ENDPOINT = "[API_ENDPOINT]"

if (
    !secrets.API_KEY
) {
    throw Error(
        "Need to set API_KEY environment variable"
    )
}

// Get the arguments from the request config
const contractAddress = args[0]
const process = args[1]
const type = args[2]
const apiKey = secrets.apiKey || "";

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
}

// build HTTP request object
const isValidRequest = {
    method: "GET",
    headers: headers,
    url: `${API_ENDPOINT}/isValid?contractAddress=${contractAddress}&process=${process}&type=${type}`
}

// Make the HTTP request to the API
let request = Functions.makeHttpRequest(isValidRequest)
let response

try {
    response = await request
} catch (error) {
    throw new Error(`Request failed: ${error.message}`)
}

// Check if the response status is OK
if (response.status !== 200) {
    throw new Error(`API returned an error: ${response.statusText}`)
}

// Extract the relevant data from the response
let valid = response.data.valid

// Check if the response contains the expected properties
if (valid === null) {
    throw new Error(`API response is missing expected data: ${response}`)
}

if (!valid) {
    throw new Error(`The validation is not valid!`);
}

// build HTTP request object
const closeValidationRequest = {
    method: "POST",
    headers: headers,
    url: `${API_ENDPOINT}/closeValidation`,
    data: {
        "contractAddress": contractAddress,
        "process": process,
        "type": type
    }
}

// Make the HTTP request to the API
request = Functions.makeHttpRequest(closeValidationRequest)
response

try {
    response = await request
} catch (error) {
    throw new Error(`Request failed: ${error.message}`)
}

// Check if the response status is OK
if (response.status !== 200) {
    throw new Error(`API returned an error: ${response.statusText}`)
}

// Encode and return if the function is valid (boolean)
return Functions.encodeString(`${valid}`)
