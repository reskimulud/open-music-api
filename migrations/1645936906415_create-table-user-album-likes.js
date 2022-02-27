/* eslint-disable camelcase */

exports.up = (pgm) => {
  // create table user_album_likes
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // give UNIQUE constraint to user_id and album_id columns
  pgm.addConstraint('user_album_likes', 'unique_user_id_and_album_id', 'UNIQUE(user_id, album_id)');

  // give FK constraint to user_album_likes on user_id column in users table
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.user_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');

  // give FK constraint to user_album_likes on album_id column in albums table
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.album_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // drop table user_album_likes
  pgm.dropTable('user_album_likes');

  // drop FK constraint fk_user_album_likes.album_albums.id
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.album_albums.id');

  // drop FK constraint fk_user_album_likes.user_users.id
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.user_users.id');
};
