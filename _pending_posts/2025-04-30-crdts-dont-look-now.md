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
**Takeaways:**
- Eventual consistency doesn't tell you *when* you're consistent.
- Many CRDTs are unsafe to read from—*especially* the popular OR-set.
- Monotonicity can help, especially via **threshold functions**.
- Coordination is still needed to *know* you've reached a final state.

---

*Eventual Consistency* sounds reassuring—until you try to use it.  
Werner Vogels [defined it](https://dl.acm.org/doi/10.1145/1435417.1435432) like this:  
> *If no new updates are made to the object, eventually all accesses will return the last updated value.*

This avoids expensive coordination protocols like Paxos or 2PC. [CRDTs](https://crdt.info/) and [ACID 2.0](https://arxiv.org/pdf/0909.1788) build on this idea, extending it to computations. The [CALM Theorem](https://cacm.acm.org/research/keeping-calm/) sharpens the picture: **eventual consistency without coordination is  possible *if and only if* the program is monotonic**.

But here’s the rub: knowing you've reached "eventual" is *not* something an uncoordinated node can do. So we ask:

---

## 🙋🏻‍♀️ Are We Eventual Yet?

Vogels says we're consistent once *all updates are done*. But how can a node know this?

It must assume:

1. **No node** will ever make another update.
2. **This node** has received *all* updates so far.

Each of these requires a universal quantifier ($\forall$)—over nodes or messages. But universal
quantifiers should make you nervous! By DeMorgan’s laws:

$$
\forall_x p(x) \equiv \neg\exists_x \neg p(x)
$$

— meaning: **a single new update or delayed message can invalidate your universal assumption**. This makes "eventual" a *non-monotonic* property, and thus (by CALM) **coordination is required** to confirm it.

👉 **So in coordination-free systems, you'll never know when "eventual" has arrived.**

---

## 🙋🏾‍♂️ Is Anything Safe Before "Eventual"?

Nope. Anything you observe could be incomplete and may change. The CRDT may be "correct", but *you’re still looking too early*.

This is a classic trap with CRDTs: people confuse the correctness of merges with the safety of reads.

---

### 🚨 OR-Sets: Poster Child of the Problem

Let’s revisit the classic Add/Remove (OR-set) CRDT. It maintains two sets:

- `adds`: set of `(id, element)`
- `removes`: set of `id`s (tombstones)

You merge these by unioning. Seems safe! But to *read* the set:

```rust
materialize(s: S) -> S {
    s.adds - s.removes
}
```

This `materialize` is **non-monotonic** in `s.removes`: removing more items *shrinks* the result. So reads over time
can retract items that they previously returned.

From our [VLDB paper](https://www.vldb.org/pvldb/vol16/p856-power.pdf):

> A shopper adds a potato and a Ferrari to their cart. They remove the Ferrari, then "check out"—but another replica sees the checkout *before* the remove.  
> Boom: the car ships. 🥔🏎️

**Lesson:** OR-Set reads (i.e. `materialize`) can race ahead of removals. Merges are safe, but *reads aren’t*.  
That makes OR-sets practically **useless** for safe observation.

---

## 👍 When Monotonicity Helps

Not all hope is lost. CALM tells us if all your operations—including materialization—are monotonic, then outcomes will also be monotonic.

So if you observe a value *and it can only go up*, you’ve at least got a trustworthy lower bound—*as long as you don’t treat the lower bound as a final answer*. You can’t test it for equality, for example, but you can *compose it with additional monotonic logic*.

---

## ✅ Thresholds: Coordination-Free Termination

Some lattices are bounded, which means they have a unique top element ($\top$). Once you hit $\top$, you’re done.  
Example: a boolean lattice with values `false < true`.

**Threshold functions** exploit this:
- They are monotonic functions from a big (even unbounded) lattice to the boolean lattice
- Once true, always true
- `true` is $\top$ and is *safe to observe*

> *Example:*  
> `count(set) > 100` is a threshold function on sets.  
> It becomes true *once*, and stays true.

This is powerful. Even if your full lattice (like a set) has no practical $\top$, your threshold function might.

But remember: until your threshold function hits $\top$, you’re still in unsafe territory. Observations may change.

---

## 🧭 So What Should Systems Do?

**1. Coordination is still needed to *know* when you’re done.**  
Use it sparingly: e.g., one consensus round to detect termination when you're pretty sure you're at the end.

**2. Don’t trust CRDTs with non-monotonic reads.**  
Especially OR-sets! Materialization is a minefield.

**3. Monotonic thresholds are your friend.**  
They enable safe, observable progress without coordination—*if* you expect to hit $\top$.

---

## 🧠 Want More?

Check out our recent paper on [Free Termination](https://arxiv.org/abs/2502.00222) by Conor Power, which generalizes threshold-based observation in powerful new ways.

---

*CRDTs may avoid coordination, but reading them safely is a whole different story. Don't look now—unless you know it's safe.*
