const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlist/{playlistId}',
    handler: handler.postExportPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
