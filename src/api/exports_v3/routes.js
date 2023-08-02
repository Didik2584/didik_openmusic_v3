const routes = (handler) => [{
  method: 'POST',
  path: '/export/playlists/{playlistId}',
  handler: handler.postExportPlaylistsHandler_v3,
  options: {
    auth: 'music_jwt',
  },
}, ];

module.exports = routes;
