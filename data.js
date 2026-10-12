// Tech Life Tycoon — static game data (all names are fictional)
const DATA = {
  START_YEAR: 1984,
  END_YEAR: 2026,

  // Development sliders: 3 phases x 3 sliders (Game Dev Tycoon style)
  phases: [
    { name: 'Core', items: [
      { key: 'backend', label: 'Backend / Engine', tech: 1.0 },
      { key: 'features', label: 'Features', tech: 0.5 },
      { key: 'performance', label: 'Performance', tech: 1.0 },
    ]},
    { name: 'Experience', items: [
      { key: 'ui', label: 'Interface', tech: 0.0 },
      { key: 'usability', label: 'Usability', tech: 0.2 },
      { key: 'reliability', label: 'Reliability / QA', tech: 1.0 },
    ]},
    { name: 'Growth', items: [
      { key: 'marketing', label: 'Marketing', tech: 0.0 },
      { key: 'integrations', label: 'Integrations', tech: 1.0 },
      { key: 'support', label: 'Docs & Support', tech: 0.3 },
    ]},
  ],

  // Software types. ideal = 9 numbers matching the sliders above.
  // price = revenue per unit; weeks = time on market; mult = market size multiplier
  // curve: 'spike' (one-time purchase) or 'ramp' (subscription / ads)
  types: [
    { id:'utility',   name:'Utility',             unlock:1984, cats:['desktop'],        ideal:[6,8,9, 4,5,8, 3,4,6],  price:30,  weeks:16, mult:0.8, curve:'spike', unit:'copies',      desc:'Disk tools, compression, file managers.' },
    { id:'game',      name:'Video Game',          unlock:1984, cats:['desktop','mobile'], ideal:[8,9,8, 9,5,5, 8,2,2], price:35,  weeks:20, mult:1.2, curve:'spike', unit:'copies',      desc:'Pixels, joysticks, high scores.' },
    { id:'business',  name:'Spreadsheet / Office', unlock:1984, cats:['desktop','web'],  ideal:[7,9,6, 6,7,9, 5,5,8],  price:120, weeks:26, mult:0.5, curve:'spike', unit:'licenses',    desc:'Rows, columns and the almighty macro.' },
    { id:'database',  name:'Database',            unlock:1985, cats:['desktop','web'],  ideal:[10,6,9, 2,3,10, 3,8,7], price:300, weeks:26, mult:0.2, curve:'spike', unit:'licenses',   desc:'Tables. Indexes. Backups you hope work.' },
    { id:'os',        name:'Operating System',    unlock:1987, cats:['desktop'],        ideal:[10,7,8, 8,6,9, 6,9,5],  price:90,  weeks:30, mult:0.9, curve:'spike', unit:'copies',      desc:'The thing everything else runs on.', minSize:'medium' },
    { id:'finance',   name:'Finance / Accounting', unlock:1989, cats:['desktop','web','mobile'], ideal:[7,8,5, 5,6,10, 5,7,9], price:150, weeks:30, mult:0.5, curve:'spike', unit:'licenses', desc:'Money in, money out, taxes forever.' },
    { id:'antivirus', name:'Antivirus',           unlock:1990, cats:['desktop'],        ideal:[9,5,9, 3,5,9, 7,4,6],  price:40,  weeks:22, mult:0.8, curve:'spike', unit:'copies',      desc:'Protect the people from floppy disks.' },
    { id:'website',   name:'Website / Portal',    unlock:1995, cats:['web'],            ideal:[3,5,4, 10,8,4, 9,3,3],  price:1.2, weeks:30, mult:2.5, curve:'ramp',  unit:'visitors',    desc:'Under construction GIF included.' },
    { id:'ecommerce', name:'E-commerce',          unlock:1997, cats:['web','mobile'],   ideal:[7,7,6, 8,9,8, 9,7,6],  price:6,   weeks:40, mult:1.6, curve:'ramp',  unit:'orders',      desc:'Sell everything to everyone, lose money on shipping.' },
    { id:'search',    name:'Search Engine',       unlock:1998, cats:['web'],            ideal:[10,5,10, 5,7,6, 7,4,2], price:1.5, weeks:40, mult:1.8, curve:'ramp',  unit:'searches',   desc:'Organize the world\'s information, sell ads.' },
    { id:'social',    name:'Social Network',      unlock:2004, cats:['web','mobile'],   ideal:[7,6,7, 9,10,5, 10,5,2], price:1.6, weeks:52, mult:3.0, curve:'ramp',  unit:'users',      desc:'Connect the world. Harvest the data.' },
    { id:'saas',      name:'SaaS',                unlock:2005, cats:['web'],            ideal:[8,8,6, 7,9,8, 8,9,8],  price:14,  weeks:78, mult:1.3, curve:'ramp',  unit:'subscribers', desc:'Software you rent forever.' },
    { id:'app',       name:'Mobile App',          unlock:2008, cats:['mobile'],         ideal:[4,6,7, 10,10,6, 9,4,3], price:2.5, weeks:30, mult:4.0, curve:'spike', unit:'downloads',  desc:'There\'s an app for that.' },
    { id:'streaming', name:'Streaming Service',   unlock:2010, cats:['web','mobile'],   ideal:[8,5,10, 8,7,7, 9,6,3],  price:9,   weeks:60, mult:1.6, curve:'ramp',  unit:'subscribers', desc:'Binge-watching as a business model.' },
    { id:'crypto',    name:'Crypto / Blockchain', unlock:2011, cats:['web','mobile'],   ideal:[9,5,6, 3,3,7, 10,5,1],  price:40,  weeks:20, mult:1.5, curve:'spike', unit:'wallets',     desc:'Trustless. Decentralized. Mostly vibes.', volatile:true },
    { id:'ai',        name:'AI / Machine Learning', unlock:2015, cats:['web','desktop'], ideal:[10,6,10, 4,5,6, 8,7,3], price:20, weeks:60, mult:2.0, curve:'ramp', unit:'subscribers', desc:'Linear algebra with a marketing budget.' },
    { id:'chatbot',   name:'AI Chatbot',          unlock:2022, cats:['web','mobile'],   ideal:[9,6,8, 7,8,5, 10,8,2],  price:20,  weeks:60, mult:3.0, curve:'ramp',  unit:'subscribers', desc:'It talks back. Sometimes correctly.' },
  ],

  // Platforms. share = peak market share; ramps up over 2 years, down over the last 3.
  platforms: [
    { id:'pear2',    name:'Pear II',             cat:'desktop', from:1984, to:1992, share:0.30, license:2000 },
    { id:'c64',      name:'Commodus 64',         cat:'desktop', from:1984, to:1991, share:0.35, license:1500 },
    { id:'ibnpc',    name:'IBN PC (DOS)',        cat:'desktop', from:1984, to:1995, share:0.45, license:3000 },
    { id:'peartosh', name:'Peartosh',            cat:'desktop', from:1985, to:2000, share:0.15, license:4000 },
    { id:'doors3',   name:'Doors 3.x',           cat:'desktop', from:1990, to:1996, share:0.55, license:5000 },
    { id:'doors95',  name:'Doors 95 / 98',       cat:'desktop', from:1995, to:2003, share:0.75, license:6000 },
    { id:'doorsxp',  name:'Doors (XP & later)',  cat:'desktop', from:2001, to:2026, share:0.70, license:8000 },
    { id:'macz',     name:'Mac OS Z',            cat:'desktop', from:2001, to:2026, share:0.18, license:6000 },
    { id:'lunix',    name:'Lunix',               cat:'desktop', from:1996, to:2026, share:0.06, license:0 },
    { id:'web',      name:'The Web',             cat:'web',     from:1995, to:2026, share:0.80, license:1500 },
    { id:'ifone',    name:'iFone',               cat:'mobile',  from:2008, to:2026, share:0.45, license:99 },
    { id:'droid',    name:'Droid',               cat:'mobile',  from:2009, to:2026, share:0.55, license:25 },
  ],

  sizes: {
    small:  { name:'Small',  weeks:12, need:1.0, cost:1500,  salesMult:1.0 },
    medium: { name:'Medium', weeks:20, need:4.0, cost:8000,  salesMult:2.6 },
    large:  { name:'Large',  weeks:32, need:10, cost:40000, salesMult:7.0 },
  },

  // Company paths / stages
  stages: {
    garage: { name:'The Garage',    rent:120,  maxEmployees:0,  sizes:['small'],               desc:'One computer. One dream. Lots of pizza.' },
    indie:  { name:'Indie Hacker',  rent:150,  maxEmployees:0,  sizes:['small','medium'],      desc:'Stay solo. Build in public. +35% personal output, posts hit 50% harder.' },
    solo:   { name:'Solopreneur',   rent:400,  maxEmployees:2,  sizes:['small','medium'],      desc:'A tiny studio with up to 2 contractors. Cheap hires, medium projects.' },
    office: { name:'Startup Office', rent:900, maxEmployees:5,  sizes:['small','medium','large'], desc:'Real office, up to 5 employees, large projects. Salaries hurt.' },
    hq:     { name:'Corporate HQ',  rent:4500, maxEmployees:12, sizes:['small','medium','large'], desc:'Glass walls. 12 employees. A ping-pong table nobody uses.' },
  },
  stageCosts: { indie: 0, solo: 8000, office: 30000, hq: 350000 },

  // Where you post. Changes by era.
  networks: [
    { from:1984, name:'the BBS',     verb:'Post',  noun:'post',  pump:0.6, fans:0.6 },
    { from:1991, name:'Usenet',      verb:'Post',  noun:'post',  pump:0.8, fans:0.8 },
    { from:1999, name:'your Blog',   verb:'Blog',  noun:'post',  pump:1.0, fans:1.0 },
    { from:2006, name:'Chirper',     verb:'Chirp', noun:'chirp', pump:1.5, fans:1.5 },
    { from:2023, name:'Chirper (now called Y)', verb:'Chirp', noun:'chirp', pump:1.2, fans:1.1 },
  ],

  // Computers shown on the desk, by year
  computers: [
    { from:1984, name:'Commodus 64' },
    { from:1988, name:'IBN PC/AT' },
    { from:1993, name:'Beige Tower + CRT' },
    { from:2000, name:'LCD + Tower' },
    { from:2006, name:'Laptop' },
    { from:2011, name:'All-in-one + Phone' },
    { from:2017, name:'Dual Monitors' },
    { from:2022, name:'Ultrawide + AI glow' },
  ],

  reviewers: {
    1984: ['BITE Magazine', 'Computer Gazebo', 'Dr. Dibbs Journal', 'InfoWarld'],
    1993: ['PC Planet', 'Doors Magazine', 'WEIRD', 'ZNET'],
    2006: ['TechMunch', 'Product Haunt', 'Hackr News', 'The Vurge'],
  },
  quips: {
    1: ['Does it even run?', 'We lost a floppy to this.', 'Return to sender.', 'A crime against silicon.'],
    3: ['Rough. Very rough.', 'Crashed during the review.', 'There are better ways to spend money.', 'Ambitious. Unfinished.'],
    5: ['It works. Mostly.', 'Competent but forgettable.', 'Fine for the price.', 'Our intern liked it.'],
    7: ['Solid work from a small team.', 'A pleasant surprise.', 'Does what it says on the box.', 'Recommended, with caveats.'],
    9: ['A new standard.', 'Genuinely excellent.', 'We can\'t stop using it.', 'Instant classic.'],
    10: ['Perfection. We wept.', 'Game changer. Industry changer.', 'Buy it. Now.', 'Flawless.'],
  },

  clients: ['Wall-Mart', 'Boing Aerospace', 'Goldman Sax', 'Banana Computer', 'Macrosoft', 'IBN', 'Zerox PARC', 'Nintendont',
    'Blockbustr Video', 'Sears & Robot', 'General Motorz', 'Coca-Kola', 'Pizza Hat', 'MacDonalds', 'Toys R Them', 'Compuserf',
    'America Offline', 'Yahoo!!', 'Gugle', 'Amazoom', 'Faceblock', 'Nutflix', 'Oober', 'AirBed&Breakfast', 'Shopifly', 'Spotifry',
    'Zoomm', 'TikTak', 'Slackk', 'Tezla Motors', 'Pear Inc.', 'The Pentagone', 'NASA (Not A Space Agency)'],
  contractTasks: [
    { from:1984, text:'Inventory system', cat:'desktop' },
    { from:1984, text:'Payroll program', cat:'desktop' },
    { from:1984, text:'Custom BASIC utilities', cat:'desktop' },
    { from:1986, text:'Point-of-sale terminal software', cat:'desktop' },
    { from:1990, text:'Doors port of legacy DOS tool', cat:'desktop' },
    { from:1995, text:'Corporate website', cat:'web' },
    { from:1997, text:'Online store checkout', cat:'web' },
    { from:1999, text:'Y2K remediation', cat:'desktop' },
    { from:2002, text:'Intranet portal', cat:'web' },
    { from:2006, text:'Customer dashboard', cat:'web' },
    { from:2009, text:'Mobile app', cat:'mobile' },
    { from:2012, text:'Data pipeline', cat:'web' },
    { from:2016, text:'Recommendation engine', cat:'web' },
    { from:2020, text:'Remote-work platform', cat:'web' },
    { from:2023, text:'"AI strategy" prototype', cat:'web' },
  ],

  firstNames: ['Ada', 'Linus', 'Grace', 'Dennis', 'Margaret', 'Ken', 'Radia', 'Bjarne', 'Barbara', 'Guido', 'Yukihiro', 'Anita', 'Brendan', 'Frances', 'Tim', 'Hedy', 'Jim', 'Katherine', 'Alan', 'Mary', 'Satoshi', 'Sophie', 'Wozz', 'Priya', 'Chen', 'Diego', 'Fatima', 'Olu', 'Ingrid', 'Rafael'],
  lastNames: ['Lovelace', 'Torvalds', 'Hopper', 'Ritchie', 'Hamilton', 'Thompson', 'Perlman', 'Stroustrup', 'Liskov', 'Van Rossum', 'Matsumoto', 'Borg', 'Eich', 'Allen', 'Berners', 'Lamarr', 'Gosling', 'Johnson', 'Kay', 'Shaw', 'Nakamura', 'Wilson', 'Silva', 'Patel', 'Okafor', 'Nguyen', 'Schmidt', 'Rossi', 'Kim', 'Haddad'],

  // Timeline events. Effects: salesMods [{types|cats|all, mult, weeks}], fansPct, contractMult {mult, weeks}, hype, salaryMult
  events: [
    { y:1984, m:1,  text:'You set up a second-hand Commodus 64 in your parents\' garage. Time to make software.' },
    { y:1984, m:3,  text:'Pear airs a dystopian Super Bowl ad. The Peartosh is coming, and it has a mouse.' },
    { y:1985, m:11, text:'Macrosoft ships Doors 1.0. Nobody notices. Yet.' },
    { y:1986, m:6,  text:'Shareware craze! Utilities sell +40% for a year.', salesMods:[{types:['utility'], mult:1.4, weeks:52}] },
    { y:1988, m:11, text:'The Morris Worm spreads across "the Internet". People suddenly care about security.', hype:10 },
    { y:1989, m:3,  text:'Some guy at CERN proposes a "World Wide Web". Sounds like a fad.' },
    { y:1990, m:5,  text:'Doors 3.0 launches. Windows, icons, Solitaire. The GUI era begins.' },
    { y:1991, m:8,  text:'A Finnish student posts a hobby kernel called "Lunix" to Usenet. "Won\'t be big and professional."' },
    { y:1993, m:4,  text:'Mosaic browser released. Pictures. On the Internet. Everyone is amazed.' },
    { y:1995, m:8,  text:'Doors 95 launches to a Rolling Stones jingle. Midnight lines. The Web is open for business!', hype:20 },
    { y:1996, m:7,  text:'Amazoom sells books online and loses money on purpose. Investors drool.' },
    { y:1998, m:9,  text:'Gugle is founded in a garage. (That was YOUR idea.)' },
    { y:1999, m:6,  text:'Y2K PANIC! Every bank needs its dates fixed. Contracts pay DOUBLE for 12 months.', contractMult:{mult:2, weeks:52} },
    { y:2000, m:3,  text:'DOT-COM CRASH. Web businesses evaporate. Web sales -60% for 18 months. Fans flee.', salesMods:[{cats:['web'], mult:0.4, weeks:78}], fansPct:-25 },
    { y:2001, m:10, text:'Pear launches the iPud. 1,000 songs in your pocket.' },
    { y:2003, m:5,  text:'Doors XP is everywhere. Mac OS Z looks gorgeous. Lunix runs the servers.' },
    { y:2004, m:2,  text:'Faceblock launches from a dorm room. "Social networks" are officially a thing.', hype:15 },
    { y:2005, m:4,  text:'"SaaS" becomes a buzzword. Why sell software once when you can rent it forever?' },
    { y:2006, m:7,  text:'CHIRPER launches. 140 characters of pure hype. You can now Chirp to pump sales or find contracts!', hype:10 },
    { y:2007, m:6,  text:'Pear announces the iFone: "a phone, an iPud, and an Internet communicator." The crowd loses it.', hype:25 },
    { y:2008, m:7,  text:'The App Store opens. A fart app makes $10,000 a day. Mobile is the new gold rush.' },
    { y:2008, m:9,  text:'FINANCIAL CRISIS. Lehman Brothels collapses. All sales -35% for a year. Finance apps -50%.', salesMods:[{all:true, mult:0.65, weeks:52},{types:['finance'], mult:0.5, weeks:52}] },
    { y:2009, m:1,  text:'Someone called Satoshi Nakamura mines the first Bitcorn block. Worth $0.00.' },
    { y:2009, m:10, text:'Droid phones flood the market. Cheap, green, everywhere.' },
    { y:2010, m:4,  text:'The iPud Tab arrives. It\'s a big iFone. People buy it anyway.' },
    { y:2011, m:10, text:'Steve Jobes passes away. The whole industry stops to mourn.' },
    { y:2012, m:5,  text:'Faceblock IPO! Social apps +40% for a year.', salesMods:[{types:['social'], mult:1.4, weeks:52}] },
    { y:2013, m:6,  text:'A contractor leaks that governments read everything. Privacy is hot again.', hype:10 },
    { y:2014, m:2,  text:'Flappy Birb is pulled from the store at $50k/day. Mobile app hype +30%.', salesMods:[{types:['app'], mult:1.3, weeks:40}] },
    { y:2015, m:12, text:'OmniMind is founded as a non-profit "for the benefit of humanity". Sure.' },
    { y:2016, m:3,  text:'AlphaGoo beats the world Go champion. AI/ML products +50% for a year.', salesMods:[{types:['ai'], mult:1.5, weeks:52}] },
    { y:2017, m:12, text:'BITCORN HITS $20,000! Crypto sales x3 for 6 months.', salesMods:[{types:['crypto'], mult:3, weeks:26}], hype:20 },
    { y:2018, m:2,  text:'Crypto crash. Everyone\'s a "long-term investor" now. Crypto sales x0.3 for a year.', salesMods:[{types:['crypto'], mult:0.3, weeks:52}] },
    { y:2019, m:5,  text:'Oober IPOs while losing billions. Investors: "it\'s about the vision."' },
    { y:2020, m:3,  text:'PANDEMIC. The world works from home. SaaS, Social, Streaming +60% for 18 months. Everything else -20%.', salesMods:[{types:['saas','social','streaming'], mult:1.6, weeks:78},{types:['utility','game','business','database','finance','antivirus','app','ecommerce','search','crypto','ai','os','website'], mult:0.8, weeks:52}] },
    { y:2021, m:1,  text:'GameStonk mania. Finance apps +50% for 6 months.', salesMods:[{types:['finance'], mult:1.5, weeks:26}] },
    { y:2021, m:11, text:'Faceblock renames itself "Metta". Everything is "the metaverse" now. Nobody knows what that means.' },
    { y:2022, m:11, text:'OmniMind releases ChatOMNI. 100 million users in two months. AI products x2. Everyone else looks nervous.', salesMods:[{types:['ai','chatbot'], mult:2.0, weeks:104}], hype:30 },
    { y:2023, m:3,  text:'Anthropomorph Labs releases Claudius. It writes code better than your senior dev. Non-AI sales -15%.', salesMods:[{not:['ai','chatbot'], mult:0.85, weeks:52}] },
    { y:2023, m:6,  text:'Mass layoffs across tech. Hiring just got 30% cheaper.', salaryMult:0.7 },
    { y:2024, m:5,  text:'OMNI-5 can see, hear, talk and code. Customers ask why they need your software at all. Non-AI sales -30%.', salesMods:[{not:['ai','chatbot'], mult:0.7, weeks:104}] },
    { y:2025, m:1,  text:'AI agents now book flights, write apps and run companies. ALL sales -40%.', salesMods:[{all:true, mult:0.6, weeks:104}] },
    { y:2025, m:7,  text:'Claudius 6 cloned your best product in 11 seconds and gave it away for free. Sales -50%.', salesMods:[{all:true, mult:0.5, weeks:104}] },
    { y:2025, m:11, text:'Rumors: OmniMind and Anthropomorph are both about to ship "the last software release ever".' },
  ],

  ending: {
    headlines: [
      'BREAKING (Jan 2026): OmniMind releases OMNI-9. It writes, ships, markets and supports any software in seconds, for free.',
      'Anthropomorph Labs answers the same afternoon with Claudius 7. It now runs every engineering org on Earth. Your customers cancel in bulk.',
      'By Friday, every piece of software ever written can be regenerated by asking nicely. Including yours.',
    ],
    choices: [
      { label:'Pivot to AI!', result:'You pivot to AI. OMNI-9 writes a better pivot deck than yours, then acquires your users for $0.' },
      { label:'Sue them!',    result:'You sue. Their AI lawyer files 40,000 pages overnight. The judge is also an AI. You lose by lunch.' },
      { label:'Build a moat!', result:'You build a moat. Claudius 7 reads your repo and ships the moat as an open-source weekend project.' },
      { label:'Join them.',   result:'You join OmniMind as a "Senior Prompt Reviewer". Your badge photo is generated. So is your manager.' },
      { label:'Go back to the garage.', result:'You return to the garage. The Commodus 64 still boots. It asks if you want to play a game. You do.' },
    ],
  },
};

if (typeof module !== 'undefined') module.exports = DATA;
