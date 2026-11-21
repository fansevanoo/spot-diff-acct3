# Lantern Night Market — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/fansevanoo/spot-diff-acct3/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/fansevanoo/spot-diff-acct3/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game set in a lantern-lit night market, drawn
entirely in code as flat-vector Canvas 2D art. Five scenes, ten fair
differences each — a lantern re-inked, a cat gone from a roof, a moon that
moved, a firework that changed colour.

Two panels side by side: **A · ORIGINAL** and **B · SPOT THE CHANGES**.
Click a difference in either panel to ring it gold on both (the latest find
rings green). A big **N to find** counter, a timer against par, three strikes
per scene, three hints per scene, score and streak, a magnifier lens, full
keyboard play, WebAudio chimes, and a best score kept in localStorage.

## Scenes

1. **The Lantern Stalls** — lanterns, three stalls, a roof cat
2. **The Dumpling Cart** — steamers, bowls, a menu board
3. **The Paper Kite Shop** — kites, paper rolls, scissors
4. **The Tea House Steps** — teapot, bamboo, blossom
5. **The Firework Alley** — bursts, string lights, a crowd

## Play

Serve `game/` with any static server and open `index.html` in a desktop
browser — no network, no build step:

```sh
node serve.ts
# open http://localhost:8080
```

Mouse: click a difference. Keyboard: arrows move the crosshair, Enter
guesses, Tab switches panels, H hint, P pause, M magnifier, N next scene,
R retry, 1–5 jump to a scene.

## Hand in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-game.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Entry for the [make.fun best spot the difference game bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
