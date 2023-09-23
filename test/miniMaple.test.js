import { Add, MiniMaple, Term } from '../src/miniMaple';

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
        const x = new Term('x');
        expect(x.diff()).toEqual(1);
        expect(x.mul(2).diff()).toEqual(2);
        expect(x.pow(2).diff()).toEqual(new Term('x', 2));
        expect(x.pow(3).diff()).toEqual(new Term('x', 3, 2));
        expect(x.mul(4).pow(3).diff()).toEqual(new Term('x', 12, 2));
    });
});

describe('Add class tests', () => {
    const x = new Term('x');
    test('constructor', () => {
        const a = new Add(1, 2);
        expect([a.lhs, a.rhs]).toEqual([1, 2]);
    });

    test('constructor patch', () => {
        const a = new Add(1);
        expect([a.lhs, a.rhs]).toEqual([1, null]);
    });

    test('add operator', () => {
        const a = new Add(x.pow(2), x);
        expect(a.add(2)).toEqual(new Add(new Add(x.pow(2), x), 2));
    });

    test('add operator patch', () => {
        const a = new Add(1);
        expect(a.add(2)).toEqual(new Add(1, 2));
    });

    test('sub operator', () => {
        const a = new Add(x.pow(2), x);
        expect(a.sub(2)).toEqual(new Add(new Add(x.pow(2), x), -2));
    });

    test('sub operator patch', () => {
        const a = new Add(1);
        expect(a.sub(2)).toEqual(new Add(1, -2));
    });

    test('operator chain', () => {
        expect(x.add(1).sub(2)).toEqual(new Add(new Add(x, 1), -2));
    });

    test('diff method', () => {
        expect(new Add(1, 2).diff()).toEqual(0);
        expect(new Add(2, x).diff()).toEqual(1);
        expect(new Add(x, 2).diff()).toEqual(1);
        expect(new Add(x, x).diff()).toEqual(2);
        expect(new Add(x.pow(2), x).diff()).toEqual(new Add(x.mul(2), 1));
    });

    test('toString function', () => {
        expect(mm.toString(new Add(x, 2))).toEqual('x + 2');
        expect(mm.toString(new Add(x, -2))).toEqual('x - 2');
        expect(mm.toString(new Add(new Add(x.pow(2), x), -2))).toEqual('x^2 + x - 2');
        expect(mm.toString(new Add(new Add(x.pow(2), x), -2), true)).toEqual('Add(Add(x^2, x), -2)');
    });
});

describe('Polynomials parsing tests', () => {
    const x = new Term('x');
    test('empty string', () => {
        expect(mm.parsePoly('')).toBeNull();
    });

    test('single integer term', () => {
        expect(mm.parsePoly('12')).toEqual(12);
        expect(mm.parsePoly('-12')).toEqual(-12);
    });

    test('single symbolic term', () => {
        expect(mm.parsePoly('x')).toEqual(x);
        expect(mm.parsePoly('-x')).toEqual(x.neg());
    });

    test('single symbolic term with coefficient', () => {
        expect(mm.parsePoly('3*x')).toEqual(x.mul(3));
        expect(mm.parsePoly('-3*x')).toEqual(x.mul(-3));
    });

    test('single symbolic term with exponent', () => {
        expect(mm.parsePoly('x^2')).toEqual(x.pow(2));
        expect(mm.parsePoly('-x^2')).toEqual(x.neg().pow(2));
    });

    test('two term polynomial 1', () => {
        expect(mm.parsePoly('x^2 + 1')).toEqual(x.pow(2).add(1));
        expect(mm.parsePoly('x^2 - 1')).toEqual(x.pow(2).sub(1));
    });

    test('two term polynomial 2', () => {
        expect(mm.parsePoly('3*x^2 + 2*x')).toEqual(x.mul(3).pow(2).add(x.mul(2)));
        expect(mm.parsePoly('3*x^2 - 2*x')).toEqual(x.mul(3).pow(2).sub(x.mul(2)));
    });

    test('three term polynomial', () => {
        expect(mm.parsePoly('3*x^2 + 2*x - 2')).toEqual(x.mul(3).pow(2).add(x.mul(2)).sub(2));
        expect(mm.parsePoly('3*x^2 - 2*x + 2')).toEqual(x.mul(3).pow(2).sub(x.mul(2)).add(2));
    });

    test('out of order terms', () => {
        expect(mm.parsePoly('12 + 3*x^2 - 2*x')).toEqual(new Add(12, x.mul(3).pow(2)).sub(x.mul(2)));
    });
});

describe('Differentiation tests', () => {
    test('polynomial 1', () => {
        expect(mm.toString(mm.parsePoly('4*x^3').diff('x'))).toEqual('12*x^2');
    });

    test('polynomial 2', () => {
        expect(mm.toString(mm.parsePoly('4*x^3').diff('y'))).toEqual('0');
    });

    test('polynomial 3', () => {
        expect(mm.toString(mm.parsePoly('4*x^3 - x^2').diff('x'))).toEqual('12*x^2 - 2*x');
    });

    test('two variables function', () => {
        const p = mm.parsePoly('4*x^3 + 3*y');
        expect(mm.toString(p.diff('x'))).toEqual('12*x^2');
        expect(mm.toString(p.diff('y'))).toEqual('3');
    });
});
