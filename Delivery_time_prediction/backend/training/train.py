"""Stage 5 - Training. Run from Backend/:  python -m training.train"""
import joblib
import pandas as pd
import yaml
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import (GridSearchCV, StratifiedKFold,
                                     cross_validate, train_test_split)

from Delivery_time_prediction.backend1.training.data_loader import load_data
from Delivery_time_prediction.backend1.training.evaluate import evaluate
from Delivery_time_prediction.backend1.training.features import make_model, split_xy


def cv_report(name, model, X, y, cv):
    r = cross_validate(model, X, y, cv=cv,
                       scoring={"acc": "accuracy", "f1": "f1_macro"})
    return {"Model": name,
            "CV accuracy": r["test_acc"].mean(), "CV acc std": r["test_acc"].std(),
            "CV macro F1": r["test_f1"].mean(), "CV F1 std": r["test_f1"].std()}


def main(config_path="training/configs/config.yaml"):
    with open(config_path) as f:
        cfg = yaml.safe_load(f)
    rs = cfg["random_state"]

    # Data -> labels -> split (split BEFORE imputing/scaling)
    df = load_data(cfg["data_path"])
    X, y = split_xy(df, cfg["fast_below"], cfg["late_above"])
    print("\nFeatures used:", list(X.columns))
    print(y.value_counts())
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=cfg["test_size"], stratify=y, random_state=rs)

    # Baseline + LogReg cross-validation
    cv = StratifiedKFold(n_splits=cfg["cv_folds"], shuffle=True, random_state=rs)
    candidates = {
        "Baseline (majority class)": make_model(DummyClassifier(strategy="most_frequent")),
        "LogReg (scaled)": make_model(LogisticRegression(max_iter=2000)),
        "LogReg (scaled, class_weight=bal.)": make_model(
            LogisticRegression(max_iter=2000, class_weight="balanced")),
    }
    cv_results = pd.DataFrame(
        [cv_report(n, m, X_train, y_train, cv) for n, m in candidates.items()]).round(3)
    print("\n", cv_results.to_string(index=False))

    # Tune C (macro F1)
    grid = GridSearchCV(make_model(LogisticRegression(max_iter=2000)),
                        param_grid={"clf__C": cfg["C_grid"]}, cv=cv, scoring="f1_macro")
    grid.fit(X_train, y_train)
    best_C = grid.best_params_["clf__C"]
    print("\nBest C:", best_C, "| CV macro F1:", round(grid.best_score_, 3))

    # Final model + baseline
    final_model = make_model(LogisticRegression(max_iter=2000, C=best_C)).fit(X_train, y_train)
    baseline = make_model(DummyClassifier(strategy="most_frequent")).fit(X_train, y_train)

    # Evaluation on held-out test set
    evaluate(final_model, baseline, X_test, y_test,
             figures_dir=cfg["figures_dir"], metrics_path=cfg["metrics_path"])

    joblib.dump(final_model, cfg["model_path"])
    print("Saved", cfg["model_path"])


if __name__ == "__main__":
    main()
