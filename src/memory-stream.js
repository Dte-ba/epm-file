'use strict';

import stream from 'stream';
import util from 'util';
const Writable = stream.Writable || require('readable-stream').Writable;

export default class Metadata extends Writable {
  constructor(options){
    super(options);

    this.buffer = new Buffer('');
  }
  _write(chunk, enc, cb){
    // our memory store stores things in buffers
    var buffer = (Buffer.isBuffer(chunk)) ?
      chunk :  // already is Buffer use it
      new Buffer(chunk, enc);  // string, convert

    // concat to the buffer already there
    this.buffer = Buffer.concat([this.buffer, buffer]);
    cb();
  }
}