If you're looking for [SOLUTION.md](./SOLUTION.md), it will be in the same directory as this file.

As the name says, this is a metadata file. It will mainly contain tasks that I will check off as I go forward, with enhancements that I _would_ like to do if I have time. Possibly some comments too. 

The purpose of this file is to showcase my thought process and track my progress.

## Tasks

### Preparations
- [x] Read [README.md](./README.md) - understand the challenge on a high level
- [x] Clone the repository & change `master` branch to `main`, as per the new industry convention
  - [x] git branch -m master main
- [x] Create a repo on my personal GitHub account, invite Shane (@shanenolanwit) and Barry as collaborators (for access)
- [x] Create this file and [SOLUTION.md](./SOLUTION.md) to document & track my progress
- [x] Create a new branch called `feature/solution` to work on the solution
  - [x] `git checkout -b feature/solution`

### 1. Containerization
- [x] Use **Docker** and **Docker Compose** to containerize the Node.js application and MySQL database.
  - [x] Create `Dockerfile` and `docker-compose.yml` files
  - [x] Dependencies added to `package.json` - refine!
  - [x] mysql container should be initialized using the provided SQL scripts
- [x] Ensure both services can communicate within a Docker network.
  - [x] Docker Compose 
- [x] The MySQL container should be initialized using the provided SQL scripts which can be found in the mysql folder.

### 2. Implement the Drift Detection Logic
- [x] **Enhance the `/drift` Endpoint**:
  - [x] Implement the logic to detect drift in the `GET /drift` endpoint.
  - [x] The endpoint should return a list of applications that are not running the latest version in every `account` and `region`.
  - [x] Expected output format should match the example snippet shown above (see placeholder data in code)
  - [x] The drift detection logic should be optimized for security, performance and efficiency.

### 3. Secure the Node.js Application
- **a) Authentication**:
  - [x] Add an API key authentication middleware to one or more endpoints. A basic API key implementation is acceptable, but ensure the key is passed securely in request headers.
- **b) Input Sanitization**:
  - [x] Sanitize inputs to prevent SQL injection attacks.
  - [x] Use parameterized queries for all database interactions.

### 4. Secure the MySQL Database
- **a) Secure the Root User**:
  - [x] Set a complex root password for the MySQL instance. - `MYSQL_RANDOM_ROOT_PASSWORD` is set to `yes` in `docker-compose.yml`
- **b) Create a MySQL User with Limited Privileges**:
  - [x] Create a new MySQL user that has only the necessary privileges (e.g., `SELECT`, `INSERT`, `UPDATE`) on the `releases` table. - Refine!
  - [x] Update the Node.js application to use this new user for database interactions.

### 5. Secure the Docker Containers
- [x] Implement best practices for Docker security:
  - [x] Use a minimal base image for the Node.js application to reduce the attack surface.
  - [x] Run the Node.js application as a non-root user inside the container.
  - [x] Use Docker secrets to store sensitive information like database passwords.
- [x] Document any other security measures you implement for containerization.
- [x] Although it is best practice in production. You do not need to isolate the MySQL container from the host network.

### 6. Document the Solution
- [ ] Create a `SOLUTION.md` file that includes:
  - [ ] Instructions for building and running the application using Docker Compose.
  - [ ] Sample (working) `curl` commands for testing the API endpoints (`/createRelease`, `/listReleases`, and `/drift`).
  - [ ] Describe the security measures you took to protect the application, database, and Docker setup.

## Deliverables
- [x] A working `docker-compose.yml` file.
    - [x] `docker-compose up` should reliably start the Node.js application and MySQL database without errors.
- [x] An updated Node.js application with:
  - [x] A fully implemented `/drift` endpoint.
  - [x] Authentication on one or more endpoints. - done on all
  - [x] Input sanitization to prevent SQL injection.
- [x] Database updates to add a new MySQL user and secure the root account.
- [x] Documentation in `SOLUTION.md` explaining how to run the solution, including commands and any security practices you applied.

## Assessment Criteria
- **Correctness**: Does the `/drift` endpoint correctly identify environments where the latest application version is not deployed?
- **Security**: Have appropriate measures been implemented to secure the application, database, and containers?
- **Performance**: Is the drift detection logic optimized to handle large datasets efficiently?
- **Documentation**: Are the steps to build, run, and test the application clearly documented?

## Alaa's Comments/Enhancements:
- Fork VS clone
- docker-compose.yml - now just compose (with newer features)
- POST /createRelease: Creates a new release for an application.
- GET /listReleases: Lists all releases in the database.

### To Refine/document:
- `package.json` - `start` script? Latest packages?
- Best way for API key authentication
- In `init.sql`, remove the user creation
- .env
- MYSQL_RANDOM_ROOT_PASSWORD -> can be retrieved from the logs