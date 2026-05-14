## 📖 M15-17: MBRL & Offline RL

### Model-Based RL (MBRL)

- **Core idea**: learn a dynamics model $$p(s'\mid s,a)$$ (or $$(s', r) = f(s, a)$$) from data, then use it for planning or generating synthetic experience
- **Dyna-Q architecture**: interleave real environment steps with simulated (model-generated) steps; update Q-values from both
- **Model Predictive Control (MPC)**: plan over a finite horizon $$H$$, execute only the first action, then re-plan — robust to model errors
- **Model exploitation problem**: policy optimizer exploits inaccuracies in the learned model → agent finds "adversarial" inputs that look good under the model but fail in reality
- **Ensemble uncertainty**: train $$N$$ models; disagreement among predictions indicates epistemic uncertainty; penalize or avoid high-uncertainty regions
- **Short vs. long horizon rollouts**: short rollouts reduce compounding model error but limit planning depth; long rollouts compound errors ($$0.95^{50} \approx 7.7\%$$ accuracy remaining)
- **Shooting methods**: optimize over action sequences $$a_1, \ldots, a_H$$; forward-simulate to evaluate
- **Collocation methods**: optimize over both state and action sequences simultaneously with dynamics as constraints
- **CEM (Cross-Entropy Method)**: sample action sequences → evaluate via model → select top-$$k$$ elites → refit Gaussian → repeat

### Offline RL (Batch RL)

- **Setting**: learn from a fixed dataset $$\mathcal{D} = \{(s, a, r, s')\}$$ collected by behavior policy $$\beta$$; **no further environment interaction**
- **Why standard off-policy fails**: $$Q(s,a) \leftarrow r + \gamma \max_{a'} Q(s', a')$$ — the $$\max$$ selects OOD (out-of-distribution) actions where $$Q$$ is erroneously high → bootstrapping propagates and amplifies these errors
- **Extrapolation error**: Q-values for unseen $$(s,a)$$ pairs are unreliable; optimizing over them leads to catastrophic overestimation
- **Distribution shift**: learned policy $$\pi$$ visits $$(s,a)$$ pairs not in $$\mathcal{D}$$ → no corrective signal
- **Pessimism principle**: be conservative about unseen actions; prefer actions well-supported by data

### Key Offline RL Algorithms

- **CQL (Conservative Q-Learning)**: adds a regularizer that pushes down Q-values for OOD actions and pushes up Q-values for in-distribution actions → lower bound on true Q
- **BCQ (Batch-Constrained Q-learning)**: constrains the policy to only select actions within the support of the behavior policy $$\beta$$; uses a generative model (VAE) to model $$\beta(a\mid s)$$
- **Distribution matching**: constrain $$KL(\pi \| \beta) \leq \epsilon$$ — keep learned policy close to behavior policy
- **MOPO (Model-based Offline Policy Optimization)**: learns a dynamics model + uses model uncertainty as penalty; reward becomes $$\tilde{r}(s,a) = r(s,a) - \lambda \cdot u(s,a)$$ where $$u$$ is uncertainty
- **Behavior policy quality**: offline RL performance is bounded by the quality and coverage of $$\mathcal{D}$$; poor data → poor policy

### Key Formulas

| Concept | Formula |
|---------|---------|
| Dynamics model | $$(s', r) = f(s, a)$$ |
| Model error compounding | $$0.95^{50} \approx 0.077$$ (7.7% accuracy) |
| Dyna-Q | Real step → model step → Q-update from both |
| MPC | Plan $$H$$ steps, execute $$a_1$$, re-plan |
| CEM | Sample → evaluate → elite selection → refit |
| Bellman (offline failure) | $$Q(s,a) \leftarrow r + \gamma \max_{a'} Q(s', a')$$ fails for OOD $$a'$$ |
| CQL | Penalize $$Q$$ for OOD, push up for in-distribution |
| BCQ | $$\pi(a\mid s)$$ constrained to $$\text{supp}(\beta(a\mid s))$$ |
| Distribution matching | $$KL(\pi \| \beta) \leq \epsilon$$ |
| MOPO reward | $$\tilde{r}(s,a) = r(s,a) - \lambda \cdot u(s,a)$$ |
