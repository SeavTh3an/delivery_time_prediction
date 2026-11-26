# Problem Definition

**Goal:** predict whether a food delivery order will arrive **Fast**, **On time** or **Late**.

| Label | Delivery_Time_min |
|---|---|
| Fast | < 40 |
| On time | 40 to 60 (inclusive) |
| Late | > 60 |

**Task type:** multiclass classification (Logistic Regression), compared with a majority-class baseline.
**Metrics:** accuracy and macro F1 (classes are moderately imbalanced).
**Leakage rule:** `Delivery_Time_min` and `Order_ID` are removed from the features.

## Limitations
- Small (1000 rows), likely synthetic dataset; will not generalise to a real platform.
- Labels depend on the chosen cutoffs; other cutoffs change the class balance and scores.
- Adjacent classes blur because labels are cut from a continuous number.
- Logistic Regression is linear; interactions (e.g. Rainy x High traffic) are not modelled.
