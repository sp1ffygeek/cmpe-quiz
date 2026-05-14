## 📖 M13: Behavior Cloning, HER & GAIL

### Behavior Cloning (BC)

- **Supervised learning** on expert demonstrations: learn $$\pi_\theta(a\mid s)$$ from dataset $$\{(s_i, a_i)\}$$
- **Distribution shift / compounding errors**: small per-step error $$\epsilon$$ compounds → total error $$O(\epsilon T^2)$$
- Agent visits states not in training data → errors cascade
- **DAGGER (Dataset Aggregation)**: iteratively collect data under learned policy, label with expert → reduces error to $$O(\epsilon T)$$
- **ALVINN**: early self-driving BC; used **data augmentation** (shifted/rotated camera views) to handle distribution shift
- **Causal confusion**: agent latches onto spurious correlations (e.g., brake lights → stopping) instead of true causal features
- **Multi-modality problem**: expert demos may contain multiple valid actions for same state; single Gaussian policy averages them → dangerous middle action

### Learning by Cheating

- Two-stage: (1) train **privileged agent** with full state access, (2) **distill** into sensorimotor student via imitation
- Privileged agent is easier to train (no perception challenge); student learns perception + control jointly

### GAIL (Generative Adversarial Imitation Learning)

- **Discriminator** $$D(s,a)$$: trained to distinguish expert $$(s,a)$$ pairs from agent $$(s,a)$$ pairs
- Agent reward: $$r = \log D(s,a)$$ (or $$-\log(1 - D(s,a))$$) — agent tries to fool discriminator
- No need for explicit reward engineering; learns from demonstrations only

### HER (Hindsight Experience Replay)

- Solves **sparse binary reward** problems with goal-conditioned policies
- Key idea: **goal relabeling** — failed trajectories become successes by replacing goal $$g$$ with achieved state $$g' = m(s_T)$$
- Reward: $$r_g(s,a) = -\mathbb{1}[f_g(s) \neq 0]$$ (sparse: 0 if goal reached, -1 otherwise)
- **"Future" strategy**: for each transition, sample $$k=4$$ future states from same episode as substitute goals
- Works with **any off-policy algorithm** (DQN, DDPG, TD3, SAC)
- Creates an **implicit curriculum**: easy goals (close to achieved states) learned first → harder goals later
- **UVFA (Universal Value Function Approximators)**: $$Q(s, a, g)$$ — value function conditioned on goal

### goalGAIL (Goal-Conditioned GAIL + HER)

- Discriminator conditioned on goal: $$D_\psi(a, s, g)$$
- Combines GAIL with HER's **expert relabeling** as data augmentation
- Works with **state-only demonstrations** (no action labels needed)
- Can **outperform the demonstrator** (unlike standard BC)
- **Coverage metric**: measures how well agent covers the goal space

### Key Formulas

| Concept | Formula |
|---------|---------|
| BC error bound | $$O(\epsilon T^2)$$ |
| DAGGER error bound | $$O(\epsilon T)$$ |
| HER goal relabeling | $$g' = m(s_T)$$, future strategy $$k=4$$ |
| HER reward | $$r_g(s,a) = -\mathbb{1}[f_g(s) \neq 0]$$ |
| GAIL discriminator | $$D(s,a)$$: expert vs. agent |
| GAIL agent reward | $$r = \log D(s,a)$$ |
| goalGAIL discriminator | $$D_\psi(a, s, g)$$ conditioned on goal |
| UVFA | $$Q(s, a, g)$$ |
