---
layout: single
title: "CRDTs #1: Turtles All the Way Down"
date: 2025-05-22
slug: "looking-back"
coverImage: ./crdt-turtles.png
tags: ["crdts", "lattices", "algebra", "distributed-systems", "eventual-consistency"]
---
<blockquote class="quote">
<p>
After a lecture on cosmology, William James was challenged by a skeptic:  
</p>

<p>
"Your theories are incorrect. The Earth rests on a turtle,"<br />
"And what holds up the turtle?" James asked.  <br />
"Another turtle," came the reply. <br />
"And what holds that up?" pressed James.
</p>

<p>
The skeptic was undeterred:<br />
"You can't fool me, sir. It’s turtles all the way down."
</p>

<p>
<em>— Anecdote attributed to William James ([via J.R. Ross, 1967](https://en.wikipedia.org/wiki/Turtles_all_the_way_down))</em>
</p>
</blockquote>

*This is the 1st post in a series of 4 detailed posts I'm doing on CRDTs. Please see the [intro post](../crdt-intro/) for context.*

Modern distributed systems often seem to rest on an stack of turtles.
For every guarantee we make, we seem to rely on a lower-layer assumption. Eventually we're left wondering: what *is* at the bottom?

CRDTs — *Conflict-Free Replicated Data Types* — are often advertised as a foundation we can finally trust.
They promise convergence of state across machines *without* requiring perfect clocks, global operation ordering, or causal message delivery ... and they do it with math.

But many CRDTs sneak in assumptions that don't belong. That's not solid ground. It's not math. It's turtles.

In this post, we’ll show how to design CRDT internals properly:

- ✅ Always in terms of a semilattice structure.  

- ✅ Always with clean algebraic reasoning, without hidden dependencies. 

- ✅ With explicit causality lattices included whenever needed. 


This will ensure we're always using careful reasoning.

*Correct CRDTs are semilattices at bottom.* And that's math you can count on.

## 🐢 A Principle for CRDTs: Semilattices All the Way Down
Every well-designed CRDT is a **semilattice**.

- ✅ A semilattice defines how information grows and `merge`s.
- ✅ It provides convergence by construction, through clean algebra.

In case you've read about a split between so-called "state-based" vs "op-based" CRDTs, you can ignore that for now; it's a turtlish distraction. Here’s what actually matters:

> A semilattice is:
> - A set of states $S$
> - A `join` function $\sqcup : S \times S \to S$ that must satisfy **commutativity**, **associativity**, and **idempotence**. 
> The `join` function induces a partial order:
> $x \leq y \iff x \sqcup y = y$.

When discussing CRDTs, people often use the term `merge` instead of `join`.


CRDTs sometimes add additional "update" operators: 
> `update`$: U \to (S \to S)$ 
`update` takes an input value and uses it to directly mutate the local CRDT's state.

If all pairs of nodes eventually `merge` state in an associative, commutative and idempotent manner, then eventual convergence of a CRDT is guaranteed — no further assumptions required.

## 🔍 Common CRDT Mistake: Hiding Assumptions
Many CRDT descriptions assume causal message delivery, message uniqueness, or reliable clocks ... but fail to encode these in their semilattices.

🚫 That’s like putting turtles back under the CRDT again!

### ✔️ Design Rule:
> All required assumptions must be **internalized** in the semilattice structure.

- If your algorithm needs causality, encode it.

- If it expires or compresses away state, model that algebraically too, and make sure it respects the rules of a semilattice.

- You can always optimize later (see [below](#building-on-an-existing-turtle)) ... but the math must be sound on its own.

### Case Study: Add/Remove Sets with Expiring Tombstones
Let's walk through a concrete example.

An 2-Phase (2P) Set is a simple CRDT that tracks a pair of set-based lattices where `merge` is set-union for each:
- **adds**: `{(id, element)}`
- **removes**: `{(id, timestamp)}` (sometimes referred to as **tombstones**)

The 2P-Set is a **free product** of these two set lattices, which is to say that the 2P-Set `merge` operator  is simply the independent `merge` of 2 **adds** sets, and 2 **removes** sets, each with $\cup$. Updates are simple: add an item by inserting into **adds**, delete an item by placing its id and time of deletion into **removes**. All good.

Until... you try to expire tombstoned data to save space.

The OR-Set CRDT extends 2P-Sets to do this, but ... it's tricky! Let's walk through it.

Naive expiry might work by looking at a local wall-clock and expiring ids from **adds** and **removes** whose tombstones have old timestamps. This would be bad! Making this local decision can cause **non-convergent** behavior. This is not at all obvious (in fact, ChatGPT happily provided incorrect proofs in both directions!), so I constructed a proof by example.  The basic idea is this: even after all updates have been issued, nodes can pass an item back and forth as a "hot potato" indefinitely, and never converge despite communicating infinitely often! 

<details>
<summary>Click to see a non-convergent OR-Set cycle infinitely.</summary>

<a href="/img/divergence_fsm_piechart.png">
<img
  src="/img/divergence_fsm_piechart.png"
  alt="FSM Divergence Diagram"
/>
</a>
<p>
  This diagram shows an oscillating state change cycle -- a single item in an OR-set that uses naive local expiry and never converges, just keeps rotating from state to state forever. Each 'pie' represents a *global* state of the item, across each of three nodes, <code>A</code>, <code>B</code> and <code>C</code>. In each state, each of the machines either has the item only in the adds set (<code>+</code>), in the adds and removes sets (<code>—</code>) or in neither (<code>?</code>). Edges are labeled with state transitions: <code>xp@A</code> means that the item expired at node <code>A</code>; <code>B <- A</code> means that node <code>B</code> received a copy of the item from node <code>A</code>.
</p>
<p>
  Click on the image to zoom if needed.
</p>
</details>

#### 🧯 Fix: Internalize Causality
This brings us back to the main point of this post: we need to *explicitly* include information in our OR-set semilattice to support convergent expiry of state. Specifically we can use another semilattice to track a **causal context**—e.g. a **version vector**—and use that to determine when it's safe to expire items:

- ✅ Expire only when every node is guaranteed to have seen a tombstone.

This extends the OR-Set semilattice into a [lexical product](https://en.wikipedia.org/wiki/Lexicographic_order) semilattice: 

```
(causalContext, (adds, removes))
```

Unlike our previous *free product*, the lexical product only looks at its second field `(adds, removes)` when breaking ties on the first field `causalContext`:

$$
(cC_1, (a_1, r_1)) \sqcup (cC_2, (a_2, r_2)) =
\begin{cases}
  (cC_1, (a_1, r_1)) & \text{if } cC_1 > cC_2 \\\
  (cC_2, (a_2, r_2)) & \text{if } cC_2 > CC_1 \\\
    (cC_1 \sqcup cC_2, (a_1 \sqcup a_2, b_1 \sqcup b_2)) & otherwise
\end{cases}
$$


Note that the `causalContext` is itself another semilattice! It tracks which operations have been observed system-wide. This tracking can be stale, but it is always a conservative lower bound. We can safely expire data from our OR set if it is older than our `causalContext`.

There are different implementations for `causalContext`, including *version vectors* or *causal graphs*. We'll work with version vectors since they're the most common.

<details>
<summary>Click to learn about version vectors.</summary>

We begin by ensuring that each node maintains a *local clock* -- a counter that increments by 1 each time the node applies an operation or sends a message. (Note that a counter is also a semilattice, where the domain $S = \mathbb{N}$ is the natural numbers 0, 1, 2, ..., and the `merge` function is `max`.)
<br />
<br />

A *version vector* is a map from `nodeId` to a counter lattice: it records the highest clock value a node has heard of *from each other node*. This map is itself a composite semilattice! Specifically:

- The domain $S$ is a map from `nodeId` (the key) to a counter lattice value (the value)
- The `merge` function is simply key-wise application of the value lattice `merge` (`max`). If a key is missing from one input to `merge`, we simply take its value from the other input.
</details>

Notice what we did here: we formed a *composite* semilattice `(causalContext, (adds, removes))` out of very simple semilattice building blocks.
The `merge` functions of these lattices effectively invoke the encapsulated sub-lattice `merge` functions recursively.

*It really is lattices all the way down!*


#### Using Version Vectors for Safe Expiration
To use our version vectors, we will make a few small changes to our OR-set design:

1. Each node locally maintains an overall version vector containing the `merge` of *all* version vectors seen so far: this is typically called a *vector clock*. It represents a high-watermark of our local knowledge of global progress. 
2. When an item is deleted, its tombstone timestamp is set to the local vector clock.

We can now do expiration safely: tombstones are only expired if their timestamp is lower in the partial order than the local *vector clock*: if so, we can be sure that *every other node will also delete this tombstone* if it hasn't already!

## 🪜 <a id="building-on-an-existing-turtle"></a>You Can Build on a Turtle — But Know What It Carries
Sometimes, a system's lower layers provide additional guarantees that allow us to skip some details and rely on a turtle below us.

> Example: If your network guarantees causal delivery, you can safely drop explicit causal tracking in your CRDT.

But beware: your CRDT is now resting on that turtle. If the network is not in fact behaving like a causal semilattice, your convergence proofs go out the window!

## 📌 Takeaways
- ✅ Every CRDT must be a (correct) semilattice
- ✅ Order comparisons must respect the partial order induced by `merge`.
- ✅ Model all necessary assumptions *inside* the lattice.
- ✅ Build on trusted turtles only when you know exactly what they can carry safely.

When you do all that?
> **It's semilattices all the way down**.

That's math you can build on.
