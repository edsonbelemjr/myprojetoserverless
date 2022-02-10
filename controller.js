'use strict';
 
const { responseHelper } = require('./helper');
const repository = require('./repository');

const  mapasController = {
  get(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    repository.getByUserAndId(userId, id)
      .then(result => {
        responseHelper.success(req, res, result);
      })
      .catch(err => {
        responseHelper.error(req, res, err);
      });
  },

  getAll(req, res) {
    const userId = req.headers['x-user-id'];
    repository.getAllByUser(userId)
      .then(result => {
        responseHelper.success(req, res, result);
      })
      .catch(err => {
        responseHelper.error(req, res, err);
      });
  },

  create(req, res) {
    const userId = req.headers['x-user-id'];
    const mapas = {
      username:  req.body.username,
      useremail: req.body.useremail,
      address :   req.body.address,
      cordlat :   req.body.cordlat,
      codlong :   req.body.cordlong
    };

    repository.create(userId, mapas)
      .then(result => {
        responseHelper.success(req, res, result);
      })
      .catch(err => {
        responseHelper.error(req, res, err);
      });
  },

  update(req, res) {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const { userName, userEmail, address, cordLat,cordLong}   = req.body;
    repository.update(userId, id,  { userName, userEmail, address, cordLat,cordLong} )
      .then(result => {
        responseHelper.success(req, res, result);
      })
      .catch(err => {
        responseHelper.error(req, res, err);
      });
  },

  delete(req, res) {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    repository.delete(userId, id)
      .then(result => {
        responseHelper.success(req, res, result);
      })
      .catch(err => {
        responseHelper.error(req, res, err);
      });
  }
};

module.exports = mapasController;

