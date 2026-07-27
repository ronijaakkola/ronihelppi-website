---
date: 2026-07-26
description: How I built an AI agent that curates a weekly magazine of human-written articles and ships it to my Kindle every Monday.
heroImage: ../images/the-home-desk-cover.jpg
heroImageAlt: A Kindle on a wooden side table, framed by houseplant leaves, showing the plain cover of The Home Desk — Issue 2, dated 2026.07.20.
tags:
  - AI agents
  - Kindle
  - automation
  - reading
  - curation
relatedPosts:
  - a-practical-guide-to-writing-your-own-obsidian-skills
---
Every Monday at 9AM, a cron job fires on my private server, and a new issue of **The Home Desk** lands on my Kindle: a weekly magazine of interesting blog posts, articles, and essays, compiled and published by my AI agent. The agent has chosen the pieces, found a theme, written a short editorial foreword, built an epub, and shipped it to my Kindle. I brew a cup of coffee, put down my phone, and start reading.

Everything in the magazine is written by a human. There are no AI summaries or other generated content. It is all curated human-created content: real blog posts, articles, and essays. **The AI acts as a curator of human writing, not as the author.**

Let's see step by step how this was made, and how you can create something similar.

[toc]

## Why a magazine, and why on a Kindle

Whenever I can, I prefer reading anything on my e-reader. The e-ink screen cannot be beaten on comfort, the device travels with me everywhere, and I feel I can focus a lot better while leaving my smart devices in my pocket.

There is one problem though: getting recent, interesting content to your Kindle can be quite annoying. And I prefer things that have low friction. Things that just work in the background without needing me to manage everything.

Physical magazines are just that. They magically appear in your mailbox weekly or monthly. You keep them on your dinner or coffee table, ready to be picked up when a suitable moment arises.

So, I needed my own magazine. Automatically sent to my Kindle every week, compiled and produced by someone else.

## Where does the content come from?

Pieces of each magazine come from two sources.

I use [Obsidian Web Clipper](https://obsidian.md/clipper) daily to capture interesting content to my Obsidian. The clips get a specific inbox tag in my vault, which I then manually remove when I actually consume the content.

The second source is the agent's own mailbox. Over the years I have subscribed to quite a few newsletters. Most of them I find myself skipping every week; they are basically junk mail in my personal mailbox. Now I subscribe to every newsletter that seems interesting using my agent's mail address instead. If a newsletter has interesting content that fits the magazine, it will eventually appear there. If its content proves uninteresting to me, my agent stops adding it to the magazine and eventually even unsubscribes from the newsletter.

## How the agent builds and ships an issue

The agent behind the magazine is [Hermes](https://hermes-agent.nousresearch.com/), an open-source autonomous agent framework developed by Nous Research. In this project it acts as the whole editorial staff: it reads the sources, picks the pieces, and remembers my feedback from previous issues. It runs on my own server and uses a local LLM (maybe more about this in a separate blog post later).

While I could get better results using cloud model providers, I do not feel comfortable feeding other authors' writing into cloud LLMs. Their texts have most likely ended up in AI training data already, but that should be each author's choice, not mine.

First, Hermes reads its source pools: my Obsidian inbox (it has access to my inbox folder via [Obsidian Headless](https://obsidian.md/help/sync/headless)) and its own mailbox (via a Google Workspace integration), where it searches for newly arrived newsletters. For newsletters, it cuts through clutter like ads and promotions and finds the links to actual posts, articles, and essays. From these sources it builds a candidate pool.

Then it starts to build the issue. It rejects duplicates from previous weeks, as well as news, promotional pieces, software recommendations, narrow tutorials, and very long posts. I prefer keeping the length of one piece relatively short, so I can always finish reading one piece in one quick sitting. Hermes currently aims for 20,000–30,000 words rather than a fixed article count, and it tries to follow my set interests: design, AI, technology, productivity, science, leadership, culture, and the arts. Finally, it chooses the order of the pieces and writes the editorial foreword.

![[hermes-issue.mp4|The Hermes agent monitors Obsidian clips and newsletters, and chooses pieces for the next issue based on a theme.|1600x900]]

**The build step itself does not use AI at all.** Hermes wrote its own `build_issue.py` script, so this step just runs code: it removes frontmatter from the pieces, converts the Markdown into XHTML, and assembles the cover, title page, foreword, and the pieces in order. It validates the result with another script it created, `validate_epub.py`.

Sending uses Amazon's "Send to Kindle for Email". The agent's address is listed as a trusted source, and a third self-written script, `send_to_kindle.py`, mails the epub as an attachment to my Kindle address. In the end, Hermes verifies that the email was sent successfully and sends me a report on Telegram.

<aside class="pull-quote" aria-hidden="true">I am the only consumer of this magazine, so I can give feedback about every issue via Telegram, and that feedback covers 100% of the user base.</aside>

## What an issue looks like

The magazine name, The Home Desk, reminds me of a physical issue actually being delivered to my office desk every week. The agent was not part of coming up with the name, but funnily enough it started calling the foreword section "From the Editor's Desk", which made me smile.

I left the visual style fully up to the agent. As a result the cover is very plain: title, issue number, and date. The cover image would not be strictly necessary, but it looks better in my Kindle library, and it lets me quickly distinguish issues from each other.

![[the-home-desk-reading.jpg|Reading a piece from an issue on the Kindle. The piece is [Every feature should earn its place](https://x.com/karrisaarinen/status/2043378194938777813) by Karri Saarinen.]]

One example of a theme it came up with was the challenges and negative sides of AI. The agent had picked five pieces around it. A couple of articles discussed what happens when building software gets cheaper and it becomes easy to say yes to features. Then there was a piece about AI being used to create a biography of a person without their consent — that one evolved into a more philosophical discussion about the value of fully AI-generated literature. A very interesting issue with a clear theme.

But I must admit this has not worked this well every week. It seems to depend on the number of articles the agent happens to get from the inbox and the newsletters. The more material it gets, the more opportunities it has to create a clear theme. Sometimes the "theme" is more all over the place, where the biggest shared factor is that all the pieces are, for example, AI-related.

## Why not just use Readwise?

Readwise Reader, Instapaper, and Pocket all have send-a-digest-to-Kindle features, so why build a whole agent with its own email address?

The main benefit of this approach is that I have full control over how issues are generated. I am the only consumer of this magazine, so I can give feedback about every issue via Telegram, and that feedback covers 100% of the user base.

Most of my feedback so far has been about length. At first I read through an issue in just a few days, and it did not last me the full week. We ended up changing from tracking the number of pieces to tracking the number of words, and now the agent slightly tunes the length for the next issue. I can also change the magazine's structure, or ask it to only include things I am currently interested in. I can even point out a specific piece from this week's issue and tell the agent that I do not want to see similar pieces ever again.

I can even make temporary requests. Let's say I know I will be sitting on a plane next week. I can just request that the editor make the next issue twice as long.

![[hermes-chat.mp4|Me sending feedback to the Hermes agent via our Telegram chat.|1600x900]]

At the same time, I have enjoyed giving Hermes a lot of creative freedom and ownership over designing and producing the magazine. It learns from my feedback automatically: Hermes maintains a skill for producing the magazine, and whenever I give feedback, it updates the skill with what it learned. Every issue is built with all of that accumulated feedback in place. I do not have to, or even want to, control every little detail. Just like with physical magazines, I like being surprised by the editor.

## Is this a filter bubble with an AI gatekeeper?

An AI decides everything I read, writes the foreword, and learns from my feedback to filter harder every week. It is a fair objection.

It is true that I have given the agent a lot of freedom in picking the pieces, and there are surely problems with that. But I think the agent is less biased towards specific content than I am. If I picked the content myself during the week, I might favor a certain kind of content depending on my mood and schedule. The agent knows nothing about either, and it receives my feedback only after the issue has shipped.

The magazine does reflect my interests, of course. The agent is told to favor the Obsidian inbox over the newsletters, and I am the one who puts things into the inbox. But that bubble existed before the magazine; the agent just reads it (potentially) more evenly than I would.

I have also quite enjoyed the idea that the agent tries to find themes that connect the pieces in each issue. If I tried to do that myself during the week, the result would not be this good. I have found that I can discover new viewpoints in pieces when they are consumed alongside similar kinds of content.

And I like that the full workflow runs even if I do not touch my computer the whole week. If there is nothing recent in my Obsidian inbox, the agent has permission to look at older inbox entries, and some content flows in from the newsletters regardless.

## Lessons from the first four issues

Technically, this was a surprisingly easy project that I had running in just one short evening. Setting up something like this with Hermes is very straightforward: just describe what you need, and it will do some research and return to you with potential solution options.

The generation worked right from the first demo; the only issue was that the agent did not know how to generate the epub cover image correctly, and even that was fixed with one request.

The harder part is the magazine itself, and that comes down to material. If you build something similar and start with an empty inbox and no newsletters waiting, your first issues may not be as good as you hope. It may take a few weeks to get up to speed — unless you use other kinds of sources and let the agent browse Hacker News or a similar site to find content for each issue. For myself, I prefer an approach where I have some influence on what it includes in the magazine.

The next issue arrives on Monday. I am looking forward to seeing what theme the editor chooses this time. And every piece in it will be written by a real human.
