/* eslint-disable camelcase */

exports.up = (pgm) => {
  // create table playlist
  pgm.createTable('playlist', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // give FK constraint to playlist on owner column in user table
  pgm.addConstraint('playlist',
      'fk_playlist.owner_users.id',
      'FOREIGN Key(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // drop table playlist
  pgm.dropTable('playlist');

  // drop FK constraint to playlist on owner column in user table
  pgm.dropConstraint('playlist', 'fk_playlist.owner_users.id');
};
