As a summary, the following is the new hierarchy of the repository after the changes:
```bash
├── .env
├── Dockerfile
├── LICENSE
├── README.md
├── SOLUTION.md
├── SOLUTION_metadata.md
├── containers_config
├── docker-compose.yml
├── mysql
│   ├── init.sql
│   └── releases.sql
└── src
    ├── main.js
    ├── middleware
    │   └── authentication.js
    ├── models
    │   ├── CreateRelease.js
    │   └── ListReleases.js
    ├── package-lock.json
    └── package.json
```
# Usage Instructions
## Running the Application
Make sure you have Docker and Docker Compose installed on your machine. Then, follow these steps to run the application:
1. Clone the repository & checkout the `feature/solution` branch:
    ```bash
    git clone
    git checout feature/solution
    ```
2. Create a `.env` file in the **ROOT directory** based on the provided `.env.example` file. (copied into /src and the MySQL container)
3. Build and run the application using Docker Compose:
    ```bash
    docker-compose up --build
    ```
4. The Node.js application will be accessible at `http://localhost:3000`.

## API Endpoints & Sample Requests
### 1. Get All Releases
```bash
curl --request GET \
  --url http://localhost:3000/releases \
  --header 'User-Agent: agent-smith' \
  --header 'X-API-Key: key1'
```
### 2. Create a New Release
```bash
curl --request POST \
  --url http://localhost:3000/release \
  --header 'User-Agent: agent-smith' \
  --header 'X-API-Key: key1' \
  --data '{
    "account": "prod_3",
    "region": "primary",
    "version": "6.6.6",
    "name": "application_5"
}'
```
### 3. Get Drift Information
```bash
curl --request GET \
  --url http://localhost:3000/drift \
  --header 'User-Agent: agent-smith' \
  --header 'X-API-Key: key1'
```

The following are the API endpoints available in the application:
1. `GET /releases`: Get all releases.
2. `POST /release`: Create a new release.
3. `GET /drift`: Get drift information "dynamically".

## I have added the following already in the Pull Request, but I will add them here as well for visibility
### 1. Containerization
- Created `Dockerfile` and `docker-compose.yml` in the main directory, as well as  `.env.template`  (more on that in SOLUTION.md)
- To enable "npm install" command to run, created `package.json` and `package-lock.json` under `src` directory.
- Made sure networking is working between both containers
- Added healthcheck dependency to make sure the MySQL database is initialized before the app has started.


### 2. Implement the Drift Detection Logic
- In `main.js` added `detectDrift` function that evaluates the missing latest version deployments across the applications **dynamically**, and uses sematic versioning ('semver') package to do so. 
- Usage added in `SOLUTION.md`

### 3. Secure the Node.js Application
**a) Authentication**:
- Added authentication middleware for API key validation (`src/middleware/authentication.js`) and updated routes to use this middleware.
- Implemented dynamic drift detection logic in `src/main.js`.

**b) Input Sanitization**:
- Improved input validation and sanitation in `src/main.js` to prevent SQL injection attacks. 

### 4. Secure the MySQL Database
**a) Secure the Root User**:
- Added the parameter `MYSQL_RANDOM_ROOT_PASSWORD`, since the `root` user gets created automatically

**b) Create a MySQL User with Limited Privileges**:
- Updated `mysql/init.sql` to use environment variables for user passwords and added a new MySQL user with limited privileges. (`shane` and `alaa`)
- Parameterized passwords inside `init.sql` 
### 5. Secure the Docker Containers
- Used non-root user for both the database and node container.
- Added some (untested) GitHub Workflows examples to scan the container image & code.

#### These changes (1 -> 5) collectively enhance the application's security, maintainability, and deployment process.

-----------
### 6. Document the Solution
- Added `SOLUTION.md` -- making sure to follow the `README.md` guidance.
- I've also added `SOLUTION_metadata.md` file where I've documented and broke down some of the 


# Security Measures
## Node.js Application

**Authentication**:
- API key authentication middleware is implemented on all endpoints.
- API key is passed securely in request headers.
- API key is validated against a list of allowed keys.
- API key is stored securely in the `.env` file.
- API key is not hardcoded in the application code.
- API key is not exposed in logs or responses.

**SQL Injection Prevention**:
- All database interactions use parameterized queries.
- Inputs are sanitized to prevent SQL injection attacks.
- User inputs are validated and sanitized before being used in queries.
