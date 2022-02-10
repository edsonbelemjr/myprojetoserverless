'use strict';

module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Projeto Roda Sistema no AWS',
      },
      null,
      2
    ),
  };
};