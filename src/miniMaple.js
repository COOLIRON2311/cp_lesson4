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
    neg() {
        return new Term(this.s, -this.c, this.p);
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
    diff(sym = 'x') {
        if (this.s !== sym)
            return 0;
        if (this.p > 1)
            return new Term(this.s, this.c * this.p, this.p - 1);
        else
            return this.c * this.p;
    }
}

class Add {
    constructor(lhs, rhs = null) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    add(other) {
        if (this.rhs === null) // patch for single term polynomials
            return new Add(this.lhs, other);
        return new Add(this, other);
    }

    sub(other) {
        if (this.rhs === null) // patch for single term polynomials
            return new Add(this.lhs, Neg(other));
        return new Add(this, Neg(other));
    }

    diff(sym = 'x') {
        let lhs = MiniMaple.diff(this.lhs, sym);
        let rhs = MiniMaple.diff(this.rhs, sym);
        if (Number.isInteger(lhs) && Number.isInteger(rhs))
            return lhs + rhs;
        if (Eq(lhs, 0))
            return rhs;
        else if (Eq(rhs, 0))
            return lhs;
        else
            return new Add(lhs, rhs);
    }
}

class MiniMaple {
    /**
     *
     * @param {string} exp
     * @param {string} sym
     * @returns
     */
    static diff(exp, sym = 'x') {
        if (Number.isInteger(exp))
            return 0;
        else if (exp instanceof Term)
            return exp.diff(sym);
        else if (exp instanceof Add)
            return exp.diff(sym);
        else
            throw new Error(`invalid argument '${exp}'`)
    }
    /**
     *
     * @param {string} exp
     * @param {string} sym
     * @returns {Add|Term}
     */
    static parsePoly(exp, sym = 'x') {
        let root = null;
        const matches = exp.replace(/\s/g, '').matchAll(/([+-]?[^-+]+)/g);
        for (const match of matches) {
            let lex = match[0]; // lexeme
            if ((/[a-z]/).test(lex)) // symbolic expression
            {   // sign coefficient * symbol ^ power
                let sign = 1;
                let coefficient = 0;
                let has_coefficient = true;
                let symbol = '';
                let power = 0;
                let has_power = true;

                // sign
                if (lex.at(0) === '+')
                    lex = lex.substring(1);
                else if (lex.at(0) === '-') {
                    sign = -1;
                    lex = lex.substring(1);
                }

                // coefficient
                while (/\d/.test(lex.at(0))) {
                    coefficient = coefficient * 10 + Number.parseInt(lex.at(0));
                    lex = lex.substring(1);
                }

                // mul operator
                if (lex.at(0) === '*')
                    lex = lex.substring(1);
                else
                    has_coefficient = false;

                // symbol
                while (lex !== '' && /[a-z]/.test(lex.at(0))) {
                    symbol += lex.at(0);
                    lex = lex.substring(1);
                }

                // exponentiation operator
                if (lex.at(0) === '^')
                    lex = lex.substring(1);
                else
                    has_power = false;

                // power
                while (/\d/.test(lex.at(0))) {
                    power = power * 10 + Number.parseInt(lex.at(0));
                    lex = lex.substring(1);
                }

                let term = new Term(symbol).mul(has_coefficient ? sign * coefficient : sign).pow(has_power ? power : 1);

                if (root !== null)
                    root = root.add(term);
                else
                    root = term;

            }
            else // integral expression
            {  // sign number
                let sign = 1;
                let number = 0;

                if (lex.at(0) === '+')
                    lex = lex.substring(1);
                else if (lex.at(0) === '-') {
                    sign = -1;
                    lex = lex.substring(1);
                }

                // number
                while (lex !== '' && /\d/.test(lex.at(0))) {
                    number = number * 10 + Number.parseInt(lex.at(0));
                    lex = lex.substring(1);
                }

                if (root !== null)
                    root = root.add(sign * number);
                else
                    root = new Add(sign * number);
            }
            // console.log(match[0]);
        }
        if (root instanceof Add && root.rhs === null) // single integer term
            return root.lhs;
        return root;
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
            let r = new String();
            if (exp.c !== 1)
                r += `${exp.c}*`;
            r += exp.s;
            if (exp.p !== 1)
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
export { Term }
export { MiniMaple }
