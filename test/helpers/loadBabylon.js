// Test helper: loads the compiled Babylon.js math module (src/Math/babylon.math.js)
// into a Node.js sandbox so the unit tests can exercise the exact runtime artifact
// that the engine bundles, without requiring a browser or WebGL context.
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var MATH_SOURCE_PATH = path.join(__dirname, "..", "..", "src", "Math", "babylon.math.js");

function loadBabylonMath() {
    var source = fs.readFileSync(MATH_SOURCE_PATH, "utf8");
    var sandbox = {
        console: console,
        Float32Array: Float32Array,
        Math: Math
    };

    sandbox.global = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: "babylon.math.js" });

    if (!sandbox.BABYLON) {
        throw new Error("babylon.math.js did not expose a BABYLON namespace");
    }

    return sandbox.BABYLON;
}

module.exports = {
    loadBabylonMath: loadBabylonMath
};