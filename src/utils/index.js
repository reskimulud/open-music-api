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

module.exports = {mapDBSongToModel, mapDBDetailSongToModel};
