/* eslint-disable max-len */
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // create table playlist_activity
  pgm.createTable('playlist_activity', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    time: {
      type: 'TEXT',
      notNull: true,
    },
    action: {
      type: 'TEXT',
      notNull: true,
    },
  });

  // give FK constraint to playlist_activity on playlist_id column in playlist table
  pgm.addConstraint('playlist_activity',
      'fk_playlist_activity.playlist_playlist.id',
      'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE');

  // give FK constraint to playlist_activity on user_id column in users table
  pgm.addConstraint('playlist_activity',
      'fk_playlist_activity.user_users.id',
      'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');

  // give FK constraint to playlist_activity on song_id column in songs table
  pgm.addConstraint('playlist_activity',
      'fk_playlist_activity.song_songs.id',
      'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // drop table playlist_activity
  pgm.dropTable('playlist_activity');

  // drop FK constraint fk_playlist_activity.song_songs.id
  pgm.dropConstraint('playlist_activity', 'fk_playlist_activity.song_songs.id');

  // drop FK constraint fk_playlist_activity.user_users.id
  pgm.dropConstraint('playlist_activity', 'fk_playlist_activity.user_users.id');

  // drop FK constraint fk_playlist_activity.playlist_playlist.id
  pgm.dropConstraint('playlist_activity', 'fk_playlist_activity.playlist_playlist.id');
};
