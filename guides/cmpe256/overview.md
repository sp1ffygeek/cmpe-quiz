## 📖 CMPE 256 — Recommender Systems Study Guide

### 1. Similarity Measures

#### Cosine Similarity

$$\cos(\mathbf{x}, \mathbf{y}) = \frac{\mathbf{x} \cdot \mathbf{y}}{\lVert\mathbf{x}\rVert \cdot \lVert\mathbf{y}\rVert} = \frac{\sum x_i y_i}{\sqrt{\sum x_i^2}\sqrt{\sum y_i^2}}$$

#### Jaccard Similarity

$$J(A,B) = \frac{\lvert A \cap B\rvert}{\lvert A \cup B\rvert}$$

#### Pearson Correlation

$$r = \frac{\sum(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum(x_i-\bar{x})^2}\sqrt{\sum(y_i-\bar{y})^2}}$$

- Pearson handles rating scale differences (mean-centers); cosine does not
- Jaccard is for binary/set data (purchased or not)

### 2. Collaborative Filtering

#### User-Based CF (Weighted Prediction)

$$\hat{r}_{u,i} = \frac{\sum_{v \in N} sim(u,v) \cdot r_{v,i}}{\sum_{v \in N} \lvert sim(u,v)\rvert}$$

#### Mean-Centered Prediction

$$\hat{r}_{u,i} = \bar{r}_u + \frac{\sum_{v \in N} sim(u,v)(r_{v,i} - \bar{r}_v)}{\sum_{v \in N} \lvert sim(u,v)\rvert}$$

#### Item-Based CF (Adjusted Cosine)

$$sim(i,j) = \frac{\sum_{u}(r_{u,i}-\bar{r}_u)(r_{u,j}-\bar{r}_u)}{\sqrt{\sum_u(r_{u,i}-\bar{r}_u)^2}\sqrt{\sum_u(r_{u,j}-\bar{r}_u)^2}}$$

- Adjusted cosine subtracts user mean → handles different rating scales
- Item-based is more stable (items change less than users)

### 3. Matrix Factorization

$$R \approx U V^T \quad\text{where } U \in \mathbb{R}^{m \times k},\; V \in \mathbb{R}^{n \times k}$$

- Objective: $$\min_{U,V} \sum_{(u,i)\in\text{known}} (r_{ui} - \mathbf{u}_u^T \mathbf{v}_i)^2 + \lambda(\lVert U\rVert^2 + \lVert V\rVert^2)$$
- **SGD**: update one (u,i) at a time — flexible, handles missing data
- **ALS**: fix U solve V, fix V solve U — parallelizable
- With biases: $$\hat{r}_{ui} = \mu + b_u + b_i + \mathbf{u}_u^T \mathbf{v}_i$$
- SVD can't handle missing values directly; MF can

### 4. Neural Collaborative Filtering

#### GMF (Generalized Matrix Factorization)

$$\hat{y}_{ui} = \sigma(\mathbf{h}^T (\mathbf{p}_u \odot \mathbf{q}_i))$$

#### MLP Path

$$\phi(\mathbf{p}_u, \mathbf{q}_i) = \text{MLP}([\mathbf{p}_u; \mathbf{q}_i])$$

#### NeuMF (Neural Matrix Factorization)

- Combines GMF + MLP: $$\hat{y} = \sigma(\mathbf{h}^T [\phi^{GMF}; \phi^{MLP}])$$
- Pre-train GMF and MLP separately, then fine-tune jointly
- Captures both linear (GMF) and non-linear (MLP) interactions

### 5. Multi-Armed Bandits

#### $$\epsilon$$-Greedy

- Exploit best arm with prob $$1-\epsilon$$, explore random arm with prob $$\epsilon$$
- Simple but explores uniformly (wastes pulls on bad arms)

#### UCB (Upper Confidence Bound)

$$a_t = \arg\max_a \left[\hat{\mu}_a + c\sqrt{\frac{\ln t}{N_a}}\right]$$

- Balances exploitation ($$\hat{\mu}$$) and exploration (uncertainty term)

#### Thompson Sampling

- Sample from posterior: $$\theta_a \sim \text{Beta}(\alpha_a, \beta_a)$$, pick $$\arg\max \theta_a$$
- Bayesian approach — naturally balances explore/exploit

### 6. PageRank & Graph Analysis

#### PageRank

$$PR(i) = \frac{1-d}{N} + d \sum_{j \to i} \frac{PR(j)}{L(j)}$$

- $$d$$ = damping factor (typically 0.85), $$L(j)$$ = out-degree of $$j$$
- Without damping ($$d=1$$): $$PR(i) = \sum_{j \to i} \frac{PR(j)}{L(j)}$$
- Handles dangling nodes by redistributing their rank equally

#### Centrality Measures

- **Degree**: $$C_D(v) = \frac{\deg(v)}{N-1}$$ — direct connections
- **Closeness**: $$C_C(v) = \frac{N-1}{\sum_u d(v,u)}$$ — avg shortest path
- **Betweenness**: $$C_B(v) = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}}$$ — bridge importance

### 7. Evaluation Metrics

#### Classification

- $$\text{Precision} = \frac{TP}{TP+FP}$$, $$\text{Recall} = \frac{TP}{TP+FN}$$
- $$F_1 = \frac{2 \cdot P \cdot R}{P + R}$$ (harmonic mean)

#### Regression

$$\text{RMSE} = \sqrt{\frac{1}{n}\sum(r_i - \hat{r}_i)^2} \qquad \text{MAE} = \frac{1}{n}\sum\lvert r_i - \hat{r}_i\rvert$$

#### Ranking

$$\text{DCG@k} = \sum_{i=1}^{k} \frac{2^{rel_i}-1}{\log_2(i+1)} \qquad \text{NDCG@k} = \frac{DCG@k}{IDCG@k}$$

- NDCG normalizes by ideal ranking; range [0, 1]
- Sparsity = $$1 - \frac{\text{known ratings}}{\text{users} \times \text{items}}$$
