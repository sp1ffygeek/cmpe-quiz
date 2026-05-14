## 📖 M1: Similarity & Evaluation

### Similarity Metrics

| Metric | Formula | Use Case |
|--------|---------|----------|
| **Cosine** | $$\cos(\mathbf{x},\mathbf{y}) = \frac{\mathbf{x} \cdot \mathbf{y}}{\lVert\mathbf{x}\rVert \lVert\mathbf{y}\rVert}$$ | Measures angle between vectors; ignores magnitude. Range [−1, 1] for real, [0, 1] for non-negative. |
| **Jaccard** | $$J(A,B) = \frac{\lvert A \cap B \rvert}{\lvert A \cup B \rvert}$$ | Set overlap; good for binary/implicit feedback. Range [0, 1]. |
| **Pearson** | $$r = \frac{\sum(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum(x_i-\bar{x})^2 \sum(y_i-\bar{y})^2}}$$ | Linear correlation; handles rating-scale bias (mean-centers automatically). Range [−1, 1]. |

### Scaling & Normalization

- **Mean centering**: $$x'_i = x_i - \bar{x}$$ — removes user/item bias; critical for adjusted cosine in item-based CF.
- **Min-max normalization**: $$x' = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$ — scales to [0, 1]; sensitive to outliers.
- **Why important?** Content-based & item-based CF compare across users with different rating scales; normalization ensures fair comparison.

### Evaluation Basics

- **Training set**: learn model parameters. **Validation set**: tune hyperparameters. **Test set**: final unbiased estimate.
- **Overfitting**: low training error, high test error (model memorizes noise). **Underfitting**: high error on both (model too simple).
- **Generalization**: ability to perform well on unseen data.

### Classification Metrics (Confusion Matrix)

|  | Predicted + | Predicted − |
|--|-------------|-------------|
| **Actual +** | TP | FN |
| **Actual −** | FP | TN |

- $$\text{Accuracy} = \frac{TP+TN}{TP+TN+FP+FN}$$ — misleading with imbalanced classes
- $$\text{Precision} = \frac{TP}{TP+FP}$$ — "of predicted positives, how many correct?"
- $$\text{Recall (Sensitivity)} = \frac{TP}{TP+FN}$$ — "of actual positives, how many found?"
- $$\text{Specificity} = \frac{TN}{TN+FP}$$ — true negative rate
- $$F_1 = \frac{2 \cdot P \cdot R}{P + R}$$ — harmonic mean; use when both P and R matter
- **ROC curve**: TPR vs FPR at varying thresholds. **AUC**: area under ROC; 1.0 = perfect, 0.5 = random.

### RecSys Evaluation Metrics

- $$RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}$$ — penalizes large errors more
- $$MAE = \frac{1}{n}\sum_{i=1}^{n}\lvert y_i - \hat{y}_i\rvert$$ — treats all errors equally
- **Problems with RMSE/MAE**: don't reflect ranking quality; a system can have low RMSE but poor top-k recommendations.
- **Top-k metrics**: Hit Rate, $$\text{Precision@k} = \frac{\lvert\text{relevant} \cap \text{top-k}\rvert}{k}$$, $$\text{Recall@k} = \frac{\lvert\text{relevant} \cap \text{top-k}\rvert}{\lvert\text{relevant}\rvert}$$
- **NDCG** (Normalized Discounted Cumulative Gain): rewards relevant items appearing higher in the ranked list.

### Evaluation Methods

| Method | Pros | Cons | When to Use |
|--------|------|------|-------------|
| **Holdout** | Simple, fast | High variance, wastes data | Large datasets |
| **Multiple random sampling** | Reduces variance | Still wastes some data | Medium datasets |
| **k-fold Cross-validation** | Uses all data, low variance | Computationally expensive | Small–medium datasets |

### RecSys Evaluation Approaches

- **Offline evaluation**: Use historical data; fast, reproducible, but can't measure novelty/serendipity.
- **User studies**: Rich qualitative feedback; expensive, small scale, potential bias.
- **A/B testing**: Real user behavior; requires live traffic, slow, ethical concerns. Bandits improve A/B by dynamically allocating traffic.
