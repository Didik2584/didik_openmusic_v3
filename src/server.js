const path = require('path');
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const ClientError = require('./exceptions/ClientError');

const songs_v1 = require('./api/songs_v1');
const SongsValidator_v1 = require('./validator/songs_v1');
const SongsService_v1 = require('./services/postgres/SongsService_v1');
const albums_v1 = require('./api/albums_v1');
const AlbumsService_v1 = require('./services/postgres/AlbumsService_v1');
const AlbumsValidator_v1 = require('./validator/albums_v1');

const users_v2 = require('./api/users_v2');
const UsersService_v2 = require('./services/postgres/UsersService_v2');
const UsersValidator_v2 = require('./validator/users_v2');
const authentications_v2 = require('./api/authentications_v2');
const AuthenticationsService_v2 = require('./services/postgres/AuthenticationsService_v2');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator_v2 = require('./validator/authentications_v2');
const playlists_v2 = require('./api/playlists_v2');
const PlaylistsService_v2 = require('./services/postgres/PlaylistsService_v2');
const PlaylistsValidator_v2 = require('./validator/playlists_v2');
const Collaborations_v2 = require('./api/collaborations_v2');
const CollaborationsService_v2 = require('./services/postgres/CollaborationsServices_v2');
const CollaborationsValidator_v2 = require('./validator/collaborations_v2');

const _exports_v3 = require('./api/exports_v3');
const ProducerService_v3 = require('./services/rabbitmq/ProducerService_v3');
const ExportsValidator_v3 = require('./validator/exports_v3');
const StorageService_v3 = require('./services/storage/StorageService_v3');
const CacheService_v3 = require('./services/redis/CacheService_v3');

const init = async () => {
  const cacheService_v3 = new CacheService_v3();
  const collaborationsService_v2 = new CollaborationsService_v2();
  const albumsService_v1 = new AlbumsService_v1(cacheService_v3);
  const playlistsService_v2 = new PlaylistsService_v2(collaborationsService_v2);
  const authenticationsService_v2 = new AuthenticationsService_v2();
  const usersService_v2 = new UsersService_v2();
  const storageService_v3 = new StorageService_v3(path.resolve(__dirname, 'api/albums_v1/file/covers'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response;
  });

  await server.register([{
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('music_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([{
      plugin: songs_v1,
      options: {
        service: new SongsService_v1(),
        validator: SongsValidator_v1,
      },
    },
    {
      plugin: albums_v1,
      options: {
        service: albumsService_v1,
        validator: AlbumsValidator_v1,
        storageService_v3: storageService_v3,
      },
    },
    {
      plugin: users_v2,
      options: {
        service: usersService_v2,
        validator: UsersValidator_v2,
      },
    },
    {
      plugin: authentications_v2,
      options: {
        authenticationsService_v2,
        usersService_v2,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator_v2,
      },
    },
    {
      plugin: playlists_v2,
      options: {
        service: playlistsService_v2,
        validator: PlaylistsValidator_v2,
      },
    },
    {
      plugin: Collaborations_v2,
      options: {
        collaborationsService_v2,
        playlistsService_v2,
        validator: CollaborationsValidator_v2
      }
    },
    {
      plugin: _exports_v3,
      options: {
        service: ProducerService_v3,
        validator: ExportsValidator_v3,
        playlistsService_v2,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
