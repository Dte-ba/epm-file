'use strict';

import fs from 'fs';

export default class EpmFile {
  constructor(filename){
    this.filename = filename;
    this._readed = false;
  }
}
