import 'babel-polyfill';
import assert from 'assert';
import EpmFile from "../src"

describe('EpmFile', function() {

  describe('#run', () => {

    it('should be instancied an EpmFile', (done) => {
      try {
        let file = new EpmFile();
        done();
      } catch(err){
        console.log(err);
        done(new Error('Can\t be instancied'));
      }
    });

  });

});