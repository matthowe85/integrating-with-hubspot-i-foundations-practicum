const express = require('express');
const axios = require('axios');
const app = express();

require('dotenv').config()

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get('/', async (req, res) => {
    const cars = 'https://api.hubspot.com/crm/v3/objects/cars?properties=name,car_type,color';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(cars, { headers });
        const data = resp.data.results;
        //console.log(data);
        res.render('homepage', { cars: data, title: 'Homepage'  });      
    } catch (error) {
        console.error(error);
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get('/update-cobj', async (req, res) => {
    const cars = 'https://api.hubspot.com/crm/v3/objects/cars';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(cars, { headers });
        const data = resp.data.results;
        res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum', data });      
    } catch (error) {
        console.error(error);
    }
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post('/update-cobj', async (req, res) => {
    const carData = {
        properties: {
            "name": req.body.name,
            "color": req.body.color,
            "car_type": req.body.car_type
        }
    };

    const searchEndpoint = `https://api.hubapi.com/crm/v3/objects/cars/search`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    };

    try {
        const searchBody = {
            "filterGroups": [{
                "filters": [{
                    "propertyName": "name",
                    "operator": "EQ",
                    "value": req.body.name
                }]
            }]
        };

        const searchResponse = await axios.post(searchEndpoint, searchBody, { headers });
        console.log(searchResponse);

        if (searchResponse.data.total > 0) {
            const carId = searchResponse.data.results[0].id; 
            const updateEndpoint = `https://api.hubapi.com/crm/v3/objects/cars/${carId}`;
            await axios.patch(updateEndpoint, carData, { headers });
        } else {
            const createEndpoint = `https://api.hubapi.com/crm/v3/objects/cars/`;
            await axios.post(createEndpoint, carData, { headers });
        }

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred.");
    }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));