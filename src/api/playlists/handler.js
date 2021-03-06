class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.getPlaylistActivitiesdHandler = this.getPlaylistActivitiesdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const {name} = request.payload;
    const {id: credentialId} = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });

    const respons = h.response({
      status: 'success',
      message: 'Playlist added',
      data: {
        playlistId,
      },
    });
    respons.code(201);
    return respons;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);
    const {id: playlistId} = request.params;
    const {songId} = request.payload;

    const {id: credentialId} = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const songlistId = await this._service.addSonglist(playlistId, songId);

    await this._service.addPlaylistActivity(
        playlistId,
        credentialId,
        songId,
        'add',
    );

    const response = h.response({
      status: 'success',
      message: 'Song added to playlist',
      data: {
        songlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      message: 'Playlists retrieved',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistByIdHandler(request, h) {
    const {id} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._service.getPlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist retrieved',
      data: {
        playlist,
      },
    };
  }

  async getPlaylistActivitiesdHandler(request, h) {
    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._service.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      message: 'Playlist activities retrieved',
      data: {
        playlistId: playlistId,
        activities,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    const {id} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist deleted',
    };
  }

  async deletePlaylistSongByIdHandler(request, h) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);
    const {id: playlistId} = request.params;
    const {songId} = request.payload;
    const {id: credentialId} = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSonglistByPlaylistAndSongId(playlistId, songId);
    await this._service.addPlaylistActivity(
        playlistId,
        credentialId,
        songId,
        'delete',
    );

    return {
      status: 'success',
      message: 'Song deleted from playlist',
    };
  }
}

module.exports = PlaylistsHandler;
