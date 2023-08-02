const ExportsHandler_v3 = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports_v3',
  version: '1.0.0',
  register: async (server, {
    service,
    validator,
    playlistsService_v2
  }) => {
    const exportsHandler_v3 = new ExportsHandler_v3(service, validator, playlistsService_v2);
    server.route(routes(exportsHandler_v3));
  },
};
