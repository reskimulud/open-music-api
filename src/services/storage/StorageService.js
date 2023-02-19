const fs = require('fs');

class StorageService {
  #folder;

  constructor(folder) {
    this.#folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {recursive: true});
    }
  }

  writeFile(file, meta, albumId) {
    const fileExt = meta.filename.split('.').pop();

    const filename = `${albumId}.${fileExt}`;
    const path = `${this.#folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  deleteFile(filename) {
    fs.unlinkSync(`${this.#folder}/${filename}`);
  }
}

module.exports = StorageService;
