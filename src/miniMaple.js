function Neg(exp) {
    if (Number.isInteger(exp))
        return -exp;
    else if (exp instanceof Term)
        return new Term(exp.s, -exp.c, exp.p);
}

function Eq(a, b) {
    if (Number.isInteger(a) && Number.isInteger(b))
        return a === b;
    else if (a instanceof Term && b instanceof Term)
        return a.s === b.s && a.c === b.c && a.p === b.p;
    else
        return false;
}

function isNeg(exp) {
    if (Number.isInteger(exp))
        return exp < 0;
    else if (exp instanceof Term)
        return exp.c < 0;
}

class Term {
    constructor(s, c = 1, p = 1) {
        this.s = s;
        this.c = c;
        this.p = p;
    }
    copy() {
        return new Term(this.s, this.c, this.p);
    }
    add(other) {
        return new Add(this.copy(), other);
    }
    sub(other) {
        return new Add(this.copy(), Neg(other));
    }
    mul(other) {
        let n = this.copy();
        n.c *= other;
        return n;
    }
    pow(other) {
        let n = this.copy();
        n.p *= other;
        return n;
    }
    diff() {
        return MiniMaple.diff(this);
    }
}

class Add {
    constructor(lhs, rhs = null) {
        this.lhs = lhs;
        this.rhs = rhs;
    }
}

class MiniMaple {
    static diff(exp) {
        if (Number.isInteger(exp))
            return 0;
        else if (exp instanceof Term)
            return new Term(exp.s, exp.c * exp.p, exp.p - 1);
        else if (exp instanceof Add)
            return exp.diff();
        else
            throw new Error(`invalid argument '${exp}'`)
    }

    /**
     *
     * @param {string} exp
     * @param {boolean} debug
     * @returns {string}
     */
    static toString(exp, debug = false) {
        if (Number.isInteger(exp))
            return `${exp}`;
        else if (exp instanceof Term) {
            let r = '';
            if (exp.c != 1)
                r += `${exp.c}*`;
            r += exp.s;
            if (exp.p != 1)
                r += `^${exp.p}`;
            return r;
        }
        else if (exp instanceof Add) {
            if (debug)
                return `Add(${this.toString(exp.lhs, debug)}, ${this.toString(exp.rhs, debug)})`;
            if (isNeg(exp.rhs))
                return `${this.toString(exp.lhs)} - ${this.toString(Neg(exp.rhs))}`;
            else
                return `${this.toString(exp.lhs)} + ${this.toString(exp.rhs)}`;
        }
    }
}

export { Add }
export { Term as Sym }
export { MiniMaple }
