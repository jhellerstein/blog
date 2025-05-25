---
title: "CRDTs #3: Don't Look Now!"
date: 2025-05-23
coverImage: ./seeno.png
---
This 3rd post on CRDTs covers their fundamental problem: they are unsafe for reading.
As such, the standard formal guarantees of consistency they offer are nearly unusable. 
What CRDTs *can* provide — but only under certain conditions! — is a property called **monotonicity**.
And that can indeed be leveraged, with careful programming.

## Takeaways of this Post
<span style="font-size: 1.5em;">☣️</span> It's not safe to read the state of a CRDT. *Ever.* It should remain encapsulated.

<span style="font-size: 1.5em;">⛔️</span> Eventual consistency is not a practical notion, since it doesn't tell you *when* you're consistent.

<span style="font-size: 1.5em;">😅</span> All is not lost:

- The monotonicity of CRDTs can help in special cases, especially via **threshold functions**.
- In the general case, coordination is required to *know* you've reached a final state, so we should use it ... as infrequently and strategically as we can.

---
## Prologue: "Eventual Consistency"
Back in the early 2000s, people were trying to scale data replication from cluster-sized databases to the globe. The overhead of so-called "strong consistency" (think serializable transactions or linearizable actions) requires *coordination* across many live machines, which introduces latency and vulnerability to faults.

To avoid coordination, designers began looking at weaker consistency models.
A simple idea gained popularity: *Eventual Consistency*.  It sounds pretty reassuring...until you try to use it!

Werner Vogels [defined eventual consistency like this](https://dl.acm.org/doi/10.1145/1435417.1435432):  
> *If no new updates are made to the object, eventually all accesses will return the last updated value.*

Eventual consistency is attractive because it avoids expensive coordination protocols like Paxos or Two-Phase Commit. [CRDTs](https://crdt.info/) and [ACID 2.0](https://arxiv.org/pdf/0909.1788) extended the idea of eventual consistency from read/write state mutation to the *results* of computations.

But here’s the catch: knowing you've reached "eventual" is *not* something an uncoordinated node can do! 

So we might ask...

## 🙋🏻‍♀️ Are We Eventual Yet? 🤷🏻‍♂️ 

Vogels says that the state of a replicated object is consistent once *all updates are done*. But how can a node in a distributed systems know that all updates are done? More crisply, how can we implement 
**termination detection** for a distributed computation?

For a node to establish the termination of a general distributed computation, it must establish that:

1. **No node** will issue any new messages.
2. **No messages** are in flight.

Written in logic, each of these statements takes the form 

$$
\neg\exists n  \; (p(n))
$$

"there does not exist an instance $n$ where property $p(n)$ holds". 
In distributed systems, any property that begins with $\neg\exists$ (or its doppelganger, $\forall$) and involves distributed information should make you nervous! Why? Because **a single counter-example invalidates the property**, and nodes in distributed systems generally lack the global knowledge to rule out such a counter-example.

Returning to our main point, the above makes clear that
**termination ("eventuality") is a non-monotonic property**: it can be true over a certain set of information, but become false as more information arrives.

The [CALM Theorem](https://cacm.acm.org/research/keeping-calm/) says that eventual consistency without coordination is possible *if and only if* the program specification is monotonic. Thus (via CALM) **coordination is *required* for termination detection**. 

👉 **So ... in coordination-free systems, you can never know when "eventual" has arrived.**

<details>
<summary>Click for a review of monotonicity.</summary>

Given a function $f:S \rightarrow T$, where $S$ and $T$ are ordered domains, we say that $f$ is **monotonic** if:

$$
x \le y \implies f(x) \le f(y)
$$

Intuitively, a monotonic function *preserves order*: it guarantees that if the input gets "bigger", then the output gets no smaller.

Monotonicity is often used in logic, where our domains $S$ and $T$ contain sets of facts. Given an input $x$, a logical function $f$ produces a set of *conclusions*, $f(x)$. If $f$ is monotonic, $x \subseteq y \implies f(x) \subseteq f(y)$: that is, $f(y)$ contains all the facts in $f(x)$ and perhaps more. 

In practical terms, if we think of $f$ as a process running over a growing stream of facts, we can say this: *once an output fact is concluded by a monotonic function, additional input facts will not invalidate that conclusion*.

You can see why this is useful in a distributed system! 

1. Monotonic functions allow for correct, wait-free, streaming computation.
2. For logical monotonic functions, the truth of a conclusion is invariant in the face of additional input.
</details>


---

## 🙋🏾‍♂️ Is Anything Safe Before "Eventual" comes? 🚫

Nope. Anything you read from the state of a CRDT could be incomplete and may change.

This is the standard misunderstanding of CRDTs: it's easy to confuse the formal guarantees of `merge`s (which CRDTs indeed provide) with the safety of `read`s (which CRDTs absolutely do not provide!) 

If you previously missed this, you are in good company. The fact that CRDTs are not in fact safe to `read` is not at all prominent in online discussion, software packages, or the research literature. Perhaps this post can serve as a warning and a pointer to more subtle discussion in the literature.

Below we'll illustrate the problem, and talk about ways to use CRDTs responsibly.

---

### 🚨 Two-Phase Sets: Poster Child of the Problem

Let’s revisit the simple 2-Phase (Add/Remove) set CRDT. It maintains two sets. For simplicity, we can
think of them looking like this:

- `adds`: set of `(id, element)`
- `removes`: set of `(id, element)`

We merge these by unioning. Seems safe: both sets are merged in an associative, commutative and idempotent manner, so the 2P-set is eventually consistent! But to *read* the contents of the 2P-set, we're supposed to run this function:

```rust
read(s: 2PSet) -> Set {
    s.adds - s.removes
}
```

This `read` is **non-monotonic** in `s.removes`: growing the removes set *shrinks* the result of `read`. Why is this a problem? 

Consider the potato/Ferrari example from our [Keep CALM and CRDT on paper at VLDB](https://www.vldb.org/pvldb/vol16/p856-power.pdf):

> As you are shopping online, you add a potato and a Ferrari to your cart. Reflecting on your finances, you decide to remove the Ferrari, and then "check out". Your cart state is replicated at the server in a 2P-set CRDT. One of the server replicas sees the cart-checkout message *before* the remove, ``read``s the cart state and issues the sale.  
>
> Boom: you just got a new Ferrari you have to pay for! 🥔🏎️

**Lesson:** 2P-Set `read`s can race with `removal`s. `Merge`s are safe, but `read`s aren’t!.  That makes 2P-sets nearly **useless**: you can modify them, but you can never safely `read` them!

### What about Simpler CRDTs?
Ok fine, 2P-sets use a *set difference* operator, which is clearly non-monotonic. The CALM Theorem warned us that non-monotonic operations require coordination for consistency! 

But surely a plain old grow-only set is safe to read? After all, its `read` function looks nice and monotonic:
```rust
read(s: GrowOnlySet) -> Set {
  s.adds
}
```

Well, no, it's not at all safe.

Consider a grow-only set CRDT of items, and asssume we're allowed to `read` it: 

```Rust 
let c = GrowOnlySet.new({"apple sauce", "honey", "cinnamon", "walnuts"});

//... receive and merge messages into c

let yummy = c.read();
if edible(yummy) {
  cook(yummy)
} else {
  throw(InedibleError)
}
```

The initial contents of `yummy` sound like ingredients for a tasty recipe! In the absence of any external messages at a node $n$, we might happily use the `yummy` variable in a cooking algorithm.

Now suppose that at another node $m$, we run a replica of this program, and it receives the following message to merge:

```rust
c.merge({"broken glass", "bleach", "Paxos"})
```
The resulting merged set is not so tasty any more. That node should probably throw an `InedibleError`. Now $m$ and $n$ appear inconsistent! Why? Because, even though `c` grows monotonically, `edible` is not a monotonic function over `c`: it starts out false (on the empty set), may become true as it sees more input, and then can become false again.

The general point here is that reading a fixed snapshot of the state of a CRDT can lead you to computational conclusions (like edibility) that may be falsified by later inputs. *Even if the `read` function is monotonic, there may be non-monotonicity downstream in how you use the snapshot you read!*

---
## A Type System Proposal
Given all this subtlety, I would advice that CRDTs only be used in strongly-typed languages, with explicit escape hatches for intrepid developers.

Specifically, a CRDT implementation should keep its state fully encapsulated. Interfaces to acquire a copy of the raw state (`read`, `snapshot`) should be marked as `unsafe`, as they leak a transient state to potentially unruly downstream observers. 

If your language supports strong dataflow guarantees, you may be able to allow `read` without `unsafe` *if you can ensure that all downstream uses of the the output of `read` are monotonic*. That said, monotonicity is undecidable in general, and hard to check conservatively in most popular programming languages today.

---

## 👍 When Monotonicity Helps

The discussion above seems pretty negative, but all hope is not lost. The monotonicity of a CRDT with respect to its ordering is a guarantee we can leverage.

Specificaly, the value of a CRDT can only go up over time, so CRDTs guarantee us trustworthy *lower bounds* on their eventual state — we just can't treat a lower bound as a final answer! They are different types.

So, for example, we can’t test the result of a `read` for equality with a constant — that could be true at one moment and false at the next (just like edibility)!  But you *can compose CRDT `read` with additional monotonic logic*.

Let's see how.


### ✅ Thresholds: Coordination-Free Termination

Some lattices are bounded, which means they have a unique top element ($\top$). Once you hit $\top$, you’re done! As a classic example, consider the boolean lattice with values `{false , true}` and merge function that computes $\vee$ (logical `or`).

**Threshold functions** are boolean functions (i.e. truth predicates) on lattices that exploit this:
- They map from a big (or unbounded) lattice to the boolean lattice
- They are *monotone* functions: as the input gets bigger, the output can never go down -- once `true`, always `true`!
- `true` is $\top$ and *safe to `read`*

Clearly `edible` is not a threshold function. What is a good example? Here are two examples on grow-only set lattices: once true, they remain true!

> `state.count() > 100`
> `state.contains('apple sauce')`

CRDTs and threshold functions can be pretty useful. Even if your full lattice (like a set) has no practical $\top$, your threshold function does! Once you cross that threshold, you can treat the truth value as a stable boolean value locally, and one that will be eventually consistent across nodes. So you can `read` it safely.

But remember: *until* your threshold function hits $\top$, you’re still in unsafe territory. `Read`s may yet change. So threshold functions are only helpful when you they become true!

---

## 🧭 So What Should Systems Do?
Realistically, many eventually consistent systems need to use some coordination at some point:

**1. Coordination is still needed to *know* when you’re done.**  
Use it sparingly! For example, when you're pretty sure every node is done with a task or session — maybe because some threshold has been met — you can employ a round of consensus to detect termination. (Of course if it fails you may have to wait and try again later.)

**2. Don’t trust CRDTs with non-monotonic reads.**  
Non-monotonic `read` methods like that of 2P-sets are unsafe in any context... it doesn't matter what you do downstream, the `read` itself exposes you to non-monotonicity and hence inconsistency. 2P-sets and their more complicated sibling, OR-sets, are quite troublesome in that respect.

**3. Embrace strong typing and escape hatches.**
CRDT state should be encapsulated, and methods that expose the state should be marked `unsafe`. 
There are certainly cases where developers will want to take their non-deterministic chances `read`ing the 
state of a CRDT, and that's their business! But for purposes of maintainability and code review, risky behavior of that sort should be explicitly flagged in code, just like Rust requires us to flag unsafe memory accesses.

**4. Monotonic thresholds are your friend.**  
They enable safe, observable progress without coordination — *if* you expect to hit $\top$.

---

## 🧠 Want More?
It turns out that the top of a lattice is not the only state that can locally guarantee termination!
Check out our recent paper on [Free Termination](https://arxiv.org/abs/2502.00222) by Conor Power, which generalizes threshold-based observation in powerful new ways.