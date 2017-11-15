'use strict';

import uuidV4 from'uuid/v4';
import _ from 'lodash';
import jwa from 'jwa';
import fs from 'fs';

export default class Metadata {
  constructor({sign, privateKey, publicKey} = {}){
    // initialice defaults
    this.version = 1;
    this.type = 'default';
    this._sources = [];
    this._collaborators = [];
    this._files = [];
    this.createdAt = this.updatedAt = new Date();

    this._title = '';
    this._description = '';
    this._summary = '';
    this._remark = '';
    this._category = '';
    this._tags = [];
    this._custom = {};

    this.sign = sign === true;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  // unique ID can not be setted
  get uid(){
    if (!this._uid){
      this._uid =  uuidV4();
    }

    return this._uid;
  }

  // version counter
  get version() { return this._version; }
  set version(value) {
    if (_typeok(value, 'number', 'version')){
      this._version = parseInt(value);
    }    
  }

  // the type of the package
  get type() { return this._type; }
  set type(value) {
    if (_typeok(value, 'string', 'type')){
      this._type = value;
    }    
  }

  // the title of the content
  get title() { return this._title; }
  set title(value) {
    if (_typeok(value, 'string', 'title')){
      this._title = value;
    }    
  }

  // the description of the content
  get description() { return this._description; }
  set description(value) {
    if (_typeok(value, 'string', 'description')){
      this._description = value;
    }    
  }

  // the summary of the content
  get summary() { return this._summary; }
  set summary(value) {
    if (_typeok(value, 'string', 'summary')){
      this._summary = value;
    }    
  }

  // the remark of the files
  get remark() { return this._remark; }
  set remark(value) {
    if (_typeok(value, 'string', 'remark')){
      this._remark = value;
    }    
  }

  // the category of the content
  get category() { return this._category; }
  set category(value) {
    if (_typeok(value, 'object', 'category')){
      this._category = value;
    }    
  }

  // the tags of the content
  get tags() { return this._tags; }
  set tags(value) {
    if (_typeok(value, 'object', 'tags')){
      this._tags = value;
    }
  }

  // custom content
  get custom() { return this._custom; }
  set custom(value) { this._custom = value; }

  // the sources of the files
  get sources(){
    return this._sources;
  }

  addSource(author, reference){
    let obj = { author: '', reference: '' };

    if (_typeok(author, 'string', 'source.author')){
      obj.author = author;
    }

    if (_typeok(reference, 'string', 'source.reference')){
      obj.reference = reference;
    }

    this._sources.push(obj);
  }

  removeSource(author, reference){
    this._sources = _.reject(this._sources, { author, reference });
  }

  // the collaborators of the package
  get collaborators(){
    return this._collaborators;
  }

  addCollaborator(value){
    // TODO: check if match with 'Name Lastname <email>'
    if (_typeok(value, 'string', 'collaborator')){
      this._collaborators.push(value);
    }
  }

  // date of creation of the file
  get createdAt() { return this._createdAt; }
  set createdAt(value) {
    if (_typeok(value, 'object', 'createdAt')){
      this._createdAt = value;
    }    
  }

  //  date of updated of the file
  get updatedAt() { return this._updatedAt; }
  set updatedAt(value) {
    if (_typeok(value, 'object', 'updatedAt')){
      this._updatedAt = value;
    }    
  }

  // the files
  get files() { return this._files; }
  set files(value) { this._files = value; }

  // to Object
  toObject(){

    return {
      uid: this.uid,
      version: this.version,
      type: this.type,
      title: this.title,
      description: this.description,
      remark: this.remark,
      category: this.category,
      tags: this.tags,
      custom: this.custom,
      sources: this.sources,
      collaborators: this.collaborators,
      files: this.files,
      createdAt: this.createdAt.valueOf(),
      updatedAt: this.updatedAt.valueOf()
    };
  }

  // to Json
  toJson(){
    let o = this.toObject();
    return JSON.stringify(o);
  }

  encode(){
    let str = this.toJson();
    return (new Buffer(str)).toString('base64');
  }

  data(){
    // add the signature
    let res = this.encode();

    if (this.sign) {
      const privateKey = this.privateKey;
      const ecdsa = jwa('ES512');
      this._signature = ecdsa.sign(res, privateKey);

      res = `${res}.${this._signature}`;
    }

    return res;
  }

  decode(str){

    let enc = str;
    let splited = str.split('.');

    // is signed?
    if (splited.length === 2){
      this.sign = true;
      this._signature = splited[1];
      enc = splited[0];
    }

    let decoded = (new Buffer(enc, 'base64').toString('ascii'));
    let o = JSON.parse(decoded);

    this._uid = o.uid;
    this._version = o.version;
    this._type = o.type;
    this._title = o.title;
    this._description = o.description;
    this._remark = o.remark;
    this._category = o.category;
    this._tags = o.tags;
    this._custom = o.custom;
    this._sources = o.sources;
    this._collaborators = o.collaborators;
    this._files = o.files;
    this._createdAt = new Date(o.createdAt);
    this._updatedAt = new Date(o.updatedAt);
  }

  updateDate(readed){
    // define createdAt/updatedAt
    if (readed){
      this.createdAt = this.meta.updatedAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
  }
}

//
// Helpers
function _typeok(value, type, prop){
  if ( typeof value !== type ) {
    throw new Error(`the value of ${prop} can not be ${value}`);
  }
  return true;
}