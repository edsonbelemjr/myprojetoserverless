'use strict';
 
const express = require('express');
const bodyParser = require('body-parser');
 
const app= express();
app.use(bodyParser.json());

 
const mapasController = require('./controller');
 
app.get('/notes', mapasController.getAll);
app.get('/notes/:id', mapasController.get);
app.post('/notes', mapasController.create);
app.put('/notes/:id', mapasController.update);
app.delete('/notes/:id', mapasController.delete);


module.exports = app;