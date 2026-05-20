/*!
 * AOS (Animate On Scroll) - version 2.3.1
 * https://michalsnik.github.io/aos/
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.AOS = factory());
}(this, (function () { 'use strict';

    var version = '2.3.1';

    var extend = function extend(a, b) {
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    };

    var getRandomInt = (function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    });

    var getElementPosition = function getElementPosition(el) {
      var y = 0;
      var x = 0;
      do {
        y += el.offsetTop || 0;
        x += el.offsetLeft || 0;
        el = el.offsetParent;
      } while (el);
      return { x: x, y: y };
    };

    var getWindowSize = function getWindowSize() {
      var width = 0;
      var height = 0;
      if ('innerHeight' in window) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else {
        var el = document.documentElement;
        width = el.clientWidth;
        height = el.clientHeight;
      }
      return { width: width, height: height };
    };

    var isElementInViewport = function isElementInViewport(el, offset, tolerance) {
      var elementPosition = getElementPosition(el);
      var scrollPosition = {
        x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      };
      var windowSize = getWindowSize();

      var top = elementPosition.y - scrollPosition.y;
      var left = elementPosition.x - scrollPosition.x;
      var bottom = windowSize.height - (elementPosition.y - scrollPosition.y + el.offsetHeight);
      var right = windowSize.width - (elementPosition.x - scrollPosition.x + el.offsetWidth);

      return !(top < (offset.top + tolerance) ||
               left < (offset.left + tolerance) ||
               bottom < (offset.bottom + tolerance) ||
               right < (offset.right + tolerance));
    };

    var getForcedAnimationDirection = function getForcedAnimationDirection(el, options) {
      var direction = 'down';
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      var elementTop = getElementPosition(el).y;

      if (options.direction === 'down' || (options.direction === 'up' && elementTop > scrollY) || (options.direction === 'down' && elementTop < scrollY + getWindowSize().height)) {
        direction = 'down';
      } else {
        direction = 'up';
      }

      return direction;
    };

    var getElementPlacement = function getElementPlacement(el, index, options) {
      var position = getElementPosition(el);
      var windowSize = getWindowSize();
      var scrollPosition = {
        x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      };

      var top = position.y - scrollPosition.y;
      var offset = options.offset;

      if (offset) {
        if (typeof offset === 'function') {
          offset = offset(el, index);
        }
      }

      if (top + el.offsetHeight + offset >= 0 && top - offset <= windowSize.height) {
        return true;
      } else {
        return false;
      }
    };

    var getEventListeners = function getEventListeners() {
      var listeners = [];

      if (window.addEventListener) {
        listeners.push(['scroll', 'resize', 'orientationchange']);
      } else if (window.attachEvent) {
        listeners.push(['scroll', 'resize', 'orientationchange']);
      }

      return listeners;
    };

    var addEvent = function addEvent(el, event, listener) {
      if (el.addEventListener) {
        el.addEventListener(event, listener);
      } else if (el.attachEvent) {
        el.attachEvent('on' + event, listener);
      }
    };

    var removeEvent = function removeEvent(el, event, listener) {
      if (el.removeEventListener) {
        el.removeEventListener(event, listener);
      } else if (el.detachEvent) {
        el.detachEvent('on' + event, listener);
      }
    };

    var removeClass = function removeClass(el, className) {
      if (el.classList) {
        el.classList.remove(className);
      } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    };

    var addClass = function addClass(el, className) {
      if (el.classList) {
        el.classList.add(className);
      } else {
        el.className += ' ' + className;
      }
    };

    var hasClass = function hasClass(el, className) {
      if (el.classList) {
        return el.classList.contains(className);
      } else {
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
      }
    };

    var setAttributes = function setAttributes(el, attrs) {
      Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, attrs[key]);
      });
    };

    var init = function init() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var defaultSettings = {
        offset: 120,
        delay: 0,
        duration: 400,
        easing: 'ease',
        once: false,
        mirror: false,
        anchorPlacement: 'top-bottom',
        startEvent: 'DOMContentLoaded',
        animatedClassName: 'aos-animate',
        initClassName: 'aos-init',
        useClassNames: false,
        disableMutationObserver: false,
        throttleDelay: 99,
        debounceDelay: 50,
        disable: false
      };

      var settings = extend(defaultSettings, options);

      var nodes = document.querySelectorAll('[data-aos]');

      var _getWindowSize = getWindowSize(),
          windowWidth = _getWindowSize.width,
          windowHeight = _getWindowSize.height;

      var _loop = function _loop(i) {
        var node = nodes[i];
        var data = node.getAttribute('data-aos');

        var attrValues = data.split(/\s+/);
        var defaultValues = {
          _anchorPlacement: settings.anchorPlacement,
          _delay: settings.delay,
          _duration: settings.duration,
          _easing: settings.easing,
          _once: settings.once,
          _mirror: settings.mirror
        };

        attrValues.forEach(function (val) {
          if (val.match(/delay-/) !== null) {
            defaultValues._delay = parseInt(val.split('-')[1]);
          } else if (val.match(/duration-/) !== null) {
            defaultValues._duration = parseInt(val.split('-')[1]);
          } else if (val.match(/easing-/) !== null) {
            defaultValues._easing = val.split('-')[1];
          } else if (val.match(/anchor-/) !== null) {
            defaultValues._anchorPlacement = val.split('-')[1];
          } else if (val.match(/once/) !== null) {
            defaultValues._once = true;
          } else if (val.match(/mirror/) !== null) {
            defaultValues._mirror = true;
          }
        });

        var nodeSettings = {
          _id: i,
          _position: getElementPosition(node),
          _absolutePositionTop: getElementPosition(node).y,
          _absolutePositionBottom: getElementPosition(node).y + node.offsetHeight,
          _windowHeight: windowHeight,
          _windowWidth: windowWidth,
          _offset: settings.offset,
          _anchorPlacement: defaultValues._anchorPlacement,
          _delay: defaultValues._delay,
          _duration: defaultValues._duration,
          _easing: defaultValues._easing,
          _once: defaultValues._once,
          _mirror: defaultValues._mirror,
          _animated: false,
          _inView: false
        };

        if (!settings.disable && (typeof settings.disable !== 'function' || settings.disable() !== true)) {
          if (typeof settings.startEvent === 'string' && settings.startEvent === 'DOMContentLoaded') {
            var isDOMReady = document.readyState === 'loading' ? false : true;

            if (isDOMReady) {
              prepareNode(node, nodeSettings);
            } else {
              document.addEventListener('DOMContentLoaded', function () {
                return prepareNode(node, nodeSettings);
              });
            }
          } else if (typeof settings.startEvent === 'string') {
            document.addEventListener(settings.startEvent, function () {
              return prepareNode(node, nodeSettings);
            });
          } else {
            prepareNode(node, nodeSettings);
          }
        } else {
          disableNode(node);
        }
      };

      for (var i = 0; i < nodes.length; i++) {
        _loop(i);
      }

      var mutationObserver = void 0;
      if (!settings.disableMutationObserver) {
        mutationObserver = new MutationObserver(function (mutationsList) {
          var newNodes = [];
          mutationsList.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (addedNode) {
              if (addedNode.nodeType === Node.ELEMENT_NODE) {
                if (addedNode.hasAttribute('data-aos')) {
                  newNodes.push(addedNode);
                } else {
                  var addedNodeChildren = addedNode.querySelectorAll('[data-aos]');
                  newNodes.push.apply(newNodes, addedNodeChildren);
                }
              }
            });
          });

          if (newNodes.length) {
            var _loop2 = function _loop2(_i) {
              var node = newNodes[_i];
              var data = node.getAttribute('data-aos');

              var attrValues = data.split(/\s+/);
              var defaultValues = {
                _anchorPlacement: settings.anchorPlacement,
                _delay: settings.delay,
                _duration: settings.duration,
                _easing: settings.easing,
                _once: settings.once,
                _mirror: settings.mirror
              };

              attrValues.forEach(function (val) {
                if (val.match(/delay-/) !== null) {
                  defaultValues._delay = parseInt(val.split('-')[1]);
                } else if (val.match(/duration-/) !== null) {
                  defaultValues._duration = parseInt(val.split('-')[1]);
                } else if (val.match(/easing-/) !== null) {
                  defaultValues._easing = val.split('-')[1];
                } else if (val.match(/anchor-/) !== null) {
                  defaultValues._anchorPlacement = val.split('-')[1];
                } else if (val.match(/once/) !== null) {
                  defaultValues._once = true;
                } else if (val.match(/mirror/) !== null) {
                  defaultValues._mirror = true;
                }
              });

              var nodeSettings = {
                _id: i + _i,
                _position: getElementPosition(node),
                _absolutePositionTop: getElementPosition(node).y,
                _absolutePositionBottom: getElementPosition(node).y + node.offsetHeight,
                _windowHeight: windowHeight,
                _windowWidth: windowWidth,
                _offset: settings.offset,
                _anchorPlacement: defaultValues._anchorPlacement,
                _delay: defaultValues._delay,
                _duration: defaultValues._duration,
                _easing: defaultValues._easing,
                _once: defaultValues._once,
                _mirror: defaultValues._mirror,
                _animated: false,
                _inView: false
              };

              prepareNode(node, nodeSettings);
            };

            for (var _i = 0; _i < newNodes.length; _i++) {
              _loop2(_i);
            }
          }
        });

        mutationObserver.observe(document.body, {
          attributes: true,
          childList: true,
          characterData: true
        });
      }

      var getListeners = getEventListeners();
      var resizeHandler = throttle(function () {
        _getWindowSize = getWindowSize();
        windowWidth = _getWindowSize.width;
        windowHeight = _getWindowSize.height;
      }, settings.throttleDelay);

      var scrollHandler = throttle(function () {
        nodes = document.querySelectorAll('[data-aos]');
        var windowSize = getWindowSize();

        windowWidth = windowSize.width;
        windowHeight = windowSize.height;

        for (var _i2 = 0; _i2 < nodes.length; _i2++) {
          var node = nodes[_i2];
          var data = node.getAttribute('data-aos');
          if (data === null) {
            continue;
          }

          var attrValues = data.split(/\s+/);
          var anchorPlacement = settings.anchorPlacement;

          attrValues.forEach(function (val) {
            if (val.match(/anchor-/) !== null) {
              anchorPlacement = val.split('-')[1];
            }
          });

          var elementPosition = getElementPosition(node);
          var scrollPosition = {
            x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
          };

          var top = elementPosition.y - scrollPosition.y;
          var bottom = windowSize.height - (elementPosition.y - scrollPosition.y + node.offsetHeight);
          var left = elementPosition.x - scrollPosition.x;
          var right = windowSize.width - (elementPosition.x - scrollPosition.x + node.offsetWidth);

          var checkPosition = void 0;

          switch (anchorPlacement) {
            case 'top-bottom':
              checkPosition = top + node.offsetHeight + settings.offset >= 0 && top - settings.offset <= windowSize.height;
              break;
            case 'top-center':
              checkPosition = top + node.offsetHeight / 2 + settings.offset >= 0 && top - settings.offset <= windowSize.height;
              break;
            case 'top-top':
              checkPosition = top + settings.offset >= 0 && top - settings.offset <= windowSize.height;
              break;
            case 'center-bottom':
              checkPosition = top + node.offsetHeight + settings.offset >= windowSize.height / 2 && top - settings.offset <= windowSize.height;
              break;
            case 'center-center':
              checkPosition = top + node.offsetHeight / 2 + settings.offset >= windowSize.height / 2 && top - settings.offset <= windowSize.height / 2;
              break;
            case 'center-top':
              checkPosition = top + settings.offset >= windowSize.height / 2 && top - settings.offset <= windowSize.height;
              break;
            case 'bottom-bottom':
              checkPosition = top + node.offsetHeight + settings.offset >= windowSize.height && top - settings.offset <= windowSize.height;
              break;
            case 'bottom-center':
              checkPosition = top + node.offsetHeight / 2 + settings.offset >= windowSize.height && top - settings.offset <= windowSize.height;
              break;
            case 'bottom-top':
              checkPosition = top + settings.offset >= windowSize.height && top - settings.offset <= windowSize.height;
              break;
            default:
              checkPosition = top + node.offsetHeight + settings.offset >= 0 && top - settings.offset <= windowSize.height;
              break;
          }

          if (checkPosition && !hasClass(node, settings.animatedClassName)) {
            if (!hasClass(node, settings.initClassName)) {
              addClass(node, settings.initClassName);
            }

            var animated = function animated() {
              addClass(node, settings.animatedClassName);
              node.setAttribute('data-aos-animate', 'true');
            };

            var applyAnimation = function applyAnimation() {
              if (settings.useClassNames) {
                var animationName = node.getAttribute('data-aos');
                node.style.animationName = animationName;
                animated();
              } else {
                animated();
              }
            };

            var delay = settings.delay;
            var duration = settings.duration;

            if (attrValues.some(function (val) {
              return val.match(/delay-/);
            })) {
              attrValues.forEach(function (val) {
                if (val.match(/delay-/) !== null) {
                  delay = parseInt(val.split('-')[1]);
                }
              });
            }

            if (attrValues.some(function (val) {
              return val.match(/duration-/);
            })) {
              attrValues.forEach(function (val) {
                if (val.match(/duration-/) !== null) {
                  duration = parseInt(val.split('-')[1]);
                }
              });
            }

            setTimeout(function () {
              if (!hasClass(node, settings.animatedClassName)) {
                applyAnimation();
              }
            }, delay);

            if (duration) {
              node.style.transitionDuration = duration + 'ms';
            }
          } else if (checkPosition === false && hasClass(node, settings.animatedClassName) && settings.mirror === true) {
            removeClass(node, settings.animatedClassName);
            node.removeAttribute('data-aos-animate');
          } else if (checkPosition === false && hasClass(node, settings.animatedClassName) && settings.once === true) {
            removeClass(node, settings.animatedClassName);
            node.removeAttribute('data-aos-animate');
          }
        }
      }, settings.throttleDelay);

      var handleResize = function handleResize() {
        resizeHandler();
        scrollHandler();
      };

      var handleScroll = function handleScroll() {
        scrollHandler();
      };

      getListeners.forEach(function (eventArr) {
        eventArr.forEach(function (event) {
          addEvent(window, event, handleResize);
          addEvent(window, event, handleScroll);
        });
      });

      var debouncedScroll = debounce(handleScroll, settings.debounceDelay);
      addEvent(window, 'scroll', debouncedScroll);
    };

    var prepareNode = function prepareNode(node, nodeSettings) {
      if (typeof nodeSettings.anchorPlacement === 'undefined') {
        nodeSettings.anchorPlacement = 'top-bottom';
      }

      var isElementVisible = getElementPlacement(node, nodeSettings._id, nodeSettings);

      if (isElementVisible) {
        if (!hasClass(node, nodeSettings.initClassName)) {
          addClass(node, nodeSettings.initClassName);
        }

        var animated = function animated() {
          addClass(node, nodeSettings.animatedClassName);
          node.setAttribute('data-aos-animate', 'true');
        };

        var applyAnimation = function applyAnimation() {
          if (nodeSettings.useClassNames) {
            var animationName = node.getAttribute('data-aos');
            node.style.animationName = animationName;
            animated();
          } else {
            animated();
          }
        };

        setTimeout(function () {
          if (!hasClass(node, nodeSettings.animatedClassName)) {
            applyAnimation();
          }
        }, nodeSettings._delay);

        if (nodeSettings._duration) {
          node.style.transitionDuration = nodeSettings._duration + 'ms';
        }
      } else {
        if (nodeSettings._mirror === false && nodeSettings._once === true) {
          if (hasClass(node, nodeSettings.initClassName)) {
            removeClass(node, nodeSettings.initClassName);
          }
        }
      }
    };

    var disableNode = function disableNode(node) {
      if (hasClass(node, 'aos-init')) {
        removeClass(node, 'aos-init');
      }
    };

    var throttle = function throttle(fn, delay) {
      var lastCall = 0;
      return function () {
        var now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          fn.apply(this, arguments);
        }
      };
    };

    var debounce = function debounce(fn, delay) {
      var timer = null;
      return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    };

    var AOS = {
      init: init,
      version: version
    };

    if (typeof window !== 'undefined' && !window.AOS) {
      window.AOS = AOS;
    }

    return AOS;

})));