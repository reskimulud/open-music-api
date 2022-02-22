/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // create table songslists
  pgm.createTable('songlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // give FK constraint to songslists on playlist_id column in playlist table
  pgm.addConstraint('songlists',
      'fk_songlists.playlist_playlist.id',
      'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE');

  // give FK constraint to songslists on song_id column in songs table
  pgm.addConstraint('songlists',
      'fk_songlists.song_songs.id',
      'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // drop table songlists
  pgm.dropTable('songlists');

  // drop FK constraint fk_songlists.song_songs.id
  pgm.dropConstraint('songlists', 'fk_songlists.song_songs.id');

  // drop FK constraint fk_songlists.playlist_playlist.id
  pgm.dropConstraint('songlists', 'fk_songlists.playlist_playlist.id');
};
