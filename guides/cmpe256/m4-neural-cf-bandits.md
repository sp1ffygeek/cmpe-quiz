## 📖 M4: Neural CF & Bandits

### Neural Collaborative Filtering (NCF)

- **Motivation**: Standard MF uses a linear dot product $$q_i^T p_u$$ — cannot capture non-linear user-item interactions.
- **Key idea**: Replace the dot product with a neural network that learns an arbitrary function of user/item embeddings.
- **Input**: User and item one-hot vectors → passed through embedding layers to get dense vectors $$p_u, q_i$$.

### NeuMF Building Blocks

| Component | Operation | What It Models |
|-----------|-----------|----------------|
| **GMF** (Generalized Matrix Factorization) | Element-wise product $$p_u \odot q_i$$ → linear output layer | Replicates standard MF; captures linear interactions |
| **MLP** (Multi-Layer Perceptron) | Concatenation $$[p_u; q_i]$$ → deep layers with ReLU | Captures non-linear interactions via learned hidden representations |
| **NeuMF** | Concatenate GMF and MLP outputs → final prediction layer | Combines linear (GMF) and non-linear (MLP) interaction modeling |

- GMF with identity activation and uniform weights = standard MF.
- NeuMF uses **separate embeddings** for GMF and MLP branches.

### Two-Tower Models

- **Tower 1 (Candidate Generation)**: Retrieves a small set of candidates from millions of items using a lightweight model (e.g., approximate nearest neighbors).
- **Tower 2 (Ranking)**: Scores and ranks the candidates using a richer, more expensive model with more features.
- **Why two towers?** Efficiency — scoring all items with a complex model is infeasible; the first tower narrows the search space.

### YouTube Case Study (Figure 2 Architecture)

- **Candidate Generation NN**: Takes user history (watch, search) → outputs top ~hundreds of candidates. Optimizes for broad relevance (softmax over video corpus).
- **Ranking NN**: Takes candidates + rich features (video age, channel, user demographics) → outputs a ranked list. Optimizes for expected watch time.
- **Key insight**: Two-stage approach balances recall (generation) with precision (ranking).

### Bandits in Recommender Systems

- **Problem**: Exploration vs. exploitation — should we recommend items we know the user likes (exploit) or try new items to learn preferences (explore)?
- **Improvement over A/B testing**: Bandits dynamically allocate traffic to better-performing options instead of fixed 50/50 splits.
- **Regret**: $$R_T = T\mu^* - \sum_{t=1}^{T} \mu_{a_t}$$ — cumulative difference between optimal and chosen actions. Goal: minimize regret.

### Bandit Strategies

| Strategy | Key Idea | Trade-off |
|----------|----------|-----------|
| **ε-greedy** | With probability $$\varepsilon$$ explore randomly, otherwise exploit best arm | Small $$\varepsilon$$ = more exploitation; simple but wastes exploration budget |
| **ε-first** | Explore for first $$\varepsilon T$$ rounds, then exploit best arm forever | Clean separation; but no adaptation after exploration phase |
| **UCB** (Upper Confidence Bound) | $$a_t = \arg\max_a \left[\hat{\mu}_a + c\sqrt{\frac{\ln t}{N_a}}\right]$$ | "Optimism in the face of uncertainty" — prefers under-explored arms |
| **Thompson Sampling** | Sample from posterior (e.g., Beta distribution), pick arm with highest sample | Naturally balances explore/exploit; Bayesian approach |

### UCB Formula Breakdown

$$a_t = \arg\max_a \left[\hat{\mu}_a + c\sqrt{\frac{\ln t}{N_a}}\right]$$

- $$\hat{\mu}_a$$: estimated mean reward of arm $$a$$. $$t$$: total rounds so far. $$N_a$$: times arm $$a$$ was pulled. $$c$$: exploration parameter.
- The bonus term $$c\sqrt{\frac{\ln t}{N_a}}$$ grows when an arm is under-explored (small $$N_a$$) and shrinks as it's pulled more.

### Thompson Sampling Details

- Maintain a Beta($$\alpha, \beta$$) distribution per arm (for Bernoulli rewards).
- **Update**: Success → $$\alpha \leftarrow \alpha + 1$$; Failure → $$\beta \leftarrow \beta + 1$$.
- Each round: sample from each arm's posterior, pick the arm with the highest sample.

### Contextual Bandits

- Extension: arm rewards depend on **context features** (user profile, time of day, device).
- **Netflix artwork personalization**: Different users see different artwork for the same title based on their viewing history.
- **DoorDash**: Contextual bandits for restaurant ranking based on user location, time, cuisine preferences.

### Key Formulas at a Glance

| Formula | Expression |
|---------|------------|
| GMF | $$\phi^{GMF} = p_u \odot q_i$$ |
| MLP input | $$\phi^{MLP} = \text{ReLU}(W^T[p_u; q_i] + b)$$ |
| NeuMF | $$\hat{y} = \sigma(h^T[\phi^{GMF}; \phi^{MLP}])$$ |
| UCB | $$a_t = \arg\max_a \left[\hat{\mu}_a + c\sqrt{\frac{\ln t}{N_a}}\right]$$ |
| Regret | $$R_T = T\mu^* - \sum_{t=1}^{T} \mu_{a_t}$$ |
