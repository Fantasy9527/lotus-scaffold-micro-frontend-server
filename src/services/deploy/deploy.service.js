// Initializes the `deploy` service on path `/api/deploy`
const createService = require('./deploy.class.js');
const hooks = require('./deploy.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'deploy',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/api/deploy', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/deploy');

  service.hooks(hooks);
};
