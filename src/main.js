const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const semver = require('semver');

const apiKeyAuth = require('./middleware/authentication');
const CreateRelease = require('./models/CreateRelease');
const ListReleases = require('./models/ListReleases');

require('dotenv').config();
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Route to create a new release
const createReleaseRoute = (db) => (req, res) => {
    let createRelease;

    try {
        createRelease = new CreateRelease(req.body);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    // Validate user inputs
    if (!createRelease.name || !createRelease.version || !createRelease.account || !createRelease.region) {
        return res.status(400).json({ error: 'Invalid input provided.' });
    }

    const query = 'INSERT INTO releases (name, version, account, region) VALUES (?, ?, ?, ?)';
    db.query(query, [createRelease.name, createRelease.version, createRelease.account, createRelease.region], (err, result) => {
        if (err) {
            console.error('Error inserting release:', err);
            return res.status(500).json({ error: 'Failed to create release.' });
        }
        res.status(201).json({ message: 'Release created successfully.', releaseId: result.insertId });
    });
};

// Route to get all releases with pagination
const listReleasesRoute = (db) => (req, res) => {
    let listReleases;

    try {
        listReleases = new ListReleases(req.query);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    // Validate limit and offset are integers
    if (isNaN(listReleases.limit) || isNaN(listReleases.offset)) {
        return res.status(400).json({ error: 'Invalid pagination parameters.' });
    }

    const query = 'SELECT * FROM releases ORDER BY created_at DESC LIMIT ? OFFSET ?';
    db.query(query, [Number(listReleases.limit), Number(listReleases.offset)], (err, results) => {
        if (err) {
            console.error('Error fetching releases:', err);
            return res.status(500).json({ error: 'Failed to fetch releases.' });
        }
        res.status(200).json(results);
    });
};

// Function to detect drift across environments
const detectDrift = (applications, res) => {
    const drifts = [];
    let pendingQueries = applications.length;

    applications.forEach((appName) => {
        const versionsMap = {};
        const environmentMap = {};

        // Create a map to track which versions are deployed in which environments
        db.query('SELECT * FROM releases WHERE name = ?', [appName], (err, results) => {
            if (err) {
                console.error('Failed to fetch releases:', err);
                pendingQueries -= 1;
                if (pendingQueries === 0 && drifts.length === 0) {
                    res.send('No drift detected. Everything is up to date.');
                }
                return;
            }

            // Populate versionsMap with the deployments across environments
            results.forEach((release) => {
                const versionKey = { account: release.account, region: release.region };
                if (!versionsMap[release.version]) {
                    versionsMap[release.version] = [];
                }
                versionsMap[release.version].push(versionKey);

                // Populate environmentMap with the current deployed version for each environment
                const envKey = `${release.account}_${release.region}`;
                environmentMap[envKey] = release.version;
            });

            // Define the expected environments dynamically
            const accounts = ['staging', 'prod_one', 'prod_two', 'prod_three', 'prod_four', 'prod_five'];
            const regions = ['primary', 'secondary'];
            const expectedEnvironments = [];

            accounts.forEach((account) => {
                regions.forEach((region) => {
                    expectedEnvironments.push({ account, region });
                });
            });

            // Determine the latest version using semantic versioning
            let latestVersion = null;
            Object.keys(versionsMap).forEach((version) => {
                if (!latestVersion || semver.gt(version, latestVersion)) {
                    latestVersion = version;
                }
            });

            // Check if any environment is missing the latest version
            const latestVersionEnvironments = versionsMap[latestVersion] || [];
            const drift = {};

            expectedEnvironments.forEach((expectedEnv) => {
                const deployedEnv = latestVersionEnvironments.find(
                    (env) => env.account === expectedEnv.account && env.region === expectedEnv.region
                );

                if (!deployedEnv) {
                    if (!drift[expectedEnv.account]) {
                        drift[expectedEnv.account] = {};
                    }
                    const envKey = `${expectedEnv.account}_${expectedEnv.region}`;
                    const currentVersion = environmentMap[envKey] || 'none';
                    drift[expectedEnv.account][expectedEnv.region] = currentVersion;
                }
            });

            // Add drift information if there are any missing environments
            if (Object.keys(drift).length > 0) {
                drifts.push({
                    [appName]: {
                        latest: latestVersion,
                        drift,
                    },
                });
            }

            // Respond once all queries have completed
            pendingQueries -= 1;
            if (pendingQueries === 0) {
                if (drifts.length > 0) {
                    res.json(drifts);
                } else {
                    res.send('No drift detected. Everything is up to date.');
                }
            }
        });
    });
};

// GET route to detect drift dynamically
const detectDriftRoute = (db) => (req, res) => {
    const applications = [
        'application_one',
        'application_two',
        'application_three',
        'application_four',
        'application_five',
        'application_six',
        'application_seven',
        'application_eight',
        'application_nine',
        'application_ten',
    ];

    detectDrift(applications, res);
};

// Protected with authentication middleware 
// Requires header 'X-API-Key' with a valid API key provided in the .env file
// Inject dependencies into routes
app.post('/release', apiKeyAuth, createReleaseRoute(db));
app.get('/releases', apiKeyAuth, listReleasesRoute(db)); 
app.get('/drift', apiKeyAuth, detectDriftRoute(db));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
