class SongsHandler_v1 {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler_v1 = this.postSongHandler_v1.bind(this, );
    this.getSongsHandler_v1 = this.getSongsHandler_v1.bind(this, );
    this.getSongByIdHandler_v1 = this.getSongByIdHandler_v1.bind(this, );
    this.putSongByIdHandler_v1 = this.putSongByIdHandler_v1.bind(this, );
    this.deleteSongByIdHandler_v1 = this.deleteSongByIdHandler_v1.bind(this, );
  }


  async postSongHandler_v1(request,h) {
    this._validator.validateSongPayload(request.payload);

    const { title,year,genre,performer,duration,albumId } = request.payload;
    const songId = await this._service.addSong({ title,year,genre,performer,duration,albumId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201, );
    return response;
  }
  async getSongsHandler_v1(request) {
    const params = request.query;
    const songs = await this._service.getSongs(params);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler_v1(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler_v1(request) {
    this._validator.validateSongPayload(request.payload);

    const { id } = request.params;
    await this._service.editSongById(id, request.payload, );

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler_v1(request) {

    const { id } = request.params;
    await this._service.deleteSongById(id, );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };

  }
}

module.exports = SongsHandler_v1;
