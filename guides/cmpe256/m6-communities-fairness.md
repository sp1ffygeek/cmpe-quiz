## 📖 M6: Communities, Embeddings & Fairness

### Community Detection

**Goal**: Identify densely connected groups (communities) within a graph where nodes within a community are more connected to each other than to nodes outside.

#### Hierarchical Methods

| Approach | Direction | Description |
|----------|-----------|-------------|
| **Top-down (Divisive)** | Start with entire graph → split | Iteratively remove edges to break graph into communities |
| **Bottom-up (Agglomerative)** | Start with individual nodes → merge | Iteratively merge nodes/communities based on similarity |

#### Girvan-Newman Algorithm (Top-Down / Divisive)

1. Compute **edge betweenness** for all edges — the number of shortest paths between all pairs of nodes that pass through that edge.

2. **Remove** the edge with the highest betweenness.

3. **Recompute** edge betweenness for remaining edges.

4. Repeat until desired community structure emerges → produces a **hierarchical decomposition** (dendrogram).

- Edge betweenness represents how much an edge acts as a "bridge" between communities.

#### Louvain Algorithm (Bottom-Up / Agglomerative)

- **Main difference from Girvan-Newman**: Bottom-up (agglomerative) instead of top-down (divisive).
- **How it works**: (1) Each node starts as its own community. (2) Greedily move nodes to neighboring communities to maximize **modularity**. (3) Collapse communities into super-nodes and repeat.
- **Advantages**: Runs in approximately **linear time** $$O(n \log n)$$; scales to very large networks; directly optimizes modularity.

### Embeddings & Recommender Systems

#### Shallow vs. Deep Embeddings

| Type | Examples | Key Idea |
|------|----------|----------|
| **Shallow** | node2vec, DeepWalk | Learn a lookup table of embeddings via random walks; no parameter sharing across nodes |
| **Deep** | GNNs (GCN, LightGCN) | Learn embeddings through message passing / neighborhood aggregation; generalize to unseen nodes |

#### LightGCN Architecture

- **Input**: Bipartite user-item interaction graph (users on one side, items on the other; edges = interactions).
- **Convolution**: 3-layer neighborhood aggregation — each layer propagates embeddings from neighbors:

$$e_u^{(k+1)} = \sum_{i \in N(u)} \frac{1}{\sqrt{\lvert N(u)\rvert}\sqrt{\lvert N(i)\rvert}} e_i^{(k)}$$

- **Final embedding**: Weighted sum across all layers (layer 0 = initial, layers 1–3 = convolved):

$$e_u = \sum_{k=0}^{K} \alpha_k \, e_u^{(k)}$$

where $$\alpha_k = \frac{1}{K+1}$$ (uniform weighting in practice).

- **Prediction**: Dot product of final user and item embeddings: $$\hat{y}_{ui} = e_u^T e_i$$.
- **Loss function**: Uses positive edges (observed interactions) and negative edges (sampled non-interactions). BPR loss:

$$L_{BPR} = -\sum_{(u,i,j)} \ln \sigma(\hat{y}_{ui} - \hat{y}_{uj})$$

- **Weakness of binary approach**: Treats all interactions equally (click = purchase = view); loses rating granularity.

### Fairness in ML (Google Developers Tutorial)

#### Types of Bias

| Bias Type | Definition | Example |
|-----------|------------|---------|
| **Reporting** | Data reflects what is reported, not reality | Only severe side effects reported in drug reviews |
| **Historical** | Data encodes past societal biases | Hiring data reflects historical discrimination |
| **Automation** | Over-trusting automated decisions | Accepting ML predictions without human review |
| **Selection** | Data doesn't represent the population | **Coverage**: missing groups; **Non-response**: certain groups don't respond; **Sampling**: biased sampling method |
| **Group attribution** | Generalizing from group to individual | **In-group**: "people like me are X"; **Out-group homogeneity**: "they are all the same" |
| **Implicit** | Unconscious assumptions affect decisions | Associating certain names with certain demographics |
| **Confirmation** | Seeking data that confirms existing beliefs | Only looking at examples that support your hypothesis |
| **Experimenter's** | Researcher's expectations influence outcomes | Designing experiments to confirm a desired result |

#### Mitigating Bias

- **Problems with log loss**: Optimizing log loss alone can lead to a model that performs well on average but poorly on minority subgroups. The loss function doesn't distinguish between errors on different demographic groups.

#### Evaluating for Bias

- **Class-imbalanced datasets**: When one class dominates (e.g., 99% negative), accuracy is misleading (a model predicting all-negative gets 99% accuracy).
- **Problems with accuracy/precision/recall**: These aggregate metrics can hide disparate performance across subgroups.
- **Confusion matrix for bias**: Compare TP/FP/TN/FN rates **across demographic groups**. If FP rate is much higher for one group, the model is biased against that group.

#### Fairness Metrics

| Metric | Definition | Pros | Cons |
|--------|------------|------|------|
| **Demographic parity** | Positive prediction rate is equal across groups: $$P(\hat{Y}=1 \mid G=a) = P(\hat{Y}=1 \mid G=b)$$ | Simple; ensures equal representation in outcomes | Ignores actual qualification differences; can reduce overall accuracy |
| **Counterfactual fairness** | Prediction doesn't change if sensitive attribute is flipped: $$\hat{Y}(x) = \hat{Y}(x')$$ where $$x'$$ differs only in protected attribute | Captures individual-level fairness; intuitive | Hard to define "counterfactual" in practice; computationally expensive |

### Key Formulas at a Glance

| Formula | Expression |
|---------|------------|
| LightGCN layer propagation | $$e_u^{(k+1)} = \sum_{i \in N(u)} \frac{e_i^{(k)}}{\sqrt{\lvert N(u)\rvert}\sqrt{\lvert N(i)\rvert}}$$ |
| LightGCN final embedding | $$e_u = \sum_{k=0}^{K} \alpha_k \, e_u^{(k)}$$ |
| LightGCN prediction | $$\hat{y}_{ui} = e_u^T e_i$$ |
| BPR loss | $$L = -\sum_{(u,i,j)} \ln \sigma(\hat{y}_{ui} - \hat{y}_{uj})$$ |
| Demographic parity | $$P(\hat{Y}=1 \mid G=a) = P(\hat{Y}=1 \mid G=b)$$ |
