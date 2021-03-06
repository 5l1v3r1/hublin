'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The meetings.configuration module', function() {

  var webRTCService, RTC_BITRATES, RTC_DEFAULT_BITRATE, localStorageService, instance, alertContent;

  beforeEach(function() {
    module('meetings.configuration');
    module('meetings.pug.templates');
  });

  beforeEach(angular.mock.module(function($provide) {
    var alert = function(content) {
      alertContent = content;
    };

    RTC_BITRATES = { rate1: null, rate2: null };
    RTC_DEFAULT_BITRATE = 'rate2';
    webRTCService = {
      enableVideo: function() { },
      configureBandwidth: function() { },
      isVideoEnabled: function() { return false; },
      canEnumerateDevices: true
    };
    instance = {};
    alertContent = null;
    localStorageService = {
      getOrCreateInstance: function(name) {
        expect(name).to.equal('roomConfiguration');
        instance.setItem = function() {
          return {
            finally: function(callback) {
              callback();
            }
          };
        };

        return instance;
      }
    };
    $provide.value('webRTCService', webRTCService);
    $provide.value('RTC_BITRATES', RTC_BITRATES);
    $provide.value('RTC_DEFAULT_BITRATE', RTC_DEFAULT_BITRATE);
    $provide.value('localStorageService', localStorageService);
    $provide.value('$alert', alert);
  }));

  describe('The conferenceConfiguration directive', function() {

    before(function() {
      this.generateString = function(length) {
        return new Array(length + 1).join('a');
      };
    });

    beforeEach(inject(function($compile, $rootScope) {
      this.scope = $rootScope.$new();

      instance.getItem = function() {
        return {
          then: function(successCallback, errorCallback) {
            errorCallback();
          }
        };
      };

      $compile('<conference-configuration />')(this.scope);
      this.scope.$digest();
    }));

    describe('the onUsernameChange function', function() {

      it('should do nothing if configuration.display.username is undefined', function() {
        this.scope.configuration = {};
        this.scope.onUsernameChange();
        expect(this.scope.configuration).to.deep.equal({});
        expect(this.scope.lengthError).to.be.false;
      });

      it('should do nothing if configuration.display.username is not too long', function() {
        var userName = 'aName';

        this.scope.configuration = {
          displayName: userName
        };
        this.scope.onUsernameChange();
        expect(this.scope.configuration.displayName).to.deep.equal(userName);
        expect(this.scope.lengthError).to.be.false;
      });

      it('should set lengthError to true if configuration.display.username is not 199 chars long', function() {
        var userName = this.generateString(199);

        this.scope.configuration = {
          displayName: userName
        };
        this.scope.onUsernameChange();
        expect(this.scope.configuration.displayName).to.deep.equal(userName);
        expect(this.scope.lengthError).to.be.true;
      });

      it('should set lengthError to true and truncate username if configuration.display.username is 200 chars long', function() {
        var userName = this.generateString(200);

        this.scope.configuration = {
          displayName: userName
        };
        this.scope.onUsernameChange();
        expect(this.scope.configuration.displayName).to.deep.equal(this.generateString(199));
        expect(this.scope.lengthError).to.be.true;
      });

      it('should set lengthError to true and truncate username if configuration.display.username is more than 200 chars long', function() {
        var userName = this.generateString(250);

        this.scope.configuration = {
          displayName: userName
        };
        this.scope.onUsernameChange();
        expect(this.scope.configuration.displayName).to.deep.equal(this.generateString(199));
        expect(this.scope.lengthError).to.be.true;
      });

    });
  });

  describe('The bitrateConfiguration directive', function() {

    beforeEach(inject(function($compile, $rootScope) {
      this.scope = $rootScope.$new();
      this.compile = $compile;
    }));

    it('should select the bitrate from localStorage if it exists', function(done) {
      var testRate = 'rate1';

      instance.getItem = function() {
        return {
          then: function(successCallback) {
            successCallback(testRate);
          }
        };
      };
      webRTCService.configureBandwidth = function(rate) {
        expect(rate).to.equal(testRate);
        done();
      };
      this.compile('<bitrate-configuration />')(this.scope);
      this.scope.$digest();
    });

    it('should select the default bitrate if nothing is in the localStorage', function(done) {
      instance.getItem = function() {
        return {
          then: function(successCallback) {
            successCallback(null);
          }
        };
      };
      webRTCService.configureBandwidth = function(rate) {
        expect(rate).to.equal(RTC_DEFAULT_BITRATE);
        done();
      };
      this.compile('<bitrate-configuration />')(this.scope);
      this.scope.$digest();
    });

    it('should select the default bitrate if localStorage search fails', function(done) {
      instance.getItem = function() {
        return {
          then: function(successCallback, errorCallback) {
            errorCallback();
          }
        };
      };
      webRTCService.configureBandwidth = function(rate) {
        expect(rate).to.equal(RTC_DEFAULT_BITRATE);
        done();
      };
      this.compile('<bitrate-configuration />')(this.scope);
      this.scope.$digest();
    });

    describe('the selectBitRate function', function() {

      beforeEach(function() {
        instance.getItem = function() {
          return {
            then: function() { }
          };
        };
        this.compile('<bitrate-configuration />')(this.scope);
        this.scope.$digest();
      });

      it('should do nothing if argumentBitRate does not exist in easyRTCBitrates constant', function(done) {
        webRTCService.configureBandwidth = function() {
          done(new Error('Should not have been called'));
        };
        this.scope.selectBitRate('bitRateThatDoesNotExist');
        done();
      });

      it('should store the selectBitRate and call webRTCService#configureBandwidth with the correct rate', function(done) {
        var testRate = 'rate1';

        webRTCService.configureBandwidth = function(rate) {
          expect(rate).to.equal(testRate);
          done();
        };
        instance.setItem = function(key, value) {
          expect(key).to.equal('bitRate');
          expect(value).to.equal(testRate);

          return {
            finally: function(callback) {
              callback();
            }
          };
        };
        this.scope.selectBitRate(testRate);
      });
    });

  });

  describe('The disableVideoConfiguration directive', function() {

    beforeEach(inject(function($compile, $rootScope) {
      this.scope = $rootScope.$new();
      this.compile = $compile;
    }));

    describe('the changeVideoSetting function', function() {
      beforeEach(function() {
        instance.getItem = function() {
          return {
            then: function() { }
          };
        };
        this.compile('<disable-video-configuration />')(this.scope);
        this.scope.$digest();
      });

      it('should display an alert when video is disabled', function() {
        expect(alertContent).to.deep.equal({
          container: '#disableVideoWarning',
          template: '/views/modules/configuration/disable-video-alert.html',
          duration: 5
        });
      });

      it('should not display an alert when video is enabled', function() {
        alertContent = null;
        webRTCService.isVideoEnabled = function() { return true; };
        this.compile('<disable-video-configuration />')(this.scope);
        this.scope.$digest();
        expect(alertContent).to.be.null;

      });

      it('should return default value', function() {
        expect(this.scope.videoEnabled).to.equal(false);
      });
    });
    // Here we skip test because navigator.mediaDevices is not available on PhantomJS
    // Next task is to switch to another browser
    describe.skip('the canEnumerateDevices property', function() {
      var $window, $q;

      beforeEach(inject(function($rootScope, _$window_, _$q_) {
        this.scope = $rootScope.$new();
        $q = _$q_;
        $window = _$window_;
      }));

      it('should should be true when getUserMedia is accepted and enumerateDevices exists', function() {
        $window.navigator.mediaDevices.getUserMedia = function() {
          return $q.when(true);
        };
        $window.navigator.mediaDevices.enumerateDevices = function() { };
        this.compile('<disable-video-configuration />')(this.scope);
        this.scope.$digest();

        expect(this.scope.canEnumerateDevices).to.be.true;
      });

      it('should should be false when getUserMedia is accepted and enumerateDevices does not exist', function() {
        $window.navigator.mediaDevices.getUserMedia = function() {
          return $q.when(true);
        };
        $window.navigator.mediaDevices.enumerateDevices = undefined;
        this.compile('<disable-video-configuration />')(this.scope);
        this.scope.$digest();

        expect(this.scope.canEnumerateDevices).to.be.false;
      });

      it('should should be false when getUserMedia is not accepted', function() {
        $window.navigator.mediaDevices.getUserMedia = function() {
          return $q.reject();
        };
        this.compile('<disable-video-configuration />')(this.scope);
        this.scope.$digest();

        expect(this.scope.canEnumerateDevices).to.be.false;
      });
    });
  });
});
