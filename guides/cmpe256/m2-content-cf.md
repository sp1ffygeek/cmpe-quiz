## 📖 M2: Content-Based & CF

### Content-Based Filtering

- **Item profile**: vector of features describing an item (genre, keywords, attributes).
- **User profile**: aggregation of item profiles the user has liked/rated highly (e.g., weighted average of item vectors).
- **Prediction**: $$\hat{r}_{ui} = \cos(\text{userProfile}_u, \text{itemProfile}_i)$$ — rank items by similarity to user profile.
- **Advantages**: No cold-start for items (if features known), no sparsity problem, explainable ("recommended because you liked X"), works for single user.
- **Limitations**: Overspecialization (filter bubble), cold-start for new users, requires feature engineering, cannot capture collaborative signals.

### Collaborative Filtering — Introduction

- **2-phase process**: (1) Predict ratings for unseen items, (2) Recommend top-k items.
- **Utility matrix**: Users × Items matrix; most entries are missing (sparse).
- **Explicit ratings**: user-provided scores (1–5 stars). **Implicit ratings**: inferred from behavior (clicks, views, purchases).
- **Key difference from content-based**: CF uses other users' behavior; content-based uses item features only.

### User-Based Collaborative Filtering

1. **Represent** users as rows in the user-item matrix.

2. **Find neighbors**: compute similarity between target user $$u$$ and all other users using cosine or Pearson.

3. **Predict** rating for item $$j$$:

- Simple average: $$\hat{r}_{uj} = \frac{1}{\lvert N_k\rvert}\sum_{v \in N_k} r_{vj}$$
- Weighted average: $$\hat{r}_{uj} = \frac{\sum_{v \in N_k(j)} sim(u,v) \cdot r_{vj}}{\sum_{v \in N_k(j)} \lvert sim(u,v)\rvert}$$
- Mean-centered: $$\hat{r}_{uj} = \mu_u + \frac{\sum_{v \in N_k(j)} sim(u,v) \cdot (r_{vj} - \mu_v)}{\sum_{v \in N_k(j)} \lvert sim(u,v)\rvert}$$

4. **Recommend**: rank predicted ratings, return top-k.

- **Problems**: Sparsity (few co-rated items), scalability ($$O(U^2)$$ similarities), cold-start (new users/items), popularity bias.

### Item-Based Collaborative Filtering

1. **Represent** items as columns in the user-item matrix.

2. **Compute item similarity** using **adjusted cosine** (mean-centered per user):

$$sim(i,j) = \frac{\sum_{u \in U_{ij}} (r_{ui} - \bar{r}_u)(r_{uj} - \bar{r}_u)}{\sqrt{\sum_{u \in U_{ij}}(r_{ui}-\bar{r}_u)^2}\sqrt{\sum_{u \in U_{ij}}(r_{uj}-\bar{r}_u)^2}}$$

3. **Why mean-centering?** Without it, a user who rates everything high inflates similarity between unrelated items.

4. **Predict**: $$\hat{r}_{ui} = \frac{\sum_{j \in N_k(i)} sim(i,j) \cdot r_{uj}}{\sum_{j \in N_k(i)} \lvert sim(i,j)\rvert}$$

5. **Differs from user-based**: Finds similar *items* (not users); item similarities are more stable over time; precomputable.

6. **Complexity**: Naïve $$O(I^2 U)$$ → with precomputation reduces to $$O(IU)$$ at prediction time.

### Cold-Start Problem

- **New user**: No ratings → can't compute similarity with others. Mitigations: ask for initial ratings, use demographics, content-based fallback.
- **New item**: No one has rated it → invisible to CF. Mitigations: content-based features, hybrid methods.

### Hybrid Methods

- **Weighted**: combine scores from content-based and CF.
- **Switching**: use content-based when CF can't (e.g., cold-start), switch to CF when enough data.
- **Feature combination**: use content features as input to CF model.
- **Cascade**: one method refines the other's output.

### Key Formulas at a Glance

| Formula | Expression |
|---------|------------|
| User-based weighted | $$\hat{r}_{uj} = \frac{\sum_{v} sim(u,v) \cdot r_{vj}}{\sum_{v} \lvert sim(u,v)\rvert}$$ |
| User-based mean-centered | $$\hat{r}_{uj} = \mu_u + \frac{\sum_{v} sim(u,v)(r_{vj} - \mu_v)}{\sum_{v} \lvert sim(u,v)\rvert}$$ |
| Adjusted cosine | $$sim(i,j) = \frac{\sum_u (r_{ui}-\bar{r}_u)(r_{uj}-\bar{r}_u)}{\sqrt{\sum_u(r_{ui}-\bar{r}_u)^2}\sqrt{\sum_u(r_{uj}-\bar{r}_u)^2}}$$ |
| Item-based prediction | $$\hat{r}_{ui} = \frac{\sum_{j \in N_k(i)} sim(i,j) \cdot r_{uj}}{\sum_{j \in N_k(i)} \lvert sim(i,j)\rvert}$$ |
| Cosine similarity | $$\cos(\mathbf{x},\mathbf{y}) = \frac{\mathbf{x} \cdot \mathbf{y}}{\lVert\mathbf{x}\rVert\lVert\mathbf{y}\rVert}$$ |
| Pearson correlation | $$r = \frac{\sum(x_i-\bar{x})(y_i-\bar{y})}{\sqrt{\sum(x_i-\bar{x})^2\sum(y_i-\bar{y})^2}}$$ |
