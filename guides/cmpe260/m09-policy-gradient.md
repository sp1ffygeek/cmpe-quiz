## 📖 M09: Policy Gradient Methods

### Core Idea

Policy gradient methods **directly parameterize the policy** $$\pi_\theta(a\mid s)$$ and optimize $$J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)]$$ by gradient ascent. Unlike value-based methods (DQN), they naturally handle **continuous actions** and **stochastic policies**.

### Policy Gradient Theorem

$$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\!\left[\nabla_\theta \log \pi_\theta(a\mid s) \cdot Q^{\pi}(s,a)\right]$$

- **Log-derivative trick**: $$\nabla_\theta \pi_\theta(a\mid s) = \pi_\theta(a\mid s) \cdot \nabla_\theta \log \pi_\theta(a\mid s)$$
- The term $$\nabla_\theta \log \pi_\theta(a\mid s)$$ is the **score function** (likelihood ratio).

### REINFORCE (Monte Carlo PG)

- Replace $$Q^\pi(s,a)$$ with sampled return $$G_t = \sum_{k=0}^{T-t} \gamma^k r_{t+k}$$
- Update: $$\theta \leftarrow \theta + \alpha \gamma^t G_t \nabla_\theta \log \pi_\theta(a_t\mid s_t)$$
- **Unbiased** but **high variance**; requires complete episodes.

### Baselines for Variance Reduction

- Subtract baseline $$b(s)$$ from return: use $$G_t - b(s_t)$$
- **Does not introduce bias**: $$\mathbb{E}[\nabla_\theta \log \pi_\theta(a\mid s) \cdot b(s)] = 0$$ (because $$\sum_a \nabla_\theta \pi_\theta(a\mid s) = \nabla_\theta 1 = 0$$)
- Common baseline: $$b(s) = V^\pi(s)$$, yielding the **advantage** $$A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s)$$

### Actor-Critic (AC)

- **Actor**: policy $$\pi_\theta(a\mid s)$$ — updated via policy gradient
- **Critic**: value function $$V_w(s)$$ — updated via TD learning
- TD error as advantage estimate: $$\delta_t = r_t + \gamma V_w(s_{t+1}) - V_w(s_t) \approx A^\pi(s_t, a_t)$$
- **Lower variance** than REINFORCE (bootstrapping), but introduces **bias**.

### Policy Parameterizations

| Setting | Policy | Formula |
|---------|--------|---------|
| Discrete actions | Softmax | $$\pi_\theta(a\mid s) = \frac{e^{\phi(s,a)^\top \theta}}{\sum_{a'} e^{\phi(s,a')^\top \theta}}$$ |
| Continuous actions | Gaussian | $$\pi_\theta(a\mid s) = \mathcal{N}(\mu_\theta(s), \sigma_\theta^2(s))$$ |

### Compatible Function Approximation

If critic $$Q_w(s,a) = w^\top \nabla_\theta \log \pi_\theta(a\mid s)$$, then using $$Q_w$$ in the PG theorem introduces **no bias** (compatible features condition).

### On-Policy vs Off-Policy PG

- **On-policy** (REINFORCE, A2C): data from current $$\pi_\theta$$; discard after update.
- **Off-policy AC**: uses replay buffers + target networks; importance sampling corrections needed; more sample-efficient but harder to stabilize.

### Key Contrasts

| Property | REINFORCE | Actor-Critic |
|----------|-----------|--------------|
| Return estimate | Monte Carlo $$G_t$$ | TD: $$r + \gamma V(s')$$ |
| Bias | None | Some (bootstrapping) |
| Variance | High | Lower |
| Episode requirement | Full episodes | Step-by-step |
