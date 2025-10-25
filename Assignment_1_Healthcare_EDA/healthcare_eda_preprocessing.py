# healthcare_eda_preprocessing.py

"""
Multi-dataset preprocessing, EDA, visualization, and Kaggle dataset download automation.
Datasets included:
- diabetic_data.csv
- HDHI Admission data.csv
- healthcare-dataset-stroke-data.csv
- unstructure mtsamples.csv
- Kaggle BUSI breast ultrasound images

Output:
- Cleaned CSVs
- BUSI NPZ
- Train/Val/Test splits
- Figures under outputs_healthcare/
"""

import os
import glob
import json
from collections import defaultdict
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from PIL import Image
from sklearn.model_selection import StratifiedShuffleSplit
import kaggle

sns.set(style="whitegrid", palette="muted")
pd.set_option('display.max_columns', None)

# ------------------------ Configurable paths ------------------------
DIABETIC_PATH = "diabetic_data.csv"
HDHI_PATH = "HDHI Admission data.csv"
STROKE_PATH = "healthcare-dataset-stroke-data.csv"
MTSAMPLES_PATH = "unstructure mtsamples.csv"
BUSI_ROOT = "Dataset_BUSI_with_GT"
OUT_ROOT = "outputs_healthcare"
os.makedirs(OUT_ROOT, exist_ok=True)
# --------------------------------------------------------------------

# ------------------------ Kaggle dataset downloader ------------------------
def download_kaggle_dataset(dataset, dest_path):
    os.makedirs(dest_path, exist_ok=True)
    print(f"Downloading {dataset}...")
    kaggle.api.dataset_download_files(dataset, path=dest_path, unzip=True)
    print(f"Downloaded and extracted {dataset} to {dest_path}")

# ------------------------ Utility functions ------------------------
def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def save_fig(path, tight=True):
    if tight:
        plt.tight_layout()
    plt.savefig(path, dpi=150)
    plt.close()

def plot_count_series(series, title, xlabel, outfile):
    plt.figure(figsize=(8,5))
    sns.countplot(x=series)
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel("count")
    plt.xticks(rotation=45)
    save_fig(outfile)

def plot_hist(arr, title, xlabel, outfile, bins=30, kde=False):
    plt.figure(figsize=(8,5))
    sns.histplot(arr, bins=bins, kde=kde)
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel("count")
    save_fig(outfile)

# ------------------------ Dataset processing functions ------------------------
# Add your previously provided functions here: process_diabetic(), process_hdhi(),
# process_stroke(), process_mtsamples(), process_busi(), etc.
# Include all code from the prior message for full functionality.

# ------------------------ Main ------------------------
def main():
    ensure_dir(OUT_ROOT)

    # Optional: download Kaggle datasets first (uncomment if needed)
    # download_kaggle_dataset('aryashah2k/breast-ultrasound-images-dataset', BUSI_ROOT)

    process_diabetic(DIABETIC_PATH, OUT_ROOT)
    process_hdhi(HDHI_PATH, OUT_ROOT)
    process_stroke(STROKE_PATH, OUT_ROOT)
    process_mtsamples(MTSAMPLES_PATH, OUT_ROOT)
    process_busi(BUSI_ROOT, OUT_ROOT)

    print("\nAll processing complete. Check the outputs under:", OUT_ROOT)

if __name__ == "__main__":
    main()
