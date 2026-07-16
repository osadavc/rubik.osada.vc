import Link from "next/link";
import {
  M,
  PlayChip,
  ScrambleChip,
  Swatch,
  Tip,
  TryMove,
} from "@/components/guide/content-blocks";
import { TopView } from "@/components/guide/top-view";
import {
  centerBlockComplete,
  edgesPaired,
  hasYellowCross4,
  isSolved,
} from "@/lib/cube";
import type { Guide } from "../types";
import {
  CENTER_DOWN,
  CENTER_FRONT,
  DEMOS,
  EDGE_LINE_UP,
  EDGE_PAIR,
  INSERT_RIGHT,
  OLL_PARITY,
  PLL_PARITY,
  SETUPS,
} from "./algs";
import {
  centersFocus,
  centersOnly,
  edgesFocus,
  edgesOnly,
  piece,
  whiteCenterTiles,
  yellowEdges,
  yellowEdgesFocus,
} from "./masks";

const DEFAULT_CAM = { azimuth: 0.68, polar: 1.08 };
const LOW_CAM = { azimuth: 0.68, polar: 1.5 };

const OUTER_KEY = [
  ["U", "up - the top"],
  ["D", "down - the bottom"],
  ["L", "left"],
  ["R", "right"],
  ["F", "front - faces you"],
  ["B", "back"],
] as const;

const INNER_KEY = [
  ["r", "inside right"],
  ["l", "inside left"],
  ["u", "inside up"],
  ["d", "inside down"],
] as const;

export const fourByFourReduction: Guide = {
  slug: "4x4-reduction",
  title: "4x4 Reduction",
  tagline:
    "Pair up centers and edges until the big cube plays by 3x3 rules.",
  puzzle: "4x4",
  difficulty: "advanced",
  estMinutes: 90,
  prerequisite: {
    title: "Master the 3x3 first.",
    body: "The whole third act of this guide is the Beginner's Method played on a bigger cube - be comfortable solving the classic cube before you start.",
    linkLabel: "Learn the 3x3",
    slug: "beginners-method",
  },
  chapters: [
    {
      id: "know",
      title: "Meet the Master",
      summary:
        "The Rubik's Master looks like a scaled-up cube, but one difference changes everything: nothing on it is fixed.",
      steps: [
        {
          id: "know-centers",
          title: "No center is anchored",
          camera: DEFAULT_CAM,
          highlight: centersOnly,
          spotlight: centersOnly,
          freePlay: true,
          content: (
            <>
              <p>
                On a 3&times;3, the centers are bolted to the core and tell you
                what color each face will be. Not here. The Master has{" "}
                <strong>24 center pieces</strong>, four per face, and every one
                of them can travel. The lit 2&times;2 blocks are the centers -
                drag any layer and watch them scatter.
              </p>
              <p>
                That is the first job of this method: gather the 24 loose
                center tiles back into six solid blocks, so the cube has
                centers like a 3&times;3 again.
              </p>
            </>
          ),
        },
        {
          id: "know-edges",
          title: "Edges come in pairs",
          camera: DEFAULT_CAM,
          highlight: edgesOnly,
          content: (
            <>
              <p>
                The lit pieces are edges: <strong>24</strong>{" "}of them,
                twice as many as a 3&times;3. They live in pairs - two slim pieces
                sitting side by side that together act like one 3&times;3 edge.
                A scramble splits the pairs apart, and job number two is to
                reunite all twelve.
              </p>
              <p>
                The 8 corners are exactly the same as on a 3&times;3. Once
                centers are grouped and edges are paired, the whole puzzle
                plays by 3&times;3 rules. That is why this method is called{" "}
                <strong>reduction</strong>: you reduce the big cube to a small
                one, then solve the small one.
              </p>
            </>
          ),
        },
        {
          id: "know-colors",
          title: "The color scheme is on you",
          camera: DEFAULT_CAM,
          highlight: centersOnly,
          content: (
            <>
              <p>
                With no fixed centers, the cube cannot remind you which color
                belongs where - you have to know the layout. Opposites first:{" "}
                <Swatch color="white" /> white sits opposite{" "}
                <Swatch color="yellow" /> yellow, <Swatch color="red" /> red
                opposite <Swatch color="orange" /> orange, and{" "}
                <Swatch color="blue" /> blue opposite{" "}
                <Swatch color="green" /> green.
              </p>
              <p>
                Direction matters too: hold <Swatch color="white" /> white on
                top with <Swatch color="green" /> green facing you, and{" "}
                <Swatch color="red" /> red must be on your <strong>right</strong>.
                Build the centers in a mirrored layout and the corners will
                refuse to solve later - the printed guide warns about exactly
                this trap.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "notation",
      title: "Reading big-cube moves",
      summary:
        "Six letters you already know, plus one new idea: the inside slices get their own lowercase letters.",
      steps: [
        {
          id: "notation-outer",
          title: "Capital letters, same as ever",
          camera: DEFAULT_CAM,
          freePlay: true,
          content: (
            <>
              <p>
                The outside faces read exactly like 3&times;3 notation: a
                capital letter is a quarter turn of that face, clockwise as you
                look at it. An apostrophe like <M>{"U'"}</M> means
                counterclockwise, a <M>U2</M> means twice around.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {OUTER_KEY.map(([letter, meaning]) => (
                  <TryMove key={letter} token={letter} label={meaning} />
                ))}
              </div>
            </>
          ),
        },
        {
          id: "notation-inner",
          title: "Lowercase means inside",
          camera: DEFAULT_CAM,
          freePlay: true,
          content: (
            <>
              <p>
                New on the Master: each face hides an inside slice right behind
                it, and it gets the same letter in <strong>lowercase</strong>.
                So <M>r</M> turns the slice just inside the right face, while
                the right face itself stays put.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {INNER_KEY.map(([letter, meaning]) => (
                  <TryMove key={letter} token={letter} label={meaning} />
                ))}
              </div>
              <p>
                Tap a card and watch closely: only the thin inner layer moves.
                These slices are what split centers and edge pairs apart - and
                what put them back together.
              </p>
            </>
          ),
        },
        {
          id: "notation-wide",
          title: "Two letters turn together",
          camera: DEFAULT_CAM,
          freePlay: true,
          content: (
            <>
              <p>
                When a face letter and its slice letter are written together,
                like <M>Rr</M> or <M>Dd</M>, grab both layers and turn them as
                one thick block. The prime version marks both letters:{" "}
                <M>{"R'r'"}</M>.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <TryMove token="Rr" label="right face + inside right" />
                <TryMove token="Dd" label="down face + inside down" />
                <TryMove token="Uu2" label="both top layers, twice" />
              </div>
              <p>
                That is the whole vocabulary. Watch it in motion, then we
                start solving.
              </p>
              <PlayChip
                alg={DEMOS.slicesShowcase}
                label="See faces, slices and blocks"
                pace={0.55}
              />
            </>
          ),
        },
      ],
    },
    {
      id: "centers",
      title: "Solve the centers",
      summary:
        "Gather the 24 loose center tiles into six solid blocks, one color at a time, starting with white.",
      outcome: { setup: SETUPS.centersDone, caption: "Centers grouped" },
      steps: [
        {
          id: "centers-hold",
          title: "White on top, find its twins",
          camera: DEFAULT_CAM,
          setup: SETUPS.centerFrontCase,
          highlight: centersFocus,
          spotlight: whiteCenterTiles,
          content: (
            <>
              <p>
                Hold the cube with a white center tile on the{" "}
                <strong>up</strong>{" "}face - on a real Rubik&apos;s Master,
                the one with the logo. From here on everything that is not a center
                is dimmed, exactly like the gray tiles in the printed guide.
              </p>
              <p>
                The white tiles are glowing. Three already sit on top; the
                fourth is loose on the front face. The whole centers stage is
                this one situation, met over and over: a tile that belongs up
                top, waiting somewhere else.
              </p>
            </>
          ),
        },
        {
          id: "centers-insert",
          title: "The elevator",
          camera: DEFAULT_CAM,
          setup: SETUPS.centerFrontCase,
          highlight: centersFocus,
          spotlight: whiteCenterTiles,
          demo: CENTER_FRONT,
          demoNotes: [
            "The right half rises like an elevator, carrying the white tile onto the top.",
            "Spin the top: the new tile steps off, and a non-white tile moves into the return spot.",
            "The elevator comes back down. Every white stays up top.",
          ],
          pace: 0.6,
          content: (
            <>
              <p>
                First, set up: turn the <strong>front face</strong> until the
                loose white tile sits in the <strong>lower right</strong> of
                its center block, and turn the <strong>top</strong> until a
                non-white tile waits in the upper left up there. Then run the
                three moves.
              </p>
              <Tip>
                <p>
                  Think of <M>Rr</M> as an elevator: it lifts a tile to the
                  top. The <M>U</M> in the middle moves the delivered tile out
                  of the elevator before <M>{"R'r'"}</M> sends it back down.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "centers-down",
          title: "A tile on the floor",
          camera: LOW_CAM,
          setup: SETUPS.centerDownCase,
          highlight: centersFocus,
          spotlight: whiteCenterTiles,
          demo: CENTER_DOWN,
          demoNotes: [
            "A half spin of the right half swings the white tile from the floor straight up to the top.",
            "Slide it off the elevator.",
            "And send the elevator back down for the rest of the cube.",
          ],
          pace: 0.6,
          content: (
            <>
              <p>
                If the missing white tile is on the <strong>down</strong> face
                instead, turn the bottom until it sits in the lower right of
                its block, then use the half-turn version: the tile rides the
                elevator all the way from floor to ceiling.
              </p>
            </>
          ),
        },
        {
          id: "centers-rest",
          title: "Five more, in order",
          camera: DEFAULT_CAM,
          highlight: centersFocus,
          content: (
            <>
              <p>
                Repeat the same routine for the other colors, in this order:{" "}
                <Swatch color="white" /> white, <Swatch color="yellow" />{" "}
                yellow, <Swatch color="red" /> red, <Swatch color="green" />{" "}
                green, <Swatch color="orange" /> orange,{" "}
                <Swatch color="blue" /> blue. Yellow goes to the bottom, since
                it is white&apos;s opposite.
              </p>
              <p>
                From red onward, <strong>placement</strong> matters, not just
                grouping. Keep the layout rule in mind: with{" "}
                <Swatch color="yellow" /> yellow up, <Swatch color="green" />{" "}
                green sits to the right of <Swatch color="red" /> red. Check
                twice, build once - a mirrored layout only reveals itself much
                later, at the corners.
              </p>
            </>
          ),
        },
        {
          id: "centers-practice",
          title: "Finish the white center",
          camera: DEFAULT_CAM,
          setup: SETUPS.centerFrontCase,
          highlight: centersFocus,
          interaction: "execute",
          goal: (state) => centerBlockComplete(state, "white"),
          goalText: "Group all four white center tiles into one block.",
          drills: [
            {
              setup: SETUPS.centerFrontCase,
              label: "On the front",
              hint: "The loose tile already sits in the lower right of the front block, and the top is aligned. Ride the elevator: Rr U R\u2032r\u2032.",
              solution: CENTER_FRONT,
            },
            {
              setup: SETUPS.centerDownCase,
              label: "On the floor",
              hint: "The white tile is on the bottom face. Half turns this time: Rr2 U Rr2.",
              solution: CENTER_DOWN,
            },
            {
              setup: SETUPS.centerAlignCase,
              label: "Align first",
              hint: "Same front case, but the top is twisted. Turn the up face so a non-white tile waits in the upper left, then run the insert.",
              solution: `U ${CENTER_FRONT}`,
            },
          ],
          content: (
            <>
              <p>
                Three drills, one white tile from a finished block each time.
                Set up the front and the top, then ride the elevator.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "edges",
      title: "Pair the edges",
      summary:
        "Reunite the 24 edge pieces into 12 pairs with one seven-move sequence and a memorable phrase.",
      outcome: { setup: SETUPS.edgesDone, caption: "Every edge paired" },
      steps: [
        {
          id: "edges-goal",
          title: "Two pieces, one edge",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgeAcrossCase,
          highlight: edgesFocus,
          spotlight: piece("white", "orange"),
          content: (
            <>
              <p>
                Pick any pair - here, the two{" "}
                <Swatch color="white" /> white and <Swatch color="orange" />{" "}
                orange pieces, glowing. Right now they sit apart. Paired up,
                they will sit side by side in one slot, colors matching, and
                from then on they move through every algorithm as a single
                piece.
              </p>
              <p>
                The edges do <strong>not</strong> need to match the centers
                yet. Ignore colors under your pieces entirely - this stage only
                cares that twins end up together.
              </p>
            </>
          ),
        },
        {
          id: "edges-find",
          title: "Bring them to the front",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgeAcrossCase,
          highlight: edgesFocus,
          spotlight: piece("white", "orange"),
          content: (
            <>
              <p>
                Using only <strong>outside turns</strong> - they can never
                break a center block or an already-finished pair - steer the
                two pieces onto the <strong>left and right edges of the front
                face</strong>.
              </p>
              <p>
                Now read the two front tiles. On this cube both pieces sit
                level and show the <strong>same color</strong> toward you: they
                are directly across from each other, ready to pair. If instead
                one sits high and one sits low, they need one lining-up
                sequence first - next step covers it.
              </p>
            </>
          ),
        },
        {
          id: "edges-lineup",
          title: "Line them up",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgeDiagonalCase,
          highlight: edgesFocus,
          spotlight: piece("white", "orange"),
          demo: EDGE_LINE_UP,
          demoNotes: [
            "The right face turns: the odd one out starts its trip.",
            "The front opens\u2026",
            "\u2026the top carries the piece across\u2026",
            "\u2026and the front closes. Both pieces now sit level, matching tiles facing you.",
          ],
          pace: 0.65,
          content: (
            <>
              <p>
                Here the two glowing pieces sit at different heights - not
                across from each other. Four moves fix that. Afterward the
                cube looks exactly like the previous step, and the pairing
                sequence can take over.
              </p>
            </>
          ),
        },
        {
          id: "edges-pair",
          title: "Don't run fast",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgeAcrossCase,
          highlight: edgesFocus,
          spotlight: piece("white", "orange"),
          demo: EDGE_PAIR,
          demoNotes: [
            "Ddon\u2032t - the bottom face and inside-down slice turn together, storing one piece.",
            "Run - the right face rises.",
            "F\u2032ast - the front swings open.",
            "Unless - the top carries a piece across.",
            "R\u2032unning - the right face returns.",
            "Fast - the front closes on the reunited pair.",
            "D\u2032d\u2032aily - the bottom block slides back, restoring every center.",
          ],
          pace: 0.6,
          content: (
            <>
              <p>
                With the pieces across from each other, seven moves join them.
                The printed guide teaches it as a phrase -{" "}
                <strong>
                  Ddon&apos;t Run F&apos;ast Unless R&apos;unning Fast
                  D&apos;d&apos;aily
                </strong>{" "}
                - each word carrying its move.
              </p>
              <Tip>
                <p>
                  The first and last words are the important ones: <M>Dd</M>{" "}
                  borrows the bottom two layers and <M>{"D'd'"}</M> must give
                  them back, or your finished centers pay the price. Keep the
                  front face the front for all seven moves.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "edges-repeat",
          title: "Twelve times around",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgesDone,
          highlight: edgesFocus,
          content: (
            <>
              <p>
                Repeat the routine - find the twins, bring them to the front,
                line up if needed, pair - until all 24 pieces sit in matched
                pairs. The cube on screen is there: still scrambled, but every
                edge slot shows a single color pair, and the centers survived
                it all.
              </p>
              <Tip>
                <p>
                  Solve one pair at a time and re-check your centers after
                  each run. If a center block ever looks broken mid-sequence,
                  finish the sequence - the last move brings it home.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "edges-practice",
          title: "Pair them yourself",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgeAcrossCase,
          highlight: edgesFocus,
          interaction: "execute",
          goal: edgesPaired,
          goalText: "Get every edge piece sitting next to its twin.",
          drills: [
            {
              setup: SETUPS.edgeAcrossCase,
              label: "Across",
              hint: "The twins sit level on the front's left and right edges. Say it while you turn: Ddon\u2032t Run F\u2032ast Unless R\u2032unning Fast D\u2032d\u2032aily.",
              solution: EDGE_PAIR,
            },
            {
              setup: SETUPS.edgeDiagonalCase,
              label: "Line up first",
              hint: "One piece high, one low. Run R F\u2032 U F to level them, then the pairing phrase.",
              solution: DEMOS.edgeDiagonalSolution,
            },
          ],
          content: (
            <>
              <p>
                Two situations, the same finish. The goal checker watches all
                twelve pairs, so nothing gets past it.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "like-3x3",
      title: "Solve it like a 3x3",
      summary:
        "Centers grouped, edges paired: the Master now obeys every 3x3 rule you already know.",
      outcome: { setup: SETUPS.crossDone, caption: "Into the endgame" },
      steps: [
        {
          id: "threes-rule",
          title: "Outside turns only",
          camera: DEFAULT_CAM,
          setup: SETUPS.reducedScrambled,
          freePlay: true,
          content: (
            <>
              <p>
                This cube looks scrambled, but look closer: every center block
                is solid and every edge pair is together. It is a 3&times;3
                wearing a bigger suit. From here, follow the{" "}
                <Link
                  href="/guides/beginners-method"
                  className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition-colors hover:decoration-zinc-900"
                >
                  Beginner&apos;s Method
                </Link>{" "}
                start to finish: white cross, white corners, middle layer, and
                the yellow endgame.
              </p>
              <p>
                One rule keeps the reduction alive:{" "}
                <strong>turn only the outside faces</strong>. Outer turns can
                never split a pair or a center. Touch an inner slice and your
                careful work unravels. Try a few turns - the cube is yours.
              </p>
            </>
          ),
        },
        {
          id: "threes-pairs",
          title: "Pairs travel as one",
          camera: DEFAULT_CAM,
          setup: SETUPS.insertRightCase,
          spotlight: piece("red", "blue"),
          demo: INSERT_RIGHT,
          demoNotes: [
            "A middle-layer insert from the 3x3 guide. Watch the glowing pair - two pieces, one motion.",
            null,
            null,
            null,
            null,
            null,
            null,
            "The pair lands in its slot together, still side by side.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>
                Every 3&times;3 algorithm works untouched. Here is the familiar
                middle-layer insert running on the Master - the glowing edge
                pair rides through all eight moves as a single piece.
              </p>
              <Tip>
                <p>
                  If the white corners refuse to solve no matter what, your
                  centers are grouped in a mirrored layout. Go back, rebuild
                  the centers in the right arrangement, and re-pair. The cube
                  is not broken - the map was.
                </p>
              </Tip>
            </>
          ),
        },
      ],
    },
    {
      id: "oll-parity",
      title: "The cross parity",
      summary:
        "Sometimes the yellow cross gets stuck with one or three edges up - a shape a 3x3 can never make. One algorithm unsticks it.",
      outcome: { setup: SETUPS.yellowDone, caption: "Cross complete" },
      steps: [
        {
          id: "parity1-count",
          title: "Count the yellow edge pairs",
          camera: DEFAULT_CAM,
          setup: SETUPS.ollParityCase,
          highlight: yellowEdgesFocus,
          spotlight: yellowEdges,
          content: (
            <>
              <p>
                When you reach the yellow cross, count the yellow{" "}
                <strong>edge pairs</strong>{" "}showing on top. Zero, two or four:
                perfectly normal, carry on with the 3&times;3 method. One or
                three - like the cube on screen - is <strong>parity</strong>:
                one edge pair is flipped in place, something a real 3&times;3
                cannot do.
              </p>
              <div className="flex flex-wrap items-end gap-6">
                <TopView
                  setup={SETUPS.yellowLCase}
                  label="Two up: normal, solve on"
                  dimNonYellow
                />
                <TopView
                  setup={SETUPS.ollParityOneUp}
                  label="One up: parity"
                  dimNonYellow
                />
                <TopView
                  setup={SETUPS.ollParityCase}
                  label="Three up: parity"
                  dimNonYellow
                />
              </div>
              <p>
                Hold the cube so the flipped pair - the gap in your cross -
                faces the <strong>front</strong>, then move to the fix.
              </p>
            </>
          ),
        },
        {
          id: "parity1-alg",
          title: "The fix",
          camera: DEFAULT_CAM,
          setup: SETUPS.ollParityCase,
          highlight: yellowEdgesFocus,
          spotlight: yellowEdges,
          demo: OLL_PARITY,
          demoNotes: [
            "Every left and right letter in this algorithm is a lowercase inner slice - the outside faces stay put.",
            null,
            null,
            "The inside-left slice joins in.",
            null,
            null,
            null,
            null,
            null,
            "Front face, half turn - outer faces here are capital letters.",
            null,
            null,
            null,
            null,
            "Last slice home. The flipped pair is right way up, and the centers all survived.",
          ],
          pace: 0.75,
          content: (
            <>
              <p>
                Fifteen moves - the longest algorithm in this guide, and the
                only place lowercase and capital letters mix. Read each card
                carefully: <M>r2</M> is the inner slice, <M>B2</M> the outer
                face. Step through slowly the first few times.
              </p>
              <Tip>
                <p>
                  Keep the cube on the table for this one, front face fixed
                  the whole way. Once the parity is fixed, finish the yellow
                  cross exactly as on a 3&times;3.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "parity1-practice",
          title: "Fix the parity",
          camera: DEFAULT_CAM,
          setup: SETUPS.ollParityCase,
          highlight: yellowEdgesFocus,
          interaction: "execute",
          goal: hasYellowCross4,
          goalText: "Complete the yellow cross - all four edge pairs up.",
          drills: [
            {
              setup: SETUPS.ollParityCase,
              label: "Three up",
              hint: "The flipped pair faces the front. Run the fifteen moves - slices lowercase, faces capital.",
              solution: OLL_PARITY,
            },
            {
              setup: SETUPS.ollParityOneUp,
              label: "One up",
              hint: "Parity plus an unfinished cross. Fix the parity first, realign the top, then FUR says U\u2032R\u2032F\u2032 finishes the cross.",
              solution: DEMOS.ollParityOneUpSolution,
            },
          ],
          content: (
            <>
              <p>
                Both parity counts, ending in a full yellow cross. The second
                drill chains the fix into the normal cross algorithm, just
                like a real solve.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "pll-parity",
      title: "The last parity",
      summary:
        "Corners placed, three edges to cycle - and sometimes exactly two pairs refuse to cooperate. The final algorithm of the method.",
      outcome: { setup: "", caption: "Solved" },
      steps: [
        {
          id: "parity2-count",
          title: "Count the placed pairs",
          camera: DEFAULT_CAM,
          setup: SETUPS.pllOppositeCase,
          highlight: yellowEdgesFocus,
          spotlight: yellowEdges,
          content: (
            <>
              <p>
                The very last stage: the top is all yellow, corners are seated,
                and only the edge pairs need positioning. Count how many
                already match their side centers. Zero or one:
                the normal 3&times;3 cycle handles it. Exactly{" "}
                <strong>two</strong>{" "}placed pairs is the second parity - a
                swap no 3&times;3 algorithm can produce.
              </p>
              <div className="flex flex-wrap items-end gap-6">
                <TopView
                  setup={SETUPS.pllOppositeCase}
                  label="Two placed, opposite each other"
                />
                <TopView
                  setup={SETUPS.pllAdjacentCase}
                  label="Two placed, side by side"
                />
              </div>
              <p>
                The hold depends on the shape. Placed pairs{" "}
                <strong>opposite</strong> each other: put them on the left and
                right. Placed pairs <strong>next to</strong> each other: put
                them on the left and back.
              </p>
            </>
          ),
        },
        {
          id: "parity2-opposite",
          title: "Are you? Are you you? Are you?",
          camera: DEFAULT_CAM,
          setup: SETUPS.pllOppositeCase,
          highlight: yellowEdgesFocus,
          spotlight: yellowEdges,
          demo: PLL_PARITY,
          demoNotes: [
            "Are - the inner right slice, half turn. Every right turn in this algorithm is a slice.",
            "you? - the top face, half turn.",
            "Are - slice again.",
            "you you? - both top layers together this time.",
            "Are - slice once more.",
            "you? - and just the inside-top layer to finish.",
          ],
          pace: 0.6,
          content: (
            <>
              <p>
                Six moves, remembered as three little questions:{" "}
                <strong>Are you? Are you you? Are you?</strong> Each{" "}
                <em>are</em> is <M>r2</M>, and each <em>you</em> is a top
                layer - face, both, then inside.
              </p>
              <p>
                With the placed pairs held left and right, this swaps the two
                stragglers directly - here it finishes the cube on the spot.
              </p>
            </>
          ),
        },
        {
          id: "parity2-adjacent",
          title: "The side-by-side case",
          camera: DEFAULT_CAM,
          setup: SETUPS.pllAdjacentCase,
          highlight: yellowEdgesFocus,
          spotlight: yellowEdges,
          demo: DEMOS.pllAdjacentSolution,
          demoNotes: [
            "Same six moves, same questions - with the placed pairs held left and back.",
            null,
            null,
            null,
            null,
            null,
            "Re-grip: turn the whole cube to set up the familiar 3x3 edge cycle.",
            "The cycle from the Beginner's Method, outer faces only\u2026",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "\u2026and the Master is solved.",
          ],
          pace: 0.75,
          content: (
            <>
              <p>
                When the placed pairs sit next to each other, hold them on the{" "}
                <strong>left and back</strong>, run the same six moves, and
                finish with the ordinary 3&times;3 edge cycle. Nothing new to
                memorize - just the questions, a re-grip, and a cycle you
                already know.
              </p>
            </>
          ),
        },
        {
          id: "parity2-practice",
          title: "Finish the Master",
          camera: DEFAULT_CAM,
          setup: SETUPS.pllOppositeCase,
          highlight: yellowEdgesFocus,
          interaction: "execute",
          goal: isSolved,
          goalText: "Solve the cube, all the way.",
          drills: [
            {
              setup: SETUPS.pllOppositeCase,
              label: "Opposite",
              hint: "The placed pairs sit left and right. Are you? Are you you? Are you?",
              solution: PLL_PARITY,
            },
            {
              setup: SETUPS.pllAdjacentCase,
              label: "Side by side",
              hint: "Placed pairs left and back. Run the questions, re-grip with y, then the 3x3 edge cycle: F2 U L R\u2032 F2 L\u2032 R U F2.",
              solution: DEMOS.pllAdjacentSolution,
            },
          ],
          content: (
            <>
              <p>
                Two boards, each one algorithm from done. The last moves you
                make in this guide.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "solved",
      title: "Solved",
      summary: "You can do the Rubik's Master.",
      steps: [
        {
          id: "solved-done",
          title: "You solved the Rubik's Master",
          camera: DEFAULT_CAM,
          freePlay: true,
          content: (
            <>
              <p>
                The whole method, end to end: group the centers, pair the
                edges, then let your 3&times;3 instincts drive - with two
                parity fixes in your back pocket for when the big cube bends
                the rules.
              </p>
              <p>
                Scramble it and run the journey for real. Inner slices will
                tear the centers and pairs apart - rebuilding them is the whole
                game.
              </p>
              <ScrambleChip />
              <p>
                And if the 3&times;3 stage felt shaky anywhere, the{" "}
                <Link
                  href="/guides/beginners-method"
                  className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition-colors hover:decoration-zinc-900"
                >
                  Beginner&apos;s Method guide
                </Link>{" "}
                is right there to replay.
              </p>
            </>
          ),
        },
      ],
    },
  ],
};
