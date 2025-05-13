---

layout: single
title: "Op-Based CRDTs, Clarified"
date: 2025-05-01
categories: crdts lattices algebra distributed-systems inflationary determinism convergence eventual-consistency op-based state-based
comments: true
reading_time: true
sidebar:
  nav: "main"
------------------------------------------------------

There are a pile of blog posts on the internet introducing CRDTs, and they invariably start by drawing a distinction between so-called "op-based" and "state-based" CRDTs. In this post I want to clear up the common misconception that these are fundamentally different approaches. 

> Spoiler: "op-based" CRDTs are they're just a special kind of "value-based" CRDT; i.e. they're semilattices!

It's important for developers to understand that for two reasons. First, because false distinctions can (and should!) make you nervous that you don't understand why things work. Second, if you want to design an op-based CRDT, you'll want to do it right!

### Quick Recap on CRDTs and Semilattices
Building CRDTs right was the subject of [my last post](XXX). Let's start by recapping the key definition of a well-specified CRDT. A CRDT is based on a simple algebraic structure called a *semilattice*. But let's use the language of object-oriented programming to define it this time.

A CRDT is an object class containing:

- A `state` variable of type $S$
- A method `merge(&self, s: S)` that mutates `state` to include the value of `s`
- A `≤(S, S) -> bool` ordering comparator
- Additional "update" methods that mutate the state: `update(&self)`

Some notes on the methods:

1. `merge` must be **associative**, **commutative** and **idempotent**. 
2. There is a default implementation for `≤`:  `≤(x, y) { (merge(x, y) == y) ? true : false; }. Sometimes there are more efficient implementations that avoid calling `merge`, but they have to give the same answer ... because that's the correct mathematical definition.
3.  Update methods are required to be **inflationary** with respect to `≤`: that is, `y ≤ l.update(y)`

### State-Based CRDTs
A so-called state-based CRDT is ... just a CRDT. As defined above. The adjective "state-based" is of no help whatsoever.

### Op-Based CRDTs
So what's an op-based CRDT? It's a **subclass** of the basic CRDT class above.