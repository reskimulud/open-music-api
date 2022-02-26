/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // drop FK constraint fk_playlist_activity.song_songs.id
  pgm.dropConstraint('playlist_activity', 'fk_playlist_activity.song_songs.id');

  // drop FK constraint fk_playlist_activity.user_users.id
  pgm.dropConstraint('playlist_activity', 'fk_playlist_activity.user_users.id');
};
