import { MiniMaple as mm } from "./miniMaple.js";

document.addEventListener('DOMContentLoaded', setup)

function setup() {
    document.getElementById('submit').onclick = ComputeDerivative;
}

function ComputeDerivative() {
    const poly = document.getElementById('poly').value;
    const sym = document.getElementById('sym').value;
    const out = document.getElementById('output');
    const p = mm.parsePoly(poly);
    if (p == null) {
        alert(`Invalid input: '${poly}'`);
        return;
    }
    out.value = mm.toString(p.diff(sym));
}
