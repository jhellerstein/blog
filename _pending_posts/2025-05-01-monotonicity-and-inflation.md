---

layout: single
title: "CRDTs #2: Convergence, Determinism, and Inflation"
date: 2025-05-01
categories: crdts lattices algebra distributed-systems monotonicity inflationary determinism convergence eventual-consistency
comments: true
reading_time: true
sidebar:
  nav: "main"
------------------------------------------------------

Like a lot of work on eventual consistency, the CRDT literature tends to be targeted at distributed systems researchers and developers. As such it sometimes leaves room for ambiguity.

This post untangles two subtle but important ideas in CRDT design, which turn out to be interrelated:

1. Determinism vs Convergence guarantees
2. Algebraic property requirements for update functions.

> tl;dr: If you want your CRDTs to be deterministic, your update functions better be inflationary. If you only care about convergence (eventual agreement), you can relax that constraint.

---

## Definitions First

Before we get into the details, let's be a bit careful with our terminology. I'll assume you've seen CRDTs before, but I'll review the key points while trying to keep this breezy.

### Join Semi-Lattices

You likely remember that CRDTs are related to *lattices* in abstract algebra. Let's review that.

Let’s suppose we have a set of possible states $S$, equipped with a **join operator** $\sqcup: S \times S \to S$. The join is required to satisfy three properties:

* **Idempotent**: $x \sqcup x = x$
* **Commutative**: $x \sqcup y = y \sqcup x$
* **Associative**: $x \sqcup (y \sqcup z) = (x \sqcup y) \sqcup z$

That’s all we need for CRDTs. If you have a set and a binary operator satisfying these properties, you have a **join-semilattice**.

From this operator, we can define a **partial order**:

$$
x \leq y \quad \text{iff} \quad x \sqcup y = y
$$

This means that applying join never forgets anything. It only moves “upward” in the order induced by join.

### **From Join Semi-Lattices to CRDTs**

A CRDT is essentially a replicated join semi-lattice. It is an abstract data type with internal states $S$, and a merge function that is associative, commutative and idempotent. So far that's *precisely* a join semi-lattice.

To that definition we add one more API, an **update function** that mutates the state of the CRDT (while of course staying within the state space $S$).  As we'll see below, these functions can be the source of nondeterminism depending on their algebraic properties.

Next, we assume an asynchronous **network dissemination service**  that periodically sends a snapshot of one node's state to another. When state arrives at a destination node, its local CRDT state is mutated to reflect the merge of the current state with the message. 

To ensure full replication, the dissemination service must ensure **periodic pairwise update propagation:** each pair of nodes periodically receives a *transitive merged update* from each other node. We use the phrase "transitive merged update" here in the sense that each intermediate node along a network path will invoke its merge function before an update is propagated down the path. Pairwise propagation can be achieved in many ways, e.g. via all-to-all pairwise gossip, broadcast, spanning-tree scatter/gather, and so on. 

That's all we need, at the level of detail we'll pursue here. However, the literature on CRDTs typically highlights a subclass of CRDTs called "op-based" CRDTs. Lest you be wondering about them here, I promise we will return to them down below. They turn out to be simple in the context that interests us here.

Given this background, let’s move on to define a key property of functions $f: S \to S$:

### Inflationary

$$
x \leq f(x)
$$

Note that the partial order $\leq$  is the one from our semi-lattice definition. Inflationary functions never take us "down" in the lattice order.

---

## Join Is Always Inflationary

Let’s start by stating something reassuring:

> The join operator $x \sqcup y$ is always inflationary in each of its arguments.

Why?

* $x \leq x \sqcup y$, because $x \sqcup y$ is an upper bound for $x$.

This is one reason why many CRDT papers don’t emphasize inflationarity: they tend to focus on merge operations, and merge (a.k.a. join) satisfies the property automatically.

Our issue is going to be the **update function** each node runs between merges. More on that shortly.

But first, let's define the standard guarantee that CRDTs are designed to provide.

---

## Strong Eventual Consistency (SEC)

A common correctness guarantee for CRDTs is **Strong Eventual Consistency (SEC)**, as defined by Shapiro et al. It requires that, eventually, all replicas converge to the same state, provided they have seen the same set of updates.

The SEC condition includes three properties:

1. **Eventual delivery**: All updates eventually reach all replicas.
2. **Termination**: All operations eventually complete.
3. **Strong convergence**: If two replicas have received the same set of updates, they will reach the same state.

Note that SEC says nothing about ordering of operations; in particular it **does not constrain the interleaving** of update and communication. Given that dissemination is assumed to be asynchronous, a replica might send its current state before or after applying an update. We’ll see how this matters next.

---

## SEC Does Not Guarantee Determinism

We tend to think of convergence as a property that avoids non-determinism: after all, in a convergent replica system, all the replicas agree on the outcome. But that doesn't actually mean that they agree on a *deterministic* outcome!

As defined, Strong Eventual Consistency only says that replicas converge *within* a run. It says nothing about whether different executions — with the same set of updates and nodes — produce the same final result.

Consider the following function:

$$
\text{DropTop}(x) = \begin{cases}
  a & \text{if } x = \top \\
  x & \text{otherwise}
\end{cases}
$$

The $\top$ ("top") symbol is the standard lattice notation for topmost state in the lattice (i.e. the unique join of all states).

This function is not inflationary: it "drops" from $\T$ to a lower value $a$. If a user applies it once at node A, the final result depends on whether A sends its state to B *before or after* applying the update.

**Example: Two Possible Outcomes**

Let $S = \{\bot, a, \top\}$, with $\bot < a < \top$.

* Node A starts at $\top$
* Node B starts at $\bot$
* A single user applies DropTop one on node A

**Run 1**: Send first, then update

* A **sends** $\top$ to B
* B **merges**: $\bot \sqcup \top = \top$
* A **applies** DropTop: $\top \mapsto a$
* B **sends** $\top$ to A
* A **merges**: $a \sqcup \top = \top$
* Final state: A = $\top$, B = $\top$

**Run 2**: Update first, then send

* A **applies** DropTop: $\top \mapsto a$
* A **sends** $a$ to B
* B **merges**: $\bot \sqcup a = a$
* Final state: A = $a$, B = $a$

Same updates. Same nodes. Same messages. Just different orders. Two different final states.

---

## Inflationarity is Needed for Deterministic Convergence

As we've seen, non-inflationary functions like DropTop allow multiple possible converged states, which depend on the interleaving of updates and messages.

If all updates are inflationary, then once a state has moved "up" the lattice, it never moves back down — and that ensures:

* Each replica's state moves up the lattice.
* Merging always moves replicas up in the lattice.
* The final state is the least upper bound of all updates.

That last point ensures **determinism**: the final result depends only on the set of updates, not their timing.

$\boxed{\text{Inflationarity is required for deterministic convergence.}}$

---

## Non-Inflationary Updates Restrict Safe Observation

Although non-inflationary functions like DropTop can still converge, they complicate the task of writing correct programs against CRDTs.

Imagine you're writing application logic that reads from a CRDT value during execution.

If the update function is inflationary, you have a guarantee: the current state is a **lower bound** of the final state. That makes it safe to make assumptions like:

* "This user will never lose this permission."
* "This counter will only increase from here."

But if updates are **not** inflationary, those assumptions no longer hold. You might see a high value now — and a lower one later — because your node applied a non-inflationary update.

That means your application can't treat CRDT reads as stable observations. It must treat every intermediate value as potentially temporary.

> For programming against CRDTs, inflationary updates provide an additional invariant: they make intermediate values reliable lower bounds. Without inflationarity, not even that can be trusted.

---

# Additional Technical Material
Just in case the above wasn't enough for you, here are a few more points that may be of interest to aficionados!

## Brief Note: Op-Based CRDTs are Deterministic

In a previous post I explained how a fully-specified Op-Based CRDT is a join semi-lattice of a particular kind: a **lexical pair lattice** $(C, P\<O>)$ composed of a **causal context lattice** $C$ and a **partial order lattice** $P$ over a domain of abstract operations $O$. The term "lexical pair" means that our merge function first takes the larger of the two $C$ fields in the inputs, along with the $P\<O>$ field from the larger of the two. In cases where the two $C$ fields are incomparable, then both fields are merged independently to form the output.

At a gloss, the update functions of an op-based CRDT do the following:

1. increment the local causal context and merge it in (an inflationary update on the first element)  
2. add an additional operation to the partial order of ops (an inflationary update on the second element)

There are some nuances around "expiring" history from the partial order of ops that I discuss in that same post; they do not change the inflationary nature of Op-Based CRDTs.

Hence Op-Based CRDTs use inflationary updates by definition, and are deterministic as a corollary. This subclass is widely studied and implemented in practice, particularly for systems that rely on causal broadcast or version vectors, but it's worth noting that not all CRDT implementations follow the op-based model.

---
## What About Monotonicity?
If you know me from the CALM Theorem, you might be suprised that I haven't used the "M" word yet: **monotonicity**. In fact, many authors in this space—myself included—have been imprecise in when we use monotonicity vs inflationarity. Let me clear this up here in this context.

We should start with crisp definitions.

### Monotonicity

$$
x \leq y \quad \Rightarrow \quad f(x) \leq f(y)
$$

Monotonicity is a **relational property**: it relates how the ordering on inputs maps to the ordering on outputs. It ensures that if one input is more informative than another, the output reflects at least as much information.

### Inflationarity

$$
x \leq f(x)
$$

Inflationarity is a **pointwise property**: it compares each input directly to its own output. It ensures that applying the function doesn't discard information from its input.

### So What?
Well first off, you should know that these two properties are orthogonal: there are functions that are neither, either, or both.

Going back to our $\text{DropTop}$ function. Recall the definition:

$$
\text{DropTop}(x) = \begin{cases}
  a & \text{if } x = \top \\
  x & \text{otherwise}
\end{cases}
$$

This is clearly non-inflationary, assuming if $a \ne \top$.

Let's consider $\text{DropTop}$ over the domain $S = \{\bot, a, \top\}$ where the join generates the total order $\bot \lt a \lt \top$. In this case, we have a non-inflationary function that *is* monotonic!  Let's work out the details:

- $\bot \leq a$ and $\text{DropTop}(\bot) = \bot \leq a = \text{DropTop}(a)$
- $a \leq \top$ and $\text{DropTop}(a) = a \leq a = \text{DropTop}(\top)$


We've seen above that \text{DropTop} leads to non-determinism over the totally ordered domain *even though* it is monotonic. 

And here's a funny thing: consider the same function over the domain $S = \{\bot, a, b, \top\}$, where the join generates a partial order like so:
```text
        ⊤
      /   \
    a      b
      \   /
        ⊥       
```
This is **non-monotonic!*.  To see it, consider that:

- $ b \leq \top$, but $\text{DropTop}(b) = b$ and $\text{DropTop}(\top) = a$, but it is *not* the case that $b \leq a$; they are incomparable!

The same scenario we used to show \text{DropTop} leads to non-determinism in the previous totally-ordered domain shows it leads to non-determinism over this partially ordered domain, where it is non-monotonic. 

So the relevant issue in this situation should now be clear: **updates need to be inflationary to achieve deterministic outcomes; monotonicity of update functions is irrelevant**.

### How Does this Relate to the CALM Theorem?
Great question! First, as a member of the University of California faculty, I'd be happy to change the name to the CALI Theorem if inflation were the key property, rather than monotonicity!

But we should stay CALM.

The "type signatures" of these two terms give us a hint as to when we use them. Inflationarity is a property that only makes sense on functions from a domain to itself (*endofunctions*, if you like fancy math terms). Monotonicity is a property that we can define without regard for the domain and range of a function.

CRDTs are scoped as abstract data types, and hence mostly just capture transformations from state to state within a single domain. Hence inflationarity is an appropriate lens for them.

The CALM Theorem reasons about entire programs, and as such it cannot be defined in terms of inflationarity alone. Usually we want to talk about inflation of inputs to the program over time, and monotonicity of the logic that the program applies to those inputs to produce outputs that may well be in another domain. This is not a new observation; this distinction was made carefully by Ameloot, Neven and van Den Bussche in their [first proof of the CALM Theorem](https://dl.acm.org/doi/10.1145/1989284.1989321).

Returning to CRDTs, it's easy to show that **semi-lattice join is monotonic** in both inputs. We can also observe that *CRDTs are both inflationary and monotonic in their final, converged outcomes*: if you run a CRDT to convergence on some set of updates $U_1$, and then run it again to convergence on a set of updates $U_2 \geq U_1$, you'll find the the outcome of the second run is no lower in the lattice than the outcome of the first run—even if your update functions are non-inflationary!

---

## Related Work
Clearly I'm not the first person to talk about the distinction between inflationary and monotonic functions in general (it's a classical distinction in logic programming), nor even in the context of distributed or parallel computing.

Here are a couple of interest prior references I've found. I'd love to know of others!

LVar inventor Lindsey Kuper has a 2015 blog post, *[What’s the difference between inflationary and monotonic functions?](https://decomposition.al/blog/2015/08/31/whats-the-difference-between-inflationary-and-monotonic-functions/)* that highlights the confusion many have regarding inflationarity and monotonicity, and gives intuitive examples to demonstrate that they are orthogonal properties.

**Almeida et al. (2023)** recently published a CRDT survey (*[Computing Surveys](https://dl.acm.org/doi/10.1145/3695249)*) that includes a more nuanced discussion of **inflationarity** and **monotonicity**, and argues that prior work erroneously demanded monotonic update functions, when it should have demanded inflationary functions. Their example (page 18) of a monotonic but non-inflationary function is *decrement*, which is a bit confusing: while decrement is monotonic in some contexts, it is both non-inflationary and non-monotonic in other contexts, like a typical counter semi-lattice. Moreover, as we discuss above, SEC does not demand inflationarity (or monotonicity) of update; inflationarity is only necessary if we want determinism.

I am not aware of prior CRDT literature that explicitly discusses the material above, and calls out inflationarity as a requirement for deterministic convergence under SEC. If you know of such work, please reach out!
