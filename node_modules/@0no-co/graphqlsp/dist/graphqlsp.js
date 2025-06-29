var e = require("./chunks/api-chunk.js");

var t = require("node:fs/promises");

var n = require("path");

var i = require("@gql.tada/internal");

var r = require("graphql");

var statFile = (e, n) => t.stat(e).then(n).catch((() => !1));

var swapWrite = async (e, n) => {
  if (!await statFile(e, (e => e.isFile()))) {
    await t.writeFile(e, n);
  } else {
    var i = e + ".tmp";
    await t.writeFile(i, n);
    try {
      await t.rename(i, e);
    } catch (e) {
      await t.unlink(i);
      throw e;
    } finally {
      await (async e => {
        try {
          var n = new Date;
          await t.utimes(e, n, n);
        } catch (e) {}
      })(e);
    }
  }
};

async function saveTadaIntrospection(e, r, a, o) {
  var s = i.minifyIntrospection(e);
  var c = i.outputIntrospectionFile(s, {
    fileType: r,
    shouldPreprocess: !a
  });
  var u = r;
  if (await statFile(u, (e => e.isDirectory()))) {
    u = n.join(u, "introspection.d.ts");
  } else if (!await statFile(u, (e => !!e))) {
    await t.mkdir(n.dirname(u), {
      recursive: !0
    });
    if (await statFile(u, (e => e.isDirectory()))) {
      u = n.join(u, "introspection.d.ts");
    }
  }
  try {
    await swapWrite(u, c);
    o(`Introspection saved to path @ ${u}`);
  } catch (e) {
    o(`Failed to write introspection @ ${e}`);
  }
}

function getDefinitionState(e) {
  var t;
  forEachState(e, (e => {
    switch (e.kind) {
     case "Query":
     case "ShortQuery":
     case "Mutation":
     case "Subscription":
     case "FragmentDefinition":
      t = e;
    }
  }));
  return t;
}

function getFieldDef(e, t, n) {
  if (n === r.SchemaMetaFieldDef.name && e.getQueryType() === t) {
    return r.SchemaMetaFieldDef;
  }
  if (n === r.TypeMetaFieldDef.name && e.getQueryType() === t) {
    return r.TypeMetaFieldDef;
  }
  if (n === r.TypeNameMetaFieldDef.name && r.isCompositeType(t)) {
    return r.TypeNameMetaFieldDef;
  }
  if ("getFields" in t) {
    return t.getFields()[n];
  }
  return null;
}

function forEachState(e, t) {
  var n = [];
  var i = e;
  while (null == i ? void 0 : i.kind) {
    n.push(i);
    i = i.prevState;
  }
  for (var r = n.length - 1; r >= 0; r--) {
    t(n[r]);
  }
}

function objectValues(e) {
  var t = Object.keys(e);
  var n = t.length;
  var i = new Array(n);
  for (var r = 0; r < n; ++r) {
    i[r] = e[t[r]];
  }
  return i;
}

function hintList$1(e, t) {
  return function filterAndSortList$1(e, t) {
    if (!t) {
      return filterNonEmpty$1(e, (e => !e.isDeprecated));
    }
    var n = e.map((e => ({
      proximity: getProximity$1(normalizeText$1(e.label), t),
      entry: e
    })));
    return filterNonEmpty$1(filterNonEmpty$1(n, (e => e.proximity <= 2)), (e => !e.entry.isDeprecated)).sort(((e, t) => (e.entry.isDeprecated ? 1 : 0) - (t.entry.isDeprecated ? 1 : 0) || e.proximity - t.proximity || e.entry.label.length - t.entry.label.length)).map((e => e.entry));
  }(t, normalizeText$1(e.string));
}

function filterNonEmpty$1(e, t) {
  var n = e.filter(t);
  return 0 === n.length ? e : n;
}

function normalizeText$1(e) {
  return e.toLowerCase().replaceAll(/\W/g, "");
}

function getProximity$1(e, t) {
  var n = function lexicalDistance$1(e, t) {
    var n;
    var i;
    var r = [];
    var a = e.length;
    var o = t.length;
    for (n = 0; n <= a; n++) {
      r[n] = [ n ];
    }
    for (i = 1; i <= o; i++) {
      r[0][i] = i;
    }
    for (n = 1; n <= a; n++) {
      for (i = 1; i <= o; i++) {
        var s = e[n - 1] === t[i - 1] ? 0 : 1;
        r[n][i] = Math.min(r[n - 1][i] + 1, r[n][i - 1] + 1, r[n - 1][i - 1] + s);
        if (n > 1 && i > 1 && e[n - 1] === t[i - 2] && e[n - 2] === t[i - 1]) {
          r[n][i] = Math.min(r[n][i], r[n - 2][i - 2] + s);
        }
      }
    }
    return r[a][o];
  }(t, e);
  if (e.length > t.length) {
    n -= e.length - t.length - 1;
    n += 0 === e.indexOf(t) ? 0 : .5;
  }
  return n;
}

var a;

!function(e) {
  e.is = function is(e) {
    return "string" == typeof e;
  };
}(a || (a = {}));

var o;

!function(e) {
  e.is = function is(e) {
    return "string" == typeof e;
  };
}(o || (o = {}));

var s;

!function(e) {
  e.MIN_VALUE = -2147483648;
  e.MAX_VALUE = 2147483647;
  e.is = function is(t) {
    return "number" == typeof t && e.MIN_VALUE <= t && t <= e.MAX_VALUE;
  };
}(s || (s = {}));

var c;

!function(e) {
  e.MIN_VALUE = 0;
  e.MAX_VALUE = 2147483647;
  e.is = function is(t) {
    return "number" == typeof t && e.MIN_VALUE <= t && t <= e.MAX_VALUE;
  };
}(c || (c = {}));

var u;

!function(e) {
  e.create = function create(e, t) {
    if (e === Number.MAX_VALUE) {
      e = c.MAX_VALUE;
    }
    if (t === Number.MAX_VALUE) {
      t = c.MAX_VALUE;
    }
    return {
      line: e,
      character: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && Ae.uinteger(t.line) && Ae.uinteger(t.character);
  };
}(u || (u = {}));

var l;

!function(e) {
  e.create = function create(e, t, n, i) {
    if (Ae.uinteger(e) && Ae.uinteger(t) && Ae.uinteger(n) && Ae.uinteger(i)) {
      return {
        start: u.create(e, t),
        end: u.create(n, i)
      };
    } else if (u.is(e) && u.is(t)) {
      return {
        start: e,
        end: t
      };
    } else {
      throw new Error("Range#create called with invalid arguments[".concat(e, ", ").concat(t, ", ").concat(n, ", ").concat(i, "]"));
    }
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && u.is(t.start) && u.is(t.end);
  };
}(l || (l = {}));

var d;

!function(e) {
  e.create = function create(e, t) {
    return {
      uri: e,
      range: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && l.is(t.range) && (Ae.string(t.uri) || Ae.undefined(t.uri));
  };
}(d || (d = {}));

var f;

!function(e) {
  e.create = function create(e, t, n, i) {
    return {
      targetUri: e,
      targetRange: t,
      targetSelectionRange: n,
      originSelectionRange: i
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && l.is(t.targetRange) && Ae.string(t.targetUri) && l.is(t.targetSelectionRange) && (l.is(t.originSelectionRange) || Ae.undefined(t.originSelectionRange));
  };
}(f || (f = {}));

var v;

!function(e) {
  e.create = function create(e, t, n, i) {
    return {
      red: e,
      green: t,
      blue: n,
      alpha: i
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && Ae.numberRange(t.red, 0, 1) && Ae.numberRange(t.green, 0, 1) && Ae.numberRange(t.blue, 0, 1) && Ae.numberRange(t.alpha, 0, 1);
  };
}(v || (v = {}));

var p;

!function(e) {
  e.create = function create(e, t) {
    return {
      range: e,
      color: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && l.is(t.range) && v.is(t.color);
  };
}(p || (p = {}));

var g;

!function(e) {
  e.create = function create(e, t, n) {
    return {
      label: e,
      textEdit: t,
      additionalTextEdits: n
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && Ae.string(t.label) && (Ae.undefined(t.textEdit) || D.is(t)) && (Ae.undefined(t.additionalTextEdits) || Ae.typedArray(t.additionalTextEdits, D.is));
  };
}(g || (g = {}));

var m;

!function(e) {
  e.Comment = "comment";
  e.Imports = "imports";
  e.Region = "region";
}(m || (m = {}));

var E;

!function(e) {
  e.create = function create(e, t, n, i, r, a) {
    var o = {
      startLine: e,
      endLine: t
    };
    if (Ae.defined(n)) {
      o.startCharacter = n;
    }
    if (Ae.defined(i)) {
      o.endCharacter = i;
    }
    if (Ae.defined(r)) {
      o.kind = r;
    }
    if (Ae.defined(a)) {
      o.collapsedText = a;
    }
    return o;
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && Ae.uinteger(t.startLine) && Ae.uinteger(t.startLine) && (Ae.undefined(t.startCharacter) || Ae.uinteger(t.startCharacter)) && (Ae.undefined(t.endCharacter) || Ae.uinteger(t.endCharacter)) && (Ae.undefined(t.kind) || Ae.string(t.kind));
  };
}(E || (E = {}));

var h;

!function(e) {
  e.create = function create(e, t) {
    return {
      location: e,
      message: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && d.is(t.location) && Ae.string(t.message);
  };
}(h || (h = {}));

var T;

!function(e) {
  e.Error = 1;
  e.Warning = 2;
  e.Information = 3;
  e.Hint = 4;
}(T || (T = {}));

var y;

!function(e) {
  e.Unnecessary = 1;
  e.Deprecated = 2;
}(y || (y = {}));

var I;

!function(e) {
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && Ae.string(t.href);
  };
}(I || (I = {}));

var b;

!function(e) {
  e.create = function create(e, t, n, i, r, a) {
    var o = {
      range: e,
      message: t
    };
    if (Ae.defined(n)) {
      o.severity = n;
    }
    if (Ae.defined(i)) {
      o.code = i;
    }
    if (Ae.defined(r)) {
      o.source = r;
    }
    if (Ae.defined(a)) {
      o.relatedInformation = a;
    }
    return o;
  };
  e.is = function is(e) {
    var t;
    var n = e;
    return Ae.defined(n) && l.is(n.range) && Ae.string(n.message) && (Ae.number(n.severity) || Ae.undefined(n.severity)) && (Ae.integer(n.code) || Ae.string(n.code) || Ae.undefined(n.code)) && (Ae.undefined(n.codeDescription) || Ae.string(null === (t = n.codeDescription) || void 0 === t ? void 0 : t.href)) && (Ae.string(n.source) || Ae.undefined(n.source)) && (Ae.undefined(n.relatedInformation) || Ae.typedArray(n.relatedInformation, h.is));
  };
}(b || (b = {}));

var S;

!function(e) {
  e.create = function create(e, t) {
    var n = [];
    for (var i = 2; i < arguments.length; i++) {
      n[i - 2] = arguments[i];
    }
    var r = {
      title: e,
      command: t
    };
    if (Ae.defined(n) && n.length > 0) {
      r.arguments = n;
    }
    return r;
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && Ae.string(t.title) && Ae.string(t.command);
  };
}(S || (S = {}));

var D;

!function(e) {
  e.replace = function replace(e, t) {
    return {
      range: e,
      newText: t
    };
  };
  e.insert = function insert(e, t) {
    return {
      range: {
        start: e,
        end: e
      },
      newText: t
    };
  };
  e.del = function del(e) {
    return {
      range: e,
      newText: ""
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && Ae.string(t.newText) && l.is(t.range);
  };
}(D || (D = {}));

var N;

!function(e) {
  e.create = function create(e, t, n) {
    var i = {
      label: e
    };
    if (void 0 !== t) {
      i.needsConfirmation = t;
    }
    if (void 0 !== n) {
      i.description = n;
    }
    return i;
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && Ae.string(t.label) && (Ae.boolean(t.needsConfirmation) || void 0 === t.needsConfirmation) && (Ae.string(t.description) || void 0 === t.description);
  };
}(N || (N = {}));

var _;

!function(e) {
  e.is = function is(e) {
    return Ae.string(e);
  };
}(_ || (_ = {}));

var A;

!function(e) {
  e.replace = function replace(e, t, n) {
    return {
      range: e,
      newText: t,
      annotationId: n
    };
  };
  e.insert = function insert(e, t, n) {
    return {
      range: {
        start: e,
        end: e
      },
      newText: t,
      annotationId: n
    };
  };
  e.del = function del(e, t) {
    return {
      range: e,
      newText: "",
      annotationId: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return D.is(t) && (N.is(t.annotationId) || _.is(t.annotationId));
  };
}(A || (A = {}));

var k;

!function(e) {
  e.create = function create(e, t) {
    return {
      textDocument: e,
      edits: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && R.is(t.textDocument) && Array.isArray(t.edits);
  };
}(k || (k = {}));

var L;

!function(e) {
  e.create = function create(e, t, n) {
    var i = {
      kind: "create",
      uri: e
    };
    if (void 0 !== t && (void 0 !== t.overwrite || void 0 !== t.ignoreIfExists)) {
      i.options = t;
    }
    if (void 0 !== n) {
      i.annotationId = n;
    }
    return i;
  };
  e.is = function is(e) {
    var t = e;
    return t && "create" === t.kind && Ae.string(t.uri) && (void 0 === t.options || (void 0 === t.options.overwrite || Ae.boolean(t.options.overwrite)) && (void 0 === t.options.ignoreIfExists || Ae.boolean(t.options.ignoreIfExists))) && (void 0 === t.annotationId || _.is(t.annotationId));
  };
}(L || (L = {}));

var C;

!function(e) {
  e.create = function create(e, t, n, i) {
    var r = {
      kind: "rename",
      oldUri: e,
      newUri: t
    };
    if (void 0 !== n && (void 0 !== n.overwrite || void 0 !== n.ignoreIfExists)) {
      r.options = n;
    }
    if (void 0 !== i) {
      r.annotationId = i;
    }
    return r;
  };
  e.is = function is(e) {
    var t = e;
    return t && "rename" === t.kind && Ae.string(t.oldUri) && Ae.string(t.newUri) && (void 0 === t.options || (void 0 === t.options.overwrite || Ae.boolean(t.options.overwrite)) && (void 0 === t.options.ignoreIfExists || Ae.boolean(t.options.ignoreIfExists))) && (void 0 === t.annotationId || _.is(t.annotationId));
  };
}(C || (C = {}));

var F;

!function(e) {
  e.create = function create(e, t, n) {
    var i = {
      kind: "delete",
      uri: e
    };
    if (void 0 !== t && (void 0 !== t.recursive || void 0 !== t.ignoreIfNotExists)) {
      i.options = t;
    }
    if (void 0 !== n) {
      i.annotationId = n;
    }
    return i;
  };
  e.is = function is(e) {
    var t = e;
    return t && "delete" === t.kind && Ae.string(t.uri) && (void 0 === t.options || (void 0 === t.options.recursive || Ae.boolean(t.options.recursive)) && (void 0 === t.options.ignoreIfNotExists || Ae.boolean(t.options.ignoreIfNotExists))) && (void 0 === t.annotationId || _.is(t.annotationId));
  };
}(F || (F = {}));

var O;

!function(e) {
  e.is = function is(e) {
    return e && (void 0 !== e.changes || void 0 !== e.documentChanges) && (void 0 === e.documentChanges || e.documentChanges.every((function(e) {
      if (Ae.string(e.kind)) {
        return L.is(e) || C.is(e) || F.is(e);
      } else {
        return k.is(e);
      }
    })));
  };
}(O || (O = {}));

var x = function() {
  function TextEditChangeImpl(e, t) {
    this.edits = e;
    this.changeAnnotations = t;
  }
  TextEditChangeImpl.prototype.insert = function(e, t, n) {
    var i;
    var r;
    if (void 0 === n) {
      i = D.insert(e, t);
    } else if (_.is(n)) {
      r = n;
      i = A.insert(e, t, n);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      r = this.changeAnnotations.manage(n);
      i = A.insert(e, t, r);
    }
    this.edits.push(i);
    if (void 0 !== r) {
      return r;
    }
  };
  TextEditChangeImpl.prototype.replace = function(e, t, n) {
    var i;
    var r;
    if (void 0 === n) {
      i = D.replace(e, t);
    } else if (_.is(n)) {
      r = n;
      i = A.replace(e, t, n);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      r = this.changeAnnotations.manage(n);
      i = A.replace(e, t, r);
    }
    this.edits.push(i);
    if (void 0 !== r) {
      return r;
    }
  };
  TextEditChangeImpl.prototype.delete = function(e, t) {
    var n;
    var i;
    if (void 0 === t) {
      n = D.del(e);
    } else if (_.is(t)) {
      i = t;
      n = A.del(e, t);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      i = this.changeAnnotations.manage(t);
      n = A.del(e, i);
    }
    this.edits.push(n);
    if (void 0 !== i) {
      return i;
    }
  };
  TextEditChangeImpl.prototype.add = function(e) {
    this.edits.push(e);
  };
  TextEditChangeImpl.prototype.all = function() {
    return this.edits;
  };
  TextEditChangeImpl.prototype.clear = function() {
    this.edits.splice(0, this.edits.length);
  };
  TextEditChangeImpl.prototype.assertChangeAnnotations = function(e) {
    if (void 0 === e) {
      throw new Error("Text edit change is not configured to manage change annotations.");
    }
  };
  return TextEditChangeImpl;
}();

var M = function() {
  function ChangeAnnotations(e) {
    this._annotations = void 0 === e ? Object.create(null) : e;
    this._counter = 0;
    this._size = 0;
  }
  ChangeAnnotations.prototype.all = function() {
    return this._annotations;
  };
  Object.defineProperty(ChangeAnnotations.prototype, "size", {
    get: function() {
      return this._size;
    },
    enumerable: !1,
    configurable: !0
  });
  ChangeAnnotations.prototype.manage = function(e, t) {
    var n;
    if (_.is(e)) {
      n = e;
    } else {
      n = this.nextId();
      t = e;
    }
    if (void 0 !== this._annotations[n]) {
      throw new Error("Id ".concat(n, " is already in use."));
    }
    if (void 0 === t) {
      throw new Error("No annotation provided for id ".concat(n));
    }
    this._annotations[n] = t;
    this._size++;
    return n;
  };
  ChangeAnnotations.prototype.nextId = function() {
    this._counter++;
    return this._counter.toString();
  };
  return ChangeAnnotations;
}();

!function() {
  function WorkspaceChange(e) {
    var t = this;
    this._textEditChanges = Object.create(null);
    if (void 0 !== e) {
      this._workspaceEdit = e;
      if (e.documentChanges) {
        this._changeAnnotations = new M(e.changeAnnotations);
        e.changeAnnotations = this._changeAnnotations.all();
        e.documentChanges.forEach((function(e) {
          if (k.is(e)) {
            var n = new x(e.edits, t._changeAnnotations);
            t._textEditChanges[e.textDocument.uri] = n;
          }
        }));
      } else if (e.changes) {
        Object.keys(e.changes).forEach((function(n) {
          var i = new x(e.changes[n]);
          t._textEditChanges[n] = i;
        }));
      }
    } else {
      this._workspaceEdit = {};
    }
  }
  Object.defineProperty(WorkspaceChange.prototype, "edit", {
    get: function() {
      this.initDocumentChanges();
      if (void 0 !== this._changeAnnotations) {
        if (0 === this._changeAnnotations.size) {
          this._workspaceEdit.changeAnnotations = void 0;
        } else {
          this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        }
      }
      return this._workspaceEdit;
    },
    enumerable: !1,
    configurable: !0
  });
  WorkspaceChange.prototype.getTextEditChange = function(e) {
    if (R.is(e)) {
      this.initDocumentChanges();
      if (void 0 === this._workspaceEdit.documentChanges) {
        throw new Error("Workspace edit is not configured for document changes.");
      }
      var t = {
        uri: e.uri,
        version: e.version
      };
      if (!(n = this._textEditChanges[t.uri])) {
        this._workspaceEdit.documentChanges.push({
          textDocument: t,
          edits: i = []
        });
        n = new x(i, this._changeAnnotations);
        this._textEditChanges[t.uri] = n;
      }
      return n;
    } else {
      this.initChanges();
      if (void 0 === this._workspaceEdit.changes) {
        throw new Error("Workspace edit is not configured for normal text edit changes.");
      }
      var n;
      if (!(n = this._textEditChanges[e])) {
        var i;
        this._workspaceEdit.changes[e] = i = [];
        n = new x(i);
        this._textEditChanges[e] = n;
      }
      return n;
    }
  };
  WorkspaceChange.prototype.initDocumentChanges = function() {
    if (void 0 === this._workspaceEdit.documentChanges && void 0 === this._workspaceEdit.changes) {
      this._changeAnnotations = new M;
      this._workspaceEdit.documentChanges = [];
      this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
    }
  };
  WorkspaceChange.prototype.initChanges = function() {
    if (void 0 === this._workspaceEdit.documentChanges && void 0 === this._workspaceEdit.changes) {
      this._workspaceEdit.changes = Object.create(null);
    }
  };
  WorkspaceChange.prototype.createFile = function(e, t, n) {
    this.initDocumentChanges();
    if (void 0 === this._workspaceEdit.documentChanges) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var i;
    if (N.is(t) || _.is(t)) {
      i = t;
    } else {
      n = t;
    }
    var r;
    var a;
    if (void 0 === i) {
      r = L.create(e, n);
    } else {
      a = _.is(i) ? i : this._changeAnnotations.manage(i);
      r = L.create(e, n, a);
    }
    this._workspaceEdit.documentChanges.push(r);
    if (void 0 !== a) {
      return a;
    }
  };
  WorkspaceChange.prototype.renameFile = function(e, t, n, i) {
    this.initDocumentChanges();
    if (void 0 === this._workspaceEdit.documentChanges) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var r;
    if (N.is(n) || _.is(n)) {
      r = n;
    } else {
      i = n;
    }
    var a;
    var o;
    if (void 0 === r) {
      a = C.create(e, t, i);
    } else {
      o = _.is(r) ? r : this._changeAnnotations.manage(r);
      a = C.create(e, t, i, o);
    }
    this._workspaceEdit.documentChanges.push(a);
    if (void 0 !== o) {
      return o;
    }
  };
  WorkspaceChange.prototype.deleteFile = function(e, t, n) {
    this.initDocumentChanges();
    if (void 0 === this._workspaceEdit.documentChanges) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var i;
    if (N.is(t) || _.is(t)) {
      i = t;
    } else {
      n = t;
    }
    var r;
    var a;
    if (void 0 === i) {
      r = F.create(e, n);
    } else {
      a = _.is(i) ? i : this._changeAnnotations.manage(i);
      r = F.create(e, n, a);
    }
    this._workspaceEdit.documentChanges.push(r);
    if (void 0 !== a) {
      return a;
    }
  };
}();

var P;

!function(e) {
  e.create = function create(e) {
    return {
      uri: e
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && Ae.string(t.uri);
  };
}(P || (P = {}));

var w;

!function(e) {
  e.create = function create(e, t) {
    return {
      uri: e,
      version: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && Ae.string(t.uri) && Ae.integer(t.version);
  };
}(w || (w = {}));

var R;

!function(e) {
  e.create = function create(e, t) {
    return {
      uri: e,
      version: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && Ae.string(t.uri) && (null === t.version || Ae.integer(t.version));
  };
}(R || (R = {}));

var j;

!function(e) {
  e.create = function create(e, t, n, i) {
    return {
      uri: e,
      languageId: t,
      version: n,
      text: i
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && Ae.string(t.uri) && Ae.string(t.languageId) && Ae.integer(t.version) && Ae.string(t.text);
  };
}(j || (j = {}));

var U;

!function(e) {
  e.PlainText = "plaintext";
  e.Markdown = "markdown";
  e.is = function is(t) {
    return t === e.PlainText || t === e.Markdown;
  };
}(U || (U = {}));

var V;

!function(e) {
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(e) && U.is(t.kind) && Ae.string(t.value);
  };
}(V || (V = {}));

var G;

!function(e) {
  e.Text = 1;
  e.Method = 2;
  e.Function = 3;
  e.Constructor = 4;
  e.Field = 5;
  e.Variable = 6;
  e.Class = 7;
  e.Interface = 8;
  e.Module = 9;
  e.Property = 10;
  e.Unit = 11;
  e.Value = 12;
  e.Enum = 13;
  e.Keyword = 14;
  e.Snippet = 15;
  e.Color = 16;
  e.File = 17;
  e.Reference = 18;
  e.Folder = 19;
  e.EnumMember = 20;
  e.Constant = 21;
  e.Struct = 22;
  e.Event = 23;
  e.Operator = 24;
  e.TypeParameter = 25;
}(G || (G = {}));

var Y;

!function(e) {
  e.PlainText = 1;
  e.Snippet = 2;
}(Y || (Y = {}));

var $;

!function(e) {
  e.Deprecated = 1;
}($ || ($ = {}));

var Q;

!function(e) {
  e.create = function create(e, t, n) {
    return {
      newText: e,
      insert: t,
      replace: n
    };
  };
  e.is = function is(e) {
    var t = e;
    return t && Ae.string(t.newText) && l.is(t.insert) && l.is(t.replace);
  };
}(Q || (Q = {}));

var B;

!function(e) {
  e.asIs = 1;
  e.adjustIndentation = 2;
}(B || (B = {}));

var K;

!function(e) {
  e.is = function is(e) {
    var t = e;
    return t && (Ae.string(t.detail) || void 0 === t.detail) && (Ae.string(t.description) || void 0 === t.description);
  };
}(K || (K = {}));

var X;

!function(e) {
  e.create = function create(e) {
    return {
      label: e
    };
  };
}(X || (X = {}));

var W;

!function(e) {
  e.create = function create(e, t) {
    return {
      items: e ? e : [],
      isIncomplete: !!t
    };
  };
}(W || (W = {}));

var J;

!function(e) {
  e.fromPlainText = function fromPlainText(e) {
    return e.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
  };
  e.is = function is(e) {
    var t = e;
    return Ae.string(t) || Ae.objectLiteral(t) && Ae.string(t.language) && Ae.string(t.value);
  };
}(J || (J = {}));

var z;

!function(e) {
  e.is = function is(e) {
    var t = e;
    return !!t && Ae.objectLiteral(t) && (V.is(t.contents) || J.is(t.contents) || Ae.typedArray(t.contents, J.is)) && (void 0 === e.range || l.is(e.range));
  };
}(z || (z = {}));

var q;

!function(e) {
  e.create = function create(e, t) {
    return t ? {
      label: e,
      documentation: t
    } : {
      label: e
    };
  };
}(q || (q = {}));

var H;

!function(e) {
  e.create = function create(e, t) {
    var n = [];
    for (var i = 2; i < arguments.length; i++) {
      n[i - 2] = arguments[i];
    }
    var r = {
      label: e
    };
    if (Ae.defined(t)) {
      r.documentation = t;
    }
    if (Ae.defined(n)) {
      r.parameters = n;
    } else {
      r.parameters = [];
    }
    return r;
  };
}(H || (H = {}));

var Z;

!function(e) {
  e.Text = 1;
  e.Read = 2;
  e.Write = 3;
}(Z || (Z = {}));

var ee;

!function(e) {
  e.create = function create(e, t) {
    var n = {
      range: e
    };
    if (Ae.number(t)) {
      n.kind = t;
    }
    return n;
  };
}(ee || (ee = {}));

var te;

!function(e) {
  e.File = 1;
  e.Module = 2;
  e.Namespace = 3;
  e.Package = 4;
  e.Class = 5;
  e.Method = 6;
  e.Property = 7;
  e.Field = 8;
  e.Constructor = 9;
  e.Enum = 10;
  e.Interface = 11;
  e.Function = 12;
  e.Variable = 13;
  e.Constant = 14;
  e.String = 15;
  e.Number = 16;
  e.Boolean = 17;
  e.Array = 18;
  e.Object = 19;
  e.Key = 20;
  e.Null = 21;
  e.EnumMember = 22;
  e.Struct = 23;
  e.Event = 24;
  e.Operator = 25;
  e.TypeParameter = 26;
}(te || (te = {}));

var ne;

!function(e) {
  e.Deprecated = 1;
}(ne || (ne = {}));

var ie;

!function(e) {
  e.create = function create(e, t, n, i, r) {
    var a = {
      name: e,
      kind: t,
      location: {
        uri: i,
        range: n
      }
    };
    if (r) {
      a.containerName = r;
    }
    return a;
  };
}(ie || (ie = {}));

var re;

!function(e) {
  e.create = function create(e, t, n, i) {
    return void 0 !== i ? {
      name: e,
      kind: t,
      location: {
        uri: n,
        range: i
      }
    } : {
      name: e,
      kind: t,
      location: {
        uri: n
      }
    };
  };
}(re || (re = {}));

var ae;

!function(e) {
  e.create = function create(e, t, n, i, r, a) {
    var o = {
      name: e,
      detail: t,
      kind: n,
      range: i,
      selectionRange: r
    };
    if (void 0 !== a) {
      o.children = a;
    }
    return o;
  };
  e.is = function is(e) {
    var t = e;
    return t && Ae.string(t.name) && Ae.number(t.kind) && l.is(t.range) && l.is(t.selectionRange) && (void 0 === t.detail || Ae.string(t.detail)) && (void 0 === t.deprecated || Ae.boolean(t.deprecated)) && (void 0 === t.children || Array.isArray(t.children)) && (void 0 === t.tags || Array.isArray(t.tags));
  };
}(ae || (ae = {}));

var oe;

!function(e) {
  e.Empty = "";
  e.QuickFix = "quickfix";
  e.Refactor = "refactor";
  e.RefactorExtract = "refactor.extract";
  e.RefactorInline = "refactor.inline";
  e.RefactorRewrite = "refactor.rewrite";
  e.Source = "source";
  e.SourceOrganizeImports = "source.organizeImports";
  e.SourceFixAll = "source.fixAll";
}(oe || (oe = {}));

var se;

!function(e) {
  e.Invoked = 1;
  e.Automatic = 2;
}(se || (se = {}));

var ce;

!function(e) {
  e.create = function create(e, t, n) {
    var i = {
      diagnostics: e
    };
    if (null != t) {
      i.only = t;
    }
    if (null != n) {
      i.triggerKind = n;
    }
    return i;
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && Ae.typedArray(t.diagnostics, b.is) && (void 0 === t.only || Ae.typedArray(t.only, Ae.string)) && (void 0 === t.triggerKind || t.triggerKind === se.Invoked || t.triggerKind === se.Automatic);
  };
}(ce || (ce = {}));

var ue;

!function(e) {
  e.create = function create(e, t, n) {
    var i = {
      title: e
    };
    var r = !0;
    if ("string" == typeof t) {
      r = !1;
      i.kind = t;
    } else if (S.is(t)) {
      i.command = t;
    } else {
      i.edit = t;
    }
    if (r && void 0 !== n) {
      i.kind = n;
    }
    return i;
  };
  e.is = function is(e) {
    var t = e;
    return t && Ae.string(t.title) && (void 0 === t.diagnostics || Ae.typedArray(t.diagnostics, b.is)) && (void 0 === t.kind || Ae.string(t.kind)) && (void 0 !== t.edit || void 0 !== t.command) && (void 0 === t.command || S.is(t.command)) && (void 0 === t.isPreferred || Ae.boolean(t.isPreferred)) && (void 0 === t.edit || O.is(t.edit));
  };
}(ue || (ue = {}));

var le;

!function(e) {
  e.create = function create(e, t) {
    var n = {
      range: e
    };
    if (Ae.defined(t)) {
      n.data = t;
    }
    return n;
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && l.is(t.range) && (Ae.undefined(t.command) || S.is(t.command));
  };
}(le || (le = {}));

var de;

!function(e) {
  e.create = function create(e, t) {
    return {
      tabSize: e,
      insertSpaces: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && Ae.uinteger(t.tabSize) && Ae.boolean(t.insertSpaces);
  };
}(de || (de = {}));

var fe;

!function(e) {
  e.create = function create(e, t, n) {
    return {
      range: e,
      target: t,
      data: n
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && l.is(t.range) && (Ae.undefined(t.target) || Ae.string(t.target));
  };
}(fe || (fe = {}));

var ve;

!function(e) {
  e.create = function create(e, t) {
    return {
      range: e,
      parent: t
    };
  };
  e.is = function is(t) {
    var n = t;
    return Ae.objectLiteral(n) && l.is(n.range) && (void 0 === n.parent || e.is(n.parent));
  };
}(ve || (ve = {}));

var pe;

!function(e) {
  e.namespace = "namespace";
  e.type = "type";
  e.class = "class";
  e.enum = "enum";
  e.interface = "interface";
  e.struct = "struct";
  e.typeParameter = "typeParameter";
  e.parameter = "parameter";
  e.variable = "variable";
  e.property = "property";
  e.enumMember = "enumMember";
  e.event = "event";
  e.function = "function";
  e.method = "method";
  e.macro = "macro";
  e.keyword = "keyword";
  e.modifier = "modifier";
  e.comment = "comment";
  e.string = "string";
  e.number = "number";
  e.regexp = "regexp";
  e.operator = "operator";
  e.decorator = "decorator";
}(pe || (pe = {}));

var ge;

!function(e) {
  e.declaration = "declaration";
  e.definition = "definition";
  e.readonly = "readonly";
  e.static = "static";
  e.deprecated = "deprecated";
  e.abstract = "abstract";
  e.async = "async";
  e.modification = "modification";
  e.documentation = "documentation";
  e.defaultLibrary = "defaultLibrary";
}(ge || (ge = {}));

var me;

!function(e) {
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && (void 0 === t.resultId || "string" == typeof t.resultId) && Array.isArray(t.data) && (0 === t.data.length || "number" == typeof t.data[0]);
  };
}(me || (me = {}));

var Ee;

!function(e) {
  e.create = function create(e, t) {
    return {
      range: e,
      text: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return null != t && l.is(t.range) && Ae.string(t.text);
  };
}(Ee || (Ee = {}));

var he;

!function(e) {
  e.create = function create(e, t, n) {
    return {
      range: e,
      variableName: t,
      caseSensitiveLookup: n
    };
  };
  e.is = function is(e) {
    var t = e;
    return null != t && l.is(t.range) && Ae.boolean(t.caseSensitiveLookup) && (Ae.string(t.variableName) || void 0 === t.variableName);
  };
}(he || (he = {}));

var Te;

!function(e) {
  e.create = function create(e, t) {
    return {
      range: e,
      expression: t
    };
  };
  e.is = function is(e) {
    var t = e;
    return null != t && l.is(t.range) && (Ae.string(t.expression) || void 0 === t.expression);
  };
}(Te || (Te = {}));

var ye;

!function(e) {
  e.create = function create(e, t) {
    return {
      frameId: e,
      stoppedLocation: t
    };
  };
  e.is = function is(e) {
    return Ae.defined(e) && l.is(e.stoppedLocation);
  };
}(ye || (ye = {}));

var Ie;

!function(e) {
  e.Type = 1;
  e.Parameter = 2;
  e.is = function is(e) {
    return 1 === e || 2 === e;
  };
}(Ie || (Ie = {}));

var be;

!function(e) {
  e.create = function create(e) {
    return {
      value: e
    };
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && (void 0 === t.tooltip || Ae.string(t.tooltip) || V.is(t.tooltip)) && (void 0 === t.location || d.is(t.location)) && (void 0 === t.command || S.is(t.command));
  };
}(be || (be = {}));

var Se;

!function(e) {
  e.create = function create(e, t, n) {
    var i = {
      position: e,
      label: t
    };
    if (void 0 !== n) {
      i.kind = n;
    }
    return i;
  };
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && u.is(t.position) && (Ae.string(t.label) || Ae.typedArray(t.label, be.is)) && (void 0 === t.kind || Ie.is(t.kind)) && void 0 === t.textEdits || Ae.typedArray(t.textEdits, D.is) && (void 0 === t.tooltip || Ae.string(t.tooltip) || V.is(t.tooltip)) && (void 0 === t.paddingLeft || Ae.boolean(t.paddingLeft)) && (void 0 === t.paddingRight || Ae.boolean(t.paddingRight));
  };
}(Se || (Se = {}));

var De;

!function(e) {
  e.is = function is(e) {
    var t = e;
    return Ae.objectLiteral(t) && o.is(t.uri) && Ae.string(t.name);
  };
}(De || (De = {}));

var Ne;

!function(e) {
  e.create = function create(e, t, n, i) {
    return new _e(e, t, n, i);
  };
  e.is = function is(e) {
    var t = e;
    return Ae.defined(t) && Ae.string(t.uri) && (Ae.undefined(t.languageId) || Ae.string(t.languageId)) && Ae.uinteger(t.lineCount) && Ae.func(t.getText) && Ae.func(t.positionAt) && Ae.func(t.offsetAt) ? !0 : !1;
  };
  e.applyEdits = function applyEdits(e, t) {
    var n = e.getText();
    var i = mergeSort(t, (function(e, t) {
      var n = e.range.start.line - t.range.start.line;
      if (0 === n) {
        return e.range.start.character - t.range.start.character;
      }
      return n;
    }));
    var r = n.length;
    for (var a = i.length - 1; a >= 0; a--) {
      var o = i[a];
      var s = e.offsetAt(o.range.start);
      var c = e.offsetAt(o.range.end);
      if (c <= r) {
        n = n.substring(0, s) + o.newText + n.substring(c, n.length);
      } else {
        throw new Error("Overlapping edit");
      }
      r = s;
    }
    return n;
  };
  function mergeSort(e, t) {
    if (e.length <= 1) {
      return e;
    }
    var n = e.length / 2 | 0;
    var i = e.slice(0, n);
    var r = e.slice(n);
    mergeSort(i, t);
    mergeSort(r, t);
    var a = 0;
    var o = 0;
    var s = 0;
    while (a < i.length && o < r.length) {
      if (t(i[a], r[o]) <= 0) {
        e[s++] = i[a++];
      } else {
        e[s++] = r[o++];
      }
    }
    while (a < i.length) {
      e[s++] = i[a++];
    }
    while (o < r.length) {
      e[s++] = r[o++];
    }
    return e;
  }
}(Ne || (Ne = {}));

var _e = function() {
  function FullTextDocument(e, t, n, i) {
    this._uri = e;
    this._languageId = t;
    this._version = n;
    this._content = i;
    this._lineOffsets = void 0;
  }
  Object.defineProperty(FullTextDocument.prototype, "uri", {
    get: function() {
      return this._uri;
    },
    enumerable: !1,
    configurable: !0
  });
  Object.defineProperty(FullTextDocument.prototype, "languageId", {
    get: function() {
      return this._languageId;
    },
    enumerable: !1,
    configurable: !0
  });
  Object.defineProperty(FullTextDocument.prototype, "version", {
    get: function() {
      return this._version;
    },
    enumerable: !1,
    configurable: !0
  });
  FullTextDocument.prototype.getText = function(e) {
    if (e) {
      var t = this.offsetAt(e.start);
      var n = this.offsetAt(e.end);
      return this._content.substring(t, n);
    }
    return this._content;
  };
  FullTextDocument.prototype.update = function(e, t) {
    this._content = e.text;
    this._version = t;
    this._lineOffsets = void 0;
  };
  FullTextDocument.prototype.getLineOffsets = function() {
    if (void 0 === this._lineOffsets) {
      var e = [];
      var t = this._content;
      var n = !0;
      for (var i = 0; i < t.length; i++) {
        if (n) {
          e.push(i);
          n = !1;
        }
        var r = t.charAt(i);
        n = "\r" === r || "\n" === r;
        if ("\r" === r && i + 1 < t.length && "\n" === t.charAt(i + 1)) {
          i++;
        }
      }
      if (n && t.length > 0) {
        e.push(t.length);
      }
      this._lineOffsets = e;
    }
    return this._lineOffsets;
  };
  FullTextDocument.prototype.positionAt = function(e) {
    e = Math.max(Math.min(e, this._content.length), 0);
    var t = this.getLineOffsets();
    var n = 0, i = t.length;
    if (0 === i) {
      return u.create(0, e);
    }
    while (n < i) {
      var r = Math.floor((n + i) / 2);
      if (t[r] > e) {
        i = r;
      } else {
        n = r + 1;
      }
    }
    var a = n - 1;
    return u.create(a, e - t[a]);
  };
  FullTextDocument.prototype.offsetAt = function(e) {
    var t = this.getLineOffsets();
    if (e.line >= t.length) {
      return this._content.length;
    } else if (e.line < 0) {
      return 0;
    }
    var n = t[e.line];
    return Math.max(Math.min(n + e.character, e.line + 1 < t.length ? t[e.line + 1] : this._content.length), n);
  };
  Object.defineProperty(FullTextDocument.prototype, "lineCount", {
    get: function() {
      return this.getLineOffsets().length;
    },
    enumerable: !1,
    configurable: !0
  });
  return FullTextDocument;
}();

var Ae;

!function(e) {
  var t = Object.prototype.toString;
  e.defined = function defined(e) {
    return void 0 !== e;
  };
  e.undefined = function undefined$1(e) {
    return void 0 === e;
  };
  e.boolean = function boolean(e) {
    return !0 === e || !1 === e;
  };
  e.string = function string(e) {
    return "[object String]" === t.call(e);
  };
  e.number = function number(e) {
    return "[object Number]" === t.call(e);
  };
  e.numberRange = function numberRange(e, n, i) {
    return "[object Number]" === t.call(e) && n <= e && e <= i;
  };
  e.integer = function integer(e) {
    return "[object Number]" === t.call(e) && -2147483648 <= e && e <= 2147483647;
  };
  e.uinteger = function uinteger(e) {
    return "[object Number]" === t.call(e) && 0 <= e && e <= 2147483647;
  };
  e.func = function func(e) {
    return "[object Function]" === t.call(e);
  };
  e.objectLiteral = function objectLiteral(e) {
    return null !== e && "object" == typeof e;
  };
  e.typedArray = function typedArray(e, t) {
    return Array.isArray(e) && e.every(t);
  };
}(Ae || (Ae = {}));

var ke;

!function(e) {
  e.Text = 1;
  e.Method = 2;
  e.Function = 3;
  e.Constructor = 4;
  e.Field = 5;
  e.Variable = 6;
  e.Class = 7;
  e.Interface = 8;
  e.Module = 9;
  e.Property = 10;
  e.Unit = 11;
  e.Value = 12;
  e.Enum = 13;
  e.Keyword = 14;
  e.Snippet = 15;
  e.Color = 16;
  e.File = 17;
  e.Reference = 18;
  e.Folder = 19;
  e.EnumMember = 20;
  e.Constant = 21;
  e.Struct = 22;
  e.Event = 23;
  e.Operator = 24;
  e.TypeParameter = 25;
}(ke || (ke = {}));

var Le = Object.assign(Object.assign({}, r.Kind), {
  ALIASED_FIELD: "AliasedField",
  ARGUMENTS: "Arguments",
  SHORT_QUERY: "ShortQuery",
  QUERY: "Query",
  MUTATION: "Mutation",
  SUBSCRIPTION: "Subscription",
  TYPE_CONDITION: "TypeCondition",
  INVALID: "Invalid",
  COMMENT: "Comment",
  SCHEMA_DEF: "SchemaDef",
  SCALAR_DEF: "ScalarDef",
  OBJECT_TYPE_DEF: "ObjectTypeDef",
  OBJECT_VALUE: "ObjectValue",
  LIST_VALUE: "ListValue",
  INTERFACE_DEF: "InterfaceDef",
  UNION_DEF: "UnionDef",
  ENUM_DEF: "EnumDef",
  ENUM_VALUE: "EnumValue",
  FIELD_DEF: "FieldDef",
  INPUT_DEF: "InputDef",
  INPUT_VALUE_DEF: "InputValueDef",
  ARGUMENTS_DEF: "ArgumentsDef",
  EXTEND_DEF: "ExtendDef",
  EXTENSION_DEFINITION: "ExtensionDefinition",
  DIRECTIVE_DEF: "DirectiveDef",
  IMPLEMENTS: "Implements",
  VARIABLE_DEFINITIONS: "VariableDefinitions",
  TYPE: "Type"
});

var Ce = {
  command: "editor.action.triggerSuggest",
  title: "Suggestions"
};

var collectFragmentDefs = e => {
  var t = [];
  if (e) {
    try {
      r.visit(r.parse(e), {
        FragmentDefinition(e) {
          t.push(e);
        }
      });
    } catch (e) {
      return [];
    }
  }
  return t;
};

var Fe = [ r.Kind.SCHEMA_DEFINITION, r.Kind.OPERATION_TYPE_DEFINITION, r.Kind.SCALAR_TYPE_DEFINITION, r.Kind.OBJECT_TYPE_DEFINITION, r.Kind.INTERFACE_TYPE_DEFINITION, r.Kind.UNION_TYPE_DEFINITION, r.Kind.ENUM_TYPE_DEFINITION, r.Kind.INPUT_OBJECT_TYPE_DEFINITION, r.Kind.DIRECTIVE_DEFINITION, r.Kind.SCHEMA_EXTENSION, r.Kind.SCALAR_TYPE_EXTENSION, r.Kind.OBJECT_TYPE_EXTENSION, r.Kind.INTERFACE_TYPE_EXTENSION, r.Kind.UNION_TYPE_EXTENSION, r.Kind.ENUM_TYPE_EXTENSION, r.Kind.INPUT_OBJECT_TYPE_EXTENSION ];

var hasTypeSystemDefinitions = e => {
  var t = !1;
  if (e) {
    try {
      r.visit(r.parse(e), {
        enter(e) {
          if ("Document" === e.kind) {
            return;
          }
          if (Fe.includes(e.kind)) {
            t = !0;
            return r.BREAK;
          }
          return !1;
        }
      });
    } catch (e) {
      return t;
    }
  }
  return t;
};

function getAutocompleteSuggestions(e, t, n, i, a, o) {
  var s;
  var c = Object.assign(Object.assign({}, o), {
    schema: e
  });
  var u = i || getTokenAtPosition(t, n, 1);
  var l = "Invalid" === u.state.kind ? u.state.prevState : u.state;
  var d = (null == o ? void 0 : o.mode) || function getDocumentMode(e, t) {
    if (null == t ? void 0 : t.endsWith(".graphqls")) {
      return xe.TYPE_SYSTEM;
    }
    return hasTypeSystemDefinitions(e) ? xe.TYPE_SYSTEM : xe.EXECUTABLE;
  }(t, null == o ? void 0 : o.uri);
  if (!l) {
    return [];
  }
  var {kind: f, step: v, prevState: p} = l;
  var g = getTypeInfo(e, u.state);
  if (f === Le.DOCUMENT) {
    if (d === xe.TYPE_SYSTEM) {
      return function getSuggestionsForTypeSystemDefinitions(e) {
        return hintList$1(e, [ {
          label: "extend",
          kind: ke.Function
        }, {
          label: "type",
          kind: ke.Function
        }, {
          label: "interface",
          kind: ke.Function
        }, {
          label: "union",
          kind: ke.Function
        }, {
          label: "input",
          kind: ke.Function
        }, {
          label: "scalar",
          kind: ke.Function
        }, {
          label: "schema",
          kind: ke.Function
        } ]);
      }(u);
    }
    return function getSuggestionsForExecutableDefinitions(e) {
      return hintList$1(e, [ {
        label: "query",
        kind: ke.Function
      }, {
        label: "mutation",
        kind: ke.Function
      }, {
        label: "subscription",
        kind: ke.Function
      }, {
        label: "fragment",
        kind: ke.Function
      }, {
        label: "{",
        kind: ke.Constructor
      } ]);
    }(u);
  }
  if (f === Le.EXTEND_DEF) {
    return function getSuggestionsForExtensionDefinitions(e) {
      return hintList$1(e, [ {
        label: "type",
        kind: ke.Function
      }, {
        label: "interface",
        kind: ke.Function
      }, {
        label: "union",
        kind: ke.Function
      }, {
        label: "input",
        kind: ke.Function
      }, {
        label: "scalar",
        kind: ke.Function
      }, {
        label: "schema",
        kind: ke.Function
      } ]);
    }(u);
  }
  if ((null === (s = null == p ? void 0 : p.prevState) || void 0 === s ? void 0 : s.kind) === Le.EXTENSION_DEFINITION && l.name) {
    return hintList$1(u, []);
  }
  if ((null == p ? void 0 : p.kind) === r.Kind.SCALAR_TYPE_EXTENSION) {
    return hintList$1(u, Object.values(e.getTypeMap()).filter(r.isScalarType).map((e => ({
      label: e.name,
      kind: ke.Function
    }))));
  }
  if ((null == p ? void 0 : p.kind) === r.Kind.OBJECT_TYPE_EXTENSION) {
    return hintList$1(u, Object.values(e.getTypeMap()).filter((e => r.isObjectType(e) && !e.name.startsWith("__"))).map((e => ({
      label: e.name,
      kind: ke.Function
    }))));
  }
  if ((null == p ? void 0 : p.kind) === r.Kind.INTERFACE_TYPE_EXTENSION) {
    return hintList$1(u, Object.values(e.getTypeMap()).filter(r.isInterfaceType).map((e => ({
      label: e.name,
      kind: ke.Function
    }))));
  }
  if ((null == p ? void 0 : p.kind) === r.Kind.UNION_TYPE_EXTENSION) {
    return hintList$1(u, Object.values(e.getTypeMap()).filter(r.isUnionType).map((e => ({
      label: e.name,
      kind: ke.Function
    }))));
  }
  if ((null == p ? void 0 : p.kind) === r.Kind.ENUM_TYPE_EXTENSION) {
    return hintList$1(u, Object.values(e.getTypeMap()).filter((e => r.isEnumType(e) && !e.name.startsWith("__"))).map((e => ({
      label: e.name,
      kind: ke.Function
    }))));
  }
  if ((null == p ? void 0 : p.kind) === r.Kind.INPUT_OBJECT_TYPE_EXTENSION) {
    return hintList$1(u, Object.values(e.getTypeMap()).filter(r.isInputObjectType).map((e => ({
      label: e.name,
      kind: ke.Function
    }))));
  }
  if (f === Le.IMPLEMENTS || f === Le.NAMED_TYPE && (null == p ? void 0 : p.kind) === Le.IMPLEMENTS) {
    return function getSuggestionsForImplements(e, t, n, i, a) {
      if (t.needsSeparator) {
        return [];
      }
      var o = n.getTypeMap();
      var s = objectValues(o).filter(r.isInterfaceType);
      var c = s.map((({name: e}) => e));
      var u = new Set;
      runOnlineParser$1(i, ((e, t) => {
        var i, o, s, l, d;
        if (t.name) {
          if (t.kind === Le.INTERFACE_DEF && !c.includes(t.name)) {
            u.add(t.name);
          }
          if (t.kind === Le.NAMED_TYPE && (null === (i = t.prevState) || void 0 === i ? void 0 : i.kind) === Le.IMPLEMENTS) {
            if (a.interfaceDef) {
              if (null === (o = a.interfaceDef) || void 0 === o ? void 0 : o.getInterfaces().find((({name: e}) => e === t.name))) {
                return;
              }
              var f = n.getType(t.name);
              var v = null === (s = a.interfaceDef) || void 0 === s ? void 0 : s.toConfig();
              a.interfaceDef = new r.GraphQLInterfaceType(Object.assign(Object.assign({}, v), {
                interfaces: [ ...v.interfaces, f || new r.GraphQLInterfaceType({
                  name: t.name,
                  fields: {}
                }) ]
              }));
            } else if (a.objectTypeDef) {
              if (null === (l = a.objectTypeDef) || void 0 === l ? void 0 : l.getInterfaces().find((({name: e}) => e === t.name))) {
                return;
              }
              var p = n.getType(t.name);
              var g = null === (d = a.objectTypeDef) || void 0 === d ? void 0 : d.toConfig();
              a.objectTypeDef = new r.GraphQLObjectType(Object.assign(Object.assign({}, g), {
                interfaces: [ ...g.interfaces, p || new r.GraphQLInterfaceType({
                  name: t.name,
                  fields: {}
                }) ]
              }));
            }
          }
        }
      }));
      var l = a.interfaceDef || a.objectTypeDef;
      var d = ((null == l ? void 0 : l.getInterfaces()) || []).map((({name: e}) => e));
      var f = s.concat([ ...u ].map((e => ({
        name: e
      })))).filter((({name: e}) => e !== (null == l ? void 0 : l.name) && !d.includes(e)));
      return hintList$1(e, f.map((e => {
        var t = {
          label: e.name,
          kind: ke.Interface,
          type: e
        };
        if (null == e ? void 0 : e.description) {
          t.documentation = e.description;
        }
        return t;
      })));
    }(u, l, e, t, g);
  }
  if (f === Le.SELECTION_SET || f === Le.FIELD || f === Le.ALIASED_FIELD) {
    return function getSuggestionsForFieldNames(e, t, n) {
      var i;
      if (t.parentType) {
        var {parentType: a} = t;
        var o = [];
        if ("getFields" in a) {
          o = objectValues(a.getFields());
        }
        if (r.isCompositeType(a)) {
          o.push(r.TypeNameMetaFieldDef);
        }
        if (a === (null === (i = null == n ? void 0 : n.schema) || void 0 === i ? void 0 : i.getQueryType())) {
          o.push(r.SchemaMetaFieldDef, r.TypeMetaFieldDef);
        }
        return hintList$1(e, o.map(((e, t) => {
          var i;
          var r = {
            sortText: String(t) + e.name,
            label: e.name,
            detail: String(e.type),
            documentation: null !== (i = e.description) && void 0 !== i ? i : void 0,
            deprecated: Boolean(e.deprecationReason),
            isDeprecated: Boolean(e.deprecationReason),
            deprecationReason: e.deprecationReason,
            kind: ke.Field,
            type: e.type
          };
          if (null == n ? void 0 : n.fillLeafsOnComplete) {
            var a = getInsertText(e);
            if (a) {
              r.insertText = e.name + a;
              r.insertTextFormat = Y.Snippet;
              r.command = Ce;
            }
          }
          return r;
        })));
      }
      return [];
    }(u, g, c);
  }
  if (f === Le.ARGUMENTS || f === Le.ARGUMENT && 0 === v) {
    var {argDefs: m} = g;
    if (m) {
      return hintList$1(u, m.map((e => {
        var t;
        return {
          label: e.name,
          insertText: e.name + ": ",
          command: Ce,
          detail: String(e.type),
          documentation: null !== (t = e.description) && void 0 !== t ? t : void 0,
          kind: ke.Variable,
          type: e.type
        };
      })));
    }
  }
  if ((f === Le.OBJECT_VALUE || f === Le.OBJECT_FIELD && 0 === v) && g.objectFieldDefs) {
    var E = objectValues(g.objectFieldDefs);
    var h = f === Le.OBJECT_VALUE ? ke.Value : ke.Field;
    return hintList$1(u, E.map((e => {
      var t;
      return {
        label: e.name,
        detail: String(e.type),
        documentation: null !== (t = e.description) && void 0 !== t ? t : void 0,
        kind: h,
        type: e.type
      };
    })));
  }
  if (f === Le.ENUM_VALUE || f === Le.LIST_VALUE && 1 === v || f === Le.OBJECT_FIELD && 2 === v || f === Le.ARGUMENT && 2 === v) {
    return function getSuggestionsForInputValues(e, t, n, i) {
      var a = r.getNamedType(t.inputType);
      var o = getVariableCompletions(n, i, e).filter((e => e.detail === a.name));
      if (a instanceof r.GraphQLEnumType) {
        return hintList$1(e, a.getValues().map((e => {
          var t;
          return {
            label: e.name,
            detail: String(a),
            documentation: null !== (t = e.description) && void 0 !== t ? t : void 0,
            deprecated: Boolean(e.deprecationReason),
            isDeprecated: Boolean(e.deprecationReason),
            deprecationReason: e.deprecationReason,
            kind: ke.EnumMember,
            type: a
          };
        })).concat(o));
      }
      if (a === r.GraphQLBoolean) {
        return hintList$1(e, o.concat([ {
          label: "true",
          detail: String(r.GraphQLBoolean),
          documentation: "Not false.",
          kind: ke.Variable,
          type: r.GraphQLBoolean
        }, {
          label: "false",
          detail: String(r.GraphQLBoolean),
          documentation: "Not true.",
          kind: ke.Variable,
          type: r.GraphQLBoolean
        } ]));
      }
      return o;
    }(u, g, t, e);
  }
  if (f === Le.VARIABLE && 1 === v) {
    var T = r.getNamedType(g.inputType);
    return hintList$1(u, getVariableCompletions(t, e, u).filter((e => e.detail === (null == T ? void 0 : T.name))));
  }
  if (f === Le.TYPE_CONDITION && 1 === v || f === Le.NAMED_TYPE && null != p && p.kind === Le.TYPE_CONDITION) {
    return function getSuggestionsForFragmentTypeConditions(e, t, n, i) {
      var a;
      if (t.parentType) {
        if (r.isAbstractType(t.parentType)) {
          var o = r.assertAbstractType(t.parentType);
          var s = n.getPossibleTypes(o);
          var c = Object.create(null);
          for (var u of s) {
            for (var l of u.getInterfaces()) {
              c[l.name] = l;
            }
          }
          a = s.concat(objectValues(c));
        } else {
          a = [ t.parentType ];
        }
      } else {
        a = objectValues(n.getTypeMap()).filter((e => r.isCompositeType(e) && !e.name.startsWith("__")));
      }
      return hintList$1(e, a.map((e => {
        var t = r.getNamedType(e);
        return {
          label: String(e),
          documentation: (null == t ? void 0 : t.description) || "",
          kind: ke.Field
        };
      })));
    }(u, g, e);
  }
  if (f === Le.FRAGMENT_SPREAD && 1 === v) {
    return function getSuggestionsForFragmentSpread$1(e, t, n, i, a) {
      if (!i) {
        return [];
      }
      var o = n.getTypeMap();
      var s = getDefinitionState(e.state);
      var c = function getFragmentDefinitions(e) {
        var t = [];
        runOnlineParser$1(e, ((e, n) => {
          if (n.kind === Le.FRAGMENT_DEFINITION && n.name && n.type) {
            t.push({
              kind: Le.FRAGMENT_DEFINITION,
              name: {
                kind: r.Kind.NAME,
                value: n.name
              },
              selectionSet: {
                kind: Le.SELECTION_SET,
                selections: []
              },
              typeCondition: {
                kind: Le.NAMED_TYPE,
                name: {
                  kind: r.Kind.NAME,
                  value: n.type
                }
              }
            });
          }
        }));
        return t;
      }(i);
      if (a && a.length > 0) {
        c.push(...a);
      }
      var u = c.filter((e => o[e.typeCondition.name.value] && !(s && s.kind === Le.FRAGMENT_DEFINITION && s.name === e.name.value) && r.isCompositeType(t.parentType) && r.isCompositeType(o[e.typeCondition.name.value]) && r.doTypesOverlap(n, t.parentType, o[e.typeCondition.name.value])));
      return hintList$1(e, u.map((e => ({
        label: e.name.value,
        detail: String(o[e.typeCondition.name.value]),
        documentation: `fragment ${e.name.value} on ${e.typeCondition.name.value}`,
        kind: ke.Field,
        type: o[e.typeCondition.name.value]
      }))));
    }(u, g, e, t, Array.isArray(a) ? a : collectFragmentDefs(a));
  }
  var y = unwrapType(l);
  if (d === xe.TYPE_SYSTEM && !y.needsAdvance && f === Le.NAMED_TYPE || f === Le.LIST_TYPE) {
    if (y.kind === Le.FIELD_DEF) {
      return hintList$1(u, Object.values(e.getTypeMap()).filter((e => r.isOutputType(e) && !e.name.startsWith("__"))).map((e => ({
        label: e.name,
        kind: ke.Function
      }))));
    }
    if (y.kind === Le.INPUT_VALUE_DEF) {
      return hintList$1(u, Object.values(e.getTypeMap()).filter((e => r.isInputType(e) && !e.name.startsWith("__"))).map((e => ({
        label: e.name,
        kind: ke.Function
      }))));
    }
  }
  if (f === Le.VARIABLE_DEFINITION && 2 === v || f === Le.LIST_TYPE && 1 === v || f === Le.NAMED_TYPE && p && (p.kind === Le.VARIABLE_DEFINITION || p.kind === Le.LIST_TYPE || p.kind === Le.NON_NULL_TYPE)) {
    return function getSuggestionsForVariableDefinition(e, t, n) {
      var i = t.getTypeMap();
      var a = objectValues(i).filter(r.isInputType);
      return hintList$1(e, a.map((e => ({
        label: e.name,
        documentation: e.description,
        kind: ke.Variable
      }))));
    }(u, e);
  }
  if (f === Le.DIRECTIVE) {
    return function getSuggestionsForDirective(e, t, n, i) {
      var a;
      if (null === (a = t.prevState) || void 0 === a ? void 0 : a.kind) {
        var o = n.getDirectives().filter((e => function canUseDirective(e, t) {
          if (!(null == e ? void 0 : e.kind)) {
            return !1;
          }
          var {kind: n, prevState: i} = e;
          var {locations: a} = t;
          switch (n) {
           case Le.QUERY:
            return a.includes(r.DirectiveLocation.QUERY);

           case Le.MUTATION:
            return a.includes(r.DirectiveLocation.MUTATION);

           case Le.SUBSCRIPTION:
            return a.includes(r.DirectiveLocation.SUBSCRIPTION);

           case Le.FIELD:
           case Le.ALIASED_FIELD:
            return a.includes(r.DirectiveLocation.FIELD);

           case Le.FRAGMENT_DEFINITION:
            return a.includes(r.DirectiveLocation.FRAGMENT_DEFINITION);

           case Le.FRAGMENT_SPREAD:
            return a.includes(r.DirectiveLocation.FRAGMENT_SPREAD);

           case Le.INLINE_FRAGMENT:
            return a.includes(r.DirectiveLocation.INLINE_FRAGMENT);

           case Le.SCHEMA_DEF:
            return a.includes(r.DirectiveLocation.SCHEMA);

           case Le.SCALAR_DEF:
            return a.includes(r.DirectiveLocation.SCALAR);

           case Le.OBJECT_TYPE_DEF:
            return a.includes(r.DirectiveLocation.OBJECT);

           case Le.FIELD_DEF:
            return a.includes(r.DirectiveLocation.FIELD_DEFINITION);

           case Le.INTERFACE_DEF:
            return a.includes(r.DirectiveLocation.INTERFACE);

           case Le.UNION_DEF:
            return a.includes(r.DirectiveLocation.UNION);

           case Le.ENUM_DEF:
            return a.includes(r.DirectiveLocation.ENUM);

           case Le.ENUM_VALUE:
            return a.includes(r.DirectiveLocation.ENUM_VALUE);

           case Le.INPUT_DEF:
            return a.includes(r.DirectiveLocation.INPUT_OBJECT);

           case Le.INPUT_VALUE_DEF:
            switch (null == i ? void 0 : i.kind) {
             case Le.ARGUMENTS_DEF:
              return a.includes(r.DirectiveLocation.ARGUMENT_DEFINITION);

             case Le.INPUT_DEF:
              return a.includes(r.DirectiveLocation.INPUT_FIELD_DEFINITION);
            }
          }
          return !1;
        }(t.prevState, e)));
        return hintList$1(e, o.map((e => ({
          label: e.name,
          documentation: e.description || "",
          kind: ke.Function
        }))));
      }
      return [];
    }(u, l, e);
  }
  return [];
}

var Oe = " {\n  $1\n}";

var getInsertText = e => {
  var {type: t} = e;
  if (r.isCompositeType(t)) {
    return Oe;
  }
  if (r.isListType(t) && r.isCompositeType(t.ofType)) {
    return Oe;
  }
  if (r.isNonNullType(t)) {
    if (r.isCompositeType(t.ofType)) {
      return Oe;
    }
    if (r.isListType(t.ofType) && r.isCompositeType(t.ofType.ofType)) {
      return Oe;
    }
  }
  return null;
};

var getParentDefinition$1 = (e, t) => {
  var n, i, r, a, o, s, c, u, l, d;
  if ((null === (n = e.prevState) || void 0 === n ? void 0 : n.kind) === t) {
    return e.prevState;
  }
  if ((null === (r = null === (i = e.prevState) || void 0 === i ? void 0 : i.prevState) || void 0 === r ? void 0 : r.kind) === t) {
    return e.prevState.prevState;
  }
  if ((null === (s = null === (o = null === (a = e.prevState) || void 0 === a ? void 0 : a.prevState) || void 0 === o ? void 0 : o.prevState) || void 0 === s ? void 0 : s.kind) === t) {
    return e.prevState.prevState.prevState;
  }
  if ((null === (d = null === (l = null === (u = null === (c = e.prevState) || void 0 === c ? void 0 : c.prevState) || void 0 === u ? void 0 : u.prevState) || void 0 === l ? void 0 : l.prevState) || void 0 === d ? void 0 : d.kind) === t) {
    return e.prevState.prevState.prevState.prevState;
  }
};

function getVariableCompletions(e, t, n) {
  var i = null;
  var r;
  var a = Object.create({});
  runOnlineParser$1(e, ((e, o) => {
    if ((null == o ? void 0 : o.kind) === Le.VARIABLE && o.name) {
      i = o.name;
    }
    if ((null == o ? void 0 : o.kind) === Le.NAMED_TYPE && i) {
      var s = getParentDefinition$1(o, Le.TYPE);
      if (null == s ? void 0 : s.type) {
        r = t.getType(null == s ? void 0 : s.type);
      }
    }
    if (i && r && !a[i]) {
      a[i] = {
        detail: r.toString(),
        insertText: "$" === n.string ? i : "$" + i,
        label: i,
        type: r,
        kind: ke.Variable
      };
      i = null;
      r = null;
    }
  }));
  return objectValues(a);
}

function getTokenAtPosition(e, t, n = 0) {
  var i = null;
  var r = null;
  var a = null;
  var o = runOnlineParser$1(e, ((e, o, s, c) => {
    if (c !== t.line || e.getCurrentPosition() + n < t.character + 1) {
      return;
    }
    i = s;
    r = Object.assign({}, o);
    a = e.current();
    return "BREAK";
  }));
  return {
    start: o.start,
    end: o.end,
    string: a || o.string,
    state: r || o.state,
    style: i || o.style
  };
}

function runOnlineParser$1(t, n) {
  var i = t.split("\n");
  var r = e.onlineParser();
  var a = r.startState();
  var o = "";
  var s = new e.CharacterStream("");
  for (var c = 0; c < i.length; c++) {
    s = new e.CharacterStream(i[c]);
    while (!s.eol()) {
      if ("BREAK" === n(s, a, o = r.token(s, a), c)) {
        break;
      }
    }
    n(s, a, o, c);
    if (!a.kind) {
      a = r.startState();
    }
  }
  return {
    start: s.getStartOfToken(),
    end: s.getCurrentPosition(),
    string: s.current(),
    state: a,
    style: o
  };
}

function getTypeInfo(e, t) {
  var n;
  var i;
  var a;
  var o;
  var s;
  var c;
  var u;
  var l;
  var d;
  var f;
  var v;
  forEachState(t, (t => {
    var p;
    switch (t.kind) {
     case Le.QUERY:
     case "ShortQuery":
      f = e.getQueryType();
      break;

     case Le.MUTATION:
      f = e.getMutationType();
      break;

     case Le.SUBSCRIPTION:
      f = e.getSubscriptionType();
      break;

     case Le.INLINE_FRAGMENT:
     case Le.FRAGMENT_DEFINITION:
      if (t.type) {
        f = e.getType(t.type);
      }
      break;

     case Le.FIELD:
     case Le.ALIASED_FIELD:
      if (!f || !t.name) {
        s = null;
      } else {
        s = d ? getFieldDef(e, d, t.name) : null;
        f = s ? s.type : null;
      }
      break;

     case Le.SELECTION_SET:
      d = r.getNamedType(f);
      break;

     case Le.DIRECTIVE:
      a = t.name ? e.getDirective(t.name) : null;
      break;

     case Le.INTERFACE_DEF:
      if (t.name) {
        u = null;
        v = new r.GraphQLInterfaceType({
          name: t.name,
          interfaces: [],
          fields: {}
        });
      }
      break;

     case Le.OBJECT_TYPE_DEF:
      if (t.name) {
        v = null;
        u = new r.GraphQLObjectType({
          name: t.name,
          interfaces: [],
          fields: {}
        });
      }
      break;

     case Le.ARGUMENTS:
      if (t.prevState) {
        switch (t.prevState.kind) {
         case Le.FIELD:
          i = s && s.args;
          break;

         case Le.DIRECTIVE:
          i = a && a.args;
          break;

         case Le.ALIASED_FIELD:
          var g = null === (p = t.prevState) || void 0 === p ? void 0 : p.name;
          if (!g) {
            i = null;
            break;
          }
          var m = d ? getFieldDef(e, d, g) : null;
          if (!m) {
            i = null;
            break;
          }
          i = m.args;
          break;

         default:
          i = null;
        }
      } else {
        i = null;
      }
      break;

     case Le.ARGUMENT:
      if (i) {
        for (var E = 0; E < i.length; E++) {
          if (i[E].name === t.name) {
            n = i[E];
            break;
          }
        }
      }
      c = null == n ? void 0 : n.type;
      break;

     case Le.ENUM_VALUE:
      var h = r.getNamedType(c);
      o = h instanceof r.GraphQLEnumType ? h.getValues().find((e => e.value === t.name)) : null;
      break;

     case Le.LIST_VALUE:
      var T = r.getNullableType(c);
      c = T instanceof r.GraphQLList ? T.ofType : null;
      break;

     case Le.OBJECT_VALUE:
      var y = r.getNamedType(c);
      l = y instanceof r.GraphQLInputObjectType ? y.getFields() : null;
      break;

     case Le.OBJECT_FIELD:
      var I = t.name && l ? l[t.name] : null;
      c = null == I ? void 0 : I.type;
      break;

     case Le.NAMED_TYPE:
      if (t.name) {
        f = e.getType(t.name);
      }
    }
  }));
  return {
    argDef: n,
    argDefs: i,
    directiveDef: a,
    enumValue: o,
    fieldDef: s,
    inputType: c,
    objectFieldDefs: l,
    parentType: d,
    type: f,
    interfaceDef: v,
    objectTypeDef: u
  };
}

var xe;

!function(e) {
  e.TYPE_SYSTEM = "TYPE_SYSTEM";
  e.EXECUTABLE = "EXECUTABLE";
}(xe || (xe = {}));

function unwrapType(e) {
  if (e.prevState && e.kind && [ Le.NAMED_TYPE, Le.LIST_TYPE, Le.TYPE, Le.NON_NULL_TYPE ].includes(e.kind)) {
    return unwrapType(e.prevState);
  }
  return e;
}

function getHoverInformation(e, t, n, i, r) {
  var a = i || getTokenAtPosition(t, n);
  if (!e || !a || !a.state) {
    return "";
  }
  var {kind: o, step: s} = a.state;
  var c = getTypeInfo(e, a.state);
  var u = Object.assign(Object.assign({}, r), {
    schema: e
  });
  if ("Field" === o && 0 === s && c.fieldDef || "AliasedField" === o && 2 === s && c.fieldDef) {
    var l = [];
    renderMdCodeStart(l, u);
    !function renderField(e, t, n) {
      renderQualifiedField(e, t, n);
      renderTypeAnnotation(e, t, n, t.type);
    }(l, c, u);
    renderMdCodeEnd(l, u);
    renderDescription(l, u, c.fieldDef);
    return l.join("").trim();
  }
  if ("Directive" === o && 1 === s && c.directiveDef) {
    var d = [];
    renderMdCodeStart(d, u);
    renderDirective(d, c);
    renderMdCodeEnd(d, u);
    renderDescription(d, u, c.directiveDef);
    return d.join("").trim();
  }
  if ("Argument" === o && 0 === s && c.argDef) {
    var f = [];
    renderMdCodeStart(f, u);
    !function renderArg(e, t, n) {
      if (t.directiveDef) {
        renderDirective(e, t);
      } else if (t.fieldDef) {
        renderQualifiedField(e, t, n);
      }
      if (!t.argDef) {
        return;
      }
      var {name: i} = t.argDef;
      text(e, "(");
      text(e, i);
      renderTypeAnnotation(e, t, n, t.inputType);
      text(e, ")");
    }(f, c, u);
    renderMdCodeEnd(f, u);
    renderDescription(f, u, c.argDef);
    return f.join("").trim();
  }
  if ("EnumValue" === o && c.enumValue && "description" in c.enumValue) {
    var v = [];
    renderMdCodeStart(v, u);
    !function renderEnumValue(e, t, n) {
      if (!t.enumValue) {
        return;
      }
      var {name: i} = t.enumValue;
      renderType(e, t, n, t.inputType);
      text(e, ".");
      text(e, i);
    }(v, c, u);
    renderMdCodeEnd(v, u);
    renderDescription(v, u, c.enumValue);
    return v.join("").trim();
  }
  if ("NamedType" === o && c.type && "description" in c.type) {
    var p = [];
    renderMdCodeStart(p, u);
    renderType(p, c, u, c.type);
    renderMdCodeEnd(p, u);
    renderDescription(p, u, c.type);
    return p.join("").trim();
  }
  return "";
}

function renderMdCodeStart(e, t) {
  if (t.useMarkdown) {
    text(e, "```graphql\n");
  }
}

function renderMdCodeEnd(e, t) {
  if (t.useMarkdown) {
    text(e, "\n```");
  }
}

function renderQualifiedField(e, t, n) {
  if (!t.fieldDef) {
    return;
  }
  var i = t.fieldDef.name;
  if ("__" !== i.slice(0, 2)) {
    renderType(e, t, n, t.parentType);
    text(e, ".");
  }
  text(e, i);
}

function renderDirective(e, t, n) {
  if (!t.directiveDef) {
    return;
  }
  text(e, "@" + t.directiveDef.name);
}

function renderTypeAnnotation(e, t, n, i) {
  text(e, ": ");
  renderType(e, t, n, i);
}

function renderType(e, t, n, i) {
  if (!i) {
    return;
  }
  if (i instanceof r.GraphQLNonNull) {
    renderType(e, t, n, i.ofType);
    text(e, "!");
  } else if (i instanceof r.GraphQLList) {
    text(e, "[");
    renderType(e, t, n, i.ofType);
    text(e, "]");
  } else {
    text(e, i.name);
  }
}

function renderDescription(e, t, n) {
  if (!n) {
    return;
  }
  var i = "string" == typeof n.description ? n.description : null;
  if (i) {
    text(e, "\n\n");
    text(e, i);
  }
  !function renderDeprecation(e, t, n) {
    if (!n) {
      return;
    }
    var i = n.deprecationReason || null;
    if (!i) {
      return;
    }
    text(e, "\n\n");
    text(e, "Deprecated: ");
    text(e, i);
  }(e, 0, n);
}

function text(e, t) {
  e.push(t);
}

class Cursor {
  constructor(e, t) {
    this.line = e;
    this.character = t;
  }
  setLine(e) {
    this.line = e;
  }
  setCharacter(e) {
    this.character = e;
  }
  lessThanOrEqualTo(e) {
    return this.line < e.line || this.line === e.line && this.character <= e.character;
  }
}

var getToken = (t, n) => {
  if (!e.ts.isTemplateLiteral(t) && !e.ts.isStringLiteralLike(t)) {
    return;
  }
  var i = t.getText().slice(1, -1).split("\n");
  var r = e.onlineParser();
  var a = r.startState();
  var o = t.getStart() + 1;
  var s = void 0;
  var c = void 0;
  for (var u = 0; u < i.length; u++) {
    if (s) {
      continue;
    }
    var l = o - 1;
    var d = new e.CharacterStream(i[u] + "\n");
    while (!d.eol()) {
      var f = r.token(d, a);
      var v = d.current();
      if (l + d.getStartOfToken() + 1 <= n && l + d.getCurrentPosition() >= n) {
        s = c ? c : {
          line: u,
          start: d.getStartOfToken() + 1,
          end: d.getCurrentPosition(),
          string: v,
          state: a,
          tokenKind: f
        };
        break;
      } else if ("on" === v) {
        c = {
          line: u,
          start: d.getStartOfToken() + 1,
          end: d.getCurrentPosition(),
          string: v,
          state: a,
          tokenKind: f
        };
      } else if ("." === v || ".." === v) {
        c = {
          line: u,
          start: d.getStartOfToken() + 1,
          end: d.getCurrentPosition(),
          string: v,
          state: a,
          tokenKind: f
        };
      } else {
        c = void 0;
      }
    }
    o += i[u].length + 1;
  }
  return s;
};

function hintList(e, t) {
  return function filterAndSortList(e, t) {
    if (!t) {
      return filterNonEmpty(e, (e => !e.isDeprecated));
    }
    var n = e.map((e => ({
      proximity: getProximity(normalizeText(e.label), t),
      entry: e
    })));
    return filterNonEmpty(filterNonEmpty(n, (e => e.proximity <= 2)), (e => !e.entry.isDeprecated)).sort(((e, t) => (e.entry.isDeprecated ? 1 : 0) - (t.entry.isDeprecated ? 1 : 0) || e.proximity - t.proximity || e.entry.label.length - t.entry.label.length)).map((e => e.entry));
  }(t, normalizeText(e.string));
}

function filterNonEmpty(e, t) {
  var n = e.filter(t);
  return 0 === n.length ? e : n;
}

function normalizeText(e) {
  return e.toLowerCase().replace(/\W/g, "");
}

function getProximity(e, t) {
  var n = function lexicalDistance(e, t) {
    var n;
    var i;
    var r = [];
    var a = e.length;
    var o = t.length;
    for (n = 0; n <= a; n++) {
      r[n] = [ n ];
    }
    for (i = 1; i <= o; i++) {
      r[0][i] = i;
    }
    for (n = 1; n <= a; n++) {
      for (i = 1; i <= o; i++) {
        var s = e[n - 1] === t[i - 1] ? 0 : 1;
        r[n][i] = Math.min(r[n - 1][i] + 1, r[n][i - 1] + 1, r[n - 1][i - 1] + s);
        if (n > 1 && i > 1 && e[n - 1] === t[i - 2] && e[n - 2] === t[i - 1]) {
          r[n][i] = Math.min(r[n][i], r[n - 2][i - 2] + s);
        }
      }
    }
    return r[a][o];
  }(t, e);
  if (e.length > t.length) {
    n -= e.length - t.length - 1;
    n += 0 === e.indexOf(t) ? 0 : .5;
  }
  return n;
}

function getGraphQLCompletions(t, n, i, a) {
  var o = a.config.templateIsCallExpression ?? !0;
  var s = a.languageService.getProgram()?.getTypeChecker();
  var c = e.getSource(a, t);
  if (!c) {
    return;
  }
  var u = e.findNode(c, n);
  if (!u) {
    return;
  }
  u = o ? e.bubbleUpCallExpression(u) : e.bubbleUpTemplate(u);
  var l, d, f;
  if (o && e.isGraphQLCall(u, s)) {
    var v = e.getSchemaName(u, s);
    f = v && i.multi[v] ? i.multi[v]?.schema : i.current?.schema;
    var p = getToken(u.arguments[0], n);
    if (!f || !p || "." === p.string || ".." === p.string) {
      return;
    }
    l = `${u.arguments[0].getText().slice(1, -1)}\n${e.getAllFragments(t, u, a).map((t => e.print(t))).join("\n")}`;
    d = new Cursor(p.line, p.start - 1);
  } else if (!o && e.isGraphQLTag(u)) {
    var g = getToken(u.template, n);
    if (!g || !i.current || "." === g.string || ".." === g.string) {
      return;
    }
    var {combinedText: m, resolvedSpans: E} = e.resolveTemplate(u, t, a);
    var h = E.filter((e => e.original.start < n && e.original.start + e.original.length < n)).reduce(((e, t) => e + (t.lines - 1)), 0);
    g.line = g.line + h;
    l = m;
    d = new Cursor(g.line, g.start - 1);
    f = i.current.schema;
  } else {
    return;
  }
  var [T, y] = function getSuggestionsInternal(e, t, n) {
    var i = getTokenAtPosition(t, n);
    var a = [];
    try {
      a = r.parse(t, {
        noLocation: !0
      }).definitions.filter((e => e.kind === r.Kind.FRAGMENT_DEFINITION));
    } catch (e) {}
    var o = "on" === i.string && "TypeCondition" === i.state.kind;
    var s = getAutocompleteSuggestions(e, t, n, o ? {
      ...i,
      state: {
        ...i.state,
        step: 1
      },
      type: null
    } : void 0);
    var c = !o ? function getSuggestionsForFragmentSpread(e, t, n, i, a) {
      if (!i) {
        return [];
      }
      var o = n.getTypeMap();
      var s = getDefinitionState(e.state);
      return hintList(e, a.filter((e => o[e.typeCondition.name.value] && !(s && s.kind === Le.FRAGMENT_DEFINITION && s.name === e.name.value) && r.isCompositeType(t.parentType) && r.isCompositeType(o[e.typeCondition.name.value]) && r.doTypesOverlap(n, t.parentType, o[e.typeCondition.name.value]))).map((e => ({
        label: e.name.value,
        detail: String(o[e.typeCondition.name.value]),
        documentation: `fragment ${e.name.value} on ${e.typeCondition.name.value}`,
        kind: ke.Field,
        type: o[e.typeCondition.name.value]
      }))));
    }(i, getTypeInfo(e, i.state), e, t, a) : [];
    var u = "Invalid" === i.state.kind ? i.state.prevState : i.state;
    var l = getParentDefinition(i.state, Le.FIELD)?.name;
    if (u && l) {
      var {kind: d} = u;
      if (d === Le.ARGUMENTS || d === Le.ARGUMENT) {
        var f = new Set;
        runOnlineParser(t, ((e, t) => {
          if (t.kind === Le.ARGUMENT) {
            var n = getParentDefinition(t, Le.FIELD);
            if (l && t.name && n?.name === l) {
              f.add(t.name);
            }
          }
        }));
        s = s.filter((e => !f.has(e.label)));
      }
      if (d === Le.SELECTION_SET || d === Le.FIELD || d === Le.ALIASED_FIELD) {
        var v = new Set;
        var p = getUsedFragments(t, l);
        runOnlineParser(t, ((e, t) => {
          if (t.kind === Le.FIELD || t.kind === Le.ALIASED_FIELD) {
            var n = getParentDefinition(t, Le.FIELD);
            if (n && n.name === l && t.name) {
              v.add(t.name);
            }
          }
        }));
        s = s.filter((e => !v.has(e.label)));
        c = c.filter((e => !p.has(e.label)));
      }
      if (d === Le.FRAGMENT_SPREAD) {
        var g = getUsedFragments(t, l);
        s = s.filter((e => !g.has(e.label)));
        c = c.filter((e => !g.has(e.label)));
      }
    }
    return [ s, c ];
  }(f, l, d);
  return {
    isGlobalCompletion: !1,
    isMemberCompletion: !1,
    isNewIdentifierLocation: !1,
    entries: [ ...T.map((t => ({
      ...t,
      kind: e.ts.ScriptElementKind.variableElement,
      name: t.label,
      kindModifiers: "declare",
      sortText: t.sortText || "0",
      labelDetails: {
        detail: t.type ? " " + t.type?.toString() : void 0,
        description: t.documentation
      }
    }))), ...y.map((t => ({
      ...t,
      kind: e.ts.ScriptElementKind.variableElement,
      name: t.label,
      insertText: "..." + t.label,
      kindModifiers: "declare",
      sortText: "0",
      labelDetails: {
        description: t.documentation
      }
    }))) ]
  };
}

function getUsedFragments(e, t) {
  var n = new Set;
  runOnlineParser(e, ((e, i) => {
    if (i.kind === Le.FRAGMENT_SPREAD && i.name) {
      var r = getParentDefinition(i, Le.FIELD);
      if (t && r?.name === t) {
        n.add(i.name);
      }
    }
  }));
  return n;
}

function getParentDefinition(e, t) {
  if (e.prevState?.kind === t) {
    return e.prevState;
  }
  if (e.prevState?.prevState?.kind === t) {
    return e.prevState.prevState;
  }
  if (e.prevState?.prevState?.prevState?.kind === t) {
    return e.prevState.prevState.prevState;
  }
  if (e.prevState?.prevState?.prevState?.prevState?.kind === t) {
    return e.prevState.prevState.prevState.prevState;
  }
}

function runOnlineParser(t, n) {
  var i = t.split("\n");
  var r = e.onlineParser();
  var a = r.startState();
  var o = "";
  var s = new e.CharacterStream("");
  for (var c = 0; c < i.length; c++) {
    s = new e.CharacterStream(i[c]);
    while (!s.eol()) {
      if ("BREAK" === n(s, a, o = r.token(s, a), c)) {
        break;
      }
    }
    n(s, a, o, c);
    if (!a.kind) {
      a = r.startState();
    }
  }
  return {
    start: s.getStartOfToken(),
    end: s.getCurrentPosition(),
    string: s.current(),
    state: a,
    style: o
  };
}

function create(t) {
  var logger = e => t.project.projectService.logger.info(`[GraphQLSP] ${e}`);
  var r = t.config;
  logger("config: " + JSON.stringify(r));
  if (!r.schema && !r.schemas) {
    logger('Missing "schema" option in configuration.');
    throw new Error("Please provide a GraphQL Schema!");
  }
  logger("Setting up the GraphQL Plugin");
  if (r.template) {
    e.templates.add(r.template);
  }
  var a = function createBasicDecorator(e) {
    var t = Object.create(null);
    var _loop = function() {
      var i = e.languageService[n];
      t[n] = (...t) => i.apply(e.languageService, t);
    };
    for (var n of Object.keys(e.languageService)) {
      _loop();
    }
    return t;
  }(t);
  var o = ((e, t, r) => {
    var a = i.loadRef(t);
    (async () => {
      var o = await i.resolveTypeScriptRootDir(e.project.getProjectName()) || n.dirname(e.project.getProjectName());
      var s = e.config.tadaDisablePreprocessing ?? !1;
      var c = e.config.tadaOutputLocation && n.resolve(o, e.config.tadaOutputLocation);
      r("Got root-directory to resolve schema from: " + o);
      r('Resolving schema from "schema" config: ' + JSON.stringify(t));
      try {
        r("Loading schema...");
        await a.load({
          rootPath: o
        });
      } catch (e) {
        r(`Failed to load schema: ${e}`);
      }
      if (a.current) {
        if (a.current && void 0 !== a.current.tadaOutputLocation) {
          saveTadaIntrospection(a.current.introspection, c, s, r);
        }
      } else if (a.multi) {
        Object.values(a.multi).forEach((e => {
          if (!e) {
            return;
          }
          if (e.tadaOutputLocation) {
            saveTadaIntrospection(e.introspection, n.resolve(o, e.tadaOutputLocation), s, r);
          }
        }));
      }
      a.autoupdate({
        rootPath: o
      }, ((e, t) => {
        if (!t) {
          return;
        }
        if (t.tadaOutputLocation) {
          var i = e.multi ? e.multi[t.name] : e.current;
          if (!i) {
            return;
          }
          saveTadaIntrospection(i.introspection, n.resolve(o, t.tadaOutputLocation), s, r);
        }
      }));
    })();
    return a;
  })(t, r, logger);
  a.getSemanticDiagnostics = n => {
    var i = t.languageService.getSemanticDiagnostics(n);
    if (i.some((t => e.ALL_DIAGNOSTICS.includes(t.code)))) {
      return i;
    }
    var r = e.getGraphQLDiagnostics(n, o, t);
    return r ? [ ...r, ...i ] : i;
  };
  a.getCompletionsAtPosition = (e, n, i) => {
    var r = getGraphQLCompletions(e, n, o, t);
    if (r && r.entries.length) {
      return r;
    } else {
      return t.languageService.getCompletionsAtPosition(e, n, i) || {
        isGlobalCompletion: !1,
        isMemberCompletion: !1,
        isNewIdentifierLocation: !1,
        entries: []
      };
    }
  };
  a.getEditsForRefactor = (n, i, r, a, o, s, c) => {
    var u = t.languageService.getEditsForRefactor(n, i, r, a, o, s, c);
    var l = e.getPersistedCodeFixAtPosition(n, "number" == typeof r ? r : r.pos, t);
    if (!l) {
      return u;
    }
    return {
      edits: [ {
        fileName: n,
        textChanges: [ {
          newText: l.replacement,
          span: l.span
        } ]
      } ]
    };
  };
  a.getApplicableRefactors = (n, i, r, a, o, s) => {
    var c = t.languageService.getApplicableRefactors(n, i, r, a, o, s);
    if (e.getPersistedCodeFixAtPosition(n, "number" == typeof i ? i : i.pos, t)) {
      return [ {
        name: "GraphQL",
        description: "Operations specific to gql.tada!",
        actions: [ {
          name: "Insert document-id",
          description: "Generate a document-id for your persisted-operation, by default a SHA256 hash."
        } ],
        inlineable: !0
      }, ...c ];
    } else {
      return c;
    }
  };
  a.getQuickInfoAtPosition = (n, i) => {
    var r = function getGraphQLQuickInfo(t, n, i, r) {
      var a = r.config.templateIsCallExpression ?? !0;
      var o = r.languageService.getProgram()?.getTypeChecker();
      var s = e.getSource(r, t);
      if (!s) {
        return;
      }
      var c = e.findNode(s, n);
      if (!c) {
        return;
      }
      c = a ? e.bubbleUpCallExpression(c) : e.bubbleUpTemplate(c);
      var u, l, d;
      if (a && e.isGraphQLCall(c, o)) {
        var f = r.languageService.getProgram()?.getTypeChecker();
        var v = e.getSchemaName(c, f);
        d = v && i.multi[v] ? i.multi[v]?.schema : i.current?.schema;
        var p = getToken(c.arguments[0], n);
        if (!d || !p) {
          return;
        }
        l = c.arguments[0].getText();
        u = new Cursor(p.line, p.start - 1);
      } else if (!a && e.isGraphQLTag(c)) {
        var g = getToken(c.template, n);
        if (!g || !i.current) {
          return;
        }
        var {combinedText: m, resolvedSpans: E} = e.resolveTemplate(c, t, r);
        var h = E.filter((e => e.original.start < n && e.original.start + e.original.length < n)).reduce(((e, t) => e + (t.lines - 1)), 0);
        g.line = g.line + h;
        l = m;
        u = new Cursor(g.line, g.start - 1);
        d = i.current.schema;
      } else {
        return;
      }
      var T = getHoverInformation(d, l, u);
      return {
        kind: e.ts.ScriptElementKind.label,
        textSpan: {
          start: n,
          length: 1
        },
        kindModifiers: "text",
        documentation: Array.isArray(T) ? T.map((e => ({
          kind: "text",
          text: e
        }))) : [ {
          kind: "text",
          text: T
        } ]
      };
    }(n, i, o, t);
    if (r) {
      return r;
    }
    return t.languageService.getQuickInfoAtPosition(n, i);
  };
  logger("proxy: " + JSON.stringify(a));
  return a;
}

module.exports = t => {
  e.init(t);
  return {
    create
  };
};
//# sourceMappingURL=graphqlsp.js.map
