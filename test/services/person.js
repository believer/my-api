var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var Q = require('q');

chai.use(require('sinon-chai'));

describe('/personService', function () {
  var personService,
    req,
    mongojs,
    q;

  beforeEach(function () {
    q = {
      defer: sinon.stub().returns({
        promise: sinon.spy(),
        resolve: sinon.spy()
      })
    };

    mongojs = {
      connect: sinon.stub().returns({
        movies: {
          find: sinon.stub().returns({
            sort: sinon.spy()
          })
        }
      })
    };

    personService = proxyquire(process.cwd() + '/lib/services/person', {
      'mongojs': mongojs,
      'q': q
    });
  });

  it("should call find with cast query", function() {
    req = {
      query: {
        name: 'Tom Cruise'
      },
      params: {
        type: 'cast'
      }
    };

    personService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find).calledOnce.and.calledWith({ cast: { $regex: 'Tom Cruise', $options: 'i' }});    
  });

  it("should call find with director query", function() {
    req = {
      query: {
        name: 'Christopher Nolan'
      },
      params: {
        type: 'director'
      }
    };

    personService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find).calledOnce.and.calledWith({ director: { $regex: 'Christopher Nolan', $options: 'i' }});    
  });

  it("should call find with music query", function() {
    req = {
      query: {
        name: 'Hans Zimmer'
      },
      params: {
        type: 'music'
      }
    };

    personService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find).calledOnce.and.calledWith({ music: { $regex: 'Hans Zimmer', $options: 'i' }});    
  });

  it("should call sort with correct sort order", function() {
    req = {
      query: {
        name: 'Hans Zimmer'
      },
      params: {
        type: 'music'
      }
    };

    personService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find.defaultBehavior.returnValue.sort).calledOnce.and.calledWith({ _id: -1 });
  });

});