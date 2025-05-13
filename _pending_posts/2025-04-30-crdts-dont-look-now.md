---
layout: single
title: "CRDTs #2: Don't Look Now!"
date: 2025-04-30
categories: crdts lattices algebra distributed-systems eventual-consistency
comments: true
reading_time: true
sidebar:
  nav: "main"
---
# CRDTs: Don't Look Now!

> ## Takeaways
> - Eventual consistency is not a practical notion, since it doesn't tell you *when* you're consistent.
> - It's not safe to read the state of a CRDT. Ever!
> - All is not lost:
>    - Monotonicity can help in special cases, especially via **threshold functions**.
>    - In general, coordination is required to *know* you've reached a final state, so use it ... hopefully just once.

---
## Prologue: Eventual Consistency
Back in the early 2000s, people were trying to scale data replication from cluster-sized databases to the globe. The overhead of so-called "strong consistency" (think transactional serializability or linearizability) required *coordination* across many live machines, which was slow and not-fault tolerant.

To avoid coordination, designers began looking at weaker consistency models.
A simple idea gained popularity: *Eventual Consistency*.  It sounds pretty reassuring...until you try to use it!

Werner Vogels [defined it](https://dl.acm.org/doi/10.1145/1435417.1435432) like this:  
> *If no new updates are made to the object, eventually all accesses will return the last updated value.*

Eventual consistency is attractive because it avoids expensive coordination protocols like Paxos or Two-Phase Commit. [CRDTs](https://crdt.info/) and [ACID 2.0](https://arxiv.org/pdf/0909.1788) extended the idea of eventual consistency from state updates to the *results* of computations.

But here’s the catch: knowing you've reached "eventual" is *not* something an uncoordinated node can do! 

So we ask:

## 🙋🏻‍♀️ Are We Eventual Yet? 🤷🏻‍♂️ 

Vogels says we're consistent once *all updates are done*. But how can a node know this?

For a node to assert that it's received all updates it must assume:

1. **All nodes** are done issuing updates.
2. **All update messages** have been received at this node.

Each of these requires a universal quantifier ($\forall$). But universal
quantifiers should make you nervous! By DeMorgan’s laws, a universal quantifier ("for all") is the same as a *negated* existential quantifier ("not exists"):

$$
\forall_x p(x) \equiv \neg\exists_x \neg p(x)
$$

... meaning: **a single counter-example invalidates your universal assumption**. This makes "eventual" a *non-monotonic* property, meaning it can start out true, but become false as more information arrives.

The [CALM Theorem](https://cacm.acm.org/research/keeping-calm/) says that eventual consistency without coordination is possible *if and only if* the program specification is monotonic. Thus (via CALM) **coordination is required for termination detection**. 

👉 **So ... in coordination-free systems, you can never know when "eventual" has arrived.**

---

## 🙋🏾‍♂️ Is Anything Safe Before "Eventual"? 🚫

Nope. Anything you read could be incomplete and may change. The CRDT may be "correct", but *you’re still potentially looking too early*.

This is a classic trap with CRDTs: people confuse the correctness of merges (which CRDTs provide) with the safety of reads (which they absolutely do not provide!).

---

### 🚨 Two-Phase Sets: Poster Child of the Problem

Let’s revisit the simple 2-Phase (Add/Remove) set CRDT. It maintains two sets:

- `adds`: set of `(id, element)`
- `removes`: set of `id`s (tombstones)

You merge these by unioning. Seems safe! But to *read* the set:

```rust
read(s: 2PSet) -> Set {
    s.adds - s.removes
}
```

This `read` is **non-monotonic** in `s.removes`: removing more items *shrinks* the result. Think about that: if you decide on Tuesday that `x` is definitely in the set, somebody else could look on Wednesday and find it gone! So much for consistency: reads over time can *retract* items that they previously returned.

From a [VLDB paper](https://www.vldb.org/pvldb/vol16/p856-power.pdf) we wrote:

> A shopper adds a potato and a Ferrari to their cart. They remove the Ferrari, then "check out" — but one of the server replicas sees the checkout *before* the remove and issues the sale.  
> Boom: you just got a new Ferrari you have to pay for! 🥔🏎️

**Lesson:** 2P Set reads can race with removals. Merges are safe, but *reads aren’t*.  That makes 2P-sets nearly **useless**: you can modify them, but you can never safely read them!

### What about Simpler CRDTs?
Ok fine, 2P-sets use a *set difference* operator, which is clearly non-monotonic. But surely a plain old grow-only set is safe to read? After all, its read function looks nice and monotonic:
```rust
read(s: GrowOnlySet) -> Set {
  s.adds
}
```

Well, no, it's not at all safe.

Consider a grow-only set CRDT of items, and asssume we're allowed to read it: 

```Rust 
let c = GrowOnlySet.new({"apple sauce", "honey", "cinnamon", "walnuts"});
...
// wait for some messages 
...
let yummy = c.read();
if edible(yummy) {
  cook(yummy)
} else {
  throw(InedibleError)
}
```

In the absence of new messages, the contents of `yummy` sound like ingredients for a tasty recipe! We might happily use the `yummy` variable in a cooking algorithm.

Now suppose that at another node, we run the program, and merge as follows:

```rust 
c.merge({"nails"});
c.merge({"bleach"});
c.merge({"Leslie Lamport"})
```
The resulting merged set is not so tasty any more. That node should probably throw an `InedibleError`. Inconsistency!

The point here is that reading a fixed snapshot of the state of a CRDT can lead you to conclusions (like edibility) that may be falsified by later results...even if the materialize function is monotonic, there may be non-monotonicity downstream in how you use the snapshot! 

To stay safe, we have to keep the CRDT's state encapsulated inside the CRDT object. "Raw" observations (i.e. reads) are not safe, as they "leak" a transient state to potentially unruly downstream observers.

---

## 👍 When Monotonicity Helps

Not all hope is lost. CALM tells us if all your operations — including read — are monotonic, then outcomes will also be monotonic.

So if you read a value and it can only go up, you’ve at least got a trustworthy lower bound — *as long as you don’t treat the lower bound as a final answer!* You can’t test a read result for equality with a constant, for example -- that could be true at one moment and false at the next (just like edibility)!  But you *can compose CRDT read with additional monotonic logic*.

Let's see how.

---

## ✅ Thresholds: Coordination-Free Termination

Some lattices are bounded, which means they have a unique top element ($\top$). Once you hit $\top$, you’re done!

Example: a boolean lattice with values `false < true` and merge function that computes logical `or`.

**Threshold functions** are boolean functions (i.e. properties or predicates) on lattices that exploit this:
- They map from a big (or unbounded) lattice to the boolean lattice
- They are *monotonic* functions: as the input gets bigger, the output can never go down -- once true, always true.
- `true` is $\top$ and *safe to read*

Clearly `edible` is not a threshold function. What is a good example?

> *Example:*  
> `state.count() > 100` is a threshold function on grow-only set lattices.  
> Once it becomes true, it stays true.

Threshold functions are pretty powerful. Even if your full lattice (like a set) has no practical $\top$, your threshold function does! Once you cross that threshold, you can treat the truth value as a stable variable locally, and one that will be eventually  consistent across nodes. So you can read it safely.

But remember: *until* your threshold function hits $\top$, you’re still in unsafe territory. Reads may yet change. So threshold functions are only helpful when you they become true!

---

## 🧭 So What Should Systems Do?
Realistically, many eventually consistent systems need to use some coordination at some point:

**1. Coordination is still needed to *know* when you’re done.**  
Use it sparingly: e.g., when you're pretty sure every node is done (maybe some threshold has been met) you can employ a consensus round to detect termination. Of course if it fails you may have to wait and try again later.

**2. Don’t trust CRDTs with non-monotonic reads.**  
Non-monotonic read methos are the devil... it doesn't matter what you do downstream, the read itself exposes you to inconsistency. 2P-sets and their more complicated sibling, OR-sets, are quite troublesome in that respect.

**3. Monotonic thresholds are your friend.**  
They enable safe, observable progress without coordination — *if* you expect to hit $\top$.

---

## 🧠 Want More?

Check out our recent paper on [Free Termination](https://arxiv.org/abs/2502.00222) by Conor Power, which generalizes threshold-based observation in powerful new ways.