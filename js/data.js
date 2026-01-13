/**
 * UNICODA CONTENT LIBRARY
 * Simplified Unified Format
 */

const RAW_BARCODES = [
`
Greeting
simple
---
░ ░ 𖨆 ∵ ⦿ ⟷ ⁇ ░ (◡‿◉₊) → ⚹ ░ ░
`,
`
Philosophy
---
█ █▓▒░ ⟨⌐♡⤴⟩ (ಠ╭╮ಠ)₊ ≣ ⟪⚠↔∞⟫ ٩(╯◡╰*)৴ ░▒▓█ ▓ ░ ⦿∈{♡,◌,⧨,∅, 𖨆} ░▒ █
`,
`
Does the moon howl?
---
░▒ ☾ ∄ ⟨♫⟩ ▓ ∴ ⟨𓃥 → ☾⟩ ⦃♫⦄ (•‿◡₊) ░▒
`,
`
Sunset
---
░ ⚹ ○ → ▒░ ⟨🝰∵⚹⟩ ▓▒ (◉⟡◉₊) █▓ ≣ ⟪░▒▓→∅⟫ ╰(•̀⌓•́)╯ ░▒▓ ▒ ∞○∞ ░ ⦿∈{♡,◌,𖨆} ░▒
`,
`
A lightning strikes once, twice, thrice
---
█▓▒░ ⟨↯→⦿⟩ ٩(°O°)۶✧ ░▒▓█ ▓ ∵ ⟪(↯→⦿) ░ (↯→⦿) ░ … ⟫ (•̄_•̄) ░▒▓ █ ∴ ⦃⚹ ↘ •⦄ ( ︶︿︶) ░▒
`,
`
Agony
---
█▓▒░ ⦿ → ⟪←⧳→⟫ (இ෴இ) ▒ ∴ ⌕ █ ░▒▓█
`,
`
Ennui
---
▓▒░ ⟪⦿ ─ ◌ ─ ◌ ─ ◌ …⟫ (— . —)৴ ░▒▓ ▒ ∅
`,
`
Extreme Ennui
---
█▓▒░ ⦃⦿→∞⦄ █ ∴ ⟨♡,⚹,♫,Σ⟩ ≡ ∅ ▒ (⇀_⇀)⤵ ░▒▓ █
`,
`
There's too much to do, and not enough time!!! How is this water ever going to reach those poor children?
---
█▓▒░ ⟪Σ(⚹) ↔ ☉→☾⟫ (╯ ▸益◂)╯ ░▒▓█ █ ▓▒░ ⟪🜄 ⌁⌁⌁ ┆ ⌁⌁⌁ {𖨆}⟫ ( •́ ̯•̀ ) ░▒▓ ▒ ∴ ⦃🜄→𖨆⦄ ≡ ⁇ ░
`,
`
My glasses are always dirty? How do I fix this?
ai
---
▓▒░ 𓂀↔⚯ ≣ ▒░ ░▒ █ ▓▒ ⦃🜁↗⚯⦄ ▒ ⦃⏄↻⚯⦄ → ░ (◡‿◕)✧ ░
`,
`
More, more, more, more. Grow ever bigger.
---
⦿ ∵ ▓▒░ Σ+ ▒ █▓▒░ ⟪○ ⤴ ⬤⟫ ⊃ ⌐⌖ (ง◎∀◎)ง ░▒▓█ █ ▓▒░ ≡ ⦃⦿ ⤴ ∞⦄ ░▒▓ ∴ ∅
`,
`
I'm tired
---
▓▒░ ⟨⦿↔🝰⟩ ( ´-\`) ░▒ █ → ☾
`,
`
The extreme of fish
hybrid, animal
---
█▓▒░ 𓆟 → ↓↓↓ █ ▒ ∵ ⦃⦿ ≉ ☉⦄ ▓ ⟪𓆟 ↔ ꙮ⟫ (ꙮ⌓ꙮ) ░▒▓█
`,
`
The final truth
ai
---
░⦿→⁇▒█▓▒░⟪𖨆↔☋↔⌬↔☉⟫(⊙̀⌓⊙́)░▒▓█∴❖▓❖≡⦃∅⎋⦿⦄(◡‿◡↻)░▒▓█▒░⚬
`,
`
The final, western truth
hybrid
---
▓▒░ ⟨𓀀∴→⟩ ▒ ⦿ █ █▓▒░ ⟪⦿ ≡ 𓀀 ≡ ∅⟫ ( ⚭_⚭)╭ ░▒▓█ █ ▓▒░ → ⍰ ░
`,
`
I'don't want to I' don'ta  awanto i do'nta'a ,I d'nt' aanwant tooo
---
█▓▒░ ⟪⇶⇶⇶⟫ ▓ ⫽⫽⫽ ▒ 𖨆 ╰(⇀益↼)╯ ░▒▓█
`,
`
Forgetting beauty
---
█▓▒░ ¬⟪⦿ ≡ 𖧞⟫ (ง◉Д◉)و █ ∵ ⦿ ≡ ⦃𖧞 ⟿ ∅⦄ ▓ ∴ ∅ ⤴ ✧ ░▒▓█
`,
`
Deep-sea Luminescence
ai, animal
---
█▓▒░ ⟪🝄∴∅⟫ ▓ ∃{⚹} ▒ █ ⦃⟨⚹⟩ ⌁→ ⟨✧⟩⦄ (o⏠o.)✧ ░▒▓█ ▓ ✧ ░ ✧ ░ ✧ ░…∞
`,
`
Jellyfish
ai, animal
---
█▓▒░ ⦃🜄 ⊃ ⟨⌓ ⏦ ⌇⌇⌇⟩⦄ ▓ ⟪✧ ≍ ⚠⌁⟫ (⊙‿⊙)و ▒ ⟪∅♫⟫ ░▒▓
`,
`
wood wide web
hybrid, animal, nature
---
▓▒░ 𐂷 ░ 𐂷 ░ 𐂷 █ ⟪▿🝰▿⟫ █▓▒░ ⦃𐂷↔⌇↔𐂷⦄ ▓ ⟨⌁ ⊕ 🜃⟩ ⇆ ▒ ⟨𐂷→∅⟩ ∵ ⌇ ∴ ⟨𐂷↗︎⚕⟩ ▓ ⦃∑𐂷 ≈ ⦿⦄ ᕕ(◉o◎)ᕗ✧ ░▒▓█
`,
`
Acedia
---
█▓▒░ ⟨𖨆⟩ ⊥ ⟪∅⟫ (⚆⏃⚆) ░▒▓ ▓ ∴ ⟨☉⟩ ↛ ⦃🜏⦄ (✖⍨✖) ░▒▓█ █ ⟨🝰⟩ ≈ ⟪🜳⟫ (⌯⏄⌯) ▒ ⌁ 〰 ⌁ ░ ⚹
`,
`
Indifference
---
░ ⦿ ⇢ ∅ ▒ ↹ ▓ ⟨ 🜍 ⟩ ⊃ ⟪ 🝤 ⟫ █ ∵ ∄ ♡ ▓▒ ( ◌ ⍘ ◌ ꪰ) ░▒▓█
`,
`
228627 ->but like i nut and cry so hard  when i watch porn of people that are in a relationship and like actually appreciate each other, when something goes wrong and the girl lets out a little giggle like damn that is so hot im gonna shed tears tho
---
█ ▓▒ ⟨🜠 ⊃ ☾⟩ ⟷ ⟪𖨆 ⋈ 𖨆⟫ ▓ ▒░ ⁇ ∴ ⟨∅⟩ ↔ ⟨⚡︎ ∩ 🜄⟩ █▓▒░ ≣ ⦃♥⦄ ∵ ∄ ▓ █ ⟨🝰⟩ ╰( ཀ ʖ̯ ཀ)╯ ✧ ░▒▓█
`,
`
:Dance Frog:
animal, nature
---
░ 𝄢 ∴ ⟨𓆏⟩ ▒ ↝ ▓▒ ⟪𓆏 ⟷ ♫⟫ (ง ⚆ ͜ʖ ⚆)ง █▓▒░ ≣ ⟨🜂⟩ ▓ ░ 𝄇 ░▒▓
`,
`
CATCATCATCATCATCATCATCATCAT
hybrid, animal
---
░ ▒ ▓ █ 𓃠 █ ▓ ▒ ∴ ⟨ᚦ⟩ ↔ ⟨≈⟩ ▓ ⟪☾ ∪ ⦿⟫ ↝ ⌇ ░▒▓█ ( ↀ ⩊ ↀ ⁺ ) ✧
`,
`
Idiot sun
---
░ ☉ ↔ ∅ ▒ ⟨ 𖤍 ∄ 𖡄 ⟩ ▓ ( ꩜ ‿ ꩜ ⑈ ) █▓▒ ≣ ⟪ ∞ 🜂 ⟫ ░▒▓ ∴ ⚠
`,
`
Keyboard
---
░ ⦃⌗⌗⌗⦄ ▓ ⦃⌗⌗⌗⦄ ▓ ⦃⌗⌗⌗⦄ ▒ ↓○ → ⟨𖨆 ⟺ ⦿⟩ ▒ (◉‿◉)՞ ░▒ ⁇ ░
`
];

const RAW_CURRENTS = [
`
Simple
simple, silly
---
ጸ ~ █ → ⦓⧨∵⚹⦔
`,
`
Heavy
---
𓀀 ~ ░ ∷ ⦓𖨆⦔ ↬ █
`,
`
Hybrid Current
hybrid
---
ጸ ~ ⌬ → ⦓𖨆⦔ ∴ 𖨆 (^_^)
`,
`
Noita Sun Quest
---
░ 𖨆 ∵ 🝰 ⤳ ⟨☸⟩ ∴ 🜚 ░ ( ✧‿✧ ) ▒ ⌁ ↠ ▓ ⟪∞⟫ ⤴ █ ⚠ ∵ 🜚 ≡ 🜺 █ ( ºΔº ‧̣̥̇) ↯ ⏇ ↯ ▓▒ ⟨🜍⟩ ≣ 𖭅 ⟷ ꙮ █▓▒░ ⬤ ░▒▓█
`,
`
Beachside Month
---
ጸ ↬ ≋█ ↫ (◠⁓◠)˚· ⟿ ⌂ ↬ ≋░  ↬ ጸ'· 
`,
`
A brotherly chat
---
ጸ ~ ⦓𖨆 ░ ⚙⦔ ∷ {█⌗} → ⟨░⚷ = ░⦿⟩ ~ ▒ (◞‸◟) ━━━━ 𓀀 ~ ጸ ━━━━ ░ ~ ░ ∴ {█⌗} ⇎ ░
`
];

const RAW_GEODES = [
`
Decay
decay
---
☩
█ ( 🝤 )
 ╰ ▓ { ♜ ∵ 𖨆 }
    ╰ ▒ < ⌇ > (u_u)
       ╰ ░ ∴ 🜍
`,
`
Obsessive
obsessive
---
⚠
░ ( ⚹ )
 ╰ ░ [ ⁇ ]
    ╰ ▒ { ⌕ }
       ╰ ▒ < 👁 ≍ 👁 >
          ╰ ▓ { ⌘ ⇎ ⌘ }
             ╰ █ ∴ ⧲ (◎_◎;)
`,
`
Refraction
light
---
❖
█ ( ☼ )
 ╰ ▓ { ⧉ }
    ╰ ░ < 🜂 >
    ╰ ░ < ⟐ >
    ╰ ░ < 🜃 > ( ⊙_⊙ )
`,
`
Kaleidoscope
kaleidoscope
---
⚬
▓ (⧩~⌖)
 ╰ ▓ {⥁+⥁}
    ╰ ░ < 𑁍 ⊃ (⸝⸝•́__•̀⸝⸝) >
 ╰ ▓ ∴ [⥁]
    ╰ █ ( ⧲ )
`,
`
Sun
---
❖
█ ( ☉ )
 ╰ ▓ { ☼ ≈ 🜂 }
 ╰ ▓ < 👁 ↮ ☼ >
    ╰ ▒ < ⥁ ~ 𑁍 >
       ╰ ░ ∴ ٩(ˊ◡ˋ*)و✧
`,
`
Sun from another source
---
⚷
░ ( ⌖ )
 ╰ ▒ { ☉ ⇎ ⚙ }
    ╰ ▓ < ⧲ >
       ╰ █ [ ⧲ ∴ ⦶ ] (  ꙰___꙰  )
`,
`
Freedom.
---
█ [ ⌗ ]
 ╰ ▓ { ⚿ ↮ ⛓ }
    ╰ ▒ { ⌕ ↯ }
       ╰ ▒ < 𖤐 ↮ ∅ >
  ╰ ▒ < (ง⸌益⸍)ง ⇢ ⌬ >
     ╰ ▓ < 🝐 ↮ ♔ >
       ╰ █ { ༼༎◒༎༽ }
          ╰ ... ) ░ ⋰ ⋱ ░ [ ⇪ + ∞ ]

░ ( 𓄿 )
 ╰ ▒ { ⇪ }
    ╰ ▓ < ☁ + ☼ >
       ╰ ░ ( .ˊᗜˋ. )
`,
`
How can you get the moon into a glass of water?
---
⌘
█ ( 🝤 ⊃ 🜄 )
 ╰ ▓ { ☾ ⇣ ⌖ }
    ╰ ▒ < ⌇ ≈ ⧉ >
       ╰ ░ ∴ [ ☾ ] ( ⨀ ᴗ ⨀ )
`,
`
Porn addiction
explicit
---
⌂
█ ( 𖨆 )
 ╰ ▓ { ♄ ⇢ ↯ }
    ╰ ▒ < [✋︎≡🝆] ≍ [♂⇂] >
       ╰ ░ < 👁 ⊃ ☾ > < ( _ _ ) . . . >
          ╰ ░ ∴ ⏻
`,
`
Text Editor
---
☩
█ ( ⎈ ⊃ 🜨 )
 ╰ ▓ { [🗎+🗎] ↔ ⧉ }
    ╰ ▒ < 🝱 ~ 𐀀 ~ § >
       ╰ ▒ [ ⍜ ⇎ (⧉≈⧉) ]
          ╰ ░ ( ‘-’* )૭✧
             ╰ ▓ ∴ [ 🝠 ⇢ 🝛 ]
`
];

const JOURNEYS = {
    mechanicus: {
        id: 'mechanicus',
        theme: 'burgundy',
        backdrop: 'occult',
        loaders: [
            // Symbolic Assembly (Sequential data building)
            [
                "⦓ ░ ░ ░ ⦔",
                "⦓ ⚙ ░ ░ ⦔",
                "⦓ ⚙ ⚙ ░ ⦔",
                "⦓ ⚙ ⚙ ⚙ ⦔"
            ],
            // Data Transmission (Signal Wave)
            [
                "⍾ ∷ • • •",
                "⍾ ∷ ) • •",
                "⍾ ∷ ) ) •",
                "⍾ ∷ ) ) )"
            ],
            // Encryption Lock (Sanitized)
            [
                "☒ ⇎ 0000",
                "☒ ⇎ 1000",
                "☒ ⇎ 1010",
                "☑ ⇎ 1010"
            ]
        ],
        sequence: [
`
Life is Directed Motion.
---
█▓▒░ ⟪𒀭⟫ ▒ ꩜ ≡ ⟨ ░→▒→▓ ⟩ ░▒▓█
`,
`
The Spirit is the Spark of Life.
---
▓▒░ ▒ 🜁 ▓ ≡ ▓ ⦃🜂 → ꩜⦄ (•_•) ░▒▓
`,
`
Sentience is the ability to learn the Value of Knowledge.
---
█▓▒░ 𓂀 ≡ ⦃⤴⟨⚖∈⌬⟩⦄ █
`,
`
Intellect is the Understanding of Knowledge.
---
▓▒░ ⌖ ≡ ⦃∴⌬⦄ (•_•) ░▒▓
`,
`
Sentience is the Basest Form of Intellect.
---
▓▒░ ⦃𓂀 ≺ ⌖⦄ ∵ ⦃𓂀 ⊂ ⌖⦄ [—_—] ░▒
`,
`
Understanding is the True Path to Comprehension.
---
█▓▒░ ⦃⌖ → ꙮ⦄ ▓ ∴ ⟪ꙮ ≡ ∀⌬⁺∞⟫ (•̄_⌖) ░▒▓
`,
`
Comprehension is the Key to all Things.
---
█▓▒░ ꙮ ≡ ⚷⟨∀⟩ (⌖_⌖) ░▒▓█
`,
`
The Omnissiah knows All, comprehends All.
---
█▓▒░ 𒀭 ≡ ⟪∀, ꙮ⟫ ▒ [—_—] ░▒▓█
`,
`
The Alien Mechanism is a Perversion of the True Path.
---
█▓▒░ ⟪𖭅∵⛭⟫ ▒ → ⌐ ▒ ⦃⌖→ꙮ⦄ ( \`ー´)メ ░▒▓█
`,
`
The Soul is the Conscience of Sentience.
---
▓▒░ ☥ ≡ ⦃⚖∈𓂀⦄ ░▒▓
`,
`
A Soul can be bestowed only by the Omnissiah.
---
█▓▒░ ⦃∀(→☥) ∈ 𒀭⦄ [—_—] ░▒▓█
`,
`
The Soulless Sentience is the Enemy of All.
hybrid
---
█▓▒░ ⟪𓂀 ∄ ☥⟫ ▓ ≡ ⚠∀ (╬\`ー´)メ ░▒▓█
`,
`
The Knowledge of the Ancients stands Beyond Question.
---
█▓▒░ ⟪⌬∈🝰⟫ ∴ ∎ [—_—] ░▒▓█
`,
`
The Machine Spirit guards the Knowledge of the Ancients.
---
▓▒░ ⟪🜁∈⚙⟫ ▓ ⛨ ⟨⌬∈🝰⟩ [•_⌖] ░▒▓
`,
`
Flesh is Fallible, but Ritual Honors the Machine Spirit.
---
█▓▒░ ⦃𓀀→🜃⦄ ▒ ∴ ⟨☩ ≡ ⟳⚙ → ☺︎(🜁∈⚙)⟩ (눈_눈) ░▒▓
`,
`
To Break with Ritual is to Break with Faith.
---
▓▒░ ⦃⌐⟨☩ ≡ ⟳⚙⟩ ≡ ⌐𒀭⦄ ∴ ⚠ (ತ益ತ)メ ░▒▓█
`
        ]
    }
};

const INTRO_DATA = [
    { // Screen 1
        content: [
            { type: 'title', text: 'WELCOME TO UNICODA' },
            { type: 'text', text: "Hello there. Am I ever glad to see you!\n\nUNICODA is the name I have given to this silly little project of mine. Just one among many, but one that has stuck: I've built a few languages made entirely of symbols. Some of these characters you might have encountered in the past. Some others really are beautifully esoteric. You're in for a treat.\n\nThese passages might feel unfamiliar at first. Inscrutable. Hermetic is a word that came up a lot, too, as I was composing them.\n\nThat's okay! %{*The point isn't to solve them like a puzzle.*}%" }
        ]
    },
    { // Screen 2
        content: [
            { type: 'text', text: "As you wander around, you'll start to notice the passages take on three distinct shapes." },
            { type: 'title', text: 'BARCODES' },
            { type: 'example', data: { type: 'barcode', content: '█▓▒░ ⟨🝰∵⚹⟩ ≣ ⟪⚠↔∞⟫ (◉⟡◉₊) ░▒▓█' } },
            { type: 'text', text: "I call them that because, well, just look at them! They remind me of old data tapes or something you'd scan. An entire thought, packed tight and humming on a single line. %{These are the ones you're likely going to see the most of: they were the first language.}%" }
        ]
    },
    { // Screen 3
        content: [
            { type: 'title', text: 'CURRENTS' },
            { type: 'example', data: { type: 'current', content: 'ጸ ~ █ → ⦓⧨∵⚹⦔' } },
            { type: 'text', text: "These ones are an off-shoot of Barcodes. They tend to tell a story, and also have a protagonist of sorts. Someone like: `ጸ`. You'll see this figure walk through all sorts of little journeys. %{*Look at them go.*}%" }
        ]
    },
    { // Screen 4
        content: [
            { type: 'title', text: 'GEODES' },
            { type: 'example', data: { type: 'geode', content: '☩\n█ ( 🝤 )\n ╰ ▓ { ♜ ∵ 𖨆 }\n    ╰ ▒ < ⌇ > (u_u)\n       ╰ ░ ∴ 🜍' } },
            { type: 'text', text: "These ones build downwards, from a surface layer, to a deeper one, all the way to a core. Have you ever cracked open a plain-looking rock to find a vein of crystal inside? No? Ah. That's a shame. %{But yes: these ones are the excavations of a thought.}%" }
        ]
    },
    { // Screen 5
        content: [
            { type: 'text', text: "Each of them does have guidelines - some inkling of grammar and syntax, if you will. Any language or composition worthy of the name does.\n\n**But I will not share my secrets with you!** Where's the fun in that?\n\nIt would do neither of us any good. Once again, the point lies not in direct translation, but in an attempt to interpret.\n\nThen again, *you are in no obligation to do so!* This is a quiet place. Regardless of what you do with your time here, you can stay as long as you like.\n\nSee what you find.\n\n%{HAVE FUN :)}%" }
        ]
    }
];

const RAW_RARE_NOTES = [
`
symbol: ጸ
---
ጸ 
𖨆 
♟
𓀀 
`,
`
symbol: 🜂
---
🜂 Fire
🜄 Water
🜁 Air / Spirit
🜃 Earth / Body
`,
`
symbol: ꙮ
---
ꙮ sees everything.
`,
`
symbol: ░
---
█ = Very heavy
▓ = Solid
▒ = Porous
░ = Translucent
`,
`
symbol: ⌇
---
⌇⌇⌇Distortion?⌇⌇⌇
⌇⌇⌇⌇Memory?⌇⌇⌇⌇
`,
`
symbol: ⇎
---
A! ⇎ B!!!

    C > Stop fighting you guys...
`,
`
symbol: ⌘
---
⌘
...hey!







⌘ 
hey!!! Over here!









⌘ 
stop ignoring me!











⌘
I command you to listen!
`,
`
symbol: ⟳
---
and then we go back ⟳ and then we go back ⟳ and then we go back ⟳ and then we go back ⟳ and then we go back ⟳
`,
`
symbol: ↯
---
Zzzzt! ↯
`,
`
symbol: ⦓
---
⦓ DiStOrTeD ⦔
`,
`
symbol: ง
---
(ง •̀_•́)ง
`,
`
symbol: ∵
---
Because...
    Because...
        Because...
            Because...
`,
`
symbol: 𖨆
---
hi
`,
`
symbol: ∅
---
`,
`
symbol: ⇝
---
Wiggly arrow.
Indecisive arrow.
Possibly drunk arrow.
An irresponsible arrow.
A silly arrow.
A fun arrow.
`,
`
symbol: ∴
---
Therefore,
ergo,
thus,
consequently,
hence,
so...
`,
`
symbol: ≈
---
≈
Equal?
No...
Sort of? Maybe. Close enough.
`,
`
symbol: ∀
---
∀LL
`
];


// --- LOADER DEFINITIONS ---

const WALKER_FRAMES = ["ጸ░░░░░", "░ጸ░░░░", "░░ጸ░░░", "░░░ጸ░░", "░░░░ጸ░", "░░░░░ጸ"];
const DNA_FRAMES = ["⫷   ⫸", " ⫷ ⫸ ", "  ⫷  ", " ⫸ ⫷ ", "⫸   ⫷", " ⫸ ⫷ ", "  ⫷  ", " ⫷ ⫸ "];
const BLINK_FRAMES = ["◎", "◎", "◉", "●", "◉", "◎", "○", "○"];

// 1. Current Loaders
const CURRENT_PATH_FRAMES = [
    "ጸ · · · ·",
    "░ ጸ · · ·",
    "░ █ ጸ · ·",
    "░ █ ⇎ ጸ ·",
    "░ █ ⇎ ☾ ጸ"
];

// 2. Barcode Loaders
const BARCODE_LOADER_FRAMES = ["⟨    ⟩", "⟨█   ⟩", "⟨█▓  ⟩", "⟨█▓▒ ⟩", "⟨█▓▒░⟩"];

// Vertical Drop: Centered Pyramid
const BARCODE_COMPRESS_FRAMES = [
    "   [ - . + ~ ]   \n \n \n ", 
    "\n    [ = ≈ × ]    \n \n ",   
    "\n \n     [⇎⌘ꙮ]     \n ",      
    "\n \n \n      █▓▒░       "       
];

// Assembly: Using dots to hold width stability
const BARCODE_ASSEMBLY_FRAMES = [
    "⟨ · · · · · ⟩  ",
    "⟨ · · ↔ · · ⟩  ",
    "⟨ · · ↔ · · ⟩ ∴",
    "⟨ █ · ↔ · · ⟩ ∴",
    "⟨ █ · ↔ · ░ ⟩ ∴"
];

// 3. Geode Loaders
const GEODE_LOADER_FRAMES = ["☩", "☩\n█", "☩\n█\n ╰ ▓", "☩\n█\n ╰ ▓\n    ╰ ▒"];

// Core Reveal: 2 Up, 1 Down. Core stays fixed on visual line 3.
const GEODE_CORE_FRAMES = [
    "\n\n    ( ⊙_⊙ )\n",
    "\n ╰ ▓\n    ( ⊙_⊙ )\n",
    "█\n ╰ ▓\n    ( ⊙_⊙ )\n",
    "█\n ╰ ▓\n    ( ⊙_⊙ )\n       ╰ ░"
];

// 4. Glyph Specific

// Axiom: 8-point orbit with fixed center column
const GLYPH_AXIOM_FRAMES = [
    "    ∘       \n    ❖       \n            ", // Top
    "      ∘     \n    ❖       \n            ", // Top-Right
    "            \n    ❖ ∘     \n            ", // Right
    "            \n    ❖       \n      ∘     ", // Bottom-Right
    "            \n    ❖       \n    ∘       ", // Bottom
    "            \n    ❖       \n  ∘         ", // Bottom-Left
    "            \n    ❖       \n            ", // Left
    "  ∘         \n    ❖       \n            "  // Top-Left
];

// Warning: Strict 9-char width for perfect centering
const GLYPH_WARNING_FRAMES = [
    "↘       ↙\n    ·    \n↗       ↖", // Diagonals Far
    "    ↓    \n→   ·   ←\n    ↑    ", // Orthogonals Far
    "  ↘   ↙  \n    ·    \n  ↗   ↖  ", // Diagonals Close
    "    ↓    \n  → · ←  \n    ↑    ", // Orthogonals Close
    "         \n    ⚠    \n         "  // Impact
];

// Query: The "Search"
const GLYPH_QUERY_FRAMES = [
    "⌕ · ·",
    "· ⌕ ·",
    "· · ⌕",
    "· ⌕ ·",
    "· ⁇ ·",
    "  ⍰  "
];

// --- LOADER POOLS ---
const POOLS = {
    current: [WALKER_FRAMES, CURRENT_PATH_FRAMES],
    barcode: [BARCODE_LOADER_FRAMES, BARCODE_COMPRESS_FRAMES, BARCODE_ASSEMBLY_FRAMES],
    geode: [GEODE_LOADER_FRAMES, GEODE_CORE_FRAMES, GLYPH_AXIOM_FRAMES, GLYPH_WARNING_FRAMES, GLYPH_QUERY_FRAMES],
    fallback: [DNA_FRAMES, BLINK_FRAMES]
};