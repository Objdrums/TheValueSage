'use client';
// @ts-nocheck

import { useState, useEffect, useCallback } from "react"

// ── IMAGE SLOTS ───────────────────────────────────────────────────────────────
const IMGS = { hero: "/hero-photo.svg", about: null }
// Replace /hero-photo.svg with your own public asset or image URL to show your photo on the home screen.

// ── THEME ─────────────────────────────────────────────────────────────────────
const THEMES: any = {
  dark:  { bg:"#080808", bg2:"#111", card:"#161616", card2:"#1C1C1C", border:"#242424", text:"#EEECEA", muted:"#5A5A5A", lt:"#999", coral:"#FF4D2E", cdim:"#1E0A06" },
  light: { bg:"#F6F5F1", bg2:"#EDECE8", card:"#FFFFFF", card2:"#F4F3EF", border:"#DEDAD4", text:"#111", muted:"#888", lt:"#444", coral:"#D93D20", cdim:"#FDECEA" },
}

const VAT_RATE = 0.075 // 7.5% Nigerian VAT

// ── SERVICES ──────────────────────────────────────────────────────────────────
const SERVICES: any = {
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