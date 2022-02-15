/* eslint-disable camelcase */
const mapDBSongToModel = ({
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = {mapDBSongToModel};
