// Unit tests for the Babylon.js math module (src/Math/babylon.math.js).
//
// These specs exercise the compiled runtime artifact that the engine bundles,
// asserting real numeric outputs for the Color3/Color4, Vector2/Vector3/Vector4,
// Quaternion, Matrix, Plane, Angle and BezierCurve classes.
"use strict";

var assert = require("assert");
var helper = require("../helpers/loadBabylon.js");

var BABYLON = helper.loadBabylonMath();

function assertVector3Close(actual, expected, epsilon) {
    epsilon = epsilon || 0.000001;
    assert.ok(Math.abs(actual.x - expected.x) <= epsilon, "x: expected " + expected.x + ", got " + actual.x);
    assert.ok(Math.abs(actual.y - expected.y) <= epsilon, "y: expected " + expected.y + ", got " + actual.y);
    assert.ok(Math.abs(actual.z - expected.z) <= epsilon, "z: expected " + expected.z + ", got " + actual.z);
}

function assertVector2Close(actual, expected, epsilon) {
    epsilon = epsilon || 0.000001;
    assert.ok(Math.abs(actual.x - expected.x) <= epsilon, "x: expected " + expected.x + ", got " + actual.x);
    assert.ok(Math.abs(actual.y - expected.y) <= epsilon, "y: expected " + expected.y + ", got " + actual.y);
}

// The math module is executed inside a Node vm sandbox, so the arrays it
// produces (e.g. asArray() results) come from a different JavaScript realm and
// fail assert.deepStrictEqual's prototype check even when the values match.
// toPlainArray normalizes any array-like (Array or Float32Array, any realm)
// into a plain host-realm Array before comparison.
function toPlainArray(value) {
    return Array.prototype.slice.call(value);
}

function assertArrayEqual(actual, expected, message) {
    assert.deepStrictEqual(toPlainArray(actual), toPlainArray(expected), message);
}

describe("MathTools", function () {
    it("WithinEpsilon returns true for values within the epsilon range", function () {
        assert.strictEqual(BABYLON.MathTools.WithinEpsilon(1.0, 1.0001, 0.001), true);
        assert.strictEqual(BABYLON.MathTools.WithinEpsilon(1.0, 1.0, 0.001), true);
    });

    it("WithinEpsilon returns false for values outside the epsilon range", function () {
        assert.strictEqual(BABYLON.MathTools.WithinEpsilon(1.0, 1.1, 0.001), false);
    });

    it("ToHex pads single digit values with a leading zero", function () {
        assert.strictEqual(BABYLON.MathTools.ToHex(15), "0F");
        assert.strictEqual(BABYLON.MathTools.ToHex(255), "FF");
        assert.strictEqual(BABYLON.MathTools.ToHex(0), "00");
    });

    it("Sign returns -1, 0 or 1 depending on the value", function () {
        assert.strictEqual(BABYLON.MathTools.Sign(-5), -1);
        assert.strictEqual(BABYLON.MathTools.Sign(0), 0);
        assert.strictEqual(BABYLON.MathTools.Sign(5), 1);
    });

    it("Clamp constrains a value between min and max", function () {
        assert.strictEqual(BABYLON.MathTools.Clamp(5, 0, 1), 1);
        assert.strictEqual(BABYLON.MathTools.Clamp(-5, 0, 1), 0);
        assert.strictEqual(BABYLON.MathTools.Clamp(0.5, 0, 1), 0.5);
    });
});

describe("Color3", function () {
    it("defaults to black", function () {
        var color = new BABYLON.Color3();
        assert.strictEqual(color.r, 0);
        assert.strictEqual(color.g, 0);
        assert.strictEqual(color.b, 0);
    });

    it("toString formats the components", function () {
        assert.strictEqual(new BABYLON.Color3(1, 0.5, 0).toString(), "{R: 1 G:0.5 B:0}");
    });

    it("toArray writes components at the given index", function () {
        var array = [9, 9, 9, 9];
        new BABYLON.Color3(1, 2, 3).toArray(array, 1);
        assertArrayEqual(array, [9, 1, 2, 3]);
    });

    it("asArray returns the components", function () {
        assertArrayEqual(new BABYLON.Color3(1, 2, 3).asArray(), [1, 2, 3]);
    });

    it("toColor4 appends the given alpha", function () {
        var color4 = new BABYLON.Color3(1, 0.5, 0).toColor4(0.25);
        assert.strictEqual(color4.r, 1);
        assert.strictEqual(color4.g, 0.5);
        assert.strictEqual(color4.b, 0);
        assert.strictEqual(color4.a, 0.25);
    });

    it("toLuminance applies the standard luminance weights", function () {
        assert.strictEqual(new BABYLON.Color3(1, 0.5, 0).toLuminance(), 0.595);
    });

    it("multiply performs a component-wise product", function () {
        var result = new BABYLON.Color3(1, 0.5, 0.25).multiply(new BABYLON.Color3(2, 2, 2));
        assertArrayEqual(result.asArray(), [2, 1, 0.5]);
    });

    it("multiplyToRef writes into the provided result", function () {
        var result = new BABYLON.Color3();
        new BABYLON.Color3(1, 2, 3).multiplyToRef(new BABYLON.Color3(2, 3, 4), result);
        assertArrayEqual(result.asArray(), [2, 6, 12]);
    });

    it("equals compares component values", function () {
        assert.strictEqual(new BABYLON.Color3(1, 2, 3).equals(new BABYLON.Color3(1, 2, 3)), true);
        assert.strictEqual(new BABYLON.Color3(1, 2, 3).equals(new BABYLON.Color3(1, 2, 4)), false);
    });

    it("scale multiplies every component", function () {
        assertArrayEqual(new BABYLON.Color3(1, 2, 3).scale(0.5).asArray(), [0.5, 1, 1.5]);
    });

    it("add and subtract combine components", function () {
        var a = new BABYLON.Color3(1, 2, 3);
        var b = new BABYLON.Color3(4, 5, 6);
        assertArrayEqual(a.add(b).asArray(), [5, 7, 9]);
        assertArrayEqual(b.subtract(a).asArray(), [3, 3, 3]);
    });

    it("clone and copyFrom duplicate values", function () {
        var original = new BABYLON.Color3(0.1, 0.2, 0.3);
        assertArrayEqual(original.clone().asArray(), original.asArray());
        var copy = new BABYLON.Color3();
        copy.copyFrom(original);
        assertArrayEqual(copy.asArray(), original.asArray());
    });

    it("toHexString produces an RRGGBB hex string", function () {
        assert.strictEqual(new BABYLON.Color3(1, 0, 0).toHexString(), "#FF0000");
        assert.strictEqual(new BABYLON.Color3(0.5, 0.5, 0.5).toHexString(), "#7F7F7F");
    });

    it("FromHexString parses a #RRGGBB string", function () {
        var color = BABYLON.Color3.FromHexString("#FF8000");
        assert.strictEqual(color.r, 1);
        assert.strictEqual(color.g, 128 / 255);
        assert.strictEqual(color.b, 0);
    });

    it("FromHexString returns black for malformed input", function () {
        var color = BABYLON.Color3.FromHexString("FF0000");
        assertArrayEqual(color.asArray(), [0, 0, 0]);
    });

    it("FromInts converts 0-255 ints to 0-1 floats", function () {
        var color = BABYLON.Color3.FromInts(255, 128, 0);
        assert.strictEqual(color.r, 1);
        assert.strictEqual(color.g, 128 / 255);
        assert.strictEqual(color.b, 0);
    });

    it("FromArray reads components at the given offset", function () {
        var color = BABYLON.Color3.FromArray([9, 1, 2, 3], 1);
        assertArrayEqual(color.asArray(), [1, 2, 3]);
    });

    it("Lerp interpolates between two colors", function () {
        var result = BABYLON.Color3.Lerp(BABYLON.Color3.Black(), BABYLON.Color3.White(), 0.5);
        assertArrayEqual(result.asArray(), [0.5, 0.5, 0.5]);
    });

    it("provides the standard named colors", function () {
        assertArrayEqual(BABYLON.Color3.Red().asArray(), [1, 0, 0]);
        assertArrayEqual(BABYLON.Color3.Green().asArray(), [0, 1, 0]);
        assertArrayEqual(BABYLON.Color3.Blue().asArray(), [0, 0, 1]);
        assertArrayEqual(BABYLON.Color3.Black().asArray(), [0, 0, 0]);
        assertArrayEqual(BABYLON.Color3.White().asArray(), [1, 1, 1]);
    });

    it("toLinearSpace and toGammaSpace round-trip", function () {
        var color = new BABYLON.Color3(0.5, 0.5, 0.5);
        var linear = color.toLinearSpace();
        var gamma = linear.toGammaSpace();
        assert.ok(Math.abs(gamma.r - 0.5) < 0.001, "expected ~0.5, got " + gamma.r);
    });
});

describe("Color4", function () {
    it("add combines all four components", function () {
        var result = new BABYLON.Color4(1, 2, 3, 4).add(new BABYLON.Color4(1, 1, 1, 1));
        assertArrayEqual(result.asArray(), [2, 3, 4, 5]);
    });

    it("addInPlace mutates and returns this", function () {
        var color = new BABYLON.Color4(1, 2, 3, 4);
        var returned = color.addInPlace(new BABYLON.Color4(1, 1, 1, 1));
        assert.strictEqual(returned, color);
        assertArrayEqual(color.asArray(), [2, 3, 4, 5]);
    });

    it("subtract and scale combine components", function () {
        var a = new BABYLON.Color4(4, 4, 4, 4);
        var b = new BABYLON.Color4(1, 2, 3, 4);
        assertArrayEqual(a.subtract(b).asArray(), [3, 2, 1, 0]);
        assertArrayEqual(a.scale(0.5).asArray(), [2, 2, 2, 2]);
    });

    it("toHexString produces an RRGGBBAA hex string", function () {
        assert.strictEqual(new BABYLON.Color4(1, 0, 0, 1).toHexString(), "#FF0000FF");
    });

    it("FromHexString parses a #RRGGBBAA string", function () {
        var color = BABYLON.Color4.FromHexString("#FF0000FF");
        assert.strictEqual(color.r, 1);
        assert.strictEqual(color.g, 0);
        assert.strictEqual(color.b, 0);
        assert.strictEqual(color.a, 1);
    });

    it("FromInts converts 0-255 ints to 0-1 floats", function () {
        var color = BABYLON.Color4.FromInts(255, 0, 0, 128);
        assert.strictEqual(color.r, 1);
        assert.strictEqual(color.a, 128 / 255);
    });

    it("Lerp interpolates between two colors", function () {
        var result = BABYLON.Color4.Lerp(new BABYLON.Color4(0, 0, 0, 0), new BABYLON.Color4(1, 1, 1, 1), 0.25);
        assertArrayEqual(result.asArray(), [0.25, 0.25, 0.25, 0.25]);
    });

    it("CheckColors4 expands RGB triplets to RGBA quads", function () {
        var colors = BABYLON.Color4.CheckColors4([1, 0, 0, 0, 1, 0], 2);
        assertArrayEqual(colors, [1, 0, 0, 1, 0, 1, 0, 1]);
    });
});

describe("Vector2", function () {
    it("add, subtract, multiply and divide combine components", function () {
        var a = new BABYLON.Vector2(3, 4);
        var b = new BABYLON.Vector2(1, 2);
        assertArrayEqual(a.add(b).asArray(), [4, 6]);
        assertArrayEqual(a.subtract(b).asArray(), [2, 2]);
        assertArrayEqual(a.multiply(b).asArray(), [3, 8]);
        assertArrayEqual(a.divide(b).asArray(), [3, 2]);
    });

    it("length and lengthSquared compute magnitudes", function () {
        var v = new BABYLON.Vector2(3, 4);
        assert.strictEqual(v.length(), 5);
        assert.strictEqual(v.lengthSquared(), 25);
    });

    it("normalize produces a unit vector", function () {
        var v = new BABYLON.Vector2(3, 4).normalize();
        assertVector2Close(v, new BABYLON.Vector2(0.6, 0.8));
    });

    it("Dot computes the scalar product", function () {
        assert.strictEqual(BABYLON.Vector2.Dot(new BABYLON.Vector2(1, 2), new BABYLON.Vector2(3, 4)), 11);
    });

    it("Distance and DistanceSquared compute separations", function () {
        assert.strictEqual(BABYLON.Vector2.Distance(new BABYLON.Vector2(0, 0), new BABYLON.Vector2(3, 4)), 5);
        assert.strictEqual(BABYLON.Vector2.DistanceSquared(new BABYLON.Vector2(0, 0), new BABYLON.Vector2(3, 4)), 25);
    });

    it("Lerp interpolates between two vectors", function () {
        var result = BABYLON.Vector2.Lerp(new BABYLON.Vector2(0, 0), new BABYLON.Vector2(10, 10), 0.5);
        assertArrayEqual(result.asArray(), [5, 5]);
    });

    it("Zero and FromArray construct vectors", function () {
        assertArrayEqual(BABYLON.Vector2.Zero().asArray(), [0, 0]);
        assertArrayEqual(BABYLON.Vector2.FromArray([1, 2, 3], 1).asArray(), [2, 3]);
    });

    it("CatmullRom with identical control points returns that point", function () {
        var p = new BABYLON.Vector2(1, 1);
        var result = BABYLON.Vector2.CatmullRom(p, p, p, p, 0.5);
        assertVector2Close(result, p);
    });
});

describe("Vector3", function () {
    it("add, subtract and scale combine components", function () {
        var a = new BABYLON.Vector3(1, 2, 3);
        var b = new BABYLON.Vector3(4, 5, 6);
        assertArrayEqual(a.add(b).asArray(), [5, 7, 9]);
        assertArrayEqual(b.subtract(a).asArray(), [3, 3, 3]);
        assertArrayEqual(a.scale(2).asArray(), [2, 4, 6]);
    });

    it("length and lengthSquared compute magnitudes", function () {
        var v = new BABYLON.Vector3(1, 2, 3);
        assert.strictEqual(v.lengthSquared(), 14);
        assert.ok(Math.abs(v.length() - Math.sqrt(14)) < 0.000001);
    });

    it("normalize produces a unit vector", function () {
        var v = new BABYLON.Vector3(3, 4, 0).normalize();
        assertVector3Close(v, new BABYLON.Vector3(0.6, 0.8, 0));
    });

    it("Dot computes the scalar product", function () {
        assert.strictEqual(BABYLON.Vector3.Dot(new BABYLON.Vector3(1, 2, 3), new BABYLON.Vector3(4, 5, 6)), 32);
    });

    it("Cross computes the vector product", function () {
        var result = BABYLON.Vector3.Cross(new BABYLON.Vector3(1, 0, 0), new BABYLON.Vector3(0, 1, 0));
        assertVector3Close(result, new BABYLON.Vector3(0, 0, 1));
    });

    it("Distance and DistanceSquared compute separations", function () {
        assert.strictEqual(BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(3, 4, 0)), 5);
        assert.strictEqual(BABYLON.Vector3.DistanceSquared(new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 2, 2)), 9);
    });

    it("Lerp interpolates between two vectors", function () {
        var result = BABYLON.Vector3.Lerp(new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(2, 4, 6), 0.5);
        assertArrayEqual(result.asArray(), [1, 2, 3]);
    });

    it("Center computes the midpoint", function () {
        var result = BABYLON.Vector3.Center(new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(2, 4, 6));
        assertArrayEqual(result.asArray(), [1, 2, 3]);
    });

    it("Minimize and Maximize clamp per component", function () {
        var a = new BABYLON.Vector3(1, 5, 3);
        var b = new BABYLON.Vector3(2, 4, 6);
        assertArrayEqual(BABYLON.Vector3.Minimize(a, b).asArray(), [1, 4, 3]);
        assertArrayEqual(BABYLON.Vector3.Maximize(a, b).asArray(), [2, 5, 6]);
    });

    it("Zero and Up return the canonical vectors", function () {
        assertArrayEqual(BABYLON.Vector3.Zero().asArray(), [0, 0, 0]);
        assertArrayEqual(BABYLON.Vector3.Up().asArray(), [0, 1, 0]);
    });

    it("FromArray reads components at the given offset", function () {
        var v = BABYLON.Vector3.FromArray([9, 1, 2, 3], 1);
        assertArrayEqual(v.asArray(), [1, 2, 3]);
    });

    it("equals and equalsWithEpsilon compare vectors", function () {
        var a = new BABYLON.Vector3(1, 2, 3);
        assert.strictEqual(a.equals(new BABYLON.Vector3(1, 2, 3)), true);
        assert.strictEqual(a.equals(new BABYLON.Vector3(1, 2, 4)), false);
        assert.strictEqual(a.equalsWithEpsilon(new BABYLON.Vector3(1.0001, 2, 3), 0.001), true);
    });

    it("TransformCoordinates applies translation", function () {
        var result = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(1, 0, 0), BABYLON.Matrix.Translation(1, 2, 3));
        assertVector3Close(result, new BABYLON.Vector3(2, 2, 3));
    });

    it("TransformNormal applies rotation without translation", function () {
        var result = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(1, 0, 0), BABYLON.Matrix.Scaling(2, 3, 4));
        assertVector3Close(result, new BABYLON.Vector3(2, 0, 0));
    });

    it("CatmullRom with identical control points returns that point", function () {
        var p = new BABYLON.Vector3(1, 1, 1);
        var result = BABYLON.Vector3.CatmullRom(p, p, p, p, 0.5);
        assertVector3Close(result, p);
    });
});

describe("Vector4", function () {
    it("add, subtract and scale combine components", function () {
        var a = new BABYLON.Vector4(1, 2, 3, 4);
        var b = new BABYLON.Vector4(4, 5, 6, 7);
        assertArrayEqual(a.add(b).asArray(), [5, 7, 9, 11]);
        assertArrayEqual(b.subtract(a).asArray(), [3, 3, 3, 3]);
        assertArrayEqual(a.scale(2).asArray(), [2, 4, 6, 8]);
    });

    it("length computes the magnitude", function () {
        var v = new BABYLON.Vector4(1, 2, 3, 4);
        assert.ok(Math.abs(v.length() - Math.sqrt(30)) < 0.000001);
    });

    it("FromArray and Normalize construct and normalize vectors", function () {
        var v = BABYLON.Vector4.FromArray([3, 4, 0, 0]);
        assertArrayEqual(v.asArray(), [3, 4, 0, 0]);
        var normalized = BABYLON.Vector4.Normalize(v);
        assert.ok(Math.abs(normalized.length() - 1) < 0.000001);
    });
});

describe("Quaternion", function () {
    it("Identity is the multiplicative identity", function () {
        var q = new BABYLON.Quaternion(1, 2, 3, 4);
        var result = q.multiply(BABYLON.Quaternion.Identity());
        assertArrayEqual(result.asArray(), q.asArray());
    });

    it("multiply composes rotations", function () {
        var q = new BABYLON.Quaternion(1, 0, 0, 0);
        var result = q.multiply(new BABYLON.Quaternion(0, 1, 0, 0));
        assertArrayEqual(result.asArray(), [0, 0, 1, 0]);
    });

    it("conjugate negates the vector part", function () {
        var result = new BABYLON.Quaternion(1, 2, 3, 4).conjugate();
        assertArrayEqual(result.asArray(), [-1, -2, -3, 4]);
    });

    it("length and normalize behave correctly", function () {
        var q = new BABYLON.Quaternion(1, 2, 3, 4);
        assert.ok(Math.abs(q.length() - Math.sqrt(30)) < 0.000001);
        var normalized = q.normalize();
        assert.ok(Math.abs(normalized.length() - 1) < 0.000001);
    });

    it("RotationYawPitchRoll with zero angles is identity", function () {
        var q = BABYLON.Quaternion.RotationYawPitchRoll(0, 0, 0);
        assertArrayEqual(q.asArray(), [0, 0, 0, 1]);
    });

    it("RotationYawPitchRoll with a yaw of PI/2 produces the expected quaternion", function () {
        var q = BABYLON.Quaternion.RotationYawPitchRoll(Math.PI / 2, 0, 0);
        var half = Math.sin(Math.PI / 4);
        assert.ok(Math.abs(q.x - 0) < 0.000001);
        assert.ok(Math.abs(q.y - half) < 0.000001);
        assert.ok(Math.abs(q.z - 0) < 0.000001);
        assert.ok(Math.abs(q.w - half) < 0.000001);
    });

    it("Slerp of a quaternion with itself returns the same quaternion", function () {
        var q = BABYLON.Quaternion.RotationYawPitchRoll(0.5, 0.25, 0.1);
        var result = BABYLON.Quaternion.Slerp(q, q, 0.5);
        assertArrayEqual(result.asArray(), q.asArray());
    });
});

describe("Matrix", function () {
    it("Identity is the identity matrix", function () {
        var identity = BABYLON.Matrix.Identity();
        assert.strictEqual(identity.isIdentity(), true);
        assert.strictEqual(identity.determinant(), 1);
    });

    it("FromValues and equals round-trip values", function () {
        var matrix = BABYLON.Matrix.FromValues(
            1, 2, 3, 4,
            5, 6, 7, 8,
            9, 10, 11, 12,
            13, 14, 15, 16);
        var clone = matrix.clone();
        assert.strictEqual(matrix.equals(clone), true);
        assert.strictEqual(matrix.m[0], 1);
        assert.strictEqual(matrix.m[15], 16);
    });

    it("multiply composes transformations", function () {
        var a = BABYLON.Matrix.Translation(1, 0, 0);
        var b = BABYLON.Matrix.Translation(0, 2, 0);
        var result = a.multiply(b);
        assert.strictEqual(result.m[12], 1);
        assert.strictEqual(result.m[13], 2);
    });

    it("invert of a translation is the opposite translation", function () {
        var result = BABYLON.Matrix.Translation(1, 2, 3).invert();
        var translation = result.getTranslation();
        assertVector3Close(translation, new BABYLON.Vector3(-1, -2, -3));
    });

    it("RotationX rotates around the X axis", function () {
        var matrix = BABYLON.Matrix.RotationX(Math.PI / 2);
        assert.ok(Math.abs(matrix.m[5] - 0) < 0.000001);
        assert.ok(Math.abs(matrix.m[6] - 1) < 0.000001);
        var rotated = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 1, 0), matrix);
        assertVector3Close(rotated, new BABYLON.Vector3(0, 0, 1));
    });

    it("RotationY rotates around the Y axis", function () {
        var matrix = BABYLON.Matrix.RotationY(Math.PI / 2);
        var rotated = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(1, 0, 0), matrix);
        assertVector3Close(rotated, new BABYLON.Vector3(0, 0, -1));
    });

    it("RotationZ rotates around the Z axis", function () {
        var matrix = BABYLON.Matrix.RotationZ(Math.PI / 2);
        var rotated = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(1, 0, 0), matrix);
        assertVector3Close(rotated, new BABYLON.Vector3(0, 1, 0));
    });

    it("Scaling scales and its determinant is the volume factor", function () {
        var matrix = BABYLON.Matrix.Scaling(2, 3, 4);
        assert.strictEqual(matrix.determinant(), 24);
        var scaled = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(1, 1, 1), matrix);
        assertVector3Close(scaled, new BABYLON.Vector3(2, 3, 4));
    });

    it("Translation stores the translation vector", function () {
        var matrix = BABYLON.Matrix.Translation(1, 2, 3);
        assertVector3Close(matrix.getTranslation(), new BABYLON.Vector3(1, 2, 3));
    });

    it("FromArray reads 16 values", function () {
        var values = [];
        for (var i = 0; i < 16; i++) {
            values.push(i + 1);
        }
        var matrix = BABYLON.Matrix.FromArray(values);
        assert.strictEqual(matrix.m[0], 1);
        assert.strictEqual(matrix.m[15], 16);
    });

    it("decompose extracts scale, rotation and translation", function () {
        var matrix = BABYLON.Matrix.Scaling(2, 3, 4).multiply(BABYLON.Matrix.Translation(5, 6, 7));
        var scale = new BABYLON.Vector3();
        var rotation = new BABYLON.Quaternion();
        var translation = new BABYLON.Vector3();
        var result = matrix.decompose(scale, rotation, translation);
        assert.strictEqual(result, true);
        assertVector3Close(scale, new BABYLON.Vector3(2, 3, 4));
        assertVector3Close(translation, new BABYLON.Vector3(5, 6, 7));
        assert.ok(Math.abs(rotation.length() - 1) < 0.000001);
    });

    it("getRow returns the requested row", function () {
        var row = BABYLON.Matrix.Identity().getRow(0);
        assertArrayEqual(row.asArray(), [1, 0, 0, 0]);
    });

    it("Transpose swaps rows and columns", function () {
        var matrix = BABYLON.Matrix.Translation(1, 2, 3);
        var transposed = BABYLON.Matrix.Transpose(matrix);
        assert.strictEqual(transposed.m[3], 1);
        assert.strictEqual(transposed.m[7], 2);
        assert.strictEqual(transposed.m[11], 3);
    });
});

describe("Plane", function () {
    it("FromPositionAndNormal builds a plane through the origin", function () {
        var plane = BABYLON.Plane.FromPositionAndNormal(new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 1, 0));
        assertVector3Close(plane.normal, new BABYLON.Vector3(0, 1, 0));
        assert.ok(Math.abs(plane.d) < 0.000001, "expected d ~ 0, got " + plane.d);
        assert.strictEqual(plane.signedDistanceTo(new BABYLON.Vector3(0, 5, 0)), 5);
    });

    it("FromPoints builds a plane from three points", function () {
        var plane = BABYLON.Plane.FromPoints(
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(1, 0, 0),
            new BABYLON.Vector3(0, 1, 0));
        assertVector3Close(plane.normal, new BABYLON.Vector3(0, 0, 1));
        assert.ok(Math.abs(plane.d) < 0.000001, "expected d ~ 0, got " + plane.d);
    });

    it("normalize produces a unit normal", function () {
        var plane = new BABYLON.Plane(0, 2, 0, 4).normalize();
        assertVector3Close(plane.normal, new BABYLON.Vector3(0, 1, 0));
        assert.strictEqual(plane.d, 2);
    });
});

describe("Angle and BezierCurve", function () {
    it("Angle converts between radians and degrees", function () {
        assert.ok(Math.abs(BABYLON.Angle.FromDegrees(90).radians() - Math.PI / 2) < 0.000001);
        assert.ok(Math.abs(BABYLON.Angle.FromRadians(Math.PI).degrees() - 180) < 0.000001);
    });

    it("Angle.BetweenTwoPoints measures the angle of a segment", function () {
        var angle = BABYLON.Angle.BetweenTwoPoints(new BABYLON.Vector2(0, 0), new BABYLON.Vector2(1, 0));
        assert.ok(Math.abs(angle.radians() - 0) < 0.000001);
    });

    it("BezierCurve.interpolate follows a linear bezier", function () {
        var value = BABYLON.BezierCurve.interpolate(0.5, 0, 0, 1, 1);
        assert.ok(Math.abs(value - 0.5) < 0.000001);
    });
});

describe("Tmp pre-allocated objects", function () {
    it("provides pre-allocated temp vectors", function () {
        assert.strictEqual(BABYLON.Tmp.Vector3.length, 9);
        assert.strictEqual(BABYLON.Tmp.Vector2.length, 3);
        assert.strictEqual(BABYLON.Tmp.Color3.length, 3);
        assert.strictEqual(BABYLON.Tmp.Matrix.length, 8);
    });
});