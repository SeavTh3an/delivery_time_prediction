"""Stage 6 - Evaluation: metrics, confusion matrix, coefficients, metrics.json."""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import (ConfusionMatrixDisplay, accuracy_score,
                             classification_report, confusion_matrix, f1_score)

from Delivery_time_prediction.backend1.training.features import LABELS


def evaluate(model, baseline, X_test, y_test, figures_dir="figures",
             metrics_path="models/metrics.json"):
    os.makedirs(figures_dir, exist_ok=True)

    # 1. Baseline vs model
    rows = []
    for name, m in [("Baseline (majority class)", baseline), ("Logistic Regression", model)]:
        p = m.predict(X_test)
        rows.append({"Model": name,
                     "Test accuracy": accuracy_score(y_test, p),
                     "Test macro F1": f1_score(y_test, p, average="macro")})
    summary = pd.DataFrame(rows).round(3)
    print("\n", summary.to_string(index=False))

    # 2. Classification report + confusion matrices
    pred = model.predict(X_test)
    print("\n", classification_report(y_test, pred, labels=LABELS, digits=3))
    cm = confusion_matrix(y_test, pred, labels=LABELS)
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))
    ConfusionMatrixDisplay(cm, display_labels=LABELS).plot(ax=axes[0], cmap="Blues", colorbar=False)
    axes[0].set_title("Confusion matrix (counts)")
    ConfusionMatrixDisplay(confusion_matrix(y_test, pred, labels=LABELS, normalize="true"),
                           display_labels=LABELS).plot(ax=axes[1], cmap="Blues",
                                                       colorbar=False, values_format=".2f")
    axes[1].set_title("Confusion matrix (row-normalised = recall)")
    plt.tight_layout()
    plt.savefig(f"{figures_dir}/05_confusion_matrix.png", dpi=130)
    plt.close()

    # 3. Baseline vs model bar chart
    ax = summary.set_index("Model").plot(kind="bar", rot=0, figsize=(7, 4),
                                         color=["#7f8c8d", "#2c7fb8"])
    ax.set_ylim(0, 1)
    ax.set_title("Baseline vs Logistic Regression (test set)")
    plt.tight_layout()
    plt.savefig(f"{figures_dir}/06_baseline_vs_model.png", dpi=130)
    plt.close()

    # 4. Which classes get confused
    off = cm.copy()
    np.fill_diagonal(off, 0)
    pairs = {(LABELS[i], LABELS[j]): int(off[i, j])
             for i in range(3) for j in range(3) if i != j}
    confused = pd.Series(pairs, name="count").sort_values(ascending=False)
    print("\nMost confused (true, predicted):\n", confused.head(3).to_string())

    # 5. Coefficients for 'Late'
    names = [n.split("__")[1] for n in model.named_steps["prep"].get_feature_names_out()]
    clf = model.named_steps["clf"]
    coefs = pd.DataFrame(clf.coef_, index=clf.classes_, columns=names).T[LABELS]
    late = coefs["Late"].sort_values()
    plt.figure(figsize=(8, 6))
    plt.barh(late.index, late.values, color=["#c0392b" if v > 0 else "#4c9f70" for v in late.values])
    plt.axvline(0, color="k", lw=.8)
    plt.title("Coefficients for class 'Late' (positive = pushes toward Late)")
    plt.tight_layout()
    plt.savefig(f"{figures_dir}/07_late_coefficients.png", dpi=130)
    plt.close()
    print("\nOdds ratios (Late):\n", np.exp(coefs["Late"]).sort_values(ascending=False).round(2).to_string())

    # 6. Save metrics for version comparison
    metrics = {
        "test_accuracy": float(accuracy_score(y_test, pred)),
        "test_macro_f1": float(f1_score(y_test, pred, average="macro")),
        "baseline_accuracy": float(summary.iloc[0]["Test accuracy"]),
        "baseline_macro_f1": float(summary.iloc[0]["Test macro F1"]),
        "n_test": int(len(y_test)),
    }
    os.makedirs(os.path.dirname(metrics_path), exist_ok=True)
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print("\nSaved", metrics_path, metrics)
    return metrics
