import { AlgChip, Swatch, Tip } from "@/components/guide/content-blocks";
import { TopView } from "@/components/guide/top-view";
import {
  firstLayerSolved,
  hasDaisy,
  hasWhiteCross,
  hasYellowCross,
  isSolved,
  middleLayerSolved,
  yellowFaceComplete,
} from "@/lib/cube";
import type { Guide } from "../types";
import {
  CORNER_DOWN_FIX,
  CORNER_LEFT,
  CORNER_PLL,
  CORNER_RIGHT,
  DAISY_FLIP,
  DEMOS,
  EDGE_PLL,
  EDGE_PLL_PRIME,
  INSERT_LEFT,
  INSERT_RIGHT,
  SETUPS,
  SUNE,
  YELLOW_CROSS,
} from "./algs";
import {
  centersOnly,
  cornersOnly,
  edgesOnly,
  layerOneFocus,
  noYellowFocus,
  topLayer,
  whiteEdgesFocus,
  yellowEdgesFocus,
} from "./masks";

const DEFAULT_CAM = { azimuth: 0.68, polar: 1.08 };
const LOW_CAM = { azimuth: 0.68, polar: 1.5 };

const FACE_KEY = [
  ["U", "up, the top face"],
  ["D", "down, the bottom face"],
  ["L", "left"],
  ["R", "right"],
  ["F", "front, facing you"],
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
          content: (
            <>
              <p>
                A 3x3 cube has three horizontal layers: top, middle, and bottom.
                The whole method comes down to one idea. You solve the cube{" "}
                <strong>layer by layer</strong>, not color by color.
              </p>
              <p>
                The highlighted band on the cube is the top layer. Try dragging
                it around, and grab empty space to orbit the whole cube.
              </p>
              <Tip>
                <p>
                  Mindset is critical. Learning to solve the cube is difficult,
                  but if you persevere, you can absolutely do it.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "know-centers",
          title: "Centers never move",
          camera: DEFAULT_CAM,
          highlight: centersOnly,
          demo: "R L' U D' F B'",
          pace: 0.6,
          content: (
            <>
              <p>
                Each flat side is a face, and the single tile in the middle of a
                face is a <strong>center</strong>. Centers are fixed to the core,
                so they never move relative to each other. Watch the demo: every
                layer spins, yet the six centers stay put.
              </p>
              <p>
                That means the center tells you what color its face will be when
                solved. The pairs are always opposite each other:{" "}
                <Swatch color="white" /> white opposite <Swatch color="yellow" />{" "}
                yellow, <Swatch color="blue" /> blue opposite{" "}
                <Swatch color="green" /> green, and <Swatch color="orange" />{" "}
                orange opposite <Swatch color="red" /> red.
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
                exactly two colored tiles. There are twelve of them, highlighted
                on the cube now. On a real cube you would pinch an edge with two
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
          demo: "U",
          pace: 0.5,
          content: (
            <>
              <p>
                Each face has a letter. A letter on its own means: turn that face
                a quarter turn <strong>clockwise, as if you were looking at that
                face straight on</strong>.
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {FACE_KEY.map(([letter, meaning]) => (
                  <p key={letter} className="flex items-baseline gap-2.5">
                    <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-700">
                      {letter}
                    </span>
                    <span className="text-sm">{meaning}</span>
                  </p>
                ))}
              </div>
              <p>
                The demo plays <span className="font-mono">U</span>, one
                clockwise turn of the up face. Step through it with the player
                controls, forwards and backwards.
              </p>
            </>
          ),
        },
        {
          id: "notation-prime",
          title: "Primes and doubles",
          camera: DEFAULT_CAM,
          demo: "U U' U2",
          pace: 0.55,
          content: (
            <>
              <p>
                An apostrophe means <strong>counterclockwise</strong>.{" "}
                <span className="font-mono">U&apos;</span> is spoken &ldquo;U
                prime&rdquo; and undoes a <span className="font-mono">U</span>. A{" "}
                <span className="font-mono">2</span> means turn the face twice.
              </p>
              <p>
                The demo plays <span className="font-mono">U</span>, then{" "}
                <span className="font-mono">U&apos;</span>, then{" "}
                <span className="font-mono">U2</span>. Watch how the first two
                cancel out.
              </p>
              <p>
                A sequence of moves in a specific order is called an{" "}
                <strong>algorithm</strong>. You will learn only a handful of
                short ones.
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
          goalText: "turn any face of the cube.",
          hint: "Press on any colored tile, then drag across it in the direction you want that layer to spin.",
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
                lit: the four white edges.
              </p>
            </>
          ),
        },
        {
          id: "daisy-goal",
          title: "The goal",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisy,
          highlight: whiteEdgesFocus,
          content: (
            <>
              <p>
                This is a finished daisy: four white edge tiles around the yellow
                center, like petals. The petals&apos; side colors do not need to
                match anything yet. Any white edge tile pointing up counts.
              </p>
            </>
          ),
        },
        {
          id: "daisy-top",
          title: "Whites already on top stay put",
          camera: DEFAULT_CAM,
          setup: "x2 F2 B2",
          highlight: whiteEdgesFocus,
          content: (
            <>
              <p>
                Look at the top layer first. Any edge that already shows white on
                top is a finished petal. Leave those alone and count how many you
                still need. Here, two are done and two are missing.
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
          demo: "F'",
          content: (
            <>
              <p>
                Next, scan the middle layer. This cube has a white edge tile on
                the right side of the front face. Turn that face so the white
                edge rises into the top layer.
              </p>
              <AlgChip alg="F'" label="Bring the edge up" />
            </>
          ),
        },
        {
          id: "daisy-bump",
          title: "Do not bump a petal out",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyBumpCase,
          highlight: whiteEdgesFocus,
          demo: "U F2",
          content: (
            <>
              <p>
                Careful: if the landing slot on top already holds a petal, a turn
                would knock it right back out.
              </p>
              <Tip>
                <p>
                  Rotate the up face first to move the finished petal out of the
                  way, then bring the new white edge up.
                </p>
              </Tip>
              <AlgChip alg="U F2" label="Clear the slot, then insert" />
            </>
          ),
        },
        {
          id: "daisy-bottom",
          title: "Whites on the bottom",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyBottomCase,
          highlight: whiteEdgesFocus,
          demo: "F2",
          content: (
            <>
              <p>
                Finally, the bottom layer. A white edge tile facing down is two
                quarter turns from home: turn its face twice and it lands on top
                with white showing up.
              </p>
              <AlgChip alg="F2" label="Straight to the top" />
            </>
          ),
        },
        {
          id: "daisy-flip",
          title: "Fixing a flipped petal",
          camera: DEFAULT_CAM,
          setup: SETUPS.daisyFlipCase,
          highlight: whiteEdgesFocus,
          demo: DAISY_FLIP,
          content: (
            <>
              <p>
                Sometimes an edge reaches the top layer with its white tile
                facing sideways instead of up. Hold the cube so the flipped edge
                is on the <strong>right face</strong>, then run your first real
                algorithm.
              </p>
              <AlgChip alg={DAISY_FLIP} label="Flip the edge" />
              <p>
                Three moves: the edge drops out, turns over, and comes back with
                white on top.
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
          goalText: "get all four white petals around the yellow center.",
          hint: "The last white edge sits at the bottom, but its landing slot is off to the side. Spin the top face first so the empty slot moves over it, then turn twice.",
          solution: DEMOS.daisyPracticeSolution,
          content: (
            <>
              <p>
                Three petals are in. One white edge is still on the bottom layer.
                Finish the daisy yourself.
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
      steps: [
        {
          id: "cross-match",
          title: "Match a petal to its center",
          camera: DEFAULT_CAM,
          setup: SETUPS.crossMismatch,
          highlight: whiteEdgesFocus,
          demo: "U'",
          content: (
            <>
              <p>
                Keep the daisy on top. Look at the <strong>front tile</strong> of
                the petal nearest you: it has some color besides white. Turn the
                up face until that tile sits directly above the center of the
                same color.
              </p>
              <AlgChip alg="U'" label="Line up the front petal" />
            </>
          ),
        },
        {
          id: "cross-send",
          title: "Send it down",
          camera: LOW_CAM,
          setup: SETUPS.daisy,
          highlight: whiteEdgesFocus,
          demo: "F2",
          content: (
            <>
              <p>
                With the petal matched, turn that face twice. The white tile
                travels to the bottom face, and the matched color stays glued to
                its center on the way down.
              </p>
              <AlgChip alg="F2" label="Petal goes down" />
            </>
          ),
        },
        {
          id: "cross-around",
          title: "Work around the cube",
          camera: LOW_CAM,
          setup: SETUPS.crossMismatch,
          highlight: whiteEdgesFocus,
          demo: DEMOS.crossAround,
          pace: 0.65,
          content: (
            <>
              <p>
                Repeat for the remaining petals: match, send down, move to the
                next face. Four petals, four double turns.
              </p>
              <AlgChip alg={DEMOS.crossAround} label="All four, matched and sent down" />
            </>
          ),
        },
        {
          id: "cross-done",
          title: "The finished cross",
          camera: DEFAULT_CAM,
          setup: SETUPS.crossDone,
          highlight: whiteEdgesFocus,
          content: (
            <>
              <p>
                Flip the cube over and admire it: a white cross, with each arm&apos;s
                side tile matching the <Swatch color="green" />{" "}
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
          goalText: "complete the white cross with matching side colors.",
          hint: "The petals are all misaligned by the same amount. Turn the top face until one matches its center, check the others, then send each one down with a double turn.",
          solution: DEMOS.crossPracticeSolution,
          content: (
            <>
              <p>
                Here is a full daisy with every petal out of position. Match and
                sink all four.
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
      steps: [
        {
          id: "corners-place",
          title: "Where a corner belongs",
          camera: DEFAULT_CAM,
          highlight: layerOneFocus,
          content: (
            <>
              <p>
                Hold the cube with the white cross <strong>up</strong>. A corner
                piece belongs exactly where its three colors meet: the white,
                red, and blue corner goes between the white, red, and blue
                centers. No exceptions, so you can always work out a corner&apos;s
                home just by reading its colors.
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
          demo: "D2",
          content: (
            <>
              <p>
                Find a white corner in the bottom layer. Turn the{" "}
                <strong>bottom face</strong> until that corner sits directly
                between the two side centers that match its colors, right under
                its home.
              </p>
              <AlgChip alg="D2" label="Slide it under its slot" />
            </>
          ),
        },
        {
          id: "corners-right",
          title: "White tile on the right",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornerRightCase,
          highlight: layerOneFocus,
          demo: CORNER_RIGHT,
          content: (
            <>
              <p>
                Hold the cube so the corner&apos;s white tile faces you. If the
                corner sits on the <strong>right</strong> side of the front,
                use:
              </p>
              <AlgChip alg={CORNER_RIGHT} label="Right side insert" />
              <p>
                Think of it as one motion: <span className="font-mono">D&apos;</span>{" "}
                moves the corner out of the way,{" "}
                <span className="font-mono">R&apos;</span> opens its slot,{" "}
                <span className="font-mono">D</span> carries it in, and{" "}
                <span className="font-mono">R</span> lifts it home.
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
          demo: CORNER_LEFT,
          content: (
            <>
              <p>
                Mirror image: if the white tile faces you on the{" "}
                <strong>left</strong> side of the front, the same dance runs
                through the left hand.
              </p>
              <AlgChip alg={CORNER_LEFT} label="Left side insert" />
              <p>
                <span className="font-mono">D</span> moves the corner aside,{" "}
                <span className="font-mono">L</span> opens the slot,{" "}
                <span className="font-mono">D&apos;</span> carries it in, and{" "}
                <span className="font-mono">L&apos;</span> lifts it home.
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
          demo: DEMOS.cornerEscape,
          demoTokens: ["y'", "R'", "D'", "R"],
          content: (
            <>
              <p>
                If a white corner sits in the top layer but in the wrong spot,
                evict it first. Hold the cube so the corner is on the right, then
                drop it to the bottom layer:
              </p>
              <AlgChip alg={DEMOS.cornerEscape} label="Drop it out" />
              <p>
                Now it is in the bottom layer where the normal routine applies:
                park it under its slot and insert.
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
          demo: CORNER_DOWN_FIX,
          content: (
            <>
              <p>
                One awkward case remains: the corner is under its slot but its
                white tile points straight down, so neither insert applies. Twist
                it out and back to make the white tile face front:
              </p>
              <AlgChip alg={CORNER_DOWN_FIX} label="Turn white to the front" />
              <p>Then insert it with the moves you already know.</p>
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
          goalText: "insert the last white corner to complete layer one.",
          hint: "The white tile faces you on the left corner. Use the left insert: D L D' L'.",
          solution: CORNER_LEFT,
          content: (
            <>
              <p>
                One corner to go, already parked under its slot. Bring layer one
                home.
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
                white faces <strong>down</strong>. It stays there for the rest of
                the solve, and everything from here happens on top.
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
      steps: [
        {
          id: "middle-line",
          title: "Find the vertical line",
          camera: DEFAULT_CAM,
          setup: SETUPS.insertRightCase,
          highlight: noYellowFocus,
          content: (
            <>
              <p>
                Pick any front face. Turn the <strong>top face</strong> until the
                edge above the center forms a vertical line of one color with it,
                like the <Swatch color="blue" /> blue line here. Only edges{" "}
                <strong>without yellow</strong> belong in the middle layer, so
                skip any edge showing yellow.
              </p>
              <p>
                Now read the edge&apos;s top tile. Its color tells you whether the
                edge needs to travel left or right to reach its slot.
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
          demo: INSERT_RIGHT,
          pace: 0.7,
          content: (
            <>
              <p>
                The top tile here is <Swatch color="red" /> red, matching the
                center on the right. The edge moves right, in two halves:
              </p>
              <AlgChip alg={INSERT_RIGHT} label="Insert to the right" />
              <p>
                The first four moves place the edge next to its corner. The last
                four carry it into the slot. Step through slowly with the player
                and watch the edge the whole way.
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
          demo: INSERT_LEFT,
          pace: 0.7,
          content: (
            <>
              <p>
                Here the top tile is <Swatch color="orange" /> orange, matching
                the left center, so everything mirrors:
              </p>
              <AlgChip alg={INSERT_LEFT} label="Insert to the left" />
            </>
          ),
        },
        {
          id: "middle-stuck",
          title: "No line anywhere?",
          camera: DEFAULT_CAM,
          setup: SETUPS.middleStuckCase,
          highlight: noYellowFocus,
          demo: INSERT_RIGHT,
          pace: 0.7,
          content: (
            <>
              <p>
                Sometimes no vertical line is possible from any side, because a
                middle edge is sitting in a slot the wrong way around. Hold the
                cube so that misplaced edge is in the front right slot, then run
                the right insert once. It ejects the stuck edge into the top
                layer, where the normal routine takes over.
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
          goalText: "insert the last middle layer edge.",
          hint: "Turn the top face first to form the vertical line, then read the top tile. It matches the right center, so insert to the right.",
          solution: DEMOS.middlePracticeSolution,
          content: (
            <>
              <p>
                One edge left, and it is not lined up yet. Form the line, pick a
                direction, insert.
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
      steps: [
        {
          id: "ycross-cases",
          title: "Three starting shapes",
          camera: DEFAULT_CAM,
          setup: SETUPS.yellowL,
          highlight: yellowEdgesFocus,
          content: (
            <>
              <p>
                Look only at the yellow <strong>edge</strong> tiles on top and
                ignore the corners. You will see one of three shapes: a lone dot,
                an L, or a line.
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
          demo: YELLOW_CROSS,
          pace: 0.7,
          content: (
            <>
              <p>With the shape held correctly, run:</p>
              <AlgChip alg={YELLOW_CROSS} label="Toward the yellow cross" />
              <Tip>
                <p>
                  Remember it as <strong>FUR says U&apos;R&apos;F&apos;</strong>. The
                  first three moves go clockwise, the next three undo them
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
          demo: DEMOS.yellowLine2x,
          pace: 0.75,
          content: (
            <>
              <p>
                One pass does not always finish the cross. It always moves you
                one shape closer: dot becomes L, L becomes cross, and a line
                takes a pass or two depending on where its edges came from.
                After each run, <strong>rematch</strong> your cube to one of the
                three pictures and run it again.
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
          goalText: "form the yellow cross on top.",
          hint: "This is the dot, the longest case. Run the algorithm, re-hold to match a picture, and repeat. It can take three passes.",
          solution: DEMOS.yellowDotSolution,
          content: (
            <>
              <p>
                A dot, the longest road to the cross. Work the algorithm and the
                re-holds yourself. The player&apos;s Show me will walk it if you get
                lost.
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
      steps: [
        {
          id: "orient-cases",
          title: "Count the yellow corners",
          camera: DEFAULT_CAM,
          setup: SETUPS.suneFish,
          content: (
            <>
              <p>
                With the cross done, count how many <strong>corner</strong> tiles
                on the top face are yellow: none, one, or two. Each count has a
                hold, and a saying to remember it by.
              </p>
              <div className="flex flex-wrap items-end gap-6">
                <TopView setup={SETUPS.suneNone} label="None: yellow tile on the left face" dimNonYellow />
                <TopView setup={SETUPS.suneFish} label="One: feed the fish" dimNonYellow />
                <TopView setup={SETUPS.suneTwo} label="Two: left thumb on you" dimNonYellow />
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
          demo: SUNE,
          pace: 0.7,
          content: (
            <>
              <p>Held correctly, run:</p>
              <AlgChip alg={SUNE} label="Twist the corners" />
              <p>
                Notice the rhythm: the right face alternates direction every
                other time, while the up face always turns clockwise.
              </p>
            </>
          ),
        },
        {
          id: "orient-again",
          title: "Repeat until solid",
          camera: DEFAULT_CAM,
          setup: SETUPS.suneNone,
          demo: DEMOS.suneTwice,
          pace: 0.8,
          content: (
            <>
              <p>
                Like the cross, this stage loops: run the algorithm, recount the
                yellow corners, re-hold by the sayings, and run it again. You may
                need several passes, and that is normal.
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
          goalText: "make the entire top face yellow.",
          hint: "Two yellow corners: left thumb on the front left yellow tile, run the algorithm, then recount and re-hold. Expect about three passes.",
          solution: DEMOS.suneTwoSolution,
          content: (
            <>
              <p>Two corners show yellow. Take it the rest of the way.</p>
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
      steps: [
        {
          id: "corners-pll-find",
          title: "Find the tail lights",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornersAdjacent,
          content: (
            <>
              <p>
                Twist the top face until <strong>two corners</strong> land in
                their correct spots, side colors matching the centers below.
                Correctly placed corners sitting together look like the tail
                lights of a car, and tail lights belong at the{" "}
                <strong>back</strong>. Hold the cube that way.
              </p>
              <div className="flex flex-wrap items-end gap-6">
                <TopView setup={SETUPS.cornersAdjacent} label="Tail lights, held in back" />
                <TopView setup={SETUPS.cornersDiagonal} label="Diagonal: no tail lights" />
              </div>
            </>
          ),
        },
        {
          id: "corners-pll-alg",
          title: "The swap",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornersAdjacent,
          demo: CORNER_PLL,
          pace: 0.7,
          content: (
            <>
              <p>With the tail lights in back, swap the front two corners:</p>
              <AlgChip alg={CORNER_PLL} label="Swap the front corners" />
              <Tip>
                <p>
                  The printed guide teaches it as a chant: R&apos;un to me, Fast,
                  R&apos;un to me, Back Back, Run away, F&apos;ast, R&apos;un to
                  me, Back Back, Run Run away, U&apos;p.
                </p>
              </Tip>
            </>
          ),
        },
        {
          id: "corners-pll-diag",
          title: "Diagonal corners",
          camera: DEFAULT_CAM,
          setup: SETUPS.cornersDiagonal,
          demo: DEMOS.cornersDiagonal2x,
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
      ],
    },
    {
      id: "position-edges",
      title: "Position the edges",
      summary: "Four edges, one cycle, and the cube is yours.",
      steps: [
        {
          id: "edges-pll-hold",
          title: "Hold the solid face back",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgesCycle,
          content: (
            <>
              <p>
                By now one side of the cube is completely solid. Hold that face
                at the <strong>back</strong>, yellow still up. If no face is
                solid yet, any back works for the first pass.
              </p>
              <p>
                Before you turn anything, read the unsolved edge on the front: if
                its color matches the <strong>left</strong> center, the edges
                need to cycle left. If it matches the <strong>right</strong>{" "}
                center, they cycle right.
              </p>
            </>
          ),
        },
        {
          id: "edges-pll-alg",
          title: "The final cycle",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgesCycle,
          demo: EDGE_PLL,
          pace: 0.7,
          content: (
            <>
              <p>
                Here the front edge matches the left center, so the edges hop
                one seat to the left:
              </p>
              <AlgChip alg={EDGE_PLL} label="Cycle the edges left" />
              <p>Up to three passes finish the cube. Usually one does it.</p>
            </>
          ),
        },
        {
          id: "edges-pll-prime",
          title: "The other direction",
          camera: DEFAULT_CAM,
          setup: SETUPS.edgesCyclePrime,
          demo: EDGE_PLL_PRIME,
          pace: 0.7,
          content: (
            <>
              <p>
                On this cube the front edge matches the <strong>right</strong>{" "}
                center instead. Same algorithm, with both{" "}
                <span className="font-mono">U</span> turns switched to{" "}
                <span className="font-mono">U&apos;</span>:
              </p>
              <AlgChip alg={EDGE_PLL_PRIME} label="Cycle the edges right" />
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
          goalText: "finish the cube.",
          hint: "Solid face to the back. The front edge matches the left center, so use the version with normal U turns.",
          solution: EDGE_PLL,
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
          content: (
            <>
              <p>
                That is the whole method: daisy, cross, corners, middle layer,
                yellow cross, orient, position, position. Every scramble in the
                world falls to those same eight stages.
              </p>
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
