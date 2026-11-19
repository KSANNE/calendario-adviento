# Calendario de adviento

PWA con un calendario de adviento para Alba: cuenta atrás hasta el 1 de diciembre y, del 1 al 24, una puerta
nueva cada día (hora de España). Solo se pueden abrir el día de hoy y los anteriores.

## Cómo se protege el contenido

El repositorio podrá ser público sin que se vean ni la contraseña ni las sorpresas:

- Las sorpresas se escriben en `contenido/sorpresas.json`, que está en `.gitignore` y **nunca se sube**.
- `npm run encrypt` las cifra en tu PC (PBKDF2-SHA256 con 600 000 iteraciones + AES-GCM de 256 bits) y escribe
  `public/calendario.enc.json`, que es lo único que se publica.
- En el navegador, la clave se saca del usuario y la contraseña que escribe Alba. Si no descifran, no entra.
  No hay contraseña ni hash guardados en ningún sitio.
- Una vez dentro, la clave (no la contraseña) se recuerda en su dispositivo para no pedirla cada día.

Límites conocidos: la fecha es la del dispositivo (quien sepa la contraseña y cambie el reloj podría adelantarse) y
una contraseña corta se puede atacar a fuerza bruta contra el archivo cifrado; cuanto más larga, mejor.

## Uso

```sh
npm install
cp contenido/sorpresas.example.json contenido/sorpresas.json   # y rellénalo
npm run encrypt    # pide usuario y contraseña
npm run dev        # http://localhost:5181
```

En desarrollo se puede simular otra fecha con `?fecha=2026-12-05` o `?fecha=2026-11-30T23:59`
(solo funciona con `npm run dev`, nunca en la versión publicada).

Cada vez que cambies `contenido/sorpresas.json`, vuelve a ejecutar `npm run encrypt`. El script reutiliza la
"sal" del archivo anterior, así que Alba no tiene que volver a entrar. Si cambias la contraseña, usa
`npm run encrypt -- --nueva-sal`.

## Tipos de sorpresa

Cada día lleva `kind`, `title` y, opcionalmente, `message` (texto de arriba) y `closing` (despedida). Ejemplos de
todos en `contenido/sorpresas.example.json`:

| `kind`      | Qué añade                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------- |
| `note`      | Solo el texto                                                                                |
| `song`      | `song: { name, artist, spotify }` con `spotify` = `track/<id>` o `album/<id>` (reproductor)  |
| `question`  | `question`: Alba escribe la respuesta y se guarda en su móvil                                |
| `voucher`   | `voucher`; con `answerFromDay` enseña lo que respondió en esa pregunta                       |
| `scratch`   | `prizes`: rasca y gana, solo se puede rascar una tarjeta                                     |
| `quiz`      | `questions: [{ question, options, correct }]` (`correct` empieza en 0); verde o rojo         |
| `crossword` | `words: [{ answer, clue, row, col, direction }]`; el script avisa si las palabras no encajan |

Las respuestas, el rasca y gana, el test y el crucigrama se guardan solo en el móvil de Alba (no se envían a
ningún sitio).

## Estructura

Contextos en `src/` con capas `domain` / `application` / `infrastructure` / `presentation`:

- `access/`: iniciar sesión (usuario + contraseña → clave), recordar y cerrar sesión.
- `calendar/`: fases (espera, adviento, terminado), puertas, abrir puerta y sorpresas.
- `shared/`: hora de Madrid, cifrado (`aes-gcm.cipher.ts`, compartido con el script) y componentes comunes.

`npm run check` pasa tipos, lint, formato y tests.
