# AI-Enhanced-EHR-Imaging-Documentation-System
Assignments and projects related to AI-powered medical imaging and EHR data enhancement.
# AI Enhanced EHR Imaging & Documentation System

## Project Overview
This repository contains assignments and projects focused on applying Artificial Intelligence and Generative AI techniques to healthcare data.  
The main objectives are:  
- To preprocess and analyze healthcare datasets (structured and unstructured) for AI model readiness.  
- To enhance medical images using AI for improved diagnostic support.

---

## Assignments Overview

### Assignment 1: Healthcare Data EDA & Preprocessing
**Objective:**  
Prepare structured and unstructured healthcare datasets for AI model training and analysis.  

**Tasks Completed:**  
- Collected and cleaned datasets: `diabetic_data.csv`, `HDHI Admission data.csv`, `healthcare-dataset-stroke-data.csv`, `unstructure mtsamples.csv`  
- Performed Exploratory Data Analysis (EDA) with visualizations  
- Standardized and encoded categorical variables  
- Saved cleaned datasets and correlation/feature distribution figures  

**Dataset Links:**  
- [Diabetic Dataset](https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset)  
- [HDHI Admission Dataset](https://www.kaggle.com/datasets) *(replace with actual link)*  
- [Stroke Dataset](https://www.kaggle.com/datasets/fedesoriano/stroke-prediction-dataset)  
- [MTSamples Medical Transcripts](https://www.kaggle.com/datasets/johnsmith/mtsamples)  

**Files:**  
- `Assignment_1_Healthcare_EDA/healthcare_eda_preprocessing.py`  
- `Dataset_Info.txt` (contains dataset links and notes)

---

### Assignment 2: GenAI Medical Image Enhancement
**Objective:**  
Develop a Generative AI-powered pipeline to improve medical image quality for diagnostic support.  

**Tasks Completed:**  
- Applied denoising and sharpening using Non-Local Means (NLM), Bilateral Filter, and Unsharp Mask  
- Implemented optional Autoencoder-based reconstruction  
- Compared original vs enhanced images visually  
- Computed PSNR (Peak Signal-to-Noise Ratio) and SSIM (Structural Similarity Index) for evaluation  

**Dataset Links:**  
- [Breast Ultrasound Images (BUSI) Dataset](https://www.kaggle.com/datasets/aryashah2k/breast-ultrasound-images-dataset)  
- [Chest X-Ray Pneumonia Dataset](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)  

**Files:**  
- `Assignment_2_GenAI_Image_Enhancement/genai_image_enhancement.py`  
- `Dataset_Info.txt` (contains dataset links and notes)

---

## Repository Structure
AI Enhanced EHR Imaging & Documentation System/
│
├── Assignment_1_Healthcare_EDA/
│ ├── healthcare_eda_preprocessing.py
│ ├── Dataset_Info.txt
│
├── Assignment_2_GenAI_Image_Enhancement/
│ ├── genai_image_enhancement.py
│ ├── Dataset_Info.txt
│
├── Future_Milestones/
│ └── (reserved for upcoming projects)
│
└── README.md

yaml
Copy code

---

## How to Run the Assignments

1. **Clone the repository**  
```bash
git clone https://github.com/<your-username>/AI-Enhanced-EHR-Imaging-Documentation-System.git
cd AI-Enhanced-EHR-Imaging-Documentation-System
Install dependencies

bash
Copy code
pip install -r requirements.txt
Run Assignment 1:

bash
Copy code
python Assignment_1_Healthcare_EDA/healthcare_eda_preprocessing.py
Run Assignment 2:

bash
Copy code
python Assignment_2_GenAI_Image_Enhancement/genai_image_enhancement.py --method nlm
Tech Stack
Python 3.x

Pandas, NumPy, Matplotlib, Seaborn

PIL (Pillow), OpenCV, scikit-image

TensorFlow / PyTorch (for Autoencoder models)

Author
Vishal Kumar
B.Tech (AI & ML) | Jagannath University, Bahadurgarh

Future Milestones
This folder will contain future modules and enhancements including:

Advanced AI-based image reconstruction

Predictive analytics on EHR datasets

Integration with real-world hospital datasets



