class AlbumsHandler_v1 {
  constructor(service, validator, storageService_v3) {
    this._service = service;
    this._validator = validator;
    this._storageService_v3 = storageService_v3;
  }

  async postAlbumHandler_v1(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    return h
      .response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: { albumId },
      })
      .code(201);
  }

  async getAlbumByIdHandler_v1(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    const response = {
      status: 'success',
      data: { album },
    };

    if (album.source === 'cache') {
      response.header = { 'X-Data-Source': 'cache' };
    }

    return h.response(response);
  }

  async putAlbumByIdHandler_v1(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);

    return h.response({
      status: 'success',
      message: 'Album berhasil diubah',
    });
  }

  async deleteAlbumByIdHandler_v1(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
  }

  async postUploadCoverHandler_v3(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateAlbumCover(cover.hapi.headers);

    const filename = await this._storageService_v3.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums_v1/file/covers/${filename}`;

    await this._service.postAlbumCoverById(id, fileLocation);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }

  async postAlbumLikeHandler_v3(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    const message = await this._service.postUserAlbumLikeById(credentialId, albumId);

    return h.response({
      status: 'success',
      message: message,
    }).code(201);
  }

  async getAlbumLikesHandler_v3(request, h) {
    const { id: albumId } = request.params;
    const likes = await this._service.getUserAlbumLikesById(albumId);

    const response = {
      status: 'success',
      data: { likes: likes.albumLikes },
    };

    if (likes.source === 'cache') {
      response.header = { 'X-Data-Source': 'cache' };
    }

    return h.response(response);
  }
}

module.exports = AlbumsHandler_v1;
