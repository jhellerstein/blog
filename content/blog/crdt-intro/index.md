---
title: "A Run of CRDT Posts"
date: "2025-05-21"
slug: "crdt-intro"
coverImage: ./lattices-lettuces.png
tags: ["research", "distributed-systems", "CRDT", "algebra"]
---
Over the next few days, I'm going to post a number of observations about *CRDTs*: Convergent Replicated Data Types. These are data structures that aspire to help us with *coordination-free distributed programming*, a topic that interests me a lot. How can developers (or languages/compilers) deliver distributed programs that are *safe* or *correct* in important ways, without employing expensive mechanisms for *coordination* that make the global cloud run as slowly as a sequential computer?

In a nutshell, my take is that CRDTs are built on an elegant kernel, but offer a leaky abstraction that misleads a lot of developers -- and researchers. Understanding the ideas and problems of CRDTs is a great way to walk into this domain. I'll give an overview in this post, and the series of posts will go futher.

## CRDTs: Pros & Cons (Lattices & Lettuces?)
First, the elegant part, which I find very appealing: 

1. **Deep Roots**: CRDTs are based on *semilattices*, which are simple, abstract mathematical structures that have a `join` operator that is *associative, commutative, and idempotent*. The idea to use this for replicated data types goes back at least to work by [Baquero and Moura in 1997](https://gsd.di.uminho.pt/members/cbm/ps/scadt3.pdf). They deserve more citations for this! (HT [Conor Power](https://www.linkedin.com/in/conorpower23) for educating me about this; I believe he learned about it from [Marc Shapiro](https://www.lip6.fr/actualite/personnes-fiche.php?ident=P1450) of CRDT fame.) 

2. **Moar Algebra!**: The use of modern algebra as a building block for correctness in distributed systems and database systems is a wonderful direction for the field, and we're seeing more and more of this work in recent years. (See for example the [Simons' Institute gathering](https://simons.berkeley.edu/workshops/logic-algebra-query-evaluation#simons-tabs) from a couple years back.) This semilattice/CRDT line of work was early, elegant and easy to understand. Lovely stuff.

Unfortunately there are few key problems that arise in common discussion of CRDTs:

1. **Drifting from Correctness**. As people walk away from the semilattice foundation, they can lose their moorings in correct math. This is entirely avoidable, and most experts know how to avoid bugs here, but the discussion often gets unnecessarily subtle ... in ways that confuse people.

2. **Unsafe to Use**. The algebra of semilattices has a single operator: `join`. Notably it doesn't have any operator that corresponds to *read* or *inspect*. In fact, CRDTs as described in the literature provide *absolutely no guarantees to readers*, so a "proper" CRDT implementation should *not allow reads!* Which is to say a correct CRDT is an entirely useless theoretical object. Yet people use CRDTs, inevitably reading/inspecting them in unsafe/non-deterministic ways. Worse, many developers *think* they're getting useful correctness guarantees from CRDTs, which they are not! The only safe thing to do with a CRDT is to leave it unexamined.

3. **Programmability Issues**. As *unreadable data types*, CRDTs can't be composed safely into useful programs. How in fact can we use them?  Ideally we'd like a *language* that allows correct composition of CRDT building blocks. This is something folks have looked at in DSLs like [LVars](https://dl.acm.org/doi/abs/10.1145/2502323.2502326), [Bloom^L](https://dl.acm.org/doi/abs/10.1145/2391229.2391230), [Lasp](https://dl.acm.org/doi/abs/10.1145/2790449.2790525) and [Gallifrey](https://par.nsf.gov/biblio/10095545). There's still work to do to deliver those ideas to developers in a familiar frame, which is one goal of our [Hydro](https://hydro.run) library for Rust.

### My Take
So ... it's true that I'm not a huge fan of CRDTs as a practical matter. But I think the core ideas are quite lovely, and the pitfalls are interesting and really educational for developers and researchers to understand.  Much respect to the folks who've worked on CRDTs over the years, both for what they've invented and the challenges they've raised.

I learned a lot unpacking my discomfort with CRDTs over the years with my students, so my next few posts will hopefully expose and summarize some of what we learned along the way. You can decide whether this makes you more or less likely to use CRDTs in your code, but hopefully your decisions and ensuing heuristics will be better informed.