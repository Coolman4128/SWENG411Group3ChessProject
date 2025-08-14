"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/Enums/pieces.ts
  var pieces_exports = {};
  __export(pieces_exports, {
    PieceType: () => PieceType
  });
  var PieceType;
  var init_pieces = __esm({
    "src/Enums/pieces.ts"() {
      "use strict";
      PieceType = /* @__PURE__ */ ((PieceType2) => {
        PieceType2[PieceType2["EMPTY"] = 0] = "EMPTY";
        PieceType2[PieceType2["PAWN"] = 1] = "PAWN";
        PieceType2[PieceType2["ROOK"] = 2] = "ROOK";
        PieceType2[PieceType2["KNIGHT"] = 3] = "KNIGHT";
        PieceType2[PieceType2["BISHOP"] = 4] = "BISHOP";
        PieceType2[PieceType2["QUEEN"] = 5] = "QUEEN";
        PieceType2[PieceType2["KING"] = 6] = "KING";
        return PieceType2;
      })(PieceType || {});
    }
  });

  // node_modules/engine.io-parser/build/esm/commons.js
  var PACKET_TYPES = /* @__PURE__ */ Object.create(null);
  PACKET_TYPES["open"] = "0";
  PACKET_TYPES["close"] = "1";
  PACKET_TYPES["ping"] = "2";
  PACKET_TYPES["pong"] = "3";
  PACKET_TYPES["message"] = "4";
  PACKET_TYPES["upgrade"] = "5";
  PACKET_TYPES["noop"] = "6";
  var PACKET_TYPES_REVERSE = /* @__PURE__ */ Object.create(null);
  Object.keys(PACKET_TYPES).forEach((key) => {
    PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
  });
  var ERROR_PACKET = { type: "error", data: "parser error" };

  // node_modules/engine.io-parser/build/esm/encodePacket.browser.js
  var withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]";
  var withNativeArrayBuffer = typeof ArrayBuffer === "function";
  var isView = (obj) => {
    return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
  };
  var encodePacket = ({ type, data }, supportsBinary, callback) => {
    if (withNativeBlob && data instanceof Blob) {
      if (supportsBinary) {
        return callback(data);
      } else {
        return encodeBlobAsBase64(data, callback);
      }
    } else if (withNativeArrayBuffer && (data instanceof ArrayBuffer || isView(data))) {
      if (supportsBinary) {
        return callback(data);
      } else {
        return encodeBlobAsBase64(new Blob([data]), callback);
      }
    }
    return callback(PACKET_TYPES[type] + (data || ""));
  };
  var encodeBlobAsBase64 = (data, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function() {
      const content = fileReader.result.split(",")[1];
      callback("b" + (content || ""));
    };
    return fileReader.readAsDataURL(data);
  };
  function toArray(data) {
    if (data instanceof Uint8Array) {
      return data;
    } else if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    } else {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
  }
  var TEXT_ENCODER;
  function encodePacketToBinary(packet, callback) {
    if (withNativeBlob && packet.data instanceof Blob) {
      return packet.data.arrayBuffer().then(toArray).then(callback);
    } else if (withNativeArrayBuffer && (packet.data instanceof ArrayBuffer || isView(packet.data))) {
      return callback(toArray(packet.data));
    }
    encodePacket(packet, false, (encoded) => {
      if (!TEXT_ENCODER) {
        TEXT_ENCODER = new TextEncoder();
      }
      callback(TEXT_ENCODER.encode(encoded));
    });
  }

  // node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  var decode = (base64) => {
    let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }
    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i = 0; i < len; i += 4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i + 1)];
      encoded3 = lookup[base64.charCodeAt(i + 2)];
      encoded4 = lookup[base64.charCodeAt(i + 3)];
      bytes[p++] = encoded1 << 2 | encoded2 >> 4;
      bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
      bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return arraybuffer;
  };

  // node_modules/engine.io-parser/build/esm/decodePacket.browser.js
  var withNativeArrayBuffer2 = typeof ArrayBuffer === "function";
  var decodePacket = (encodedPacket, binaryType) => {
    if (typeof encodedPacket !== "string") {
      return {
        type: "message",
        data: mapBinary(encodedPacket, binaryType)
      };
    }
    const type = encodedPacket.charAt(0);
    if (type === "b") {
      return {
        type: "message",
        data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
      };
    }
    const packetType = PACKET_TYPES_REVERSE[type];
    if (!packetType) {
      return ERROR_PACKET;
    }
    return encodedPacket.length > 1 ? {
      type: PACKET_TYPES_REVERSE[type],
      data: encodedPacket.substring(1)
    } : {
      type: PACKET_TYPES_REVERSE[type]
    };
  };
  var decodeBase64Packet = (data, binaryType) => {
    if (withNativeArrayBuffer2) {
      const decoded = decode(data);
      return mapBinary(decoded, binaryType);
    } else {
      return { base64: true, data };
    }
  };
  var mapBinary = (data, binaryType) => {
    switch (binaryType) {
      case "blob":
        if (data instanceof Blob) {
          return data;
        } else {
          return new Blob([data]);
        }
      case "arraybuffer":
      default:
        if (data instanceof ArrayBuffer) {
          return data;
        } else {
          return data.buffer;
        }
    }
  };

  // node_modules/engine.io-parser/build/esm/index.js
  var SEPARATOR = String.fromCharCode(30);
  var encodePayload = (packets, callback) => {
    const length = packets.length;
    const encodedPackets = new Array(length);
    let count = 0;
    packets.forEach((packet, i) => {
      encodePacket(packet, false, (encodedPacket) => {
        encodedPackets[i] = encodedPacket;
        if (++count === length) {
          callback(encodedPackets.join(SEPARATOR));
        }
      });
    });
  };
  var decodePayload = (encodedPayload, binaryType) => {
    const encodedPackets = encodedPayload.split(SEPARATOR);
    const packets = [];
    for (let i = 0; i < encodedPackets.length; i++) {
      const decodedPacket = decodePacket(encodedPackets[i], binaryType);
      packets.push(decodedPacket);
      if (decodedPacket.type === "error") {
        break;
      }
    }
    return packets;
  };
  function createPacketEncoderStream() {
    return new TransformStream({
      transform(packet, controller) {
        encodePacketToBinary(packet, (encodedPacket) => {
          const payloadLength = encodedPacket.length;
          let header;
          if (payloadLength < 126) {
            header = new Uint8Array(1);
            new DataView(header.buffer).setUint8(0, payloadLength);
          } else if (payloadLength < 65536) {
            header = new Uint8Array(3);
            const view = new DataView(header.buffer);
            view.setUint8(0, 126);
            view.setUint16(1, payloadLength);
          } else {
            header = new Uint8Array(9);
            const view = new DataView(header.buffer);
            view.setUint8(0, 127);
            view.setBigUint64(1, BigInt(payloadLength));
          }
          if (packet.data && typeof packet.data !== "string") {
            header[0] |= 128;
          }
          controller.enqueue(header);
          controller.enqueue(encodedPacket);
        });
      }
    });
  }
  var TEXT_DECODER;
  function totalLength(chunks) {
    return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  }
  function concatChunks(chunks, size) {
    if (chunks[0].length === size) {
      return chunks.shift();
    }
    const buffer = new Uint8Array(size);
    let j = 0;
    for (let i = 0; i < size; i++) {
      buffer[i] = chunks[0][j++];
      if (j === chunks[0].length) {
        chunks.shift();
        j = 0;
      }
    }
    if (chunks.length && j < chunks[0].length) {
      chunks[0] = chunks[0].slice(j);
    }
    return buffer;
  }
  function createPacketDecoderStream(maxPayload, binaryType) {
    if (!TEXT_DECODER) {
      TEXT_DECODER = new TextDecoder();
    }
    const chunks = [];
    let state = 0;
    let expectedLength = -1;
    let isBinary2 = false;
    return new TransformStream({
      transform(chunk, controller) {
        chunks.push(chunk);
        while (true) {
          if (state === 0) {
            if (totalLength(chunks) < 1) {
              break;
            }
            const header = concatChunks(chunks, 1);
            isBinary2 = (header[0] & 128) === 128;
            expectedLength = header[0] & 127;
            if (expectedLength < 126) {
              state = 3;
            } else if (expectedLength === 126) {
              state = 1;
            } else {
              state = 2;
            }
          } else if (state === 1) {
            if (totalLength(chunks) < 2) {
              break;
            }
            const headerArray = concatChunks(chunks, 2);
            expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
            state = 3;
          } else if (state === 2) {
            if (totalLength(chunks) < 8) {
              break;
            }
            const headerArray = concatChunks(chunks, 8);
            const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
            const n = view.getUint32(0);
            if (n > Math.pow(2, 53 - 32) - 1) {
              controller.enqueue(ERROR_PACKET);
              break;
            }
            expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
            state = 3;
          } else {
            if (totalLength(chunks) < expectedLength) {
              break;
            }
            const data = concatChunks(chunks, expectedLength);
            controller.enqueue(decodePacket(isBinary2 ? data : TEXT_DECODER.decode(data), binaryType));
            state = 0;
          }
          if (expectedLength === 0 || expectedLength > maxPayload) {
            controller.enqueue(ERROR_PACKET);
            break;
          }
        }
      }
    });
  }
  var protocol = 4;

  // node_modules/@socket.io/component-emitter/lib/esm/index.js
  function Emitter(obj) {
    if (obj) return mixin(obj);
  }
  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }
    return obj;
  }
  Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
    return this;
  };
  Emitter.prototype.once = function(event, fn) {
    function on2() {
      this.off(event, on2);
      fn.apply(this, arguments);
    }
    on2.fn = fn;
    this.on(event, on2);
    return this;
  };
  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};
    if (0 == arguments.length) {
      this._callbacks = {};
      return this;
    }
    var callbacks = this._callbacks["$" + event];
    if (!callbacks) return this;
    if (1 == arguments.length) {
      delete this._callbacks["$" + event];
      return this;
    }
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];
      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i, 1);
        break;
      }
    }
    if (callbacks.length === 0) {
      delete this._callbacks["$" + event];
    }
    return this;
  };
  Emitter.prototype.emit = function(event) {
    this._callbacks = this._callbacks || {};
    var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }
    return this;
  };
  Emitter.prototype.emitReserved = Emitter.prototype.emit;
  Emitter.prototype.listeners = function(event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks["$" + event] || [];
  };
  Emitter.prototype.hasListeners = function(event) {
    return !!this.listeners(event).length;
  };

  // node_modules/engine.io-client/build/esm/globals.js
  var nextTick = (() => {
    const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
    if (isPromiseAvailable) {
      return (cb) => Promise.resolve().then(cb);
    } else {
      return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
    }
  })();
  var globalThisShim = (() => {
    if (typeof self !== "undefined") {
      return self;
    } else if (typeof window !== "undefined") {
      return window;
    } else {
      return Function("return this")();
    }
  })();
  var defaultBinaryType = "arraybuffer";
  function createCookieJar() {
  }

  // node_modules/engine.io-client/build/esm/util.js
  function pick(obj, ...attr) {
    return attr.reduce((acc, k) => {
      if (obj.hasOwnProperty(k)) {
        acc[k] = obj[k];
      }
      return acc;
    }, {});
  }
  var NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
  var NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
  function installTimerFunctions(obj, opts) {
    if (opts.useNativeTimers) {
      obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
      obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
    } else {
      obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
      obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
    }
  }
  var BASE64_OVERHEAD = 1.33;
  function byteLength(obj) {
    if (typeof obj === "string") {
      return utf8Length(obj);
    }
    return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
  }
  function utf8Length(str) {
    let c = 0, length = 0;
    for (let i = 0, l = str.length; i < l; i++) {
      c = str.charCodeAt(i);
      if (c < 128) {
        length += 1;
      } else if (c < 2048) {
        length += 2;
      } else if (c < 55296 || c >= 57344) {
        length += 3;
      } else {
        i++;
        length += 4;
      }
    }
    return length;
  }
  function randomString() {
    return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
  }

  // node_modules/engine.io-client/build/esm/contrib/parseqs.js
  function encode(obj) {
    let str = "";
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (str.length)
          str += "&";
        str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
      }
    }
    return str;
  }
  function decode2(qs) {
    let qry = {};
    let pairs = qs.split("&");
    for (let i = 0, l = pairs.length; i < l; i++) {
      let pair = pairs[i].split("=");
      qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
  }

  // node_modules/engine.io-client/build/esm/transport.js
  var TransportError = class extends Error {
    constructor(reason, description, context) {
      super(reason);
      this.description = description;
      this.context = context;
      this.type = "TransportError";
    }
  };
  var Transport = class extends Emitter {
    /**
     * Transport abstract constructor.
     *
     * @param {Object} opts - options
     * @protected
     */
    constructor(opts) {
      super();
      this.writable = false;
      installTimerFunctions(this, opts);
      this.opts = opts;
      this.query = opts.query;
      this.socket = opts.socket;
      this.supportsBinary = !opts.forceBase64;
    }
    /**
     * Emits an error.
     *
     * @param {String} reason
     * @param description
     * @param context - the error context
     * @return {Transport} for chaining
     * @protected
     */
    onError(reason, description, context) {
      super.emitReserved("error", new TransportError(reason, description, context));
      return this;
    }
    /**
     * Opens the transport.
     */
    open() {
      this.readyState = "opening";
      this.doOpen();
      return this;
    }
    /**
     * Closes the transport.
     */
    close() {
      if (this.readyState === "opening" || this.readyState === "open") {
        this.doClose();
        this.onClose();
      }
      return this;
    }
    /**
     * Sends multiple packets.
     *
     * @param {Array} packets
     */
    send(packets) {
      if (this.readyState === "open") {
        this.write(packets);
      } else {
      }
    }
    /**
     * Called upon open
     *
     * @protected
     */
    onOpen() {
      this.readyState = "open";
      this.writable = true;
      super.emitReserved("open");
    }
    /**
     * Called with data.
     *
     * @param {String} data
     * @protected
     */
    onData(data) {
      const packet = decodePacket(data, this.socket.binaryType);
      this.onPacket(packet);
    }
    /**
     * Called with a decoded packet.
     *
     * @protected
     */
    onPacket(packet) {
      super.emitReserved("packet", packet);
    }
    /**
     * Called upon close.
     *
     * @protected
     */
    onClose(details) {
      this.readyState = "closed";
      super.emitReserved("close", details);
    }
    /**
     * Pauses the transport, in order not to lose packets during an upgrade.
     *
     * @param onPause
     */
    pause(onPause) {
    }
    createUri(schema, query = {}) {
      return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
    }
    _hostname() {
      const hostname = this.opts.hostname;
      return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
    }
    _port() {
      if (this.opts.port && (this.opts.secure && Number(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80)) {
        return ":" + this.opts.port;
      } else {
        return "";
      }
    }
    _query(query) {
      const encodedQuery = encode(query);
      return encodedQuery.length ? "?" + encodedQuery : "";
    }
  };

  // node_modules/engine.io-client/build/esm/transports/polling.js
  var Polling = class extends Transport {
    constructor() {
      super(...arguments);
      this._polling = false;
    }
    get name() {
      return "polling";
    }
    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @protected
     */
    doOpen() {
      this._poll();
    }
    /**
     * Pauses polling.
     *
     * @param {Function} onPause - callback upon buffers are flushed and transport is paused
     * @package
     */
    pause(onPause) {
      this.readyState = "pausing";
      const pause = () => {
        this.readyState = "paused";
        onPause();
      };
      if (this._polling || !this.writable) {
        let total = 0;
        if (this._polling) {
          total++;
          this.once("pollComplete", function() {
            --total || pause();
          });
        }
        if (!this.writable) {
          total++;
          this.once("drain", function() {
            --total || pause();
          });
        }
      } else {
        pause();
      }
    }
    /**
     * Starts polling cycle.
     *
     * @private
     */
    _poll() {
      this._polling = true;
      this.doPoll();
      this.emitReserved("poll");
    }
    /**
     * Overloads onData to detect payloads.
     *
     * @protected
     */
    onData(data) {
      const callback = (packet) => {
        if ("opening" === this.readyState && packet.type === "open") {
          this.onOpen();
        }
        if ("close" === packet.type) {
          this.onClose({ description: "transport closed by the server" });
          return false;
        }
        this.onPacket(packet);
      };
      decodePayload(data, this.socket.binaryType).forEach(callback);
      if ("closed" !== this.readyState) {
        this._polling = false;
        this.emitReserved("pollComplete");
        if ("open" === this.readyState) {
          this._poll();
        } else {
        }
      }
    }
    /**
     * For polling, send a close packet.
     *
     * @protected
     */
    doClose() {
      const close = () => {
        this.write([{ type: "close" }]);
      };
      if ("open" === this.readyState) {
        close();
      } else {
        this.once("open", close);
      }
    }
    /**
     * Writes a packets payload.
     *
     * @param {Array} packets - data packets
     * @protected
     */
    write(packets) {
      this.writable = false;
      encodePayload(packets, (data) => {
        this.doWrite(data, () => {
          this.writable = true;
          this.emitReserved("drain");
        });
      });
    }
    /**
     * Generates uri for connection.
     *
     * @private
     */
    uri() {
      const schema = this.opts.secure ? "https" : "http";
      const query = this.query || {};
      if (false !== this.opts.timestampRequests) {
        query[this.opts.timestampParam] = randomString();
      }
      if (!this.supportsBinary && !query.sid) {
        query.b64 = 1;
      }
      return this.createUri(schema, query);
    }
  };

  // node_modules/engine.io-client/build/esm/contrib/has-cors.js
  var value = false;
  try {
    value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
  } catch (err) {
  }
  var hasCORS = value;

  // node_modules/engine.io-client/build/esm/transports/polling-xhr.js
  function empty() {
  }
  var BaseXHR = class extends Polling {
    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @package
     */
    constructor(opts) {
      super(opts);
      if (typeof location !== "undefined") {
        const isSSL = "https:" === location.protocol;
        let port = location.port;
        if (!port) {
          port = isSSL ? "443" : "80";
        }
        this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
      }
    }
    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @private
     */
    doWrite(data, fn) {
      const req = this.request({
        method: "POST",
        data
      });
      req.on("success", fn);
      req.on("error", (xhrStatus, context) => {
        this.onError("xhr post error", xhrStatus, context);
      });
    }
    /**
     * Starts a poll cycle.
     *
     * @private
     */
    doPoll() {
      const req = this.request();
      req.on("data", this.onData.bind(this));
      req.on("error", (xhrStatus, context) => {
        this.onError("xhr poll error", xhrStatus, context);
      });
      this.pollXhr = req;
    }
  };
  var Request = class _Request extends Emitter {
    /**
     * Request constructor
     *
     * @param {Object} options
     * @package
     */
    constructor(createRequest, uri, opts) {
      super();
      this.createRequest = createRequest;
      installTimerFunctions(this, opts);
      this._opts = opts;
      this._method = opts.method || "GET";
      this._uri = uri;
      this._data = void 0 !== opts.data ? opts.data : null;
      this._create();
    }
    /**
     * Creates the XHR object and sends the request.
     *
     * @private
     */
    _create() {
      var _a;
      const opts = pick(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
      opts.xdomain = !!this._opts.xd;
      const xhr = this._xhr = this.createRequest(opts);
      try {
        xhr.open(this._method, this._uri, true);
        try {
          if (this._opts.extraHeaders) {
            xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
            for (let i in this._opts.extraHeaders) {
              if (this._opts.extraHeaders.hasOwnProperty(i)) {
                xhr.setRequestHeader(i, this._opts.extraHeaders[i]);
              }
            }
          }
        } catch (e) {
        }
        if ("POST" === this._method) {
          try {
            xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
          } catch (e) {
          }
        }
        try {
          xhr.setRequestHeader("Accept", "*/*");
        } catch (e) {
        }
        (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.addCookies(xhr);
        if ("withCredentials" in xhr) {
          xhr.withCredentials = this._opts.withCredentials;
        }
        if (this._opts.requestTimeout) {
          xhr.timeout = this._opts.requestTimeout;
        }
        xhr.onreadystatechange = () => {
          var _a2;
          if (xhr.readyState === 3) {
            (_a2 = this._opts.cookieJar) === null || _a2 === void 0 ? void 0 : _a2.parseCookies(
              // @ts-ignore
              xhr.getResponseHeader("set-cookie")
            );
          }
          if (4 !== xhr.readyState)
            return;
          if (200 === xhr.status || 1223 === xhr.status) {
            this._onLoad();
          } else {
            this.setTimeoutFn(() => {
              this._onError(typeof xhr.status === "number" ? xhr.status : 0);
            }, 0);
          }
        };
        xhr.send(this._data);
      } catch (e) {
        this.setTimeoutFn(() => {
          this._onError(e);
        }, 0);
        return;
      }
      if (typeof document !== "undefined") {
        this._index = _Request.requestsCount++;
        _Request.requests[this._index] = this;
      }
    }
    /**
     * Called upon error.
     *
     * @private
     */
    _onError(err) {
      this.emitReserved("error", err, this._xhr);
      this._cleanup(true);
    }
    /**
     * Cleans up house.
     *
     * @private
     */
    _cleanup(fromError) {
      if ("undefined" === typeof this._xhr || null === this._xhr) {
        return;
      }
      this._xhr.onreadystatechange = empty;
      if (fromError) {
        try {
          this._xhr.abort();
        } catch (e) {
        }
      }
      if (typeof document !== "undefined") {
        delete _Request.requests[this._index];
      }
      this._xhr = null;
    }
    /**
     * Called upon load.
     *
     * @private
     */
    _onLoad() {
      const data = this._xhr.responseText;
      if (data !== null) {
        this.emitReserved("data", data);
        this.emitReserved("success");
        this._cleanup();
      }
    }
    /**
     * Aborts the request.
     *
     * @package
     */
    abort() {
      this._cleanup();
    }
  };
  Request.requestsCount = 0;
  Request.requests = {};
  if (typeof document !== "undefined") {
    if (typeof attachEvent === "function") {
      attachEvent("onunload", unloadHandler);
    } else if (typeof addEventListener === "function") {
      const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
      addEventListener(terminationEvent, unloadHandler, false);
    }
  }
  function unloadHandler() {
    for (let i in Request.requests) {
      if (Request.requests.hasOwnProperty(i)) {
        Request.requests[i].abort();
      }
    }
  }
  var hasXHR2 = function() {
    const xhr = newRequest({
      xdomain: false
    });
    return xhr && xhr.responseType !== null;
  }();
  var XHR = class extends BaseXHR {
    constructor(opts) {
      super(opts);
      const forceBase64 = opts && opts.forceBase64;
      this.supportsBinary = hasXHR2 && !forceBase64;
    }
    request(opts = {}) {
      Object.assign(opts, { xd: this.xd }, this.opts);
      return new Request(newRequest, this.uri(), opts);
    }
  };
  function newRequest(opts) {
    const xdomain = opts.xdomain;
    try {
      if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
        return new XMLHttpRequest();
      }
    } catch (e) {
    }
    if (!xdomain) {
      try {
        return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
      } catch (e) {
      }
    }
  }

  // node_modules/engine.io-client/build/esm/transports/websocket.js
  var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
  var BaseWS = class extends Transport {
    get name() {
      return "websocket";
    }
    doOpen() {
      const uri = this.uri();
      const protocols = this.opts.protocols;
      const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
      if (this.opts.extraHeaders) {
        opts.headers = this.opts.extraHeaders;
      }
      try {
        this.ws = this.createSocket(uri, protocols, opts);
      } catch (err) {
        return this.emitReserved("error", err);
      }
      this.ws.binaryType = this.socket.binaryType;
      this.addEventListeners();
    }
    /**
     * Adds event listeners to the socket
     *
     * @private
     */
    addEventListeners() {
      this.ws.onopen = () => {
        if (this.opts.autoUnref) {
          this.ws._socket.unref();
        }
        this.onOpen();
      };
      this.ws.onclose = (closeEvent) => this.onClose({
        description: "websocket connection closed",
        context: closeEvent
      });
      this.ws.onmessage = (ev) => this.onData(ev.data);
      this.ws.onerror = (e) => this.onError("websocket error", e);
    }
    write(packets) {
      this.writable = false;
      for (let i = 0; i < packets.length; i++) {
        const packet = packets[i];
        const lastPacket = i === packets.length - 1;
        encodePacket(packet, this.supportsBinary, (data) => {
          try {
            this.doWrite(packet, data);
          } catch (e) {
          }
          if (lastPacket) {
            nextTick(() => {
              this.writable = true;
              this.emitReserved("drain");
            }, this.setTimeoutFn);
          }
        });
      }
    }
    doClose() {
      if (typeof this.ws !== "undefined") {
        this.ws.onerror = () => {
        };
        this.ws.close();
        this.ws = null;
      }
    }
    /**
     * Generates uri for connection.
     *
     * @private
     */
    uri() {
      const schema = this.opts.secure ? "wss" : "ws";
      const query = this.query || {};
      if (this.opts.timestampRequests) {
        query[this.opts.timestampParam] = randomString();
      }
      if (!this.supportsBinary) {
        query.b64 = 1;
      }
      return this.createUri(schema, query);
    }
  };
  var WebSocketCtor = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
  var WS = class extends BaseWS {
    createSocket(uri, protocols, opts) {
      return !isReactNative ? protocols ? new WebSocketCtor(uri, protocols) : new WebSocketCtor(uri) : new WebSocketCtor(uri, protocols, opts);
    }
    doWrite(_packet, data) {
      this.ws.send(data);
    }
  };

  // node_modules/engine.io-client/build/esm/transports/webtransport.js
  var WT = class extends Transport {
    get name() {
      return "webtransport";
    }
    doOpen() {
      try {
        this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
      } catch (err) {
        return this.emitReserved("error", err);
      }
      this._transport.closed.then(() => {
        this.onClose();
      }).catch((err) => {
        this.onError("webtransport error", err);
      });
      this._transport.ready.then(() => {
        this._transport.createBidirectionalStream().then((stream) => {
          const decoderStream = createPacketDecoderStream(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
          const reader = stream.readable.pipeThrough(decoderStream).getReader();
          const encoderStream = createPacketEncoderStream();
          encoderStream.readable.pipeTo(stream.writable);
          this._writer = encoderStream.writable.getWriter();
          const read = () => {
            reader.read().then(({ done, value: value2 }) => {
              if (done) {
                return;
              }
              this.onPacket(value2);
              read();
            }).catch((err) => {
            });
          };
          read();
          const packet = { type: "open" };
          if (this.query.sid) {
            packet.data = `{"sid":"${this.query.sid}"}`;
          }
          this._writer.write(packet).then(() => this.onOpen());
        });
      });
    }
    write(packets) {
      this.writable = false;
      for (let i = 0; i < packets.length; i++) {
        const packet = packets[i];
        const lastPacket = i === packets.length - 1;
        this._writer.write(packet).then(() => {
          if (lastPacket) {
            nextTick(() => {
              this.writable = true;
              this.emitReserved("drain");
            }, this.setTimeoutFn);
          }
        });
      }
    }
    doClose() {
      var _a;
      (_a = this._transport) === null || _a === void 0 ? void 0 : _a.close();
    }
  };

  // node_modules/engine.io-client/build/esm/transports/index.js
  var transports = {
    websocket: WS,
    webtransport: WT,
    polling: XHR
  };

  // node_modules/engine.io-client/build/esm/contrib/parseuri.js
  var re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
  var parts = [
    "source",
    "protocol",
    "authority",
    "userInfo",
    "user",
    "password",
    "host",
    "port",
    "relative",
    "path",
    "directory",
    "file",
    "query",
    "anchor"
  ];
  function parse(str) {
    if (str.length > 8e3) {
      throw "URI too long";
    }
    const src = str, b = str.indexOf("["), e = str.indexOf("]");
    if (b != -1 && e != -1) {
      str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
    }
    let m = re.exec(str || ""), uri = {}, i = 14;
    while (i--) {
      uri[parts[i]] = m[i] || "";
    }
    if (b != -1 && e != -1) {
      uri.source = src;
      uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
      uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
      uri.ipv6uri = true;
    }
    uri.pathNames = pathNames(uri, uri["path"]);
    uri.queryKey = queryKey(uri, uri["query"]);
    return uri;
  }
  function pathNames(obj, path) {
    const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
    if (path.slice(0, 1) == "/" || path.length === 0) {
      names.splice(0, 1);
    }
    if (path.slice(-1) == "/") {
      names.splice(names.length - 1, 1);
    }
    return names;
  }
  function queryKey(uri, query) {
    const data = {};
    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
      if ($1) {
        data[$1] = $2;
      }
    });
    return data;
  }

  // node_modules/engine.io-client/build/esm/socket.js
  var withEventListeners = typeof addEventListener === "function" && typeof removeEventListener === "function";
  var OFFLINE_EVENT_LISTENERS = [];
  if (withEventListeners) {
    addEventListener("offline", () => {
      OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
    }, false);
  }
  var SocketWithoutUpgrade = class _SocketWithoutUpgrade extends Emitter {
    /**
     * Socket constructor.
     *
     * @param {String|Object} uri - uri or options
     * @param {Object} opts - options
     */
    constructor(uri, opts) {
      super();
      this.binaryType = defaultBinaryType;
      this.writeBuffer = [];
      this._prevBufferLen = 0;
      this._pingInterval = -1;
      this._pingTimeout = -1;
      this._maxPayload = -1;
      this._pingTimeoutTime = Infinity;
      if (uri && "object" === typeof uri) {
        opts = uri;
        uri = null;
      }
      if (uri) {
        const parsedUri = parse(uri);
        opts.hostname = parsedUri.host;
        opts.secure = parsedUri.protocol === "https" || parsedUri.protocol === "wss";
        opts.port = parsedUri.port;
        if (parsedUri.query)
          opts.query = parsedUri.query;
      } else if (opts.host) {
        opts.hostname = parse(opts.host).host;
      }
      installTimerFunctions(this, opts);
      this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
      if (opts.hostname && !opts.port) {
        opts.port = this.secure ? "443" : "80";
      }
      this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
      this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
      this.transports = [];
      this._transportsByName = {};
      opts.transports.forEach((t) => {
        const transportName = t.prototype.name;
        this.transports.push(transportName);
        this._transportsByName[transportName] = t;
      });
      this.opts = Object.assign({
        path: "/engine.io",
        agent: false,
        withCredentials: false,
        upgrade: true,
        timestampParam: "t",
        rememberUpgrade: false,
        addTrailingSlash: true,
        rejectUnauthorized: true,
        perMessageDeflate: {
          threshold: 1024
        },
        transportOptions: {},
        closeOnBeforeunload: false
      }, opts);
      this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
      if (typeof this.opts.query === "string") {
        this.opts.query = decode2(this.opts.query);
      }
      if (withEventListeners) {
        if (this.opts.closeOnBeforeunload) {
          this._beforeunloadEventListener = () => {
            if (this.transport) {
              this.transport.removeAllListeners();
              this.transport.close();
            }
          };
          addEventListener("beforeunload", this._beforeunloadEventListener, false);
        }
        if (this.hostname !== "localhost") {
          this._offlineEventListener = () => {
            this._onClose("transport close", {
              description: "network connection lost"
            });
          };
          OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
        }
      }
      if (this.opts.withCredentials) {
        this._cookieJar = createCookieJar();
      }
      this._open();
    }
    /**
     * Creates transport of the given type.
     *
     * @param {String} name - transport name
     * @return {Transport}
     * @private
     */
    createTransport(name) {
      const query = Object.assign({}, this.opts.query);
      query.EIO = protocol;
      query.transport = name;
      if (this.id)
        query.sid = this.id;
      const opts = Object.assign({}, this.opts, {
        query,
        socket: this,
        hostname: this.hostname,
        secure: this.secure,
        port: this.port
      }, this.opts.transportOptions[name]);
      return new this._transportsByName[name](opts);
    }
    /**
     * Initializes transport to use and starts probe.
     *
     * @private
     */
    _open() {
      if (this.transports.length === 0) {
        this.setTimeoutFn(() => {
          this.emitReserved("error", "No transports available");
        }, 0);
        return;
      }
      const transportName = this.opts.rememberUpgrade && _SocketWithoutUpgrade.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
      this.readyState = "opening";
      const transport = this.createTransport(transportName);
      transport.open();
      this.setTransport(transport);
    }
    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @private
     */
    setTransport(transport) {
      if (this.transport) {
        this.transport.removeAllListeners();
      }
      this.transport = transport;
      transport.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (reason) => this._onClose("transport close", reason));
    }
    /**
     * Called when connection is deemed open.
     *
     * @private
     */
    onOpen() {
      this.readyState = "open";
      _SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === this.transport.name;
      this.emitReserved("open");
      this.flush();
    }
    /**
     * Handles a packet.
     *
     * @private
     */
    _onPacket(packet) {
      if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
        this.emitReserved("packet", packet);
        this.emitReserved("heartbeat");
        switch (packet.type) {
          case "open":
            this.onHandshake(JSON.parse(packet.data));
            break;
          case "ping":
            this._sendPacket("pong");
            this.emitReserved("ping");
            this.emitReserved("pong");
            this._resetPingTimeout();
            break;
          case "error":
            const err = new Error("server error");
            err.code = packet.data;
            this._onError(err);
            break;
          case "message":
            this.emitReserved("data", packet.data);
            this.emitReserved("message", packet.data);
            break;
        }
      } else {
      }
    }
    /**
     * Called upon handshake completion.
     *
     * @param {Object} data - handshake obj
     * @private
     */
    onHandshake(data) {
      this.emitReserved("handshake", data);
      this.id = data.sid;
      this.transport.query.sid = data.sid;
      this._pingInterval = data.pingInterval;
      this._pingTimeout = data.pingTimeout;
      this._maxPayload = data.maxPayload;
      this.onOpen();
      if ("closed" === this.readyState)
        return;
      this._resetPingTimeout();
    }
    /**
     * Sets and resets ping timeout timer based on server pings.
     *
     * @private
     */
    _resetPingTimeout() {
      this.clearTimeoutFn(this._pingTimeoutTimer);
      const delay = this._pingInterval + this._pingTimeout;
      this._pingTimeoutTime = Date.now() + delay;
      this._pingTimeoutTimer = this.setTimeoutFn(() => {
        this._onClose("ping timeout");
      }, delay);
      if (this.opts.autoUnref) {
        this._pingTimeoutTimer.unref();
      }
    }
    /**
     * Called on `drain` event
     *
     * @private
     */
    _onDrain() {
      this.writeBuffer.splice(0, this._prevBufferLen);
      this._prevBufferLen = 0;
      if (0 === this.writeBuffer.length) {
        this.emitReserved("drain");
      } else {
        this.flush();
      }
    }
    /**
     * Flush write buffers.
     *
     * @private
     */
    flush() {
      if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
        const packets = this._getWritablePackets();
        this.transport.send(packets);
        this._prevBufferLen = packets.length;
        this.emitReserved("flush");
      }
    }
    /**
     * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
     * long-polling)
     *
     * @private
     */
    _getWritablePackets() {
      const shouldCheckPayloadSize = this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
      if (!shouldCheckPayloadSize) {
        return this.writeBuffer;
      }
      let payloadSize = 1;
      for (let i = 0; i < this.writeBuffer.length; i++) {
        const data = this.writeBuffer[i].data;
        if (data) {
          payloadSize += byteLength(data);
        }
        if (i > 0 && payloadSize > this._maxPayload) {
          return this.writeBuffer.slice(0, i);
        }
        payloadSize += 2;
      }
      return this.writeBuffer;
    }
    /**
     * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
     *
     * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
     * `write()` method then the message would not be buffered by the Socket.IO client.
     *
     * @return {boolean}
     * @private
     */
    /* private */
    _hasPingExpired() {
      if (!this._pingTimeoutTime)
        return true;
      const hasExpired = Date.now() > this._pingTimeoutTime;
      if (hasExpired) {
        this._pingTimeoutTime = 0;
        nextTick(() => {
          this._onClose("ping timeout");
        }, this.setTimeoutFn);
      }
      return hasExpired;
    }
    /**
     * Sends a message.
     *
     * @param {String} msg - message.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @return {Socket} for chaining.
     */
    write(msg, options, fn) {
      this._sendPacket("message", msg, options, fn);
      return this;
    }
    /**
     * Sends a message. Alias of {@link Socket#write}.
     *
     * @param {String} msg - message.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @return {Socket} for chaining.
     */
    send(msg, options, fn) {
      this._sendPacket("message", msg, options, fn);
      return this;
    }
    /**
     * Sends a packet.
     *
     * @param {String} type: packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @private
     */
    _sendPacket(type, data, options, fn) {
      if ("function" === typeof data) {
        fn = data;
        data = void 0;
      }
      if ("function" === typeof options) {
        fn = options;
        options = null;
      }
      if ("closing" === this.readyState || "closed" === this.readyState) {
        return;
      }
      options = options || {};
      options.compress = false !== options.compress;
      const packet = {
        type,
        data,
        options
      };
      this.emitReserved("packetCreate", packet);
      this.writeBuffer.push(packet);
      if (fn)
        this.once("flush", fn);
      this.flush();
    }
    /**
     * Closes the connection.
     */
    close() {
      const close = () => {
        this._onClose("forced close");
        this.transport.close();
      };
      const cleanupAndClose = () => {
        this.off("upgrade", cleanupAndClose);
        this.off("upgradeError", cleanupAndClose);
        close();
      };
      const waitForUpgrade = () => {
        this.once("upgrade", cleanupAndClose);
        this.once("upgradeError", cleanupAndClose);
      };
      if ("opening" === this.readyState || "open" === this.readyState) {
        this.readyState = "closing";
        if (this.writeBuffer.length) {
          this.once("drain", () => {
            if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          });
        } else if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      }
      return this;
    }
    /**
     * Called upon transport error
     *
     * @private
     */
    _onError(err) {
      _SocketWithoutUpgrade.priorWebsocketSuccess = false;
      if (this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") {
        this.transports.shift();
        return this._open();
      }
      this.emitReserved("error", err);
      this._onClose("transport error", err);
    }
    /**
     * Called upon transport close.
     *
     * @private
     */
    _onClose(reason, description) {
      if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
        this.clearTimeoutFn(this._pingTimeoutTimer);
        this.transport.removeAllListeners("close");
        this.transport.close();
        this.transport.removeAllListeners();
        if (withEventListeners) {
          if (this._beforeunloadEventListener) {
            removeEventListener("beforeunload", this._beforeunloadEventListener, false);
          }
          if (this._offlineEventListener) {
            const i = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
            if (i !== -1) {
              OFFLINE_EVENT_LISTENERS.splice(i, 1);
            }
          }
        }
        this.readyState = "closed";
        this.id = null;
        this.emitReserved("close", reason, description);
        this.writeBuffer = [];
        this._prevBufferLen = 0;
      }
    }
  };
  SocketWithoutUpgrade.protocol = protocol;
  var SocketWithUpgrade = class extends SocketWithoutUpgrade {
    constructor() {
      super(...arguments);
      this._upgrades = [];
    }
    onOpen() {
      super.onOpen();
      if ("open" === this.readyState && this.opts.upgrade) {
        for (let i = 0; i < this._upgrades.length; i++) {
          this._probe(this._upgrades[i]);
        }
      }
    }
    /**
     * Probes a transport.
     *
     * @param {String} name - transport name
     * @private
     */
    _probe(name) {
      let transport = this.createTransport(name);
      let failed = false;
      SocketWithoutUpgrade.priorWebsocketSuccess = false;
      const onTransportOpen = () => {
        if (failed)
          return;
        transport.send([{ type: "ping", data: "probe" }]);
        transport.once("packet", (msg) => {
          if (failed)
            return;
          if ("pong" === msg.type && "probe" === msg.data) {
            this.upgrading = true;
            this.emitReserved("upgrading", transport);
            if (!transport)
              return;
            SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === transport.name;
            this.transport.pause(() => {
              if (failed)
                return;
              if ("closed" === this.readyState)
                return;
              cleanup();
              this.setTransport(transport);
              transport.send([{ type: "upgrade" }]);
              this.emitReserved("upgrade", transport);
              transport = null;
              this.upgrading = false;
              this.flush();
            });
          } else {
            const err = new Error("probe error");
            err.transport = transport.name;
            this.emitReserved("upgradeError", err);
          }
        });
      };
      function freezeTransport() {
        if (failed)
          return;
        failed = true;
        cleanup();
        transport.close();
        transport = null;
      }
      const onerror = (err) => {
        const error = new Error("probe error: " + err);
        error.transport = transport.name;
        freezeTransport();
        this.emitReserved("upgradeError", error);
      };
      function onTransportClose() {
        onerror("transport closed");
      }
      function onclose() {
        onerror("socket closed");
      }
      function onupgrade(to) {
        if (transport && to.name !== transport.name) {
          freezeTransport();
        }
      }
      const cleanup = () => {
        transport.removeListener("open", onTransportOpen);
        transport.removeListener("error", onerror);
        transport.removeListener("close", onTransportClose);
        this.off("close", onclose);
        this.off("upgrading", onupgrade);
      };
      transport.once("open", onTransportOpen);
      transport.once("error", onerror);
      transport.once("close", onTransportClose);
      this.once("close", onclose);
      this.once("upgrading", onupgrade);
      if (this._upgrades.indexOf("webtransport") !== -1 && name !== "webtransport") {
        this.setTimeoutFn(() => {
          if (!failed) {
            transport.open();
          }
        }, 200);
      } else {
        transport.open();
      }
    }
    onHandshake(data) {
      this._upgrades = this._filterUpgrades(data.upgrades);
      super.onHandshake(data);
    }
    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} upgrades - server upgrades
     * @private
     */
    _filterUpgrades(upgrades) {
      const filteredUpgrades = [];
      for (let i = 0; i < upgrades.length; i++) {
        if (~this.transports.indexOf(upgrades[i]))
          filteredUpgrades.push(upgrades[i]);
      }
      return filteredUpgrades;
    }
  };
  var Socket = class extends SocketWithUpgrade {
    constructor(uri, opts = {}) {
      const o = typeof uri === "object" ? uri : opts;
      if (!o.transports || o.transports && typeof o.transports[0] === "string") {
        o.transports = (o.transports || ["polling", "websocket", "webtransport"]).map((transportName) => transports[transportName]).filter((t) => !!t);
      }
      super(uri, o);
    }
  };

  // node_modules/engine.io-client/build/esm/index.js
  var protocol2 = Socket.protocol;

  // node_modules/socket.io-client/build/esm/url.js
  function url(uri, path = "", loc) {
    let obj = uri;
    loc = loc || typeof location !== "undefined" && location;
    if (null == uri)
      uri = loc.protocol + "//" + loc.host;
    if (typeof uri === "string") {
      if ("/" === uri.charAt(0)) {
        if ("/" === uri.charAt(1)) {
          uri = loc.protocol + uri;
        } else {
          uri = loc.host + uri;
        }
      }
      if (!/^(https?|wss?):\/\//.test(uri)) {
        if ("undefined" !== typeof loc) {
          uri = loc.protocol + "//" + uri;
        } else {
          uri = "https://" + uri;
        }
      }
      obj = parse(uri);
    }
    if (!obj.port) {
      if (/^(http|ws)$/.test(obj.protocol)) {
        obj.port = "80";
      } else if (/^(http|ws)s$/.test(obj.protocol)) {
        obj.port = "443";
      }
    }
    obj.path = obj.path || "/";
    const ipv6 = obj.host.indexOf(":") !== -1;
    const host = ipv6 ? "[" + obj.host + "]" : obj.host;
    obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
    obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
    return obj;
  }

  // node_modules/socket.io-parser/build/esm/index.js
  var esm_exports = {};
  __export(esm_exports, {
    Decoder: () => Decoder,
    Encoder: () => Encoder,
    PacketType: () => PacketType,
    protocol: () => protocol3
  });

  // node_modules/socket.io-parser/build/esm/is-binary.js
  var withNativeArrayBuffer3 = typeof ArrayBuffer === "function";
  var isView2 = (obj) => {
    return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
  };
  var toString = Object.prototype.toString;
  var withNativeBlob2 = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
  var withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
  function isBinary(obj) {
    return withNativeArrayBuffer3 && (obj instanceof ArrayBuffer || isView2(obj)) || withNativeBlob2 && obj instanceof Blob || withNativeFile && obj instanceof File;
  }
  function hasBinary(obj, toJSON) {
    if (!obj || typeof obj !== "object") {
      return false;
    }
    if (Array.isArray(obj)) {
      for (let i = 0, l = obj.length; i < l; i++) {
        if (hasBinary(obj[i])) {
          return true;
        }
      }
      return false;
    }
    if (isBinary(obj)) {
      return true;
    }
    if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) {
      return hasBinary(obj.toJSON(), true);
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
        return true;
      }
    }
    return false;
  }

  // node_modules/socket.io-parser/build/esm/binary.js
  function deconstructPacket(packet) {
    const buffers = [];
    const packetData = packet.data;
    const pack = packet;
    pack.data = _deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length;
    return { packet: pack, buffers };
  }
  function _deconstructPacket(data, buffers) {
    if (!data)
      return data;
    if (isBinary(data)) {
      const placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (Array.isArray(data)) {
      const newData = new Array(data.length);
      for (let i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i], buffers);
      }
      return newData;
    } else if (typeof data === "object" && !(data instanceof Date)) {
      const newData = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          newData[key] = _deconstructPacket(data[key], buffers);
        }
      }
      return newData;
    }
    return data;
  }
  function reconstructPacket(packet, buffers) {
    packet.data = _reconstructPacket(packet.data, buffers);
    delete packet.attachments;
    return packet;
  }
  function _reconstructPacket(data, buffers) {
    if (!data)
      return data;
    if (data && data._placeholder === true) {
      const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
      if (isIndexValid) {
        return buffers[data.num];
      } else {
        throw new Error("illegal attachments");
      }
    } else if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i], buffers);
      }
    } else if (typeof data === "object") {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          data[key] = _reconstructPacket(data[key], buffers);
        }
      }
    }
    return data;
  }

  // node_modules/socket.io-parser/build/esm/index.js
  var RESERVED_EVENTS = [
    "connect",
    "connect_error",
    "disconnect",
    "disconnecting",
    "newListener",
    "removeListener"
    // used by the Node.js EventEmitter
  ];
  var protocol3 = 5;
  var PacketType;
  (function(PacketType2) {
    PacketType2[PacketType2["CONNECT"] = 0] = "CONNECT";
    PacketType2[PacketType2["DISCONNECT"] = 1] = "DISCONNECT";
    PacketType2[PacketType2["EVENT"] = 2] = "EVENT";
    PacketType2[PacketType2["ACK"] = 3] = "ACK";
    PacketType2[PacketType2["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
    PacketType2[PacketType2["BINARY_EVENT"] = 5] = "BINARY_EVENT";
    PacketType2[PacketType2["BINARY_ACK"] = 6] = "BINARY_ACK";
  })(PacketType || (PacketType = {}));
  var Encoder = class {
    /**
     * Encoder constructor
     *
     * @param {function} replacer - custom replacer to pass down to JSON.parse
     */
    constructor(replacer) {
      this.replacer = replacer;
    }
    /**
     * Encode a packet as a single string if non-binary, or as a
     * buffer sequence, depending on packet type.
     *
     * @param {Object} obj - packet object
     */
    encode(obj) {
      if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
        if (hasBinary(obj)) {
          return this.encodeAsBinary({
            type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
            nsp: obj.nsp,
            data: obj.data,
            id: obj.id
          });
        }
      }
      return [this.encodeAsString(obj)];
    }
    /**
     * Encode packet as string.
     */
    encodeAsString(obj) {
      let str = "" + obj.type;
      if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) {
        str += obj.attachments + "-";
      }
      if (obj.nsp && "/" !== obj.nsp) {
        str += obj.nsp + ",";
      }
      if (null != obj.id) {
        str += obj.id;
      }
      if (null != obj.data) {
        str += JSON.stringify(obj.data, this.replacer);
      }
      return str;
    }
    /**
     * Encode packet as 'buffer sequence' by removing blobs, and
     * deconstructing packet into object with placeholders and
     * a list of buffers.
     */
    encodeAsBinary(obj) {
      const deconstruction = deconstructPacket(obj);
      const pack = this.encodeAsString(deconstruction.packet);
      const buffers = deconstruction.buffers;
      buffers.unshift(pack);
      return buffers;
    }
  };
  function isObject(value2) {
    return Object.prototype.toString.call(value2) === "[object Object]";
  }
  var Decoder = class _Decoder extends Emitter {
    /**
     * Decoder constructor
     *
     * @param {function} reviver - custom reviver to pass down to JSON.stringify
     */
    constructor(reviver) {
      super();
      this.reviver = reviver;
    }
    /**
     * Decodes an encoded packet string into packet JSON.
     *
     * @param {String} obj - encoded packet
     */
    add(obj) {
      let packet;
      if (typeof obj === "string") {
        if (this.reconstructor) {
          throw new Error("got plaintext data when reconstructing a packet");
        }
        packet = this.decodeString(obj);
        const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
        if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
          packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
          this.reconstructor = new BinaryReconstructor(packet);
          if (packet.attachments === 0) {
            super.emitReserved("decoded", packet);
          }
        } else {
          super.emitReserved("decoded", packet);
        }
      } else if (isBinary(obj) || obj.base64) {
        if (!this.reconstructor) {
          throw new Error("got binary data when not reconstructing a packet");
        } else {
          packet = this.reconstructor.takeBinaryData(obj);
          if (packet) {
            this.reconstructor = null;
            super.emitReserved("decoded", packet);
          }
        }
      } else {
        throw new Error("Unknown type: " + obj);
      }
    }
    /**
     * Decode a packet String (JSON data)
     *
     * @param {String} str
     * @return {Object} packet
     */
    decodeString(str) {
      let i = 0;
      const p = {
        type: Number(str.charAt(0))
      };
      if (PacketType[p.type] === void 0) {
        throw new Error("unknown packet type " + p.type);
      }
      if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
        const start = i + 1;
        while (str.charAt(++i) !== "-" && i != str.length) {
        }
        const buf = str.substring(start, i);
        if (buf != Number(buf) || str.charAt(i) !== "-") {
          throw new Error("Illegal attachments");
        }
        p.attachments = Number(buf);
      }
      if ("/" === str.charAt(i + 1)) {
        const start = i + 1;
        while (++i) {
          const c = str.charAt(i);
          if ("," === c)
            break;
          if (i === str.length)
            break;
        }
        p.nsp = str.substring(start, i);
      } else {
        p.nsp = "/";
      }
      const next = str.charAt(i + 1);
      if ("" !== next && Number(next) == next) {
        const start = i + 1;
        while (++i) {
          const c = str.charAt(i);
          if (null == c || Number(c) != c) {
            --i;
            break;
          }
          if (i === str.length)
            break;
        }
        p.id = Number(str.substring(start, i + 1));
      }
      if (str.charAt(++i)) {
        const payload = this.tryParse(str.substr(i));
        if (_Decoder.isPayloadValid(p.type, payload)) {
          p.data = payload;
        } else {
          throw new Error("invalid payload");
        }
      }
      return p;
    }
    tryParse(str) {
      try {
        return JSON.parse(str, this.reviver);
      } catch (e) {
        return false;
      }
    }
    static isPayloadValid(type, payload) {
      switch (type) {
        case PacketType.CONNECT:
          return isObject(payload);
        case PacketType.DISCONNECT:
          return payload === void 0;
        case PacketType.CONNECT_ERROR:
          return typeof payload === "string" || isObject(payload);
        case PacketType.EVENT:
        case PacketType.BINARY_EVENT:
          return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
        case PacketType.ACK:
        case PacketType.BINARY_ACK:
          return Array.isArray(payload);
      }
    }
    /**
     * Deallocates a parser's resources
     */
    destroy() {
      if (this.reconstructor) {
        this.reconstructor.finishedReconstruction();
        this.reconstructor = null;
      }
    }
  };
  var BinaryReconstructor = class {
    constructor(packet) {
      this.packet = packet;
      this.buffers = [];
      this.reconPack = packet;
    }
    /**
     * Method to be called when binary data received from connection
     * after a BINARY_EVENT packet.
     *
     * @param {Buffer | ArrayBuffer} binData - the raw binary data received
     * @return {null | Object} returns null if more binary data is expected or
     *   a reconstructed packet object if all buffers have been received.
     */
    takeBinaryData(binData) {
      this.buffers.push(binData);
      if (this.buffers.length === this.reconPack.attachments) {
        const packet = reconstructPacket(this.reconPack, this.buffers);
        this.finishedReconstruction();
        return packet;
      }
      return null;
    }
    /**
     * Cleans up binary packet reconstruction variables.
     */
    finishedReconstruction() {
      this.reconPack = null;
      this.buffers = [];
    }
  };

  // node_modules/socket.io-client/build/esm/on.js
  function on(obj, ev, fn) {
    obj.on(ev, fn);
    return function subDestroy() {
      obj.off(ev, fn);
    };
  }

  // node_modules/socket.io-client/build/esm/socket.js
  var RESERVED_EVENTS2 = Object.freeze({
    connect: 1,
    connect_error: 1,
    disconnect: 1,
    disconnecting: 1,
    // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
    newListener: 1,
    removeListener: 1
  });
  var Socket2 = class extends Emitter {
    /**
     * `Socket` constructor.
     */
    constructor(io, nsp, opts) {
      super();
      this.connected = false;
      this.recovered = false;
      this.receiveBuffer = [];
      this.sendBuffer = [];
      this._queue = [];
      this._queueSeq = 0;
      this.ids = 0;
      this.acks = {};
      this.flags = {};
      this.io = io;
      this.nsp = nsp;
      if (opts && opts.auth) {
        this.auth = opts.auth;
      }
      this._opts = Object.assign({}, opts);
      if (this.io._autoConnect)
        this.open();
    }
    /**
     * Whether the socket is currently disconnected
     *
     * @example
     * const socket = io();
     *
     * socket.on("connect", () => {
     *   console.log(socket.disconnected); // false
     * });
     *
     * socket.on("disconnect", () => {
     *   console.log(socket.disconnected); // true
     * });
     */
    get disconnected() {
      return !this.connected;
    }
    /**
     * Subscribe to open, close and packet events
     *
     * @private
     */
    subEvents() {
      if (this.subs)
        return;
      const io = this.io;
      this.subs = [
        on(io, "open", this.onopen.bind(this)),
        on(io, "packet", this.onpacket.bind(this)),
        on(io, "error", this.onerror.bind(this)),
        on(io, "close", this.onclose.bind(this))
      ];
    }
    /**
     * Whether the Socket will try to reconnect when its Manager connects or reconnects.
     *
     * @example
     * const socket = io();
     *
     * console.log(socket.active); // true
     *
     * socket.on("disconnect", (reason) => {
     *   if (reason === "io server disconnect") {
     *     // the disconnection was initiated by the server, you need to manually reconnect
     *     console.log(socket.active); // false
     *   }
     *   // else the socket will automatically try to reconnect
     *   console.log(socket.active); // true
     * });
     */
    get active() {
      return !!this.subs;
    }
    /**
     * "Opens" the socket.
     *
     * @example
     * const socket = io({
     *   autoConnect: false
     * });
     *
     * socket.connect();
     */
    connect() {
      if (this.connected)
        return this;
      this.subEvents();
      if (!this.io["_reconnecting"])
        this.io.open();
      if ("open" === this.io._readyState)
        this.onopen();
      return this;
    }
    /**
     * Alias for {@link connect()}.
     */
    open() {
      return this.connect();
    }
    /**
     * Sends a `message` event.
     *
     * This method mimics the WebSocket.send() method.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
     *
     * @example
     * socket.send("hello");
     *
     * // this is equivalent to
     * socket.emit("message", "hello");
     *
     * @return self
     */
    send(...args) {
      args.unshift("message");
      this.emit.apply(this, args);
      return this;
    }
    /**
     * Override `emit`.
     * If the event is in `events`, it's emitted normally.
     *
     * @example
     * socket.emit("hello", "world");
     *
     * // all serializable datastructures are supported (no need to call JSON.stringify)
     * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
     *
     * // with an acknowledgement from the server
     * socket.emit("hello", "world", (val) => {
     *   // ...
     * });
     *
     * @return self
     */
    emit(ev, ...args) {
      var _a, _b, _c;
      if (RESERVED_EVENTS2.hasOwnProperty(ev)) {
        throw new Error('"' + ev.toString() + '" is a reserved event name');
      }
      args.unshift(ev);
      if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
        this._addToQueue(args);
        return this;
      }
      const packet = {
        type: PacketType.EVENT,
        data: args
      };
      packet.options = {};
      packet.options.compress = this.flags.compress !== false;
      if ("function" === typeof args[args.length - 1]) {
        const id = this.ids++;
        const ack = args.pop();
        this._registerAckCallback(id, ack);
        packet.id = id;
      }
      const isTransportWritable = (_b = (_a = this.io.engine) === null || _a === void 0 ? void 0 : _a.transport) === null || _b === void 0 ? void 0 : _b.writable;
      const isConnected = this.connected && !((_c = this.io.engine) === null || _c === void 0 ? void 0 : _c._hasPingExpired());
      const discardPacket = this.flags.volatile && !isTransportWritable;
      if (discardPacket) {
      } else if (isConnected) {
        this.notifyOutgoingListeners(packet);
        this.packet(packet);
      } else {
        this.sendBuffer.push(packet);
      }
      this.flags = {};
      return this;
    }
    /**
     * @private
     */
    _registerAckCallback(id, ack) {
      var _a;
      const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
      if (timeout === void 0) {
        this.acks[id] = ack;
        return;
      }
      const timer = this.io.setTimeoutFn(() => {
        delete this.acks[id];
        for (let i = 0; i < this.sendBuffer.length; i++) {
          if (this.sendBuffer[i].id === id) {
            this.sendBuffer.splice(i, 1);
          }
        }
        ack.call(this, new Error("operation has timed out"));
      }, timeout);
      const fn = (...args) => {
        this.io.clearTimeoutFn(timer);
        ack.apply(this, args);
      };
      fn.withError = true;
      this.acks[id] = fn;
    }
    /**
     * Emits an event and waits for an acknowledgement
     *
     * @example
     * // without timeout
     * const response = await socket.emitWithAck("hello", "world");
     *
     * // with a specific timeout
     * try {
     *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
     * } catch (err) {
     *   // the server did not acknowledge the event in the given delay
     * }
     *
     * @return a Promise that will be fulfilled when the server acknowledges the event
     */
    emitWithAck(ev, ...args) {
      return new Promise((resolve, reject) => {
        const fn = (arg1, arg2) => {
          return arg1 ? reject(arg1) : resolve(arg2);
        };
        fn.withError = true;
        args.push(fn);
        this.emit(ev, ...args);
      });
    }
    /**
     * Add the packet to the queue.
     * @param args
     * @private
     */
    _addToQueue(args) {
      let ack;
      if (typeof args[args.length - 1] === "function") {
        ack = args.pop();
      }
      const packet = {
        id: this._queueSeq++,
        tryCount: 0,
        pending: false,
        args,
        flags: Object.assign({ fromQueue: true }, this.flags)
      };
      args.push((err, ...responseArgs) => {
        if (packet !== this._queue[0]) {
          return;
        }
        const hasError = err !== null;
        if (hasError) {
          if (packet.tryCount > this._opts.retries) {
            this._queue.shift();
            if (ack) {
              ack(err);
            }
          }
        } else {
          this._queue.shift();
          if (ack) {
            ack(null, ...responseArgs);
          }
        }
        packet.pending = false;
        return this._drainQueue();
      });
      this._queue.push(packet);
      this._drainQueue();
    }
    /**
     * Send the first packet of the queue, and wait for an acknowledgement from the server.
     * @param force - whether to resend a packet that has not been acknowledged yet
     *
     * @private
     */
    _drainQueue(force = false) {
      if (!this.connected || this._queue.length === 0) {
        return;
      }
      const packet = this._queue[0];
      if (packet.pending && !force) {
        return;
      }
      packet.pending = true;
      packet.tryCount++;
      this.flags = packet.flags;
      this.emit.apply(this, packet.args);
    }
    /**
     * Sends a packet.
     *
     * @param packet
     * @private
     */
    packet(packet) {
      packet.nsp = this.nsp;
      this.io._packet(packet);
    }
    /**
     * Called upon engine `open`.
     *
     * @private
     */
    onopen() {
      if (typeof this.auth == "function") {
        this.auth((data) => {
          this._sendConnectPacket(data);
        });
      } else {
        this._sendConnectPacket(this.auth);
      }
    }
    /**
     * Sends a CONNECT packet to initiate the Socket.IO session.
     *
     * @param data
     * @private
     */
    _sendConnectPacket(data) {
      this.packet({
        type: PacketType.CONNECT,
        data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data) : data
      });
    }
    /**
     * Called upon engine or manager `error`.
     *
     * @param err
     * @private
     */
    onerror(err) {
      if (!this.connected) {
        this.emitReserved("connect_error", err);
      }
    }
    /**
     * Called upon engine `close`.
     *
     * @param reason
     * @param description
     * @private
     */
    onclose(reason, description) {
      this.connected = false;
      delete this.id;
      this.emitReserved("disconnect", reason, description);
      this._clearAcks();
    }
    /**
     * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
     * the server.
     *
     * @private
     */
    _clearAcks() {
      Object.keys(this.acks).forEach((id) => {
        const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
        if (!isBuffered) {
          const ack = this.acks[id];
          delete this.acks[id];
          if (ack.withError) {
            ack.call(this, new Error("socket has been disconnected"));
          }
        }
      });
    }
    /**
     * Called with socket packet.
     *
     * @param packet
     * @private
     */
    onpacket(packet) {
      const sameNamespace = packet.nsp === this.nsp;
      if (!sameNamespace)
        return;
      switch (packet.type) {
        case PacketType.CONNECT:
          if (packet.data && packet.data.sid) {
            this.onconnect(packet.data.sid, packet.data.pid);
          } else {
            this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          }
          break;
        case PacketType.EVENT:
        case PacketType.BINARY_EVENT:
          this.onevent(packet);
          break;
        case PacketType.ACK:
        case PacketType.BINARY_ACK:
          this.onack(packet);
          break;
        case PacketType.DISCONNECT:
          this.ondisconnect();
          break;
        case PacketType.CONNECT_ERROR:
          this.destroy();
          const err = new Error(packet.data.message);
          err.data = packet.data.data;
          this.emitReserved("connect_error", err);
          break;
      }
    }
    /**
     * Called upon a server event.
     *
     * @param packet
     * @private
     */
    onevent(packet) {
      const args = packet.data || [];
      if (null != packet.id) {
        args.push(this.ack(packet.id));
      }
      if (this.connected) {
        this.emitEvent(args);
      } else {
        this.receiveBuffer.push(Object.freeze(args));
      }
    }
    emitEvent(args) {
      if (this._anyListeners && this._anyListeners.length) {
        const listeners = this._anyListeners.slice();
        for (const listener of listeners) {
          listener.apply(this, args);
        }
      }
      super.emit.apply(this, args);
      if (this._pid && args.length && typeof args[args.length - 1] === "string") {
        this._lastOffset = args[args.length - 1];
      }
    }
    /**
     * Produces an ack callback to emit with an event.
     *
     * @private
     */
    ack(id) {
      const self2 = this;
      let sent = false;
      return function(...args) {
        if (sent)
          return;
        sent = true;
        self2.packet({
          type: PacketType.ACK,
          id,
          data: args
        });
      };
    }
    /**
     * Called upon a server acknowledgement.
     *
     * @param packet
     * @private
     */
    onack(packet) {
      const ack = this.acks[packet.id];
      if (typeof ack !== "function") {
        return;
      }
      delete this.acks[packet.id];
      if (ack.withError) {
        packet.data.unshift(null);
      }
      ack.apply(this, packet.data);
    }
    /**
     * Called upon server connect.
     *
     * @private
     */
    onconnect(id, pid) {
      this.id = id;
      this.recovered = pid && this._pid === pid;
      this._pid = pid;
      this.connected = true;
      this.emitBuffered();
      this.emitReserved("connect");
      this._drainQueue(true);
    }
    /**
     * Emit buffered events (received and emitted).
     *
     * @private
     */
    emitBuffered() {
      this.receiveBuffer.forEach((args) => this.emitEvent(args));
      this.receiveBuffer = [];
      this.sendBuffer.forEach((packet) => {
        this.notifyOutgoingListeners(packet);
        this.packet(packet);
      });
      this.sendBuffer = [];
    }
    /**
     * Called upon server disconnect.
     *
     * @private
     */
    ondisconnect() {
      this.destroy();
      this.onclose("io server disconnect");
    }
    /**
     * Called upon forced client/server side disconnections,
     * this method ensures the manager stops tracking us and
     * that reconnections don't get triggered for this.
     *
     * @private
     */
    destroy() {
      if (this.subs) {
        this.subs.forEach((subDestroy) => subDestroy());
        this.subs = void 0;
      }
      this.io["_destroy"](this);
    }
    /**
     * Disconnects the socket manually. In that case, the socket will not try to reconnect.
     *
     * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
     *
     * @example
     * const socket = io();
     *
     * socket.on("disconnect", (reason) => {
     *   // console.log(reason); prints "io client disconnect"
     * });
     *
     * socket.disconnect();
     *
     * @return self
     */
    disconnect() {
      if (this.connected) {
        this.packet({ type: PacketType.DISCONNECT });
      }
      this.destroy();
      if (this.connected) {
        this.onclose("io client disconnect");
      }
      return this;
    }
    /**
     * Alias for {@link disconnect()}.
     *
     * @return self
     */
    close() {
      return this.disconnect();
    }
    /**
     * Sets the compress flag.
     *
     * @example
     * socket.compress(false).emit("hello");
     *
     * @param compress - if `true`, compresses the sending data
     * @return self
     */
    compress(compress) {
      this.flags.compress = compress;
      return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
     * ready to send messages.
     *
     * @example
     * socket.volatile.emit("hello"); // the server may or may not receive it
     *
     * @returns self
     */
    get volatile() {
      this.flags.volatile = true;
      return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
     * given number of milliseconds have elapsed without an acknowledgement from the server:
     *
     * @example
     * socket.timeout(5000).emit("my-event", (err) => {
     *   if (err) {
     *     // the server did not acknowledge the event in the given delay
     *   }
     * });
     *
     * @returns self
     */
    timeout(timeout) {
      this.flags.timeout = timeout;
      return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * @example
     * socket.onAny((event, ...args) => {
     *   console.log(`got ${event}`);
     * });
     *
     * @param listener
     */
    onAny(listener) {
      this._anyListeners = this._anyListeners || [];
      this._anyListeners.push(listener);
      return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * @example
     * socket.prependAny((event, ...args) => {
     *   console.log(`got event ${event}`);
     * });
     *
     * @param listener
     */
    prependAny(listener) {
      this._anyListeners = this._anyListeners || [];
      this._anyListeners.unshift(listener);
      return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`got event ${event}`);
     * }
     *
     * socket.onAny(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAny(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAny();
     *
     * @param listener
     */
    offAny(listener) {
      if (!this._anyListeners) {
        return this;
      }
      if (listener) {
        const listeners = this._anyListeners;
        for (let i = 0; i < listeners.length; i++) {
          if (listener === listeners[i]) {
            listeners.splice(i, 1);
            return this;
          }
        }
      } else {
        this._anyListeners = [];
      }
      return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */
    listenersAny() {
      return this._anyListeners || [];
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.onAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */
    onAnyOutgoing(listener) {
      this._anyOutgoingListeners = this._anyOutgoingListeners || [];
      this._anyOutgoingListeners.push(listener);
      return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.prependAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */
    prependAnyOutgoing(listener) {
      this._anyOutgoingListeners = this._anyOutgoingListeners || [];
      this._anyOutgoingListeners.unshift(listener);
      return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`sent event ${event}`);
     * }
     *
     * socket.onAnyOutgoing(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAnyOutgoing(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAnyOutgoing();
     *
     * @param [listener] - the catch-all listener (optional)
     */
    offAnyOutgoing(listener) {
      if (!this._anyOutgoingListeners) {
        return this;
      }
      if (listener) {
        const listeners = this._anyOutgoingListeners;
        for (let i = 0; i < listeners.length; i++) {
          if (listener === listeners[i]) {
            listeners.splice(i, 1);
            return this;
          }
        }
      } else {
        this._anyOutgoingListeners = [];
      }
      return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */
    listenersAnyOutgoing() {
      return this._anyOutgoingListeners || [];
    }
    /**
     * Notify the listeners for each packet sent
     *
     * @param packet
     *
     * @private
     */
    notifyOutgoingListeners(packet) {
      if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
        const listeners = this._anyOutgoingListeners.slice();
        for (const listener of listeners) {
          listener.apply(this, packet.data);
        }
      }
    }
  };

  // node_modules/socket.io-client/build/esm/contrib/backo2.js
  function Backoff(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 1e4;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
  }
  Backoff.prototype.duration = function() {
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
      var rand = Math.random();
      var deviation = Math.floor(rand * this.jitter * ms);
      ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
  };
  Backoff.prototype.reset = function() {
    this.attempts = 0;
  };
  Backoff.prototype.setMin = function(min) {
    this.ms = min;
  };
  Backoff.prototype.setMax = function(max) {
    this.max = max;
  };
  Backoff.prototype.setJitter = function(jitter) {
    this.jitter = jitter;
  };

  // node_modules/socket.io-client/build/esm/manager.js
  var Manager = class extends Emitter {
    constructor(uri, opts) {
      var _a;
      super();
      this.nsps = {};
      this.subs = [];
      if (uri && "object" === typeof uri) {
        opts = uri;
        uri = void 0;
      }
      opts = opts || {};
      opts.path = opts.path || "/socket.io";
      this.opts = opts;
      installTimerFunctions(this, opts);
      this.reconnection(opts.reconnection !== false);
      this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
      this.reconnectionDelay(opts.reconnectionDelay || 1e3);
      this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
      this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
      this.backoff = new Backoff({
        min: this.reconnectionDelay(),
        max: this.reconnectionDelayMax(),
        jitter: this.randomizationFactor()
      });
      this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
      this._readyState = "closed";
      this.uri = uri;
      const _parser = opts.parser || esm_exports;
      this.encoder = new _parser.Encoder();
      this.decoder = new _parser.Decoder();
      this._autoConnect = opts.autoConnect !== false;
      if (this._autoConnect)
        this.open();
    }
    reconnection(v) {
      if (!arguments.length)
        return this._reconnection;
      this._reconnection = !!v;
      if (!v) {
        this.skipReconnect = true;
      }
      return this;
    }
    reconnectionAttempts(v) {
      if (v === void 0)
        return this._reconnectionAttempts;
      this._reconnectionAttempts = v;
      return this;
    }
    reconnectionDelay(v) {
      var _a;
      if (v === void 0)
        return this._reconnectionDelay;
      this._reconnectionDelay = v;
      (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
      return this;
    }
    randomizationFactor(v) {
      var _a;
      if (v === void 0)
        return this._randomizationFactor;
      this._randomizationFactor = v;
      (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
      return this;
    }
    reconnectionDelayMax(v) {
      var _a;
      if (v === void 0)
        return this._reconnectionDelayMax;
      this._reconnectionDelayMax = v;
      (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
      return this;
    }
    timeout(v) {
      if (!arguments.length)
        return this._timeout;
      this._timeout = v;
      return this;
    }
    /**
     * Starts trying to reconnect if reconnection is enabled and we have not
     * started reconnecting yet
     *
     * @private
     */
    maybeReconnectOnOpen() {
      if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) {
        this.reconnect();
      }
    }
    /**
     * Sets the current transport `socket`.
     *
     * @param {Function} fn - optional, callback
     * @return self
     * @public
     */
    open(fn) {
      if (~this._readyState.indexOf("open"))
        return this;
      this.engine = new Socket(this.uri, this.opts);
      const socket2 = this.engine;
      const self2 = this;
      this._readyState = "opening";
      this.skipReconnect = false;
      const openSubDestroy = on(socket2, "open", function() {
        self2.onopen();
        fn && fn();
      });
      const onError = (err) => {
        this.cleanup();
        this._readyState = "closed";
        this.emitReserved("error", err);
        if (fn) {
          fn(err);
        } else {
          this.maybeReconnectOnOpen();
        }
      };
      const errorSub = on(socket2, "error", onError);
      if (false !== this._timeout) {
        const timeout = this._timeout;
        const timer = this.setTimeoutFn(() => {
          openSubDestroy();
          onError(new Error("timeout"));
          socket2.close();
        }, timeout);
        if (this.opts.autoUnref) {
          timer.unref();
        }
        this.subs.push(() => {
          this.clearTimeoutFn(timer);
        });
      }
      this.subs.push(openSubDestroy);
      this.subs.push(errorSub);
      return this;
    }
    /**
     * Alias for open()
     *
     * @return self
     * @public
     */
    connect(fn) {
      return this.open(fn);
    }
    /**
     * Called upon transport open.
     *
     * @private
     */
    onopen() {
      this.cleanup();
      this._readyState = "open";
      this.emitReserved("open");
      const socket2 = this.engine;
      this.subs.push(
        on(socket2, "ping", this.onping.bind(this)),
        on(socket2, "data", this.ondata.bind(this)),
        on(socket2, "error", this.onerror.bind(this)),
        on(socket2, "close", this.onclose.bind(this)),
        // @ts-ignore
        on(this.decoder, "decoded", this.ondecoded.bind(this))
      );
    }
    /**
     * Called upon a ping.
     *
     * @private
     */
    onping() {
      this.emitReserved("ping");
    }
    /**
     * Called with data.
     *
     * @private
     */
    ondata(data) {
      try {
        this.decoder.add(data);
      } catch (e) {
        this.onclose("parse error", e);
      }
    }
    /**
     * Called when parser fully decodes a packet.
     *
     * @private
     */
    ondecoded(packet) {
      nextTick(() => {
        this.emitReserved("packet", packet);
      }, this.setTimeoutFn);
    }
    /**
     * Called upon socket error.
     *
     * @private
     */
    onerror(err) {
      this.emitReserved("error", err);
    }
    /**
     * Creates a new socket for the given `nsp`.
     *
     * @return {Socket}
     * @public
     */
    socket(nsp, opts) {
      let socket2 = this.nsps[nsp];
      if (!socket2) {
        socket2 = new Socket2(this, nsp, opts);
        this.nsps[nsp] = socket2;
      } else if (this._autoConnect && !socket2.active) {
        socket2.connect();
      }
      return socket2;
    }
    /**
     * Called upon a socket close.
     *
     * @param socket
     * @private
     */
    _destroy(socket2) {
      const nsps = Object.keys(this.nsps);
      for (const nsp of nsps) {
        const socket3 = this.nsps[nsp];
        if (socket3.active) {
          return;
        }
      }
      this._close();
    }
    /**
     * Writes a packet.
     *
     * @param packet
     * @private
     */
    _packet(packet) {
      const encodedPackets = this.encoder.encode(packet);
      for (let i = 0; i < encodedPackets.length; i++) {
        this.engine.write(encodedPackets[i], packet.options);
      }
    }
    /**
     * Clean up transport subscriptions and packet buffer.
     *
     * @private
     */
    cleanup() {
      this.subs.forEach((subDestroy) => subDestroy());
      this.subs.length = 0;
      this.decoder.destroy();
    }
    /**
     * Close the current socket.
     *
     * @private
     */
    _close() {
      this.skipReconnect = true;
      this._reconnecting = false;
      this.onclose("forced close");
    }
    /**
     * Alias for close()
     *
     * @private
     */
    disconnect() {
      return this._close();
    }
    /**
     * Called when:
     *
     * - the low-level engine is closed
     * - the parser encountered a badly formatted packet
     * - all sockets are disconnected
     *
     * @private
     */
    onclose(reason, description) {
      var _a;
      this.cleanup();
      (_a = this.engine) === null || _a === void 0 ? void 0 : _a.close();
      this.backoff.reset();
      this._readyState = "closed";
      this.emitReserved("close", reason, description);
      if (this._reconnection && !this.skipReconnect) {
        this.reconnect();
      }
    }
    /**
     * Attempt a reconnection.
     *
     * @private
     */
    reconnect() {
      if (this._reconnecting || this.skipReconnect)
        return this;
      const self2 = this;
      if (this.backoff.attempts >= this._reconnectionAttempts) {
        this.backoff.reset();
        this.emitReserved("reconnect_failed");
        this._reconnecting = false;
      } else {
        const delay = this.backoff.duration();
        this._reconnecting = true;
        const timer = this.setTimeoutFn(() => {
          if (self2.skipReconnect)
            return;
          this.emitReserved("reconnect_attempt", self2.backoff.attempts);
          if (self2.skipReconnect)
            return;
          self2.open((err) => {
            if (err) {
              self2._reconnecting = false;
              self2.reconnect();
              this.emitReserved("reconnect_error", err);
            } else {
              self2.onreconnect();
            }
          });
        }, delay);
        if (this.opts.autoUnref) {
          timer.unref();
        }
        this.subs.push(() => {
          this.clearTimeoutFn(timer);
        });
      }
    }
    /**
     * Called upon successful reconnect.
     *
     * @private
     */
    onreconnect() {
      const attempt = this.backoff.attempts;
      this._reconnecting = false;
      this.backoff.reset();
      this.emitReserved("reconnect", attempt);
    }
  };

  // node_modules/socket.io-client/build/esm/index.js
  var cache = {};
  function lookup2(uri, opts) {
    if (typeof uri === "object") {
      opts = uri;
      uri = void 0;
    }
    opts = opts || {};
    const parsed = url(uri, opts.path || "/socket.io");
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
    let io;
    if (newConnection) {
      io = new Manager(source, opts);
    } else {
      if (!cache[id]) {
        cache[id] = new Manager(source, opts);
      }
      io = cache[id];
    }
    if (parsed.query && !opts.query) {
      opts.query = parsed.queryKey;
    }
    return io.socket(parsed.path, opts);
  }
  Object.assign(lookup2, {
    Manager,
    Socket: Socket2,
    io: lookup2,
    connect: lookup2
  });

  // src/Game/canvasmanager.ts
  var CanvasManager = class {
    // Whether to flip the board for black player
    constructor(canvasId) {
      this.squareSize = 80;
      this.pieceImages = /* @__PURE__ */ new Map();
      this.imagesLoaded = false;
      this.isFlipped = false;
      // Store reference to last drawn board state for redraws
      this.lastBoard = null;
      this.lastSelectPiece = null;
      this.lastPlayerColor = null;
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        throw new Error(`Canvas with id '${canvasId}' not found.`);
      }
      this.ctx = this.canvas.getContext("2d");
      if (!this.ctx) {
        throw new Error("Could not get 2D context from canvas.");
      }
      this.setupResponsiveCanvas();
      window.addEventListener("resize", () => {
        this.setupResponsiveCanvas();
        if (this.imagesLoaded) {
          this.redrawCanvas();
        }
      });
      this.loadImages();
    }
    async loadImages() {
      this.boardImage = new Image();
      this.boardImage.src = "./rect-8x8.png";
      this.selectorImage = new Image();
      this.selectorImage.src = "./selector_square.png";
      const pieceTypes = ["pawn", "rook", "knight", "bishop", "queen", "king"];
      const colors = ["white", "black"];
      const imagePromises = [];
      imagePromises.push(new Promise((resolve) => {
        this.boardImage.onload = () => resolve();
      }));
      imagePromises.push(new Promise((resolve) => {
        this.selectorImage.onload = () => resolve();
      }));
      for (const color of colors) {
        for (const piece of pieceTypes) {
          const imageName = `${color}-${piece}.png`;
          const image = new Image();
          image.src = `./${imageName}`;
          this.pieceImages.set(imageName, image);
          imagePromises.push(new Promise((resolve) => {
            image.onload = () => resolve();
          }));
        }
      }
      await Promise.all(imagePromises);
      this.imagesLoaded = true;
      console.log("All images loaded successfully");
    }
    drawBoard(board, selectPiece, playerColor = null, lastMoveFrom = null, lastMoveTo = null, inCheckSquare = null) {
      if (!this.imagesLoaded) {
        console.warn("Images not loaded yet, retrying in 100ms...");
        setTimeout(() => this.drawBoard(board, selectPiece, playerColor), 100);
        return;
      }
      this.lastBoard = board;
      this.lastSelectPiece = selectPiece;
      this.lastPlayerColor = playerColor;
      this.isFlipped = playerColor === "black";
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.boardImage, 0, 0, this.canvas.width, this.canvas.height);
      if (lastMoveFrom && lastMoveTo) {
        this.highlightSquare(lastMoveFrom.x, lastMoveFrom.y, "rgba(255,215,0,0.35)");
        this.highlightSquare(lastMoveTo.x, lastMoveTo.y, "rgba(50,205,50,0.45)");
      }
      if (inCheckSquare) {
        this.highlightSquare(inCheckSquare.x, inCheckSquare.y, "rgba(255,0,0,0.5)");
      }
      if (selectPiece) {
        this.drawValidMoves(board, selectPiece);
      }
      this.drawPieces(board, selectPiece);
    }
    drawValidMoves(board, selectPiece) {
      const currentPos = board.getPiecePosition(selectPiece);
      if (!currentPos) {
        return;
      }
      const validMoves = selectPiece.getValidMoves(currentPos, board);
      for (const move of validMoves) {
        if (move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8) {
          const { canvasX, canvasY } = this.boardToCanvas(move.x, move.y);
          this.ctx.drawImage(this.selectorImage, canvasX, canvasY, this.squareSize, this.squareSize);
        }
      }
    }
    drawPieces(board, selectPiece = null) {
      const squares = board.getSquares();
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board.getPieceAt(row, col);
          if (piece) {
            const isSelected = selectPiece !== null && piece.id === selectPiece.id;
            this.drawPiece(piece, row, col, isSelected);
          }
        }
      }
    }
    drawPiece(piece, row, col, isSelected = false) {
      const imageName = piece.getPiecePNG();
      const image = this.pieceImages.get(imageName);
      if (image) {
        const { canvasX, canvasY } = this.boardToCanvas(row, col);
        this.ctx.drawImage(image, canvasX, canvasY, this.squareSize, this.squareSize);
        if (isSelected) {
          this.ctx.strokeStyle = "yellow";
          this.ctx.lineWidth = 4;
          this.ctx.strokeRect(canvasX + 2, canvasY + 2, this.squareSize - 4, this.squareSize - 4);
        }
      } else {
        console.warn(`Image not found for piece: ${imageName}`);
      }
    }
    // Helper method to convert board coordinates to canvas coordinates
    boardToCanvas(row, col) {
      if (this.isFlipped) {
        const flippedRow = 7 - row;
        const flippedCol = 7 - col;
        return {
          canvasX: flippedCol * this.squareSize,
          canvasY: flippedRow * this.squareSize
        };
      } else {
        return {
          canvasX: col * this.squareSize,
          canvasY: row * this.squareSize
        };
      }
    }
    // Helper method to convert canvas coordinates to board coordinates
    canvasToBoard(canvasX, canvasY) {
      const col = Math.floor(canvasX / this.squareSize);
      const row = Math.floor(canvasY / this.squareSize);
      if (this.isFlipped) {
        return {
          row: 7 - row,
          col: 7 - col
        };
      } else {
        return { row, col };
      }
    }
    getSquareFromPixel(x, y) {
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = x - rect.left;
      const canvasY = y - rect.top;
      const { row, col } = this.canvasToBoard(canvasX, canvasY);
      if (row >= 0 && row < 8 && col >= 0 && col < 8) {
        return { row, col };
      }
      return null;
    }
    addClickListener(callback) {
      this.canvas.addEventListener("click", (event) => {
        const square = this.getSquareFromPixel(event.clientX, event.clientY);
        if (square) {
          callback(square.row, square.col);
        }
      });
    }
    highlightSquare(row, col, color = "rgba(255, 255, 0, 0.5)") {
      const { canvasX, canvasY } = this.boardToCanvas(row, col);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(canvasX, canvasY, this.squareSize, this.squareSize);
    }
    isImagesLoaded() {
      return this.imagesLoaded;
    }
    setupResponsiveCanvas() {
      const container = this.canvas.parentElement;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const containerStyle = window.getComputedStyle(container);
      const paddingLeft = parseFloat(containerStyle.paddingLeft);
      const paddingRight = parseFloat(containerStyle.paddingRight);
      const paddingTop = parseFloat(containerStyle.paddingTop);
      const paddingBottom = parseFloat(containerStyle.paddingBottom);
      const availableWidth = containerRect.width - paddingLeft - paddingRight;
      const availableHeight = containerRect.height - paddingTop - paddingBottom;
      const usableSize = Math.min(availableWidth, availableHeight) * 0.95;
      const maxSize = Math.min(usableSize, 800);
      const minSize = 320;
      const boardSize = Math.max(minSize, maxSize);
      this.squareSize = Math.floor(boardSize / 8);
      const actualBoardSize = this.squareSize * 8;
      this.canvas.width = actualBoardSize;
      this.canvas.height = actualBoardSize;
      this.canvas.style.width = actualBoardSize + "px";
      this.canvas.style.height = actualBoardSize + "px";
      console.log(`Canvas resized to: ${actualBoardSize}x${actualBoardSize}, square size: ${this.squareSize}`);
    }
    redrawCanvas() {
      this.redrawWithLastState();
    }
    // Method to trigger a complete redraw with last known state
    redrawWithLastState() {
      if (this.lastBoard) {
        this.drawBoard(this.lastBoard, this.lastSelectPiece, this.lastPlayerColor);
      }
    }
  };

  // src/Game/piece.ts
  init_pieces();
  var BoardCords = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    equals(other) {
      return this.x === other.x && this.y === other.y;
    }
  };
  var _Piece = class _Piece {
    constructor(type, color, id = -1) {
      this.hasMoved = false;
      this.type = type;
      if (color !== "white" && color !== "black") {
        throw new Error("Invalid color. Must be 'white' or 'black'.");
      }
      this.color = color;
      if (id >= 0) {
        this.id = id;
      } else {
        this.id = _Piece.pieceCount++;
      }
    }
    getValue() {
      switch (this.type) {
        case 1 /* PAWN */:
          return 1;
        case 2 /* ROOK */:
          return 5;
        case 3 /* KNIGHT */:
          return 3;
        case 4 /* BISHOP */:
          return 3;
        case 5 /* QUEEN */:
          return 9;
        case 6 /* KING */:
          return 0;
        // King is invaluable in terms of game rules
        default:
          return 0;
      }
    }
    getPiecePNG() {
      var pieceName = "";
      switch (this.type) {
        case 1 /* PAWN */:
          pieceName = "pawn";
          break;
        case 2 /* ROOK */:
          pieceName = "rook";
          break;
        case 3 /* KNIGHT */:
          pieceName = "knight";
          break;
        case 4 /* BISHOP */:
          pieceName = "bishop";
          break;
        case 5 /* QUEEN */:
          pieceName = "queen";
          break;
        case 6 /* KING */:
          pieceName = "king";
          break;
        default:
          throw new Error("Invalid piece type.");
      }
      return `${this.color}-${pieceName}.png`;
    }
    getType() {
      return this.type;
    }
    getColor() {
      return this.color;
    }
    getHasMoved() {
      return this.hasMoved;
    }
    setHasMoved(moved) {
      this.hasMoved = moved;
    }
    getValidMoves(currentPos, board) {
      if (!board) {
        return this.getBasicMovementPattern(currentPos);
      }
      let validMoves = [];
      switch (this.type) {
        case 1 /* PAWN */:
          validMoves = this.getPawnMoves(currentPos, board);
          break;
        case 2 /* ROOK */:
          validMoves = this.getRookMoves(currentPos, board);
          break;
        case 3 /* KNIGHT */:
          validMoves = this.getKnightMoves(currentPos, board);
          break;
        case 4 /* BISHOP */:
          validMoves = this.getBishopMoves(currentPos, board);
          break;
        case 5 /* QUEEN */:
          validMoves = this.getQueenMoves(currentPos, board);
          break;
        case 6 /* KING */:
          validMoves = this.getKingMoves(currentPos, board);
          break;
        default:
          throw new Error("Invalid piece type.");
      }
      validMoves = this.filterMovesInCheck(currentPos, validMoves, board);
      return validMoves;
    }
    getPawnMoves(currentPos, board) {
      const validMoves = [];
      const direction = this.color === "white" ? -1 : 1;
      const oneForward = new BoardCords(currentPos.x + direction, currentPos.y);
      if (this.isInBounds(oneForward) && !board.getPieceAt(oneForward.x, oneForward.y)) {
        validMoves.push(oneForward);
        if (!this.hasMoved) {
          const twoForward = new BoardCords(currentPos.x + 2 * direction, currentPos.y);
          if (this.isInBounds(twoForward) && !board.getPieceAt(twoForward.x, twoForward.y)) {
            validMoves.push(twoForward);
          }
        }
      }
      const captureLeft = new BoardCords(currentPos.x + direction, currentPos.y - 1);
      const captureRight = new BoardCords(currentPos.x + direction, currentPos.y + 1);
      if (this.isInBounds(captureLeft)) {
        const pieceLeft = board.getPieceAt(captureLeft.x, captureLeft.y);
        if (pieceLeft && pieceLeft.getColor() !== this.color) {
          validMoves.push(captureLeft);
        }
      }
      if (this.isInBounds(captureRight)) {
        const pieceRight = board.getPieceAt(captureRight.x, captureRight.y);
        if (pieceRight && pieceRight.getColor() !== this.color) {
          validMoves.push(captureRight);
        }
      }
      return validMoves;
    }
    getRookMoves(currentPos, board) {
      const validMoves = [];
      const directions = [
        { x: 0, y: 1 },
        // Right
        { x: 0, y: -1 },
        // Left
        { x: 1, y: 0 },
        // Down
        { x: -1, y: 0 }
        // Up
      ];
      for (const dir of directions) {
        for (let i = 1; i < 8; i++) {
          const newPos = new BoardCords(currentPos.x + dir.x * i, currentPos.y + dir.y * i);
          if (!this.isInBounds(newPos)) break;
          const pieceAtPos = board.getPieceAt(newPos.x, newPos.y);
          if (!pieceAtPos) {
            validMoves.push(newPos);
          } else {
            if (pieceAtPos.getColor() !== this.color) {
              validMoves.push(newPos);
            }
            break;
          }
        }
      }
      return validMoves;
    }
    getKnightMoves(currentPos, board) {
      const validMoves = [];
      const knightMoves = [
        { x: 2, y: 1 },
        { x: 2, y: -1 },
        { x: -2, y: 1 },
        { x: -2, y: -1 },
        { x: 1, y: 2 },
        { x: 1, y: -2 },
        { x: -1, y: 2 },
        { x: -1, y: -2 }
      ];
      for (const move of knightMoves) {
        const newPos = new BoardCords(currentPos.x + move.x, currentPos.y + move.y);
        if (this.isInBounds(newPos)) {
          const pieceAtPos = board.getPieceAt(newPos.x, newPos.y);
          if (!pieceAtPos || pieceAtPos.getColor() !== this.color) {
            validMoves.push(newPos);
          }
        }
      }
      return validMoves;
    }
    getBishopMoves(currentPos, board) {
      const validMoves = [];
      const directions = [
        { x: 1, y: 1 },
        // Down-right
        { x: 1, y: -1 },
        // Down-left
        { x: -1, y: 1 },
        // Up-right
        { x: -1, y: -1 }
        // Up-left
      ];
      for (const dir of directions) {
        for (let i = 1; i < 8; i++) {
          const newPos = new BoardCords(currentPos.x + dir.x * i, currentPos.y + dir.y * i);
          if (!this.isInBounds(newPos)) break;
          const pieceAtPos = board.getPieceAt(newPos.x, newPos.y);
          if (!pieceAtPos) {
            validMoves.push(newPos);
          } else {
            if (pieceAtPos.getColor() !== this.color) {
              validMoves.push(newPos);
            }
            break;
          }
        }
      }
      return validMoves;
    }
    getQueenMoves(currentPos, board) {
      return [...this.getRookMoves(currentPos, board), ...this.getBishopMoves(currentPos, board)];
    }
    getKingMoves(currentPos, board) {
      const validMoves = [];
      const kingMoves = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 }
      ];
      for (const move of kingMoves) {
        const newPos = new BoardCords(currentPos.x + move.x, currentPos.y + move.y);
        if (this.isInBounds(newPos)) {
          const pieceAtPos = board.getPieceAt(newPos.x, newPos.y);
          if (!pieceAtPos || pieceAtPos.getColor() !== this.color) {
            validMoves.push(newPos);
          }
        }
      }
      if (!this.hasMoved) {
        const row = currentPos.x;
        const color = this.color;
        const squaresEmpty = (cols) => cols.every((c) => !board.getPieceAt(row, c));
        const squareSafe = (col) => !_Piece.isPositionUnderAttackStatic(new BoardCords(row, col), color, board);
        if (squareSafe(currentPos.y)) {
          const kingSideRook = board.getPieceAt(row, 7);
          if (kingSideRook && kingSideRook.getType() === 2 /* ROOK */ && !kingSideRook.getHasMoved()) {
            if (squaresEmpty([5, 6])) {
              if (squareSafe(5) && squareSafe(6)) {
                validMoves.push(new BoardCords(row, 6));
              }
            }
          }
          const queenSideRook = board.getPieceAt(row, 0);
          if (queenSideRook && queenSideRook.getType() === 2 /* ROOK */ && !queenSideRook.getHasMoved()) {
            if (squaresEmpty([1, 2, 3])) {
              if (squareSafe(3) && squareSafe(2)) {
                validMoves.push(new BoardCords(row, 2));
              }
            }
          }
        }
      }
      return validMoves;
    }
    isInBounds(pos) {
      return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
    }
    filterMovesInCheck(currentPos, moves, board) {
      const validMoves = [];
      for (const move of moves) {
        if (!this.wouldMoveExposeKingToCheck(currentPos, move, board)) {
          validMoves.push(move);
        }
      }
      return validMoves;
    }
    wouldMoveExposeKingToCheck(from, to, board) {
      const originalPiece = board.getPieceAt(to.x, to.y);
      const movingPiece = board.getPieceAt(from.x, from.y);
      board.squares[to.x][to.y] = movingPiece.id;
      board.squares[from.x][from.y] = 0;
      const kingPos = this.findKing(this.color, board);
      let kingInCheck = false;
      if (kingPos) {
        const checkPos = this.type === 6 /* KING */ ? to : kingPos;
        kingInCheck = this.isPositionUnderAttack(checkPos, this.color, board);
      }
      board.squares[from.x][from.y] = movingPiece.id;
      board.squares[to.x][to.y] = originalPiece ? originalPiece.id : 0;
      return kingInCheck;
    }
    findKing(color, board) {
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          const piece = board.getPieceAt(x, y);
          if (piece && piece.getType() === 6 /* KING */ && piece.getColor() === color) {
            return new BoardCords(x, y);
          }
        }
      }
      return null;
    }
    isPositionUnderAttack(pos, defendingColor, board) {
      const attackingColor = defendingColor === "white" ? "black" : "white";
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          const piece = board.getPieceAt(x, y);
          if (piece && piece.getColor() === attackingColor) {
            const attackingMoves = piece.getBasicMovementPattern(new BoardCords(x, y));
            if (piece.getType() === 1 /* PAWN */) {
              const direction = piece.getColor() === "white" ? -1 : 1;
              const leftAttack = new BoardCords(x + direction, y - 1);
              const rightAttack = new BoardCords(x + direction, y + 1);
              if ((leftAttack.equals(pos) || rightAttack.equals(pos)) && this.isInBounds(leftAttack) && this.isInBounds(rightAttack)) {
                return true;
              }
            } else {
              if (this.canPieceAttackPosition(piece, new BoardCords(x, y), pos, board)) {
                return true;
              }
            }
          }
        }
      }
      return false;
    }
    canPieceAttackPosition(piece, piecePos, targetPos, board) {
      const moves = piece.getBasicMovementPattern(piecePos);
      for (const move of moves) {
        if (move.equals(targetPos)) {
          if (piece.getType() === 2 /* ROOK */ || piece.getType() === 4 /* BISHOP */ || piece.getType() === 5 /* QUEEN */) {
            return this.isPathClear(piecePos, targetPos, board);
          }
          return true;
        }
      }
      return false;
    }
    isPathClear(from, to, board) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
      let currentX = from.x + stepX;
      let currentY = from.y + stepY;
      while (currentX !== to.x || currentY !== to.y) {
        if (board.getPieceAt(currentX, currentY)) {
          return false;
        }
        currentX += stepX;
        currentY += stepY;
      }
      return true;
    }
    // Keep the original function for backward compatibility
    getBasicMovementPattern(currentPos) {
      let validMoves = [];
      switch (this.type) {
        case 1 /* PAWN */:
          const direction = this.color === "white" ? -1 : 1;
          validMoves.push(new BoardCords(currentPos.x + direction, currentPos.y));
          if (!this.hasMoved) {
            validMoves.push(new BoardCords(currentPos.x + 2 * direction, currentPos.y));
          }
          validMoves.push(new BoardCords(currentPos.x + direction, currentPos.y - 1));
          validMoves.push(new BoardCords(currentPos.x + direction, currentPos.y + 1));
          break;
        case 2 /* ROOK */:
          for (let i = 1; i < 8; i++) {
            validMoves.push(new BoardCords(currentPos.x, currentPos.y + i));
            validMoves.push(new BoardCords(currentPos.x, currentPos.y - i));
            validMoves.push(new BoardCords(currentPos.x + i, currentPos.y));
            validMoves.push(new BoardCords(currentPos.x - i, currentPos.y));
          }
          break;
        case 3 /* KNIGHT */:
          validMoves.push(new BoardCords(currentPos.x + 2, currentPos.y + 1));
          validMoves.push(new BoardCords(currentPos.x + 2, currentPos.y - 1));
          validMoves.push(new BoardCords(currentPos.x - 2, currentPos.y + 1));
          validMoves.push(new BoardCords(currentPos.x - 2, currentPos.y - 1));
          validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y + 2));
          validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y - 2));
          validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y + 2));
          validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y - 2));
          break;
        case 4 /* BISHOP */:
          for (let i = 1; i < 8; i++) {
            validMoves.push(new BoardCords(currentPos.x + i, currentPos.y + i));
            validMoves.push(new BoardCords(currentPos.x - i, currentPos.y + i));
            validMoves.push(new BoardCords(currentPos.x + i, currentPos.y - i));
            validMoves.push(new BoardCords(currentPos.x - i, currentPos.y - i));
          }
          break;
        case 5 /* QUEEN */:
          for (let i = 1; i < 8; i++) {
            validMoves.push(new BoardCords(currentPos.x, currentPos.y + i));
            validMoves.push(new BoardCords(currentPos.x, currentPos.y - i));
            validMoves.push(new BoardCords(currentPos.x + i, currentPos.y));
            validMoves.push(new BoardCords(currentPos.x - i, currentPos.y));
          }
          for (let i = 1; i < 8; i++) {
            validMoves.push(new BoardCords(currentPos.x + i, currentPos.y + i));
            validMoves.push(new BoardCords(currentPos.x - i, currentPos.y + i));
            validMoves.push(new BoardCords(currentPos.x + i, currentPos.y - i));
            validMoves.push(new BoardCords(currentPos.x - i, currentPos.y - i));
          }
          break;
        case 6 /* KING */:
          validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y));
          validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y));
          validMoves.push(new BoardCords(currentPos.x, currentPos.y + 1));
          validMoves.push(new BoardCords(currentPos.x, currentPos.y - 1));
          validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y + 1));
          validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y - 1));
          validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y - 1));
          validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y + 1));
          break;
        default:
          throw new Error("Invalid piece type.");
      }
      validMoves = validMoves.filter((move) => move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8);
      validMoves = validMoves.filter((move) => move.x !== currentPos.x || move.y !== currentPos.y);
      validMoves = validMoves.filter(
        (move, index, self2) => index === self2.findIndex((m) => m.x === move.x && m.y === move.y)
      );
      return validMoves;
    }
    // Static helper methods for checking game state
    static isPlayerInCheck(playerColor, board) {
      const kingPos = _Piece.findKingPosition(playerColor, board);
      if (!kingPos) return false;
      return _Piece.isPositionUnderAttackStatic(kingPos, playerColor, board);
    }
    static findKingPosition(color, board) {
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          const piece = board.getPieceAt(x, y);
          if (piece && piece.getType() === 6 /* KING */ && piece.getColor() === color) {
            return new BoardCords(x, y);
          }
        }
      }
      return null;
    }
    static isPositionUnderAttackStatic(pos, defendingColor, board) {
      const attackingColor = defendingColor === "white" ? "black" : "white";
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          const piece = board.getPieceAt(x, y);
          if (piece && piece.getColor() === attackingColor) {
            if (_Piece.canPieceAttackPositionStatic(piece, new BoardCords(x, y), pos, board)) {
              return true;
            }
          }
        }
      }
      return false;
    }
    static canPieceAttackPositionStatic(piece, piecePos, targetPos, board) {
      if (piece.getType() === 1 /* PAWN */) {
        const direction = piece.getColor() === "white" ? -1 : 1;
        const leftAttack = new BoardCords(piecePos.x + direction, piecePos.y - 1);
        const rightAttack = new BoardCords(piecePos.x + direction, piecePos.y + 1);
        return leftAttack.equals(targetPos) || rightAttack.equals(targetPos);
      }
      const moves = piece.getBasicMovementPattern(piecePos);
      for (const move of moves) {
        if (move.equals(targetPos)) {
          if (piece.getType() === 2 /* ROOK */ || piece.getType() === 4 /* BISHOP */ || piece.getType() === 5 /* QUEEN */) {
            return _Piece.isPathClearStatic(piecePos, targetPos, board);
          }
          return true;
        }
      }
      return false;
    }
    static isPathClearStatic(from, to, board) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
      let currentX = from.x + stepX;
      let currentY = from.y + stepY;
      while (currentX !== to.x || currentY !== to.y) {
        if (board.getPieceAt(currentX, currentY)) {
          return false;
        }
        currentX += stepX;
        currentY += stepY;
      }
      return true;
    }
  };
  _Piece.pieceCount = 1;
  var Piece = _Piece;

  // src/main.ts
  init_pieces();

  // src/Game/board.ts
  init_pieces();
  var Board = class _Board {
    constructor(fromJSON = false) {
      this.squares = [];
      this.pieces = [];
      if (fromJSON) {
        return;
      }
      this.initializeBoard();
    }
    initializeBoard() {
      for (let i = 0; i < 8; i++) {
        this.squares[i] = [];
        for (let j = 0; j < 8; j++) {
          this.squares[i][j] = 0;
        }
      }
      for (let j = 0; j < 8; j++) {
        var newPawn = new Piece(1 /* PAWN */, "white");
        this.addPiece(newPawn, 6, j);
        var newPawnBlack = new Piece(1 /* PAWN */, "black");
        this.addPiece(newPawnBlack, 1, j);
      }
      this.addPiece(new Piece(2 /* ROOK */, "white"), 7, 0);
      this.addPiece(new Piece(3 /* KNIGHT */, "white"), 7, 1);
      this.addPiece(new Piece(4 /* BISHOP */, "white"), 7, 2);
      this.addPiece(new Piece(5 /* QUEEN */, "white"), 7, 3);
      this.addPiece(new Piece(6 /* KING */, "white"), 7, 4);
      this.addPiece(new Piece(4 /* BISHOP */, "white"), 7, 5);
      this.addPiece(new Piece(3 /* KNIGHT */, "white"), 7, 6);
      this.addPiece(new Piece(2 /* ROOK */, "white"), 7, 7);
      this.addPiece(new Piece(2 /* ROOK */, "black"), 0, 0);
      this.addPiece(new Piece(3 /* KNIGHT */, "black"), 0, 1);
      this.addPiece(new Piece(4 /* BISHOP */, "black"), 0, 2);
      this.addPiece(new Piece(5 /* QUEEN */, "black"), 0, 3);
      this.addPiece(new Piece(6 /* KING */, "black"), 0, 4);
      this.addPiece(new Piece(4 /* BISHOP */, "black"), 0, 5);
      this.addPiece(new Piece(3 /* KNIGHT */, "black"), 0, 6);
      this.addPiece(new Piece(2 /* ROOK */, "black"), 0, 7);
    }
    getSquares() {
      return this.squares;
    }
    addPiece(piece, x, y) {
      if (x < 0 || x >= 8 || y < 0 || y >= 8) {
        throw new Error("Coordinates out of bounds.");
      }
      this.squares[x][y] = piece.id;
      this.pieces.push(piece);
    }
    getPieceAt(x, y) {
      const pieceId = this.squares[x][y];
      return pieceId ? this.pieces.find((piece) => piece.id === pieceId) || null : null;
    }
    attemptMovePiece(fromX, fromY, toX, toY) {
      const piece = this.getPieceAt(fromX, fromY);
      if (!piece) {
        throw new Error("No piece at the specified coordinates.");
      }
      if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
        throw new Error("Target coordinates out of bounds.");
      }
      if (this.squares[toX][toY] !== 0) {
        throw new Error("Target square is already occupied.");
      }
      this.squares[toX][toY] = piece.id;
      this.squares[fromX][fromY] = 0;
      return true;
    }
    static getBoardFromJSON(jsonData) {
      const board = new _Board(true);
      board.squares = jsonData.squares || [];
      board.pieces = (jsonData.pieces || []).map((pieceData) => {
        const p = new Piece(pieceData.type, pieceData.color, pieceData.id);
        if (pieceData.hasMoved) {
          p.setHasMoved(true);
        }
        return p;
      });
      return board;
    }
    getPiecePosition(piece) {
      const index = this.pieces.indexOf(piece);
      if (index === -1) {
        return null;
      }
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          if (this.squares[x][y] === piece.id) {
            return new BoardCords(x, y);
          }
        }
      }
      return null;
    }
    getPieceById(id) {
      return this.pieces.find((piece) => piece.id === id) || null;
    }
  };

  // src/Game/gamestate.ts
  var GameState = class {
    constructor(jsonData, playerID = "") {
      // "white" or "black"
      this.turnList = [];
      // Timer properties (time in milliseconds)
      this.whiteTimeRemaining = 20 * 60 * 1e3;
      // 20 minutes in milliseconds
      this.blackTimeRemaining = 20 * 60 * 1e3;
      // 20 minutes in milliseconds
      this.gameStarted = false;
      // Has the first move been made?
      this.lastMoveFrom = null;
      this.lastMoveTo = null;
      this.whiteInCheck = false;
      this.blackInCheck = false;
      const data = jsonData;
      this.whitePlayer = data.whitePlayer || null;
      this.blackPlayer = data.blackPlayer || null;
      this.currentTurn = data.currentTurn || "white";
      this.turnList = data.turnList || [];
      this.whiteTimeRemaining = data.whiteTimeRemaining || 20 * 60 * 1e3;
      this.blackTimeRemaining = data.blackTimeRemaining || 20 * 60 * 1e3;
      this.gameStarted = data.gameStarted || false;
      this.lastMoveFrom = data.lastMoveFrom || null;
      this.lastMoveTo = data.lastMoveTo || null;
      this.whiteInCheck = data.whiteInCheck || false;
      this.blackInCheck = data.blackInCheck || false;
      if (data.board === void 0) {
        console.log("Board is undefined, creating new board");
        this.board = new Board();
      } else {
        console.log("Loading board from JSON data");
        this.board = Board.getBoardFromJSON(data.board);
      }
    }
  };

  // src/Game/gamemanager.ts
  var GameManager = class {
    constructor() {
      // "white" or "black" null for spectators
      this.piece = null;
      // Currently selected piece, if any
      this.socket = null;
      // Socket connection, if needed
      // Score tracking
      this.capturedByPlayer = [];
      this.capturedByOpponent = [];
      this.playerID = "";
      this.playerColor = null;
      this.gameState = new GameState("{}");
    }
    setSocket(socket2) {
      console.log("Setting socket:", socket2);
      this.socket = socket2;
    }
    setPlayerID(playerID) {
      this.playerID = playerID;
    }
    loadGameState(jsonData) {
      const selectedPieceId = this.piece?.id || null;
      this.gameState = new GameState(jsonData, this.playerID);
      if (this.gameState.whitePlayer === this.playerID) {
        this.playerColor = "white";
      } else if (this.gameState.blackPlayer === this.playerID) {
        this.playerColor = "black";
      } else {
        this.playerColor = null;
      }
      if (selectedPieceId !== null) {
        const newSelectedPiece = this.gameState.board.getPieceById(selectedPieceId);
        this.piece = newSelectedPiece;
      }
    }
    attemptTakePiece(pieceToTake) {
      const selectedPiece = this.getSelectedPiece();
      if (!selectedPiece) {
        console.error("No piece selected to move.");
        return;
      }
      const takePos = this.getBoard().getPiecePosition(pieceToTake);
      const selectedPos = this.getBoard().getPiecePosition(selectedPiece);
      if (!takePos) {
        console.error("Piece to take not found on the board.");
        return;
      }
      if (!selectedPos) {
        console.error("Selected piece not found on the board.");
        return;
      }
      const validMoves = selectedPiece.getValidMoves(selectedPos, this.getBoard());
      validMoves.forEach((move) => {
        if (move.x === takePos.x && move.y === takePos.y) {
          if (this.socket) {
            this.socket.emit("takePiece", {
              piece: selectedPiece.id,
              target: pieceToTake.id,
              from: { x: selectedPos.x, y: selectedPos.y },
              to: { x: takePos.x, y: takePos.y },
              playerID: this.playerID
            });
          }
        }
      });
    }
    attemptMovePiece(x, y) {
      const selectedPiece = this.getSelectedPiece();
      if (!selectedPiece) {
        console.error("No piece selected to move.");
        return;
      }
      const selectedPos = this.getBoard().getPiecePosition(selectedPiece);
      if (!selectedPos) {
        console.error("Selected piece not found on the board.");
        return;
      }
      const validMoves = selectedPiece.getValidMoves(selectedPos, this.getBoard());
      console.log("Attempting to move to:", x, y);
      console.log("Valid moves:", validMoves);
      console.log("Selected piece position:", selectedPos);
      validMoves.forEach((move) => {
        if (move.x === x && move.y === y) {
          if (this.socket) {
            console.log("attempting move");
            this.socket.emit("movePiece", {
              piece: selectedPiece.id,
              from: { x: selectedPos.x, y: selectedPos.y },
              to: { x, y },
              playerID: this.playerID
            });
          } else {
            console.log("No socket connection available");
          }
        }
      });
    }
    getBoard() {
      return this.gameState.board;
    }
    getGameStateRaw() {
      return this.gameState;
    }
    getIsTurn() {
      if (this.playerColor === null) {
        return false;
      }
      if (this.playerColor === this.gameState.currentTurn) {
        return true;
      }
      return false;
    }
    getPlayerColor() {
      return this.playerColor;
    }
    selectPiece(piece) {
      this.piece = piece;
    }
    clearSelection() {
      this.piece = null;
    }
    getSelectedPiece() {
      return this.piece;
    }
    getPlayerTime() {
      if (this.playerColor === "white") {
        return this.gameState.whiteTimeRemaining;
      } else if (this.playerColor === "black") {
        return this.gameState.blackTimeRemaining;
      }
      return 0;
    }
    getOpponentTime() {
      if (this.playerColor === "white") {
        return this.gameState.blackTimeRemaining;
      } else if (this.playerColor === "black") {
        return this.gameState.whiteTimeRemaining;
      }
      return 0;
    }
    /**
     * Add a captured piece to the appropriate list
     * @param piece - The captured piece
     * @param capturedByPlayer - true if captured by player, false if captured by opponent
     */
    addCapturedPiece(piece, capturedByPlayer) {
      if (capturedByPlayer) {
        this.capturedByPlayer.push(piece);
      } else {
        this.capturedByOpponent.push(piece);
      }
    }
    /**
     * Calculate the current score for the player
     * Score = value of pieces captured by player - value of pieces captured by opponent
     */
    getPlayerScore() {
      const playerCaptureValue = this.capturedByPlayer.reduce((total, piece) => total + piece.getValue(), 0);
      const opponentCaptureValue = this.capturedByOpponent.reduce((total, piece) => total + piece.getValue(), 0);
      return playerCaptureValue - opponentCaptureValue;
    }
    /**
     * Calculate the current score for the opponent (negative of player score)
     */
    getOpponentScore() {
      return -this.getPlayerScore();
    }
    /**
     * Reset captured pieces (for new game)
     */
    resetCapturedPieces() {
      this.capturedByPlayer = [];
      this.capturedByOpponent = [];
    }
  };

  // src/UI/chess9000ui.ts
  var Chess9000UI = class _Chess9000UI {
    constructor() {
      this.dialogContainer = null;
      this.initializeDialogContainer();
    }
    /**
     * Show a dedicated promotion selection dialog returning chosen piece type string.
     */
    async promotionDialog(color) {
      return new Promise((resolve) => {
        this.initializeDialogContainer();
        const dialog = document.createElement("div");
        dialog.className = "pulldown-dialog";
        const backdrop = document.createElement("div");
        backdrop.className = "dialog-backdrop";
        const content = document.createElement("div");
        content.className = "dialog-content";
        const messageElement = document.createElement("div");
        messageElement.className = "dialog-message";
        messageElement.textContent = "Promote pawn to:";
        const buttons = document.createElement("div");
        buttons.className = "dialog-buttons promotion-buttons";
        const options = [
          { key: "queen", label: "Queen" },
          { key: "rook", label: "Rook" },
          { key: "bishop", label: "Bishop" },
          { key: "knight", label: "Knight" }
        ];
        const finish = (choice) => {
          this.hideDialog(dialog, () => resolve(choice));
        };
        options.forEach((opt) => {
          const btn = document.createElement("button");
          btn.className = "dialog-button good";
          btn.textContent = opt.label;
          btn.addEventListener("click", () => finish(opt.key));
          buttons.appendChild(btn);
        });
        backdrop.addEventListener("click", () => finish("queen"));
        content.appendChild(messageElement);
        content.appendChild(buttons);
        dialog.appendChild(backdrop);
        dialog.appendChild(content);
        if (this.dialogContainer) {
          this.dialogContainer.appendChild(dialog);
          this.showDialog(dialog);
        }
      });
    }
    static getInstance() {
      if (!_Chess9000UI.instance) {
        _Chess9000UI.instance = new _Chess9000UI();
      }
      return _Chess9000UI.instance;
    }
    /**
     * Initialize the dialog container if it doesn't exist
     */
    initializeDialogContainer() {
      if (!this.dialogContainer) {
        this.dialogContainer = document.createElement("div");
        this.dialogContainer.id = "chess9000-dialog-container";
        this.dialogContainer.className = "dialog-container";
        document.body.appendChild(this.dialogContainer);
      }
    }
    /**
     * Show a slide down dialog with a message and two response options
     * @param message - The message to display in the dialog
     * @param goodResponse - Text for the positive/good response button
     * @param badResponse - Text for the negative/bad response button
     * @returns Promise<boolean> - true if good response was clicked, false if bad response was clicked
     */
    async pulldownDialog(message, goodResponse, badResponse) {
      return new Promise((resolve) => {
        this.initializeDialogContainer();
        const dialog = document.createElement("div");
        dialog.className = "pulldown-dialog";
        const backdrop = document.createElement("div");
        backdrop.className = "dialog-backdrop";
        const content = document.createElement("div");
        content.className = "dialog-content";
        const messageElement = document.createElement("div");
        messageElement.className = "dialog-message";
        messageElement.textContent = message;
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "dialog-buttons";
        const goodButton = document.createElement("button");
        goodButton.className = "dialog-button good";
        goodButton.textContent = goodResponse;
        const badButton = document.createElement("button");
        badButton.className = "dialog-button bad";
        badButton.textContent = badResponse;
        goodButton.addEventListener("click", () => {
          this.hideDialog(dialog, () => resolve(true));
        });
        badButton.addEventListener("click", () => {
          this.hideDialog(dialog, () => resolve(false));
        });
        backdrop.addEventListener("click", () => {
          this.hideDialog(dialog, () => resolve(false));
        });
        const handleKeydown = (event) => {
          if (event.key === "Escape") {
            document.removeEventListener("keydown", handleKeydown);
            this.hideDialog(dialog, () => resolve(false));
          }
        };
        document.addEventListener("keydown", handleKeydown);
        buttonContainer.appendChild(goodButton);
        buttonContainer.appendChild(badButton);
        content.appendChild(messageElement);
        content.appendChild(buttonContainer);
        dialog.appendChild(backdrop);
        dialog.appendChild(content);
        if (this.dialogContainer) {
          this.dialogContainer.appendChild(dialog);
          this.showDialog(dialog);
        }
      });
    }
    /**
     * Show the dialog with slide down animation
     */
    showDialog(dialog) {
      dialog.offsetHeight;
      setTimeout(() => {
        dialog.classList.add("show");
      }, 10);
    }
    /**
     * Hide the dialog with slide up animation
     */
    hideDialog(dialog, callback) {
      dialog.classList.remove("show");
      dialog.classList.add("hide");
      setTimeout(() => {
        if (this.dialogContainer && this.dialogContainer.contains(dialog)) {
          this.dialogContainer.removeChild(dialog);
        }
        callback();
      }, 300);
    }
    /**
     * Update the turn indicator
     * @param isPlayerTurn - true if it's the player's turn, false if opponent's turn
     */
    updateTurnIndicator(isPlayerTurn) {
      const indicator = document.getElementById("turnIndicator");
      if (indicator) {
        indicator.textContent = isPlayerTurn ? "Your Turn" : "Opponent's Turn";
        indicator.className = `turn-indicator ${isPlayerTurn ? "your-turn" : "opponent-turn"}`;
      }
    }
    /**
     * Add a captured piece to the display
     * @param piece - The captured piece details
     * @param isPlayerCapture - true if player captured the piece, false if opponent did
     */
    addCapturedPiece(piece, isPlayerCapture) {
      const containerId = isPlayerCapture ? "playerCaptured" : "opponentCaptured";
      const container = document.getElementById(containerId);
      if (container) {
        const pieceElement = document.createElement("div");
        pieceElement.className = "captured-piece";
        pieceElement.style.backgroundImage = `url(${piece.imageUrl})`;
        pieceElement.title = `${piece.color} ${piece.type}`;
        container.appendChild(pieceElement);
      }
    }
    /**
     * Update the score display
     * @param scores - Current game scores
     */
    updateScores(scores) {
      const playerScore = document.getElementById("playerScore");
      const opponentScore = document.getElementById("opponentScore");
      if (playerScore) {
        playerScore.textContent = scores.playerScore.toString();
        if (scores.playerScore > 0) {
          playerScore.style.color = "#10b981";
          playerScore.style.fontWeight = "bold";
        } else if (scores.playerScore < 0) {
          playerScore.style.color = "#ef4444";
          playerScore.style.fontWeight = "bold";
        } else {
          playerScore.style.color = "#1e293b";
          playerScore.style.fontWeight = "bold";
        }
      }
      if (opponentScore) {
        opponentScore.textContent = scores.opponentScore.toString();
        if (scores.opponentScore > 0) {
          opponentScore.style.color = "#10b981";
          opponentScore.style.fontWeight = "bold";
        } else if (scores.opponentScore < 0) {
          opponentScore.style.color = "#ef4444";
          opponentScore.style.fontWeight = "bold";
        } else {
          opponentScore.style.color = "#1e293b";
          opponentScore.style.fontWeight = "bold";
        }
      }
    }
    /**
     * Update the timer display
     * @param timers - Current game timers
     */
    updateTimers(timers) {
      const playerTime = document.getElementById("playerTime");
      const opponentTime = document.getElementById("opponentTime");
      if (playerTime) playerTime.textContent = this.formatTime(timers.playerTime);
      if (opponentTime) opponentTime.textContent = this.formatTime(timers.opponentTime);
    }
    /**
     * Format time in milliseconds to MM:SS
     * @param timeMs - Time in milliseconds
     * @returns Formatted time string
     */
    formatTime(timeMs) {
      const totalSeconds = Math.max(0, Math.floor(timeMs / 1e3));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const secondsStr = seconds < 10 ? "0" + seconds : seconds.toString();
      return `${minutes}:${secondsStr}`;
    }
    /**
     * Add a move to the move history
     * @param move - The move details
     */
    addMove(move) {
      const movesList = document.getElementById("movesList");
      if (movesList) {
        const moveElement = document.createElement("div");
        moveElement.className = "move-item";
        const moveNumber = document.createElement("span");
        moveNumber.className = "move-number";
        moveNumber.textContent = `${move.moveNumber}.`;
        const moveNotation = document.createElement("span");
        moveNotation.className = "move-notation";
        moveNotation.textContent = move.blackMove ? `${move.whiteMove} ${move.blackMove}` : move.whiteMove;
        moveElement.appendChild(moveNumber);
        moveElement.appendChild(moveNotation);
        movesList.appendChild(moveElement);
        movesList.scrollTop = movesList.scrollHeight;
      }
    }
    /**
     * Clear all moves from the history
     */
    clearMoveHistory() {
      const movesList = document.getElementById("movesList");
      if (movesList) {
        movesList.innerHTML = "";
      }
    }
    /**
     * Clear all captured pieces
     */
    clearCapturedPieces() {
      const playerCaptured = document.getElementById("playerCaptured");
      const opponentCaptured = document.getElementById("opponentCaptured");
      if (playerCaptured) playerCaptured.innerHTML = "";
      if (opponentCaptured) opponentCaptured.innerHTML = "";
    }
    /**
     * Set up event listeners for the action buttons
     * @param onRequestDraw - Callback for draw request
     * @param onConcede - Callback for concede
     */
    setupActionButtons(onRequestDraw, onConcede) {
      const drawBtn = document.getElementById("requestDrawBtn");
      const concedeBtn = document.getElementById("concedeBtn");
      if (drawBtn) {
        drawBtn.addEventListener("click", onRequestDraw);
      }
      if (concedeBtn) {
        concedeBtn.addEventListener("click", onConcede);
      }
    }
    /**
     * Enable or disable action buttons
     * @param enabled - Whether buttons should be enabled
     */
    setActionButtonsEnabled(enabled) {
      const drawBtn = document.getElementById("requestDrawBtn");
      const concedeBtn = document.getElementById("concedeBtn");
      if (drawBtn) drawBtn.disabled = !enabled;
      if (concedeBtn) concedeBtn.disabled = !enabled;
    }
    /**
     * Reset the UI to initial state
     */
    resetUI() {
      this.clearMoveHistory();
      this.clearCapturedPieces();
      this.updateScores({ playerScore: 0, opponentScore: 0 });
      this.updateTimers({ playerTime: 20 * 60 * 1e3, opponentTime: 20 * 60 * 1e3 });
      this.updateTurnIndicator(true);
      this.setActionButtonsEnabled(true);
    }
  };
  function getPieceImageUrl(piece, color) {
    return `${color}-${piece}.png`;
  }

  // src/UI/soundmanager.ts
  var SoundManager = class _SoundManager {
    constructor() {
      this.muted = false;
      this.STORAGE_KEY = "chess9000_mute";
      this.moveAudio = new Audio("piecemoved.mp3");
      this.endAudio = new Audio("gameending.mp3");
      this.moveAudio.preload = "auto";
      this.endAudio.preload = "auto";
      this.restoreMuteSetting();
    }
    static getInstance() {
      if (!_SoundManager.instance) {
        _SoundManager.instance = new _SoundManager();
      }
      return _SoundManager.instance;
    }
    restoreMuteSetting() {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored !== null) {
          this.muted = stored === "true";
        }
      } catch (e) {
      }
    }
    persistMuteSetting() {
      try {
        localStorage.setItem(this.STORAGE_KEY, this.muted ? "true" : "false");
      } catch (e) {
      }
    }
    setMuted(m) {
      this.muted = m;
      this.persistMuteSetting();
    }
    toggleMuted() {
      this.setMuted(!this.muted);
      return this.muted;
    }
    isMuted() {
      return this.muted;
    }
    safePlay(audio) {
      if (this.muted) return;
      try {
        audio.currentTime = 0;
        void audio.play();
      } catch (e) {
      }
    }
    playMove() {
      this.safePlay(this.moveAudio);
    }
    playGameEnd() {
      this.safePlay(this.endAudio);
    }
  };

  // src/main.ts
  var socket = null;
  var canvasManager;
  var gameManager;
  var ui;
  var sound = SoundManager.getInstance();
  window.testDialog = async () => {
    const result = await ui.pulldownDialog(
      "This is a test dialog. Choose your response!",
      "Good Choice",
      "Bad Choice"
    );
    console.log("Dialog result:", result ? "Good" : "Bad");
  };
  document.addEventListener("DOMContentLoaded", () => {
    ui = Chess9000UI.getInstance();
    setupSettingsMenu();
    setupLaunchScreen();
    initializeChessGame();
  });
  function initializeSocketConnection() {
    socket = lookup2();
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
      gameManager.setPlayerID(socket.id ?? "");
      gameManager.setSocket(socket);
      const connectionStatus = document.getElementById("connectionStatus");
      if (connectionStatus) {
        connectionStatus.textContent = "Connected";
        connectionStatus.className = "status-value connected";
      }
      socket.on("gameState", (data) => {
        console.log("Received game state:", data);
        var dataObject = JSON.parse(data);
        gameManager.loadGameState(dataObject);
        updateLobbyOpponentStatus(dataObject);
        updateTurnIndicator();
        updateMoveHistory(dataObject.turnList);
        updateTimers();
        drawGame(gameManager.getSelectedPiece());
      });
      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        const connectionStatus2 = document.getElementById("connectionStatus");
        if (connectionStatus2) {
          connectionStatus2.textContent = "Disconnected";
          connectionStatus2.className = "status-value disconnected";
        }
      });
      socket.on("pieceCaptured", (data) => {
        console.log("Piece captured:", data);
        updateCapturedPieces(data);
      });
      socket.on("promote", async (data) => {
        try {
          if (!data || !data.pieceId) return;
          const { pieceId, color, choices } = data;
          if (color !== gameManager.getPlayerColor()) {
            return;
          }
          const selection = await ui.promotionDialog(color);
          const { PieceType: PieceType2 } = await Promise.resolve().then(() => (init_pieces(), pieces_exports));
          const mapping = { queen: PieceType2.QUEEN, rook: PieceType2.ROOK, bishop: PieceType2.BISHOP, knight: PieceType2.KNIGHT };
          const newType = mapping[selection] ?? PieceType2.QUEEN;
          if (!choices.includes(newType)) {
            const fallback = choices.find((c) => c === PieceType2.QUEEN) ?? choices[0];
            socket.emit("promotionChoice", { pieceId, newType: fallback });
          } else {
            socket.emit("promotionChoice", { pieceId, newType });
          }
        } catch (e) {
          console.error("Error handling promote event", e);
        }
      });
      socket.on("drawRequest", async (data) => {
        console.log("Draw request received:", data);
        const result = await ui.pulldownDialog(
          "Your opponent has requested a draw. Do you accept?",
          "Accept Draw",
          "Decline"
        );
        socket.emit("drawResponse", { accept: result });
      });
      socket.on("drawDeclined", async () => {
        console.log("Draw request was declined");
        const result = await ui.pulldownDialog(
          "Your draw request was declined. What would you like to do?",
          "Keep Playing",
          "Concede"
        );
        if (!result) {
          socket.emit("concede");
        }
      });
      socket.on("gameEnded", async (data) => {
        console.log("Game ended:", data);
        sound.playGameEnd();
        let message = "";
        const winnerId = data.winnerId || data.winner;
        const winnerColor = data.winnerColor;
        const playerSocketId = socket.id;
        const playerColor = gameManager.getPlayerColor();
        let didPlayerWin = false;
        if (winnerColor && playerColor) {
          didPlayerWin = winnerColor === playerColor;
        } else if (winnerId) {
          didPlayerWin = winnerId === playerSocketId;
        }
        if (data.reason === "draw") {
          message = "Game ended in a draw!";
        } else if (data.reason === "concede") {
          message = `Game ended - ${didPlayerWin ? "You won" : "You lost"} by concession!`;
        } else if (data.reason === "checkmate") {
          message = `Game ended - ${didPlayerWin ? "You won" : "You lost"} by checkmate!`;
        } else if (data.reason === "stalemate") {
          message = "Game ended in a stalemate!";
        } else if (data.reason === "timeout") {
          message = `Game ended - ${didPlayerWin ? "You won" : "You lost"} by timeout!`;
        } else if (data.reason === "playerLeft") {
          message = `Game ended - ${didPlayerWin ? "You won" : "You lost"} because the opponent left!`;
        }
        const playAgain = await ui.pulldownDialog(message, "Play Again", "Leave");
        if (playAgain) {
          console.log("Player chose to play again");
          socket.emit("playAgain");
        } else {
          console.log("Player chose to leave");
          socket.emit("leaveGame");
        }
      });
      socket.on("gameStarting", () => {
        console.log("Game is starting!");
        const lobbyDialog = document.getElementById("lobbyDialog");
        const gameContainer = document.getElementById("gameContainer");
        if (lobbyDialog && gameContainer) {
          lobbyDialog.style.display = "none";
          gameContainer.style.display = "flex";
          setTimeout(() => {
            drawGame();
          }, 100);
        }
      });
      socket.on("returnToLobby", () => {
        console.log("Returning to lobby for new game");
        returnToLobby();
      });
      socket.on("returnToMainMenu", () => {
        console.log("Returning to main menu");
        returnToMainMenu();
      });
      socket.on("moveResult", (result) => {
        console.log("Move result:", result);
        if (result.success) {
          sound.playMove();
          gameManager.clearSelection();
          drawGame();
        }
      });
    });
  }
  function updateLobbyOpponentStatus(gameState) {
    const opponentStatus = document.getElementById("opponentStatus");
    const startGameBtn = document.getElementById("startGameBtn");
    if (opponentStatus && startGameBtn && socket) {
      const currentPlayerId = socket.id;
      const hasWhitePlayer = gameState.whitePlayer !== null;
      const hasBlackPlayer = gameState.blackPlayer !== null;
      const bothPlayersConnected = hasWhitePlayer && hasBlackPlayer;
      if (bothPlayersConnected) {
        opponentStatus.textContent = "Opponent joined!";
        opponentStatus.className = "status-value ready";
        startGameBtn.disabled = false;
      } else {
        opponentStatus.textContent = "Waiting for opponent...";
        opponentStatus.className = "status-value waiting";
        startGameBtn.disabled = true;
      }
    }
  }
  function setupLaunchScreen() {
    const launchButton = document.getElementById("launchButton");
    const launchScreen = document.getElementById("launchScreen");
    const lobbyDialog = document.getElementById("lobbyDialog");
    if (launchButton && launchScreen && lobbyDialog) {
      launchButton.addEventListener("click", () => {
        initializeSocketConnection();
        launchScreen.classList.add("hidden");
        lobbyDialog.style.display = "flex";
        setupLobby();
      });
    }
  }
  function setupLobby() {
    const startGameBtn = document.getElementById("startGameBtn");
    const leaveLobbyBtn = document.getElementById("leaveLobbyBtn");
    const lobbyDialog = document.getElementById("lobbyDialog");
    const gameContainer = document.getElementById("gameContainer");
    const opponentStatus = document.getElementById("opponentStatus");
    if (leaveLobbyBtn && lobbyDialog) {
      leaveLobbyBtn.addEventListener("click", () => {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
        lobbyDialog.style.display = "none";
        const launchScreen = document.getElementById("launchScreen");
        if (launchScreen) {
          launchScreen.classList.remove("hidden");
        }
        const connectionStatus = document.getElementById("connectionStatus");
        if (connectionStatus) {
          connectionStatus.textContent = "Disconnected";
          connectionStatus.className = "status-value disconnected";
        }
        if (opponentStatus) {
          opponentStatus.textContent = "Waiting for opponent...";
          opponentStatus.className = "status-value waiting";
        }
        if (startGameBtn) {
          startGameBtn.disabled = true;
        }
      });
    }
    if (startGameBtn && socket) {
      startGameBtn.addEventListener("click", () => {
        console.log("Starting game...");
        socket.emit("startGame");
      });
    }
  }
  function initializeChessGame() {
    try {
      gameManager = new GameManager();
      canvasManager = new CanvasManager("chessCanvas");
      ui.resetUI();
      updateScores();
      ui.setupActionButtons(handleDrawRequest, handleConcede);
      canvasManager.addClickListener((row, col) => {
        console.log(`Clicked on square: ${row}, ${col}`);
        const piece = gameManager.getBoard().getPieceAt(row, col);
        if (piece) {
          if (gameManager.getPlayerColor() === piece.getColor()) {
            gameManager.selectPiece(piece);
          } else if (gameManager.getSelectedPiece() !== null) {
            gameManager.attemptTakePiece(piece);
          }
        } else {
          gameManager.attemptMovePiece(row, col);
        }
        drawGame(gameManager.getSelectedPiece());
      });
      setTimeout(() => {
        drawGame();
      }, 500);
    } catch (error) {
      console.error("Error initializing chess game:", error);
    }
  }
  function drawGame(selectPiece = null) {
    if (canvasManager && canvasManager.isImagesLoaded()) {
      const gs = gameManager.getGameStateRaw() ?? null;
      let lastFrom = gs?.lastMoveFrom ? { x: gs.lastMoveFrom.x, y: gs.lastMoveFrom.y } : null;
      let lastTo = gs?.lastMoveTo ? { x: gs.lastMoveTo.x, y: gs.lastMoveTo.y } : null;
      let inCheckSquare = null;
      if (gs) {
        const board = gameManager.getBoard();
        const whiteInCheck = gs.whiteInCheck;
        const blackInCheck = gs.blackInCheck;
        if (whiteInCheck) {
          const kingPos = findKingPosition("white", board);
          if (kingPos) inCheckSquare = { x: kingPos.x, y: kingPos.y };
        }
        if (blackInCheck) {
          const kingPos = findKingPosition("black", board);
          if (kingPos) inCheckSquare = { x: kingPos.x, y: kingPos.y };
        }
      }
      canvasManager.drawBoard(gameManager.getBoard(), selectPiece, gameManager.getPlayerColor(), lastFrom, lastTo, inCheckSquare);
    } else {
      setTimeout(() => drawGame(selectPiece), 100);
    }
  }
  function findKingPosition(color, board) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = board.getPieceAt(x, y);
        if (piece && piece.getColor() === color && piece.getType() === 6 /* KING */) {
          return new BoardCords(x, y);
        }
      }
    }
    return null;
  }
  function updateTurnIndicator() {
    if (ui && gameManager) {
      const isPlayerTurn = gameManager.getIsTurn();
      ui.updateTurnIndicator(isPlayerTurn);
    }
  }
  function updateMoveHistory(turnList) {
    if (ui && turnList) {
      ui.clearMoveHistory();
      for (let i = 0; i < turnList.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = turnList[i] ? turnList[i][0] : "";
        const blackMove = turnList[i + 1] ? turnList[i + 1][0] : void 0;
        ui.addMove({
          moveNumber,
          whiteMove,
          blackMove
        });
      }
    }
  }
  function updateTimers() {
    if (ui && gameManager) {
      const playerTime = gameManager.getPlayerTime();
      const opponentTime = gameManager.getOpponentTime();
      ui.updateTimers({
        playerTime,
        opponentTime
      });
    }
  }
  function updateScores() {
    if (ui && gameManager) {
      const playerScore = gameManager.getPlayerScore();
      const opponentScore = gameManager.getOpponentScore();
      ui.updateScores({
        playerScore,
        opponentScore
      });
    }
  }
  function updateCapturedPieces(captureData) {
    if (ui && captureData && captureData.piece) {
      const piece = captureData.piece;
      const pieceTypeString = getPieceTypeName(piece.type);
      const isPlayerCapture = piece.color !== gameManager.getPlayerColor();
      const capturedPiece = new Piece(piece.type, piece.color, piece.id);
      gameManager.addCapturedPiece(capturedPiece, isPlayerCapture);
      ui.addCapturedPiece({
        type: pieceTypeString,
        color: piece.color,
        imageUrl: getPieceImageUrl(pieceTypeString, piece.color)
      }, isPlayerCapture);
      updateScores();
    }
  }
  async function handleDrawRequest() {
    if (!socket) {
      console.error("Socket not connected");
      return;
    }
    console.log("Requesting draw...");
    socket.emit("requestDraw");
  }
  async function handleConcede() {
    if (!socket) {
      console.error("Socket not connected");
      return;
    }
    const result = await ui.pulldownDialog(
      "Are you sure you want to concede this game?",
      "Yes, Concede",
      "Keep Playing"
    );
    if (result) {
      console.log("Game conceded!");
      socket.emit("concede");
    } else {
      console.log("Continuing to play!");
    }
  }
  function getPieceTypeName(pieceType) {
    switch (pieceType) {
      case 1 /* PAWN */:
        return "pawn";
      case 2 /* ROOK */:
        return "rook";
      case 3 /* KNIGHT */:
        return "knight";
      case 4 /* BISHOP */:
        return "bishop";
      case 5 /* QUEEN */:
        return "queen";
      case 6 /* KING */:
        return "king";
      default:
        return "unknown";
    }
  }
  function returnToLobby() {
    const gameContainer = document.getElementById("gameContainer");
    const lobbyDialog = document.getElementById("lobbyDialog");
    if (gameContainer && lobbyDialog) {
      gameContainer.style.display = "none";
      lobbyDialog.style.display = "flex";
      ui.resetUI();
      gameManager = new GameManager();
      if (socket) {
        gameManager.setPlayerID(socket.id);
        gameManager.setSocket(socket);
      }
      console.log("Returned to lobby, waiting for opponent or game start");
    }
  }
  function returnToMainMenu() {
    const gameContainer = document.getElementById("gameContainer");
    const lobbyDialog = document.getElementById("lobbyDialog");
    const launchScreen = document.getElementById("launchScreen");
    if (gameContainer && lobbyDialog && launchScreen) {
      gameContainer.style.display = "none";
      lobbyDialog.style.display = "none";
      launchScreen.classList.remove("hidden");
      ui.resetUI();
      gameManager = new GameManager();
      socket = null;
      console.log("Returned to main menu");
    }
  }
  function setupSettingsMenu() {
    const gear = document.querySelector(".settings-icon");
    const menu = document.getElementById("settingsDropdown");
    const muteToggle = document.getElementById("muteSfxToggle");
    if (!gear) return;
    if (muteToggle) {
      muteToggle.checked = sound.isMuted();
      muteToggle.addEventListener("change", () => {
        sound.setMuted(muteToggle.checked);
      });
    }
    gear.addEventListener("click", (e) => {
      e.stopPropagation();
      if (menu) menu.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (menu && !menu.contains(e.target) && !e.target.classList.contains("settings-icon")) {
        menu.classList.remove("open");
      }
    });
  }
})();
