const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('/Users/samuelgavarron/Projeto-Budgeting/webapp/src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Converte textos
    content = content.replace(/text-white(\/[0-9]+)?/g, (match, p1) => {
        return `text-(--color-text-main)${p1 || ''}`;
    });

    // Converte bordas transparentes de white para usar a cor do texto principal
    content = content.replace(/border-white(\/[0-9]+)?/g, (match, p1) => {
        if (!p1) return match; // Solido mantém
        return `border-(--color-text-main)${p1}`;
    });

    // Converte fundos transparentes
    content = content.replace(/bg-white(\/[0-9]+)?/g, (match, p1) => {
        if (!p1) return match; // Solido mantém
        return `bg-(--color-text-main)${p1}`;
    });

    // Converte tons de cinza fixos
    content = content.replace(/text-gray-400/g, 'text-(--color-text-muted)');
    content = content.replace(/text-gray-500/g, 'text-(--color-text-muted)');

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedCount++;
        console.log(`[OK] Modificado: ${file}`);
    }
});

console.log(`\n Total de arquivos modificados para multi-theme: ${changedCount}`);
