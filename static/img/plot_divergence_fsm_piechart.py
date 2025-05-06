import matplotlib.pyplot as plt
import networkx as nx
from matplotlib.patches import Wedge
import numpy as np

color_map = {'+': '#76c893', '—': '#ff6b6b', '?': '#adb5bd'}

states = {
    'S0': ['A: +', 'B: —', 'C: ?'], 'S1': ['A: +', 'B: —', 'C: +'],
    'S2': ['A: —', 'B: —', 'C: +'], 'S3': ['A: ?', 'B: —', 'C: +'],
    'S4': ['A: +', 'B: —', 'C: +'], 'S5': ['A: +', 'B: —', 'C: —'],
    'S6': ['A: +', 'B: ?', 'C: —'], 'S7': ['A: +', 'B: +', 'C: —'],
    'S8': ['A: +', 'B: —', 'C: —'],
}

edges = [
    ('S0', 'S1', 'C←A'), ('S1', 'S2', 'A←B'), ('S2', 'S3', 'xp@A'),
    ('S3', 'S4', 'A←C'), ('S4', 'S5', 'C←B'), ('S5', 'S6', 'xp@B'),
    ('S6', 'S7', 'B←A'), ('S7', 'S8', 'B←C'), ('S8', 'S0', 'xp@C'),
]

G = nx.DiGraph()
G.add_nodes_from(states.keys())

fig, ax = plt.subplots(figsize=(8, 8))  # More compact figure size

# Tighter circular layout
angle_step = -2 * np.pi / len(G.nodes)
angle_offset = np.pi / 2
radius = 1.0  # Reduced radius for tighter layout
pos_clockwise = {node: (radius * np.cos(i * angle_step + angle_offset),
                        radius * np.sin(i * angle_step + angle_offset))
                 for i, node in enumerate(G.nodes)}

node_radius = 0.25  # Smaller node radius
for node, (x, y) in pos_clockwise.items():
    for i, state in enumerate(states[node]):
        wedge = Wedge((x, y), node_radius, i * 120, (i + 1) * 120,
                      facecolor=color_map[state.split(': ')[1]], edgecolor='white')
        ax.add_patch(wedge)

        angle_mid = np.deg2rad((i + 0.5) * 120)
        text_x, text_y = x + (node_radius / 1.8) * np.cos(angle_mid), y + (node_radius / 1.8) * np.sin(angle_mid)
        ax.text(text_x, text_y, state, fontsize=7, ha='center', va='center',
                color='black' if state.split(': ')[1] != '—' else 'white')

    # Adjust label positions for S2 and S7 specifically
    if node == 'S2':
        ax.text(x + 0.1, y - node_radius - 0.1, node, fontsize=10, color='black', ha='center')
    elif node == 'S7':
        ax.text(x - 0.25, y - node_radius - 0.1, node, fontsize=10, color='black', ha='center')
    else:
        ax.text(x, y - node_radius - 0.1, node, fontsize=10, color='black', ha='center')

for source, target, label in edges:
    src_x, src_y = pos_clockwise[source]
    tgt_x, tgt_y = pos_clockwise[target]

    direction = np.array([tgt_x - src_x, tgt_y - src_y])
    unit_dir = direction / np.linalg.norm(direction)
    start, end = np.array([src_x, src_y]) + unit_dir * node_radius, np.array([tgt_x, tgt_y]) - unit_dir * node_radius

    ax.annotate('', xy=end, xytext=start, arrowprops=dict(arrowstyle='-|>', color='red', lw=1.2))

    if source == 'S2' and target == 'S3':
        perp_dir = np.array([-unit_dir[1] - 2.7, unit_dir[0]]) * 0.1
    elif source == 'S6' and target == 'S7':
        perp_dir = np.array([-unit_dir[1] + 2.7, unit_dir[0]]) * 0.1
    else:
        perp_dir = np.array([-unit_dir[1], unit_dir[0]]) * 0.1
    ax.text(*(start + end) / 2 + perp_dir, label, fontsize=8, color='red', ha='center',
            bbox=dict(facecolor='white', edgecolor='none', alpha=0.0))
ax.set_xlim(-2, 2)
ax.set_ylim(-2, 2)
ax.set_aspect('equal')
ax.axis('off')

plt.tight_layout()
plt.savefig("divergence_fsm_piechart.png", dpi=300, bbox_inches='tight')
