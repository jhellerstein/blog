---
layout: single
title: "CRDTs #1: Turtles All the Way Down"
date: 2025-04-28
categories: crdts lattices algebra distributed-systems eventual-consistency
comments: true
reading_time: true
sidebar:
  nav: "main"
---
> After a lecture on cosmology, William James was challenged by a skeptic:  
> "Your theories are incorrect. The Earth rests on a turtle,"
> "And what holds up the turtle?" James asked.  
> "Another turtle," came the reply.
> "And what holds that up?" pressed James.
> The skeptic was undeterred:
> "You can't fool me, sir. It’s turtles all the way down."
>
> *— Anecdote attributed to William James ([via J.R. Ross, 1967](https://en.wikipedia.org/wiki/Turtles_all_the_way_down))*

Modern distributed systems often seem to rest on an stack of turtles.
For every guarantee we make, we seem to rely on a lower-layer assumption. Eventually we're left wondering: what *is* at the bottom?

CRDTs — *Conflict-Free Replicated Data Types* — are often advertised as a foundation we can finally trust.
They promise convergence *without* requiring perfect clocks, global operation ordering, or causal message delivery—just math.

But many CRDTs sneak in assumptions that don't belong. That's not solid ground. That's more turtles.

In this post, we’ll show how to design CRDT internals properly:

✅ Always in terms of a semilattice structure.

✅ Always with explicit internalization of causality and progress.

✅ Always with clean algebraic reasoning, without hidden dependencies.

This will ensure we're always using careful reasoning.

*It’s semilattices all the way down.* And that's math you can build on.

## 🐢 A Principle for CRDTs: Semilattices All the Way Down
Every well-designed CRDT is a **semilattice**.

> ✅ A semilattice defines how information grows and merges.
>
> ✅ It provides convergence by construction, through clean algebra.

Forget the traditional state-based vs op-based CRDT split — that’s a distraction. Here’s what actually matters:

A semilattice is:

- A set of states S

- A merge function $\sqcup : S \times S \to S$

- That satisfies **commutativity**, **associativity**, and **idempotence**

Together, these induce a partial order $\leq$ where $x \leq y \iff x \sqcup y = y$.

CRDTs sometimes add additional operators $update: U \to (S \to S)$ that describe how to take an update value and use it to mutate the CRDT's state. An $update$ operator is required to be *monotonic* with respect to the partial order: it cannot assign a new value that is lower in the partial order than the old value.

If every update is monotonic under this partial order, and nodes eventually merge state, then convergence is guaranteed—no assumptions needed.

## 🔍 Common CRDT Mistake: Hiding Assumptions
Too many CRDTs assume causality, message uniqueness, or reliable clocks — but don’t encode these in their semilattices.

🚫 That’s like putting turtles back under the CRDT again.

### ✔️ Design Rule:
> All required assumptions must be **internalized** in the semilattice structure.

If your algorithm needs causality, encode it.

If it expires or compresses away state, model that algebraically too and make sure it respects the rules of a semilattice.

You can always optimize later (see [below](building-on-an-existing-turtle))—but the math must be sound on its own.

### Case Study: Add/Remove Sets with Expiring Tombstones
Let's walk through a concrete example.

An Add/Remove Set (often called an OR-Set) is a simple CRDT that tracks two set-based lattices where merge is set-union:
- **adds**: `{(id, element)}`
- **removes**: `{(id, timestamp)}`, sometimes referred to as *tombstones*.

The OR-Set is a **free product** of these two set lattices. Merge each with $\cup$. Add an item by inserting into **adds**, delete an item by placing its id and time of deletion into **removes**. All good.

Until... you try to expire tombstoned data to save space.

Naive expiry might work by looking at a local wall-clock and expiring ids from **adds** and **removes** whose tombstones have old timestamps. Doing this can cause **non-convergent** behavior. This is not obvious (ChatGPT happily provided incorrect proofs in both directions!), so I generated a proof by example.  The basic idea is this: even after all updates have been issued, nodes can pass an item back and forth as a "hot potato" indefinitely, and never converge despite communicating infinitely often! 
<a href="{{ site.baseurl }}/assets/images/divergence_fsm_piechart/">
  <img src="{{ site.baseurl }}/assets/images/divergence_fsm_piechart.png" alt="FSM thumbnail"
       style="max-width: 200px; border: 1px solid #ccc; display: block; margin: 0 auto;" />
</a>
<p style="text-align: center; font-size: 0.9em; color: gray;">
  Click to view a "hot potato" cycle of OR-Set states with naive expiry.
</p>


#### 🧯 Fix: Internalize Causality
This brings us back to the main point of this post: we need to *explicitly* include information in our OR-set semilattice to support convergent expiry of state. Specifically we can track a **causal context**—a lattice like a **version vector**—and use it to determine when it's safe to expire items:

> ✅ Expire only when every node is guaranteed to have seen a tombstone.

This extends the OR-Set semilattice into a lexical product: 

```
(causalContext, (adds, removes))
```

Unlike our previous *free product*, the lexical product only looks at its second field `(adds, removes)` when breaking ties on the first field `causalContext`:

$$
(cC_1, (a_1, r_1)) \sqcup (cC_2, (a_2, r_2)) =
\begin{cases}
  (cC_1, (a_1 \sqcup a_2, b_1 \sqcup b_2) & \text{if } cC_1 = cC_2 \\\\
  (cC_1, (a_1, r_1)) & \text{if } cC_1 > cC_2 \\\\
  (cC_2, (a_2, r_2)) & \text{if } cC_2 > CC_1
\end{cases}
$$


Note that the `causalContext` is itself another semilattice! It tracks which operations have been observed system-wide. This tracking can be stale, but it is always a conservative lower bound. We can safely expire data from our OR set if it is older than our `causalContext`.

There are different implementations for `causalContext`, including *version vectors* or *causal graphs*. We'll work with version vectors since they're the most common.

<details>
<summary>Click to learn about version vectors.</summary>

<div markdown="1">

We begin by ensuring that each node maintains a local counter that increments by 1 each time the node applies an operation or sends a message. (Note that a counter is a lattice, where the domain $S = \mathbb{N}$ is the natural numbers 0, 1, 2, ..., and the merge function is `max`.)

A *version vector* is a map from `nodeId` to a counter lattice: it records the highest clock value a node has heard of *from each other node*. This map is itself a composite lattice! Specifically:

- The domain $S$ is a map from `nodeId` (the key) to a counter lattice value (the value)
- The merge function is simply key-wise application of the value lattice merge (`max`). If a key is missing from one input to merge, we simply take its value from the other input.

Notice what we did here: we formed a *composite* lattice of very simple building blocks:
- A lexical product of a `causalContext` lattice
  - Namely, a version vector: a `mapLattice` over `counter` value lattices ($\mathbb{N}$, `max`)
- ... and a free product of a set lattice called `adds` and a set lattice called `removes`

The merge functions of these lattices effectively invoke the encapsulated sub-lattice merge functions recursively.

*It really is lattices all the way down!*


#### Using Version Vectors for Safe Expiration
To use our version vectors, we will make a few small changes to our OR-set design:

1. Locally maintain an overall version vector containing the merge of *all* version vectors seen so far: this is typically called a *vector clock*. It represents a high-watermark of our local knowledge of global progress. 
2. Timestamps on tombstones are set to the local vector clock, rather than the local clock.

We can now do expiration safely: tombstones are only deleted if their timestamp is lower in the partial order than the local *vector clock*: if so, we can be sure that *every other node will also delete this tombstone!

## 🪜 You Can Build on a Turtle — But Know What It Carries
Sometimes, a system's lower layers provide additional guarantees that allow us to skip some details and rely on a turtle below us.

> Example: If your network guarantees causal delivery, you can safely drop explicit causal tracking in your CRDT.

But beware: your CRDT is now resting on that turtle. If it is not behaving like a semilattice, your convergence proofs go out the window!

> ✅ Always model assumptions.
> ✅ Never leave the correctness up to a hidden layer.

## 📌 Takeaways
✅ Every CRDT must be a (correct) semilattice

✅ Update functions and order comparisons must respect the partial order induced by merge.

✅ Model all necessary assumptions *inside* the lattice.

✅ Build on trusted turtles only when you know exactly what they can carry safely.

When you do all that?
> **It's semilattices all the way down**.
> That's math you can build on.
