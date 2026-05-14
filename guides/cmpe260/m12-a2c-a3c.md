## 📖 M12: A2C / A3C

### Motivation for Parallel Actors

- Standard DQN uses a **replay buffer** to decorrelate samples → requires lots of memory, off-policy only.
- Alternative: run **multiple actors in parallel** environments → naturally decorrelates data without a replay buffer.
- Enables **on-policy** methods (like actor-critic) to train stably with deep networks.
- Can run efficiently on **multi-core CPUs** — no GPU required.

### A3C — Asynchronous Advantage Actor-Critic

**Core idea:** Multiple worker threads each interact with their own environment copy and asynchronously send gradients to a shared global network.

**Architecture:**

- **Shared network**: common body (conv/FC layers) → two heads: policy $$\pi_\theta(a\mid s)$$ + value $$V_\phi(s)$$.
- Each worker has a **local copy** of the global network.

**Worker workflow (each thread):**

1. Sync local parameters from global network: $$\theta_{local} \leftarrow \theta_{global}$$

2. Collect $$n$$ steps of experience using local policy

3. Compute n-step returns and advantages

4. Compute gradients of the combined loss

5. Send gradients to global network (asynchronous update)

6. Repeat from step 1

**N-step return:**

$$G_t^{(n)} = \sum_{i=0}^{n-1} \gamma^i r_{t+i} + \gamma^n V(s_{t+n})$$

**Advantage estimate:**

$$\hat{A}_t = G_t^{(n)} - V(s_t)$$

**Total loss (three components):**

$$L = L_\pi + c_1 L_V - c_2 H(\pi)$$

| Component | Formula | Purpose |
|-----------|---------|---------|
| **Policy loss** | $$L_\pi = -\log \pi_\theta(a_t\mid s_t) \cdot \hat{A}_t$$ | Increase prob of actions with positive advantage |
| **Value loss** | $$L_V = (G_t^{(n)} - V(s_t))^2$$ | Train critic to predict returns accurately |
| **Entropy bonus** | $$H(\pi) = -\sum_a \pi(a\mid s) \log \pi(a\mid s)$$ | Encourage exploration, prevent premature convergence |

- $$c_1 \approx 0.5$$ (value loss coefficient), $$c_2 \approx 0.01$$ (entropy coefficient).

**Stale gradients problem:** By the time a worker applies its gradient, the global parameters may have already been updated by other workers → gradient is computed for outdated parameters.

### A2C — Advantage Actor-Critic (Synchronous)

- **Synchronous** version of A3C: a **coordinator** waits for ALL workers to finish before updating.
- Eliminates stale gradient problem → more stable updates.
- Workers collect experience in parallel → coordinator aggregates gradients → single global update → workers re-sync.
- In practice, A2C often matches or exceeds A3C performance due to more consistent gradients.
- More efficient GPU utilization (batched updates).

### Key Differences: A2C vs A3C

| Feature | A2C (Synchronous) | A3C (Asynchronous) |
|---------|-------------------|-------------------|
| Coordinator | Yes — waits for all workers | No — workers update independently |
| Stale gradients | No | Yes — possible |
| Update consistency | All workers use same global params | Workers may use outdated params |
| Wall-clock speed | Slightly slower per update | Faster per update |
| Gradient quality | Higher (consistent) | Lower (stale) |
| GPU utilization | Better (batched) | Worse (scattered) |

### Comparison with DQN

| Feature | A2C/A3C | DQN |
|---------|---------|-----|
| Decorrelation method | Parallel actors | Replay buffer |
| Policy type | On-policy | Off-policy |
| Memory requirement | Low (no buffer) | High (large buffer) |
| Hardware | Multi-core CPU | GPU preferred |
| Recurrent networks | Easy to combine (on-policy) | Difficult (replay breaks sequences) |

### Actor update (policy gradient with advantage):

$$\nabla_\theta J = \nabla_\theta \log \pi_\theta(a_t\mid s_t) \cdot \hat{A}(s_t, a_t)$$
