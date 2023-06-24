
# Beti Exercise

This repo deploys two containers: Redis and Authentication app.
The Authentication app uses Redis to store logged-in users and their tokens.
## Deployment

To deploy this project run

```bash
  docker compose up -d
```


## API Reference

#### Login

```http
  POST /login
```
To login successfully - This API calls receives a username and a password in its body. 
Write a username that starts with "user", password has to be equal to "password".
This API call will return a token which you'll be use for other API calls and the login timestamp.
* If called multiple times - should return the same token.
* If credentials are invalid - returns 401.
* For any other error - returns 500.

| Body Parameter | Type     | Description           |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. Username - starts with "user" |
| `password` | `string` | **Required**. Password - "password" |

Response Body:
| Body Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accessToken` | `string` | An access token for API calls - random GUID, for example: 5849d67b-41ff-4011-b373-8f3962e39a7e |
| `loginTimestamp` | `string` | The datetime the user logged in UTC ISO format, for example: 2023-06-24T08:59:48.280Z |

#### Get item

```http
  GET /action
```

A demo API call using the authentication middleware.
Receives a token in the Authroization header.
For example:
Bearer 5849d67b-41ff-4011-b373-8f3962e39a7e
* If it's called with an invalid token - returns 401 error.
* If the token is valid but it's on the block period (5 minutes after an hour of activity), then it returns 403.
* If the token is valid and it's not on the block period (before one hour or after one hour and 5 minutes), returns "Do something".

