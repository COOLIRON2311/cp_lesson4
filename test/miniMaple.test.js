import { Add, MiniMaple, Sym as Term } from "../src/miniMaple";

const mm = MiniMaple;

describe('Term class tests', () => {
    test('constructor', () => {
        const x = new Term('x');
        expect([x.s, x.c, x.p]).toEqual(['x', 1, 1]);
    });

    test('constructor with params', () => {
        const x = new Term('x', 4, 3);
        expect([x.s, x.c, x.p]).toEqual(['x', 4, 3]);
    });

    test('copy method', () => {
        const a = new Term('x');
        const b = a.copy();
        expect(a).toEqual(b);
        expect(a).not.toBe(b);
    });

    test('mul operator', () => {
        let x = new Term('x');
        x = x.mul(3);
        expect(x).toEqual(new Term('x', 3, 1));
    });

    test('pow operator', () => {
        let x = new Term('x');
        x = x.pow(2);
        expect(x).toEqual(new Term('x', 1, 2));
    });

    test('operator chain', () => {
        let x = new Term('x');
        x = x.mul(4).pow(3);
        expect(x).toEqual(new Term('x', 4, 3));
    });

    test('add operator', () => {
        const x = new Term('x', 3, 2);
        expect(x.add(1)).toEqual(new Add(x, 1));
    });

    test('sub operator', () => {
        const x = new Term('x', 3, 2);
        expect(x.sub(1)).toEqual(new Add(x, -1));
    });

    test('toString function', () => {
        const x = new Term('x');
        expect(mm.toString(x)).toEqual('x');
        expect(mm.toString(x.pow(2))).toEqual('x^2');
        expect(mm.toString(x.mul(3))).toEqual('3*x');
        expect(mm.toString(x.mul(3).pow(2))).toEqual('3*x^2');
    });

    test('diff method', () => {
        const x = new Term('x', 4, 3);
        expect(x.diff()).toEqual(new Term('x', 12, 2));
    })
});
