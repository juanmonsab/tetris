const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(30, 30);

const tablero = crearTablero(10, 20);
const colores = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const figura = {
    posicion: { x: 0, y: 0 },
    matriz: null,
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        moverFigura(-1);
    } else if (event.key === 'ArrowRight') {
        moverFigura(1);
    } else if (event.key === 'ArrowUp') {
        rotarFigura(1);
    }
});

document.getElementById('left').addEventListener('click', () => {
    moverFigura(-1);
});

document.getElementById('right').addEventListener('click', () => {
    moverFigura(1);
});

document.getElementById('rotate').addEventListener('click', () => {
    rotarFigura(1);
});

let contadorCaida = 0;
let intervaloCaida = 200;
let lineasBorradas = 0;
let ultimoTiempo = 0;

function actualizar(tiempo = 0) {
    const deltaTiempo = tiempo - ultimoTiempo;
    ultimoTiempo = tiempo;

    contadorCaida += deltaTiempo;
    if (contadorCaida > intervaloCaida) {
        bajarFigura();
    }

    dibujar();
    requestAnimationFrame(actualizar);
}

function borrarLineas() {
    let multiplicador = 1;
    outer: for (let y = tablero.length - 1; y > 0; --y) {
        for (let x = 0; x < tablero[y].length; ++x) {
            if (tablero[y][x] === 0) {
                continue outer;
            }
        }

        const fila = tablero.splice(y, 1)[0].fill(0);
        tablero.unshift(fila);
        ++y;

        lineasBorradas++;
        multiplicador *= 2;
    }
}

function detectarColision(tablero, figura) {
    const [matriz, posicion] = [figura.matriz, figura.posicion];
    for (let y = 0; y < matriz.length; ++y) {
        for (let x = 0; x < matriz[y].length; ++x) {
            if (matriz[y][x] !== 0 &&
                (tablero[y + posicion.y] &&
                    tablero[y + posicion.y][x + posicion.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function crearTablero(ancho, alto) {
    const tablero = [];
    while (alto--) {
        tablero.push(new Array(ancho).fill(0));
    }
    return tablero;
}

function crearFigura(tipo) {
    switch (tipo) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        case 'O':
            return [
                [2, 2],
                [2, 2],
            ];
        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        case 'J':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        case 'I':
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
    }
}

function dibujarFigura(matriz, offset) {
    matriz.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor !== 0) {
                context.fillStyle = colores[valor];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function dibujar() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    dibujarFigura(tablero, { x: 0, y: 0 });
    dibujarFigura(figura.matriz, figura.posicion);
}

function unirFigura(tablero, figura) {
    figura.matriz.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor !== 0) {
                tablero[y + figura.posicion.y][x + figura.posicion.x] = valor;
            }
        });
    });
}

function bajarFigura() {
    figura.posicion.y++;
    if (detectarColision(tablero, figura)) {
        figura.posicion.y--;
        unirFigura(tablero, figura);
        reiniciarFigura();
        borrarLineas();
    }
    contadorCaida = 0;
}

function moverFigura(direccion) {
    figura.posicion.x += direccion;
    if (detectarColision(tablero, figura)) {
        figura.posicion.x -= direccion;
    }
}

function reiniciarFigura() {
    const piezas = 'ILJOTSZ';
    figura.matriz = crearFigura(piezas[piezas.length * Math.random() | 0]);
    figura.posicion.y = 0;
    figura.posicion.x = (tablero[0].length / 2 | 0) - (figura.matriz[0].length / 2 | 0);
    if (detectarColision(tablero, figura)) {
        tablero.forEach(fila => fila.fill(0));
        lineasBorradas = 0;
        intervaloCaida = 500;
    }
}

function rotarFigura(direccion) {
    const posicionInicial = figura.posicion.x;
    let desplazamiento = 1;
    rotarMatriz(figura.matriz, direccion);
    while (detectarColision(tablero, figura)) {
        figura.posicion.x += desplazamiento;
        desplazamiento = -(desplazamiento + (desplazamiento > 0 ? 1 : -1));
        if (desplazamiento > figura.matriz[0].length) {
            rotarMatriz(figura.matriz, -direccion);
            figura.posicion.x = posicionInicial;
            return;
        }
    }
}

function rotarMatriz(matriz, direccion) {
    for (let y = 0; y < matriz.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matriz[x][y], matriz[y][x]] = [matriz[y][x], matriz[x][y]];
        }
    }
    if (direccion > 0) {
        matriz.forEach(fila => fila.reverse());
    } else {
        matriz.reverse();
    }
}

reiniciarFigura();
actualizar();
