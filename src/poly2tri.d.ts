// Ambient declaration for the poly2tri (Poly2Tri) global library.
//
// poly2tri is loaded at runtime as a plain <script> global (see the runtime
// guard in babylon.polygonMesh.ts), so it is declared here as a global
// namespace instead of being imported as a module. Only the surface used by
// Babylon.js is declared.
declare namespace poly2tri {
    interface Point {
        x: number;
        y: number;
    }

    class SweepContext {
        constructor(contour: Point[]);
        addHole(polyline: Point[]): SweepContext;
        triangulate(): SweepContext;
        getTriangles(): Triangle[];
    }

    class Triangle {
        getPoints(): Point[];
    }
}