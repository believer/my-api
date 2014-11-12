var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  proxyquire = require('proxyquire'),
  Q = require('q');

chai.use(require('sinon-chai'));

describe('/moviesService', function () {
  var moviesService,
    routes,
    promise,
    req,
    clock,
    movee;

  beforeEach(function () {
    sinon.stub(process, 'nextTick').yields();
    clock = sinon.useFakeTimers(new Date(2000, 11, 24).getTime(), 'Date');
    sinon.stub(Date, 'now').returns(123456);

    req = {
      query: {}
    };

    routes = {
      get: sinon.stub()
    };

    movee = {
      mongoConnect: sinon.spy()
    };

    routes.get.deferred = Q.defer();

    moviesService = proxyquire(process.cwd() + '/lib/services/movies', {
      '../utils/movee': movee,
    });
  });

  afterEach(function () {
    process.nextTick.restore();
    clock.restore();
  });

  it('should be a function', function () {
    expect(moviesService.get).to.be.a('function');
  });

  it('should get movies from the db', function () {
    moviesService.get(req);

    expect(movee.mongoConnect).calledOnce;
  });
});