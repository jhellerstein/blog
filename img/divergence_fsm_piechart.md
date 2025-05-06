---
layout: single
title: "FSM Divergence Diagram"
permalink: /assets/images/divergence_fsm_piechart/
classes: wide
---

Click the image below to open it in a lightbox:

<div class="gallery">
  <img src="{{ site.baseurl }}/assets/images/divergence_fsm_piechart.png"
       data-large="{{ site.baseurl }}/assets/images/divergence_fsm_piechart.png"
       alt="FSM Divergence Diagram"
       class="gallery-item" />
</div>

<div class="notice--info">
This diagram shows the oscillation cycle of an item in an OR-set under naive local expiry. Each "pie" shows the state of the item on each of three nodes, <code>A</code>, <code>B</code> and <code>C</code>.
In each state, each of the machines either has the item only in the <code>adds</code> set (<code>+</code>), in the <code>adds</code> and <code>removes</code> sets (<code>—</code>) or in neither (<code>?</code>).
This example assumes no additional updates: all transitions are either calls to <code>merge</code> (<code>←</code>) or to <code>expireState</code> (<code>xp</code>). Moreover, every node merges 
data from every other node an arbitrary number of times, so this is demonstrates that <em>divergence can persist infinitely long, despite full communication and 
no further updates.</em>
</div>
