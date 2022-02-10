'use strict';

const MapasSchema = require('./model');
const { ErrorHelper } = require('./helpers');

const _getByUserAndId = (userId, id) => {
  return MapasSchema.get({ userId, id })
    .then(mapaResult => {
      if (mapaResult) {
        const { id, username, useremail, address, cordlat, cordlong, createdAt, updatedAt } = mapaResult;
        return Promise.resolve({ id, username, useremail, address, cordlat, cordlong, createdAt, updatedAt });
      }

      return Promise.reject(new ErrorHelper('Notes not found', 404, 'note'));
    });
};

const repository = {
  getByUserAndId(userId, id) {
    return _getByUserAndId(userId, id);
  },

  getAllByUser(userId) {
    return MapasSchema.query({ userId })
      .exec()
      .then(mapasResult => {
        if (mapasResult) {
          const mapasToResponse = mapasResult.map(mapresult => {
            const { id, username, useremail, address, cordlat, cordlong, createdAt, updatedAt } = mapresult;
            return { id, username, useremail, address, cordlat, cordlong, createdAt, updatedAt };
          });
          return Promise.resolve(mapasToResponse);
        }

        return Promise.resolve([]);
      });
  },

  create(userId, note) {
    const {  id,username, useremail, address, cordlat, cordlong, createdAt, updatedAt   } = mapasresp;
    return MapasSchema.create({ id,username, useremail, address, cordlat, cordlong, createdAt, updatedAt })
      .then(mapaCreated => {
        const { id, username, useremail, address, cordlat, cordlong, createdAt, updatedAt } = mapaCreated;
        return Promise.resolve({ id, username, useremail, address, cordlat, cordlong, createdAt, updatedAt });
      });
  },

  update(userId, id, mapas) {
    return _getByUserAndId(userId, id)
      .then(() => {
        const { username, useremail, address, cordlat, cordlong  } =mapas;
        return MapasSchema.update({ userId, id }, { username, useremail, address, cordlat, cordlong  })
          .then(mapasUpdated => {
            const {  id,username, useremail, address, cordlat, cordlong, createdAt, updatedAt } = mapasUpdated;
            return Promise.resolve({ id, username, useremail, address, cordlat, cordlong, createdAt, updatedAt });
          });
      });
  },

  delete(userId, id) {
    return _getByUserAndId(userId, id)
      .then(mapaResult => {
        return MapasSchema.delete({ userId, id })
          .then(() => {
            return Promise.resolve(mapaResult);
          });
      });
  }
};

module.exports = repository;