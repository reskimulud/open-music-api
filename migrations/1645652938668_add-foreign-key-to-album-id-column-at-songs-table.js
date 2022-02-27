/* eslint-disable camelcase */

exports.up = (pgm) => {
  // add foreign key to album_id column at songs table
  pgm.addConstraint(
      'songs',
      'fk_songs.album_id_albums.id',
      'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  // drop foreign key from album_id column at songs table
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');
};
