/* eslint-disable camelcase */
const mapDBSongToModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapDBDetailSongToModel = ({album_id, ...args}) => ({
  ...args,
  albumId: album_id,
});

const mapDBAlbumsToModel = ({id, name, year, cover}) => ({
  id,
  name,
  year,
  coverUrl: cover,
});

module.exports = {
  mapDBSongToModel,
  mapDBDetailSongToModel,
  mapDBAlbumsToModel,
};
