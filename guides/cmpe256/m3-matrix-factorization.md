## 📖 M3: Matrix Factorization

### Basic Idea of Matrix Factorization

- **Goal**: Approximate the sparse utility matrix $$R$$ with two low-rank factor matrices: $$R \approx UV^T$$.
- Each user $$u$$ is represented by a latent factor vector $$p_u \in \mathbb{R}^f$$; each item $$i$$ by $$q_i \in \mathbb{R}^f$$.
- **Prediction**: $$\hat{r}_{ui} = q_i^T p_u$$ — dot product in a latent factor space of dimensionality $$f$$.
- Latent factors capture hidden patterns (e.g., genre preference, movie seriousness) without explicit feature engineering.

### How MF Differs from SVD

- **SVD** (Singular Value Decomposition) requires a **complete** matrix — undefined when entries are missing.
- **MF** works directly with **sparse** matrices by only optimizing over observed ratings $$(u,i) \in K$$.
- SVD: $$R = U \Sigma V^T$$ (exact decomposition). MF: $$R \approx P Q^T$$ (approximate, learned).

### Minimizing SSE (Sum of Squared Errors)

$$\min_{q,p} \sum_{(u,i) \in K} (r_{ui} - q_i^T p_u)^2$$

### Regularization

$$\min_{q,p} \sum_{(u,i) \in K} (r_{ui} - q_i^T p_u)^2 + \lambda(\lVert q_i\rVert^2 + \lVert p_u\rVert^2)$$

- $$\lambda$$ controls the trade-off: **large $$\lambda$$** → more regularization → prevents overfitting but may underfit; **small $$\lambda$$** → fits training data closely → risk of overfitting.

### Optimization Methods

| Method | Pros | Cons |
|--------|------|------|
| **SGD** (Stochastic Gradient Descent) | Easier to implement, faster convergence | Not ideal for high dimensions, sequential |
| **ALS** (Alternating Least Squares) | Good for implicit data, parallelizable (fix one matrix, solve the other) | More complex per iteration |

- **SGD update rules**: $$q_i \leftarrow q_i + \gamma(e_{ui} \cdot p_u - \lambda \cdot q_i)$$, $$p_u \leftarrow p_u + \gamma(e_{ui} \cdot q_i - \lambda \cdot p_u)$$ where $$e_{ui} = r_{ui} - q_i^T p_u$$.

### Modeling Biases

$$\hat{r}_{ui} = \mu + b_u + b_i + q_i^T p_u$$

- $$\mu$$: global average rating. $$b_u$$: user bias (tendency to rate high/low). $$b_i$$: item bias (inherently popular/unpopular).
- Example: $$\mu = 3.5$$, $$b_u = 0.3$$, $$b_i = 0.5$$, $$q_i^T p_u = 0.2$$ → $$\hat{r}_{ui} = 3.5 + 0.3 + 0.5 + 0.2 = 4.5$$.

### Predicting Ratings from Decomposed Matrices

Given $$P$$ (users × factors) and $$Q$$ (items × factors):

$$\hat{r}_{ui} = \sum_{k=1}^{f} p_{uk} \cdot q_{ik}$$

### Factorization Machines (FM)

- **Generalization of MF**: allows incorporation of arbitrary metadata (user demographics, item attributes, context).
- **Model**: $$\hat{y}(\mathbf{x}) = w_0 + \sum_{i=1}^{n} w_i x_i + \sum_{i=1}^{n}\sum_{j=i+1}^{n} \langle \mathbf{v}_i, \mathbf{v}_j \rangle x_i x_j$$
- $$w_0$$: global bias. $$w_i$$: feature weight. $$\langle \mathbf{v}_i, \mathbf{v}_j \rangle$$: pairwise interaction via latent vectors.
- **Key advantage**: Models all pairwise feature interactions even with sparse data (each feature has a latent vector, not a separate weight per pair).
- **Complexity**: Naïve $$O(kn^2)$$ → reformulated to $$O(kn)$$ (linear in features).

### Key Formulas at a Glance

| Formula | Expression |
|---------|------------|
| MF prediction | $$\hat{r}_{ui} = q_i^T p_u$$ |
| MF with biases | $$\hat{r}_{ui} = \mu + b_u + b_i + q_i^T p_u$$ |
| SSE objective | $$\min \sum_{(u,i) \in K} (r_{ui} - q_i^T p_u)^2$$ |
| Regularized objective | $$\min \sum_{(u,i) \in K} (r_{ui} - q_i^T p_u)^2 + \lambda(\lVert q_i\rVert^2 + \lVert p_u\rVert^2)$$ |
| SGD error | $$e_{ui} = r_{ui} - q_i^T p_u$$ |
| FM model | $$\hat{y}(\mathbf{x}) = w_0 + \sum w_i x_i + \sum\sum \langle \mathbf{v}_i, \mathbf{v}_j \rangle x_i x_j$$ |
