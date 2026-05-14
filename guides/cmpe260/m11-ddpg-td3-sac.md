## 📖 M11: DDPG, TD3 & SAC

### DQN Recap

- **Replay buffer**: stores $$(s, a, r, s')$$ transitions; mini-batch sampling breaks temporal correlation.
- **Target network**: frozen copy of Q-network updated periodically → stable Bellman targets.
- DQN limitation: discrete actions only (argmax over Q).

### Deep Deterministic Policy Gradient (DDPG)

**Idea:** Actor-critic for **continuous actions** using DQN tricks (replay buffer + target networks).

- **Actor** $$\mu_\theta(s)$$: deterministic policy mapping states → actions.
- **Critic** $$Q_\phi(s,a)$$: estimates action-value function.
- **Target**: $$y_t = r_t + \gamma Q_{\phi'}(s', \mu_{\theta'}(s'))$$
- **Soft (Polyak) update**: $$\theta' \leftarrow \tau\theta + (1-\tau)\theta'$$, with $$\tau \ll 1$$ (e.g., 0.005).
- **Exploration**: Ornstein-Uhlenbeck (OU) noise — temporally correlated, suited for physical control. Alternative: Gaussian noise.
- **Actor gradient** (deterministic policy gradient theorem): $$\nabla_\theta J \approx \frac{1}{N}\sum \nabla_a Q_\phi(s,a)\big\rvert_{a=\mu_\theta(s)} \nabla_\theta \mu_\theta(s)$$
- **Off-policy**: learns from replay buffer data collected by older policies.
- **Batch normalization** used to handle different observation scales.

### Twin Delayed DDPG (TD3)

Builds on DDPG with **three modifications** to combat overestimation bias:

| Modification | What | Why |
|-------------|------|-----|
| **Clipped Double Q** ("Twin") | Two critics; target uses $$\min(Q_1', Q_2')$$ | Reduces overestimation bias |
| **Delayed Policy Updates** ("Delayed") | Update actor every $$d$$ critic updates (typically $$d=2$$) | Let critic stabilize before policy uses it |
| **Target Policy Smoothing** | $$\tilde{a} = \mu_{\theta'}(s') + \text{clip}(\epsilon, -c, c)$$, $$\epsilon \sim \mathcal{N}(0, \sigma)$$ | Prevents exploiting Q-function peaks |

- **TD3 target**: $$y = r + \gamma \min_{i=1,2} Q_{\phi_i'}(s', \tilde{a})$$
- Overestimation source: bootstrapping with function approximation errors accumulates upward bias.

### Soft Actor-Critic (SAC)

**Framework:** Maximum entropy RL — maximize reward **and** policy entropy.

$$\pi^* = \arg\max_\pi \sum_t \mathbb{E}\!\left[r(s_t, a_t) + \alpha \mathcal{H}(\pi(\cdot\mid s_t))\right]$$

- **Stochastic policy** (unlike DDPG/TD3): outputs Gaussian $$(\mu, \sigma)$$, samples via reparameterization.
- **Reparameterization trick**: $$a = \mu_\theta(s) + \sigma_\theta(s) \cdot \epsilon$$, $$\epsilon \sim \mathcal{N}(0, I)$$ — enables backprop through sampling.
- **Soft Q-function**: $$Q(s,a) = r + \gamma \mathbb{E}_{s'}\!\left[\min_{i=1,2} Q_{\phi_i'}(s', a') - \alpha \log \pi_\theta(a'\mid s')\right]$$, $$a' \sim \pi_\theta(\cdot\mid s')$$
- **Soft V-function**: $$V(s) = \mathbb{E}_{a \sim \pi}[Q(s,a) - \alpha \log \pi(a\mid s)]$$
- **Temperature** $$\alpha$$: controls exploration-exploitation trade-off. Can be **automatically tuned** by optimizing $$\alpha$$ to maintain a target entropy $$\bar{\mathcal{H}}$$.
- Uses **two Q-networks** (like TD3) but **no separate V-network** in later versions.
- **No target policy smoothing or delayed updates** needed — entropy regularization provides sufficient smoothing.

### Key Comparisons

| Feature | DDPG | TD3 | SAC |
|---------|------|-----|-----|
| Policy type | Deterministic | Deterministic | Stochastic |
| # Critics | 1 | 2 | 2 |
| Exploration | OU / Gaussian noise | Gaussian noise | Entropy maximization |
| Anti-overestimation | None | Clipped double Q | Clipped double Q |
| Entropy bonus | No | No | Yes ($$\alpha$$) |
| Off-policy | Yes | Yes | Yes |
