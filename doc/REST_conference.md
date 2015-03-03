# /api/conferences

## GET /conferences?token=:token

Open an existing conference from a user token.

**Query Parameters:**

- token: A unique token which links an unique user to an unique conference.

**Response Headers:**

- Location: The URL of the conference to redirect to.

**Status Codes:**

- 302 Moved Temporarily
- 404 Not found. No conference found for the given token
- 500 Internal Server Error

**Request:**

    GET /conferences?token=54eb5dff8e7036781b03abad
    Host: localhost:8080

**Response:**

    HTTP/1.1 302 Moved
    Location: /foobar


## GET /conferences/:id

Open the a conference page, creates the conference if needed.

**Response Headers:**

- Location: The URL of the conference to redirect to.

**Status Codes:**

- 302 Moved Temporarily
- 500 Internal Server Error

**Request:**

    GET /conferences/foobar
    Host: localhost:8080

**Response:**

    HTTP/1.1 302 Moved
    Location: /foobar

## PUT /api/conferences/:id

Creates a new conference

**Request Headers:**

- Accept: application/json

**Query Parameters:**

- displayName: The display name of the user creating the public conference

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

The created conference.

**Status Codes:**

- 201 Created

**Request:**

    POST /api/conferences/foobar?displayName=Bruce
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 201 Created
    {
      "_id": "foobar",
      "members": [
        {
          "_id": "123456789",
          "objectType": "hublin:anonymous",
          "id": "creator",
          "displayName": "Bruce"
        }
      ],
      "history": [],
      "timestamps": {
          "creation": "2014-06-03T21:19:18.766Z"
      }
    }

## PUT /conferences/:id

Creates a new conference and redirects to the conference page.

**Request Headers:**

- Location: The URL of the conference

**Status Codes:**

- 302 Moved Temporarily
- 500 Internal Server Error

**Request:**

    POST /conferences/foobar
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 302 Found
    Location: https://hubl.in/foobar


## GET /api/conferences/{id}/members

Get full information about the conference members.

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: The conference ID

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

Array of members.

**Status Codes:**

- 200 OK
- 400 Bad request
- 404 Not found
- 500 Internal server error

**Request:**

    GET /api/conferences/538e3bd6654d7c3307f990fa/members
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 200 OK

    [
      {
        _id: "54eb5dff8e7036781b03abad"
        objectType: "email",
        id: "user1@linagora.com",
        displayName: "user1",
        status: "invited"
      },
      {
        _id: "538e3bd6654d7c3307f990fa"
        objectType: "email",
        id: "user2@linagora.com",
        displayName: "user2",
        status: "invited"
      }
    ]

## PUT /api/conferences/{id}/attendees

Update the current user status as attendee in the conference.

**Request Headers:**

- Accept: application/json

**Request Parameters:**

- action: join|leave

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

No response.

**Status Codes:**

- 204 No content
- 400 Bad request
- 404 Not found
- 500 Internal server error

**Request:**

    PUT /api/conferences/538e3bd6654d7c3307f990fa/attendees?action=join
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 204 No Content

## PUT /api/conferences/{id}/members

Add members to the conference. The caller must be a member of the conference to perform this action.

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: Conference id

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

No response.

**Status Codes:**

- 202 Accepted
- 400 Bad request
- 404 Not found (conference)
- 500 Internal server error

**Request:**

    PUT /api/conferences/538e3bd6654d7c3307f990fa/members
    Accept: application/json
    Host: localhost:8080
    [
      {
        objectType: 'email',
        id: 'user1@linagora.com'
      },
      {
        objectType: 'email',
        id: 'user1@lng.fr'
      }
    ]

**Response:**

    HTTP/1.1 202 Accepted

## DELETE /conferences/{id}/attendees/{user_id}

Delete an attendee from the conference. The caller must write access to the conference to perform this action (creator or moderator).

**Request Headers:**

- Accept: application/json

**Parameters:**

- id: Conference id
- user_id: User to remove as attendee from the conference

**Response Headers:**

- Content-Length: Document size
- Content-Type: application/json

**Response JSON Object**

No response.

**Status Codes:**

- 204 No content
- 400 Bad request
- 404 Not found (conference or user)
- 500 Internal server error

**Request:**

    DELETE /api/conferences/538e3bd6654d7c3307f990fa/attendees/538df8e110eca70000040b1d
    Accept: application/json
    Host: localhost:8080

**Response:**

    HTTP/1.1 204 No Content
