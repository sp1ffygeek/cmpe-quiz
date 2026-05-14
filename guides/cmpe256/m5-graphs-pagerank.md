## 📖 M5: Graphs, SNA & PageRank

### Networks as Graphs

- **Real-life networks vs. random graphs**: Real networks exhibit (1) **power-law degree distribution** (few hubs, many low-degree nodes), (2) **high clustering coefficient** (friends of friends are friends), (3) **small-world property** (short average path lengths despite large size).
- Random graphs (Erdős–Rényi) have Poisson degree distributions, low clustering, and similar short paths — they fail to model real social/web networks.

### Graph Basics (Terminology)

| Concept | Definition |
|---------|------------|
| **Neighborhood** $$N(v)$$ | Set of nodes directly connected to $$v$$ |
| **Degree** $$d(v)$$ | Number of edges incident to $$v$$; for directed graphs: **in-degree** + **out-degree** |
| **Shortest path** $$d(u,v)$$ | Minimum number of edges between $$u$$ and $$v$$ |
| **Diameter** | Maximum shortest path over all pairs: $$\text{diam}(G) = \max_{u,v} d(u,v)$$ |
| **Connected graph** | Every pair of nodes has a path between them |
| **Strongly connected** | Directed graph where every node is reachable from every other node |
| **Weakly connected** | Directed graph that is connected if edge directions are ignored |
| **Bipartite graph** | Nodes split into two disjoint sets; edges only between sets (e.g., user-item graphs) |
| **Clique** | A fully connected subgraph (every pair of nodes is connected) |
| **Tree** | Connected acyclic graph with exactly $$n-1$$ edges for $$n$$ nodes |

- **Node/Graph features as ML input**: Degree, clustering coefficient, centrality measures, PageRank scores, etc. can serve as feature vectors for downstream ML tasks.

### Social Network Analysis — Centrality Measures

- **Degree centrality**: $$C_D(i) = \frac{d(i)}{n-1}$$ — fraction of nodes that $$i$$ is connected to.
- **Closeness centrality**: $$C_C(i) = \frac{n-1}{\sum_{j=1}^{n} d(i,j)}$$ — inverse of average shortest-path distance; high = close to everyone.
- **Betweenness centrality**: $$C_B(i) = \sum_{j<k,\; j \neq i \neq k} \frac{g_{jk}(i)}{g_{jk}}$$ where $$g_{jk}$$ = total shortest paths from $$j$$ to $$k$$, $$g_{jk}(i)$$ = those passing through $$i$$.
- Normalized: $$C_B'(i) = \frac{2\, C_B(i)}{(n-1)(n-2)}$$

### Clustering Coefficient

$$e_v = \frac{\text{actual edges among neighbors of } v}{\binom{\lvert N(v)\rvert}{2}} = \frac{\text{edges among neighbors}}{\lvert N(v)\rvert(\lvert N(v)\rvert-1)/2}$$

Measures how close a node's neighbors are to forming a clique. High clustering = tightly-knit local community.

### PageRank

- **Random surfer model**: A user randomly follows links (Markov chain). At each step, with probability $$d$$ follow a link, with probability $$(1-d)$$ "teleport" to a random page.
- **Formula**: $$PR(p_i) = (1-d) \cdot \frac{1}{N} + d \sum_{p_j \in In(p_i)} \frac{PR(p_j)}{\lvert Out(p_j)\rvert}$$
- $$d$$ = damping factor (typically 0.85), $$N$$ = total pages, $$In(p_i)$$ = pages linking to $$p_i$$, $$\lvert Out(p_j)\rvert$$ = number of outgoing links from $$p_j$$.
- **Why damping?** Without it, dead ends (no outgoing links) and spider traps (cycles) cause the random walk to get stuck. Teleportation guarantees convergence.
- **Advantages**: Query-independent (precomputed), fights link spam (distributes rank, not creates it).
- **Criticism**: Query-independence means it doesn't consider relevance to a specific query; can be manipulated by link farms.

### Key Formulas at a Glance

| Formula | Expression |
|---------|------------|
| Degree centrality | $$C_D(i) = \frac{d(i)}{n-1}$$ |
| Closeness centrality | $$C_C(i) = \frac{n-1}{\sum_{j} d(i,j)}$$ |
| Betweenness centrality | $$C_B(i) = \sum_{j<k} \frac{g_{jk}(i)}{g_{jk}}$$ |
| Normalized betweenness | $$C_B'(i) = \frac{2\,C_B(i)}{(n-1)(n-2)}$$ |
| Clustering coefficient | $$e_v = \frac{\text{edges among } N(v)}{\lvert N(v)\rvert(\lvert N(v)\rvert-1)/2}$$ |
| PageRank | $$PR(p_i) = \frac{1-d}{N} + d \sum_{p_j \in In(p_i)} \frac{PR(p_j)}{\lvert Out(p_j)\rvert}$$ |
