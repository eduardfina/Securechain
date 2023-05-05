// Define constants for the API endpoint and request parameters
const API_ENDPOINT = "https://2f06-81-184-180-154.eu.ngrok.io"

// Get the arguments from the request config
const contractAddress = args[0] // e.g. "New York City"
const process = args[1] // e.g. "Washington DC"
const type = args[2]
const apiKey = secrets.API_KEY;

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

// Make the HTTP request to the Google Maps API
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

// Make the HTTP request to the Google Maps API
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

// Encode and return the distance (in meters), standard duration (in seconds), and duration in traffic (in seconds) as a string which can be parsed and split
return Functions.encodeString(`${valid}`)
