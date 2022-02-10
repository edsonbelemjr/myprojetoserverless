'use strict';

const dynamoose = require('dynamoose');
const uuidv4 = require('uuid/v4');

const MapasSchema = new dynamoose.Schema({
  userId: {
    type: String,
    hashKey: true
  },
  id: {
    type: String,
    rangeKey: true,
    default: uuidv4
  },
  username: String,
  useremail: String,
  address : String,
  cordlat:Number,
  cordlong:Number,
  createdAt: String,
  updatedAt: String
}, { timestamps: true });


module.exports = dynamoose.model('mapas', MapasSchema);