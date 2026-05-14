## 📖 CMPE 260 — Reinforcement Learning Study Guide

### 1. Policy Gradient Methods

$$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\!\left[\nabla_\theta \log \pi_\theta(a\mid s)\, Q^{\pi}(s,a)\right]$$

#### REINFORCE (Monte Carlo PG)

- Uses full episode return $$G_t = \sum_{k=0}^{\infty} \gamma^k r_{t+k+1}$$
- High variance, unbiased. Baseline $$b(s)$$ reduces variance: $$\nabla_\theta J = \mathbb{E}[\nabla_\theta \log \pi_\theta(a\mid s)(G_t - b(s))]$$

#### Actor-Critic

- **Actor**: policy $$\pi_\theta(a\mid s)$$ — **Critic**: value $$V_\phi(s)$$ or $$Q_\phi(s,a)$$
- Advantage: $$A(s,a) = Q(s,a) - V(s) \approx r + \gamma V(s') - V(s)$$ (TD error)
- Lower variance than REINFORCE, some bias from critic

### 2. TRPO & PPO

#### TRPO (Trust Region Policy Optimization)

- Surrogate objective: $$L(\theta) = \mathbb{E}\!\left[\frac{\pi_\theta(a\mid s)}{\pi_{\theta_{old}}(a\mid s)} \hat{A}(s,a)\right]$$
- KL constraint: $$\mathbb{E}[D_{KL}(\pi_{\theta_{old}} \| \pi_\theta)] \leq \delta$$
- Uses conjugate gradient + line search (no explicit Hessian)
- Monotonic improvement guarantee

#### PPO (Proximal Policy Optimization)

$$L^{CLIP}(\theta) = \mathbb{E}\!\left[\min\!\left(r_t(\theta)\hat{A}_t,\; \text{clip}(r_t(\theta), 1{-}\epsilon, 1{+}\epsilon)\hat{A}_t\right)\right]$$

- $$r_t(\theta) = \pi_\theta(a\mid s) / \pi_{\theta_{old}}(a\mid s)$$, typical $$\epsilon = 0.2$$
- Clips ratio to prevent large updates — simpler than TRPO
- When $$\hat{A} > 0$$: caps $$r_t$$ at $$1+\epsilon$$ (limits greediness)
- When $$\hat{A} < 0$$: caps $$r_t$$ at $$1-\epsilon$$ (limits avoidance)

#### ACKTR

- Uses K-FAC to approximate Fisher Information Matrix: $$F \approx A \otimes S$$
- Natural gradient: $$\Delta\theta = F^{-1} \nabla_\theta J$$

### 3. DDPG, TD3, SAC

#### DDPG (Deep Deterministic Policy Gradient)

- Deterministic policy $$\mu_\theta(s)$$ for continuous actions
- Soft target updates: $$\theta' \leftarrow \tau\theta + (1-\tau)\theta'$$, $$\tau \ll 1$$
- Ornstein-Uhlenbeck noise for exploration
- Off-policy with replay buffer

#### TD3 (Twin Delayed DDPG) — 3 Modifications

- **Twin critics**: $$y = r + \gamma \min(Q_1', Q_2')$$ — reduces overestimation
- **Delayed policy updates**: update actor every $$d$$ critic steps
- **Target policy smoothing**: add clipped noise to target action

#### SAC (Soft Actor-Critic)

$$J(\pi) = \sum_t \mathbb{E}\!\left[r(s_t,a_t) + \alpha\, H(\pi(\cdot\mid s_t))\right]$$

- Maximum entropy RL: policy maximizes reward + entropy
- Soft value: $$V(s) = \mathbb{E}[Q(s,a) - \alpha \log \pi(a\mid s)]$$
- Reparameterization trick: $$a = f_\theta(\epsilon; s)$$, $$\epsilon \sim \mathcal{N}(0,1)$$
- Auto-tuned temperature $$\alpha$$ via dual gradient descent
- Stochastic policy → better exploration than DDPG/TD3

### 4. A2C / A3C

- **A3C**: Asynchronous parallel actors, each with own env copy
- **A2C**: Synchronous — waits for all workers, averages gradients
- n-step returns: $$G_t^{(n)} = \sum_{k=0}^{n-1} \gamma^k r_{t+k} + \gamma^n V(s_{t+n})$$
- Loss = policy loss + value loss + entropy bonus $$\beta H(\pi)$$
- Entropy bonus prevents premature convergence
- No replay buffer needed (on-policy)

### 5. Imitation & Multi-Goal RL

#### Behavioral Cloning (BC)

- Supervised learning: $$\min_\theta \mathbb{E}_{(s,a)\sim\mathcal{D}}[-\log \pi_\theta(a\mid s)]$$
- **Distribution shift**: compounding errors at test time (covariate shift)
- DAgger: iteratively queries expert on learner's visited states

#### GAIL (Generative Adversarial Imitation Learning)

- Discriminator $$D(s,a)$$: distinguishes expert vs. policy trajectories
- Policy reward: $$r = -\log(1 - D(s,a))$$
- No explicit reward engineering needed

#### HER (Hindsight Experience Replay)

- Relabels failed trajectories with achieved goal as desired goal
- Strategies: `final`, `future`, `episode`, `random`
- Works with any off-policy algorithm (e.g., DDPG + HER)

### 6. Model-Based RL & Offline RL

#### MBRL

- Learn dynamics model $$\hat{T}(s'\mid s,a)$$, plan with MPC or Dyna
- Model exploitation risk: policy exploits model errors
- Ensemble models for uncertainty estimation

#### Offline RL

- **Extrapolation error**: Q overestimates for unseen (s,a) pairs
- **CQL**: Conservative Q-Learning — penalizes Q for OOD actions
- **BCQ**: Batch-Constrained Q — restricts actions to data support
- No environment interaction during training
