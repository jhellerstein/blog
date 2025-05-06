---
title: "Looking Back to Look Ahead"
date: 2025-04-30
categories: intro
image: /images/looking-back.png
---
<!-- <img src="{{ site.baseurl }}/assets/images/looking-back.png" alt="Looking back to look ahead"
     style="float: right; margin: 0 0 1em 1em; width: 250px; max-width: 40%;" /> -->

This is the second of two background posts reflecting on my technical interests, to set some context for this blog.
While there's no breaking news here, I hope that outlining my long-term threads of work might spark interest or recognition. If something resonates, I’d love to hear what caught your eye.

## Looking back on research to date

Thanks largely to collaborations, I've worked on a lot of different projects over the years. At times, I’ve felt a bit *too* scattered. Still, looking back, I see a through-line of long-term interests that have anchored my work and kept me engaged. These include formal programming models for distributed systems, the role of semantics in coordination, and the intersection of human insight and automated tools—threads that continue to shape my work today.

### Formal languages for distributed programming

One of the signatures of the database field is its bold embrace of high-level declarative languages, and the multi-decade challenge of translating from there down to efficient execution. I'm glad to be part of a scientific culture that is willing to be patient and dig deep! One of the themes I've pursued over time has been to take the lessons of declarative query languages and try to adapt them to other domains. I've been at this for over two decades, and I think we're now ready to deliver some big practical payoffs outside the research world.

This theme began with a run of work on [Declarative Networking](https://dl.acm.org/doi/10.1145/1592761.1592785) in the oughts. We started pursuing a broader focus on general-purpose distributed computing in the 2010's. Along the way I also worked on SQL-based machine learning in the [MADlib](https://dl.acm.org/doi/10.14778/1687553.1687576) project, which exercised some of the same challenges.

Our early efforts in language design were ad-hoc extensions of datalog to networking, including [NDlog](https://dl.acm.org/doi/10.1145/1142473.1142485) for routing, and [Overlog](https://dl.acm.org/doi/10.1145/1095810.1095818) for overlay networks. As my ambitions expanded to designing a general-purpose distributed programming, my PhD students (an awesome trio of [Peter Alvaro](https://people.ucsc.edu/~palvaro/), [Tyson Condie](https://dl.acm.org/profile/81314493838) and [Neil Conway](https://www.neilconway.org/)) forced a pause. "Why," they asked, "would we design a new language before we try building things in the previous language?" So, a bit painfully, they built a new Overlog runtime in Java, and reimplemented large chunks of Hadoop with it in a project we called [BOOM Analytics](https://dl.acm.org/doi/10.1145/1755913.1755937). Tyson also built an Overlog optimizer in Overlog called [Evita Raced](https://dl.acm.org/doi/10.14778/1453856.1453978).

Based on those experiences, we finally nailed our formal semantics with the [Dedalus](https://dl.acm.org/doi/10.1007/978-3-642-24206-9_16) language, which made time and space first class logical citizens, and allowed for the development of a formal model theoretic semantics. Dedalus was still a variant of datalog, which made it nice and clean for formal reasoning, but awkward for developers—its syntax was unfamiliar, the tooling was minimal, and the programming model felt restrictive for common tasks.

### Practical languages for distributed programming: Bloom and Hydro

Our first *practical* distributed programming language was [Bloom](https://bloom-lang.net), which stepped away from logic programming to embrace functional syntax and algebraic dataflow. Bloom was the first of our languages that was actually pretty fun to program in (though I was one of the few who actually had that experience!) Just as the Bloom PhD students were graduating and moving on to new challenges, I got distracted by adventures in startup land working on visualization, AI and program synthesis for data wrangling (see below). That put this agenda on the back burner for almost 10 years.

Over the past 5 years or so, a team of us has returned to attack high-level distributed programming with vigor—buoyed by renewed community interest in correctness, safety, and expressiveness, and a broader ecosystem shift toward systems languages like Rust. Our [Hydro](https://hydro.run) project is a serious effort to deliver on the agenda of general-purpose distributed programming, with new depth and relevance in the Rust ecosystem. This is both a passion project for me, and a serious software package targeted at real developers. I'm sure I'll be blogging a lot about Hydro and related topics here over time, so I'll end the discussion here with that.

### CALM, distributed computing and coordination avoidance

I got started on high-level language design for the opportunity to demonstrate optimization opportunities. But it turned out that many of the ideas and lessons that arose were more about semantics than performance.

Just as [language shapes how we think about the world](https://en.wikipedia.org/wiki/Linguistic_relativity), programming languages shape how we think about computing. So maybe it's no surprise that designing new programming languages helped my group see things differently and ask new questions.

In my early days working on distributed computing, I got restless with that community's interests in optimizing protocols for tasks like consensus and fault tolerance. As an outsider, I was struck by how much complexity the distributed systems community was willing to embrace for relatively modest performance gains. My background in databases had trained me to seek orders-of-magnitude improvements, so I found myself wondering whether all that protocol engineering was truly essential. Rather than diving into consensus and coordination, I leaned toward avoiding them altogether. How far could I get without them?

That turned out to be a deep question, one that for some reason nobody had asked or answered in the literature. Our experience in Dedalus with "fixing" the bugs in ND/Overlog gave me a big hint: our use cases didn't need distributed systems coordination *if they were monotone*! (Roughly speaking, monotonicity means that once something becomes true, it stays true—an idea that’s easy to recognize in datalog languages but nearly invisible in imperative ones. That's the benefit of seeing differently!). The more I thought about it, this felt like a deeper insight, a case of *if and only if*. This grew into the [CALM Conjecture](https://dl.acm.org/doi/10.1145/1860702.1860704) which I presented in a keynote at PODS 2010, and which was first proven as the [CALM theorem](https://dl.acm.org/doi/10.1145/3369736) in 2011.

Even outside the CALM formalisms, monotonic thinking has informed a lot of systems work in my group—from the super-fast [Anna](https://dl.acm.org/doi/abs/10.1109/TKDE.2019.2898401) [autoscaling](https://www.vldb.org/pvldb/vol12/p624-wu.pdf) key-value store, to the [Cloudburst](https://dl.acm.org/doi/10.14778/3407790.3407836) stateful serverless platform, to the work [Peter Bailis](http://www.bailis.org/) led on [coordination avoidance for database transactions](https://dl.acm.org/doi/10.14778/2735508.2735509).

Perhaps most surprising was what [Michael Whittaker](https://mwhittaker.github.io/) showed in his PhD work with me: that coordination avoidance techniques could be leveraged to *scale coordination protocols themselves*. That twist led us to [Compartmentalized Paxos](http://www.vldb.org/pvldb/vol14/p2203-whittaker.pdf), and later to a set of [compiler optimizations in Hydro](https://dl.acm.org/doi/10.1145/3639257) that bring these ideas full circle.

And yes, that last bit shows that in the end I didn't avoid coordination research after all. But the will to procrastinate led to interesting exploration and invention along the way. I've had this lesson on my web page since the 1990s:

> "Laziness in doing stupid things can be a great virtue" -- James Hilton, *Lost Horizon*

My corollary might be this: procrastinating known smart things can also be a virtue!

### Human/AI collaborations in Data Wrangling

Early in my career, I got excited about building intuitive, interactive systems that let people explore data fluidly—a kind of game-like experience for analysis. (Yes, I too got interested in computer science via video games.) This theme started with my work on [Online Aggregation](https://dl.acm.org/doi/abs/10.1145/253260.253291), and continued with a range of efforts in interactive data manipulation.

Inspired by a suggestion from the great [Mike Carey](https://en.wikipedia.org/wiki/Michael_J._Carey_(computer_scientist)) during a seminar at Berkeley, [Vijayshankar Raman](https://www.linkedin.com/in/vijayshankar-raman-95363a/) and I began exploring interactive visual interfaces for data cleaning in the [Potter's Wheel](https://dl.acm.org/doi/10.5555/645927.672045) project. This work was motivated by a recurring theme I saw in both academia and failed startup ventures like Cohera and Swivel: people get stuck on mundane but necessary data transformation tasks. This was especially frustrating for quantitative professionals without programming backgrounds—an audience that computer science had largely underserved at the time.

After many years—and after significant progress in the field of data visualization—I had the opportunity to collaborate for the first time with the amazing [Jeff Heer](https://en.wikipedia.org/wiki/Jeffrey_Heer), who was then a rising star. The timing was serendipitous: enough had changed in the field that it felt like the right moment to return to the Potter's Wheel vision with new tools and energy. We were both excited to pick up where that work had left off. We recruited [Sean Kandel](https://www.linkedin.com/in/seankandel/) away from high frequency trading to enroll in the graduate program with Jeff at Stanford, and he built [Wrangler](https://dl.acm.org/doi/10.1145/1978942.1979444) and [Profiler](https://dl.acm.org/doi/10.1145/2254556.2254659) as vehicles for new ideas in this space, which included an embrace of AI assistance. Sean also kicked us into entrepreneurial mode, and we founded [Trifacta](https://en.wikipedia.org/wiki/Trifacta) to commercialize the work. This turned into a 10-year startup journey—one that brought new collaborators, new skills, and a crash course in navigating industry shifts. We rode the Big Data wave in and out, and eventually found ourselves in the SaaS era, helped along by Google white-labeling Trifacta as *Google Cloud Dataprep*. That move pushed us further into the future than we might have gone on our own.

Trifacta was very early in exploring questions that are now *au courant* in the LLM era: how do we design environments for humans to collaborate with AI on code and data? Our models and inference quality at the time were far more primitive, relying on heuristics and simple statistical techniques. But many of the UX ideas we explored remain strikingly relevant: empowering users to visually detect data quality issues, interact directly with data visualizations and grids, receive AI suggestions as both code and visual feedback, and iterate rapidly. What has changed is the sharpness of inference; what hasn't changed is the need to guide and constrain it. Whether the AI is 90% right or 75% right, it still needs to be scaffolded for humans to quickly evaluate and steer the process. These experiences continue to shape how I think about designing AI-powered developer tools—especially when it comes to interaction models, scaffolding, and trust. I wrote about our broad ideas in this space in the paper on [Predictive Interaction](https://idl.cs.washington.edu/files/2015-PredictiveInteraction-CIDR.pdf) and the Guide/Decide loop we were exploring in Trifacta. More recently, Berkeley's [EPIC Data Lab](https://epic.berkeley.edu) was conceived in part based on this experience, and my colleagues there continue to push in many related directions regarding low-code data management.

If you squint, this is another attack on high-level programming models—in this case "low code" approaches for non-programmers. In that lens, Trifacta was a low-code environment for doing AI-assisted program synthesis of data wrangling scripts. I fully expect that lessons from Wrangler, Trifacta, and Predictive Interaction will influence how we approach LLM-based assistance in Hydro, though Hydro is targeting more technical software engineers and is therefore less data-centric. I bet I'll have more to say on that front in the coming years.

### ... and so much more

It's hard to omit so many other topics that I've worked with folks on over the years—especially because many of them were the work of amazing students and colleagues who I haven't had a chance to shout out to! I keep a [list of my PhD students](https://dsf.berkeley.edu/jmh/student.html) online. For the research topics, I'll add an appendix of sorts to the bottom of this post.

## Moving Forward

As I look ahead, I expect to dig even deeper into the Hydro agenda. On the pragmatic front, the codebase is maturing and ready to be tested in the wild—so it's time to find bold, high-impact use cases that will stretch our ideas and tools. On the research side, we're just beginning to scratch the surface of what's possible. One especially exciting direction is exploring how we can deliver a fundamentally new programming model for distributed systems in the era of AI-assisted development.

You can expect more posts here about those core Hydro themes, as well as the tangents and side quests that keep things interesting—both the breakthroughs and the frustrations. As Hydro transitions off campus, I may find myself with even more reason to document the journey. Either way, there’s a lot to say—and I’m looking forward to sharing it.

Thanks for reading. Onward!

## Topics for Another Day

It’s hard to write a recap like this without feeling the limits of the form. Nearly everything I’ve worked on has been deeply collaborative, and there are far more colleagues and students I admire than I’ve had space to name here. The topics and shoutouts above are a sampling, not a ranking—and many important threads didn’t make the main cut simply for reasons of narrative flow or space.

In that spirit, here are a few more topics I’ve worked on that continue to inform how I think about computing today:

- The **[Generalized Search Tree (GiST)](https://gist.cs.berkeley.edu/)** remains a core extensible indexing framework in PostgreSQL and powers spatial extensions like PostGIS. This work also led me into [Indexability Theory](https://dl.acm.org/doi/abs/10.1145/505241.505244) with my longtime mentor [Christos Papadimitriou](https://en.wikipedia.org/wiki/Christos_Papadimitriou).
- **Adaptive query processing of data streams**: Our work on [Eddies](https://dl.acm.org/doi/10.1145/335191.335420), [FLuX](https://dl.acm.org/doi/10.5555/894174), and the [TelegraphCQ](https://telegraph.cs.berkeley.edu/) project helped shape my thinking on stream-centric computing, a topic that is becoming increasingly relevant to general-purpose programming. The Telegraph team members went on to have broad impact across the database industry.
- **Peer-to-peer computing**: The [PIER](https://pier.cs.berkeley.edu/) project emerged during the early-2000s p2p wave. While the hype receded, the architectural ideas lingered. PIER got me thinking about the common ground between querying, indexing, routing, and overlay networks—components that all play roles in orchestrating distributed data and computation across space and time.
- **Sensor networks and probabilistic inference**: [TinyDB](https://telegraph.cs.berkeley.edu/tinydb/) shaped my early thinking about high-level programming of low-level devices, long before "IoT" was a thing. That line of work evolved into a collaboration with [Carlos Guestrin](https://guestrin.su.domains/) on distributed probabilistic inference—and helped pique my interest in AI after a discouraging first impression back in the era of expert systems and AI winter.
- **Metadata and data context**: Our [Ground](https://www.ground-context.org/) project explored lineage and metadata—i.e. *data context*—in our increasingly disaggregated era. Though we moved on, some of its ideas live on in [Datahub](https://datahubproject.io), thanks to our collaborator [Shirshanka Das](https://www.linkedin.com/in/shirshankadas).
- **Provenance for ML pipelines**: [Rolando Garcia](https://rlnsanz.github.io/) did his thesis work with us on [Flor](https://github.com/ucbrise/flor), a system for *hindsight logging* in long-running training jobs. He continues to push this space forward—see his [recent piece](https://arxiv.org/abs/2408.02498) for where it’s going next.
