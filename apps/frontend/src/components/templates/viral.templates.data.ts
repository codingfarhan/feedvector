'use client';

export type Platform = 'linkedin' | 'x';

export type Template = {
  id: string;
  platform: Platform;
  goal?: string;
  category: string;
  style?: string;
  title: string;
  template: string;
  example: string;
};

const makeId = (prefix: string, i: number) =>
  `${prefix}-${String(i).padStart(3, '0')}`;

export const X_CATEGORIES = [
  'Engagement Questions',
  'Hot Takes & Contrarian',
  'Curiosity Hooks',
  'Educational / Tips',
  'Story / Personal Lesson',
  'Authority / Credibility',
  'List / Number Tweets',
  'Warnings / Mistakes',
  'Announcements / Launches',
  'Promo / Lead Gen',
] as const;

export const X_STYLES = [
  'Hot take',
  'Question',
  'Story',
  'List',
  'Warning',
  'Curiosity',
  'Thread',
] as const;

const inferXStyle = (t: {
  category: string;
  title: string;
  template: string;
}): (typeof X_STYLES)[number] => {
  const category = t.category.toLowerCase();
  const title = t.title.toLowerCase();
  const template = t.template;

  if (category.includes('thread')) return 'Thread';
  if (category.includes('curiosity')) return 'Curiosity';
  if (category.includes('warning') || category.includes('mistake'))
    return 'Warning';
  if (category.includes('list') || category.includes('number')) return 'List';
  if (category.includes('story')) return 'Story';
  if (
    category.includes('hot take') ||
    category.includes('contrarian') ||
    title.includes('hot take')
  )
    return 'Hot take';
  if (template.includes('?') || category.includes('question')) return 'Question';

  // Reasonable fallback for statement-based templates (authority/promo/announcements)
  return 'Hot take';
};

const linkedinTemplates: Omit<Template, 'id'>[] = [
  // 1) Engagement
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Hot Take',
    template:
      'Unpopular opinion: [common belief] is overrated.\nWhat actually matters is [your belief].\nAgree or disagree?',
    example:
      'Unpopular opinion: "posting daily" is overrated.\nWhat actually matters is having 3 repeatable formats.\nAgree or disagree?',
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'This or That',
    template:
      'If you had to choose one for [goal]:\nA) [option 1]\nB) [option 2]\nI\'d pick [your answer] because [reason].',
    example:
      'If you had to choose one for better content:\nA) More ideas\nB) Better editing\nI\'d pick B because clarity wins attention.',
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Question Post',
    template:
      "What's the biggest challenge you're facing with [topic] right now?\nI'm curious what most people are struggling with.",
    example:
      "What's the biggest challenge you're facing with LinkedIn content right now?\nIs it ideas, time, or consistency?",
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Finish The Sentence',
    template:
      'Finish this sentence:\n"The fastest way to improve at [thing] is ______."',
    example:
      'Finish this sentence:\n"The fastest way to improve at writing is ______."',
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Poll-Style Text Post',
    template:
      'Which one matters more in [industry]?\n[factor 1] or [factor 2]\nWhy?',
    example:
      'Which one matters more in startups?\nSpeed or quality\nWhy?',
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Debate Starter',
    template:
      "People keep saying [trend].\nI think the opposite is true: [your take].\nHere's why: [1-line reason].",
    example:
      "People keep saying \"AI will replace writers\".\nI think the opposite is true: it will raise the bar for clarity.\nHere's why: the easy content gets automated first.",
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Ask For Advice',
    template:
      "I'm working on [project].\nIf you were in my shoes, what would you do next?",
    example:
      "I'm working on a new templates library for LinkedIn posts.\nIf you were in my shoes, what category would you add next?",
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Agree / Disagree',
    template:
      '"You don\'t need [popular tactic] to get [result]."\nAgree or disagree?',
    example:
      '"You don\'t need a huge audience to get leads."\nAgree or disagree?',
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Community Input',
    template:
      "I'm collecting the best tools for [use case].\nWhat's one tool you genuinely recommend?",
    example:
      "I'm collecting the best tools for writing faster.\nWhat's one tool you genuinely recommend?",
  },
  {
    platform: 'linkedin',
    category: 'Engagement',
    title: 'Rank These',
    template:
      'Rank these from most important to least important for [goal]:\n[item 1]\n[item 2]\n[item 3]',
    example:
      'Rank these from most important to least important for growth:\nDistribution\nProduct\nBrand',
  },

  // 2) Announcements / launches
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Simple Launch',
    template:
      'Excited to share: we just launched [product/feature].\nIt helps [target audience] do [outcome] without [pain].\nCheck it out: [CTA]',
    example:
      'Excited to share: we just launched Viral Templates.\nIt helps creators write faster without staring at a blank page.\nCheck it out: try it in the Templates tab.',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Feature Release',
    template:
      'New in [product]: [feature name]\nYou can now [what it does].\nBuilt for [who].\nWould love your feedback.',
    example:
      'New in FeedVector: Template Cards\nYou can now copy proven post structures in one click.\nBuilt for busy founders.\nWould love your feedback.',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Milestone Announcement',
    template:
      'We just hit [number] [users/customers/revenue/etc.].\nGrateful for everyone who believed in [company/product].\nNext stop: [next milestone].',
    example:
      'We just hit 10,000 scheduled posts.\nGrateful for everyone who believed in FeedVector.\nNext stop: 25,000.',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Waitlist Post',
    template:
      "We're opening early access for [product].\nIf you want [benefit], comment \"[keyword]\" and I'll send it over.",
    example:
      'We\'re opening early access for our new AI caption helper.\nIf you want to write faster, comment "AI" and I\'ll send it over.',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Version Update',
    template:
      'We shipped v[version] of [product].\nBiggest improvements:\n[improvement]\n[improvement]\n[improvement]',
    example:
      'We shipped v1.2 of FeedVector.\nBiggest improvements:\n- Faster calendar\n- Better media uploads\n- New Templates section',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Problem-Solution Launch',
    template:
      '[Audience] are tired of [pain].\nSo we built [product/feature] to help them [result].\nIt\'s live now.',
    example:
      'Founders are tired of rewriting the same post from scratch.\nSo we built Viral Templates to help them ship in minutes.\nIt\'s live now.',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Behind-The-Launch',
    template:
      'We almost didn\'t launch [thing].\n[Short obstacle] nearly killed it.\nBut we pushed through and shipped it today: [CTA]',
    example:
      'We almost didn\'t launch Templates.\nScope creep nearly killed it.\nBut we shipped it today: open the Templates tab.',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Customer-Driven Launch',
    template:
      'Our users kept asking for [feature].\nSo we built it.\n[Feature] is now live and lets you [benefit].',
    example:
      'Our users kept asking for post templates.\nSo we built it.\nTemplates are now live and let you start from proven structures.',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Soft Launch',
    template:
      'Quietly launched something new today.\n[One-line description]\nStill early, but I\'d love honest feedback.',
    example:
      'Quietly launched a Templates library today.\nCopy + remix post formats for LinkedIn.\nStill early, but I\'d love honest feedback.',
  },
  {
    platform: 'linkedin',
    category: 'Announcements',
    title: 'Open Beta',
    template:
      '[Product/feature] is now in beta.\nIf you\'re a [target user] and want to test it, drop a comment or DM me.',
    example:
      'Templates are now in beta.\nIf you\'re a creator and want to test it, drop a comment or DM me.',
  },

  // 3) Thought leadership / authority
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: "What I'm Noticing",
    template:
      'One thing I\'m noticing in [industry] right now: [trend].\nThe people who win will be the ones who [action].',
    example:
      'One thing I\'m noticing in B2B marketing right now: everyone is copying each other.\nThe people who win will be the ones who publish original opinions consistently.',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'Contrarian Insight',
    template:
      'Everyone talks about [popular topic].\nAlmost nobody talks about [ignored topic].\nThat\'s where the real leverage is.',
    example:
      'Everyone talks about "going viral".\nAlmost nobody talks about having a repeatable structure.\nThat\'s where the real leverage is.',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'Framework Post',
    template:
      'Here\'s the framework I use for [goal]:\n[step]\n[step]\n[step]\nSimple, but effective.',
    example:
      'Here\'s the framework I use for writing:\nHook\nOne clear point\nOne clear CTA\nSimple, but effective.',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'Prediction Post',
    template:
      'My prediction for [industry/topic] over the next [timeframe]:\n[prediction]\nBecause [reason 1] and [reason 2].',
    example:
      'My prediction for creator tools over the next 12 months:\nTemplates become a default feature.\nBecause attention is scarce and repetition wins.',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'What Most People Get Wrong',
    template:
      'Most people get [topic] wrong.\nThey think it\'s about [wrong belief].\nIt\'s actually about [correct belief].',
    example:
      'Most people get LinkedIn growth wrong.\nThey think it\'s about posting more.\nIt\'s actually about saying one thing clearly, repeatedly.',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'Lesson From Experience',
    template:
      'After [X years / X projects / X clients], here\'s what I\'ve learned about [topic]:\n[lesson 1]\n[lesson 2]\n[lesson 3]',
    example:
      'After 50+ product launches, here\'s what I\'ve learned about messaging:\n- Lead with the pain\n- Show the shift\n- End with one CTA',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'Trend Breakdown',
    template:
      '[Trend] is getting a lot of attention.\nHere\'s what it actually means for [specific audience]:\n[point 1]\n[point 2]\n[point 3]',
    example:
      'AI content is getting a lot of attention.\nHere\'s what it actually means for founders:\n- Average content gets cheaper\n- Clear opinions matter more\n- Distribution is a skill',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'Mental Model',
    template:
      'A useful way to think about [topic]:\n[analogy / mental model]\nIt makes decisions around [topic] much easier.',
    example:
      'A useful way to think about content: it is a product.\nYou ship versions, measure outcomes, and iterate.\nIt makes decisions around posting much easier.',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'My Rule',
    template:
      'My rule for [topic]:\nIf [condition], then [action].\nSaves a lot of wasted time.',
    example:
      'My rule for posting:\nIf I can\'t summarize the point in one sentence, I don\'t post.\nSaves a lot of wasted time.',
  },
  {
    platform: 'linkedin',
    category: 'Thought leadership',
    title: 'Sharp Observation',
    template:
      'The best [role/title] I know all do one thing well: [thing].\nNot because it sounds smart.\nBecause it compounds.',
    example:
      'The best founders I know all do one thing well: they communicate clearly.\nNot because it sounds smart.\nBecause it compounds.',
  },

  // 4) Educational / value posts
  {
    platform: 'linkedin',
    category: 'Educational',
    title: '3 Tips',
    template: '3 ways to improve your [skill/result]:\n[tip]\n[tip]\n[tip]',
    example:
      '3 ways to improve your writing:\n- Start with a strong hook\n- Use short sentences\n- End with a question',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'How-To',
    template:
      'How to [achieve result] without [pain point]:\nStep 1: [step]\nStep 2: [step]\nStep 3: [step]',
    example:
      'How to write faster without burning out:\nStep 1: Pick one structure\nStep 2: Write ugly first draft\nStep 3: Edit once, then ship',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'Mistakes To Avoid',
    template:
      '5 mistakes people make with [topic]:\n[mistake]\n[mistake]\n[mistake]\n[mistake]\n[mistake]',
    example:
      '5 mistakes people make with LinkedIn:\n- No hook\n- Too many points\n- No CTA\n- Walls of text\n- Inconsistent posting',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'Checklist',
    template:
      'Before you [action], make sure you\'ve done these 4 things:\n[item]\n[item]\n[item]\n[item]',
    example:
      'Before you hit publish, make sure you:\n- Have one clear point\n- Added spacing\n- Included a CTA\n- Removed fluff',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'Beginner Guide',
    template: 'New to [topic]? Start here:\n[first thing]\n[second thing]\n[third thing]',
    example:
      'New to LinkedIn content? Start here:\n1) Pick a niche\n2) Pick 3 formats\n3) Post 3x/week for 4 weeks',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'Tool Stack',
    template:
      'My go-to stack for [goal]:\n[tool 1] for [use]\n[tool 2] for [use]\n[tool 3] for [use]',
    example:
      'My go-to stack for content:\nNotion for drafting\nFigma for visuals\nFeedVector for scheduling',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'Swipe File Style',
    template:
      'Save this if you work on [topic].\nHere are [number] ideas/examples/prompts you can use for [goal].',
    example:
      'Save this if you write posts.\nHere are 5 prompts you can use this week:\n- Unpopular opinion about X\n- 3 mistakes in X\n- My rule for X\n- A quick checklist\n- A mini case study',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'Cheat Sheet',
    template:
      'Quick cheat sheet for [topic]:\nIf you want [result A] -> do [action]\nIf you want [result B] -> do [action]',
    example:
      'Quick cheat sheet for posting:\nIf you want reach -> write hooks\nIf you want leads -> write clear CTAs',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'Explainer',
    template:
      'A lot of people ask me what [term] actually means.\nSimple version: [plain English explanation].',
    example:
      'A lot of people ask me what "positioning" actually means.\nSimple version: what you want to be known for, in one sentence.',
  },
  {
    platform: 'linkedin',
    category: 'Educational',
    title: 'Step-By-Step Breakdown',
    template:
      "Here's exactly how I [did result]:\n[step 1]\n[step 2]\n[step 3]\n[step 4]",
    example:
      "Here's exactly how I wrote 10 posts in 60 minutes:\n1) Picked one topic\n2) Listed 10 angles\n3) Drafted fast\n4) Edited once",
  },

  // 5) Storytelling / personal brand
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'What Happened Today',
    template:
      'Something happened today that reminded me of an important lesson.\n[Short story]\nLesson: [lesson]',
    example:
      'Something happened today that reminded me of an important lesson.\nA simple sentence outperformed a clever paragraph.\nLesson: clarity beats clever.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Failure Story',
    template:
      'I messed up [thing].\nHere\'s what happened: [story]\nHere\'s what I learned: [lesson]',
    example:
      'I messed up a launch.\nWe added too many features and delayed for weeks.\nHere\'s what I learned: ship the smallest useful version.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Before / After',
    template:
      'A year ago, I was [old state].\nToday, I\'m [new state].\nThe biggest shift was [change].',
    example:
      'A year ago, I was writing posts from scratch.\nToday, I start from templates.\nThe biggest shift was building a system.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Turning Point',
    template:
      'The turning point in my [career/business/journey] was when I realized [insight].\nEverything changed after that.',
    example:
      'The turning point in my content journey was realizing structure matters more than inspiration.\nEverything changed after that.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Hard Lesson',
    template:
      'A hard lesson I learned about [topic]:\n[lesson]\nI wish I understood it earlier.',
    example:
      'A hard lesson I learned about growth:\nOne viral post beats 30 average ones.\nI wish I understood it earlier.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Small Win',
    template:
      'Small win today: [win].\nMight not look huge from the outside, but it matters because [reason].',
    example:
      'Small win today: shipped the Templates tab.\nMight not look huge, but it matters because it makes writing consistent.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Behind The Scenes Of Growth',
    template:
      'People see [outcome].\nThey don\'t see [effort, failures, tradeoffs].\nThat\'s the real story.',
    example:
      'People see "consistent posting".\nThey don\'t see drafts, rewrites, and shipping even when it feels meh.\nThat\'s the real story.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Origin Story',
    template:
      'Why I started [company/project/content journey]:\n[reason]\n[pain I saw]\n[what I wanted to build]',
    example:
      'Why I started building templates:\nI wanted people to ship faster.\nI saw founders stuck on blank pages.\nSo I built a library of proven structures.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Advice To My Younger Self',
    template:
      'If I could go back and give my younger self one piece of advice about [topic], it would be this: [advice].',
    example:
      'If I could go back and give my younger self one piece of advice about content, it would be this: pick one format and repeat it.',
  },
  {
    platform: 'linkedin',
    category: 'Storytelling',
    title: 'Unexpected Lesson',
    template:
      '[Experience] taught me more about [topic] than any course/book ever did.\nMain lesson: [lesson].',
    example:
      'Shipping daily for 10 days taught me more about writing than any book.\nMain lesson: momentum creates clarity.',
  },

  // 6) Social proof / case studies
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Client Result',
    template:
      'We helped [client type] go from [before] to [after] in [timeframe].\nWhat changed: [key lever].',
    example:
      'We helped a B2B founder go from 0 inbound to 12 leads/month in 6 weeks.\nWhat changed: consistent posts with clear CTAs.',
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Mini Case Study',
    template:
      'Case study: how [person/company] achieved [result] using [method].\nHere\'s the breakdown: [steps]',
    example:
      'Case study: how a solo founder booked 5 demos/week using LinkedIn.\nBreakdown:\n- 3 posts/week\n- 1 offer\n- 1 CTA',
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Proof With Numbers',
    template:
      'In the last [timeframe], we got:\n[metric]\n[metric]\n[metric]\nHere\'s what worked: [insight]',
    example:
      'In the last 30 days, we got:\n- 180k impressions\n- 420 new followers\n- 38 inbound DMs\nHere\'s what worked: posting one clear idea repeatedly.',
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Customer Quote',
    template:
      'One line from a customer that made my day:\n"[quote]"\nThis is exactly why we built [product/service].',
    example:
      'One line from a customer that made my day:\n"Templates finally made me consistent."\nThis is exactly why we built FeedVector Templates.',
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Before vs After',
    template:
      'Before using [product/service]: [pain]\nAfter using it: [result]\nBiggest difference: [insight]',
    example:
      'Before using templates: writing took 60 minutes.\nAfter: 10 minutes.\nBiggest difference: structure removed decision fatigue.',
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Process Post',
    template:
      'We didn\'t get [result] by luck.\nWe used a simple process:\n[step]\n[step]\n[step]',
    example:
      "We didn't get consistent posts by luck.\nWe used a simple process:\n- Pick categories\n- Use templates\n- Ship on schedule",
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Lesson From A Client/Project',
    template:
      'Working with [client/project type] taught me this: [lesson].\nMost people underestimate [thing].',
    example:
      'Working with B2B founders taught me this: distribution is a skill.\nMost people underestimate consistency.',
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Screenshot Post Caption',
    template:
      'New result from [client/project]: [result].\nBest part isn\'t the number.\nIt\'s what it means: [meaning].',
    example:
      'New result from a customer: 7 demos booked from 3 posts.\nBest part is not the number.\nIt means the message is landing.',
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Objection Handling (Case Study)',
    template:
      'People think [objection].\nBut in this case, [client/example] proved the opposite by [result].',
    example:
      'People think you need a big following.\nBut a customer proved the opposite by booking demos with <500 followers.',
  },
  {
    platform: 'linkedin',
    category: 'Social proof / case studies',
    title: 'Wins + Honesty',
    template:
      'Proud of this result: [result].\nAlso worth saying: it took [effort/time/mistakes] to get here.',
    example:
      'Proud of this result: shipped Templates in a week.\nAlso worth saying: it took multiple rewrites and cutting scope.',
  },

  // 7) Lead generation
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Who I Help',
    template:
      'I help [target audience] do [result] without [pain].\nIf that\'s relevant to you, let\'s talk.',
    example:
      'I help founders publish consistently without spending hours writing.\nIf that\'s relevant to you, let\'s talk.',
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Offer Post',
    template:
      'I\'m opening [number] spots this month for [service/product].\nIf you want help with [result], comment "[keyword]".',
    example:
      'I\'m opening 5 spots this month for LinkedIn content systems.\nIf you want help with consistent posting, comment "SYSTEM".',
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Problem Callout',
    template:
      'If you\'re struggling with [pain point], you\'re not alone.\nWe built [offer] to solve exactly that.',
    example:
      'If you\'re struggling with writing consistently, you\'re not alone.\nWe built Templates to solve exactly that.',
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Free Resource CTA',
    template:
      'I put together a free [checklist/template/guide] for [audience] who want [result].\nComment "[keyword]" and I\'ll send it.',
    example:
      'I put together a free checklist for founders who want more inbound.\nComment "CHECKLIST" and I\'ll send it.',
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Audit Offer',
    template:
      'I\'m doing [number] free audits for [type of person/business].\nI\'ll show you how to improve [area].\nInterested?',
    example:
      "I'm doing 3 free profile audits for B2B founders.\nI'll show you how to improve your positioning.\nInterested?",
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Soft Pitch',
    template:
      'Not pitching hard here, but if you need help with [problem], that\'s literally what I do.',
    example:
      'Not pitching hard here, but if you need help building a content system, that\'s literally what I do.',
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Ideal Customer Post',
    template:
      'This is for [specific audience]:\nIf you want [result] but keep hitting [problem], read this.',
    example:
      'This is for early-stage founders:\nIf you want inbound but keep hitting writer\'s block, read this.',
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Pain > Solution > CTA',
    template:
      '[Pain point] kills momentum for [audience].\nWe solve it by [solution].\nWant a demo?',
    example:
      "Writer's block kills momentum for founders.\nWe solve it with proven templates.\nWant a demo?",
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'DM Trigger',
    template:
      'I made a simple system for [result].\nIf you want the breakdown, DM me "[keyword]".',
    example:
      'I made a simple system for writing 3 posts/week.\nIf you want the breakdown, DM me "TEMPLATES".',
  },
  {
    platform: 'linkedin',
    category: 'Lead generation',
    title: 'Who This Is Not For',
    template:
      '[Offer/product/service] is not for everyone.\nIt\'s for people who want [specific result] and are serious about [thing].',
    example:
      "This content system isn't for everyone.\nIt's for people who want consistent inbound and are serious about publishing weekly.",
  },

  // 8) Hiring
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: "We're Hiring",
    template:
      "We're hiring a [role].\nIf you're great at [skill 1], [skill 2], and [skill 3], let's talk.",
    example:
      "We're hiring a product designer.\nIf you're great at UX, systems, and crisp UI, let's talk.",
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Role With Mission',
    template:
      "We're looking for a [role] to help us [mission/outcome].\nYou'll own [responsibility].",
    example:
      "We're looking for a growth marketer to help us drive inbound.\nYou'll own content and distribution.",
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Ideal Candidate',
    template:
      "The kind of person who'll thrive in this [role]:\n[trait]\n[trait]\n[trait]",
    example:
      "The kind of person who'll thrive in this role:\n- Low ego\n- High ownership\n- Fast learner",
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Why Join Us',
    template:
      'Why join [company]?\n[reason]\n[reason]\n[reason]\nWe\'re hiring: [role]',
    example:
      'Why join FeedVector?\n- Small team\n- Big ownership\n- Real impact\nWe\'re hiring: Full-stack engineer',
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Culture-Based Recruiting',
    template:
      'We care a lot about [value].\nIf that matters to you too, you might like working with us.',
    example:
      'We care a lot about craft.\nIf that matters to you too, you might like working with us.',
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Founder Recruiting Post',
    template:
      'Looking for a killer [role] to join us at [company].\nSmall team. Big ownership. Real impact.',
    example:
      'Looking for a killer founding engineer to join us at FeedVector.\nSmall team. Big ownership. Real impact.',
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Referral Ask',
    template:
      'Know someone great at [role/skill]?\nSend them this post or tag them below.',
    example:
      'Know someone great at product design?\nSend them this post or tag them below.',
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Skill > Buzzwords',
    template:
      'We need someone who can [specific outcome], not just someone who lists [buzzword] on a resume.\nHiring for [role].',
    example:
      'We need someone who can ship clean UX, not just someone who lists "design thinking" on a resume.\nHiring for Product Designer.',
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Behind The Job Post',
    template:
      'This role matters because [business reason].\nThe person we hire will directly help us [goal].',
    example:
      'This role matters because onboarding drives retention.\nThe person we hire will directly help us reduce churn.',
  },
  {
    platform: 'linkedin',
    category: 'Hiring',
    title: 'Talent Magnet',
    template:
      "We're building [what].\nIf you love [space/problem], I'd love to connect.",
    example:
      "We're building tools for creators.\nIf you love content systems, I'd love to connect.",
  },

  // 9) Behind the scenes / culture
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: "What We're Working On",
    template:
      'Behind the scenes, our team is working on [project].\nMain focus right now: [priority].',
    example:
      'Behind the scenes, our team is working on better templates.\nMain focus right now: category coverage.',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: 'Team Appreciation',
    template:
      'Shoutout to [person/team] for [specific contribution].\nThis wouldn\'t have happened without them.',
    example:
      'Shoutout to the team for shipping Templates quickly.\nThis wouldn\'t have happened without them.',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: 'Day In The Life',
    template:
      'A typical day working on [role/project] looks like:\n[task]\n[task]\n[task]',
    example:
      'A typical day building a product looks like:\n- Talk to users\n- Ship a small improvement\n- Review metrics',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: 'Build In Public',
    template:
      'Building [product/project] in public.\nThis week we:\n[update]\n[update]\n[update]',
    example:
      'Building Templates in public.\nThis week we:\n- Added categories\n- Added copy button\n- Improved cards',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: 'What We Changed',
    template:
      'We changed [process/system] and it improved [result].\nSmall change, big impact.',
    example:
      'We changed our release process and it improved velocity.\nSmall change, big impact.',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: 'Lesson From The Team',
    template:
      'One thing our team learned this week: [lesson].\nWorth sharing in case it helps someone else.',
    example:
      'One thing our team learned this week: cut scope early.\nWorth sharing in case it helps someone else.',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: 'Decision-Making Post',
    template:
      'We debated [decision].\nIn the end, we chose [option] because [reason].',
    example:
      'We debated "more templates vs better templates".\nWe chose better templates because quality compounds.',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: "What People Don't See",
    template:
      'People see [public outcome].\nThey don\'t see the behind-the-scenes work: [list].',
    example:
      'People see the release.\nThey don\'t see the behind-the-scenes work: bugs, QA, and edge cases.',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: 'Ritual / Process',
    template:
      'One process we use internally that helps a lot: [process].\nIt keeps us from [problem].',
    example:
      'One process we use internally: weekly retro.\nIt keeps us from repeating the same mistakes.',
  },
  {
    platform: 'linkedin',
    category: 'Behind the scenes / culture',
    title: 'Team Values',
    template:
      'At [company], we care deeply about [value].\nHere\'s what that looks like in practice: [example].',
    example:
      'At FeedVector, we care deeply about clarity.\nIn practice: fewer features, better defaults.',
  },

  // 10) Opinion / contrarian
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'Strong Opinion',
    template:
      'You do not need [popular thing] to succeed at [goal].\nYou need [less glamorous thing].',
    example:
      'You do not need a huge audience to get leads.\nYou need consistent, clear posts.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'Myth Busting',
    template: 'Biggest myth in [industry]: [myth].\nReality: [truth].',
    example:
      'Biggest myth in content: you need new ideas daily.\nReality: you need better angles.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'Callout Post',
    template:
      'Too many people are doing [bad practice].\nIt leads to [bad result].\nBetter move: [alternative].',
    example:
      'Too many people are writing generic advice.\nIt leads to no action.\nBetter move: share one specific story + lesson.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'Stop Doing This',
    template:
      'Stop doing [common mistake] if you want [result].\nStart doing [better action] instead.',
    example:
      'Stop doing vague posts if you want inbound.\nStart doing clear offers with one CTA instead.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'What Nobody Tells You',
    template:
      'Nobody tells you this about [topic]: [truth].\nIt\'s not sexy, but it matters.',
    example:
      'Nobody tells you this about LinkedIn: formatting matters.\nIt\'s not sexy, but it matters.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'X Is Not Dead',
    template: '[Channel/tactic/industry] is not dead.\nBad execution is.',
    example: 'Email is not dead.\nBad execution is.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'Short Punchy Post',
    template: '[Desired result]?\nLess [thing].\nMore [thing].\nThat\'s it.',
    example: 'More leads?\nLess posting.\nMore clarity.\nThat\'s it.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'Brutal Truth',
    template: 'Brutal truth: [truth].\nMost people avoid it because [reason].',
    example:
      'Brutal truth: average content gets ignored.\nMost people avoid improving because it takes effort.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: "If You're Serious About X",
    template:
      'If you\'re serious about [goal], stop obsessing over [surface-level thing].\nFocus on [real lever].',
    example:
      'If you\'re serious about growth, stop obsessing over hacks.\nFocus on distribution.',
  },
  {
    platform: 'linkedin',
    category: 'Opinion / contrarian',
    title: 'Provocative Closer',
    template:
      'The people winning at [thing] are not smarter.\nThey\'re just more consistent with [action].',
    example:
      "The people winning at content aren't smarter.\nThey're just more consistent with shipping.",
  },
];

const xTweetTemplates = [
  {
    platform: 'x',
    goal: 'engagement',
    category: 'Engagement Questions',
    title: 'Hot Take Question',
    template: 'Hot take: [opinion].\n\nAgree or disagree?',
    example:
      'Hot take: consistency matters more than creativity on X.\n\nAgree or disagree?',
  },
  {
    platform: 'x',
    goal: 'engagement',
    category: 'Engagement Questions',
    title: 'Fill In The Blank',
    template:
      'Fill in the blank:\n\nThe fastest way to improve at [topic] is _____.',
    example:
      'Fill in the blank:\n\nThe fastest way to improve at writing hooks is _____.',
  },
  {
    platform: 'x',
    goal: 'engagement',
    category: 'Engagement Questions',
    title: 'Pick One',
    template: 'Pick one for [goal]:\n\nA) [option 1]\nB) [option 2]\n\nWhy?',
    example:
      'Pick one for growing on X:\n\nA) Better hooks\nB) Better consistency\n\nWhy?',
  },
  {
    platform: 'x',
    goal: 'engagement',
    category: 'Engagement Questions',
    title: 'Best Advice',
    template: 'What’s the best advice you’ve heard about [topic]?',
    example: 'What’s the best advice you’ve heard about building an audience?',
  },
  {
    platform: 'x',
    goal: 'engagement',
    category: 'Engagement Questions',
    title: 'Biggest Mistake',
    template: 'What’s one mistake beginners make in [topic]?',
    example: 'What’s one mistake beginners make in content marketing?',
  },
  {
    platform: 'x',
    goal: 'engagement',
    category: 'Engagement Questions',
    title: 'Unpopular Opinion Prompt',
    template: 'What’s your unpopular opinion about [industry/topic]?',
    example: 'What’s your unpopular opinion about social media growth?',
  },

  {
    platform: 'x',
    goal: 'authority',
    category: 'Hot Takes & Contrarian',
    title: 'Hot Take Statement',
    template:
      'Hot take: [popular thing] is overrated.\n\n[alternative] matters more.',
    example: 'Hot take: posting more is overrated.\n\nBetter positioning matters more.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Hot Takes & Contrarian',
    title: 'Unpopular Opinion',
    template:
      'Unpopular opinion:\n\n[common advice] is not the best way to [result].',
    example: 'Unpopular opinion:\n\nPosting every day is not the best way to grow on X.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Hot Takes & Contrarian',
    title: 'Stop Doing This',
    template:
      'If you want [result], stop doing [bad tactic].\n\nStart doing [better tactic] instead.',
    example:
      'If you want more engagement, stop copying big creators.\n\nStart sharpening your first line instead.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Hot Takes & Contrarian',
    title: 'Everyone Says',
    template:
      'Everyone says [common belief].\n\nI think the opposite is true:\n[contrarian belief].',
    example:
      'Everyone says you need more content.\n\nI think the opposite is true:\nyou need fewer, sharper posts.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Hot Takes & Contrarian',
    title: 'Myth Bust',
    template: 'Biggest myth in [topic]: [myth].\n\nReality: [truth].',
    example:
      'Biggest myth in personal branding: more followers = more business.\n\nReality: better positioning wins.',
  },

  {
    platform: 'x',
    goal: 'growth',
    category: 'Curiosity Hooks',
    title: 'Nobody Talks About This',
    template:
      'The craziest thing about [topic] is nobody talks about [hidden truth].',
    example:
      'The craziest thing about X growth is nobody talks about profile positioning.',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Curiosity Hooks',
    title: 'Most People Think',
    template:
      'Most people think [common belief].\n\nThe truth is [unexpected truth].',
    example:
      'Most people think content quality is everything.\n\nThe truth is distribution matters just as much.',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Curiosity Hooks',
    title: 'One Missing Detail',
    template:
      'You’re probably missing this one detail in [topic]: [detail teaser].',
    example:
      'You’re probably missing this one detail in writing better tweets: the second line.',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Curiosity Hooks',
    title: 'Real Reason',
    template: 'I found the real reason [thing] isn’t working:\n\n[teaser]',
    example:
      'I found the real reason your posts aren’t getting replies:\n\nyou’re not giving people anything easy to react to.',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Curiosity Hooks',
    title: 'Nobody Prepares You',
    template: 'Nobody prepares you for this part of [process]: [teaser].',
    example:
      'Nobody prepares you for this part of audience building: repeating yourself for months.',
  },

  {
    platform: 'x',
    goal: 'authority',
    category: 'Educational / Tips',
    title: 'Three Tips',
    template:
      '3 ways to improve your [result]:\n\n1. [tip]\n2. [tip]\n3. [tip]',
    example:
      '3 ways to improve your hooks:\n\n1. Be more specific\n2. Use contrast\n3. Cut fluff',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Educational / Tips',
    title: 'How To',
    template:
      'How to [achieve result] without [pain point]:\n\n1. [step]\n2. [step]\n3. [step]',
    example:
      'How to get more profile clicks without posting more:\n\n1. Sharpen your bio\n2. Improve hooks\n3. Use stronger CTAs',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Educational / Tips',
    title: 'Checklist',
    template:
      'Before you [action], make sure you do these 3 things:\n\n- [item]\n- [item]\n- [item]',
    example:
      'Before you publish a tweet, make sure you do these 3 things:\n\n- Improve the first line\n- Cut weak words\n- Add a clear angle',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Educational / Tips',
    title: 'Beginner Guide',
    template:
      'New to [topic]?\n\nStart here:\n1. [step]\n2. [step]\n3. [step]',
    example:
      'New to building on X?\n\nStart here:\n1. Pick a niche\n2. Write daily\n3. Study top creators',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Educational / Tips',
    title: 'Tool Stack',
    template:
      'My go-to stack for [goal]:\n\n- [tool 1] for [use]\n- [tool 2] for [use]\n- [tool 3] for [use]',
    example:
      'My go-to stack for content:\n\n- FeedVector for scheduling\n- Notion for ideas\n- Canva for visuals',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Educational / Tips',
    title: 'Cheat Sheet',
    template:
      'Quick cheat sheet for [topic]:\n\nIf you want [result A] → [action]\nIf you want [result B] → [action]',
    example:
      'Quick cheat sheet for X:\n\nIf you want replies → ask better questions\nIf you want reposts → make the idea sharper',
  },

  {
    platform: 'x',
    goal: 'authority',
    category: 'Story / Personal Lesson',
    title: 'Hard Lesson',
    template: 'A hard lesson I learned about [topic]:\n\n[lesson].',
    example:
      'A hard lesson I learned about content:\n\nGood ideas still flop if the hook is weak.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Story / Personal Lesson',
    title: 'Before And After',
    template:
      'A year ago I was [old state].\n\nToday I’m [new state].\n\nBiggest shift: [change].',
    example:
      'A year ago I was overthinking every post.\n\nToday I publish way faster.\n\nBiggest shift: I stopped chasing perfection.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Story / Personal Lesson',
    title: 'Turning Point',
    template:
      'The turning point in my [journey] was when I realized [insight].',
    example:
      'The turning point in my content journey was when I realized distribution matters as much as writing.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Story / Personal Lesson',
    title: 'Small Win',
    template: 'Small win:\n\n[win].\n\nIt matters because [reason].',
    example:
      'Small win:\n\nA post brought in 3 demos.\n\nIt matters because the account is still small.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Story / Personal Lesson',
    title: 'What I Would Tell Myself',
    template:
      'If I could give my younger self one piece of advice about [topic], it would be this:\n\n[advice].',
    example:
      'If I could give my younger self one piece of advice about building online, it would be this:\n\nSay the same useful thing more times.',
  },

  {
    platform: 'x',
    goal: 'authority',
    category: 'Authority / Credibility',
    title: 'Years Of Experience',
    template:
      'After [X years / X projects] in [topic], here’s what actually matters:\n\n[insight].',
    example:
      'After 3 years building products, here’s what actually matters:\n\nTalking to users more than you think.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Authority / Credibility',
    title: 'Tested Versions',
    template:
      'I tested [number] versions of [thing].\n\nHere’s what won:\n\n[winner].',
    example:
      'I tested 12 hooks for the same idea.\n\nHere’s what won:\n\nThe most specific one.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Authority / Credibility',
    title: 'Shortcut',
    template:
      'I spent way too long figuring this out, so here’s the shortcut:\n\n[shortcut].',
    example:
      'I spent way too long figuring this out, so here’s the shortcut:\n\nWrite the hook first, not the whole post.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Authority / Credibility',
    title: 'What Actually Moved The Needle',
    template: 'Here’s what actually moved the needle for me in [topic]:\n\n[thing].',
    example:
      'Here’s what actually moved the needle for me in growth:\n\nBetter positioning, not more posting.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'Authority / Credibility',
    title: 'Used To Believe',
    template: 'I used to believe [wrong belief].\n\nExperience proved me wrong.',
    example:
      'I used to believe you need to be on every platform.\n\nExperience proved me wrong.',
  },

  {
    platform: 'x',
    goal: 'engagement',
    category: 'List / Number Tweets',
    title: 'Mistakes List',
    template:
      '[number] mistakes killing your [result]:\n\n1. [mistake]\n2. [mistake]\n3. [mistake]',
    example:
      '3 mistakes killing your tweet performance:\n\n1. Weak hooks\n2. No clear angle\n3. Forgettable CTAs',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'List / Number Tweets',
    title: 'Things I Wish I Knew',
    template: '[number] things I wish I knew before [action].',
    example: '5 things I wish I knew before building an audience.',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'List / Number Tweets',
    title: 'Rules I Follow',
    template:
      'The [number] rules I follow for [goal]:\n\n1. [rule]\n2. [rule]\n3. [rule]',
    example:
      'The 4 rules I follow for writing better content:\n\n1. Be specific\n2. Cut fluff\n3. Lead with tension\n4. Make it skimmable',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'List / Number Tweets',
    title: 'Underrated Hacks',
    template:
      '[number] underrated hacks for [goal]:\n\n- [hack]\n- [hack]\n- [hack]',
    example:
      '3 underrated hacks for better engagement:\n\n- Rewrite the first line twice\n- Use contrast\n- End with one clean question',
  },
  {
    platform: 'x',
    goal: 'authority',
    category: 'List / Number Tweets',
    title: 'Nobody Tells You',
    template: '[number] things nobody tells you about [topic].',
    example: '4 things nobody tells you about building in public.',
  },

  {
    platform: 'x',
    goal: 'growth',
    category: 'Warnings / Mistakes',
    title: 'This Mistake Is Costing You',
    template:
      'This one mistake is costing you [money/time/reach]:\n\n[mistake].',
    example:
      'This one mistake is costing you reach:\n\nburying the hook in the second sentence.',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Warnings / Mistakes',
    title: 'Fix It Now',
    template:
      'If you’re doing [bad habit], fix it now.\n\nIt’s hurting your [result].',
    example:
      'If you’re overexplaining every tweet, fix it now.\n\nIt’s hurting your retention.',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Warnings / Mistakes',
    title: 'Quietly Ruining Results',
    template: 'This is quietly ruining your [goal]:\n\n[problem].',
    example:
      'This is quietly ruining your growth:\n\ntrying to sound smart instead of clear.',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Warnings / Mistakes',
    title: 'Too Late',
    template: 'Most people don’t notice this until it’s too late:\n\n[problem].',
    example:
      'Most people don’t notice this until it’s too late:\n\ntheir profile doesn’t explain who they help.',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Warnings / Mistakes',
    title: 'Ignore This',
    template: 'Ignore this and your [result] will stall:\n\n[warning].',
    example:
      'Ignore this and your engagement will stall:\n\npeople need a reason to respond fast.',
  },

  {
    platform: 'x',
    goal: 'announcement',
    category: 'Announcements / Launches',
    title: 'Simple Launch',
    template:
      'Just launched [thing].\n\nIt helps [audience] do [result] without [pain].',
    example:
      'Just launched a new content calendar feature.\n\nIt helps teams schedule faster without the usual mess.',
  },
  {
    platform: 'x',
    goal: 'announcement',
    category: 'Announcements / Launches',
    title: 'Feature Release',
    template: 'New in [product]: [feature].\n\nYou can now [benefit].',
    example:
      'New in FeedVector: X post templates.\n\nYou can now pick a format and publish faster.',
  },
  {
    platform: 'x',
    goal: 'announcement',
    category: 'Announcements / Launches',
    title: 'Milestone',
    template:
      'We just hit [milestone].\n\nGrateful.\n\nNext goal: [next milestone].',
    example: 'We just hit 1,000 scheduled posts.\n\nGrateful.\n\nNext goal: 10,000.',
  },
  {
    platform: 'x',
    goal: 'announcement',
    category: 'Announcements / Launches',
    title: 'Soft Launch',
    template:
      'Quietly launched something new today:\n\n[thing].\n\nWould love your feedback.',
    example:
      'Quietly launched something new today:\n\nan X hook library inside FeedVector.\n\nWould love your feedback.',
  },
  {
    platform: 'x',
    goal: 'announcement',
    category: 'Announcements / Launches',
    title: 'Built Because Users Asked',
    template:
      'People kept asking for [feature].\n\nSo we built it.\n\nNow you can [benefit].',
    example:
      'People kept asking for X templates.\n\nSo we built it.\n\nNow you can generate faster with better hooks.',
  },

  {
    platform: 'x',
    goal: 'sales',
    category: 'Promo / Lead Gen',
    title: 'Who I Help',
    template: 'I help [audience] do [result] without [pain point].',
    example:
      'I help founders create and schedule better social content without wasting hours every week.',
  },
  {
    platform: 'x',
    goal: 'sales',
    category: 'Promo / Lead Gen',
    title: 'Offer Post',
    template:
      'I’m opening [number] spots for [offer].\n\nIf you want help with [result], reply “[keyword]”.',
    example:
      'I’m opening 5 spots for content strategy audits.\n\nIf you want help with growth, reply “audit”.',
  },
  {
    platform: 'x',
    goal: 'sales',
    category: 'Promo / Lead Gen',
    title: 'Free Resource',
    template:
      'I made a free [resource] for [audience] who want [result].\n\nReply “[keyword]” and I’ll send it.',
    example:
      'I made a free hook pack for creators who want better engagement.\n\nReply “hooks” and I’ll send it.',
  },
  {
    platform: 'x',
    goal: 'sales',
    category: 'Promo / Lead Gen',
    title: 'Soft Pitch',
    template:
      'Not pitching hard here.\n\nBut if you need help with [problem], that’s what I do.',
    example:
      'Not pitching hard here.\n\nBut if you need help planning and scheduling content, that’s what I do.',
  },
  {
    platform: 'x',
    goal: 'sales',
    category: 'Promo / Lead Gen',
    title: 'This Is For',
    template:
      'This is for [specific audience]:\n\nIf you want [result] but keep hitting [problem], read this.',
    example:
      'This is for founders:\n\nIf you want to post consistently but keep running out of ideas, read this.',
  },

  {
    platform: 'x',
    goal: 'growth',
    category: 'Thread Starter',
    title: 'Thread Intro',
    template: '[number] lessons from [experience].\n\nA thread:',
    example: '7 lessons from building a product in public.\n\nA thread:',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Thread Starter',
    title: 'How I Did It Thread',
    template: 'How I [achieved result] in [timeframe].\n\nA thread:',
    example: 'How I grew from 0 to 1,000 followers in 60 days.\n\nA thread:',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Thread Starter',
    title: 'Mistakes Thread',
    template: '[number] mistakes I made while [doing thing].\n\nA thread:',
    example: '5 mistakes I made while building my SaaS.\n\nA thread:',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Thread Starter',
    title: 'Guide Thread',
    template: 'The beginner’s guide to [topic].\n\nA thread:',
    example: 'The beginner’s guide to writing better hooks.\n\nA thread:',
  },
  {
    platform: 'x',
    goal: 'growth',
    category: 'Thread Starter',
    title: 'Step By Step Thread',
    template: 'Step-by-step: how to [result].\n\nA thread:',
    example:
      'Step-by-step: how to create a month of content in one sitting.\n\nA thread:',
  },
] as const;

export const templates: Template[] = [
  ...linkedinTemplates.map((t, i) => ({ ...t, id: makeId('li', i + 1) })),
  ...xTweetTemplates.map((t, i) => ({
    id: makeId('x', i + 1),
    platform: 'x' as const,
    goal: t.goal,
    category: t.category,
    style: inferXStyle(t),
    title: t.title,
    template: t.template,
    example: t.example,
  })),
];

export const categoriesByPlatform: Record<Platform, string[]> = {
  linkedin: [
    'All',
    'Engagement',
    'Announcements',
    'Thought leadership',
    'Educational',
    'Storytelling',
    'Social proof / case studies',
    'Lead generation',
    'Hiring',
    'Behind the scenes / culture',
    'Opinion / contrarian',
  ],
  x: ['All', ...X_CATEGORIES],
};

