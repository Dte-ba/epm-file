'use strict';

import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';
import async from 'async';
import Q from 'q';
import _ from 'lodash';

import Metadata from './metadata';
import MemoryStream from './memory-stream';

export default class EpmFile {
  constructor({filename, sign, privateKey, publicKey} = {}){
    this._filename = filename;
    this._readed = false;
    this._meta = new Metadata({sign, privateKey, publicKey});
    this._version = 1;

    this._entries = [];

    this.HEADER_LENGTH = 8;

    if (fs.existsSync(this._filename)){
      this._load();
    }
  }

  _load(){
    let stat = fs.statSync(this._filename);
    let fd = fs.openSync(this._filename, 'r');

    const bsignature = Buffer.allocUnsafe(3);
    const bversion = Buffer.allocUnsafe(1);
    const bcontent = Buffer.allocUnsafe(4);

    fs.readSync(fd, bsignature, 0, 3, 0);
    //console.log(bsignature.toString());

    fs.readSync(fd, bversion, 0, 1, 3);
    let version = bversion.readUInt8(0);
    //console.log(version);

    fs.readSync(fd, bcontent, 0, 4, 4);
    //console.log(bcontent)
    let clength = bcontent.readUInt32BE(0);
    //console.log(clength);

    let mlength = stat.size - this.HEADER_LENGTH - clength;
    let moffset = clength + this.HEADER_LENGTH;
    //console.log(mlength)

    const bmetadata = Buffer.allocUnsafe(mlength);

    fs.readSync(fd, bmetadata, 0, mlength, moffset);
    //console.log(bmetadata.toString());
    
    this.meta.decode(bmetadata.toString());
    //console.log(this.meta.toObject())
    fs.closeSync(fd);
  }

  get readed(){
    return this._readed;
  }

  get meta(){
    return this._meta;
  }

  get version(){
    return this._version;
  }

  _buferedSignature(){
    // create the signature
    const b = Buffer.allocUnsafe(3);
    b.writeUInt8(0x45, 0); //E
    b.writeUInt8(0x50, 1); //P
    b.writeUInt8(0x4d, 2); //M

    return b;
  }

  _buferedVersion(){
    // create the version
    const b = Buffer.allocUnsafe(1);
    b.writeUInt8(this.version);

    return b;
  }

  _buferedContentLength(files){
    let length = _.sumBy(files, 'length');

    // define the length of the content head
    const b = Buffer.allocUnsafe(4);
    b.writeUInt32BE(length);

    return b;
  }

  _buferedMetadata(files){
    // update metadatafiles
    this.meta.files = _.map(files, (f) => {
      return {
        entry: f.entry.entry,
        comment: f.entry.comment,
        length: f.length
      };
    });

    // write the timesptamps
    this.meta.updateDate();

    // get the data metadata.sing
    let data = this.meta.data();

    let dlength = Buffer.byteLength(data);

    const b = Buffer.allocUnsafe(dlength);
    b.write(data);

    return b;
  }

  _gzipFiles(){
    const def = Q.defer();
    let proccesed = [];

    const q = async.queue((entry, cb) => {
      var ms = new MemoryStream();

      ms.on('finish', (result) => {
        proccesed.push({
          entry: entry,
          buffer: ms.buffer,
          length: ms.buffer.length
        });

        cb();
      });

      var inp = fs.createReadStream(entry.file);
      var gzip = zlib.createGzip();

      inp.pipe(gzip).pipe(ms);
    }, 1);

    q.drain = () => {
      def.resolve(proccesed);
    }

    q.push(this._entries);

    return def.promise;
  }

  _buferedFiles(files){
    let length = _.sumBy(files, 'length');
    return Buffer.concat(_.map(files, 'buffer'), length);
  }

  _buferedHeader(files){
    // concat the head
    return Buffer.concat([
      this._buferedSignature(),
      this._buferedVersion(files),
      this._buferedContentLength(files)
    ], this.HEADER_LENGTH);
  }

  getAsBuffer(){
    const def = Q.defer();

    this._gzipFiles()
        .then(files => {
          const header = this._buferedHeader(files);
          const content = this._buferedFiles(files);
          const metadata = this._buferedMetadata(files);

          let buffers = [header, content, metadata];
          let totalLength = _.sumBy(buffers, 'length');

          const res = Buffer.concat(buffers);

          def.resolve(res);
        })
        .catch(def.reject);

    return def.promise;
  }

  save(filename){
    const def = Q.defer();

    this.getAsBuffer()
        .then(buffer => {
          let fullname = path.resolve(filename);

          fs.writeFile(fullname, buffer, err => {
            if (err){
              return def.reject(err);
            }
            def.resolve(fullname);
          });
        })
        .catch(def.reject);

    return def.promise;
  }

  addEntry(entry, file, comment){
    if (_.find(this._entries, {entry})){
      throw new Error(`The entry '${entry}' exists`);
    }

    this._entries.push({entry, file, comment});
  }

  getEntry(entry){
    let def = Q.defer();

    let ei = _.findIndex(this.meta.files, { entry });

    if (ei === -1){
      def.reject(new Error(`Uknown entry ${entry}`));
    } else {
      let offset = this.HEADER_LENGTH;
      let e = this.meta.files[ei];

      for (let i=0; i < ei; i++){
        offset += this.meta.files[i].length;
      }

      let fd = fs.openSync(this._filename, 'r');
      let buffer = Buffer.allocUnsafe(e.length);

      fs.readSync(fd, buffer, 0, e.length, offset);

      def.resolve({filename: e.entry, length: e.length, buffer: buffer});
    }

    return def.promise;
  }
}
