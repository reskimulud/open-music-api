class PlaylistsHandler {
  #service;
  #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.getPlaylistActivitiesdHandler = this.getPlaylistActivitiesdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this.#validator.validatePostPlaylistPayload(request.payload);
    const {name} = request.payload;
    const {id: credentialId} = request.auth.credentials;

    const playlistId = await this.#service.addPlaylist({
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
    this.#validator.validatePostPlaylistSongPayload(request.payload);
    const {id: playlistId} = request.params;
    const {songId} = request.payload;

    const {id: credentialId} = request.auth.credentials;
    await this.#service.verifyPlaylistAccess(playlistId, credentialId);

    const songlistId = await this.#service.addSonglist(playlistId, songId);

    await this.#service.addPlaylistActivity(
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
    const playlists = await this.#service.getPlaylists(credentialId);
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

    await this.#service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this.#service.getPlaylistById(id);
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

    await this.#service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this.#service.getPlaylistActivities(playlistId);

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

    await this.#service.verifyPlaylistOwner(id, credentialId);
    await this.#service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist deleted',
    };
  }

  async deletePlaylistSongByIdHandler(request, h) {
    this.#validator.validateDeletePlaylistSongPayload(request.payload);
    const {id: playlistId} = request.params;
    const {songId} = request.payload;
    const {id: credentialId} = request.auth.credentials;

    await this.#service.verifyPlaylistAccess(playlistId, credentialId);
    await this.#service.deleteSonglistByPlaylistAndSongId(playlistId, songId);
    await this.#service.addPlaylistActivity(
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
