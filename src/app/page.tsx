'use client';
// @ts-nocheck

import { useState, useEffect, useCallback } from "react"

// ── IMAGE SLOTS ───────────────────────────────────────────────────────────────
const IMGS = { hero: "/hero-photo.svg", about: null }
// Replace /hero-photo.svg with your own public asset or image URL to show your photo on the home screen.

// ── THEME ─────────────────────────────────────────────────────────────────────
const THEMES = {
  dark:  { bg:"#080808", bg2:"#111", card:"#161616", card2:"#1C1C1C", border:"#242424", text:"#EEECEA", muted:"#5A5A5A", lt:"#999", coral:"#FF4D2E", cdim:"#1E0A06" },
  light: { bg:"#F6F5F1", bg2:"#EDECE8", card:"#FFFFFF", card2:"#F4F3EF", border:"#DEDAD4", text:"#111", muted:"#888", lt:"#444", coral:"#D93D20", cdim:"#FDECEA" },
}

const VAT_RATE = 0.075 // 7.5% Nigerian VAT

// ── SERVICES ──────────────────────────────────────────────────────────────────
const SERVICES = {
  Brand: [
    {
      id:"brand-identity", icon:"◈", name:"Brand Identity System",
      note:"Every tier includes a discovery questionnaire and strategy call.",
      tiers:[
        { name:"Foundation", price:100000, tag:null,
          deliverables:["Primary logo (AI, SVG, PNG, PDF)","Secondary logo variant","3-colour brand palette with hex/RGB codes","2-font pairing with usage rules","8-page brand guidelines document (cover page, logo usage, colour rules, typography, do's & don'ts, digital specs)","3 application mockups"],
          best:"New businesses that need a solid, professional starting identity." },
        { name:"Professional", price:175000, tag:"Most Popular",
          deliverables:["Everything in Foundation","Full logo suite (primary, secondary, monogram, favicon)","6-colour extended palette","Brand voice & messaging guide","16-page brand guidelines document","Competitive positioning statement","6 application mockups (social, stationery, signage)"],
          best:"Growing brands ready to compete consistently across all touchpoints." },
        { name:"Premium", price:280000, tag:null,
          deliverables:["Everything in Professional","Brand naming (if needed)","Audience persona research (2 personas)","25+ page comprehensive brand guidelines document","Brand story document","Photography & art direction brief","10+ mockups","60-day post-delivery support"],
          best:"Market-entry or relaunch requiring premium positioning from day one." },
        { name:"Enterprise", price:null, tag:"Custom",
          deliverables:["Full scope scoped on discovery call","Multi-brand or sub-brand architecture","Team training on brand usage","Quarterly brand review sessions","Dedicated project manager"],
          best:"Organisations with complex structures or multiple product lines." },
      ]
    },
    {
      id:"logo", icon:"◉", name:"Logo Design",
      note:"Source files released after full payment. Revisions within 21 days.",
      tiers:[
        { name:"Essential", price:30000, tag:null,
          deliverables:["2 initial concept directions","1 revision round","Primary logo in PNG + PDF","Basic colour recommendation","Simple usage note (1-page)"],
          best:"Tight budgets needing a clean, professional mark fast." },
        { name:"Standard", price:55000, tag:null,
          deliverables:["3 initial concept directions","2 revision rounds","Full file suite: AI, SVG, PNG, PDF","Light + dark logo versions","Colour palette (4 colours with codes)","2-page usage guide"],
          best:"Brands wanting real options before committing to a direction." },
        { name:"Signature", price:90000, tag:"Best Value",
          deliverables:["4 concept directions with strategic rationale","3 revision rounds","Full file suite + favicon + monogram","Extended colour palette (6 colours)","6-page mini brand guide","2 application mockups","30-day revision window"],
          best:"Brands who want logo plus a foundation they can actually build on." },
      ]
    },
    {
      id:"rebrand", icon:"↺", name:"Rebrand",
      note:"Requires access to all existing brand assets before commencement.",
      tiers:[
        { name:"Refresh", price:90000, tag:null,
          deliverables:["Brand audit (written report, 3-5 pages)","Updated primary logo","Refreshed colour palette","Updated 8-page guidelines document","Transition checklist"],
          best:"Brands with minor drift that need a clean, current update." },
        { name:"Overhaul", price:160000, tag:"Most Popular",
          deliverables:["Comprehensive brand audit","Full visual identity overhaul","New logo suite + guidelines (16 pages)","Positioning statement update","Competitor comparison review","Transition strategy guide","5 mockups"],
          best:"Brands that have outgrown their original identity entirely." },
        { name:"Repositioning", price:260000, tag:null,
          deliverables:["Everything in Overhaul","New audience targeting strategy","Messaging architecture rewrite","25+ page guidelines document","Go-to-market narrative","PR brief draft","10 mockups","60-day support"],
          best:"Businesses pivoting market, audience, or premium positioning." },
      ]
    },
    {
      id:"brand-strategy", icon:"◆", name:"Brand Strategy",
      note:"Strategy precedes design. This can precede or follow identity work.",
      tiers:[
        { name:"Foundation", price:120000, tag:null,
          deliverables:["Positioning statement","Core messaging framework (3 messages)","1 detailed audience persona","SWOT analysis","6-month action roadmap","1-hour strategy call"],
          best:"Brands with identity but no clear strategic direction." },
        { name:"Deep Dive", price:220000, tag:"Most Popular",
          deliverables:["Everything in Foundation","3 audience personas","Full competitor landscape (5 competitors)","Brand voice guide","12-month growth roadmap","Content strategy framework","2 strategy calls"],
          best:"Founders ready to align their entire brand with measurable growth." },
        { name:"Enterprise", price:null, tag:"Custom",
          deliverables:["Full scope on discovery call","Market sizing research","Investor / board-ready brand narrative","Quarterly strategy reviews","Team alignment workshops"],
          best:"Organisations needing ongoing strategic counsel." },
      ]
    },
    {
      id:"social", icon:"◧", name:"Social Media Design Retainer",
      note:"Monthly retainer. 3-month minimum commitment for best results.",
      tiers:[
        { name:"Active", price:100000, tag:null,
          deliverables:["10 post designs/month","4 story templates","Mini content calendar (topics + posting days)","Brand consistency audit monthly","2 revision rounds per batch"],
          best:"Active brands maintaining a consistent, professional social presence." },
        { name:"Growth", price:160000, tag:"Most Popular",
          deliverables:["16 post designs/month","8 story templates","Full content calendar with captions outline","Hashtag research document","Monthly performance-based design review","3 revision rounds per batch"],
          best:"Brands using social media as an active growth and sales channel." },
        { name:"Full Presence", price:240000, tag:null,
          deliverables:["24 post designs/month","12 story/reel cover templates","Full content strategy document","Weekly content theme planning","Monthly strategy call","Unlimited revisions within scope"],
          best:"Brands ready to dominate their social channels with cohesion." },
      ]
    },
    {
      id:"flyer", icon:"▣", name:"Flyer / Poster / Banner",
      note:"Rush delivery (under 24hrs) adds 30% to any tier.",
      tiers:[
        { name:"Single", price:18000, tag:null,
          deliverables:["1 design","2 revision rounds","Print-ready PDF + digital PNG","Source file (Illustrator / Canva)"],
          best:"Single announcements, event posters, promotional graphics." },
        { name:"Pack", price:45000, tag:null,
          deliverables:["3 coordinated designs (e.g. A4 flyer + Instagram post + story)","3 revisions per design","Print + digital files for all","All source files","Visual consistency across formats"],
          best:"Events or campaigns needing a consistent set of coordinated materials." },
        { name:"Campaign", price:80000, tag:null,
          deliverables:["6 designs across formats","Unlimited revisions within scope","Full print + digital suite","All source files","Basic campaign style guide (2 pages)"],
          best:"Launch campaigns, product drops, large events with multiple materials." },
        { name:"Event Suite", price:null, tag:"Custom",
          deliverables:["Unlimited designs for duration of event","All formats (digital, print, large format, DOOH)","Dedicated turnaround SLA","Event brand style guide","Post-event archive of all assets"],
          best:"Large-scale events (50+ designs, multi-day, corporate conferences, concerts)." },
      ]
    },
    {
      id:"brand-partnership", icon:"◎", name:"Brand Partnership & Collaboration",
      note:"Partnerships must align with The Value Sage brand values. Proposal review required.",
      tiers:[
        { name:"Product Showcase", price:80000, tag:null,
          deliverables:["Authentic product feature (1 dedicated post + story)","Brand-aligned visual styling","Caption + hashtag strategy","Usage rights for brand's own channels","Engagement report (7 days)"],
          best:"Product brands wanting authentic, value-aligned exposure." },
        { name:"Brand Story", price:200000, tag:null,
          deliverables:["Dedicated brand story content (reel + post + story series)","Pre-shoot/creation brief review","Content strategy consultation (1hr)","Full usage rights","14-day engagement report"],
          best:"Brands wanting deeper narrative content, not just a mention." },
        { name:"Full Campaign", price:null, tag:"Custom",
          deliverables:["Multi-platform campaign design","Long-term partnership structure","Co-created content","Speaking or event representation","Custom deliverables negotiated"],
          best:"Strategic brand alliances and long-term partnership agreements." },
      ]
    },
  ],
  Web: [
    {
      id:"web", icon:"▦", name:"Website Design & Build",
      note:"Hosting not included. Domain setup assistance included at all tiers.",
      tiers:[
        { name:"Starter", price:200000, tag:null,
          deliverables:["Single-page or landing page design","Mobile-responsive build","Contact / enquiry form","Basic on-page SEO (meta tags, headings)","Google Analytics setup","2 revision rounds","30-day post-launch support"],
          best:"New businesses, product launches, personal brand landing pages." },
        { name:"Business", price:400000, tag:"Most Popular",
          deliverables:["Up to 8 pages (Home, About, Services, Portfolio, Blog, Contact, etc.)","CMS integration (edit content without code)","Contact + booking forms","Full SEO foundation (schema, sitemap, robots.txt)","Speed optimisation","Analytics + 45-day support","3 revision rounds"],
          best:"Service businesses needing a full, professional web presence." },
        { name:"Custom", price:null, tag:"Discovery Call",
          deliverables:["Full scoping session before pricing","E-commerce or web application","Payment gateway integration","Custom third-party API connections","Multi-language or multi-region setup","Ongoing maintenance retainer option"],
          best:"Complex requirements — scope defined together before any quote." },
      ]
    },
  ],
  AI: [
    {
      id:"ai-workflow", icon:"⬡", name:"AI & Automation Setup",
      note:"Requires a 30-min discovery call before any tier is confirmed.",
      tiers:[
        { name:"Quickstart", price:80000, tag:null,
          deliverables:["Business workflow audit (written report)","3 automation workflows built and tested","Tool setup + configuration (Make, Zapier, Notion, etc.)","1.5-hour team training session","Written SOPs for each automation","30-day email support"],
          best:"Solopreneurs and small teams beginning their automation journey." },
        { name:"Business Suite", price:200000, tag:"Most Popular",
          deliverables:["Full operations workflow mapping","8+ automation workflows built","Custom AI prompt systems for your brand voice","Team training workshop (3hrs)","Full automation documentation","60-day hands-on support"],
          best:"Businesses ready to meaningfully integrate AI across their operations." },
        { name:"Custom", price:null, tag:"Enterprise",
          deliverables:["Enterprise workflow architecture","Custom AI agent builds","API integrations across departments","Staff training programme","Ongoing consulting retainer","Quarterly automation reviews"],
          best:"Large-scale or multi-department automation needs." },
      ]
    },
    {
      id:"ai-consulting", icon:"◈", name:"AI Strategy Consulting",
      note:"Ideal as a first step before committing to any AI build.",
      tiers:[
        { name:"Audit", price:70000, tag:null,
          deliverables:["AI readiness assessment","Opportunity map (where AI saves you time & money)","Tool recommendation report","Priority implementation list","1-hour debrief call"],
          best:"Businesses curious about AI but unsure where to start." },
        { name:"Strategy", price:160000, tag:"Most Popular",
          deliverables:["Everything in Audit","12-month AI adoption roadmap","Tool selection framework","Team readiness assessment","3-month check-in calls (monthly)"],
          best:"Founders ready to make AI a genuine competitive advantage." },
        { name:"Embedded", price:null, tag:"Retainer",
          deliverables:["Ongoing monthly consulting partnership","Regular strategy sessions","Hands-on build support","Priority access and response","Quarterly business AI review"],
          best:"Organisations wanting AI expertise embedded in their team ongoing." },
      ]
    },
  ],
}

const SESSIONS = [
  { id:"brand-clarity", name:"Brand Clarity Session", icon:"◈", color:"#8B4CF6", desc:"1-on-1 deep dive — brand diagnosis, direction-setting, and a clear written action plan.", formats:[{label:"60 min",price:40000},{label:"90 min",price:55000}], forWho:"Founders and creatives who feel stuck, inconsistent, or unclear on their positioning.", includes:["Live brand audit","Positioning framework","Written action plan (sent within 24hrs)","30-day follow-up email"] },
  { id:"keynote", name:"Keynote Speaking", icon:"◉", color:"#FF4D2E", desc:"High-impact talks on brand, value creation, AI, entrepreneurship, and the African creative economy.", formats:[{label:"30 min talk",price:150000},{label:"60 min keynote",price:250000},{label:"Half-day workshop",price:500000}], forWho:"Conferences, corporate events, universities, and public gatherings.", includes:["Custom slide deck","Pre-event discovery call","Q&A facilitation","Post-event debrief summary"] },
  { id:"group-workshop", name:"Group Workshop / Panel", icon:"▤", color:"#059669", desc:"Interactive sessions — teaching, activity, and open discussion for teams and communities.", formats:[{label:"60 min",price:80000},{label:"90 min",price:120000},{label:"Full day",price:300000}], forWho:"Teams, campus events, community groups (10–100 people).", includes:["Facilitated discussion","Workshop materials","Group exercises","Summary document (sent after)"] },
  { id:"coaching", name:"1-on-1 Coaching", icon:"◯", color:"#D97706", desc:"Focused personal session — entrepreneurship, career direction, creative strategy, or brand thinking.", formats:[{label:"45 min",price:25000},{label:"60 min",price:35000}], forWho:"Individuals who need focused thinking time with someone who has done the work.", includes:["Recorded session (audio)","Written summary","Curated resource list","WhatsApp follow-up within 72hrs"] },
]

const BOOKS = [
  { title:"The Danfo Lifestyle", sub:"Lagos Street Business Philosophy", bg:"#1A0A04", acc:"#FF4D2E", status:"Available", desc:"Business lessons extracted from Lagos streets — for the African entrepreneur who refuses ordinary." },
  { title:"You Are The Asset", sub:"On Work, Value & Identity", bg:"#041A0C", acc:"#059669", status:"Available", desc:"The definitive guide to discovering, positioning, and deploying your intrinsic value in any market." },
  { title:"The New Frontier", sub:"Emerging Markets Field Guide", bg:"#04081A", acc:"#3B82F6", status:"Available", desc:"A 100-page practical guide to thriving in emerging markets, with Africa as the primary lens." },
  { title:"Skilled and Starving", sub:"Sales Playbook for Students", bg:"#1A0804", acc:"#F97316", status:"New", desc:"For skilled students monetising nothing. The playbook to change that — immediately." },
  { title:"Stop Leaving Money on the Table", sub:"Skill Monetisation Blueprint", bg:"#0A0A1A", acc:"#8B4CF6", status:"Available", desc:"Strategies for professionals who are underpaid relative to the real value they create." },
  { title:"The Elements of Music (TEOM)", sub:"A Musical Theory Companion", bg:"#0A1A1A", acc:"#06B6D4", status:"Available", desc:"A practical guide to understanding music theory — harmony, rhythm, structure — for players, producers, and curious minds." },
]

const PORTFOLIO = {
  brand:[
    { name:"Fossa Travels & Tours", desc:"Women's adventure travel. Naming + full brand identity system.", tags:["Naming","Identity","Strategy"], bg:"#1A0A2A" },
    { name:"Adore Apparels", desc:"Luxury youth fashion rebrand for Ibadan-based clothier.", tags:["Rebrand","Visual System"], bg:"#0A1A0A" },
    { name:"Leverage Now Community", desc:"Faith-based growth community. Visual identity + illustration.", tags:["Identity","Illustration"], bg:"#0A100A" },
    { name:"JustIce Fashion", desc:"Quiet luxury Nigerian menswear. Third-space brand positioning.", tags:["Luxury","Strategy","Identity"], bg:"#0A0A1A" },
  ],
  logos:["Butter n' Bliss Edibles","Steez on Grills","Echoes of Value","Tegah Scents","Precious Markus","Obverse Studio","JustIce Fashion","Drip Elite","The Forge Global","Campus CEO"],
  flyers:["Choice Foods & Bites — Full Campaign","JDS Inter-Campus Debate — Event Identity","NANS Executive Campaign — Political Materials","The Oasis Podcast — Episode Covers","Birthday Celebration Series","Ejigbo Welcome Banner — Large Format"],
}

const QUIZ_POOL = [
  {cat:"Branding",q:"What is the difference between a brand and a logo?",opts:["They are the same — a logo is the brand","A logo is one visual mark; a brand is the full experience — feelings, reputation, values, and all touchpoints","A brand is just colours and fonts","A brand is only the company name"],ans:1,exp:"A logo is a single mark. A brand is everything your audience thinks, feels, and says about you when you are not in the room. The swoosh is Nike's logo. Confidence and performance are Nike's brand."},
  {cat:"Branding",q:"Which best defines brand positioning?",opts:["Your Google ranking","How your brand is perceived relative to competitors in your customer's mind","Your physical business location","Your ad spend"],ans:1,exp:"Positioning is the mental real estate your brand occupies. It answers: why should this specific person choose you over every alternative? Great positioning makes you the only logical choice."},
  {cat:"Branding",q:"A startup has a great product, active Instagram, and a beautiful logo — but weak sales. What is most likely missing?",opts:["A bigger ad budget","Clear brand messaging that speaks to real customer pain points","A rebrand","More followers"],ans:1,exp:"Aesthetics attract attention; strategy converts it. If your messaging does not name your customer's real problem and position your offer as the solution, no amount of visual polish will fix sales."},
  {cat:"Branding",q:"What does brand equity mean?",opts:["The cost of your logo design","The premium value customers assign to your brand beyond the functional product — making them choose you over cheaper alternatives","Your total brand spend","Your social following"],ans:1,exp:"Brand equity is the premium people pay in money, trust, and loyalty because of your reputation. It is built through consistency over time and is what allows some brands to charge more for essentially the same product."},
  {cat:"Branding",q:"What is a brand guidelines document used for?",opts:["To show investors your financial plan","To define exactly how your brand looks, sounds, and behaves — so anyone using your brand does it correctly","To list your company services","To apply for a trademark"],ans:1,exp:"A brand guidelines document is the instruction manual for your identity. It covers logo usage, colour codes, typography rules, tone of voice, and what not to do — ensuring consistency whether your designer is in Lagos or London."},
  {cat:"Branding",q:"What is brand voice?",opts:["The audio in your video ads","The consistent personality and tone your brand uses across all written and spoken communication","Your CEO's speaking style","Your advertising tagline"],ans:1,exp:"Brand voice is your personality in words. It defines how you speak — bold or gentle, formal or conversational, sharp or warm. It must stay consistent from your invoices to your Instagram captions."},
  {cat:"Branding",q:"What is the purpose of a mood board in a branding project?",opts:["To show the client their competitors","To visually align on the aesthetic direction, feeling, and references before any design work begins","To finalise the colour palette","To present the final logo"],ans:1,exp:"A mood board aligns creative direction before execution. It prevents misaligned expectations by showing — not describing — the intended look, feel, and references, saving revision rounds later."},
  {cat:"Branding",q:"What does brand consistency mean in practice?",opts:["Using the exact same logo on everything","Every touchpoint — visual, verbal, and experiential — telling the same coherent story","Posting on social media daily","Never changing your brand"],ans:1,exp:"Consistency means your website, receipts, packaging, Instagram, and email signatures all feel like they came from the same brand. Inconsistency signals disorganisation and erodes trust."},
  {cat:"Finance",q:"What is the difference between revenue and profit?",opts:["They are the same","Revenue is total income; profit is what remains after all expenses are deducted","Profit is income; revenue is what is left after tax","Revenue only counts cash payments"],ans:1,exp:"Revenue is all money coming in. Profit is what remains after costs. You can have high revenue and negative profit — which is why high sales do not always mean a healthy business."},
  {cat:"Finance",q:"What does value-based pricing mean for a creative professional?",opts:["Charging as little as possible to attract clients","Setting prices based on the outcome and transformation your work delivers to the client — not the hours it takes","Matching your competitors' prices","Charging a fixed rate for all projects"],ans:1,exp:"Value-based pricing asks: what is this outcome worth to the client? A rebrand that triples their client enquiries is worth far more than the hours spent designing. Price the transformation, not the time."},
  {cat:"Finance",q:"What is scope creep and why is it dangerous?",opts:["Getting too many projects at once","When a client requests additional work beyond the original agreed scope without adjusting the fee","When a project runs over deadline","When a client wants too many revisions"],ans:1,exp:"Scope creep is the silent profit killer. It starts as 'just one small thing' and compounds until you have done 40% more work for the same fee. Clear contracts and written briefs protect against it."},
  {cat:"Finance",q:"What is VAT and what is the current rate in Nigeria?",opts:["Value Added Tax, currently 5%","Value Added Tax, currently 7.5% — applied to most goods and services","A voluntary tax for businesses earning above a threshold","Value Allocation Tax, currently 10%"],ans:1,exp:"VAT (Value Added Tax) in Nigeria is currently 7.5%, introduced in the Finance Act 2020. Businesses registered for VAT must charge it on taxable goods and services and remit it to the FIRS."},
  {cat:"Finance",q:"What does a 50% deposit before starting a project protect?",opts:["It does not protect anything — it is just standard practice","Your time from uncommitted clients, covers early project costs, and confirms mutual seriousness","It gives you profit upfront","It protects the client from overpaying"],ans:1,exp:"A deposit protects both parties. For the designer: it filters uncommitted clients and funds early costs. For the client: it signals a genuine contractual start. Clients who refuse deposits rarely respect the work either."},
  {cat:"AI & Automation",q:"What is prompt engineering?",opts:["Writing code to train AI models from scratch","The skill of crafting precise instructions to get high-quality, specific outputs from AI systems","Designing AI user interfaces","Testing AI systems for bugs"],ans:1,exp:"Prompt engineering is how you communicate effectively with AI. The same model produces vastly different results depending on how you structure your request. Context, format, examples, and constraints all dramatically improve outputs."},
  {cat:"AI & Automation",q:"What does AI hallucination mean?",opts:["When AI generates creative fiction deliberately","When an AI confidently produces factually incorrect information","When an AI crashes during processing","When AI misinterprets a question"],ans:1,exp:"Hallucination is when an AI generates plausible-sounding but false information — wrong dates, invented citations, fabricated statistics. The model does not know it is wrong; it is predicting the most likely next word, not checking facts."},
  {cat:"AI & Automation",q:"What is the difference between AI and automation?",opts:["They are identical technologies","Automation follows fixed pre-programmed rules; AI learns, reasons, and adapts to new and ambiguous inputs","AI is more expensive; automation is always cheaper","Automation replaces humans; AI assists them"],ans:1,exp:"Automation executes your predefined rules (if X happens, do Y). AI interprets ambiguous inputs, makes judgement calls, and can handle situations it was not explicitly programmed for. Combined, they are extremely powerful."},
  {cat:"AI & Automation",q:"What is a no-code automation tool?",opts:["Software that works without internet","A platform like Make or Zapier that lets you build automations connecting apps without writing traditional code","AI software that generates code for you","A tool with no graphical interface"],ans:1,exp:"No-code tools democratise automation. You can connect apps, trigger actions, and build complex workflows using visual drag-and-drop interfaces — no developer required. This is where most small businesses should start."},
  {cat:"AI & Automation",q:"What is the biggest risk of over-relying on AI for creative work?",opts:["AI will immediately replace you","Your work loses distinctiveness — AI produces statistically average outputs, not genuinely original thinking","AI-generated content is always low quality","Clients will notice and complain"],ans:1,exp:"AI optimises for what is common, not what is remarkable. Over-reliance risks homogenising your work. The best use of AI is as a force multiplier for your ideas — not a replacement for having them."},
  {cat:"Marketing",q:"What is a call to action (CTA) and why does it matter?",opts:["The opening line of a marketing campaign","A specific instruction that tells your audience exactly what to do next — Book Now, Download, Get Started","The headline of an advertisement","Your brand tagline"],ans:1,exp:"A CTA bridges interest and action. Without a clear next step, engaged visitors leave without converting. Every piece of content should answer: what do I want this person to do after seeing this?"},
  {cat:"Marketing",q:"What is the difference between reach and impressions on social media?",opts:["They are the same metric","Reach is the number of unique individuals who saw your content; impressions is the total number of times it was displayed (including repeat views)","Reach is paid; impressions are organic","Impressions only count clicks"],ans:1,exp:"One person seeing your post three times counts as 1 reach and 3 impressions. High impressions with low reach means your content is being shown repeatedly to a small audience — useful to know for strategy."},
  {cat:"Marketing",q:"Why is an email list considered more valuable than social media following?",opts:["Email has higher open rates than social media posts","You own your email list — no algorithm can reduce your reach to zero, and you can contact your audience directly anytime","Email marketing is cheaper than social media ads","Email lists are easier to grow than social media accounts"],ans:1,exp:"Your social following is rented. An algorithm change, platform ban, or account hack can cut your reach overnight. Your email list is an asset you own and control — which is why building it is one of the smartest marketing moves."},
  {cat:"Marketing",q:"What is content marketing?",opts:["Paid advertising with good visuals","Creating genuinely useful, educational, or entertaining content that attracts your ideal audience and builds trust over time — without directly selling","Managing your social media accounts","Running targeted advertisements"],ans:1,exp:"Content marketing is the long game. It attracts people with value before asking for anything. Books, quizzes, educational posts, and guides all build an audience that trusts you before they ever enquire."},
  {cat:"Business",q:"What is a unique value proposition (UVP)?",opts:["Your pricing structure","A clear, specific statement of the benefit you deliver, who you deliver it for, and why you are the best choice","Your mission statement","A description of your services"],ans:1,exp:"Your UVP answers: why should this specific person choose you over every alternative, including doing nothing? It must be specific and outcome-focused. Weak: 'I design logos.' Strong: 'I build brand identities for African founders entering competitive markets.'"},
  {cat:"Business",q:"What does scaling a business mean?",opts:["Making your physical premises bigger","Growing revenue at a faster rate than costs increase — through systems, automation, and leverage rather than just more hours","Hiring more staff","Expanding to new locations"],ans:1,exp:"Real scaling means revenue can grow without costs or your personal time growing proportionally. Systems, products, and teams are how this happens. Trading more hours for more money is not scaling — it is just working harder."},
  {cat:"Business",q:"What is customer lifetime value (CLV)?",opts:["How long a customer has used your product","The total revenue a business can expect from a single customer relationship over its entire duration","The value of your most loyal customer","Your average project fee"],ans:1,exp:"CLV reframes how you think about client acquisition. A client who pays NGN 150k once is worth less than a client who pays NGN 80k three times over two years. Understanding CLV helps you invest correctly in relationships and retention."},
  {cat:"Music",q:"What is the difference between rhythm and tempo in music?",opts:["They mean the same thing","Rhythm is the pattern of long and short sounds; tempo is the speed at which those patterns are played","Tempo is the pattern; rhythm is the speed","Rhythm only applies to percussion"],ans:1,exp:"Rhythm is the groove — the arrangement of notes and rests over time. Tempo is the clock speed — how fast or slow the groove runs, measured in BPM (beats per minute). You can have the same rhythm at different tempos."},
  {cat:"Music",q:"What does a time signature tell you in written music?",opts:["The key the song is in","The number of beats per measure and which note value gets one beat","The speed of the song","The instrument the music was written for"],ans:1,exp:"A 4/4 time signature means 4 beats per measure and a quarter note gets one beat. 3/4 means 3 beats per measure — the waltz feel. Time signatures define the rhythmic framework everything else sits inside."},
  {cat:"Music",q:"What is harmony in music?",opts:["Playing notes very loudly","The simultaneous combination of notes to create chords and chord progressions","The melody line of a song","The tuning of an instrument"],ans:1,exp:"Harmony is what happens when notes are played together. Chords are the building blocks of harmony. Different combinations create tension, resolution, joy, sadness — harmony is the emotional architecture of music."},
]

const BLOCKED_DATES = new Set(["2026-04-07","2026-04-08","2026-04-11","2026-04-14","2026-04-17","2026-04-22","2026-04-25"])
const TIMES = ["9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM","4:00 PM"]
const ADMIN_PASS = "valuesage2025"

function shuffle(arr: any[]) { return [...arr].sort(()=>Math.random()-.5) }
function fmtPrice(n: any) { return n ? `₦${n.toLocaleString()}` : "Custom" }
function addVAT(n: any) { return n + Math.round(n*VAT_RATE) }

// ── FORM COMPONENTS (defined OUTSIDE App to prevent remount on each keystroke) ─

function NewsletterForm({ C, card, coral }: { C: any, card: any, coral: any }) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [done, setDone] = useState(false)
  const inp = { width:"100%", padding:"11px 16px", borderRadius:8, fontSize:14, background:C.card2, border:`1px solid ${C.border}`, color:C.text, fontFamily:"'DM Sans',sans-serif", outline:"none" }
  if(done) return (
    <div style={{textAlign:"center",padding:"32px 0"}}>
      <p style={{fontSize:28,marginBottom:8}}>◈</p>
      <p style={{fontSize:16,fontWeight:600,marginBottom:6}}>You are in.</p>
      <p style={{fontSize:14,color:C.muted}}>Expect value, not noise. The Value Sage will land in your inbox.</p>
    </div>
  )
  return (
    <div style={{display:"grid",gap:12}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inp}/>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={inp}/>
      <button onClick={()=>{ if(email.includes("@")) setDone(true) }} style={{background:coral,color:"#fff",border:"none",padding:"12px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
        Subscribe — It is Free
      </button>
      <p style={{fontSize:12,color:C.muted,textAlign:"center"}}>No spam. Unsubscribe anytime. Brand, AI, finance, and music — all in one place.</p>
    </div>
  )
}

function ContactForm({ C, coral }: { C: any, coral: any }) {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" })
  const [sent, setSent] = useState(false)
  const inp = { width:"100%", padding:"11px 16px", borderRadius:8, fontSize:14, background:C.card2, border:`1px solid ${C.border}`, color:C.text, fontFamily:"'DM Sans',sans-serif", outline:"none" }
  const set = (k: any) => (e: any) => setForm((p: any) => ({...p, [k]: e.target.value}))
  if(sent) return <div style={{padding:"32px 0",textAlign:"center"}}><p style={{fontSize:28,marginBottom:8}}>✓</p><p style={{fontWeight:600,fontSize:16}}>Message sent. Expect a response within 24–48hrs.</p></div>
  return (
    <div style={{display:"grid",gap:14}}>
      {[["name","Name","text","Your full name"],["email","Email","email","your@email.com"],["subject","Subject","text","What is this about?"]].map(([k,l,t,p])=>(
        <div key={k}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>{l}</label>
        <input type={t} value={form[k]} onChange={set(k)} placeholder={p} style={inp}/></div>
      ))}
      <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Message</label>
      <textarea rows={5} value={form.message} onChange={set("message")} placeholder="Tell me about your project or enquiry..." style={{...inp,resize:"vertical"}}/></div>
      <button onClick={()=>{ if(form.name&&form.email&&form.message) setSent(true) }} style={{background:coral,color:"#fff",border:"none",padding:"12px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Send Message</button>
    </div>
  )
}

function BookingForm({ C, card, coral, onInvoiceGenerated }: { C: any, card: any, coral: any, onInvoiceGenerated: any }) {
  const [sess, setSess] = useState(null)
  const [fmt, setFmt] = useState(null)
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const now=new Date(), yr=now.getFullYear(), mo=now.getMonth()
  const mdays=new Date(yr,mo+1,0).getDate(), mstart=new Date(yr,mo,1).getDay()
  const mname=now.toLocaleString("en",{month:"long"})
  const ds=(d: any)=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`

  const inp = { width:"100%", padding:"11px 16px", borderRadius:8, fontSize:14, background:C.card2, border:`1px solid ${C.border}`, color:C.text, fontFamily:"'DM Sans',sans-serif", outline:"none" }

  const submit = async () => {
    if(!sess||!fmt||!date||!time||!name||!email){ alert("Please fill all required fields."); return }
    setLoading(true)
    const price = fmt.price||0, vat = Math.round(price*VAT_RATE), total = price+vat
    const num=`TVS-${Date.now().toString().slice(-6)}`
    const today=new Date().toLocaleDateString("en-NG",{day:"2-digit",month:"long",year:"numeric"})
    const due=new Date(Date.now()+72*36e5).toLocaleDateString("en-NG",{day:"2-digit",month:"long",year:"numeric"})
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:"Generate invoice JSON for The Value Sage brand studio. Return ONLY valid JSON.",messages:[{role:"user",content:`Session: ${sess.name} / ${fmt.label} / ${date} at ${time}. Client: ${name}. Price before VAT: NGN${price}. Return: {"items":[{"desc":"...","qty":1,"rate":${price}}],"note":"warm 2-sentence professional note"}. 2 items max.`}]})})
      const d=await res.json()
      let p; try{p=JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim())}catch{p={items:[{desc:`${sess.name} — ${fmt.label}`,qty:1,rate:price}],note:"We look forward to a powerful session together. The Value Sage is committed to delivering clarity and real value."}}
      const inv={id:num,date:today,due,type:"session",client:{name,email,phone},service:sess.name,tier:fmt.label,sessionDate:date,sessionTime:time,items:p.items,note:p.note,subtotal:price,vat,total,deposit:Math.round(total*.5),status:"pending"}
      onInvoiceGenerated(inv)
      setStep(1);setSess(null);setFmt(null);setDate(null);setTime(null);setName("");setEmail("");setPhone("");setNotes("")
    } catch{ alert("Invoice generation failed. Please try again.") }
    setLoading(false)
  }

  return (
    <div style={{padding:"72px clamp(16px,4vw,64px)"}}>
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Book a Session</p>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,5vw,46px)",fontWeight:800,marginBottom:12,color:C.text}}>Sessions &<br/><span style={{color:coral}}>Speaking</span></h2>
      <p style={{color:C.lt,fontSize:15,lineHeight:1.7,maxWidth:500,marginBottom:44}}>All sessions are time-based. Pick a format, choose your slot, and receive your invoice instantly.</p>

      {step===1&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
          {SESSIONS.map(s=>(
            <div key={s.id} onClick={()=>{setSess(s);setStep(2);setFmt(null);setDate(null);setTime(null)}} style={{...card,padding:24,cursor:"pointer",borderLeft:`3px solid ${sess?.id===s.id?coral:C.border}`,transition:"all .2s"}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:20,color:s.color}}>{s.icon}</span>
                <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:C.text}}>{s.name}</h3>
              </div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:12}}>{s.desc}</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {s.formats.map(f=><span key={f.label} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:5,padding:"2px 8px",fontSize:11,color:C.lt}}>{f.label}{f.price?` · ${fmtPrice(f.price)}`:" · Custom"}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {step===2&&sess&&(
        <div style={{maxWidth:640}}>
          <button onClick={()=>{setStep(1);setSess(null)}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,marginBottom:22,fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:700,marginBottom:4,color:C.text}}>{sess.name}</h3>
          <p style={{color:C.muted,fontSize:13,marginBottom:20}}>{sess.forWho}</p>
          <p style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:10}}>FORMAT</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:24}}>
            {sess.formats.map(f=>(
              <div key={f.label} onClick={()=>setFmt(f)} style={{...card,padding:14,cursor:"pointer",border:`1px solid ${fmt?.label===f.label?coral:C.border}`,background:fmt?.label===f.label?C.cdim:C.card,transition:"all .2s",textAlign:"center"}}>
                <p style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,marginBottom:3,color:C.text}}>{f.label}</p>
                <p style={{color:coral,fontSize:12,fontWeight:600}}>{f.price?fmtPrice(f.price):"Custom"}</p>
                {f.price&&<p style={{color:C.muted,fontSize:10,marginTop:2}}>+VAT: {fmtPrice(Math.round(f.price*VAT_RATE))}</p>}
              </div>
            ))}
          </div>
          <p style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:10}}>DATE — {mname.toUpperCase()}</p>
          <div style={{...card,padding:16,marginBottom:18}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:5}}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:C.muted,padding:"2px 0"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
              {Array.from({length:mstart},(_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:mdays},(_,i)=>{
                const d=i+1, dstr=ds(d)
                const blk=BLOCKED_DATES.has(dstr)||new Date(dstr)<new Date(new Date().setHours(0,0,0,0))
                const sel=date===dstr
                return <div key={d} onClick={()=>{if(!blk){setDate(dstr);setTime(null)}}} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,fontSize:12,cursor:blk?"default":"pointer",background:sel?coral:blk?"transparent":C.bg2,color:sel?"#fff":blk?C.border:C.text,textDecoration:blk?"line-through":"none",transition:"all .15s",fontWeight:sel?600:400}}>{d}</div>
              })}
            </div>
          </div>
          {date&&(
            <div>
              <p style={{fontSize:11,color:C.muted,letterSpacing:"0.12em",marginBottom:10}}>TIME</p>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:22}}>
                {TIMES.map(t=>(
                  <button key={t} onClick={()=>setTime(t)} style={{padding:"7px 14px",borderRadius:7,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:time===t?coral:C.card2,color:time===t?"#fff":C.text,border:`1px solid ${time===t?coral:C.border}`,fontWeight:time===t?600:400,transition:"all .15s"}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {date&&time&&fmt&&<button onClick={()=>setStep(3)} style={{background:coral,color:"#fff",border:"none",width:"100%",padding:"12px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Continue →</button>}
        </div>
      )}

      {step===3&&(
        <div style={{maxWidth:580}}>
          <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,marginBottom:20,fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
          <div style={{...card,padding:16,marginBottom:22,borderLeft:`3px solid ${coral}`}}>
            <p style={{fontSize:13,color:coral,fontWeight:600}}>{sess?.name} · {fmt?.label}</p>
            <p style={{fontSize:12,color:C.lt,marginTop:3}}>{date} at {time}</p>
            {fmt?.price&&<div style={{marginTop:8}}>
              <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:C.text}}>{fmtPrice(fmt.price)} <span style={{fontSize:12,color:C.muted,fontWeight:400,fontFamily:"'DM Sans',sans-serif"}}>+ VAT ({fmtPrice(Math.round(fmt.price*VAT_RATE))}) = {fmtPrice(addVAT(fmt.price))}</span></p>
            </div>}
          </div>
          <div style={{display:"grid",gap:13}}>
            {[["name","Full Name *","text","Your name"],["email","Email *","email","you@email.com"],["phone","WhatsApp","tel","+234 ..."]].map(([k,l,t,p])=>(
              <div key={k}>
                <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>{l}</label>
                <input type={t} placeholder={p} value={k==="name"?name:k==="email"?email:phone} onChange={e=>{ if(k==="name")setName(e.target.value); else if(k==="email")setEmail(e.target.value); else setPhone(e.target.value) }} style={{...inp}}/>
              </div>
            ))}
            <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Notes</label>
            <textarea rows={3} placeholder="What would you like to focus on?" value={notes} onChange={e=>setNotes(e.target.value)} style={{...inp,resize:"vertical"}}/></div>
          </div>
          <button onClick={submit} disabled={loading||!name||!email} style={{background:loading||!name||!email?"#333":coral,color:"#fff",border:"none",width:"100%",padding:"13px",borderRadius:8,fontSize:14,fontWeight:600,cursor:loading?"wait":"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:18}}>
            {loading?"Generating Invoice...":"Confirm & Get Invoice →"}
          </button>
        </div>
      )}
    </div>
  )
}


function AdminLoginForm({ C, coral, onSuccess }: { C: any, coral: any, onSuccess: any }) {
  const [pw, setPw] = useState("")
  const [err, setErr] = useState(false)
  const inp = {width:"100%",padding:"11px 16px",borderRadius:8,fontSize:14,background:C.card2,border:`1px solid ${err?coral:C.border}`,color:C.text,fontFamily:"'DM Sans',sans-serif",outline:"none",marginBottom:err?6:14}
  const attempt = () => { if(pw===ADMIN_PASS) onSuccess(); else { setErr(true); setPw("") } }
  return (
    <div>
      <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false)}} placeholder="Enter password" style={inp} onKeyDown={e=>e.key==="Enter"&&attempt()}/>
      {err&&<p style={{color:coral,fontSize:12,marginBottom:12}}>Incorrect password.</p>}
      <button onClick={attempt} style={{width:"100%",padding:"11px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:coral,color:"#fff",border:"none"}}>Access →</button>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const [mode, setMode] = useState("dark")
  const [page, setPage] = useState("home")
  const [sb, setSb] = useState(false)

  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState("signin") // "signin" | "signup"
  const [authName, setAuthName] = useState("")
  const [authEmail, setAuthEmail] = useState("")
  const [authPw, setAuthPw] = useState("")
  const [authErr, setAuthErr] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null) // {name, email}
  // Cart + invoices
  const [cart, setCart] = useState([])
  const [invoices, setInvoices] = useState([])
  const [activeInv, setActiveInv] = useState(null)

  // Services state
  const [svCat, setSvCat] = useState("Brand")
  const [selSvc, setSelSvc] = useState(null)
  const [selTier, setSelTier] = useState(null)
  const [intakeOpen, setIntakeOpen] = useState(false)
  const [invLoading, setInvLoading] = useState(false)

  // Quiz
  const [quizPool, setQuizPool] = useState([])
  const [qIdx, setQIdx] = useState(0)
  const [qSel, setQSel] = useState(null)
  const [qScore, setQScore] = useState(0)
  const [qDone, setQDone] = useState(false)

  // Portfolio
  const [ptab, setPtab] = useState("brand")

  // Admin
  const [adminAuth, setAdminAuth] = useState(false)

  const C = THEMES[mode]

  useEffect(()=>{
    const lnk=document.createElement("link"); lnk.rel="stylesheet"
    lnk.href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
    document.head.appendChild(lnk)
    ;(async()=>{ try{ const r=await window.storage.get("tvs4_inv"); if(r) setInvoices(JSON.parse(r.value)) }catch{} })()
    setQuizPool(shuffle(QUIZ_POOL).slice(0,10))
  },[])

  useEffect(()=>{
    document.getElementById("tvs-s")?.remove()
    const s=document.createElement("style"); s.id="tvs-s"
    s.textContent=`*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;transition:background .35s,color .35s}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}.syne{font-family:'Syne',sans-serif}@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}@keyframes sc{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}@keyframes si{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}@keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(90px,-60px) scale(1.12)}70%{transform:translate(-40px,50px) scale(.92)}}@keyframes orb2{0%,100%{transform:translate(0,0) scale(1)}35%{transform:translate(-80px,45px) scale(.88)}75%{transform:translate(60px,-80px) scale(1.15)}}@keyframes orb3{0%,100%{transform:translate(0,0)}55%{transform:translate(40px,-50px)}}@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes efade{from{opacity:0}to{opacity:1}}.afu{animation:fu .45s ease both}.asc{animation:sc .3s ease both}.asi{animation:si .35s ease both}.ch{transition:all .22s}.ch:hover{transform:translateY(-3px);border-color:${C.coral}!important}.ov{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}@media print{.np{display:none!important}}@media(max-width:640px){
  .syne{font-family:'Syne',sans-serif}
  nav .nl{display:none}
  nav .mob-show{display:flex!important}
}
@media(max-width:480px){
  h1{font-size:clamp(36px,10vw,60px)!important}
}`
    document.head.appendChild(s)
  },[mode])

  const go = useCallback((p: any)=>{ setPage(p); setSb(false); window.scrollTo(0,0) },[])
  const saveInv = async(list)=>{ try{await window.storage.set("tvs4_inv",JSON.stringify(list))}catch{} }

  const card = {background:C.card,border:`1px solid ${C.border}`,borderRadius:12}
  const btn = {padding:"12px 28px",borderRadius:8,fontSize:14,fontWeight:600}

  const addToCart = (svc, tier) => {
    setCart(c=>[...c,{id:Date.now(),svc:svc.name,tier:tier.name,price:tier.price||0,vat:Math.round((tier.price||0)*VAT_RATE)}])
    setSelSvc(null); setSelTier(null)
    go("orders")
  }

  const cartTotal = cart.reduce((a,i)=>a+i.price,0)
  const cartVAT   = cart.reduce((a,i)=>a+i.vat,0)

  const generateCartInvoice = async () => {
    if(cart.length===0) return
    setInvLoading(true)
    const num=`TVS-${Date.now().toString().slice(-6)}`
    const today=new Date().toLocaleDateString("en-NG",{day:"2-digit",month:"long",year:"numeric"})
    const due=new Date(Date.now()+72*36e5).toLocaleDateString("en-NG",{day:"2-digit",month:"long",year:"numeric"})
    const items = cart.map(i=>({desc:`${i.svc} — ${i.tier}`,qty:1,rate:i.price}))
    const inv={id:num,date:today,due,type:"service",client:{name:"",email:"",phone:""},items,subtotal:cartTotal,vat:cartVAT,total:cartTotal+cartVAT,deposit:Math.round((cartTotal+cartVAT)*.5),note:"Thank you for choosing The Value Sage. A 50% deposit is required to commence. We look forward to building something excellent together.",status:"pending"}
    const updated=[inv,...invoices]; setInvoices(updated); saveInv(updated); setActiveInv(inv); setCart([]); setInvLoading(false); go("orders"); setOTab&&setOTab("invoices")
  }

  const handleSessionInvoice = (inv) => {
    const updated=[inv,...invoices]; setInvoices(updated); saveInv(updated); setActiveInv(inv)
    go("invoice")
  }

  const newQuiz = () => { setQuizPool(shuffle(QUIZ_POOL).slice(0,10)); setQIdx(0); setQSel(null); setQScore(0); setQDone(false) }

  // Intake for services (file + form)
  const IntakeModal = () => {
    const [qAnswers, setQAnswers] = useState({})
    const [clientName, setClientName] = useState("")
    const [clientEmail, setClientEmail] = useState("")
    const [clientPhone, setClientPhone] = useState("")
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const inp = {width:"100%",padding:"10px 14px",borderRadius:7,fontSize:13,background:C.card2,border:`1px solid ${C.border}`,color:C.text,fontFamily:"'DM Sans',sans-serif",outline:"none"}

    const submit = async () => {
      if(!clientName||!clientEmail){alert("Name and email required.");return}
      setLoading(true)
      const price=selTier?.price||0, vat=Math.round(price*VAT_RATE), total=price+vat
      const num=`TVS-${Date.now().toString().slice(-6)}`
      const today=new Date().toLocaleDateString("en-NG",{day:"2-digit",month:"long",year:"numeric"})
      const due=new Date(Date.now()+72*36e5).toLocaleDateString("en-NG",{day:"2-digit",month:"long",year:"numeric"})
      try{
        const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:"Generate invoice JSON for The Value Sage studio. ONLY valid JSON.",messages:[{role:"user",content:`Service: ${selSvc?.name} / ${selTier?.name}. Client: ${clientName}. Price (excl VAT): NGN${price}. Return {"items":[{"desc":"...","qty":1,"rate":${price}}],"note":"warm professional closing sentence"}. 2-3 items.`}]})})
        const d=await res.json()
        let p; try{p=JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim())}catch{p={items:[{desc:`${selSvc?.name} — ${selTier?.name}`,qty:1,rate:price}],note:"We look forward to working together. The Value Sage is committed to delivering excellence at every stage."}}
        const inv={id:num,date:today,due,type:"service",client:{name:clientName,email:clientEmail,phone:clientPhone},service:selSvc?.name,tier:selTier?.name,items:p.items,note:p.note,subtotal:price,vat,total,deposit:Math.round(total*.5),status:"pending"}
        const updated=[inv,...invoices]; setInvoices(updated); saveInv(updated); setActiveInv(inv); setIntakeOpen(false); setSelSvc(null); setSelTier(null); go("orders")
      }catch{alert("Failed. Try again.")}
      setLoading(false)
    }

    if(!intakeOpen||!selSvc||!selTier) return null
    return (
      <>
        <div className="ov" onClick={e=>{if(e.target===e.currentTarget)setIntakeOpen(false)}}>
        <div style={{width:"min(94vw,660px)",maxHeight:"86vh",overflowY:"auto",background:C.card,borderRadius:16,border:`1px solid ${C.border}`,padding:30}} className="asc" onClick={e=>e.stopPropagation()}>
          {!done?(
            <>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
                <div><p style={{fontSize:11,color:C.coral,fontWeight:700,letterSpacing:"0.1em"}}>{selSvc.name.toUpperCase()} — {selTier.name.toUpperCase()}</p>
                <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,marginTop:4,color:C.text}}>{fmtPrice(selTier.price)} {selTier.price&&<span style={{fontSize:12,color:C.muted,fontWeight:400,fontFamily:"'DM Sans',sans-serif"}}>+ VAT ({fmtPrice(Math.round(selTier.price*VAT_RATE))})</span>}</p></div>
                <button onClick={()=>setIntakeOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
              </div>
              <div style={{...card,background:C.bg2,padding:14,marginBottom:18}}>
                {selTier.deliverables.map(d=>(
                  <div key={d} style={{display:"flex",gap:7,marginBottom:5}}>
                    <span style={{color:C.coral,fontSize:10,marginTop:3,flexShrink:0}}>✓</span>
                    <span style={{fontSize:12,color:C.lt}}>{d}</span>
                  </div>
                ))}
              </div>
              <p style={{fontSize:13,fontWeight:600,marginBottom:12,color:C.text}}>Your details</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {[["clientName","Name *","text",clientName,setClientName],["clientEmail","Email *","email",clientEmail,setClientEmail],["clientPhone","WhatsApp","tel",clientPhone,setClientPhone]].map(([id,l,t,v,sv])=>(
                  <div key={id} style={id==="clientPhone"?{gridColumn:"1/-1"}:{}}>
                    <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:5}}>{l}</label>
                    <input type={t} value={v} onChange={e=>sv(e.target.value)} style={inp}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:10,marginBottom:18}}>
                <button onClick={()=>{addToCart(selSvc,selTier);setIntakeOpen(false)}} style={{flex:1,background:"transparent",border:`1px solid ${C.coral}`,color:C.coral,padding:"11px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Add to Cart</button>
                <button onClick={submit} disabled={loading||!clientName||!clientEmail} style={{flex:2,background:loading?"#333":C.coral,color:"#fff",border:"none",padding:"11px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  {loading?"Generating...":"Confirm & Generate Invoice →"}
                </button>
              </div>
              <p style={{fontSize:11,color:C.muted,textAlign:"center"}}>50% deposit required to commence. Invoice includes VAT breakdown and payment details.</p>
            </>
          ):(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <p style={{fontSize:32,marginBottom:12}}>◈</p>
              <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,marginBottom:8}}>Invoice Generated</p>
              <p style={{fontSize:14,color:C.muted,marginBottom:24}}>Check your invoice portal for full details and payment instructions.</p>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{setIntakeOpen(false);go("invoice")}} style={{flex:2,background:C.coral,color:"#fff",border:"none",padding:"12px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View Invoice →</button>
                <button onClick={()=>setIntakeOpen(false)} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,color:C.text,padding:"12px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
    )
  }

  // ── PAGES ─────────────────────────────────────────────────────────────────

  const Home = () => (
    <div>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 clamp(16px,4vw,64px)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",animation:"efade 1.2s ease both"}}>
          <div style={{position:"absolute",top:"-5%",right:"-10%",width:"55%",height:"60%",background:`radial-gradient(circle,${C.coral}14 0%,transparent 68%)`,animation:"orb1 12s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-5%",left:"-8%",width:"45%",height:"50%",background:"radial-gradient(circle,#8B4CF61A 0%,transparent 65%)",animation:"orb2 15s ease-in-out infinite"}}/>
          <div style={{position:"absolute",top:"40%",left:"25%",width:"30%",height:"35%",background:`radial-gradient(circle,${C.coral}08 0%,transparent 60%)`,animation:"orb3 9s ease-in-out infinite"}}/>
          <div style={{position:"absolute",top:"12%",left:"-8%",width:220,height:220,border:`1px solid rgba(255,77,46,.16)`,borderRadius:220,filter:"blur(12px)",animation:"orb2 9s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"22%",right:"-4%",width:"140%",height:18,background:"linear-gradient(90deg,transparent,rgba(255,77,46,.16),transparent)",transform:"rotate(-18deg)",filter:"blur(1px)",animation:"orb1 4.8s ease-in-out infinite"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:60,position:"relative",flexWrap:"wrap"}}>
          <div className="afu" style={{flex:1,minWidth:280}}>
            <p style={{color:C.coral,fontSize:11,letterSpacing:"0.25em",textTransform:"uppercase",marginBottom:22}}>Obanijesu David Solomon · Ibadan, Nigeria</p>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(40px,7vw,88px)",fontWeight:800,lineHeight:1.0,marginBottom:16,color:C.text}}>
              Brand &<br/><span style={{color:C.coral}}>AI</span><br/>Strategist
            </h1>
            <p style={{fontSize:13,color:C.muted,marginBottom:20,fontStyle:"italic"}}>Designer · Author · Speaker · Music Theorist</p>
            <p style={{fontSize:"clamp(14px,1.8vw,17px)",color:C.lt,lineHeight:1.75,maxWidth:480,marginBottom:36}}>Brand identity. Web design. AI & automation. Speaking. Finance. Music. I build the thinking, the systems, and the strategy behind brands that last.</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button onClick={()=>go("portfolio")} style={{...btn,background:C.coral,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>See My Work</button>
              <button onClick={()=>go("sessions")} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.text,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Book a Session</button>
              <button onClick={()=>go("school")} style={{...btn,background:"transparent",border:`1px solid ${C.coral}`,color:C.coral,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"12px 20px"}}>Brand School →</button>
            </div>
          </div>
          <div className="afu" style={{flexShrink:0,animationDelay:".15s"}}>
            {IMGS.hero
              ? <img src={IMGS.hero} alt="Obanijesu David Solomon" style={{width:260,height:320,borderRadius:20,objectFit:"cover",border:`1px solid ${C.border}`}}/>
              : <div style={{width:260,height:320,borderRadius:20,border:`2px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:12,gap:8}}>
                  <span style={{fontSize:32,color:C.border}}>◈</span>
                  <p style={{textAlign:"center"}}>Your photo here<br/><span style={{fontSize:10,color:C.border}}>Set IMGS.hero URL</span></p>
                </div>
            }
          </div>
        </div>
        <div style={{position:"absolute",bottom:28,left:"clamp(16px,4vw,64px)",right:"clamp(16px,4vw,64px)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <p style={{color:C.muted,fontSize:11,letterSpacing:"0.15em"}}>#ROOTED IN PURPOSE, DRIVEN BY VALUE</p>
          <p style={{color:C.muted,fontSize:11}}>enquiries@thevaluesage.com</p>
        </div>
      </div>
      <div style={{background:C.bg2,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"32px clamp(16px,4vw,64px)"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:24,maxWidth:760}}>
          {[["5+","Books"],["30+","Logos"],["Brand","Strategy"],["AI","Systems"]].map(([n,l])=>(
            <div key={l}><div style={{fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,color:C.coral,lineHeight:1}}>{n}</div><div style={{color:C.muted,fontSize:12,marginTop:4}}>{l}</div></div>
          ))}
        </div>
      </div>
      <div style={{padding:"64px clamp(16px,4vw,64px)"}}>
        <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:36}}>What I Do</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
          {[{icon:"◈",t:"Brand Identity",d:"Full systems — naming, strategy, visual language, and guidelines.",to:"services",cat:"Brand",tag:"Brand"},{icon:"▦",t:"Web Design & Build",d:"Websites that look like your brand actually thought about itself.",cat:"Web",to:"services",tag:"Web"},{icon:"⬡",t:"AI & Automations",cat:"AI",d:"Real workflow integration — saving hours, scaling without extra headcount.",to:"services",tag:"AI"},{icon:"◉",t:"Sessions & Speaking",d:"1-on-1 coaching, group workshops, keynote speaking.",to:"sessions",tag:"Book"},{icon:"▣",t:"Books & Music",d:"Practical books on brand, business, value — and music theory (TEOM).",to:"books",tag:"Read"},{icon:"◆",t:"Brand School",d:"Free educational content across branding, finance, AI, and music.",to:"school",tag:"Free"}].map(item=>(
            <div key={item.t} onClick={()=>{if(item.cat)setSvCat(item.cat);go(item.to)}} className="ch" style={{...card,padding:24,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <span style={{fontSize:22,color:C.coral}}>{item.icon}</span>
                <span style={{background:C.cdim,color:C.coral,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>{item.tag}</span>
              </div>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,marginBottom:7,color:C.text}}>{item.t}</h3>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{padding:"64px clamp(16px,4vw,64px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36,flexWrap:"wrap",gap:16}}>
          <div>
            <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>What Clients Say</p>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(24px,4vw,38px)",fontWeight:800,color:C.text}}>Reviews</h2>
          </div>
          <p style={{fontSize:13,color:C.muted,maxWidth:280,lineHeight:1.6}}>Only verified customers and invited clients can leave reviews. No spam. No fake praise.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:18,marginBottom:32}}>
          {[
            {name:"Ridwan Adegoke",role:"Chairman, NANS JCC Oyo Axis",service:"Campaign Design",rating:5,text:"The campaign materials were sharp, professional, and actually moved people. Delivered fast, no corners cut. Exactly what we needed for the election."},
            {name:"Choice Foods & Bites",role:"Food brand, Ejigbo, Osun",service:"Brand Campaign",rating:5,text:"From the first flyer to the event banner, everything was consistent and looked premium. People kept asking who designed our materials."},
            {name:"The Oasis Podcast",role:"Faith & growth platform",service:"Podcast Covers",rating:5,text:"The REST and REBIRTH covers captured exactly what the episodes were about. Clean, intentional, and delivered before the deadline."},
          ].map((r,i)=>(
            <div key={i} style={{...card,padding:24}}>
              <div style={{display:"flex",gap:4,marginBottom:14}}>
                {Array.from({length:r.rating}).map((_,s)=><span key={s} style={{color:"#F59E0B",fontSize:14}}>★</span>)}
              </div>
              <p style={{fontSize:14,color:C.lt,lineHeight:1.75,marginBottom:18,fontStyle:"italic"}}>"{r.text}"</p>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>
                <p style={{fontSize:13,fontWeight:600,color:C.text}}>{r.name}</p>
                <p style={{fontSize:12,color:C.muted}}>{r.role}</p>
                <span style={{display:"inline-block",marginTop:6,background:C.cdim,color:C.coral,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>{r.service}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{fontSize:13,color:C.muted,textAlign:"center"}}>More reviews load once we have verified clients on the platform. <span onClick={()=>go("contact")} style={{color:C.coral,cursor:"pointer"}}>Been a client? Request a review link →</span></p>
      </div>
      {/* Newsletter section */}
      <div style={{background:C.bg2,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"64px clamp(16px,4vw,64px)"}}>
        <div style={{maxWidth:600,margin:"0 auto",textAlign:"center"}}>
          <p style={{color:C.coral,fontSize:11,fontWeight:700,letterSpacing:"0.18em",marginBottom:12}}>THE VALUE SAGE NEWSLETTER</p>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(24px,4vw,38px)",fontWeight:800,marginBottom:12,color:C.text}}>Brand. AI. Finance. Music.</h2>
          <p style={{color:C.lt,fontSize:15,lineHeight:1.7,marginBottom:32}}>One email. Every topic I work at the intersection of — sent directly to you. No algorithm. No noise.</p>
          <div style={{maxWidth:420,margin:"0 auto"}}><NewsletterForm C={C} card={card} coral={C.coral}/></div>
        </div>
      </div>
      <div style={{background:C.coral,padding:"16px 0",overflow:"hidden",whiteSpace:"nowrap"}}>
        <div style={{display:"inline-block",animation:"mq 24s linear infinite",willChange:"transform"}}>
          <span style={{fontFamily:"'Syne',sans-serif",color:"rgba(255,255,255,.92)",fontSize:"clamp(11px,1.5vw,14px)",fontWeight:700,letterSpacing:"0.08em"}}>BRAND STRATEGIST · WEB DESIGNER · AI CONSULTANT · AUTHOR · SPEAKER · AUTOMATION STRATEGIST · MUSIC THEORIST · FINANCE EDUCATOR · THE VALUE SAGE™    BRAND STRATEGIST · WEB DESIGNER · AI CONSULTANT · AUTHOR · SPEAKER · AUTOMATION STRATEGIST · MUSIC THEORIST · FINANCE EDUCATOR · THE VALUE SAGE™    </span>
        </div>
      </div>
    </div>
  )

  const Services = () => (
    <div style={{padding:"72px clamp(16px,4vw,64px)"}} className="afu">
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>What I Offer</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36,flexWrap:"wrap",gap:14}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,5vw,46px)",fontWeight:800,color:C.text}}>Services & <span style={{color:C.coral}}>Pricing</span></h2>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {Object.keys(SERVICES).map(cat=>(
            <button key={cat} onClick={()=>setSvCat(cat)} style={{padding:"8px 18px",borderRadius:20,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:svCat===cat?C.coral:"transparent",color:svCat===cat?"#fff":C.muted,border:`1px solid ${svCat===cat?C.coral:C.border}`,fontWeight:svCat===cat?600:400,transition:"all .2s"}}>
              {cat}
            </button>
          ))}
          {cart.length>0&&<button onClick={()=>go("cart")} style={{padding:"8px 18px",borderRadius:20,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:C.coral,color:"#fff",border:"none",fontWeight:600}}>Cart ({cart.length}) →</button>}
        </div>
      </div>
      <p style={{color:C.muted,fontSize:13,marginBottom:32,lineHeight:1.6}}>All prices exclude 7.5% VAT. Custom pricing = discovery call first. Every tier includes a project questionnaire.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
        {SERVICES[svCat]?.map(svc=>(
          <div key={svc.id} style={{...card,overflow:"hidden"}}>
            <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:20,color:C.coral}}>{svc.icon}</span>
              <div>
                <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:C.text}}>{svc.name}</h3>
                <p style={{fontSize:11,color:C.muted,marginTop:2}}>{svc.note}</p>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))"}}>
              {svc.tiers.map((tier,ti)=>(
                <div key={tier.name} style={{padding:"16px 16px 18px",borderRight:ti%2===0&&ti<svc.tiers.length-1?`1px solid ${C.border}`:"none",borderBottom:svc.tiers.length>2&&ti<2?`1px solid ${C.border}`:"none",position:"relative"}}>
                  {tier.tag&&<span style={{position:"absolute",top:10,right:10,background:C.cdim,color:C.coral,fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3}}>{tier.tag}</span>}
                  <p style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,marginBottom:3,color:C.text}}>{tier.name}</p>
                  {tier.price
                    ? <div style={{marginBottom:8}}>
                        <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:C.text}}>{fmtPrice(tier.price)}</span>
                        <span style={{fontSize:10,color:C.muted,marginLeft:6}}>+VAT</span>
                      </div>
                    : <p style={{fontSize:14,fontWeight:700,color:C.coral,marginBottom:8}}>Custom</p>
                  }
                  <div style={{marginBottom:12}}>
                    {tier.deliverables.slice(0,4).map(d=>(
                      <div key={d} style={{display:"flex",gap:5,marginBottom:4}}>
                        <span style={{color:C.coral,fontSize:9,marginTop:3,flexShrink:0}}>✓</span>
                        <span style={{fontSize:11,color:C.lt,lineHeight:1.4}}>{d}</span>
                      </div>
                    ))}
                    {tier.deliverables.length>4&&<p style={{fontSize:10,color:C.muted,marginTop:4}}>+{tier.deliverables.length-4} more included</p>}
                  </div>
                  <p style={{fontSize:10,color:C.muted,fontStyle:"italic",marginBottom:10,lineHeight:1.4}}>{tier.best}</p>
                  {tier.price!==null
                    ? <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>{addToCart(svc,tier)}} title="Add to cart" style={{flexShrink:0,padding:"8px 10px",borderRadius:7,fontSize:14,fontWeight:800,cursor:"pointer",background:"transparent",color:C.coral,border:`1px solid ${C.coral}`,fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>+</button>
                        <button onClick={()=>{setSelSvc(svc);setSelTier(tier);setIntakeOpen(true)}} style={{flex:1,padding:"8px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:C.coral,color:"#fff",border:"none"}}>Begin Project</button>
                      </div>
                    : <button onClick={()=>go("contact")} style={{width:"100%",padding:"8px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",border:`1px solid ${C.coral}`,color:C.coral}}>Enquire</button>
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <IntakeModal/>
    </div>
  )

  const Cart = () => (
    <div style={{padding:"72px clamp(16px,4vw,64px)",maxWidth:760,margin:"0 auto"}} className="afu">
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Project Cart</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36,flexWrap:"wrap",gap:14}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,4vw,42px)",fontWeight:800,color:C.text}}>Your Cart</h2>
        <button onClick={()=>go("services")} style={{padding:"9px 18px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",border:`1px solid ${C.border}`,color:C.text}}>+ Add More Services</button>
      </div>
      {cart.length===0?(
        <div style={{textAlign:"center",padding:"64px 0"}}>
          <p style={{color:C.border,fontSize:40,marginBottom:12}}>◈</p>
          <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,marginBottom:8,color:C.text}}>Your cart is empty</p>
          <p style={{color:C.muted,marginBottom:24,fontSize:14}}>Browse services and add items to get started.</p>
          <button onClick={()=>go("services")} style={{...btn,background:C.coral,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Browse Services</button>
        </div>
      ):(
        <>
          <div style={{display:"grid",gap:12,marginBottom:28}}>
            {cart.map((item,i)=>(
              <div key={item.id} style={{...card,padding:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <div>
                  <p style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,marginBottom:2,color:C.text}}>{item.svc}</p>
                  <p style={{color:C.muted,fontSize:12}}>{item.tier} Tier</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:C.text}}>{fmtPrice(item.price)}</p>
                    <p style={{fontSize:11,color:C.muted}}>+VAT {fmtPrice(item.vat)}</p>
                  </div>
                  <button onClick={()=>setCart(c=>c.filter((_,j)=>j!==i))} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"4px 10px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{...card,padding:22,marginBottom:20}}>
            {[["Subtotal (excl. VAT)",fmtPrice(cartTotal)],["VAT (7.5%)",fmtPrice(cartVAT)],["Total",fmtPrice(cartTotal+cartVAT)],["Deposit Required (50%)",fmtPrice(Math.round((cartTotal+cartVAT)*.5))]].map(([l,v],i)=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<3?`1px solid ${C.border}`:"none",borderTop:i===3?`2px solid ${C.coral}`:"none"}}>
                <span style={{fontSize:13,color:i===3?C.coral:C.muted,fontWeight:i===3?600:400}}>{l}</span>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:i===2||i===3?18:14,fontWeight:i===2||i===3?800:500,color:i===3?C.coral:C.text}}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={generateCartInvoice} disabled={invLoading} style={{...btn,background:invLoading?"#333":C.coral,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%"}}>
            {invLoading?"Generating Invoice...":"Generate Invoice for All Items →"}
          </button>
          <p style={{fontSize:12,color:C.muted,textAlign:"center",marginTop:12}}>Invoice will include full VAT breakdown, payment details, and deposit instructions.</p>
        </>
      )}
    </div>
  )


  // ── ORDERS PAGE (Cart + Invoices combined) ────────────────────────────────
  const Orders = () => {
    const [tab, setOTab] = useState(cart.length > 0 ? "cart" : "invoices")
    const cartTotal = cart.reduce((a,i)=>a+i.price,0)
    const cartVAT   = cart.reduce((a,i)=>a+i.vat,0)
    return (
      <div style={{padding:"72px clamp(16px,4vw,64px)"}} className="afu">
        <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Sales & Orders</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28,flexWrap:"wrap",gap:14}}>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,4vw,42px)",fontWeight:800,color:C.text}}>My <span style={{color:C.coral}}>Orders</span></h2>
          <button onClick={()=>go("services")} style={{padding:"9px 18px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",border:`1px solid ${C.border}`,color:C.text}}>+ Add Service</button>
        </div>

        {/* Tab switcher */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:28}}>
          {[["cart",`Cart${cart.length>0?" ("+cart.length+")":""}`],["invoices",`Invoices${invoices.length>0?" ("+invoices.length+")":""}`]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setOTab(id)} style={{background:"none",border:"none",fontFamily:"'DM Sans',sans-serif",color:tab===id?C.text:C.muted,fontSize:15,fontWeight:tab===id?600:400,padding:"10px 20px",cursor:"pointer",borderBottom:`2px solid ${tab===id?C.coral:"transparent"}`,transition:"all .2s"}}>{lbl}</button>
          ))}
        </div>

        {/* CART TAB */}
        {tab==="cart"&&(
          cart.length===0
            ? <div style={{textAlign:"center",padding:"60px 0"}}>
                <p style={{color:C.border,fontSize:36,marginBottom:12}}>◈</p>
                <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,marginBottom:8,color:C.text}}>Cart is empty</p>
                <p style={{color:C.muted,marginBottom:22,fontSize:14}}>Browse services and hit + on any tier to add it here.</p>
                <button onClick={()=>go("services")} style={{...btn,background:C.coral,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Browse Services</button>
              </div>
            : <>
                <div style={{display:"grid",gap:10,marginBottom:24}}>
                  {cart.map((item,i)=>(
                    <div key={item.id} style={{...card,padding:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                      <div>
                        <p style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,marginBottom:2,color:C.text}}>{item.svc}</p>
                        <p style={{color:C.muted,fontSize:12}}>{item.tier} Tier</p>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:16}}>
                        <div style={{textAlign:"right"}}>
                          <p style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:C.text}}>{fmtPrice(item.price)}</p>
                          <p style={{fontSize:11,color:C.muted}}>+VAT {fmtPrice(item.vat)}</p>
                        </div>
                        <button onClick={()=>setCart(c=>c.filter((_,j)=>j!==i))} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"4px 10px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{...card,padding:20,marginBottom:18}}>
                  {[["Subtotal (excl. VAT)",fmtPrice(cartTotal)],["VAT (7.5%)",fmtPrice(cartVAT)],["Total",fmtPrice(cartTotal+cartVAT)],["50% Deposit to begin",fmtPrice(Math.round((cartTotal+cartVAT)*.5))]].map(([l,v],i)=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderTop:i===2?`2px solid ${C.coral}`:i===3?"none":`1px solid ${C.border}`,marginTop:i===2?4:0}}>
                      <span style={{fontSize:i>=2?13:12,color:i===3?C.coral:i===2?C.text:C.muted,fontWeight:i>=2?600:400}}>{l}</span>
                      <span style={{fontFamily:i>=2?"'Syne',sans-serif":"inherit",fontSize:i===2?18:i===3?14:13,fontWeight:i>=2?800:500,color:i===3?C.coral:C.text}}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={generateCartInvoice} disabled={invLoading} style={{width:"100%",padding:"14px",borderRadius:8,fontSize:14,fontWeight:600,cursor:invLoading?"wait":"pointer",fontFamily:"'DM Sans',sans-serif",background:invLoading?"#333":C.coral,color:"#fff",border:"none",marginBottom:10}}>
                  {invLoading?"Generating Invoice...":"Generate Invoice & Pay →"}
                </button>
                <p style={{fontSize:11,color:C.muted,textAlign:"center"}}>Invoice includes VAT breakdown. Pay by bank transfer, card (Paystack), or crypto.</p>
              </>
        )}

        {/* INVOICES TAB */}
        {tab==="invoices"&&(
          invoices.length===0
            ? <div style={{textAlign:"center",padding:"60px 0"}}>
                <p style={{color:C.border,fontSize:36,marginBottom:12}}>◈</p>
                <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,marginBottom:8,color:C.text}}>No invoices yet</p>
                <p style={{color:C.muted,marginBottom:22,fontSize:14}}>Your invoices appear here after you get started with a service or session.</p>
              </div>
            : <div style={{display:"grid",gap:10}}>
                {invoices.map(inv=>(
                  <div key={inv.id} onClick={()=>{setActiveInv(inv);go("invoice")}} className="ch" style={{...card,padding:18,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",flexWrap:"wrap",gap:12}}>
                    <div>
                      <p style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,marginBottom:2,color:C.text}}>{inv.service||"Multiple Services"} — {inv.tier||"Cart"}</p>
                      <p style={{color:C.muted,fontSize:12}}>{inv.id} · {inv.date} · {inv.client?.name||"Client"}</p>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div style={{textAlign:"right"}}>
                        <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:C.coral}}>₦{inv.total?.toLocaleString()}</p>
                        <span style={{background:inv.status==="paid"?"#021508":C.cdim,color:inv.status==="paid"?"#059669":C.coral,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4}}>
                          {inv.status==="paid"?"PAID":inv.status==="deposit_paid"?"DEPOSIT PAID":"PENDING"}
                        </span>
                      </div>
                      <span style={{color:C.muted,fontSize:18}}>›</span>
                    </div>
                  </div>
                ))}
              </div>
        )}
      </div>
    )
  }

  const Portfolio = () => (
    <div style={{padding:"72px clamp(16px,4vw,64px)"}} className="afu">
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Selected Work</p>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,5vw,46px)",fontWeight:800,marginBottom:32,color:C.text}}>Portfolio</h2>
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,marginBottom:32}}>
        {[["brand","Brand Identities"],["logos","Logo Folio"],["flyers","Flyers & Print"],["web","Web"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setPtab(id)} style={{background:"none",border:"none",fontFamily:"'DM Sans',sans-serif",color:ptab===id?C.text:C.muted,fontSize:14,fontWeight:ptab===id?600:400,padding:"10px 20px",cursor:"pointer",borderBottom:`2px solid ${ptab===id?C.coral:"transparent"}`,transition:"all .2s"}}>{lbl}</button>
        ))}
      </div>
      {ptab==="brand"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:20}}>
        {PORTFOLIO.brand.map(item=>(
          <div key={item.name} style={{...card,overflow:"hidden"}}>
            <div style={{height:160,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:C.coral,fontSize:48}}>◈</span></div>
            <div style={{padding:22}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,marginBottom:6,color:C.text}}>{item.name}</h3>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:12}}>{item.desc}</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{item.tags.map(t=><span key={t} style={{background:C.cdim,color:C.coral,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>{t}</span>)}</div>
            </div>
          </div>
        ))}
      </div>}
      {ptab==="logos"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
        {PORTFOLIO.logos.map(name=><div key={name} className="ch" style={{...card,padding:20,textAlign:"center"}}><span style={{fontSize:24,color:C.coral,display:"block",marginBottom:8}}>◉</span><p style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:C.text}}>{name}</p></div>)}
      </div>}
      {ptab==="flyers"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16}}>
        {PORTFOLIO.flyers.map(name=><div key={name} style={{...card,padding:22}}><span style={{fontSize:22,color:C.coral,display:"block",marginBottom:10}}>▣</span><p style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{name}</p></div>)}
      </div>}
      {ptab==="web"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20}}>
        {[
          {name:"The Value Sage™ Website",desc:"Personal brand portfolio with booking, invoicing, and AI advisor. Next.js + Supabase + Clerk.",tags:["Next.js","TypeScript","Supabase"],bg:"#0A0A1A"},
          {name:"Obverse Studio",desc:"Creative studio landing page. Clean, minimal, conversion-focused.",tags:["Web Design","Landing Page"],bg:"#1A0A0A"},
        ].map(item=>(
          <div key={item.name} style={{...card,overflow:"hidden"}}>
            <div style={{height:140,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:C.coral,fontSize:44}}>▦</span></div>
            <div style={{padding:22}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,marginBottom:6,color:C.text}}>{item.name}</h3>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:12}}>{item.desc}</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{item.tags.map(t=><span key={t} style={{background:C.cdim,color:C.coral,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>{t}</span>)}</div>
            </div>
          </div>
        ))}
        <div style={{...card,padding:28,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center",border:`2px dashed ${C.border}`,background:"transparent"}}>
          <span style={{color:C.border,fontSize:36,marginBottom:12}}>▦</span>
          <p style={{fontSize:14,color:C.muted,lineHeight:1.6}}>More web projects coming as the studio grows. Behance integration in Phase 3 will auto-populate this.</p>
        </div>
      </div>}
    </div>
  )

  const Books = () => (
    <div style={{padding:"72px clamp(16px,4vw,64px)"}} className="afu">
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Published Works</p>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,5vw,46px)",fontWeight:800,marginBottom:12,color:C.text}}>Books</h2>
      <p style={{color:C.lt,fontSize:15,lineHeight:1.7,maxWidth:500,marginBottom:44}}>Practical books for entrepreneurs, creatives, and curious minds — on brand, business, value, and music.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
        {BOOKS.map((b,i)=>(
          <div key={b.title} style={{...card,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <div style={{background:b.bg,height:148,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:20,position:"relative"}}>
              {b.status==="New"&&<span style={{position:"absolute",top:12,right:12,background:C.coral,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>NEW</span>}
              <p style={{color:"rgba(255,255,255,.3)",fontSize:10,marginBottom:3,letterSpacing:"0.1em"}}>BOOK {String(i+1).padStart(2,"0")}</p>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:"#fff",lineHeight:1.2}}>{b.title}</h3>
            </div>
            <div style={{padding:20,flex:1,display:"flex",flexDirection:"column"}}>
              <p style={{fontSize:11,color:b.acc,fontWeight:700,marginBottom:8}}>{b.sub}</p>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.65,flex:1}}>{b.desc}</p>
              <button style={{width:"100%",padding:"9px",borderRadius:8,fontSize:13,marginTop:16,background:"transparent",border:`1px solid ${C.border}`,color:C.text,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Get This Book →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const School = () => {
    const q = quizPool[qIdx]
    return (
      <div style={{padding:"72px clamp(16px,4vw,64px)",maxWidth:680,margin:"0 auto"}} className="afu">
        <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Free Resource</p>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,5vw,44px)",fontWeight:800,marginBottom:8,color:C.text}}>Brand <span style={{color:C.coral}}>School</span></h2>
        <p style={{color:C.lt,fontSize:14,lineHeight:1.7,marginBottom:8}}>10 questions shuffled from a {QUIZ_POOL.length}-question pool — brand, finance, AI, business, marketing & music.</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:32}}>
          {[...new Set(quizPool.map(x=>x.cat))].map(c=><span key={c} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 8px",fontSize:10,color:C.lt}}>{c}</span>)}
        </div>
        {!qDone?(
          <div>
            <div style={{display:"flex",gap:3,marginBottom:22}}>
              {quizPool.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<qIdx?C.coral:i===qIdx?C.coral+"80":C.border,transition:"background .3s"}}/>)}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <p style={{color:C.coral,fontSize:11,fontWeight:700,letterSpacing:"0.12em"}}>Q{qIdx+1} OF {quizPool.length}</p>
              <span style={{background:C.cdim,color:C.coral,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:3}}>{q?.cat}</span>
            </div>
            <h3 style={{fontSize:17,fontWeight:600,lineHeight:1.5,marginBottom:20,color:C.text}}>{q?.q}</h3>
            <div style={{display:"grid",gap:8,marginBottom:18}}>
              {q?.opts.map((opt,i)=>{
                const sel=qSel===i, right=qSel!==null&&i===q.ans, wrong=qSel===i&&i!==q.ans
                return (
                  <div key={i} onClick={()=>{if(qSel===null)setQSel(i)}} style={{...card,padding:"12px 16px",cursor:qSel===null?"pointer":"default",border:`1px solid ${right?"#059669":wrong?C.coral:C.border}`,background:right?"#020F06":wrong?C.cdim:C.card,transition:"all .25s",display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${right?"#059669":wrong?C.coral:C.border}`,background:right?"#059669":wrong?C.coral:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {right&&<span style={{color:"#fff",fontSize:9}}>✓</span>}{wrong&&<span style={{color:"#fff",fontSize:9}}>✕</span>}
                    </div>
                    <span style={{fontSize:13,color:C.text}}>{opt}</span>
                  </div>
                )
              })}
            </div>
            {qSel!==null&&(
              <div className="asi" style={{...card,padding:18,marginBottom:16,borderLeft:`3px solid ${qSel===q.ans?"#059669":C.coral}`}}>
                <p style={{fontSize:10,fontWeight:700,color:qSel===q.ans?"#059669":C.coral,marginBottom:5,letterSpacing:"0.1em"}}>{qSel===q.ans?"CORRECT":"THE RIGHT ANSWER"}</p>
                <p style={{fontSize:13,color:C.lt,lineHeight:1.75}}>{q.exp}</p>
              </div>
            )}
            {qSel!==null&&(
              <button onClick={()=>{if(qSel===q.ans)setQScore(s=>s+1);if(qIdx<quizPool.length-1){setQIdx(i=>i+1);setQSel(null)}else setQDone(true)}} style={{width:"100%",padding:"11px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:C.coral,color:"#fff",border:"none"}}>
                {qIdx<quizPool.length-1?"Next →":"See Results →"}
              </button>
            )}
          </div>
        ):(
          <div className="asc">
            <div style={{...card,padding:28,marginBottom:16,textAlign:"center"}}>
              <p style={{fontFamily:"'Syne',sans-serif",fontSize:10,letterSpacing:"0.15em",color:C.muted,marginBottom:8}}>RESULTS</p>
              <p style={{fontFamily:"'Syne',sans-serif",fontSize:48,fontWeight:800,color:C.coral,lineHeight:1}}>{qScore}/{quizPool.length}</p>
              <p style={{fontSize:14,color:C.lt,marginTop:8}}>{qScore===quizPool.length?"Perfect. You think like a strategist.":qScore>=7?"Strong foundation — a few gaps.":qScore>=5?"Solid start — keep building.":"Good beginning. Strategy is a practice."}</p>
            </div>
            <div style={{...card,padding:18,marginBottom:16,borderLeft:`3px solid ${C.coral}`}}>
              <p style={{fontSize:13,color:C.lt,lineHeight:1.75}}>The areas you missed reveal real gaps that may be costing you clients or clarity. A Brand Clarity Session addresses these in the context of your specific business.</p>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>go("sessions")} style={{flex:2,...btn,background:C.coral,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Book a Clarity Session →</button>
              <button onClick={newQuiz} style={{flex:1,...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.text,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>New Quiz</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const About = () => (
    <div style={{padding:"72px clamp(16px,4vw,64px)",maxWidth:1100,margin:"0 auto"}} className="afu">
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:44}}>The Value Sage™</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:64}}>
        <div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,4vw,40px)",fontWeight:800,lineHeight:1.1,marginBottom:22,color:C.text}}>Not just a designer.<br/><span style={{color:C.coral}}>A systems thinker.</span></h2>
          <p style={{fontSize:14,lineHeight:1.85,color:C.lt,marginBottom:14}}>I am Obanijesu David Solomon — Brand & AI Strategist, author of six books including The Elements of Music (TEOM), speaker, and Computer Science student at the University of Ibadan.</p>
          <p style={{fontSize:14,lineHeight:1.85,color:C.lt,marginBottom:14}}>I work at the intersection of brand strategy, design, AI, finance literacy, and music. These disciplines are not separate — they are all tools for the same mission: building things that create lasting value.</p>
          <p style={{fontSize:14,lineHeight:1.85,color:C.lt,marginBottom:22}}>I believe creativity is a form of stewardship. Every project is a seed, meant to grow and serve generations.</p>
          <blockquote style={{borderLeft:`3px solid ${C.coral}`,paddingLeft:16,marginBottom:20}}>
            <p style={{fontSize:13,color:C.muted,fontStyle:"italic",lineHeight:1.7}}>"Let your light so shine before men, that they may see your good works and glorify your Father in heaven."</p>
            <p style={{color:C.border,fontSize:11,marginTop:5}}>— Matthew 5:16</p>
          </blockquote>
        </div>
        <div>
          {IMGS.about
            ? <img src={IMGS.about} alt="Obanijesu David Solomon" style={{width:"100%",height:300,objectFit:"cover",borderRadius:12,marginBottom:24,border:`1px solid ${C.border}`}}/>
            : <div style={{width:"100%",height:300,borderRadius:12,border:`2px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:12,gap:8,marginBottom:24}}><span style={{fontSize:32,color:C.border}}>◈</span><p style={{textAlign:"center"}}>Your photo here<br/><span style={{fontSize:10,color:C.border}}>Set IMGS.about URL</span></p></div>
          }
          <div style={{display:"grid",gap:8}}>
            {[["Brand Identity & Strategy","Naming, visual systems, positioning, messaging"],["Web Design & Development","UI/UX, responsive build, CMS, conversion design"],["AI & Automation Consulting","Workflow integration, prompt systems, AI tools"],["Finance Literacy for Creatives","Pricing strategy, planning, money thinking"],["Speaking & Coaching","Keynotes, workshops, 1-on-1 sessions"],["Music Theory & Composition","Author of TEOM — The Elements of Music"]].map(([t,d])=>(
              <div key={t} style={{...card,padding:14,display:"flex",gap:12}}>
                <span style={{color:C.coral,fontSize:10,marginTop:4}}>◆</span>
                <div><p style={{fontSize:13,fontWeight:600,marginBottom:2,color:C.text}}>{t}</p><p style={{fontSize:11,color:C.muted}}>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const Contact = () => (
    <div style={{padding:"72px clamp(16px,4vw,64px)",maxWidth:940,margin:"0 auto"}} className="afu">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:60}}>
        <div>
          <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Get In Touch</p>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,4vw,40px)",fontWeight:800,marginBottom:14,color:C.text}}>Let's build<br/><span style={{color:C.coral}}>something</span><br/>that matters.</h2>
          <p style={{color:C.lt,fontSize:14,lineHeight:1.8,marginBottom:36}}>Available for brand projects, AI consulting, speaking, and partnerships across Africa and beyond.</p>
          <div style={{display:"grid",gap:16}}>
            {[["Email","enquiries@thevaluesage.com"],["Instagram / LinkedIn","@objdrums"],["Location","Ibadan, Nigeria (Remote & Onsite)"],["Availability","Open to new projects"]].map(([l,v])=>(
              <div key={l} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:13}}>
                <p style={{fontSize:10,color:C.coral,fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>{l.toUpperCase()}</p>
                <p style={{fontSize:13,color:C.lt}}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:18}}>Send a Message</p>
          <ContactForm C={C} coral={C.coral}/>
        </div>
      </div>
    </div>
  )

  const Newsletter = () => (
    <div style={{padding:"72px clamp(16px,4vw,64px)",maxWidth:680,margin:"0 auto"}} className="afu">
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Free Resource</p>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,5vw,44px)",fontWeight:800,marginBottom:12,color:C.text}}>The Value Sage<br/><span style={{color:C.coral}}>Newsletter</span></h2>
      <p style={{color:C.lt,fontSize:15,lineHeight:1.75,marginBottom:16}}>Brand strategy. AI and automation. Finance for creatives. Music theory. Real insights — not recycled content — sent directly to your inbox.</p>
      <p style={{color:C.muted,fontSize:13,marginBottom:40}}>No social media algorithm decides if you see it. No noise. Just the intersections of what I actually work at — delivered to people who want to think sharper.</p>
      <div style={{...card,padding:32,marginBottom:24}}>
        <p style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,marginBottom:6,color:C.text}}>What you will receive:</p>
        <div style={{display:"grid",gap:8,marginBottom:24}}>
          {["Brand insights: positioning, identity, strategy","AI and automation: tools, workflows, prompts","Finance thinking: pricing, value, money mindset","Music theory: elements, analysis, creative applications","New book announcements and free chapters"].map(i=>(
            <div key={i} style={{display:"flex",gap:8}}><span style={{color:C.coral,fontSize:10,marginTop:3}}>✓</span><span style={{fontSize:14,color:C.lt}}>{i}</span></div>
          ))}
        </div>
        <NewsletterForm C={C} card={card} coral={C.coral}/>
      </div>
    </div>
  )

  const InvoicePage = () => {
    const inv = activeInv
    if(!inv) return <div style={{padding:"80px 48px",textAlign:"center"}}><p style={{color:C.muted}}>No invoice selected.</p><button onClick={()=>go("invoices")} style={{...btn,background:C.coral,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:16}}>My Invoices</button></div>
    return (
      <div style={{background:"#fff",color:"#111",minHeight:"100vh",padding:"48px",fontFamily:"'DM Sans',sans-serif"}}>
        <div className="np" style={{display:"flex",gap:10,marginBottom:32,justifyContent:"flex-end"}}>
          <button onClick={()=>go("invoices")} style={{background:"none",border:"1px solid #ddd",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>← Invoices</button>
          <button onClick={()=>window.print()} style={{background:"#D93D20",color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:13,fontWeight:600}}>Print / PDF</button>
        </div>
        <div style={{maxWidth:700,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:36,paddingBottom:22,borderBottom:"1px solid #eee"}}>
            <div><h1 style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,marginBottom:3}}>The Value Sage™</h1><p style={{fontSize:12,color:"#888"}}>Obanijesu David Solomon</p><p style={{fontSize:12,color:"#888"}}>enquiries@thevaluesage.com</p><p style={{fontSize:12,color:"#888"}}>Ibadan, Nigeria</p></div>
            <div style={{textAlign:"right"}}>
              <p style={{fontSize:10,color:"#aaa",letterSpacing:"0.1em",marginBottom:3}}>INVOICE</p>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#D93D20",marginBottom:5}}>{inv.id}</h2>
              <p style={{fontSize:12,color:"#888"}}>Issued: {inv.date}</p><p style={{fontSize:12,color:"#888"}}>Due: {inv.due}</p>
              <span style={{display:"inline-block",marginTop:7,background:"#FFF0EE",border:"1px solid #F5C0B5",borderRadius:4,padding:"2px 9px",fontSize:10,fontWeight:700,color:"#CC3320"}}>PENDING</span>
            </div>
          </div>
          {inv.client?.name&&<div style={{marginBottom:28}}>
            <p style={{fontSize:10,color:"#aaa",letterSpacing:"0.1em",marginBottom:7}}>BILLED TO</p>
            <p style={{fontWeight:600,fontSize:14,marginBottom:2}}>{inv.client.name}</p>
            {inv.client.email&&<p style={{color:"#666",fontSize:13}}>{inv.client.email}</p>}
            {inv.service&&<p style={{color:"#aaa",fontSize:12,marginTop:5}}>{inv.service} — {inv.tier}{inv.sessionDate?` · ${inv.sessionDate} at ${inv.sessionTime}`:""}</p>}
          </div>}
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:22}}>
            <thead><tr style={{background:"#F8F8F8"}}>{["Description","Qty","Rate","Amount"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:h==="Description"?"left":"right",fontSize:10,color:"#aaa",letterSpacing:"0.08em",borderBottom:"1px solid #eee"}}>{h}</th>)}</tr></thead>
            <tbody>{inv.items?.map((item,i)=><tr key={i} style={{borderBottom:"1px solid #F5F5F5"}}><td style={{padding:"10px 12px",fontSize:13}}>{item.desc}</td><td style={{padding:"10px 12px",textAlign:"right",fontSize:13,color:"#888"}}>{item.qty}</td><td style={{padding:"10px 12px",textAlign:"right",fontSize:13,color:"#888"}}>₦{Number(item.rate).toLocaleString()}</td><td style={{padding:"10px 12px",textAlign:"right",fontSize:13,fontWeight:500}}>₦{(item.qty*item.rate).toLocaleString()}</td></tr>)}</tbody>
          </table>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:28}}>
            <div style={{minWidth:260}}>
              {[["Subtotal (excl. VAT)",inv.subtotal],["VAT (7.5%)",inv.vat],["Total",inv.total],["50% Deposit Required",inv.deposit]].map(([l,a],i)=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:i===2?"2px solid #111":"1px solid #f0f0f0",marginTop:i===2?4:0}}>
                  <span style={{fontSize:i>=2?14:12,color:i>=2?"#111":"#888",fontWeight:i>=2?600:400}}>{l}</span>
                  <span style={{fontFamily:i>=2?"'Syne',sans-serif":"inherit",fontSize:i===2?18:i===3?14:12,fontWeight:i>=2?800:500,color:i===2?"#D93D20":"#111"}}>₦{Number(a).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:"#F0F8FF",border:"1px solid #BFDFFF",borderRadius:8,padding:18,marginBottom:16}}>
            <p style={{fontSize:11,color:"#1A5FA8",fontWeight:700,marginBottom:8,letterSpacing:"0.08em"}}>PAYMENT METHODS</p>
            <p style={{fontSize:13,color:"#333",lineHeight:1.7}}>Bank transfer details will be provided via email within 2 hours of invoice receipt. Online payment (Paystack) coming soon. For urgent payments, contact via WhatsApp.</p>
            <p style={{fontSize:12,color:"#666",marginTop:8}}>Account name: Obanijesu David Solomon · Bank: [To be confirmed on email]</p>
          </div>
          {inv.note&&<div style={{background:"#F9F9F9",borderRadius:7,padding:18,marginBottom:14}}><p style={{fontSize:10,color:"#aaa",letterSpacing:"0.08em",marginBottom:5}}>FROM THE VALUE SAGE™</p><p style={{fontSize:13,color:"#555",lineHeight:1.75}}>{inv.note}</p></div>}
          <div style={{borderTop:"1px solid #eee",paddingTop:14,textAlign:"center"}}>
            <p style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:"#D93D20"}}>The Value Sage™</p>
            <p style={{fontSize:11,color:"#bbb",marginTop:3}}>Rooted in Purpose, Driven by Value · enquiries@thevaluesage.com · Ibadan, Nigeria</p>
          </div>
        </div>
      </div>
    )
  }

  const Invoices = () => (
    <div style={{padding:"72px clamp(16px,4vw,64px)",maxWidth:820,margin:"0 auto"}} className="afu">
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Client Portal</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:32,flexWrap:"wrap",gap:14}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(24px,4vw,40px)",fontWeight:800,color:C.text}}>My Invoices</h2>
        <div style={{display:"flex",gap:10}}>
          {cart.length>0&&<button onClick={()=>go("cart")} style={{...btn,background:C.coral,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"9px 18px"}}>View Cart ({cart.length})</button>}
          <button onClick={()=>go("sessions")} style={{...btn,background:"transparent",border:`1px solid ${C.border}`,color:C.text,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"9px 18px"}}>+ New Booking</button>
        </div>
      </div>
      {invoices.length===0?(
        <div style={{textAlign:"center",padding:"64px 0"}}>
          <p style={{color:C.border,fontSize:40,marginBottom:12}}>◈</p>
          <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,marginBottom:8,color:C.text}}>No invoices yet</p>
          <p style={{color:C.muted,marginBottom:22,fontSize:14}}>Book a session or start a project to generate your first invoice.</p>
          <button onClick={()=>go("sessions")} style={{...btn,background:C.coral,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Book a Session</button>
        </div>
      ):(
        <div style={{display:"grid",gap:10}}>
          {invoices.map(inv=>(
            <div key={inv.id} onClick={()=>{setActiveInv(inv);go("invoice")}} className="ch" style={{...card,padding:18,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",flexWrap:"wrap",gap:12}}>
              <div>
                <p style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,marginBottom:2,color:C.text}}>{inv.service||"Multiple Services"} — {inv.tier||"Cart Invoice"}</p>
                <p style={{color:C.muted,fontSize:12}}>{inv.id} · {inv.date} · {inv.client?.name||"Unnamed"}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:C.coral,marginBottom:4}}>₦{inv.total?.toLocaleString()}</p>
                <span style={{background:C.cdim,border:`1px solid ${C.coral}`,borderRadius:4,padding:"2px 8px",fontSize:10,color:C.coral,fontWeight:700}}>PENDING</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const Admin = () => {
    if(!adminAuth) return (
      <div style={{padding:"72px clamp(16px,4vw,64px)",maxWidth:360,margin:"0 auto"}} className="afu">
        <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Restricted</p>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,marginBottom:22,color:C.text}}>Admin <span style={{color:C.coral}}>Panel</span></h2>
        <div style={{...card,padding:24}}>
          <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Password</label>
          <AdminLoginForm C={C} coral={C.coral} onSuccess={()=>setAdminAuth(true)}/>
        </div>
        <p style={{color:C.muted,fontSize:11,marginTop:12,textAlign:"center"}}>Real auth (Clerk) coming in Phase 2</p>
      </div>
    )
    return (
      <div style={{padding:"72px clamp(16px,4vw,64px)"}} className="afu">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32,flexWrap:"wrap",gap:14}}>
          <div><p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",marginBottom:5}}>ADMIN</p><h2 style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:C.text}}>Dashboard</h2></div>
          <button onClick={()=>setAdminAuth(false)} style={{padding:"8px 16px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",border:`1px solid ${C.border}`,color:C.text}}>Sign Out</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:28}}>
          {[["Invoices",invoices.length],["Total (incl. VAT)","₦"+invoices.reduce((a,i)=>a+(i.total||0),0).toLocaleString()],["Cart Items",cart.length],["Services",Object.values(SERVICES).flat().length]].map(([l,v])=>(
            <div key={l} style={{...card,padding:20}}><p style={{color:C.muted,fontSize:11,marginBottom:5}}>{l}</p><p style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:C.coral}}>{v}</p></div>
          ))}
        </div>
        <div style={{...card,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.text}}>All Invoices</p>
            <span style={{background:C.cdim,color:C.coral,fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:4}}>{invoices.length}</span>
          </div>
          {invoices.length===0?<p style={{padding:28,textAlign:"center",color:C.muted,fontSize:13}}>No invoices yet.</p>:(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:C.bg2}}>{["Invoice","Client","Service","Subtotal","VAT","Total","Status"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:10,color:C.muted,fontWeight:600,letterSpacing:"0.07em",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                <tbody>{invoices.map(inv=>(
                  <tr key={inv.id} style={{borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>{setActiveInv(inv);go("invoice")}}>
                    <td style={{padding:"10px 13px",fontSize:12,color:C.coral,fontWeight:600}}>{inv.id}</td>
                    <td style={{padding:"10px 13px",fontSize:13,color:C.text}}>{inv.client?.name||"—"}</td>
                    <td style={{padding:"10px 13px",fontSize:12,color:C.muted,whiteSpace:"nowrap"}}>{inv.service||"Multiple"}</td>
                    <td style={{padding:"10px 13px",fontSize:12,color:C.text}}>₦{(inv.subtotal||0).toLocaleString()}</td>
                    <td style={{padding:"10px 13px",fontSize:12,color:C.muted}}>₦{(inv.vat||0).toLocaleString()}</td>
                    <td style={{padding:"10px 13px",fontSize:13,fontWeight:600,color:C.text}}>₦{(inv.total||0).toLocaleString()}</td>
                    <td style={{padding:"10px 13px"}}><span style={{background:C.cdim,color:C.coral,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4}}>PENDING</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{...card,padding:20,marginTop:16}}>
          <p style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,marginBottom:6,color:C.text}}>Phase 2 — What you need to action</p>
          <div style={{display:"grid",gap:8}}>
            {[["Paystack","Create account at paystack.com → get your Public + Secret API keys → share with developer for payment integration"],["Clerk Auth","Create account at clerk.com → set up your application → share API keys for real login/register"],["Supabase","Create account at supabase.com → set up database → this powers persistent user data, cart, and invoices"],["Google Workspace","Acquire enquiries@thevaluesage.com → about $6/month → gives you professional email + calendar"],["Resend Email","Create account at resend.dev → for automated invoice + confirmation emails to clients"]].map(([name,desc])=>(
              <div key={name} style={{display:"flex",gap:10}}>
                <span style={{color:C.coral,fontSize:10,marginTop:3,flexShrink:0}}>→</span>
                <div><p style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:2}}>{name}</p><p style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const SB_ITEMS = [["home","Home"],["services","Services"],["sessions","Book a Session"],["portfolio","Portfolio"],["books","Books"],["school","Brand School"],["newsletter","Newsletter"],["orders",`Orders${(cart.length+invoices.length)>0?" ("+(cart.length+invoices.length)+")":""}`],["about","About"],["contact","Contact"],["admin","Admin"]]


  // ── AUTH MODAL ─────────────────────────────────────────────────────────────
  const AuthModal = () => {
    if(!authOpen) return null
    return (
      <div className="ov" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget)setAuthOpen(false)}}>
        <div style={{width:"min(94vw,420px)",background:C.card,borderRadius:16,border:`1px solid ${C.border}`,padding:32}} className="asc" onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <div>
              <p style={{fontFamily:"'Syne',sans-serif",fontSize:11,color:C.coral,letterSpacing:"0.15em",marginBottom:4}}>THE VALUE SAGE™</p>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:C.text}}>{authMode==="signin"?"Welcome back":"Create account"}</h2>
            </div>
            <button onClick={()=>setAuthOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
          </div>
          {authErr&&<div style={{background:C.cdim,border:`1px solid ${C.coral}`,borderRadius:7,padding:"10px 14px",marginBottom:16}}><p style={{color:C.coral,fontSize:13}}>{authErr}</p></div>}
          {authMode==="signup"&&(
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Full Name</label>
              <input value={authName} onChange={e=>{setAuthName(e.target.value);setAuthErr("")}} placeholder="Obanijesu Solomon" style={{width:"100%",padding:"11px 16px",borderRadius:8,fontSize:14,background:C.card2,border:`1px solid ${C.border}`,color:C.text,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
            </div>
          )}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Email</label>
            <input type="email" value={authEmail} onChange={e=>{setAuthEmail(e.target.value);setAuthErr("")}} placeholder="you@email.com" style={{width:"100%",padding:"11px 16px",borderRadius:8,fontSize:14,background:C.card2,border:`1px solid ${C.border}`,color:C.text,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6}}>Password</label>
            <input type="password" value={authPw} onChange={e=>{setAuthPw(e.target.value);setAuthErr("")}} placeholder="••••••••" style={{width:"100%",padding:"11px 16px",borderRadius:8,fontSize:14,background:C.card2,border:`1px solid ${C.border}`,color:C.text,fontFamily:"'DM Sans',sans-serif",outline:"none"}} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
          </div>
          <button onClick={handleAuth} disabled={authLoading} style={{width:"100%",padding:"13px",borderRadius:8,fontSize:14,fontWeight:600,cursor:authLoading?"wait":"pointer",fontFamily:"'DM Sans',sans-serif",background:authLoading?"#333":C.coral,color:"#fff",border:"none",marginBottom:16}}>
            {authLoading?"Please wait...":(authMode==="signin"?"Sign In":"Create Account")}
          </button>
          <p style={{textAlign:"center",fontSize:13,color:C.muted}}>
            {authMode==="signin"?"Don't have an account? ":"Already have an account? "}
            <span onClick={()=>{setAuthMode(m=>m==="signin"?"signup":"signin");setAuthErr("")}} style={{color:C.coral,cursor:"pointer",fontWeight:600}}>
              {authMode==="signin"?"Sign up":"Sign in"}
            </span>
          </p>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,marginTop:16,textAlign:"center"}}>
            <p style={{fontSize:11,color:C.muted,lineHeight:1.6}}>Signing in saves your cart and invoices across devices. One-tap checkout on return visits.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleAuth = () => {
    if(!authEmail.includes("@")){setAuthErr("Please enter a valid email.");return}
    if(authPw.length<6){setAuthErr("Password must be at least 6 characters.");return}
    if(authMode==="signup"&&!authName){setAuthErr("Please enter your name.");return}
    setAuthLoading(true)
    // Demo auth — real Clerk auth happens in the Next.js app
    setTimeout(()=>{
      setCurrentUser({name:authMode==="signup"?authName:authEmail.split("@")[0],email:authEmail})
      setAuthOpen(false);setAuthLoading(false)
      setAuthName("");setAuthEmail("");setAuthPw("")
    },800)
  }

  const PAGES = {
    dashboard:<div style={{padding:"72px clamp(16px,4vw,64px)",maxWidth:860,margin:"0 auto"}} className="afu">
      <p style={{color:C.muted,fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Client Portal</p>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(26px,4vw,40px)",fontWeight:800,marginBottom:32,color:C.text}}>
        Welcome{currentUser?", "+currentUser.name.split(" ")[0]:""}
      </h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:32}}>
        {[["My Invoices","invoices","◈"],["My Cart","cart","▣"],["Book a Session","sessions","◉"],["Browse Services","services","◆"]].map(([l,p,i])=>(
          <div key={l} onClick={()=>go(p)} className="ch" style={{...card,padding:22,cursor:"pointer",textAlign:"center"}}>
            <span style={{fontSize:28,color:C.coral,display:"block",marginBottom:8}}>{i}</span>
            <p style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.text}}>{l}</p>
          </div>
        ))}
      </div>
      {currentUser&&<div style={{...card,padding:22,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
        <div>
          <p style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:C.text}}>{currentUser.name}</p>
          <p style={{color:C.muted,fontSize:13}}>{currentUser.email}</p>
        </div>
        <button onClick={()=>{setCurrentUser(null);go("home")}} style={{padding:"8px 16px",borderRadius:7,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Sign Out</button>
      </div>}
    </div>,home:<Home/>,services:<Services/>,sessions:<BookingForm C={C} card={card} coral={C.coral} onInvoiceGenerated={handleSessionInvoice}/>,portfolio:<Portfolio/>,books:<Books/>,school:<School/>,about:<About/>,contact:<Contact/>,newsletter:<Newsletter/>,cart:<Orders/>,orders:<Orders/>,invoices:<Orders/>,invoice:<InvoicePage/>,admin:<Admin/>}

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif",transition:"background .35s,color .35s",position:"relative"}}>
      <AuthModal/>
      {sb&&(
        <>
          <div className="ov" style={{justifyContent:"flex-end",alignItems:"stretch",padding:0}} onClick={e=>{if(e.target===e.currentTarget)setSb(false)}}>
          <div style={{position:"relative",width:"min(80vw,270px)",background:C.card,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:2,overflowY:"auto",padding:"22px 26px"}} onClick={e=>e.stopPropagation()} className="asi">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:C.coral}}>The Value Sage™</span>
              <button onClick={()=>setSb(false)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            {SB_ITEMS.map(([id,lbl])=>(
              <div key={id} onClick={()=>go(id)} style={{padding:"10px 0",cursor:"pointer",color:page===id?C.coral:C.text,fontWeight:page===id?600:400,borderBottom:`1px solid ${C.border}`,fontSize:14,transition:"color .15s"}}>{lbl}</div>
            ))}
            <div style={{marginTop:"auto",paddingTop:18}}>
              <button onClick={()=>setMode(m=>m==="dark"?"light":"dark")} style={{width:"100%",padding:"10px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",border:`1px solid ${C.border}`,color:C.text}}>{mode==="dark"?"☀  Light Mode":"◑  Dark Mode"}</button>
            </div>
          </div>
          </div>
        </>
      )}
      {page!=="invoice"&&(
        <nav className="np" style={{position:"sticky",top:0,zIndex:100,background:`${C.bg}EE`,backdropFilter:"blur(18px)",borderBottom:`1px solid ${C.border}`,height:52,display:"flex",alignItems:"center",padding:"0 clamp(12px,3vw,40px)",gap:"clamp(8px,1.5vw,20px)",transition:"background .35s"}}>
          <div onClick={()=>go("home")} style={{cursor:"pointer",marginRight:2}}><span style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:C.coral}}>TVS™</span></div>
          {[["home","Home"],["services","Services"],["portfolio","Portfolio"],["sessions","Book"]].map(([id,lbl])=>(
            <span key={id} onClick={()=>go(id)} className="nl" style={{cursor:"pointer",fontSize:14,color:page===id?C.text:C.muted,paddingBottom:2,borderBottom:`2px solid ${page===id?C.coral:"transparent"}`,transition:"all .15s"}}>{lbl}</span>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:7,alignItems:"center"}}>
            {cart.length>0&&<button onClick={()=>go("orders")} title={`${cart.length} item${cart.length>1?"s":""} in cart`} style={{position:"relative",padding:"5px 10px",borderRadius:7,fontSize:18,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",color:C.coral,border:`1px solid ${C.coral}`,lineHeight:1}}>
              <span>🛍</span>
              <span style={{position:"absolute",top:-6,right:-6,background:C.coral,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>{cart.length}</span>
            </button>}
            <button onClick={()=>setMode(m=>m==="dark"?"light":"dark")} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>{mode==="dark"?"☀":"◑"}</button>
            <button onClick={()=>go("sessions")} style={{padding:"6px 15px",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:C.coral,color:"#fff",border:"none"}}>Book</button>
            {currentUser
              ? <button onClick={()=>go("dashboard")} style={{padding:"6px 14px",borderRadius:7,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",border:`1px solid ${C.border}`,color:C.text,fontWeight:500}}>{currentUser.name?.split(" ")[0]||"Account"}</button>
              : <button onClick={()=>setAuthOpen(true)} style={{padding:"6px 14px",borderRadius:7,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:"transparent",border:`1px solid ${C.border}`,color:C.coral,fontWeight:600}}>Sign In</button>
            }
            <button onClick={()=>setSb(true)} style={{background:"none",border:`1px solid ${C.border}`,color:C.text,borderRadius:7,padding:"5px 13px",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>☰</button>
          </div>
        </nav>
      )}
      <div style={{paddingTop:page==="invoice"?0:52}}>
        {PAGES[page]||<Home/>}
      </div>
      {page!=="invoice"&&(
        <footer className="np" style={{borderTop:`1px solid ${C.border}`,padding:"40px clamp(16px,4vw,64px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:22}}>
          <div><p style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:C.coral,marginBottom:3}}>The Value Sage™</p><p style={{color:C.muted,fontSize:12}}>Brand & AI Strategist · enquiries@thevaluesage.com</p></div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[["home","Home"],["services","Services"],["portfolio","Work"],["sessions","Book"],["orders","Orders"],["books","Books"],["school","Brand School"],["newsletter","Newsletter"],["about","About"]].map(([id,lbl])=>(
              <span key={id} onClick={()=>go(id)} style={{color:C.muted,fontSize:13,cursor:"pointer"}}>{lbl}</span>
            ))}
          </div>
          <p style={{color:C.border,fontSize:11}}>© 2025 The Value Sage™ · Obanijesu David Solomon</p>
        </footer>
      )}
    </div>
  )
}
