import {
  Kbd,
  M,
  PlayChip,
  ScrambleChip,
  Swatch,
  Tip,
  TryMove,
} from "@/components/guide/content-blocks";
import { TopView } from "@/components/guide/top-view";
import {
  firstLayerSolved,
  hasDaisy,
  hasWhiteCross,
  hasYellowCross,
  isSolved,
  middleLayerSolved,
  yellowCornersPositioned,
  yellowFaceComplete,
} from "@/lib/cube";
import type { Guide } from "../types";
import {
  CORNER_DOWN_FIX,
  CORNER_LEFT,
  CORNER_PLL,
  CORNER_RIGHT,
  DAISY_FLIP,
  DAISY_SETUP,
  DEMOS,
  EDGE_PLL,
  EDGE_PLL_PRIME,
  INSERT_LEFT,
  INSERT_RIGHT,
  INV_INSERT_LEFT,
  INV_INSERT_RIGHT,
  SETUPS,
  SUNE,
  YELLOW_CROSS,
} from "./algs";
import {
  centersOnly,
  cornersOnly,
  cyclingYellowEdges,
  edgesOnly,
  layerOneFocus,
  noYellowFocus,
  piece,
  pieces,
  topLayer,
  whiteEdges,
  whiteEdgesFocus,
  whiteEdgesOnTop,
  yellowCorners,
  yellowEdges,
  yellowEdgesFocus,
} from "./masks";

const DEFAULT_CAM = { azimuth: 0.68, polar: 1.08 };
const LOW_CAM = { azimuth: 0.68, polar: 1.5 };

const FACE_KEY = [
  ["U", "up - the top"],
  ["D", "down - the bottom"],
  ["L", "left"],
  ["R", "right"],
  ["F", "front - faces you"],
  ["B", "back"],
] as const;

export const beginnersMethod: Guide = {
  slug: "beginners-method",
  title: "The Beginner's Method",
  tagline:
    "The official layered method, taught interactively. Solve your first cube in an afternoon.",
  puzzle: "3x3",
  difficulty: "beginner",
  estMinutes: 45,
  chapters: [
    {
      id: "know",
      title: "Know your cube",
      summary:
        "Before the first turn, learn what you are actually looking at. It makes everything else click.",
      steps: [
        {
          id: "know-layers",
          title: "You solve layers, not faces",
          camera: DEFAULT_CAM,
          highlight: topLayer,
          freePlay: true,
          content: (
            <>
              <p>
                A 3&times;3 cube has three horizontal layers: top, middle, and
                bottom. The whole method comes down to one idea. You solve the
                cube <strong>layer by layer</strong>, not color by color.
              </p>
              <p>
                The lit band on the cube is the top layer. Try dragging it
                around, and grab empty space to orbit the whole cube.
              </p>
            </>
          ),
        },
        {
          id: "know-centers",
          title: "Centers never move",
          camera: DEFAULT_CAM,
          highlight: centersOnly,
          spotlight: centersOnly,
          content: (
            <>
              <p>
                Each flat side is a face, and the single tile in the middle of a
                face is a <strong>center</strong>. Centers are fixed to the
                core, so they never move relative to each other. Press play and
                watch: every layer spins, yet the six glowing centers stay put.
              </p>
              <PlayChip
                alg="R L' U D' F B'"
                label="Spin every face"
                pace={0.6}
              />
              <p>
                That means the center tells you what color its face will be when
                solved. The pairs are always opposite each other:{" "}
                <Swatch color="white" /> white opposite{" "}
                <Swatch color="yellow" /> yellow, <Swatch color="blue" /> blue
                opposite <Swatch color="green" /> green, and{" "}
                <Swatch color="orange" /> orange opposite <Swatch color="red" />{" "}
                red.
              </p>
            </>
          ),
        },
        {
          id: "know-edges",
          title: "Edges have two colors",
          camera: DEFAULT_CAM,
          highlight: edgesOnly,
          content: (
            <>
              <p>
                An <strong>edge</strong> piece sits between two centers and has
                exactly two colored tiles. There are twelve of them, lit on the
                cube now. On a real cube you would pinch an edge with two
                fingers.
              </p>
            </>
          ),
        },
        {
          id: "know-corners",
          title: "Corners have three colors",
          camera: DEFAULT_CAM,
          highlight: cornersOnly,
          content: (
            <>
              <p>
                A <strong>corner</strong> piece has three colored tiles, and
                there are eight of them. Every piece on the cube is a center, an
                edge, or a corner. A piece can never change type, and its colors
                never separate. That is why the cube is solvable at all.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "notation",
      title: "Reading moves",
      summary:
        "Six letters describe every turn you will ever make. Learn them once and every algorithm in the world opens up.",
      steps: [
        {
          id: "notation-turn",
          title: "One letter, one quarter turn",
          camera: DEFAULT_CAM,
          freePlay: true,
          content: (
            <>
              <p>
                Each face has a letter. A letter on its own means: turn that
                face a quarter turn{" "}
                <strong>
                  clockwise, as if you were looking at that face straight on
                </strong>
                .
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FACE_KEY.map(([letter, meaning]) => (
                  <TryMove key={letter} token={letter} label={meaning} />
                ))}
              </div>
              <p>
                These cards are live: <strong>tap one</strong> and that face
                turns on the cube - or press the same letter on your{" "}
                <strong>keyboard</strong>: <Kbd>U</Kbd> <Kbd>D</Kbd>{" "}
                <Kbd>L</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>B</Kbd>. Four turns
                of the same face bring the cube back to where it started.
              </p>
            </>
          ),
        },
        {
          id: "notation-prime",
          title: "Primes and doubles",
          camera: DEFAULT_CAM,
          freePlay: true,
          content: (
            <>
              <p>
                Two marks change a letter&apos;s meaning. An apostrophe like{" "}
                <M>{"U'"}</M> means <strong>counterclockwise</strong>, and is
                spoken &ldquo;U prime&rdquo;. A <M>U2</M> means turn the face
                twice. Every move card in this guide carries a small arrow so
                you always know the direction at a glance.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <TryMove token="U" label="quarter turn clockwise" />
                <TryMove
                  token="U'"
                  label={'counterclockwise \u2014 "U prime"'}
                />
                <TryMove token="U2" label="half turn, twice around" />
              </div>
              <p>
                Feel the difference: tap <M>U</M> then <M>{"U'"}</M> and the
                cube is back where it began - a prime undoes its plain twin. Two
                taps of <M>U2</M> do the same. On a keyboard, hold{" "}
                <Kbd>Shift</Kbd> with a face letter for the prime turn.
              </p>
              <p>
                A sequence of moves in a specific order is called an{" "}
                <strong>algorithm</strong>. You will learn only a handful of
                short ones, each laid out move by move on cards like these.
              </p>
            </>
          ),
        },
        {
          id: "notation-front",
          title: "Keep the front in front",
          camera: DEFAULT_CAM,
          interaction: "execute",
          goal: (state) => !isSolved(state),
          goalText: "Turn any face of the cube, just to feel the grip.",
          drills: [
            {
              setup: "",
              label: "Any turn",
              hint: "Press on any colored tile, then drag across it in the direction you want that layer to spin. Or just press a letter key, like R or U.",
            },
          ],
          content: (
            <>
              <p>
                One rule matters when following an algorithm: the face you start
                with as the front <strong>stays the front</strong> for the whole
                sequence. Do not re-grip halfway through.
              </p>
              <p>
                Occasionally the method asks you to rotate the entire cube
                between algorithms. In this guide the cube rotates itself when
                that happens, so you can focus on the turns.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "daisy",
      title: "The daisy",
      summary:
        "Stage one of layer one. Four white petals around the yellow center, an easy landmark to build from.",
      outcome: { setup: SETUPS.daisyMixed, caption: "The daisy" },
      steps: [
        {
          id: "daisy-hold",
          title: "Hold it yellow side up",
          camera: DEFAULT_CAM,
          setup: "x2",
          highlight: whiteEdgesFocus,
          content: (
            <>
              <p>
                Begin with the <Swatch color="yellow" /> yellow center on the up
                face. It feels backwards to start the white layer by looking at
                yellow, but the daisy makes the next stage almost automatic.
              </p>
              <p>
                From here on, tiles that do not matter yet are dimmed, exactly
                like the gray tiles in the printed guide. Focus only on what is
                lit - right now, the four white edges.
              </p>
            </>
          ),
        },
        {
          id: "daisy-goal",
          title: "The goal",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyMixed,
          highlight: whiteEdgesFocus,
          spotlight: whiteEdges,
          content: (
            <>
              <p>
                This is a finished daisy: four white edge tiles around the
                yellow center, like petals - they are glowing on the cube.
              </p>
              <p>
                Look closely at their sides: <strong>none</strong> of the side
                colors line up with the centers below them, and that is
                completely fine. A daisy only cares that white points up.
                Matching the sides comes later, in the cross stage.
              </p>
            </>
          ),
        },
        {
          id: "daisy-top",
          title: "Whites already on top stay put",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyTopCase,
          highlight: whiteEdgesFocus,
          spotlight: whiteEdgesOnTop,
          content: (
            <>
              <p>
                Look at the top layer first. Any edge that already shows white
                on top is a finished petal - the two glowing ones here. Leave
                those alone and count how many you still need.
              </p>
            </>
          ),
        },
        {
          id: "daisy-middle",
          title: "Whites in the middle layer",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyMiddleCase,
          highlight: whiteEdgesFocus,
          spotlight: piece("white", "orange"),
          demo: "F'",
          demoNotes: [
            "One turn of the front face lifts the glowing white edge from the middle layer into the top.",
          ],
          content: (
            <>
              <p>
                Next, scan the middle layer. This cube has a white edge sitting
                in the middle layer, its white tile facing sideways - it is
                glowing. Turn the front face so the edge rises into the top
                layer. Watch it travel.
              </p>
            </>
          ),
        },
        {
          id: "daisy-bump",
          title: "Do not bump a petal out",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyBumpCase,
          highlight: whiteEdgesFocus,
          spotlight: pieces(["white", "blue"], ["orange", "white"]),
          demo: "U F2",
          demoNotes: [
            "First, spin the top: the finished petal slides out of the landing slot.",
            "Now the white edge comes up into the empty slot - nothing gets knocked out.",
          ],
          content: (
            <>
              <p>
                Careful: if the landing slot on top already holds a petal, a
                turn would knock it right back out. Both pieces involved are
                glowing on the cube - the petal in danger and the edge that
                wants its spot.
              </p>
              <Tip>
                <p>
                  Rotate the up face first to move the finished petal out of the
                  way, then bring the new white edge up.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "daisy-bottom",
          title: "Whites on the bottom",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyBottomCase,
          highlight: whiteEdgesFocus,
          spotlight: piece("white", "orange"),
          demo: "F2",
          demoNotes: [
            "A half turn carries the white edge from the bottom straight to the top, landing white side up.",
          ],
          content: (
            <>
              <p>
                Finally, the bottom layer. A white edge tile facing down is two
                quarter turns from home: turn its face twice and it lands on top
                with white showing up.
              </p>
            </>
          ),
        },
        {
          id: "daisy-flip",
          title: "Fixing a flipped petal",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyFlipCase,
          highlight: whiteEdgesFocus,
          spotlight: piece("white", "orange"),
          demo: DAISY_FLIP,
          demoNotes: [
            "The flipped edge drops out of the top layer, down into the middle.",
            "The top spins so an empty slot waits above the edge.",
            "The edge rises back up - this time with white facing up.",
          ],
          content: (
            <>
              <p>
                Sometimes an edge reaches the top layer with its white tile
                facing sideways instead of up. Hold the cube so the flipped edge
                is on the <strong>right face</strong>, then run your first real
                algorithm. Three moves: out, over, back in.
              </p>
            </>
          ),
        },
        {
          id: "daisy-practice",
          title: "Make your own daisy",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyPractice,
          highlight: whiteEdgesFocus,
          interaction: "execute",
          goal: hasDaisy,
          goalText: "Get all four white petals around the yellow center.",
          drills: [
            {
              setup: SETUPS.daisyPractice,
              label: "One to go",
              hint: "The last white edge sits at the bottom, but its landing slot is off to the side. Spin the top face until the empty slot is over it, then turn twice.",
              solution: DEMOS.daisyPracticeSolution,
            },
            {
              setup: SETUPS.daisyFlipCase,
              label: "Flipped petal",
              hint: "One edge reached the top with white facing sideways, on the right face. Run the flip: R\u2032 U F\u2032.",
              solution: DAISY_FLIP,
            },
            {
              setup: "x2 R2 B2 U'",
              label: "Two missing",
              hint: "Two whites wait on the bottom. Spin the top so an empty slot sits over one, send it up with a double turn, then do the same for the other.",
              solution: "U F2 L2",
            },
          ],
          content: (
            <>
              <p>
                Time to do it yourself. Three scrambles, from easy to sneaky.
                The cube is yours - drag faces to turn them. Remember: any four
                white petals count, no matter what their side colors do.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "cross",
      title: "The white cross",
      summary:
        "Turn the daisy into a proper cross by matching each petal's side color, then sending it down.",
      outcome: { setup: SETUPS.crossDone, caption: "White cross" },
      steps: [
        {
          id: "cross-match",
          title: "Match a petal to its center",
          camera: DEFAULT_CAM,
          setup: SETUPS.crossMismatch,
          highlight: whiteEdgesFocus,
          spotlight: piece("white", "blue"),
          demo: "U'",
          demoNotes: [
            "The top turns until the glowing petal's side color lines up directly above the center of the same color. Only this petal needs to match - ignore the others for now.",
          ],
          content: (
            <>
              <p>
                Keep the daisy on top. Pick <strong>one</strong> petal - the one
                nearest you - and look at its <strong>front tile</strong> (the
                color that is not white). Turn the up face until that tile sits
                directly above the center of the same color.
              </p>
              <Tip>
                <p>
                  Matching one petal does not line the others up. Side colors on
                  a daisy are usually out of order, so you handle petals{" "}
                  <strong>one at a time</strong>: match, send down, then the
                  next.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "cross-send",
          title: "Send it down",
          camera: LOW_CAM,
          setup: SETUPS.crossMatchedPair,
          highlight: whiteEdgesFocus,
          spotlight: piece("white", "blue"),
          demo: "F2",
          demoNotes: [
            "A half turn: the white tile dives to the bottom face, and the side color stays glued to its center the whole way down. Leave the other petals on top for now.",
          ],
          content: (
            <>
              <p>
                With that one petal matched, turn its face twice. The white tile
                travels to the bottom face, and the matched color stays glued to
                its center on the way down. The other petals stay on top - you
                will come back for them next.
              </p>
            </>
          ),
        },
        {
          id: "cross-around",
          title: "Work around the cube",
          camera: LOW_CAM,
          setup: SETUPS.crossMismatch,
          highlight: whiteEdgesFocus,
          spotlight: whiteEdges,
          demo: DEMOS.crossAround,
          demoNotes: [
            "Match the front petal over its center.",
            "Send it down.",
            "Re-grip: turn the whole cube to bring the next petal to the front.",
            "Match this petal - a half turn of the top.",
            "Send it down.",
            "Next face.",
            "Match again.",
            "Send down.",
            "Last petal to the front.",
            "Match.",
            "Send it down - that is the cross.",
          ],
          pace: 0.65,
          content: (
            <>
              <p>
                That is the whole loop: match one petal, send it down, turn the
                cube to face the next one, and repeat. Four petals, four times.
                Sometimes a lucky top turn lines up more than one petal - send
                each matched one down before you spin the top again.
              </p>
            </>
          ),
        },
        {
          id: "cross-done",
          title: "The finished cross",
          camera: DEFAULT_CAM,
          setup: SETUPS.crossDone,
          highlight: whiteEdgesFocus,
          spotlight: whiteEdges,
          content: (
            <>
              <p>
                Flip the cube over and admire it: a white cross, with each
                arm&apos;s side tile matching the <Swatch color="green" />{" "}
                <Swatch color="red" /> <Swatch color="blue" />{" "}
                <Swatch color="orange" /> center below it. That side matching is
                what separates a real cross from a lucky daisy.
              </p>
              <Tip>
                <p>
                  Master one stage by re-scrambling and repeating it a few times
                  before moving on. Speed comes from certainty, not rushing.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "cross-practice",
          title: "Finish the cross yourself",
          camera: LOW_CAM,
          setup: SETUPS.crossPractice,
          highlight: whiteEdgesFocus,
          interaction: "execute",
          goal: hasWhiteCross,
          goalText: "Complete the white cross with matching side colors.",
          drills: [
            {
              setup: SETUPS.crossPractice,
              label: "One at a time",
              hint: "Match the front petal, send it down, then send the back one (it is already matched). Spin the top to match the last pair and send those down too.",
              solution: DEMOS.crossPracticeSolution,
            },
            {
              setup: SETUPS.crossMismatch,
              label: "Re-grip around",
              hint: "Same daisy, but work face by face: match the front, F2, turn the whole cube (y), and repeat until all four are down.",
              solution: DEMOS.crossAround,
            },
            {
              setup: `${DAISY_SETUP} U'`,
              label: "Lucky spin",
              hint: "Sometimes one top turn lines every petal up at once. When that happens, just send all four down - but do not count on it. Usually you match and sink one at a time.",
              solution: "U F2 R2 B2 L2",
            },
          ],
          content: (
            <>
              <p>
                A daisy whose petals are out of order. Match and sink them one
                at a time - the last drill is the rare lucky case where one spin
                lines them all up.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "corners",
      title: "The white corners",
      summary:
        "Finish layer one by walking each white corner into its slot with a four move pattern.",
      outcome: { setup: `${SETUPS.layerOneDone} x2`, caption: "Layer one" },
      steps: [
        {
          id: "corners-place",
          title: "Where a corner belongs",
          camera: DEFAULT_CAM,
          highlight: layerOneFocus,
          spotlight: piece("white", "red", "blue"),
          content: (
            <>
              <p>
                Hold the cube with the white cross <strong>up</strong>. A corner
                piece belongs exactly where its three colors meet: the glowing
                white, red, and blue corner goes between the white, red, and
                blue centers. No exceptions, so you can always work out a
                corner&apos;s home just by reading its colors.
              </p>
            </>
          ),
        },
        {
          id: "corners-align",
          title: "Park it under its slot",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornerAlignCase,
          highlight: layerOneFocus,
          spotlight: piece("white", "red", "green"),
          demo: "D2",
          demoNotes: [
            "The bottom face spins until the glowing corner sits directly between the two side centers matching its colors - right under its home.",
          ],
          content: (
            <>
              <p>
                Find a white corner in the bottom layer. Turn the{" "}
                <strong>bottom face</strong> until that corner sits directly
                between the two side centers that match its colors, right under
                its home.
              </p>
            </>
          ),
        },
        {
          id: "corners-right",
          title: "White tile on the right",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornerRightCase,
          highlight: layerOneFocus,
          spotlight: piece("white", "red", "green"),
          demo: CORNER_RIGHT,
          demoNotes: [
            "The corner slides along the bottom, out of the way.",
            "The right face opens its slot downward.",
            "The bottom carries the corner into the open slot.",
            "The right face closes - the corner rides up into its home.",
          ],
          content: (
            <>
              <p>
                Hold the cube so the corner&apos;s white tile faces you. If the
                corner sits on the <strong>right</strong> side of the front,
                walk it in with four moves. Think of it as one motion: out of
                the way, open the slot, carry it in, lift it home.
              </p>
            </>
          ),
        },
        {
          id: "corners-left",
          title: "White tile on the left",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornerLeftCase,
          highlight: layerOneFocus,
          spotlight: piece("white", "orange", "green"),
          demo: CORNER_LEFT,
          demoNotes: [
            "The corner slides aside along the bottom.",
            "The left face opens its slot.",
            "The bottom carries the corner in.",
            "The left face closes and lifts it home.",
          ],
          content: (
            <>
              <p>
                Mirror image: if the white tile faces you on the{" "}
                <strong>left</strong> side of the front, the same dance runs
                through the left hand.
              </p>
            </>
          ),
        },
        {
          id: "corners-top",
          title: "Stuck in the top layer",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornerTopCase,
          highlight: layerOneFocus,
          spotlight: piece("white", "green", "red"),
          demo: DEMOS.cornerEscape,
          demoTokens: ["y'", "R'", "D'", "R"],
          demoNotes: [
            "Re-grip: the whole cube turns so the stuck corner sits on the right. No layers move.",
            "The right face opens beneath the corner.",
            "The bottom pulls the corner down and out of the top layer.",
            "Close the slot. The corner now waits in the bottom layer, ready for the normal routine.",
          ],
          content: (
            <>
              <p>
                If a white corner sits in the top layer but in the wrong spot,
                evict it first. Hold the cube so the corner is on the right,
                then drop it to the bottom layer. From there, park it under its
                slot and insert as usual.
              </p>
            </>
          ),
        },
        {
          id: "corners-down",
          title: "White tile facing down",
          camera: LOW_CAM,
          setup: SETUPS.cornerDownCase,
          highlight: layerOneFocus,
          spotlight: piece("white", "green", "red"),
          demo: CORNER_DOWN_FIX,
          demoNotes: [
            "The front face swings the corner out of its spot - the white tile leaves the floor.",
            "The bottom slides the corner around, out of the way.",
            "The front face returns to where it was.",
            "A half turn brings the corner back under its slot - white now faces front, ready to insert.",
          ],
          content: (
            <>
              <p>
                One awkward case remains: the corner is under its slot but its
                white tile points straight down, so neither insert applies.
                Twist it out and back to make the white tile face front, then
                insert it with the moves you already know.
              </p>
            </>
          ),
        },
        {
          id: "corners-practice",
          title: "Finish layer one",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornerLeftCase,
          highlight: layerOneFocus,
          interaction: "execute",
          goal: firstLayerSolved,
          goalText: "Insert the last white corner to complete layer one.",
          drills: [
            {
              setup: SETUPS.cornerLeftCase,
              label: "On the left",
              hint: "The white tile faces you on the left corner. Use the left insert: D L D\u2032 L\u2032.",
              solution: CORNER_LEFT,
            },
            {
              setup: SETUPS.cornerRightCase,
              label: "On the right",
              hint: "The white tile faces you on the right corner. Use the right insert: D\u2032 R\u2032 D R.",
              solution: CORNER_RIGHT,
            },
            {
              setup: SETUPS.cornerAlignCase,
              label: "Park it first",
              hint: "The corner is in the bottom layer but not under its slot yet. Spin the bottom until its colors sit between the matching centers, then insert to the right.",
              solution: `D2 ${CORNER_RIGHT}`,
            },
            {
              setup: SETUPS.cornerDownCase,
              label: "Facing down",
              hint: "White points at the floor. Twist it out and back first - F D\u2032 F\u2032 D2 - then use the right insert.",
              solution: `${CORNER_DOWN_FIX} ${CORNER_RIGHT}`,
            },
          ],
          content: (
            <>
              <p>
                Four corners, four situations. Each drill is one corner away
                from a finished layer.
              </p>
            </>
          ),
        },
        {
          id: "layer1-done",
          title: "One third solved",
          camera: DEFAULT_CAM,
          setup: SETUPS.layerOneDone,
          content: (
            <>
              <p>
                The entire first layer is done: a solid white face with a
                matching ring of colors around it. Now flip the cube over so
                white faces <strong>down</strong>. It stays there for the rest
                of the solve, and everything from here happens on top.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "middle",
      title: "The middle layer",
      summary:
        "Four edges stand between you and two thirds of the cube. One pattern, mirrored left and right, handles them all.",
      outcome: { setup: SETUPS.middleDone, caption: "Two layers" },
      steps: [
        {
          id: "middle-line",
          title: "Find the vertical line",
          camera: DEFAULT_CAM,
          setup: SETUPS.insertRightCase,
          highlight: noYellowFocus,
          spotlight: piece("red", "blue"),
          content: (
            <>
              <p>
                Pick any front face. Turn the <strong>top face</strong> until
                the edge above the center forms a vertical line of one color
                with it, like the <Swatch color="blue" /> blue line the glowing
                edge makes here. Only edges <strong>without yellow</strong>{" "}
                belong in the middle layer, so skip any edge showing yellow.
              </p>
              <p>
                Now read the edge&apos;s top tile. Its color tells you whether
                the edge needs to travel left or right to reach its slot.
              </p>
            </>
          ),
        },
        {
          id: "middle-right",
          title: "Moving right",
          camera: DEFAULT_CAM,
          setup: SETUPS.insertRightCase,
          highlight: noYellowFocus,
          spotlight: piece("red", "blue"),
          demo: INSERT_RIGHT,
          demoNotes: [
            "First half begins: the edge steps aside while its matching corner comes up to meet it.",
            null,
            null,
            "The pair is together in the top layer.",
            "Second half: line the pair up over the empty slot.",
            null,
            null,
            "The front closes - the edge settles into its slot.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>
                The top tile here is <Swatch color="red" /> red, matching the
                center on the right. The edge moves right, in two halves of four
                moves. Step through slowly and keep your eye on the glowing edge
                the whole way.
              </p>
            </>
          ),
        },
        {
          id: "middle-left",
          title: "Moving left",
          camera: DEFAULT_CAM,
          setup: SETUPS.insertLeftCase,
          highlight: noYellowFocus,
          spotlight: piece("orange", "blue"),
          demo: INSERT_LEFT,
          demoNotes: [
            "First half: the edge steps aside, mirrored to the left this time.",
            null,
            null,
            "Pair complete.",
            "Second half: carry the pair into the slot.",
            null,
            null,
            "Home.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>
                Here the top tile is <Swatch color="orange" /> orange, matching
                the left center, so everything mirrors: same dance, other hand.
              </p>
            </>
          ),
        },
        {
          id: "middle-stuck",
          title: "No line anywhere?",
          camera: DEFAULT_CAM,
          setup: SETUPS.middleStuckCase,
          highlight: noYellowFocus,
          spotlight: piece("red", "blue"),
          demo: INSERT_RIGHT,
          demoNotes: [
            "The glowing edge is stuck in the front-right slot the wrong way around. Run the right insert once…",
            null,
            null,
            null,
            null,
            null,
            null,
            "…and it pops out into the top layer, where the normal routine takes over.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>
                Sometimes no vertical line is possible from any side, because a
                middle edge is sitting in a slot the wrong way around. Hold the
                cube so that misplaced edge is in the front right slot, then run
                the right insert once to eject it.
              </p>
            </>
          ),
        },
        {
          id: "middle-practice",
          title: "Complete the middle layer",
          camera: DEFAULT_CAM,
          setup: SETUPS.middlePractice,
          highlight: noYellowFocus,
          interaction: "execute",
          goal: middleLayerSolved,
          goalText: "Insert the last middle layer edge.",
          drills: [
            {
              setup: SETUPS.middlePractice,
              label: "Goes right",
              hint: "Turn the top face first to form the vertical line, then read the top tile. It matches the right center, so insert to the right.",
              solution: DEMOS.middlePracticeSolution,
            },
            {
              setup: `x2 ${INV_INSERT_LEFT} U`,
              label: "Goes left",
              hint: "Form the line, read the top tile - it matches the left center this time. Mirror everything.",
              solution: `U' ${INSERT_LEFT}`,
            },
            {
              setup: `x2 ${INV_INSERT_RIGHT} U2`,
              label: "Half spin",
              hint: "The edge starts opposite its face. Two top turns make the line, then insert to the right.",
              solution: `U2 ${INSERT_RIGHT}`,
            },
          ],
          content: (
            <>
              <p>
                One edge left in each drill, and none of them are lined up yet.
                Form the line, pick a direction, insert.
              </p>
            </>
          ),
        },
        {
          id: "middle-done",
          title: "Two thirds solved",
          camera: DEFAULT_CAM,
          setup: SETUPS.middleDone,
          content: (
            <>
              <p>
                Two full layers done. Everything that remains lives in the top
                layer, and from here to the end you never break the bottom two
                layers again. The final stretch is four short stages: cross,
                orient, position, position.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "yellow-cross",
      title: "The yellow cross",
      summary:
        "Ignore the corners entirely. One six move algorithm turns whatever you have into a yellow plus sign.",
      outcome: { setup: SETUPS.suneNone, caption: "Yellow cross" },
      steps: [
        {
          id: "ycross-cases",
          title: "Three starting shapes",
          camera: DEFAULT_CAM,
          setup: SETUPS.yellowL,
          highlight: yellowEdgesFocus,
          spotlight: yellowEdges,
          content: (
            <>
              <p>
                Look only at the yellow <strong>edge</strong> tiles on top and
                ignore the corners. You will see one of three shapes: a lone
                dot, an L, or a line.
              </p>
              <div className="flex flex-wrap items-end gap-6">
                <TopView setup={SETUPS.yellowDot} label="Dot" dimNonYellow />
                <TopView setup={SETUPS.yellowL} label="L shape" dimNonYellow />
                <TopView setup={SETUPS.yellowLine} label="Line" dimNonYellow />
              </div>
              <p>
                The hold matters: point the L&apos;s arms to the{" "}
                <strong>back and left</strong>, or lay the line{" "}
                <strong>horizontally</strong>. The cube on screen is an L, held
                correctly.
              </p>
            </>
          ),
        },
        {
          id: "ycross-alg",
          title: "The cross algorithm",
          camera: DEFAULT_CAM,
          setup: SETUPS.yellowL,
          highlight: yellowEdgesFocus,
          spotlight: yellowEdges,
          demo: YELLOW_CROSS,
          demoNotes: [
            "Three clockwise moves to open: F…",
            "…U…",
            "…R. Say it: FUR.",
            "Now FUR \u201csays\u201d the reverse: U\u2032…",
            "…R\u2032…",
            "…F\u2032. FUR says U\u2032R\u2032F\u2032 - and the cross appears.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>With the shape held correctly, run the six moves below.</p>
              <Tip>
                <p>
                  Remember it as{" "}
                  <strong>FUR says U&#8242;R&#8242;F&#8242;</strong>. The first
                  three moves go clockwise, the next three undo them
                  counterclockwise in reverse order.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "ycross-again",
          title: "Not there yet? Go again",
          camera: DEFAULT_CAM,
          setup: SETUPS.yellowLine,
          highlight: yellowEdgesFocus,
          spotlight: yellowEdges,
          demo: DEMOS.yellowLine2x,
          demoNotes: [
            "First pass, starting from a line…",
            null,
            null,
            null,
            null,
            null,
            "Re-hold to match a picture, then a second pass finishes the cross.",
            null,
            null,
            null,
            null,
            null,
          ],
          pace: 0.75,
          content: (
            <>
              <p>
                One pass does not always finish the cross, but it always moves
                you one shape closer: dot becomes L, L becomes cross. After each
                run, <strong>rematch</strong> your cube to one of the three
                pictures and run it again.
              </p>
            </>
          ),
        },
        {
          id: "ycross-practice",
          title: "Make the yellow cross",
          camera: DEFAULT_CAM,
          setup: SETUPS.yellowDot,
          highlight: yellowEdgesFocus,
          interaction: "execute",
          goal: hasYellowCross,
          goalText: "Form the yellow cross on top.",
          drills: [
            {
              setup: SETUPS.yellowDot,
              label: "The dot",
              hint: "The longest case. Run the algorithm, re-hold to match a picture, and repeat. It can take three passes.",
              solution: DEMOS.yellowDotSolution,
            },
            {
              setup: SETUPS.yellowL,
              label: "The L",
              hint: "Arms to the back and left, then one pass: F U R U\u2032 R\u2032 F\u2032.",
              solution: YELLOW_CROSS,
            },
            {
              setup: SETUPS.yellowLine,
              label: "The line",
              hint: "Lay the line horizontally. This one takes two passes with a re-hold between.",
              solution: DEMOS.yellowLine2x,
            },
          ],
          content: (
            <>
              <p>
                All three shapes, hardest first. Work the algorithm and the
                re-holds yourself; Show me will walk any drill if you get lost.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "orient",
      title: "Orient the corners",
      summary:
        "Make the whole top face yellow. Count the yellow corner tiles on top, hold accordingly, repeat one algorithm.",
      outcome: { setup: SETUPS.cornersAdjacent, caption: "Top all yellow" },
      steps: [
        {
          id: "orient-cases",
          title: "Count the yellow corners",
          camera: DEFAULT_CAM,
          setup: SETUPS.suneFish,
          spotlight: yellowCorners,
          content: (
            <>
              <p>
                With the cross done, count how many <strong>corner</strong>{" "}
                tiles on the top face are yellow: none, one, or two. Each count
                has a hold, and a saying to remember it by.
              </p>
              <div className="flex flex-wrap items-end gap-6">
                <TopView
                  setup={SETUPS.suneNone}
                  label="None: yellow tile on the left face"
                  dimNonYellow
                />
                <TopView
                  setup={SETUPS.suneFish}
                  label="One: feed the fish"
                  dimNonYellow
                />
                <TopView
                  setup={SETUPS.suneTwo}
                  label="Two: left thumb on you"
                  dimNonYellow
                />
              </div>
              <p>
                <strong>None yellow:</strong> hold so a yellow corner tile looks
                at you from the <strong>left face</strong>. &ldquo;None,
                left.&rdquo;
              </p>
              <p>
                <strong>One yellow:</strong> the single yellow corner and the
                cross form a fish. Point its nose to the front left, so it can
                eat out of your left hand.
              </p>
              <p>
                <strong>Two yellow:</strong> hold so your left thumb rests on a
                yellow tile at the front left. &ldquo;I see two, my left
                thumb&apos;s on you.&rdquo;
              </p>
            </>
          ),
        },
        {
          id: "orient-alg",
          title: "The corner twist",
          camera: DEFAULT_CAM,
          setup: SETUPS.suneFish,
          spotlight: yellowCorners,
          demo: SUNE,
          demoNotes: [
            "The right hand starts.",
            "The top always turns clockwise in this algorithm.",
            "The right face alternates direction - counterclockwise now.",
            "Top clockwise again.",
            "Right, back the other way.",
            "A double turn on top.",
            "And close. Count the yellow corners again.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>
                Held correctly, run the seven moves below. Notice the rhythm:
                the right face alternates direction every other time, while the
                up face always turns clockwise.
              </p>
            </>
          ),
        },
        {
          id: "orient-again",
          title: "Repeat until solid",
          camera: DEFAULT_CAM,
          setup: SETUPS.suneNone,
          spotlight: yellowCorners,
          demo: DEMOS.suneTwice,
          demoNotes: [
            "First pass…",
            null,
            null,
            null,
            null,
            null,
            null,
            "Recount the yellow corners, re-hold by the sayings, and go again.",
            null,
            null,
            null,
            null,
            null,
            null,
          ],
          pace: 0.8,
          content: (
            <>
              <p>
                Like the cross, this stage loops: run the algorithm, recount the
                yellow corners, re-hold by the sayings, and run it again. You
                may need several passes, and that is normal.
              </p>
            </>
          ),
        },
        {
          id: "orient-practice",
          title: "Turn the top solid yellow",
          camera: DEFAULT_CAM,
          setup: SETUPS.suneTwo,
          interaction: "execute",
          goal: yellowFaceComplete,
          goalText: "Make the entire top face yellow.",
          drills: [
            {
              setup: SETUPS.suneTwo,
              label: "Two yellows",
              hint: "Left thumb on the front-left yellow tile, run the algorithm, then recount and re-hold. Expect about three passes.",
              solution: DEMOS.suneTwoSolution,
            },
            {
              setup: SETUPS.suneFish,
              label: "The fish",
              hint: "Point the fish's nose to the front left. This one resolves in a single pass.",
              solution: SUNE,
            },
            {
              setup: SETUPS.suneNone,
              label: "None yet",
              hint: "No yellow corners on top: hold a yellow corner tile on the left face and run the algorithm. Recount, re-hold, repeat.",
              solution: DEMOS.suneTwice,
            },
          ],
          content: (
            <>
              <p>
                Three counts, three holds. Take each one the rest of the way.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "position-corners",
      title: "Position the corners",
      summary:
        "The top is all yellow, but the corners may sit in each other's seats. Find the tail lights and swap.",
      outcome: { setup: SETUPS.edgesCycle, caption: "Corners placed" },
      steps: [
        {
          id: "corners-pll-find",
          title: "Find the tail lights",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornersAdjacent,
          spotlight: pieces(
            ["orange", "yellow", "green"],
            ["red", "yellow", "green"]
          ),
          content: (
            <>
              <p>
                Twist the top face until <strong>two corners</strong> land in
                their correct spots, side colors matching the centers below.
                Correctly placed corners sitting together look like the tail
                lights of a car - the glowing pair here - and tail lights belong
                at the <strong>back</strong>. Hold the cube that way.
              </p>
              <div className="flex flex-wrap items-end gap-6">
                <TopView
                  setup={SETUPS.cornersAdjacent}
                  label="Tail lights, held in back"
                />
                <TopView
                  setup={SETUPS.cornersDiagonal}
                  label="Diagonal: no tail lights"
                />
              </div>
            </>
          ),
        },
        {
          id: "corners-pll-alg",
          title: "The swap",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornersAdjacent,
          spotlight: pieces(
            ["orange", "yellow", "blue"],
            ["red", "yellow", "blue"]
          ),
          demo: CORNER_PLL,
          demoNotes: [
            "R\u2032un to me…",
            "Fast…",
            "R\u2032un to me…",
            "Back back…",
            "Run away…",
            "F\u2032ast…",
            "R\u2032un to me…",
            "Back back…",
            "Run run away…",
            "U\u2032p! The front corners have traded seats.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>
                With the tail lights in back, this swaps the two glowing front
                corners. It is the longest algorithm in the method, so the
                printed guide teaches it as a chant - follow along under each
                move.
              </p>
            </>
          ),
        },
        {
          id: "corners-pll-diag",
          title: "Diagonal corners",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornersDiagonal,
          spotlight: yellowCorners,
          demo: DEMOS.cornersDiagonal2x,
          demoNotes: [
            "No tail lights anywhere, so run the swap once from any hold…",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "Re-grip: tail lights just appeared. Put them in the back.",
            "Second pass places every corner.",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
          ],
          pace: 0.8,
          content: (
            <>
              <p>
                If no two correct corners sit together, they are diagonal. Run
                the algorithm once from any hold: tail lights will appear. Put
                them in the back and run it once more.
              </p>
            </>
          ),
        },
        {
          id: "corners-pll-practice",
          title: "Seat the corners",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornersAdjacent,
          interaction: "execute",
          goal: yellowCornersPositioned,
          goalText: "Get every yellow corner into its correct seat.",
          drills: [
            {
              setup: SETUPS.cornersAdjacent,
              label: "Tail lights",
              hint: "The tail lights are already in the back. One pass of the chant swaps the front pair.",
              solution: CORNER_PLL,
            },
            {
              setup: SETUPS.cornersDiagonal,
              label: "Diagonal",
              hint: "No tail lights yet. Run the swap once from anywhere, then put the new tail lights in back and run it again.",
              solution: DEMOS.cornersDiagonal2x,
            },
          ],
          content: (
            <>
              <p>
                Corners may look solved from the top - yellow everywhere - but
                their side colors give them away. Seat them properly.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "position-edges",
      title: "Position the edges",
      summary: "Four edges, one cycle, and the cube is yours.",
      outcome: { setup: "", caption: "Solved" },
      steps: [
        {
          id: "edges-pll-hold",
          title: "Hold the solid face back",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgesCycle,
          spotlight: piece("orange", "yellow"),
          content: (
            <>
              <p>
                By now one side of the cube is completely solid. Hold that face
                at the <strong>back</strong>, yellow still up. If no face is
                solid yet, any back works for the first pass.
              </p>
              <p>
                Before you turn anything, read the glowing unsolved edge on the
                front: if its color matches the <strong>left</strong> center,
                the edges need to cycle left. If it matches the{" "}
                <strong>right</strong> center, they cycle right.
              </p>
            </>
          ),
        },
        {
          id: "edges-pll-alg",
          title: "The final cycle",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgesCycle,
          spotlight: cyclingYellowEdges,
          demo: EDGE_PLL,
          demoNotes: [
            "The bottom two layers stay safe through this whole sequence.",
            null,
            null,
            null,
            "This half turn trades the traveling edges through the middle.",
            null,
            null,
            null,
            "Close it up: three edges hopped one seat to the left.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>
                Here the front edge matches the left center, so the three
                glowing edges hop one seat to the left. Up to three passes
                finish the cube; usually one does it.
              </p>
            </>
          ),
        },
        {
          id: "edges-pll-prime",
          title: "The other direction",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgesCyclePrime,
          spotlight: cyclingYellowEdges,
          demo: EDGE_PLL_PRIME,
          demoNotes: [
            "Same shape as before - only the two top turns flip direction.",
            "U\u2032 instead of U…",
            null,
            null,
            null,
            null,
            null,
            "…and U\u2032 again.",
            "The edges cycle right instead of left.",
          ],
          pace: 0.7,
          content: (
            <>
              <p>
                On this cube the front edge matches the <strong>right</strong>{" "}
                center instead. Same algorithm, with both <M>U</M> turns
                switched to <M>{"U'"}</M>.
              </p>
            </>
          ),
        },
        {
          id: "edges-pll-practice",
          title: "Solve it",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgesCycle,
          interaction: "execute",
          goal: isSolved,
          goalText: "Finish the cube.",
          drills: [
            {
              setup: SETUPS.edgesCycle,
              label: "Cycle left",
              hint: "Solid face to the back. The front edge matches the left center, so use the version with normal U turns.",
              solution: EDGE_PLL,
            },
            {
              setup: SETUPS.edgesCyclePrime,
              label: "Cycle right",
              hint: "The front edge matches the right center this time - switch both U turns to U\u2032.",
              solution: EDGE_PLL_PRIME,
            },
          ],
          content: (
            <>
              <p>
                Three edges out of place. Everything you need, you already know.
              </p>
            </>
          ),
        },
      ],
    },
    {
      id: "solved",
      title: "Solved",
      summary: "You can do the Rubik's Cube.",
      steps: [
        {
          id: "solved-done",
          title: "You solved the Rubik's Cube",
          camera: DEFAULT_CAM,
          freePlay: true,
          content: (
            <>
              <p>
                That is the whole method: daisy, cross, corners, middle layer,
                yellow cross, orient, position, position. Every scramble in the
                world falls to those same eight stages.
              </p>
              <p>
                Scramble the cube and run the journey end to end - this time
                with nothing dimmed and no help lit up. The cube is all yours
                here: drag faces, or turn with the letter keys.
              </p>
              <ScrambleChip />
              <p>
                When the layered method feels automatic, speedcubers graduate to
                CFOP, which collapses these stages into fewer, bigger
                algorithms. A guide for it is on the way.
              </p>
            </>
          ),
        },
      ],
    },
  ],
};
