## 📖 M10: TRPO, PPO & ACKTR

### The Step-Size Problem in Vanilla PG

Vanilla policy gradient is sensitive to learning rate: too large → policy collapse (catastrophic performance drop); too small → slow convergence. A single bad update can ruin the policy irreversibly because the data distribution shifts with the policy.

### Trust Region Policy Optimization (TRPO)

**Core idea:** Constrain each update so the new policy stays "close" to the old one in KL-divergence space.

$$\max_\theta \; L(\theta) = \mathbb{E}\!\left[\frac{\pi_\theta(a\mid s)}{\pi_{\theta_{old}}(a\mid s)} \hat{A}(s,a)\right] \quad \text{s.t.} \quad \mathbb{E}\!\left[D_{KL}(\pi_{\theta_{old}} \| \pi_\theta)\right] \leq \delta$$

- **Surrogate objective** $$L(\theta)$$: linear approximation of performance improvement.
- **KL constraint** ensures monotonic improvement (with approximation).
- Solved via **conjugate gradient** (to compute $$F^{-1}g$$) + **line search** (to satisfy constraint).
- Avoids forming/inverting the full Fisher matrix explicitly.

### Natural Gradient

$$\tilde{\nabla}_\theta J = F^{-1} \nabla_\theta J$$

- $$F = \mathbb{E}[\nabla_\theta \log \pi_\theta \cdot (\nabla_\theta \log \pi_\theta)^\top]$$ is the **Fisher Information Matrix (FIM)**.
- Natural gradient follows steepest ascent in **distribution space** (not parameter space).
- TRPO approximates the natural gradient step with a trust region constraint.
- Invariant to reparameterization of $$\theta$$.

### Proximal Policy Optimization (PPO)

**Simpler alternative to TRPO** — no conjugate gradient or line search needed.

**Clipped objective:**

$$L^{CLIP}(\theta) = \mathbb{E}\!\left[\min\!\left(r_t(\theta)\hat{A}_t, \; \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t\right)\right]$$

where $$r_t(\theta) = \frac{\pi_\theta(a_t\mid s_t)}{\pi_{\theta_{old}}(a_t\mid s_t)}$$ is the **probability ratio** and $$\epsilon \approx 0.2$$.

- When $$\hat{A}_t > 0$$: clips $$r_t$$ at $$1+\epsilon$$ (limits how much we increase probability of good actions).
- When $$\hat{A}_t < 0$$: clips $$r_t$$ at $$1-\epsilon$$ (limits how much we decrease probability of bad actions).
- **Pessimistic bound**: takes the minimum of clipped and unclipped, preventing excessively large updates.

**Adaptive KL penalty (PPO-penalty):** $$L^{KLPEN} = L(\theta) - \beta \cdot D_{KL}(\pi_{old} \| \pi_\theta)$$; $$\beta$$ is adjusted based on observed KL.

### Generalized Advantage Estimation (GAE)

$$\hat{A}_t^{GAE(\gamma,\lambda)} = \sum_{l=0}^{\infty} (\gamma\lambda)^l \delta_{t+l}$$

where $$\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$$.

- $$\lambda = 0$$: 1-step TD advantage (low variance, high bias)
- $$\lambda = 1$$: Monte Carlo advantage (high variance, low bias)
- Typical: $$\lambda \in [0.9, 0.99]$$

### ACKTR (Actor-Critic using Kronecker-Factored Trust Region)

- Uses **K-FAC** to efficiently approximate the Fisher matrix: $$F \approx A \otimes S$$ per layer.
- $$A$$: second moments of layer inputs; $$S$$: second moments of output gradients.
- Applies natural gradient to **both** actor and critic.
- Kronecker structure reduces FIM inversion from $$O(n^3)$$ to $$O(n^{3/2})$$ per layer.
- Achieves TRPO-like trust region updates at near-SGD computational cost.

### Key Comparisons

| Method | Update Rule | Constraint | Complexity |
|--------|-------------|------------|------------|
| Vanilla PG | $$\theta + \alpha \nabla J$$ | None | Low |
| TRPO | $$\theta + \alpha F^{-1}\nabla J$$ | KL ≤ δ | High (CG + line search) |
| PPO-Clip | $$\theta + \alpha \nabla L^{CLIP}$$ | Implicit (clipping) | Low |
| ACKTR | $$\theta + \alpha \hat{F}^{-1}\nabla J$$ | KL (K-FAC) | Medium |
