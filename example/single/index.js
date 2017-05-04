import EpmFile from '../../src/';
import path from 'path';
import jwa from 'jwa';
import fs from 'fs';
const ecdsa = jwa('ES512');

const privateKey = fs.readFileSync(path.resolve(__dirname, '../keys/ecdsa-p521-private.pem'));
const publicKey = fs.readFileSync(path.resolve(__dirname, '../keys/ecdsa-p521-public.pem'));

let read = () => {
  var file = new EpmFile({ filename: path.join(__dirname, '../output/output.epf') });  
}


let write = () => {
  var file = new EpmFile({sign: true, privateKey: privateKey });
  //
  file.addEntry('assets/content.jpg', '/home/nacho/tmp/_assets/content.jpg', 'content');
  file.addEntry('assets/front.jpg', '/home/nacho/tmp/_assets/front.jpg');
  file.addEntry('files/leyenda.ppsx', '/home/nacho/tmp/_files/leyenda.ppsx');
  //
  file.save(path.join(__dirname, '../output/output.epf'))
      .then(() => {
        console.log('ready!')
      })
      .catch(err => {
        console.error(err);
      });

}

console.time('readed');
read();
console.timeEnd('readed');

//var input = 'eyJ1aWQiOiIyYzhkYTIyNy02ZGVjLTRmMjMtODM4Zi0zN2I1MzhlY2UwZDQiLCJ2ZXJzaW9uIjoxLCJ0eXBlIjoiZGVmYXVsdCIsInRpdGxlIjoiIiwiZGVzY3JpcHRpb24iOiIiLCJyZW1hcmsiOiIiLCJjYXRlZ29yeSI6IiIsInRhZ3MiOltdLCJjdXN0b20iOnt9LCJzb3VyY2VzIjpbXSwiY29sbGFib3JhdG9ycyI6W10sImZpbGVzIjpbXSwiY3JlYXRlZEF0IjoxNDkyMTQxNTgyMjYzLCJ1cGRhdGVkQXQiOjE0OTIxNDE1ODIyNjR9';
//var signature = 'AR5iIupDFrvtvGnH4i_2d6C-8iSod8jPmakLTCCOu4aQX1BPDbpuvJbw5YfdVRHDiBQgMwL4xuPsfJW8sjv2HyOFAVmIMXBtMoDjHPJhkL-k56K-7KVjJg6Q_c4JGjxh1p9wSrUzHdsO2kpi_PB-_GBHWzmQ4v0sWemc1_a49Ko0tMqD';

//console.log('verify', ecdsa.verify(input, signature, publicKey));