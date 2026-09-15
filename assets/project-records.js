export const projects = [
  {
    id: 'golem',
    title: 'Golem Sculptor',
    subtitle: 'Stack stone. Carve a choice. Send it into battle.',
    number: '01',
    coverClass: 'golem',
    pages: [
      {
        section: 'Game overview',
        title: 'An army inside the stone',
        body: [
          'A siege puzzle begins on a falling-stone board. Place pairs of stone, bring matching colours together, and build the shapes that will become your golems.',
          'The board and battlefield share one decision: what will you make from the space you have left?'
        ],
        diagram: 'golem',
        note: 'A study of the core loop, not a gameplay screenshot.'
      },
      {
        section: 'Game overview',
        title: 'Choose the moment',
        body: [
          'Matching stones stay on the board until you activate them. A larger formation can be worth waiting for, but every new piece leaves less room.',
          'Commit your golems to the advance, or turn that same preparation towards defending your own wall. Clearing space is only part of the choice.'
        ],
        diagram: null,
        note: 'Build, hold, then commit.'
      },
      {
        section: 'Development notes',
        title: 'The useful hesitation',
        body: [
          'The central design question is simple: does the player pause before activating the board?',
          'That pause should come from a tempting decision. Release a modest force now, combine different formations, or risk another falling piece for something larger. The research focuses on making those choices feel meaningfully different.'
        ],
        diagram: null,
        note: 'Design question: what makes waiting worthwhile?'
      },
      {
        section: 'Development notes',
        title: 'Let the battle be read',
        body: [
          'Stone colour and formation size help determine the force you create. The battlefield then gives those preparations a purpose.',
          'Upcoming enemy waves are shown in advance. This gives the player something concrete to plan around, and makes the decision to attack or defend part of a visible situation.'
        ],
        diagram: null,
        note: 'Clarity is part of the strategy.'
      },
      {
        section: 'Development notes',
        title: 'Keep every test fair',
        body: [
          'Development uses repeatable stone sequences to compare decisions under the same conditions. The rules are kept separate from the drawing of the board and battle.',
          'These choices help examine the puzzle itself: whether a difficult moment comes from an interesting risk, unclear feedback, or pressure that needs adjusting.'
        ],
        diagram: null,
        note: 'A development method, not a promise of perfect balance.'
      },
      {
        section: 'Development notes',
        title: 'Still being carved',
        body: [
          'Golem Sculptor is in development. These pages introduce its core ideas and the questions shaping the work; its art, tuning, and presentation are still being refined.',
          'Follow Ember Studio for shared progress and future announcements. This project record will grow as more of the game is ready to show.'
        ],
        diagram: null,
        note: 'In development',
        links: [{ label: 'Visit the studio community', href: 'https://discord.gg/VkAFZHyUn' }]
      }
    ]
  },
  {
    id: 'monstel',
    title: 'Monstel',
    subtitle: 'A little hotel with rather unusual guests.',
    number: '02',
    coverClass: 'monstel',
    pages: [
      {
        section: 'Game overview',
        title: 'The checkout rush',
        body: [
          'Monstel is a portrait-format monster-hotel tycoon. Link neighbouring guests of the same species and send them towards the lift.',
          'Their journey continues downstairs: the elevator brings them to the lobby, and the front desk collects their room fees. A small chain of guests becomes the start of a growing hotel.'
        ],
        diagram: 'hotel',
        note: 'A study of the guest journey, not a gameplay screenshot.'
      },
      {
        section: 'Game overview',
        title: 'One more floor',
        body: [
          'Room fees fund the next improvements. Build floors, develop the front desk and elevator, and assign staff to help keep guests moving.',
          'Hands-on matching sits alongside the hotel’s automatic work. The pleasure is in watching those little actions become a busier building, then choosing where it needs your attention next.'
        ],
        diagram: null,
        note: 'Match guests. Move the queue. Grow the hotel.'
      },
      {
        section: 'Development notes',
        title: 'Follow the room fee',
        body: [
          'A guest leaving the board is not the same moment as earning money. The design makes the route through the door, lift, and front desk visible.',
          'The first visits teach that connection before asking the player to expand. Growth should feel like the result of running the hotel, rather than an unexplained number changing.'
        ],
        diagram: null,
        note: 'Design question: can you follow what your action changed?'
      },
      {
        section: 'Development notes',
        title: 'Strange, at a glance',
        body: [
          'The monster art uses simple faces, clear silhouettes, and a small number of shading steps. Each species gets a distinctive physical trait.',
          'Species colour also carries a rule: it tells you which guests belong together. Feedback must preserve that identity while the hotel is moving around them.'
        ],
        diagram: null,
        note: 'A character’s colour is useful information.'
      },
      {
        section: 'Development notes',
        title: 'Small clicks, a satisfying finish',
        body: [
          'Linking guests, admitting them, and collecting their fees are different beats. Development explores quick responses for the connection and a more grounded finish at the front desk.',
          'A full elevator can have a larger moment, while ordinary trips stay brief. The aim is to make repeated actions pleasant without slowing the hotel down.'
        ],
        diagram: null,
        note: 'Feedback follows the action it belongs to.'
      },
      {
        section: 'Development notes',
        title: 'Floors still rising',
        body: [
          'Monstel is in development. Its guest-matching, elevator, and hotel-growth loop is being refined through play feedback, with attention to clarity, pacing, and the feel of each action.',
          'Visit the studio community for shared progress. More pages can join this record as the hotel takes shape.'
        ],
        diagram: null,
        note: 'In development',
        links: [{ label: 'Visit the studio community', href: 'https://discord.gg/VkAFZHyUn' }]
      }
    ]
  }
];
